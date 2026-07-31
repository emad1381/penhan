const DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';
const PROXY_IP_DOMAIN_SUFFIX = 'proxyip.cmliussss.net';
const DISCOVERY_CACHE_TTL_MIN = 60;
const DISCOVERY_CACHE_TTL_MAX = 300;
const METADATA_CACHE_TTL = 86400;
const MAX_PROXY_RECORDS = 128;
const MAX_ENRICHED_RECORDS = 64;
const REQUEST_TIMEOUT_MS = 2500;

class ProxyIpError extends Error {
  constructor(code, message, status = 503) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function jsonHeaders(maxAge) {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': `public, max-age=${maxAge}`,
  };
}

function getCache() {
  return typeof caches !== 'undefined' && caches.default ? caches.default : null;
}

function cacheRequest(namespace, key) {
  return new Request(`https://proxy-ip-cache.invalid/${namespace}/${encodeURIComponent(key)}`);
}

async function getCachedJson(namespace, key) {
  const cache = getCache();
  if (!cache) return null;
  try {
    const response = await cache.match(cacheRequest(namespace, key));
    return response ? await response.json() : null;
  } catch (error) {
    return null;
  }
}

async function putCachedJson(namespace, key, value, maxAge) {
  const cache = getCache();
  if (!cache) return;
  try {
    await cache.put(cacheRequest(namespace, key), new Response(JSON.stringify(value), {
      headers: jsonHeaders(maxAge),
    }));
  } catch (error) {
    console.warn('Proxy IP cache write failed', error);
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new ProxyIpError('UPSTREAM_TIMEOUT', 'Proxy IP provider did not respond in time.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function isValidIPv4(value) {
  if (typeof value !== 'string' || !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) return false;
  return value.split('.').every((segment) => {
    const parsed = Number(segment);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 255;
  });
}

function isValidIPv6(value) {
  if (typeof value !== 'string' || value.length < 2 || value.length > 45) return false;
  if (!/^[0-9a-f:]+$/i.test(value) || value.includes(':::')) return false;

  const compressed = value.split('::');
  if (compressed.length > 2) return false;

  const groups = (part) => part ? part.split(':') : [];
  const left = groups(compressed[0]);
  const right = compressed.length === 2 ? groups(compressed[1]) : [];
  const allGroups = left.concat(right);

  if (!allGroups.every((group) => /^[0-9a-f]{1,4}$/i.test(group))) return false;
  return compressed.length === 2 ? allGroups.length < 8 : allGroups.length === 8;
}

function isValidIpAddress(value) {
  return isValidIPv4(value) || isValidIPv6(value);
}

function normalizeColo(value) {
  const colo = String(value || '').trim().toUpperCase();
  return /^[A-Z0-9]{3}$/.test(colo) ? colo : null;
}

function getIngressColo(request) {
  const colo = normalizeColo(request.cf && request.cf.colo);
  if (!colo) {
    throw new ProxyIpError('COLO_UNAVAILABLE', 'Cloudflare ingress colo is unavailable for this request.');
  }
  return colo;
}

function buildProxyHostname(colo) {
  const normalizedColo = normalizeColo(colo);
  if (!normalizedColo) {
    throw new ProxyIpError('COLO_UNAVAILABLE', 'Cloudflare ingress colo is unavailable for this request.');
  }
  return `${normalizedColo.toLowerCase()}.${PROXY_IP_DOMAIN_SUFFIX}`;
}

function clampDiscoveryTtl(records) {
  const ttls = records.map((record) => Number(record.ttl)).filter((ttl) => Number.isFinite(ttl) && ttl > 0);
  const ttl = ttls.length ? Math.min(...ttls) : DISCOVERY_CACHE_TTL_MIN;
  return Math.max(DISCOVERY_CACHE_TTL_MIN, Math.min(DISCOVERY_CACHE_TTL_MAX, ttl));
}

async function queryDoh(name, type) {
  const url = new URL(DOH_ENDPOINT);
  url.searchParams.set('name', name);
  url.searchParams.set('type', type);

  let response;
  try {
    response = await fetchWithTimeout(url.toString(), {
      headers: { Accept: 'application/dns-json' },
    });
  } catch (error) {
    if (error instanceof ProxyIpError) throw error;
    throw new ProxyIpError('DNS_LOOKUP_FAILED', 'Unable to resolve Proxy IP records.');
  }

  if (!response.ok) {
    throw new ProxyIpError('DNS_LOOKUP_FAILED', 'Unable to resolve Proxy IP records.');
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ProxyIpError('DNS_LOOKUP_FAILED', 'Unable to resolve Proxy IP records.');
  }
}

async function resolveDnsFamily(hostname, queryType, answerType, family) {
  const result = await queryDoh(hostname, queryType);
  if (result.Status !== 0) {
    return {
      records: [],
      warning: `${family} DNS lookup returned status ${result.Status}.`,
    };
  }

  const records = [];
  for (const answer of Array.isArray(result.Answer) ? result.Answer : []) {
    if (answer.type !== answerType || !isValidIpAddress(answer.data)) continue;
    records.push({
      address: answer.data,
      family,
      ttl: Math.max(0, Number(answer.TTL) || 0),
    });
  }
  return { records, warning: null };
}

function deduplicateRecords(records) {
  const seen = new Set();
  return records.filter((record) => {
    const key = record.address.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function expandIPv6(address) {
  const parts = address.split('::');
  const left = parts[0] ? parts[0].split(':') : [];
  const right = parts[1] ? parts[1].split(':') : [];
  const missing = 8 - left.length - right.length;
  const groups = left.concat(Array(Math.max(0, missing)).fill('0'), right);
  return groups.map((group) => group.padStart(4, '0')).join('');
}

function teamCymruOrigin(address) {
  if (isValidIPv4(address)) {
    return `${address.split('.').reverse().join('.')}.origin.asn.cymru.com`;
  }
  const expanded = expandIPv6(address);
  return `${expanded.split('').reverse().join('.')}.origin6.asn.cymru.com`;
}

function cleanTxtValue(value) {
  return String(value || '').trim().replace(/^"|"$/g, '').replace(/\\"/g, '"');
}

async function queryTxt(name) {
  const result = await queryDoh(name, 'TXT');
  if (result.Status !== 0) return [];
  return (Array.isArray(result.Answer) ? result.Answer : [])
    .filter((answer) => answer.type === 16 && typeof answer.data === 'string')
    .map((answer) => cleanTxtValue(answer.data))
    .filter(Boolean);
}

function countryNameFa(code) {
  if (!code || !/^[A-Z]{2}$/.test(code)) return 'نامشخص';
  try {
    return new Intl.DisplayNames(['fa'], { type: 'region' }).of(code) || code;
  } catch (error) {
    return code;
  }
}

async function getIpMetadata(address) {
  const cacheKey = address.toLowerCase();
  const cached = await getCachedJson('metadata-v3', cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(`https://ipwho.is/${encodeURIComponent(address)}`, {}, 3000);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const countryCode = (data.country_code || '').toUpperCase();
        const asnNum = data.connection && data.connection.asn ? data.connection.asn : '';
        const metadata = {
          metadataStatus: 'ok',
          isp: {
            asn: asnNum ? `AS${asnNum}` : '--',
            name: (data.connection && (data.connection.isp || data.connection.org)) || 'نام شبکه در دسترس نیست',
          },
          country: {
            code: /^[A-Z]{2}$/.test(countryCode) ? countryCode : '--',
            name: countryNameFa(countryCode),
            city: data.city || '',
          },
        };
        await putCachedJson('metadata-v3', cacheKey, metadata, METADATA_CACHE_TTL);
        return metadata;
      }
    }
  } catch (e) {
    // Retry with secondary GeoIP provider if needed
  }

  // Fallback to Team Cymru ASN only for ISP & ASN name, NOT for country code
  try {
    const originAnswers = await queryTxt(teamCymruOrigin(address));
    const originFields = (originAnswers[0] || '').split('|').map((value) => value.trim());
    const asnNumber = originFields[0];
    if (!/^\d+$/.test(asnNumber)) throw new Error('Invalid ASN answer');

    const asnAnswers = await queryTxt(`AS${asnNumber}.asn.cymru.com`);
    const asnFields = (asnAnswers[0] || '').split('|').map((value) => value.trim());

    const metadata = {
      metadataStatus: 'ok',
      isp: {
        asn: `AS${asnNumber}`,
        name: asnFields[4] || 'نام شبکه در دسترس نیست',
      },
      country: {
        code: '--',
        name: 'نامشخص',
        city: '',
      },
    };
    await putCachedJson('metadata-v3', cacheKey, metadata, METADATA_CACHE_TTL);
    return metadata;
  } catch (error) {
    return {
      metadataStatus: 'unavailable',
      isp: { asn: '--', name: 'اطلاعات شبکه در دسترس نیست' },
      country: { code: '--', name: 'نامشخص', city: '' },
    };
  }
}

async function enrichRecords(records) {
  const queue = [...records];
  const workerCount = Math.min(10, queue.length);
  const enrichedMap = new Map();

  async function worker() {
    while (queue.length) {
      const record = queue.shift();
      const metadata = await getIpMetadata(record.address);
      enrichedMap.set(record.address, { ...record, ...metadata });
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker));
  return records.map((record) => enrichedMap.get(record.address) || record);
}

async function resolveProxyRecords(request, { refresh = false, enrich = true } = {}) {
  const colo = getIngressColo(request);
  const hostname = buildProxyHostname(colo);
  const cacheKey = colo.toLowerCase();

  if (!refresh) {
    const cached = await getCachedJson('discovery-v1', cacheKey);
    if (cached) return cached;
  }

  const [ipv4Result, ipv6Result] = await Promise.allSettled([
    resolveDnsFamily(hostname, 'A', 1, 'IPv4'),
    resolveDnsFamily(hostname, 'AAAA', 28, 'IPv6'),
  ]);

  if (ipv4Result.status === 'rejected' && ipv6Result.status === 'rejected') {
    throw new ProxyIpError('DNS_LOOKUP_FAILED', 'Unable to resolve Proxy IP records.');
  }

  const warnings = [];
  const records = [];
  for (const [family, result] of [['IPv4', ipv4Result], ['IPv6', ipv6Result]]) {
    if (result.status === 'fulfilled') {
      records.push(...result.value.records);
      if (result.value.warning) warnings.push(result.value.warning);
    } else {
      warnings.push(`${family} records could not be retrieved.`);
    }
  }

  let uniqueRecords = deduplicateRecords(records);
  if (uniqueRecords.length > MAX_PROXY_RECORDS) {
    uniqueRecords = uniqueRecords.slice(0, MAX_PROXY_RECORDS);
    warnings.push(`نمایش رکوردها به ${MAX_PROXY_RECORDS} عدد محدود شد.`);
  }

  const recordsToEnrich = uniqueRecords.slice(0, MAX_ENRICHED_RECORDS);
  const response = {
    colo,
    records: enrich ? await enrichRecords(recordsToEnrich) : uniqueRecords,
    partial: warnings.length > 0,
    warnings,
  };

  if (!response.partial) {
    await putCachedJson('discovery-v1', cacheKey, response, clampDiscoveryTtl(uniqueRecords));
  }

  return response;
}

export {
  ProxyIpError,
  buildProxyHostname,
  getIngressColo,
  isValidIpAddress,
  normalizeColo,
  resolveProxyRecords,
};

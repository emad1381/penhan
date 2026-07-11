import { 
  isValidUUID, isAuthed, isApiAuthed, hashPassword, setupD1Schema, 
  updateUsageD1, sha224_and_224, getSettingD1, setSettingD1,
  parseProxyIps, pickRandomProxyIp,
  checkMasterAuth, trackConnectionStart, trackConnectionEnd, getActiveConnectionCount,
  checkProxyIP, fetchColoProxyIPs
} from './helpers.js';

import { vlessOverWSHandler } from './vless.js';
import { trojanOverWSHandler } from './trojan.js';
import { nginxPage, loginPage, subscriptionPage, panelPage, setupPage } from './templates.js';

const rateLimitMap = new Map();

let usersCache = null;
let usersCacheTime = 0;

async function getAllUsers(env) {
  if (usersCache && Date.now() - usersCacheTime < 10000) return usersCache;
  if (!env.DB) return [];
  try {
    const { results } = await env.DB.prepare('SELECT * FROM users').all();
    usersCache = results;
    usersCacheTime = Date.now();
    return results;
  } catch (e) { return []; }
}

async function getAllTokens(env) {
  if (!env.DB) return [];
  try {
    const { results } = await env.DB.prepare('SELECT * FROM api_keys').all();
    return results;
  } catch(e) { return []; }
}

// ============ Proxy IP Pool (fallback engine) ============
// Cached list of usable proxy IPs from the managed pool. Prefers 'active'
// entries; falls back to any known entry if none have been tested yet.
let proxyPoolCache = null;
let proxyPoolCacheTime = 0;

async function getProxyPoolString(env) {
  if (!env.DB) return '';
  if (proxyPoolCache !== null && Date.now() - proxyPoolCacheTime < 30000) return proxyPoolCache;
  try {
    let { results } = await env.DB.prepare(
      "SELECT ip, port FROM proxyip WHERE status = 'active' ORDER BY ping ASC LIMIT 50"
    ).all();
    if (!results || results.length === 0) {
      ({ results } = await env.DB.prepare(
        "SELECT ip, port FROM proxyip ORDER BY last_check DESC LIMIT 50"
      ).all());
    }
    const str = (results || [])
      .map(r => (r.port && r.port !== 443) ? `${r.ip}:${r.port}` : `${r.ip}`)
      .join('\n');
    proxyPoolCache = str;
    proxyPoolCacheTime = Date.now();
    return str;
  } catch (e) { return proxyPoolCache || ''; }
}


export default {
  async fetch(request, env, ctx) {
    try {
      await setupD1Schema(env);

      let currentProxyIPRaw = (await getSettingD1(env, 'proxy_ip')) || env.PROXYIP || '';
      let currentPanelPass = (await getSettingD1(env, 'panel_pass')) || env.PANEL_PASSWORD || env.PASSWORD || '';
      let currentAdminUUID = (await getSettingD1(env, 'uuid')) || env.UUID || ''; 
      let cfAccountId = await getSettingD1(env, 'cf_account_id') || '';
      let cfApiToken = await getSettingD1(env, 'cf_api_token') || '';
      
      const upgradeHeader = request.headers.get('Upgrade');
      const url = new URL(request.url);
      const path = url.pathname;

      const authenticate = async (identifier) => {
        const users = await getAllUsers(env);
        for (const user of users) {
           if (user.id === identifier || sha224_and_224(user.id, true) === identifier) {
             return user;
           }
        }
        return null;
      };

      let pendingUsageBytes = 0;
      let lastUsageUpdate = Date.now();
      
      const onUsage = (userID, upload, download) => {
        if (!env.DB) return true;
        let user = usersCache?.find(u => u.id === userID);
        if (!user) return true;
        const total = upload + download;
        user.used_bytes += total;
        pendingUsageBytes += total;
        
        const now = Date.now();
        if (pendingUsageBytes >= 512 * 1024 || (now - lastUsageUpdate > 5000 && pendingUsageBytes > 0)) {
          const bytesToUpdate = pendingUsageBytes;
          pendingUsageBytes = 0;
          lastUsageUpdate = now;
          ctx.waitUntil(updateUsageD1(env, userID, bytesToUpdate).catch(console.error));
        }
        
        if (user.limit_bytes > 0 && user.used_bytes >= user.limit_bytes) return false;
        if (user.expiry_date > 0 && now > user.expiry_date) return false;
        return true;
      };

      if (upgradeHeader === 'websocket') {
        const decodedPath = decodeURIComponent(path).toLowerCase();
        // Fallback engine: user proxy_ip → global default → managed active pool
        const pool = await getProxyPoolString(env);
        const effectiveProxyIP = [currentProxyIPRaw, pool].filter(Boolean).join('\n');
        if (decodedPath.includes('trojan-ws') || decodedPath.includes('trojan')) {
          return await trojanOverWSHandler(request, authenticate, effectiveProxyIP, onUsage);
        } else {
          return await vlessOverWSHandler(request, authenticate, effectiveProxyIP, onUsage);
        }
      }


      const isSetupComplete = !!currentPanelPass && !!currentAdminUUID && !!env.DB;

      if (!isSetupComplete) {
        if (path === '/panel' || path === '/') {
           return new Response(setupPage(!!env.DB, !!currentPanelPass, !!currentAdminUUID, currentAdminUUID, currentProxyIPRaw), {
             status: 200,
             headers: { 'Content-Type': 'text/html; charset=utf-8' },
           });
        }
      }

      if (path === '/') {
        return new Response(nginxPage(), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'nginx/1.24.0' } });
      }

      if (path === '/panel') {
        const host = request.headers.get('Host');
        if (currentPanelPass && !(await isAuthed(request, currentPanelPass))) {
          return new Response(loginPage('/panel', host), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        return new Response(panelPage(host, currentAdminUUID, currentProxyIPRaw, cfAccountId, cfApiToken), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }

      // panel-auth
      if (path === '/panel/panel-auth' && request.method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const now = Date.now();
        const rl = rateLimitMap.get(ip) || { count: 0, time: now };
        if (now - rl.time > 60000) { rl.count = 0; rl.time = now; }
        rl.count++;
        rateLimitMap.set(ip, rl);
        if (rl.count > 10) return new Response(JSON.stringify({ ok: false, error: 'Too Many Requests' }), { status: 429 });

        const body = (await request.text()).trim();
        if (body === currentPanelPass) {
          const hashedToken = await hashPassword(currentPanelPass);
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': 'panel_auth=' + hashedToken + '; Path=/; Max-Age=86400; SameSite=Lax; Secure',
            },
          });
        }
        return new Response(JSON.stringify({ ok: false }), { status: 200 });
      }

      // ============ Universal Auth Middleware ============
      // All /api/* routes check ALL auth methods:
      // 1. Cookie (panel password)
      // 2. Bearer token (any api_key)
      // 3. URL ?token= parameter
      const checkApiAuth = async (req) => {
        return await checkMasterAuth(req, env, currentPanelPass);
      };

      if (path.startsWith('/api/')) {
        if (!(await checkApiAuth(request))) {
           return new Response(JSON.stringify({ok: false, error: 'Unauthorized'}), {status: 401, headers: {'Content-Type': 'application/json'}});
        }
        
        if (path === '/api/users') {
           if (request.method === 'GET') {
             const users = await getAllUsers(env);
             // Add live connection count for each user
             const usersWithConns = users.map(u => ({
               ...u,
               active_connections: getActiveConnectionCount(u.id)
             }));
             return new Response(JSON.stringify({ok: true, users: usersWithConns}), {status: 200, headers: {'Content-Type': 'application/json'}});
           }
           if (request.method === 'POST') {
             const b = await request.json();
             
             // Support: proxy_ip can now be multi-line (for multi-proxyIP)
             const proxyIpVal = b.proxy_ip !== undefined ? b.proxy_ip.trim() : '';
             
             await env.DB.prepare(`
                INSERT INTO users (id, name, clean_ip, proxy_ip, limit_bytes, expiry_date, enabled, conn_limit)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  clean_ip = excluded.clean_ip,
                  proxy_ip = excluded.proxy_ip,
                  limit_bytes = excluded.limit_bytes,
                  expiry_date = excluded.expiry_date,
                  enabled = excluded.enabled,
                  conn_limit = excluded.conn_limit
              `).bind(
                b.id, b.name, 
                b.clean_ip || '', 
                proxyIpVal,
                b.limit_bytes || 0, 
                b.expiry_date || 0, 
                b.enabled === false ? 0 : 1,
                b.conn_limit || 0
              ).run();
             usersCache = null;
             return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
           }
        }
        if (path.startsWith('/api/users/') && request.method === 'DELETE') {
           const id = path.split('/').pop();
           await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
           usersCache = null;
           return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
        }
        if (path.startsWith('/api/users/') && path.endsWith('/toggle') && request.method === 'POST') {
           const id = path.split('/')[3];
           await env.DB.prepare('UPDATE users SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = ?').bind(id).run();
           usersCache = null;
           return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
        }

        if (path === '/api/tokens') {
           if (request.method === 'GET') {
             const tokens = await getAllTokens(env);
             return new Response(JSON.stringify({ok: true, tokens}), {status: 200, headers: {'Content-Type': 'application/json'}});
           }
           if (request.method === 'POST') {
             const b = await request.json();
             await env.DB.prepare('INSERT INTO api_keys (key, name, scopes, created_at) VALUES (?, ?, ?, ?)')
               .bind(b.key, b.name, b.scopes || 'api', Date.now()).run();
             return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
           }
        }
        if (path.startsWith('/api/tokens/') && request.method === 'DELETE') {
           const key = path.split('/').pop();
           await env.DB.prepare('DELETE FROM api_keys WHERE key = ?').bind(key).run();
           return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
        }

        // Global settings
        if (path === '/api/settings' && request.method === 'POST') {
          const b = await request.json();
          if (b.proxyIP !== undefined) await setSettingD1(env, 'proxy_ip', b.proxyIP.trim());
          if (b.password !== undefined) await setSettingD1(env, 'panel_pass', b.password.trim());
          if (b.uuid !== undefined && isValidUUID(b.uuid.trim())) await setSettingD1(env, 'uuid', b.uuid.trim());
          if (b.cfAccountId !== undefined) await setSettingD1(env, 'cf_account_id', b.cfAccountId.trim());
          if (b.cfApiToken !== undefined) await setSettingD1(env, 'cf_api_token', b.cfApiToken.trim());
          return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
        }

        // Cloudflare metrics
        if (path === '/api/cf-metrics' && request.method === 'GET') {
          const accountId = await getSettingD1(env, 'cf_account_id');
          const apiToken = await getSettingD1(env, 'cf_api_token');
          if (!accountId || !apiToken) {
             return new Response(JSON.stringify({ok: false, error: 'Not Configured'}), {status: 200, headers: {'Content-Type': 'application/json'}});
          }
          
          const now = new Date();
          const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)).toISOString();
          const end = now.toISOString();
          
          const query = `
            query {
              viewer {
                accounts(filter: { accountTag: "${accountId}" }) {
                  workersInvocationsAdaptive(
                    limit: 1,
                    filter: {
                      datetime_geq: "${start}",
                      datetime_leq: "${end}"
                    }
                  ) {
                    sum {
                      requests
                    }
                  }
                }
              }
            }
          `;
          
          try {
            const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query })
            });
            const cfData = await cfRes.json();
            
            if (cfData.errors && cfData.errors.length > 0) {
              return new Response(JSON.stringify({ok: false, error: cfData.errors[0].message}), {status: 200, headers: {'Content-Type': 'application/json'}});
            }
            
            const accounts = cfData?.data?.viewer?.accounts;
            let requestsUsed = 0;
            if (accounts && accounts.length > 0 && accounts[0].workersInvocationsAdaptive && accounts[0].workersInvocationsAdaptive.length > 0) {
              requestsUsed = accounts[0].workersInvocationsAdaptive[0].sum.requests || 0;
            }
            
            return new Response(JSON.stringify({ok: true, requestsUsed, limit: 100000}), {status: 200, headers: {'Content-Type': 'application/json'}});
          } catch(e) {
            return new Response(JSON.stringify({ok: false, error: e.message}), {status: 200, headers: {'Content-Type': 'application/json'}});
          }
        }
        
              // ============ Proxy IP API ============
              // Invalidate the fallback pool cache on any mutating proxyip call
              if (path.startsWith('/api/proxyip') && request.method !== 'GET') {
                proxyPoolCache = null;
              }

              if (path === '/api/proxyip' && request.method === 'GET') {


                if (!env.DB) return new Response(JSON.stringify({ok: false, error: 'DB not available'}), {status: 500, headers: {'Content-Type': 'application/json'}});
                const { results } = await env.DB.prepare('SELECT * FROM proxyip ORDER BY status DESC, ping ASC').all();
                return new Response(JSON.stringify({ok: true, proxyip: results}), {status: 200, headers: {'Content-Type': 'application/json'}});
              }

              if (path === '/api/proxyip' && request.method === 'POST') {
                if (!env.DB) return new Response(JSON.stringify({ok: false, error: 'DB not available'}), {status: 500, headers: {'Content-Type': 'application/json'}});
                const b = await request.json();
                const { ip, port, country, city, isp } = b;
                if (!ip) return new Response(JSON.stringify({ok: false, error: 'IP is required'}), {status: 400, headers: {'Content-Type': 'application/json'}});
                const p = parseInt(b.port) || 443;
                let geoCountry = (b.country || '').trim();
                let geoCity = (b.city || '').trim();
                let geoIsp = (b.isp || '').trim();
                // Auto-detect when country left blank and IP is a real IPv4
                if (!geoCountry && /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
                  const g = await detectCountry(ip);
                  if (g) { geoCountry = g.country; geoCity = geoCity || g.city; geoIsp = geoIsp || g.isp; }
                }
                try {
                  await env.DB.prepare(`INSERT INTO proxyip (ip, port, country, city, isp, status, last_check) VALUES (?, ?, ?, ?, ?, 'unknown', ?)
                    ON CONFLICT(ip, port) DO UPDATE SET country=excluded.country, city=excluded.city, isp=excluded.isp`).bind(ip, p, geoCountry, geoCity, geoIsp, Date.now()).run();
                  return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
                } catch(e) {
                  return new Response(JSON.stringify({ok: false, error: e.message}), {status: 500, headers: {'Content-Type': 'application/json'}});
                }
              }

              if (path === '/api/proxyip' && request.method === 'DELETE') {
                if (!env.DB) return new Response(JSON.stringify({ok: false, error: 'DB not available'}), {status: 500, headers: {'Content-Type': 'application/json'}});
                const b = await request.json();
                const { ip, port } = b;
                if (!ip) return new Response(JSON.stringify({ok: false, error: 'IP is required'}), {status: 400, headers: {'Content-Type': 'application/json'}});
                const p = parseInt(port) || 443;
                try {
                  await env.DB.prepare('DELETE FROM proxyip WHERE ip = ? AND port = ?').bind(ip, p).run();
                  return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
                } catch(e) {
                  return new Response(JSON.stringify({ok: false, error: e.message}), {status: 500, headers: {'Content-Type': 'application/json'}});
                }
              }

              if (path === '/api/proxyip/bulk-update' && request.method === 'POST') {
                if (!env.DB) return new Response(JSON.stringify({ok: false, error: 'DB not available'}), {status: 500, headers: {'Content-Type': 'application/json'}});
                const b = await request.json();
                const { results } = b; // Array of { ip, port, ping, status }
                if (!Array.isArray(results) || results.length === 0) {
                  return new Response(JSON.stringify({ok: false, error: 'Invalid data format'}), {status: 400, headers: {'Content-Type': 'application/json'}});
                }

                const statements = results.map(r => {
                  return env.DB.prepare(`UPDATE proxyip SET status = ?, ping = ?, last_check = ? WHERE ip = ? AND port = ?`)
                    .bind(r.status, r.ping, Date.now(), r.ip, r.port);
                });

                try {
                  await env.DB.batch(statements);
                  proxyPoolCache = null;
                  return new Response(JSON.stringify({ok: true, updated: results.length}), {status: 200, headers: {'Content-Type': 'application/json'}});
                } catch (e) {
                  return new Response(JSON.stringify({ok: false, error: e.message}), {status: 500, headers: {'Content-Type': 'application/json'}});
                }
              }


              async function detectCountry(ip) {
                                            // Use ip-api.com (free, 45 req/min, no API key needed)
                                            // Returns: { countryCode, country, regionName, city, isp, org, as, query }
                                            try {
                                              const controller = new AbortController();
                                              const timeout = setTimeout(() => controller.abort(), 3000);
                                              const resp = await fetch('http://ip-api.com/json/' + ip + '?fields=countryCode,country,regionName,city,isp,org,as', {
                                                signal: controller.signal,
                                                cf: { resolveTimeout: 2000 }
                                              });
                                              clearTimeout(timeout);
                                              if (!resp.ok) return null;
                                              const data = await resp.json();
                                              if (data.countryCode) {
                                                return {
                                                  country: data.countryCode,      // ISO code: IR, US, DE, etc.
                                                  countryName: data.country,      // Full name
                                                  city: data.city || '',
                                                  isp: data.isp || data.org || data.as || ''
                                                };
                                              }
                                            } catch(e) { console.error('GeoIP error for', ip, e.message); }
                                            return null;
                                          }

              // Batch GeoIP via ip-api.com /batch (up to 100 IPs per request, 15 req/min).
              // Dramatically faster than per-IP lookups. Returns Map<ip, {country, city, isp}>.
              async function batchDetectCountries(ips) {
                const out = new Map();
                if (!ips.length) return out;
                for (let i = 0; i < ips.length; i += 100) {
                  const chunk = ips.slice(i, i + 100);
                  try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 8000);
                    const resp = await fetch('http://ip-api.com/batch?fields=status,countryCode,country,city,isp,org,as,query', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(chunk),
                      signal: controller.signal,
                    });
                    clearTimeout(timeout);
                    if (!resp.ok) continue;
                    const arr = await resp.json();
                    if (Array.isArray(arr)) {
                      for (const d of arr) {
                        if (d && d.status === 'success' && d.countryCode) {
                          out.set(d.query, {
                            country: d.countryCode,
                            city: d.city || '',
                            isp: d.isp || d.org || d.as || '',
                          });
                        }
                      }
                    }
                  } catch(e) { console.error('Batch GeoIP error:', e.message); }
                  // 15 batch req/min → ~4s between chunks (only when >100 IPs)
                  if (i + 100 < ips.length) await new Promise(r => setTimeout(r, 4200));
                }
                return out;
              }

                            if (path === '/api/proxyip/fetch' && request.method === 'POST') {
                              // Fetch from public sources (CMliu/GitHub) AND auto-resolve the
                              // ProxyIP hosts behind THIS worker's edge datacenter (colo) via DoH.
                              // No manual domain needed — colo is detected from request.cf.colo.
                              try {
                                const colo = (request.cf && request.cf.colo) ? String(request.cf.colo) : '';

                                // Static text lists of proxy IPs
                                const sources = [
                                  'https://raw.githubusercontent.com/cmliu/edgetunnel/main/proxyip.txt',
                                  'https://raw.githubusercontent.com/cmliu/edgetunnel/main/CF-CIDR.txt',
                                ];
                                // Domains that serve colo-specific ProxyIPs as A records:
                                // `{colo}.{domain}` resolves to IPs local to that datacenter.
                                const coloDomains = [
                                  'proxyip.cmliu.com',
                                  'proxyip.fxxk.dedyn.io',
                                ];

                                let allIPs = [];
                                for (const source of sources) {
                                  try {
                                    const resp = await fetch(source);
                                    if (resp.ok) {
                                      const text = await resp.text();
                                      const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
                                      allIPs.push(...lines);
                                    }
                                  } catch(e) { console.error('Failed to fetch from', source, e); }
                                }

                                // colo-based resolve: pull IPs local to this worker's datacenter
                                let coloCount = 0;
                                for (const d of coloDomains) {
                                  try {
                                    const coloIPs = await fetchColoProxyIPs(d, colo);
                                    for (const cip of coloIPs) { allIPs.push(cip); coloCount++; }
                                  } catch(e) { console.error('colo resolve failed for', d, e); }
                                }

                                // Parse IPs
                                const validIPs = [];
                                for (const line of allIPs) {
                                  const match = line.match(/^([\d\.]+)(?::(\d+))?(?:\s*#\s*(.+))?$/);
                                  if (match) {
                                    validIPs.push({
                                      ip: match[1],
                                      port: parseInt(match[2]) || 443,
                                      remark: match[3] || ''
                                    });
                                  }
                                }

                                // Cap to keep within Worker limits; the rest can be fetched again.
                                const MAX_FETCH = 300;
                                const toInsert = validIPs.slice(0, MAX_FETCH);

                                // 1) Insert immediately (fast batch insert, no duplicate SELECT checks)
                                let inserted = 0;
                                try {
                                  const insertStatements = toInsert.map(item => {
                                    return env.DB.prepare(`INSERT INTO proxyip (ip, port, country, city, isp, status, last_check) VALUES (?, ?, '', '', '', 'unknown', ?)
                                      ON CONFLICT(ip, port) DO NOTHING`).bind(item.ip, item.port, Date.now());
                                  });
                                  if (insertStatements.length > 0) {
                                    const batchResults = await env.DB.batch(insertStatements);
                                    inserted = batchResults.reduce((acc, curr) => {
                                      const chg = curr.meta ? (curr.meta.changes || 0) : (curr.success !== false ? 1 : 0);
                                      return acc + chg;
                                    }, 0);
                                  }
                                } catch(e) { console.error("Batch insert error in fetch:", e.message); }

                                // 2) Batch-detect countries and update
                                try {
                                  const ipList = [...new Set(toInsert.map(p => p.ip).filter(ip => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)))];
                                  const geoMap = await batchDetectCountries(ipList);
                                  const updateStatements = [];
                                  for (const item of toInsert) {
                                    const geo = geoMap.get(item.ip);
                                    if (!geo) continue;
                                    updateStatements.push(
                                      env.DB.prepare('UPDATE proxyip SET country = ?, city = ?, isp = ? WHERE ip = ? AND port = ?')
                                        .bind(geo.country, geo.city, geo.isp, item.ip, item.port)
                                    );
                                  }
                                  if (updateStatements.length > 0) {
                                    await env.DB.batch(updateStatements);
                                  }
                                } catch(e) { console.error("Batch update error in fetch:", e.message); }

                                return new Response(JSON.stringify({ok: true, count: inserted}), {status: 200, headers: {'Content-Type': 'application/json'}});
                              } catch(e) {
                                return new Response(JSON.stringify({ok: false, error: e.message}), {status: 500, headers: {'Content-Type': 'application/json'}});
                              }
                            }

              if (path === '/api/proxyip/import' && request.method === 'POST') {
                              const b = await request.json();
                              const { text, format } = b;
                              if (!text) return new Response(JSON.stringify({ok: false, error: 'Text is required'}), {status: 400, headers: {'Content-Type': 'application/json'}});

                              let lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

                              // 1) Parse all lines up-front
                              const parsed = [];
                              for (const line of lines) {
                                const match = line.match(/^([\d\.]+):(\d+)(?:\s*#\s*(.+))?$/) || line.match(/^([\d\.]+)$/);
                                if (match) {
                                  parsed.push({ ip: match[1], port: parseInt(match[2]) || 443 });
                                }
                              }

                              // 2) Insert immediately (fast batch insert)
                              let inserted = 0;
                              try {
                                const insertStatements = parsed.map(item => {
                                  return env.DB.prepare(`INSERT INTO proxyip (ip, port, country, city, isp, status, last_check) VALUES (?, ?, '', '', '', 'unknown', ?)
                                    ON CONFLICT(ip, port) DO NOTHING`).bind(item.ip, item.port, Date.now());
                                });
                                if (insertStatements.length > 0) {
                                  const batchResults = await env.DB.batch(insertStatements);
                                  inserted = batchResults.reduce((acc, curr) => {
                                    const chg = curr.meta ? (curr.meta.changes || 0) : (curr.success !== false ? 1 : 0);
                                    return acc + chg;
                                  }, 0);
                                }
                              } catch(e) { console.error("Batch insert error in import:", e.message); }

                              // 3) Batch-detect countries for the freshly imported IPs and update
                              try {
                                const ipList = [...new Set(parsed.map(p => p.ip).filter(ip => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)))];
                                const geoMap = await batchDetectCountries(ipList);
                                const updateStatements = [];
                                for (const item of parsed) {
                                  const geo = geoMap.get(item.ip);
                                  if (!geo) continue;
                                  updateStatements.push(
                                    env.DB.prepare('UPDATE proxyip SET country = ?, city = ?, isp = ? WHERE ip = ? AND port = ?')
                                      .bind(geo.country, geo.city, geo.isp, item.ip, item.port)
                                  );
                                }
                                if (updateStatements.length > 0) {
                                  await env.DB.batch(updateStatements);
                                }
                              } catch(e) { console.error("Batch update error in import:", e.message); }

                              return new Response(JSON.stringify({ok: true, count: inserted}), {status: 200, headers: {'Content-Type': 'application/json'}});
                            }

              if (path === '/api/proxyip/bulk-delete' && request.method === 'POST') {
                const b = await request.json();
                const { ips } = b; // [{ip, port}]
                if (!Array.isArray(ips) || ips.length === 0) return new Response(JSON.stringify({ok: false, error: 'Invalid data'}), {status: 400, headers: {'Content-Type': 'application/json'}});
        
                let deleted = 0;
                try {
                  const deleteStatements = ips.map(item => {
                    return env.DB.prepare('DELETE FROM proxyip WHERE ip = ? AND port = ?').bind(item.ip, item.port);
                  });
                  if (deleteStatements.length > 0) {
                    const batchResults = await env.DB.batch(deleteStatements);
                    deleted = batchResults.reduce((acc, curr) => {
                      const chg = curr.meta ? (curr.meta.changes || 0) : (curr.success !== false ? 1 : 0);
                      return acc + chg;
                    }, 0);
                  }
                } catch(e) { console.error("Batch delete error:", e.message); }
        
                return new Response(JSON.stringify({ok: true, deleted}), {status: 200, headers: {'Content-Type': 'application/json'}});
              }

              // Bulk detect country for existing IPs (uses fast batch endpoint)
              if (path === '/api/proxyip/detect-countries' && request.method === 'POST') {
                if (!env.DB) return new Response(JSON.stringify({ok: false, error: 'DB not available'}), {status: 500, headers: {'Content-Type': 'application/json'}});

                const { results: dbResults } = await env.DB.prepare("SELECT * FROM proxyip WHERE country = '' OR country IS NULL").all();
                if (!dbResults.length) {
                  return new Response(JSON.stringify({ok: true, updated: 0}), {status: 200, headers: {'Content-Type': 'application/json'}});
                }

                // Only real IPv4 addresses can be geo-looked-up in batch; skip hostnames.
                const ipList = [...new Set(dbResults.map(r => r.ip).filter(ip => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)))];
                const geoMap = await batchDetectCountries(ipList);

                let updated = 0;
                try {
                  const updateStatements = [];
                  for (const item of dbResults) {
                    const geo = geoMap.get(item.ip);
                    if (!geo) continue;
                    updateStatements.push(
                      env.DB.prepare('UPDATE proxyip SET country = ?, city = ?, isp = ? WHERE ip = ? AND port = ?')
                        .bind(geo.country, geo.city, geo.isp, item.ip, item.port)
                    );
                  }
                  if (updateStatements.length > 0) {
                    const batchResults = await env.DB.batch(updateStatements);
                    updated = batchResults.reduce((acc, curr) => {
                      const chg = curr.meta ? (curr.meta.changes || 0) : (curr.success !== false ? 1 : 0);
                      return acc + chg;
                    }, 0);
                  }
                } catch(e) { console.error("Batch update error in detect-countries:", e.message); }

                return new Response(JSON.stringify({ok: true, updated}), {status: 200, headers: {'Content-Type': 'application/json'}});
              }

        // Unmatched /api/ route
        return new Response(JSON.stringify({ok: false, error: 'Not Found'}), {status: 404, headers: {'Content-Type': 'application/json'}});
      }

      if (path.endsWith('/sub')) {

         const parts = path.split('/');
         const subId = parts[1] === 'sub' ? parts[2] : parts[1];
         const users = await getAllUsers(env);
         const user = users.find(u => u.id === subId);
         if (user) {
            const host = request.headers.get('Host');
            const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
            
            // Detect client type comprehensively
            const isBrowser = /mozilla|chrome|safari|applewebkit|gecko|opera|edge/i.test(userAgent) && !/cla.*sh|si.*ng.*box|v2ray|shadowrocket|quantum.*ult|surf.*board|sta.*sh/i.test(userAgent);
            
            const isClash = /cla.*sh|clash|mihomo|stash/i.test(userAgent);
            const isSingBox = /sing.*box|singbox/i.test(userAgent);
            const isV2ray = /v2ray|v2rayng|v2rayn|nekobox|nekoray/i.test(userAgent);
            const isShadowrocket = /shadowrocket/i.test(userAgent);
            const isSurge = /surge/i.test(userAgent);
            const isLoon = /loon/i.test(userAgent);
            const isStash = /stash/i.test(userAgent);
            const isHiddify = /hiddify/i.test(userAgent);
            const isSagerNet = /sagernet|v2box|foxray|streisand/i.test(userAgent);
            
            const randomizeCase = (str) => str.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
            const randomSNI = randomizeCase(host);
            
            const junkVal = Math.random().toString(36).substring(2, 10);
            const vlessPathObj = { junk: junkVal, protocol: "vl" };
            const trojanPathObj = { junk: junkVal, protocol: "tr" };
            
            const vlessObfuscatedPath = '/' + btoa(JSON.stringify(vlessPathObj));
            const trojanObfuscatedPath = '/trojan-' + btoa(JSON.stringify(trojanPathObj));
            
            const addr = user.clean_ip || host;
            
            // Build proxy IP comment for multi-ProxyIP
            const userProxyIPs = parseProxyIps(user.proxy_ip || currentProxyIPRaw);
            const proxyIpNote = userProxyIPs.length > 1 ? ` (${userProxyIPs.length} IPs)` : '';
            
            const vlessWS = `vless://${user.id}@${addr}:443?encryption=none&security=tls&sni=${randomSNI}&fp=chrome&alpn=http%2F1.1&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(vlessObfuscatedPath + '?ed=2048')}#VLESS-${user.name}${proxyIpNote}`;
            const trojanWS = `trojan://${user.id}@${addr}:443?security=tls&sni=${randomSNI}&fp=chrome&alpn=http%2F1.1&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(trojanObfuscatedPath)}#Trojan-${user.name}${proxyIpNote}`;
            
            // Build multi-proxyIP export for advanced clients
            let multiProxyExport = '';
            if (userProxyIPs.length > 0) {
              // For each proxy IP, generate an extra config that routes through that specific IP
              userProxyIPs.forEach((pip, idx) => {
                if (!pip) return;
                const pipLabel = pip.includes(':') ? pip.split(':')[0] : pip;
                multiProxyExport += `\n${vlessWS.replace('#VLESS-', `#VLESS-${user.name}-${pipLabel}`)}\n`;
                multiProxyExport += `${trojanWS.replace('#Trojan-', `#Trojan-${user.name}-${pipLabel}`)}\n`;
              });
            }
            
            // URI format for all proxy clients (v2rayNG, Nekobox, Streisand, etc.)
            const uriOutput = vlessWS + '\n' + trojanWS + (multiProxyExport ? '\n' + multiProxyExport : '');
            
            if (isBrowser) {
              return new Response(subscriptionPage(host, user, vlessWS, trojanWS), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }
            
            // For API clients receiving subscription, return Base64
            return new Response(btoa(unescape(encodeURIComponent(uriOutput))), { 
              status: 200, 
              headers: {'Content-Type': 'text/plain; charset=utf-8'} 
            });
         }
         
         // User not found
         return new Response(nginxPage(), {
           status: 404,
           headers: { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'nginx/1.24.0' },
         });
      }

      // 8. Other Setup Routes
      if (path === '/panel/save-uuid' && request.method === 'POST') {
        const body = (await request.text()).trim();
        if (isValidUUID(body)) await setSettingD1(env, 'uuid', body);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      if (path === '/panel/save-password' && request.method === 'POST') {
        const body = (await request.text()).trim();
        await setSettingD1(env, 'panel_pass', body);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      return new Response(nginxPage(), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'nginx/1.24.0' },
      });
    } catch (err) {
      console.error(err);
      const msg = (err && (err.stack || err.message)) || String(err);
      return new Response('Internal Server Error: ' + msg, { status: 500 });
    }

  },
};

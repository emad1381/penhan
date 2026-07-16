// Utility helpers for the Penhan Worker
import { connect } from 'cloudflare:sockets';

export const WS_READY_STATE_OPEN = 1;
export const WS_READY_STATE_CLOSING = 2;

// ============ ProxyIP Health-Check & Colo Engine (cmliu-style) ============
// Inspired by cmliu/edgetunnel: connect a raw socket to the proxy IP, do TLS,
// request /cdn-cgi/trace and parse `loc=` (country) + `colo=` instantly — no
// external GeoIP API needed. Falls back to a plain-TCP reachability probe.

/**
 * DNS-over-HTTPS A-record resolver via Cloudflare (JSON API).
 * Returns an array of IPv4 strings.
 */
async function dohResolveA(name, doh = 'https://cloudflare-dns.com/dns-query') {
  try {
    const resp = await fetch(`${doh}?name=${encodeURIComponent(name)}&type=A`, {
      headers: { accept: 'application/dns-json' },
      cf: { cacheTtl: 60 },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data || !Array.isArray(data.Answer)) return [];
    return data.Answer.filter(a => a.type === 1 && a.data).map(a => a.data.trim());
  } catch (e) { return []; }
}

/**
 * Fetch datacenter-specific proxy IPs the cmliu way:
 * resolve `{colo}.{domain}` (e.g. `fra.proxyip.example.com`) via DoH.
 * Falls back to the bare domain when the colo-specific host has no records.
 * @returns {Promise<string[]>} unique list of IPs
 */
async function fetchColoProxyIPs(domain, colo) {
  const d = String(domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
  if (!d) return [];
  const out = [];
  if (colo) {
    const host = `${String(colo).toLowerCase()}.${d}`;
    out.push(...await dohResolveA(host));
  }
  if (out.length === 0) out.push(...await dohResolveA(d));
  return [...new Set(out)];
}

/**
 * Health-check a single proxy IP.
 * 1) Opens a TLS socket to ip:port and sends `GET /cdn-cgi/trace`.
 *    On success returns { success, ping, country (loc=), colo, ip }.
 * 2) If TLS/trace fails, falls back to a plain-TCP connect to measure
 *    reachability (returns success with degraded=true, no country).
 * @returns {Promise<{success:boolean, ping:number|null, country?:string, colo?:string, ip?:string, degraded?:boolean, error?:string}>}
 */
async function checkProxyIP(ip, port = 443, timeoutMs = 5000) {
  const p = parseInt(port) || 443;
  const start = Date.now();
  const TRACE_HOST = 'speed.cloudflare.com';
  let socket = null;

  // --- Attempt 1: TLS + /cdn-cgi/trace (gets ping AND country instantly) ---
  try {
    socket = connect({ hostname: ip, port: p }, { secureTransport: 'on', allowHalfOpen: false });
    const writer = socket.writable.getWriter();
    await writer.write(new TextEncoder().encode(
      `GET /cdn-cgi/trace HTTP/1.1\r\nHost: ${TRACE_HOST}\r\nUser-Agent: Mozilla/5.0\r\nConnection: close\r\n\r\n`
    ));
    writer.releaseLock();

    const reader = socket.readable.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const remaining = deadline - Date.now();
      const { value, done } = await Promise.race([
        reader.read(),
        new Promise(res => setTimeout(() => res({ value: undefined, done: true }), remaining)),
      ]);
      if (done) break;
      if (value) buf += decoder.decode(value, { stream: true });
      if (buf.includes('loc=') && buf.includes('colo=')) break;
      if (buf.length > 16384) break;
    }
    try { reader.releaseLock(); } catch (e) {}
    try { await socket.close(); } catch (e) {}
    socket = null;

    const ping = Date.now() - start;
    const loc = buf.match(/loc=([A-Za-z]{2})/);
    const colo = buf.match(/colo=([A-Za-z]{3})/);
    const tip = buf.match(/[\r\n]ip=([0-9a-fA-F:.]+)/);
    if (loc || buf.includes('cf-ray') || buf.startsWith('HTTP/')) {
      return {
        success: true, ping,
        country: loc ? loc[1].toUpperCase() : '',
        colo: colo ? colo[1].toUpperCase() : '',
        ip: tip ? tip[1] : ip,
      };
    }
  } catch (e) {
    try { if (socket) await socket.close(); } catch (er) {}
    socket = null;
  }

  // --- Attempt 2: plain-TCP reachability probe (ping only) ---
  try {
    const t0 = Date.now();
    const s2 = connect({ hostname: ip, port: p }, { secureTransport: 'off', allowHalfOpen: false });
    await Promise.race([
      s2.opened,
      new Promise((_, rej) => setTimeout(() => rej(new Error('connect timeout')), timeoutMs)),
    ]);
    const ping = Date.now() - t0;
    try { await s2.close(); } catch (e) {}
    return { success: true, ping, country: '', colo: '', ip, degraded: true };
  } catch (e2) {
    return { success: false, ping: null, error: e2.message || 'unreachable' };
  }
}


// ============ ProxyIP Engine (multi-ProxyIP with fallback) ============

/**
 * Parse a proxy IP string into an array.
 * Supports newline, comma, semicolon separators
 * Ignores empty lines, strips whitespace, handles port: ip:port or just ip
 */
function parseProxyIps(proxyIpString) {
  if (!proxyIpString || typeof proxyIpString !== 'string') return [];
  return proxyIpString
    .split(/[\r\n,;]+/)
    .map(s => {
      let trimmed = s.trim();
      // Strip comments after #
      const hashIdx = trimmed.indexOf('#');
      if (hashIdx > -1) trimmed = trimmed.substring(0, hashIdx).trim();
      // Strip @ prefix for SOCKS5-style
      const atIdx = trimmed.indexOf('@');
      if (atIdx > -1) trimmed = trimmed.substring(atIdx + 1).trim();
      return trimmed;
    })
    .filter(s => s.length > 0);
}

/**
 * Pick a random proxy IP from the array.
 * Returns null if array is empty.
 */
function pickRandomProxyIp(proxyIps) {
  if (!proxyIps || proxyIps.length === 0) return null;
  return proxyIps[Math.floor(Math.random() * proxyIps.length)];
}

/**
 * Round-robin picker. Maintains an index per key (e.g., userId).
 * Returns the next proxy IP in the rotation.
 */
const proxyIpRoundRobinMap = new Map();

function pickNextProxyIp(proxyIps, key = 'default') {
  if (!proxyIps || proxyIps.length === 0) return null;
  let idx = proxyIpRoundRobinMap.get(key) || 0;
  const picked = proxyIps[idx % proxyIps.length];
  proxyIpRoundRobinMap.set(key, idx + 1);
  return picked;
}

/**
 * Retry helper for TCP connections.
 * Tries proxyIPs one by one until one succeeds or all fail.
 * Returns { socket, usedProxyIp } on success, or null on total failure.
 */
async function tryConnectWithFallback(connectFn, proxyIps, remoteSocketWrapper, log) {
  if (!proxyIps || proxyIps.length === 0) {
    log('no proxy IPs available, trying direct connection');
    return null;  // signal caller to try direct
  }

  for (let i = 0; i < proxyIps.length; i++) {
    const proxyIp = proxyIps[i];
    if (!proxyIp) continue;
    log(`retry attempt ${i + 1}/${proxyIps.length} with proxy IP: ${proxyIp}`);
    try {
      const tcpSocket = await connectFn(proxyIp);
      // Success! Update wrapper and return
      remoteSocketWrapper.value = tcpSocket;
      return { socket: tcpSocket, usedProxyIp: proxyIp };
    } catch (err) {
      log(`proxy IP ${proxyIp} failed: ${err.message || err}`);
      remoteSocketWrapper.value = null;
    }
  }

  log('all proxy IPs exhausted, connection failed');
  return null;
}

// ============ Pure JS SHA-256 and SHA-224 implementation ============
function sha224_and_224(ascii, is224 = false) {
  const ch = (x, y, z) => (x & y) ^ (~x & z);
  const maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);
  const sigma0 = (x) => (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10);
  const sigma1 = (x) => (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7);
  const gamma0 = (x) => (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3);
  const gamma1 = (x) => (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10);

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let H = is224 ? [
    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
  ] : [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const words = [];
  const len = ascii.length;
  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  
  const bitLen = len * 8;
  words[bitLen >>> 5] |= 0x80 << (24 - (bitLen % 32));
  
  const blockCount = ((bitLen + 64 >>> 9) + 1) << 4;
  while (words.length < blockCount) words.push(0);
  
  words[blockCount - 2] = (bitLen / 4294967296) | 0;
  words[blockCount - 1] = bitLen | 0;

  const W = new Int32Array(64);
  for (let blockIdx = 0; blockIdx < words.length; blockIdx += 16) {
    for (let i = 0; i < 16; i++) W[i] = words[blockIdx + i];
    for (let i = 16; i < 64; i++) {
      W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let i = 0; i < 64; i++) {
      let t1 = (h + sigma1(e) + ch(e, f, g) + K[i] + W[i]) | 0;
      let t2 = (sigma0(a) + maj(a, b, c)) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  const toHex = (n) => {
    let s = (n >>> 0).toString(16);
    return '00000000'.substring(s.length) + s;
  };

  const limit = is224 ? 7 : 8;
  let res = '';
  for (let i = 0; i < limit; i++) {
    res += toHex(H[i]);
  }
  return res;
}

// Helpers
function base64ToArrayBuffer(base64Str) {
  if (!base64Str) { return { error: null }; }
  try {
    base64Str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) { return { error }; }
}

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

const byteToHex = [];
for (let i = 0; i < 256; ++i) { byteToHex.push((i + 256).toString(16).slice(1)); }

function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' +
    byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' +
    byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' +
    byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' +
    byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!isValidUUID(uuid)) { throw TypeError('Stringified UUID is invalid'); }
  return uuid;
}

function safeCloseWebSocket(socket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) { console.error('safeCloseWebSocket error', error); }
}

// ============ Connection Tracking ============

/** Map<userId, Set<connectionId>> */
const activeConnections = new Map();

/**
 * Track a new connection for a user.
 * Returns false if the user has exceeded their connection limit.
 */
function trackConnectionStart(userId, connLimit = 0) {
  if (!userId) return true;
  
  let conns = activeConnections.get(userId);
  if (!conns) {
    conns = new Set();
    activeConnections.set(userId, conns);
  }
  
  if (connLimit > 0 && conns.size >= connLimit) {
    return false; // limit exceeded
  }
  
  const connId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  conns.add(connId);
  
  return connId;
}

/**
 * End tracking for a connection.
 */
function trackConnectionEnd(userId, connId) {
  if (!userId || !connId) return;
  const conns = activeConnections.get(userId);
  if (conns) {
    conns.delete(connId);
    if (conns.size === 0) activeConnections.delete(userId);
  }
}

/**
 * Get active connection count for a user.
 */
function getActiveConnectionCount(userId) {
  if (!userId) return 0;
  const conns = activeConnections.get(userId);
  return conns ? conns.size : 0;
}

// ============ Security & Auth ============
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function isAuthed(request, pass) {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(/(?:^|;\s*)panel_auth=([^;]*)/);
  if (!match || !match[1]) return false;
  
  const hashedPass = await hashPassword(pass);
  return timingSafeEqual(match[1], hashedPass);
}

function isApiAuthed(request, currentPanelPass, currentUserID) {
  const authHeader = request.headers.get('Authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const url = new URL(request.url);
    token = url.searchParams.get('token') || '';
  }
  
  if (currentPanelPass && timingSafeEqual(token, currentPanelPass)) {
    return true;
  }
  if (timingSafeEqual(token, currentUserID)) {
    return true;
  }
  if (!currentPanelPass && !token) {
    return true;
  }
  return false;
}

// ============ Universal Master Token Auth ============

/**
 * Universal auth checker: checks all possible auth methods
 * 1. Panel password (cookie-based)
 * 2. Bearer token (any master key from db)
 * 3. URL query token
 * 
 * Can optionally require a specific scope.
 * Returns true if ANY valid auth method passes.
 */
async function checkMasterAuth(request, env, panelPass) {
  // 1. Cookie-based panel auth
  if (panelPass && await isAuthed(request, panelPass)) return true;
  
  // 2. Bearer token / URL token against all known keys
  const authHeader = request.headers.get('Authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const url = new URL(request.url);
    token = url.searchParams.get('token') || '';
  }
  
  if (!token) return false;
  
  // Check against panel password
  if (panelPass && timingSafeEqual(token, panelPass)) return true;
  
  // Check against all API keys in DB
  try {
    if (env.DB) {
      const { results } = await env.DB.prepare('SELECT key FROM api_keys').all();
      if (results && results.some(r => timingSafeEqual(r.key, token))) return true;
    }
  } catch (e) {}
  
  return false;
}

// ============ D1 Database Helpers ============
async function setupD1Schema(env) {
  if (!env.DB) return;
  const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        clean_ip TEXT,
        proxy_ip TEXT,
        limit_bytes INTEGER DEFAULT 0,
        used_bytes INTEGER DEFAULT 0,
        expiry_date INTEGER,
        enabled BOOLEAN DEFAULT 1,
        conn_limit INTEGER DEFAULT 0,
        max_configs INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS api_keys (
        key TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        scopes TEXT DEFAULT 'api',
        created_at INTEGER
      );`,
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS proxyip (
        ip TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 443,
        country TEXT,
        city TEXT,
        isp TEXT,
        ping INTEGER,
        status TEXT DEFAULT 'unknown',
        last_check INTEGER,
        PRIMARY KEY (ip, port)
      );`,
      `CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        node_key TEXT NOT NULL,
        status TEXT DEFAULT 'unknown',
        last_sync INTEGER,
        cf_account_id TEXT,
        cf_api_token TEXT
      );`
    ];
  for (const q of queries) {
    try {
      await env.DB.prepare(q).run();
    } catch (e) {
      console.error("D1 Schema setup error:", e);
    }
  }
  
  // Alter statements for existing tables
  try {
    await env.DB.prepare("ALTER TABLE nodes ADD COLUMN cf_account_id TEXT;").run();
  } catch (e) {}
  try {
    await env.DB.prepare("ALTER TABLE nodes ADD COLUMN cf_api_token TEXT;").run();
  } catch (e) {}
}

async function getSettingD1(env, key) {
  if (!env.DB) return null;
  try {
    const { results } = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).all();
    return results.length > 0 ? results[0].value : null;
  } catch (e) { return null; }
}

async function setSettingD1(env, key, value) {
  if (!env.DB) return;
  try {
    await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key, value).run();
  } catch (e) { console.error("Setting save error", e); }
}

async function getUserFromD1(env, uuid) {
  if (!env.DB) return null;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(uuid).all();
    return results.length > 0 ? results[0] : null;
  } catch (e) { return null; }
}

async function updateUsageD1(env, uuid, bytes) {
  if (!env.DB || bytes === 0) return;
  try {
    await env.DB.prepare('UPDATE users SET used_bytes = used_bytes + ? WHERE id = ?').bind(bytes, uuid).run();
  } catch (e) { console.error("Usage update error", e); }
}

export { 
  sha224_and_224, base64ToArrayBuffer, isValidUUID, unsafeStringify, stringify, 
  safeCloseWebSocket, hashPassword, timingSafeEqual, isAuthed, isApiAuthed,
  setupD1Schema, getUserFromD1, updateUsageD1, getSettingD1, setSettingD1,
  parseProxyIps, pickRandomProxyIp, pickNextProxyIp, tryConnectWithFallback,
  trackConnectionStart, trackConnectionEnd, getActiveConnectionCount,
  checkMasterAuth, checkProxyIP, fetchColoProxyIPs, dohResolveA
};



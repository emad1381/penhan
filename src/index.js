import { 
  isValidUUID, isAuthed, isApiAuthed, hashPassword, setupD1Schema, 
  updateUsageD1, sha224_and_224, getSettingD1, setSettingD1,
  parseProxyIps, pickRandomProxyIp,
  checkMasterAuth, trackConnectionStart, trackConnectionEnd, getActiveConnectionCount
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
        if (decodedPath.includes('trojan-ws') || decodedPath.includes('trojan')) {
          return await trojanOverWSHandler(request, authenticate, currentProxyIPRaw, onUsage);
        } else {
          return await vlessOverWSHandler(request, authenticate, currentProxyIPRaw, onUsage);
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
        
        return new Response(JSON.stringify({ok: false, error: 'Not Found'}), {status: 404, headers: {'Content-Type': 'application/json'}});
      }

      // ============ Subscription System ============
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
      return new Response('Internal Server Error: ' + err.stack || err.message || err, { status: 500 });
    }
  },
};

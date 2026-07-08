import { isValidUUID, isAuthed, isApiAuthed, hashPassword, setupD1Schema, updateUsageD1, sha224_and_224, getSettingD1, setSettingD1 } from './helpers.js';
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

      let currentProxyIP = (await getSettingD1(env, 'proxy_ip')) || env.PROXYIP || '';
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

      const onUsage = (userID, upload, download) => {
        if (!env.DB) return true;
        let user = usersCache?.find(u => u.id === userID);
        if (!user) return true;
        user.used_bytes += (upload + download);
        
        if (upload + download > 0) {
          ctx.waitUntil(updateUsageD1(env, userID, upload + download).catch(console.error));
        }
        
        if (user.limit_bytes > 0 && user.used_bytes >= user.limit_bytes) return false;
        if (user.expiry_date > 0 && Date.now() > user.expiry_date) return false;
        return true;
      };

      if (upgradeHeader === 'websocket') {
        const decodedPath = decodeURIComponent(path).toLowerCase();
        if (decodedPath.includes('trojan-ws') || decodedPath.includes('trojan')) {
          return await trojanOverWSHandler(request, authenticate, currentProxyIP, onUsage);
        } else {
          return await vlessOverWSHandler(request, authenticate, currentProxyIP, onUsage);
        }
      }

      const isSetupComplete = !!currentPanelPass && !!currentAdminUUID && !!env.DB;

      if (!isSetupComplete) {
        if (path === '/panel' || path === '/') {
           return new Response(setupPage(!!env.DB, !!currentPanelPass, !!currentAdminUUID, currentAdminUUID, currentProxyIP), {
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
        return new Response(panelPage(host, currentAdminUUID, currentProxyIP, cfAccountId, cfApiToken), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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

      const checkApiAuth = async (req) => {
        if (currentPanelPass && (await isAuthed(req, currentPanelPass))) return true;
        const authHeader = req.headers.get('Authorization');
        let token = '';
        if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7).trim();
        else token = new URL(req.url).searchParams.get('token') || '';
        if (token) {
          const tokens = await getAllTokens(env);
          if (tokens.some(t => t.key === token)) return true;
        }
        return false;
      };

      if (path.startsWith('/api/')) {
        if (!(await checkApiAuth(request))) {
           return new Response(JSON.stringify({ok: false, error: 'Unauthorized'}), {status: 401, headers: {'Content-Type': 'application/json'}});
        }
        
        if (path === '/api/users') {
           if (request.method === 'GET') {
             const users = await getAllUsers(env);
             return new Response(JSON.stringify({ok: true, users}), {status: 200, headers: {'Content-Type': 'application/json'}});
           }
           if (request.method === 'POST') {
             const b = await request.json();
             await env.DB.prepare(`
                INSERT INTO users (id, name, clean_ip, proxy_ip, limit_bytes, expiry_date, enabled)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  clean_ip = excluded.clean_ip,
                  limit_bytes = excluded.limit_bytes,
                  expiry_date = excluded.expiry_date,
                  enabled = excluded.enabled
              `).bind(b.id, b.name, b.clean_ip || '', b.proxy_ip || '', b.limit_bytes || 0, b.expiry_date || 0, b.enabled === false ? 0 : 1).run();
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
             await env.DB.prepare('INSERT INTO api_keys (key, name, created_at) VALUES (?, ?, ?)')
               .bind(b.key, b.name, Date.now()).run();
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
            query GetRequests($accountTag: String!, $start: String!, $end: String!) {
              viewer {
                accounts(filter: { accountTag: $accountTag }) {
                  workersRequestAdaptiveGroups(
                    limit: 1,
                    filter: {
                      datetime_geq: $start,
                      datetime_leq: $end
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
              body: JSON.stringify({
                query,
                variables: {
                  accountTag: accountId,
                  start,
                  end
                }
              })
            });
            const cfData = await cfRes.json();
            
            if (cfData.errors && cfData.errors.length > 0) {
              return new Response(JSON.stringify({ok: false, error: cfData.errors[0].message}), {status: 200, headers: {'Content-Type': 'application/json'}});
            }
            
            const accounts = cfData?.data?.viewer?.accounts;
            let requestsUsed = 0;
            if (accounts && accounts.length > 0 && accounts[0].workersRequestAdaptiveGroups && accounts[0].workersRequestAdaptiveGroups.length > 0) {
              requestsUsed = accounts[0].workersRequestAdaptiveGroups[0].sum.requests || 0;
            }
            
            return new Response(JSON.stringify({ok: true, requestsUsed, limit: 100000}), {status: 200, headers: {'Content-Type': 'application/json'}});
          } catch(e) {
            return new Response(JSON.stringify({ok: false, error: e.message}), {status: 200, headers: {'Content-Type': 'application/json'}});
          }
        }
        
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
            const isProxyClient = userAgent.includes('v2ray') || userAgent.includes('hiddify') || userAgent.includes('clash') || userAgent.includes('sing-box');
            
            const randomizeCase = (str) => str.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
            const randomSNI = randomizeCase(host);
            
            const junkVal = Math.random().toString(36).substring(2, 10);
            const vlessPathObj = { junk: junkVal, protocol: "vl" };
            const trojanPathObj = { junk: junkVal, protocol: "tr" };
            
            const vlessObfuscatedPath = '/' + btoa(JSON.stringify(vlessPathObj));
            const trojanObfuscatedPath = '/trojan-' + btoa(JSON.stringify(trojanPathObj));
            
            const addr = user.clean_ip || host;
            
            const vlessWS = `vless://${user.id}@${addr}:443?encryption=none&security=tls&sni=${randomSNI}&fp=chrome&alpn=http%2F1.1&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(vlessObfuscatedPath + '?ed=2048')}#VLESS-${user.name}`;
            const trojanWS = `trojan://${user.id}@${addr}:443?security=tls&sni=${randomSNI}&fp=chrome&alpn=http%2F1.1&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(trojanObfuscatedPath)}#Trojan-${user.name}`;
            
            if (isProxyClient) {
               return new Response(btoa(unescape(encodeURIComponent(vlessWS + '\n' + trojanWS + '\n'))), { status: 200, headers: {'Content-Type': 'text/plain'} });
            }
            return new Response(subscriptionPage(host, user, vlessWS, trojanWS), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
         }
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
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

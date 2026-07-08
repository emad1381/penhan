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
      let currentPanelPass = (await getSettingD1(env, 'panel_pass')) || env.PASSWORD || '';
      let currentAdminUUID = (await getSettingD1(env, 'uuid')) || env.UUID || ''; 
      
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

      const onUsage = (userID) => {
        return (upload, download) => {
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
      };

      if (upgradeHeader === 'websocket') {
        const decodedPath = decodeURIComponent(path).toLowerCase();
        if (decodedPath.includes('trojan-ws') || decodedPath.includes('trojan')) {
          return await trojanOverWSHandler(request, authenticate, currentProxyIP, (up, down) => true); // Will wrap inside handler
        } else {
          return await vlessOverWSHandler(request, authenticate, currentProxyIP, (up, down) => true);
        }
      }

      if (path === '/') {
        let showSetup = false;
        if (!currentPanelPass || !currentAdminUUID || !env.DB) showSetup = true;
        else if (await isAuthed(request, currentPanelPass)) showSetup = true;
        
        if (showSetup) {
           return new Response(setupPage(true, !!currentPanelPass, !!currentAdminUUID, true, currentAdminUUID, currentProxyIP), {
             status: 200,
             headers: { 'Content-Type': 'text/html; charset=utf-8' },
           });
        }
        return new Response(nginxPage(), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'nginx/1.24.0' } });
      }

      if (path === '/' + currentAdminUUID) {
        const host = request.headers.get('Host');
        if (currentPanelPass && !(await isAuthed(request, currentPanelPass))) {
          return new Response(loginPage(currentAdminUUID, host), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        return new Response(panelPage(host, currentAdminUUID, currentProxyIP), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }

      // panel-auth
      if (path === '/' + currentAdminUUID + '/panel-auth' && request.method === 'POST') {
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
             await env.DB.prepare('INSERT INTO users (id, name, clean_ip, proxy_ip, limit_bytes, expiry_date, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)')
               .bind(b.id, b.name, b.clean_ip || '', b.proxy_ip || '', b.limit_bytes || 0, b.expiry_date || 0, b.enabled === false ? 0 : 1).run();
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
          return new Response(JSON.stringify({ok: true}), {status: 200, headers: {'Content-Type': 'application/json'}});
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
            
            const addr = user.clean_ip || currentProxyIP || host;
            const vlessWS = `vless://${user.id}@${addr}:443?encryption=none&security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=/?ed=2048#VLESS-${user.name}`;
            const trojanWS = `trojan://${user.id}@${addr}:443?security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=/trojan-ws#Trojan-${user.name}`;
            
            if (isProxyClient) {
               return new Response(btoa(unescape(encodeURIComponent(vlessWS + '\n' + trojanWS + '\n'))), { status: 200, headers: {'Content-Type': 'text/plain'} });
            }
            return new Response(subscriptionPage(host, user, vlessWS, trojanWS), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
         }
      }

      // 8. Other Setup Routes
      if (path === '/' + currentAdminUUID + '/save-uuid' && request.method === 'POST') {
        const body = (await request.text()).trim();
        if (isValidUUID(body)) await setSettingD1(env, 'uuid', body);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      if (path === '/' + currentAdminUUID + '/save-password' && request.method === 'POST') {
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

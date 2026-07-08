// =============================================================
//  Penhan — VLESS & Trojan over WebSocket — Cloudflare Worker
// =============================================================
import { isValidUUID, isAuthed, isApiAuthed, hashPassword } from './helpers.js';
import { vlessOverWSHandler } from './vless.js';
import { trojanOverWSHandler } from './trojan.js';
import { nginxPage, loginPage, subscriptionPage, panelPage, setupPage } from './templates.js';

// ============ تنظیمات ============
const rateLimitMap = new Map();

const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;

// ============ هندلر اصلی (Router) ============
export default {
  async fetch(request, env, ctx) {
    try {
      // بارگذاری از KV (nahan)
      let savedProxyIP = '';
      let savedCleanIP = '';
      let savedPass = '';
      let savedVlessPath = '';
      let savedTrojanPath = '';
      let savedUUID = '';
      let savedTrPass = '';
      
      if (env.nahan) {
        savedProxyIP    = (await env.nahan.get('proxy_ip')) || '';
        savedCleanIP    = (await env.nahan.get('clean_ip')) || '';
        savedPass       = (await env.nahan.get('panel_pass')) || '';
        savedVlessPath  = (await env.nahan.get('vless_ws_path')) || '';
        savedTrojanPath = (await env.nahan.get('trojan_ws_path')) || '';
        savedUUID       = (await env.nahan.get('uuid')) || '';
        savedTrPass     = (await env.nahan.get('tr_pass')) || '';
      }
      
      let currentProxyIP    = savedProxyIP || env.PROXYIP || '';
      let currentCleanIP    = savedCleanIP || '';
      let currentPanelPass  = savedPass || env.PASSWORD || '';
      let currentVlessPath  = savedVlessPath || '';
      let currentTrojanPath = savedTrojanPath || '';
      let currentUserID     = savedUUID || env.UUID || '';
      let currentTrPass     = savedTrPass || env.TR_PASS || '';

      const upgradeHeader = request.headers.get('Upgrade');
      const url = new URL(request.url);
      const path = url.pathname;

      // WebSocket Handlers
      if (upgradeHeader === 'websocket') {
        const decodedPath = decodeURIComponent(path).toLowerCase();
        
        // تشخیص نوع پروتکل از روی آدرس مسیر سفارشی‌شده
        const isTrojan = currentTrojanPath 
          ? decodedPath.includes(decodeURIComponent(currentTrojanPath).toLowerCase())
          : (decodedPath.includes('trojan-ws') || decodedPath.includes('trojan'));

        if (isTrojan) {
          return await trojanOverWSHandler(request, currentTrPass, currentProxyIP);
        } else {
          return await vlessOverWSHandler(request, currentUserID, currentProxyIP);
        }
      }

      // HTTP Router
      // 1. Root / Setup Page / Nginx fake page
      if (path === '/') {
        const hasKV = !!env.nahan;
        const hasPassword = !!currentPanelPass;
        const hasUUID = !!currentUserID && isValidUUID(currentUserID);
        const hasTrPass = !!currentTrPass;
        
        let showSetup = false;
        if (!hasKV || !hasPassword || !hasUUID || !hasTrPass) {
          showSetup = true;
        } else if (hasPassword && (await isAuthed(request, currentPanelPass))) {
          showSetup = true;
        }

        if (showSetup) {
          return new Response(setupPage(hasKV, hasPassword, hasUUID, hasTrPass, currentUserID, currentProxyIP), {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }

        return new Response(nginxPage(), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Server': 'nginx/1.24.0' },
        });
      }

      // 3. Admin Panel Page
      if (path === '/' + currentUserID) {
        const host = request.headers.get('Host');
        if (currentPanelPass && !(await isAuthed(request, currentPanelPass))) {
          return new Response(loginPage(currentUserID, host), {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        const cfColo = request.cf ? request.cf.colo : 'N/A';
        const tlsVersion = request.cf ? request.cf.tlsVersion : 'N/A';
        return new Response(panelPage(host, currentUserID, currentTrPass, currentCleanIP, currentProxyIP, currentVlessPath, currentTrojanPath, !!currentPanelPass, cfColo, tlsVersion), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // 4. Subscription Link Endpoint (Browser or V2Ray client detection)
      if (path === '/' + currentUserID + '/sub' || path === '/sub/' + currentUserID) {
        const host = request.headers.get('Host');
        const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
        
        const isProxyClient = userAgent.includes('v2ray') || 
                              userAgent.includes('hiddify') || 
                              userAgent.includes('clash') || 
                              userAgent.includes('sing-box') || 
                              userAgent.includes('shadowrocket') || 
                              userAgent.includes('streisand') || 
                              userAgent.includes('quantumult') || 
                              userAgent.includes('surge') || 
                              userAgent.includes('foxray') || 
                              userAgent.includes('stash') ||
                              userAgent.includes('v2fly') ||
                              userAgent.includes('xray');

        if (isProxyClient) {
          const addr = currentCleanIP || host;
          const vlessPath = currentVlessPath || '/?ed=2048';
          const trojanPath = currentTrojanPath || `/${currentUserID}/trojan-ws`;

          const vlessWS = `vless://${currentUserID}@${addr}:443?encryption=none&security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(vlessPath)}#VLESS-WS-${host}`;
          const trojanWS = `trojan://${currentTrPass}@${addr}:443?security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(trojanPath)}#Trojan-WS-${host}`;

          const plainConfigs = `${vlessWS}\n${trojanWS}\n`;
          const base64Configs = btoa(unescape(encodeURIComponent(plainConfigs)));

          return new Response(base64Configs, {
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-store',
            }
          });
        } else {
          return new Response(subscriptionPage(host, currentUserID, currentTrPass, currentCleanIP, currentVlessPath, currentTrojanPath), {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store',
            },
          });
        }
      }

      // 5. API: Get info JSON
      if (path === '/api/info' || path === '/' + currentUserID + '/api/info') {
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const host = request.headers.get('Host');
        const addr = currentCleanIP || host;
        const vlessPath = currentVlessPath || '/?ed=2048';
        const trojanPath = currentTrojanPath || `/${currentUserID}/trojan-ws`;

        const vlessWS = `vless://${currentUserID}@${addr}:443?encryption=none&security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(vlessPath)}#VLESS-WS-${host}`;
        const trojanWS = `trojan://${currentTrPass}@${addr}:443?security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(trojanPath)}#Trojan-WS-${host}`;
        const subWS = `https://${host}/${currentUserID}/sub`;

        return new Response(JSON.stringify({
          ok: true,
          uuid: currentUserID,
          host: host,
          cleanIP: currentCleanIP || null,
          proxyIP: currentProxyIP || null,
          vlessPath: vlessPath,
          trojanPath: trojanPath,
          links: {
            vless: vlessWS,
            trojan: trojanWS,
            subscription: subWS
          },
          system: {
            cfColo: request.cf ? request.cf.colo : 'N/A',
            tlsVersion: request.cf ? request.cf.tlsVersion : 'N/A'
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 6. API: Update settings JSON
      if (path === '/api/settings' || path === '/' + currentUserID + '/api/settings') {
        if (request.method !== 'POST') {
          return new Response(JSON.stringify({ ok: false, error: "Method Not Allowed" }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        let body = {};
        try {
          body = await request.json();
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (body.cleanIP !== undefined) {
          const val = body.cleanIP.trim();
          currentCleanIP = val;
          if (env.nahan) await env.nahan.put('clean_ip', val, { expirationTtl: 31536000 });
        }
        if (body.proxyIP !== undefined) {
          const val = body.proxyIP.trim();
          currentProxyIP = val;
          if (env.nahan) await env.nahan.put('proxy_ip', val, { expirationTtl: 31536000 });
        }
        if (body.vlessPath !== undefined) {
          let val = body.vlessPath.trim() || '/?ed=2048';
          if (val && !val.startsWith('/')) val = '/' + val;
          currentVlessPath = val;
          if (env.nahan) await env.nahan.put('vless_ws_path', val, { expirationTtl: 31536000 });
        }
        if (body.trojanPath !== undefined) {
          let val = body.trojanPath.trim() || `/${currentUserID}/trojan-ws`;
          if (val && !val.startsWith('/')) val = '/' + val;
          currentTrojanPath = val;
          if (env.nahan) await env.nahan.put('trojan_ws_path', val, { expirationTtl: 31536000 });
        }
        if (body.password !== undefined) {
          const val = body.password.trim();
          currentPanelPass = val;
          if (env.nahan) await env.nahan.put('panel_pass', val, { expirationTtl: 31536000 });
        }

        if (body.uuid !== undefined) {
          const val = body.uuid.trim();
          if (isValidUUID(val)) {
            currentUserID = val;
            if (env.nahan) await env.nahan.put('uuid', val, { expirationTtl: 31536000 });
          }
        }
        if (body.tr_pass !== undefined) {
          const val = body.tr_pass.trim();
          if (val) {
            currentTrPass = val;
            if (env.nahan) await env.nahan.put('tr_pass', val, { expirationTtl: 31536000 });
          }
        }

        return new Response(JSON.stringify({
          ok: true,
          message: "Settings updated successfully",
          settings: {
            cleanIP: currentCleanIP || null,
            proxyIP: currentProxyIP || null,
            vlessPath: currentVlessPath || '/?ed=2048',
            trojanPath: currentTrojanPath || `/${currentUserID}/trojan-ws`,
            hasPassword: !!currentPanelPass,
            uuid: currentUserID,
            tr_pass: currentTrPass
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // POST: احراز هویت (لاگین)
      if (path === '/' + currentUserID + '/panel-auth') {
        if (request.method !== 'POST') {
          return new Response('Method Not Allowed', { status: 405 });
        }
        
        // Rate Limiting (10 requests per minute)
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const now = Date.now();
        const rl = rateLimitMap.get(ip) || { count: 0, time: now };
        if (now - rl.time > 60000) { rl.count = 0; rl.time = now; }
        rl.count++;
        rateLimitMap.set(ip, rl);
        if (rl.count > 10) {
          return new Response(JSON.stringify({ ok: false, error: 'Too Many Requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
        }

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
        return new Response(JSON.stringify({ ok: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // POST: ذخیره رمز پنل
      if (path === '/' + currentUserID + '/save-password') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) return new Response('Unauthorized', { status: 401 });
        
        const body = (await request.text()).trim();
        const savedPassNew = body || '';
        const panelPassNew = savedPassNew || env.PASSWORD || '';
        if (env.nahan) {
          await env.nahan.put('panel_pass', savedPassNew, { expirationTtl: 31536000 });
        }
        return new Response(JSON.stringify({ ok: true, enabled: !!panelPassNew }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // POST: ذخیره Clean IP
      if (path === '/' + currentUserID + '/save-cleanip') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) return new Response('Unauthorized', { status: 401 });
        
        const body = await request.text();
        const savedCleanIPNew = body.trim();
        if (env.nahan) {
          await env.nahan.put('clean_ip', savedCleanIPNew, { expirationTtl: 31536000 });
        }
        return new Response(JSON.stringify({ ok: true, cleanIP: savedCleanIPNew }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // POST: ذخیره Proxy IP
      if (path === '/' + currentUserID + '/save-proxy') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) return new Response('Unauthorized', { status: 401 });

        const body = await request.text();
        const savedProxyIPNew = body.trim();
        const proxyIPNew = savedProxyIPNew || env.PROXYIP || '';
        if (env.nahan) {
          await env.nahan.put('proxy_ip', savedProxyIPNew, { expirationTtl: 31536000 });
        }
        return new Response(JSON.stringify({ ok: true, proxyIP: proxyIPNew }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // POST: ذخیره مسیر VLESS WS
      if (path === '/' + currentUserID + '/save-vlesspath') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) return new Response('Unauthorized', { status: 401 });

        const body = (await request.text()).trim();
        let newPath = body;
        if (newPath && !newPath.startsWith('/')) {
          newPath = '/' + newPath;
        }
        if (env.nahan) {
          await env.nahan.put('vless_ws_path', newPath, { expirationTtl: 31536000 });
        }
        return new Response(JSON.stringify({ ok: true, path: newPath }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // POST: ذخیره مسیر Trojan WS
      if (path === '/' + currentUserID + '/save-trojanpath') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) return new Response('Unauthorized', { status: 401 });

        const body = (await request.text()).trim();
        let newPath = body;
        if (newPath && !newPath.startsWith('/')) {
          newPath = '/' + newPath;
        }
        if (env.nahan) {
          await env.nahan.put('trojan_ws_path', newPath, { expirationTtl: 31536000 });
        }
        return new Response(JSON.stringify({ ok: true, path: newPath }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // POST: ذخیره UUID
      if (path === '/' + currentUserID + '/save-uuid') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) return new Response('Unauthorized', { status: 401 });

        const body = (await request.text()).trim();
        if (!isValidUUID(body)) {
           return new Response(JSON.stringify({ ok: false, error: 'Invalid UUID' }), { status: 400 });
        }
        if (env.nahan) {
          await env.nahan.put('uuid', body, { expirationTtl: 31536000 });
        }
        return new Response(JSON.stringify({ ok: true, uuid: body }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // POST: ذخیره رمز تروجان
      if (path === '/' + currentUserID + '/save-trpass') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) return new Response('Unauthorized', { status: 401 });

        const body = (await request.text()).trim();
        if (!body) {
           return new Response(JSON.stringify({ ok: false, error: 'Password required' }), { status: 400 });
        }
        if (env.nahan) {
          await env.nahan.put('tr_pass', body, { expirationTtl: 31536000 });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      
      // GET/POST: API Ping
      if (path === '/api/ping') {
        return new Response(JSON.stringify({ ok: true, pong: Date.now() }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // Default Nginx Fake
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

import { connect } from 'cloudflare:sockets';
import { vlessOverWSHandler } from './vless.js';
import { trojanOverWSHandler } from './trojan.js';

let usersCache = null;
let usersCacheTime = 0;

async function getAllUsers(env) {
  if (usersCache && Date.now() - usersCacheTime < 60000) return usersCache;
  if (!env.MAIN_URL || !env.NODE_KEY) return [];
  
  try {
    const resp = await fetch(`${env.MAIN_URL}/api/node/users`, {
      headers: { "Authorization": `Bearer ${env.NODE_KEY}` }
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.users) {
        usersCache = data.users;
        usersCacheTime = Date.now();
        return usersCache;
      }
    }
  } catch (e) {
    console.error("Failed to fetch users from main:", e);
  }
  return usersCache || [];
}

let pendingUsage = [];
let usageTimeout = null;

function flushUsage(env) {
  if (pendingUsage.length === 0) return;
  if (!env.MAIN_URL || !env.NODE_KEY) return;
  
  const payload = [...pendingUsage];
  pendingUsage = [];
  
  fetch(`${env.MAIN_URL}/api/node/usage`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.NODE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usage: payload })
  }).catch(e => console.error("Failed to report usage:", e));
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (!env.MAIN_URL || !env.NODE_KEY) {
        return new Response("Node is not configured. Missing MAIN_URL or NODE_KEY.", { status: 500 });
      }

      if (path === '/') {
        return new Response("Penhan Node Active", { status: 200 });
      }
      
      // Node Health API
      if (path === '/node-health') {
        return new Response(JSON.stringify({ status: "active", type: "node" }), {
          status: 200, headers: { "Content-Type": "application/json" }
        });
      }

      // Forward Subscription Requests to Main
      if (path.endsWith('/sub')) {
        const subReq = new Request(env.MAIN_URL + path, request);
        return fetch(subReq);
      }

      const authenticate = async (identifier) => {
        const users = await getAllUsers(env);
        for (const user of users) {
           if (user.id === identifier) return user;
        }
        return null;
      };

      const onUsage = (userID, upload, download) => {
        let user = usersCache?.find(u => u.id === userID);
        if (!user) return true;
        
        user.used_bytes += (upload + download);
        pendingUsage.push({ id: userID, upload, download });
        
        if (!usageTimeout) {
          usageTimeout = setTimeout(() => {
            flushUsage(env);
            usageTimeout = null;
          }, 5000);
        }
        
        const now = Date.now();
        if (user.limit_bytes > 0 && user.used_bytes >= user.limit_bytes) return false;
        if (user.expiry_date > 0 && now > user.expiry_date) return false;
        return true;
      };

      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader === 'websocket') {
        const decodedPath = decodeURIComponent(path).toLowerCase();
        const effectiveProxyIP = env.PROXYIP || '';
        
        if (decodedPath.includes('trojan-ws') || decodedPath.includes('trojan')) {
          return await trojanOverWSHandler(request, authenticate, effectiveProxyIP, onUsage);
        } else {
          return await vlessOverWSHandler(request, authenticate, effectiveProxyIP, onUsage);
        }
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      console.error(err);
      return new Response("Internal Error", { status: 500 });
    }
  }
};

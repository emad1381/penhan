// src/index.js
import { connect as connect4 } from "cloudflare:sockets";

// src/helpers.js
import { connect } from "cloudflare:sockets";
var WS_READY_STATE_OPEN = 1;
var WS_READY_STATE_CLOSING = 2;
async function dohResolveA(name, doh = "https://cloudflare-dns.com/dns-query") {
  try {
    const resp = await fetch(`${doh}?name=${encodeURIComponent(name)}&type=A`, {
      headers: { accept: "application/dns-json" },
      cf: { cacheTtl: 60 }
    });
    if (!resp.ok)
      return [];
    const data = await resp.json();
    if (!data || !Array.isArray(data.Answer))
      return [];
    return data.Answer.filter((a) => a.type === 1 && a.data).map((a) => a.data.trim());
  } catch (e) {
    return [];
  }
}
async function fetchColoProxyIPs(domain, colo) {
  const d = String(domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  if (!d)
    return [];
  const out = [];
  if (colo) {
    const host = `${String(colo).toLowerCase()}.${d}`;
    out.push(...await dohResolveA(host));
  }
  if (out.length === 0)
    out.push(...await dohResolveA(d));
  return [...new Set(out)];
}
function parseProxyIps(proxyIpString) {
  if (!proxyIpString || typeof proxyIpString !== "string")
    return [];
  return proxyIpString.split(/[\r\n,;]+/).map((s) => {
    let trimmed = s.trim();
    const hashIdx = trimmed.indexOf("#");
    if (hashIdx > -1)
      trimmed = trimmed.substring(0, hashIdx).trim();
    const atIdx = trimmed.indexOf("@");
    if (atIdx > -1)
      trimmed = trimmed.substring(atIdx + 1).trim();
    return trimmed;
  }).filter((s) => s.length > 0);
}
function sha224_and_224(ascii, is224 = false) {
  const ch = (x, y, z) => x & y ^ ~x & z;
  const maj = (x, y, z) => x & y ^ x & z ^ y & z;
  const sigma0 = (x) => (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10);
  const sigma1 = (x) => (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7);
  const gamma0 = (x) => (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ x >>> 3;
  const gamma1 = (x) => (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ x >>> 10;
  const K = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ];
  let H = is224 ? [
    3238371032,
    914150663,
    812702999,
    4144912697,
    4290775857,
    1750603025,
    1694076839,
    3204075428
  ] : [
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ];
  const words = [];
  const len = ascii.length;
  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= (ascii.charCodeAt(i) & 255) << 24 - i % 4 * 8;
  }
  const bitLen = len * 8;
  words[bitLen >>> 5] |= 128 << 24 - bitLen % 32;
  const blockCount = (bitLen + 64 >>> 9) + 1 << 4;
  while (words.length < blockCount)
    words.push(0);
  words[blockCount - 2] = bitLen / 4294967296 | 0;
  words[blockCount - 1] = bitLen | 0;
  const W = new Int32Array(64);
  for (let blockIdx = 0; blockIdx < words.length; blockIdx += 16) {
    for (let i = 0; i < 16; i++)
      W[i] = words[blockIdx + i];
    for (let i = 16; i < 64; i++) {
      W[i] = gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16] | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      let t1 = h + sigma1(e) + ch(e, f, g) + K[i] + W[i] | 0;
      let t2 = sigma0(a) + maj(a, b, c) | 0;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H[0] = H[0] + a | 0;
    H[1] = H[1] + b | 0;
    H[2] = H[2] + c | 0;
    H[3] = H[3] + d | 0;
    H[4] = H[4] + e | 0;
    H[5] = H[5] + f | 0;
    H[6] = H[6] + g | 0;
    H[7] = H[7] + h | 0;
  }
  const toHex = (n) => {
    let s = (n >>> 0).toString(16);
    return "00000000".substring(s.length) + s;
  };
  const limit = is224 ? 7 : 8;
  let res = "";
  for (let i = 0; i < limit; i++) {
    res += toHex(H[i]);
  }
  return res;
}
function base64ToArrayBuffer(base64Str) {
  if (!base64Str) {
    return { error: null };
  }
  try {
    base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) {
    return { error };
  }
}
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!isValidUUID(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
function safeCloseWebSocket(socket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error("safeCloseWebSocket error", error);
  }
}
var activeConnections = /* @__PURE__ */ new Map();
function trackConnectionStart(userId, connLimit = 0) {
  if (!userId)
    return true;
  let conns = activeConnections.get(userId);
  if (!conns) {
    conns = /* @__PURE__ */ new Set();
    activeConnections.set(userId, conns);
  }
  if (connLimit > 0 && conns.size >= connLimit) {
    return false;
  }
  const connId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  conns.add(connId);
  return connId;
}
function trackConnectionEnd(userId, connId) {
  if (!userId || !connId)
    return;
  const conns = activeConnections.get(userId);
  if (conns) {
    conns.delete(connId);
    if (conns.size === 0)
      activeConnections.delete(userId);
  }
}
function getActiveConnectionCount(userId) {
  if (!userId)
    return 0;
  const conns = activeConnections.get(userId);
  return conns ? conns.size : 0;
}
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string")
    return false;
  if (a.length !== b.length)
    return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
async function isAuthed(request, pass) {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(/(?:^|;\s*)panel_auth=([^;]*)/);
  if (!match || !match[1])
    return false;
  const hashedPass = await hashPassword(pass);
  return timingSafeEqual(match[1], hashedPass);
}
async function checkMasterAuth(request, env, panelPass) {
  if (panelPass && await isAuthed(request, panelPass))
    return true;
  const authHeader = request.headers.get("Authorization");
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    const url = new URL(request.url);
    token = url.searchParams.get("token") || "";
  }
  if (!token)
    return false;
  if (panelPass && timingSafeEqual(token, panelPass))
    return true;
  try {
    if (env.DB) {
      const { results } = await env.DB.prepare("SELECT key FROM api_keys").all();
      if (results && results.some((r) => timingSafeEqual(r.key, token)))
        return true;
    }
  } catch (e) {
  }
  return false;
}
async function setupD1Schema(env) {
  if (!env.DB)
    return;
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
      );`
  ];
  for (const q of queries) {
    try {
      await env.DB.prepare(q).run();
    } catch (e) {
      console.error("D1 Schema setup error:", e);
    }
  }
}
async function getSettingD1(env, key) {
  if (!env.DB)
    return null;
  try {
    const { results } = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).all();
    return results.length > 0 ? results[0].value : null;
  } catch (e) {
    return null;
  }
}
async function setSettingD1(env, key, value) {
  if (!env.DB)
    return;
  try {
    await env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key, value).run();
  } catch (e) {
    console.error("Setting save error", e);
  }
}
async function updateUsageD1(env, uuid, bytes) {
  if (!env.DB || bytes === 0)
    return;
  try {
    await env.DB.prepare("UPDATE users SET used_bytes = used_bytes + ? WHERE id = ?").bind(bytes, uuid).run();
  } catch (e) {
    console.error("Usage update error", e);
  }
}

// src/vless.js
import { connect as connect2 } from "cloudflare:sockets";
async function handleUDPOutBound(webSocket, vlessResponseHeader, log) {
  let isVlessHeaderSent = false;
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      for (let index = 0; index < chunk.byteLength; ) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPacketLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPacketLength));
        index = index + 2 + udpPacketLength;
        controller.enqueue(udpData);
      }
    }
  });
  transformStream.readable.pipeTo(new WritableStream({
    async write(chunk) {
      const resp = await fetch("https://cloudflare-dns.com/dns-query", {
        method: "POST",
        headers: { "content-type": "application/dns-message" },
        body: chunk
      });
      const dnsQueryResult = await resp.arrayBuffer();
      const udpSize = dnsQueryResult.byteLength;
      const udpSizeBuffer = new Uint8Array([udpSize >> 8 & 255, udpSize & 255]);
      if (webSocket.readyState === WS_READY_STATE_OPEN) {
        log("doh success, dns message length: " + udpSize);
        if (isVlessHeaderSent || vlessResponseHeader.byteLength === 0) {
          webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
        } else {
          webSocket.send(await new Blob([vlessResponseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
          isVlessHeaderSent = true;
        }
      }
    }
  })).catch((error) => {
    log("dns udp has error: " + error);
  });
  const writer = transformStream.writable.getWriter();
  return { write(chunk) {
    writer.write(chunk);
  } };
}
function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log, onUpload) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel)
          return;
        if (onUpload) {
          const uploadOk = onUpload(event.data.byteLength || event.data.size || 0);
          if (!uploadOk) {
            controller.error(new Error("User limit exceeded during upload"));
            safeCloseWebSocket(webSocketServer);
            return;
          }
        }
        controller.enqueue(event.data);
      });
      webSocketServer.addEventListener("close", () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel)
          return;
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) {
        controller.error(error);
      } else if (earlyData) {
        controller.enqueue(earlyData);
      }
    },
    pull(controller) {
    },
    cancel(reason) {
      if (readableStreamCancel)
        return;
      log("ReadableStream was canceled, due to " + reason);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    }
  });
  return stream;
}
async function handleTCPOutBound(remoteSocketWrapper, userConnId, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, proxyIP, log, onDownload) {
  async function connectAndWrite(address, port) {
    const tcpSocket = connect2({ hostname: address, port });
    remoteSocketWrapper.value = tcpSocket;
    log("connected to " + address + ":" + port);
    const writer = tcpSocket.writable.getWriter();
    try {
      await writer.write(rawClientData);
    } catch (e) {
      log("write error: " + e.message);
      writer.releaseLock();
      throw e;
    }
    writer.releaseLock();
    tcpSocket.closed.catch((error) => {
      log("tcpSocket closed: " + error);
    }).finally(() => {
      remoteSocketWrapper.value = null;
    });
    return tcpSocket;
  }
  async function retryWithFallback() {
    const proxyIps = parseProxyIps(proxyIP);
    if (!proxyIps || proxyIps.length === 0) {
      log("no proxy IP configured, retry impossible");
      webSocket.close(1011, "Connection failed: no proxy IP");
      return;
    }
    log("retrying with " + proxyIps.length + " proxy IP(s)");
    const candidates = [];
    if (proxyIps.length > 0)
      candidates.push(proxyIps[0]);
    if (proxyIps.length > 1) {
      const pool = proxyIps.slice(1, 6);
      const shuffledPool = pool.sort(() => Math.random() - 0.5).slice(0, 2);
      shuffledPool.forEach((ip) => {
        if (!candidates.includes(ip))
          candidates.push(ip);
      });
    }
    for (let i = 0; i < candidates.length; i++) {
      const currentProxyIp = candidates[i];
      if (!currentProxyIp)
        continue;
      log(`retry attempt ${i + 1}/${candidates.length} with proxy: ${currentProxyIp}`);
      try {
        const tcpSocket = await connectAndWrite(currentProxyIp, portRemote);
        await remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log, onDownload);
        return;
      } catch (err) {
        log(`proxy ${currentProxyIp} failed: ${err.message || err}`);
        remoteSocketWrapper.value = null;
      }
    }
    log("all proxy IPs exhausted, closing connection");
    webSocket.close(1011, "All proxies failed");
  }
  try {
    const tcpSocket = await connectAndWrite(addressRemote, portRemote);
    await remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retryWithFallback, log, onDownload);
  } catch (error) {
    log("first connection attempt failed: " + error);
    if (proxyIP) {
      retryWithFallback();
    } else {
      webSocket.close(1011, "Connection failed: " + error);
    }
  }
}
async function remoteSocketToWS(remoteSocket, webSocket, vlessResponseHeader, retry, log, onDownload) {
  let vlessHeader = vlessResponseHeader;
  let hasIncomingData = false;
  try {
    await remoteSocket.readable.pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          hasIncomingData = true;
          if (webSocket.readyState !== WS_READY_STATE_OPEN) {
            controller.error("webSocket.readyState is not open, maybe close");
            return;
          }
          if (onDownload) {
            const downloadOk = onDownload(chunk.byteLength || chunk.size || 0);
            if (!downloadOk) {
              controller.error(new Error("User limit exceeded during download"));
              safeCloseWebSocket(webSocket);
              return;
            }
          }
          if (vlessHeader && vlessHeader.byteLength > 0) {
            webSocket.send(await new Blob([vlessHeader, chunk]).arrayBuffer());
            vlessHeader = null;
          } else {
            webSocket.send(chunk);
          }
        },
        close() {
          log("remoteConnection.readable is close with hasIncomingData is " + hasIncomingData);
        },
        abort(reason) {
          console.error("remoteConnection.readable abort", reason);
        }
      })
    );
  } catch (error) {
    console.error("remoteSocketToWS has exception", error.stack || error);
  }
  if (hasIncomingData === false && retry) {
    log("retry: no incoming data from target");
    retry();
  }
}
function processVlessHeader(vlessBuffer) {
  if (vlessBuffer.byteLength < 24) {
    return { hasError: true, message: "invalid data" };
  }
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isUDP = false;
  const userID = stringify(new Uint8Array(vlessBuffer.slice(1, 17)));
  const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];
  const command = new Uint8Array(vlessBuffer.slice(18 + optLength, 18 + optLength + 1))[0];
  if (command === 1) {
  } else if (command === 2) {
    isUDP = true;
  } else {
    return { hasError: true, message: "command " + command + " is not supported" };
  }
  const portIndex = 18 + optLength + 1;
  const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(vlessBuffer.slice(addressIndex, addressIndex + 1));
  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 2:
      addressLength = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3:
      addressLength = 16;
      const dataView = new DataView(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return { hasError: true, message: "invalid addressType is " + addressType };
  }
  if (!addressValue) {
    return { hasError: true, message: "addressValue is empty" };
  }
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType,
    portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    vlessVersion: version,
    isUDP,
    userID
  };
}
async function vlessOverWSHandler(request, authenticate, defaultProxyIP, onUsage) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);
  webSocket.accept();
  webSocket.binaryType = "arraybuffer";
  let currentSessionUpload = 0;
  let currentSessionDownload = 0;
  let activeUserID = null;
  let connTrackingId = null;
  const handleUpload = (bytes) => {
    currentSessionUpload += bytes;
    if (onUsage && activeUserID) {
      return onUsage(activeUserID, bytes, 0);
    }
    return true;
  };
  const handleDownload = (bytes) => {
    currentSessionDownload += bytes;
    if (onUsage && activeUserID) {
      return onUsage(activeUserID, 0, bytes);
    }
    return true;
  };
  let address = "";
  let portWithRandomLog = "";
  const log = (info, event) => {
    console.log("[VLESS WS " + address + ":" + portWithRandomLog + "] " + info, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";
  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log, handleUpload);
  let remoteSocketWrapper = { value: null };
  let udpStreamWrite = null;
  let isDns = false;
  let isHeaderParsed = false;
  readableWebSocketStream.pipeTo(new WritableStream({
    async write(chunk, controller) {
      if (isDns && udpStreamWrite) {
        return udpStreamWrite(chunk);
      }
      if (isHeaderParsed) {
        if (remoteSocketWrapper.value) {
          try {
            const writer = remoteSocketWrapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          } catch (err) {
            log("socket write error: " + err);
            controller.error(err);
            return;
          }
        } else {
          log("socket closed, aborting session");
          controller.error(new Error("socket already closed"));
          return;
        }
      }
      const {
        hasError,
        message,
        portRemote = 443,
        addressRemote = "",
        rawDataIndex,
        vlessVersion = new Uint8Array([0, 0]),
        isUDP,
        userID
      } = processVlessHeader(chunk);
      if (hasError) {
        log("header parse error: " + message);
        throw new Error(message);
      }
      const userObj = await authenticate(userID);
      if (!userObj || !userObj.enabled) {
        log("user auth failed or disabled");
        throw new Error("user not found or disabled");
      }
      activeUserID = userObj.id;
      const connLimit = userObj.conn_limit || 0;
      connTrackingId = trackConnectionStart(activeUserID, connLimit);
      if (connTrackingId === false) {
        log("connection limit exceeded for user");
        throw new Error("connection limit exceeded");
      }
      const proxyIP = userObj.proxy_ip || defaultProxyIP;
      address = addressRemote;
      portWithRandomLog = "" + portRemote + "--" + Math.random() + " " + (isUDP ? "udp" : "tcp");
      isHeaderParsed = true;
      if (isUDP) {
        isDns = true;
      }
      const vlessResponseHeader = new Uint8Array([vlessVersion[0], 0]);
      const rawClientData = chunk.slice(rawDataIndex);
      if (isDns) {
        const { write } = await handleUDPOutBound(webSocket, vlessResponseHeader, log);
        udpStreamWrite = write;
        udpStreamWrite(rawClientData);
        return;
      }
      handleTCPOutBound(remoteSocketWrapper, connTrackingId, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, proxyIP, log, handleDownload);
    },
    close() {
      log("readableWebSocketStream closed");
      if (activeUserID && connTrackingId) {
        trackConnectionEnd(activeUserID, connTrackingId);
      }
    },
    abort(reason) {
      log("readableWebSocketStream aborted", JSON.stringify(reason));
      if (activeUserID && connTrackingId) {
        trackConnectionEnd(activeUserID, connTrackingId);
      }
    }
  })).catch((err) => {
    log("pipeTo error", err);
    if (activeUserID && connTrackingId) {
      trackConnectionEnd(activeUserID, connTrackingId);
    }
    safeCloseWebSocket(webSocket);
  });
  return new Response(null, { status: 101, webSocket: client });
}

// src/trojan.js
import { connect as connect3 } from "cloudflare:sockets";
function processTrojanHeader(buffer, trojanPasswordHash) {
  if (buffer.byteLength < 56 + 2 + 1 + 1 + 2 + 2) {
    return { hasError: true, message: "invalid data length" };
  }
  const clientHash = new TextDecoder().decode(buffer.slice(0, 56));
  if (clientHash !== trojanPasswordHash) {
    return { hasError: true, message: "invalid password hash" };
  }
  const commandIndex = 56 + 2;
  const command = new Uint8Array(buffer.slice(commandIndex, commandIndex + 1))[0];
  let isUDP = false;
  if (command === 1) {
  } else if (command === 2) {
    isUDP = true;
  } else {
    return { hasError: true, message: "command " + command + " not supported" };
  }
  const addressTypeIndex = commandIndex + 1;
  const addressType = new Uint8Array(buffer.slice(addressTypeIndex, addressTypeIndex + 1))[0];
  let addressLength = 0;
  let addressValueIndex = addressTypeIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(buffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 3:
      addressLength = new Uint8Array(buffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(buffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 4:
      addressLength = 16;
      const dataView = new DataView(buffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return { hasError: true, message: "invalid address type: " + addressType };
  }
  const portIndex = addressValueIndex + addressLength;
  const portRemote = new DataView(buffer.slice(portIndex, portIndex + 2)).getUint16(0);
  const payloadIndex = portIndex + 2 + 2;
  return {
    hasError: false,
    addressRemote: addressValue,
    portRemote,
    rawDataIndex: payloadIndex,
    isUDP
  };
}
async function trojanOverWSHandler(request, authenticate, defaultProxyIP, onUsage) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);
  webSocket.accept();
  webSocket.binaryType = "arraybuffer";
  let currentSessionUpload = 0;
  let currentSessionDownload = 0;
  let activeUserID = null;
  let connTrackingId = null;
  const handleUpload = (bytes) => {
    currentSessionUpload += bytes;
    if (onUsage && activeUserID) {
      return onUsage(activeUserID, bytes, 0);
    }
    return true;
  };
  const handleDownload = (bytes) => {
    currentSessionDownload += bytes;
    if (onUsage && activeUserID) {
      return onUsage(activeUserID, 0, bytes);
    }
    return true;
  };
  let address = "";
  let portWithRandomLog = "";
  const log = (info, event) => {
    console.log("[Trojan WS " + address + ":" + portWithRandomLog + "] " + info, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";
  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log, handleUpload);
  let remoteSocketWrapper = { value: null };
  let udpStreamWrite = null;
  let isDns = false;
  let isHeaderParsed = false;
  readableWebSocketStream.pipeTo(new WritableStream({
    async write(chunk, controller) {
      if (isDns && udpStreamWrite) {
        return udpStreamWrite(chunk);
      }
      if (isHeaderParsed) {
        if (remoteSocketWrapper.value) {
          try {
            const writer = remoteSocketWrapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          } catch (err) {
            log("socket write error: " + err);
            controller.error(err);
            return;
          }
        } else {
          log("socket closed, aborting session");
          controller.error(new Error("socket already closed"));
          return;
        }
      }
      const clientHash = new TextDecoder().decode(chunk.slice(0, 56));
      const {
        hasError,
        message,
        portRemote = 443,
        addressRemote = "",
        rawDataIndex,
        isUDP
      } = processTrojanHeader(chunk, clientHash);
      if (hasError) {
        log("header parse error: " + message);
        throw new Error(message);
      }
      const userObj = await authenticate(clientHash);
      if (!userObj || !userObj.enabled) {
        log("user auth failed or disabled");
        throw new Error("user not found or disabled");
      }
      activeUserID = userObj.id;
      const connLimit = userObj.conn_limit || 0;
      connTrackingId = trackConnectionStart(activeUserID, connLimit);
      if (connTrackingId === false) {
        log("connection limit exceeded for user");
        throw new Error("connection limit exceeded");
      }
      const proxyIP = userObj.proxy_ip || defaultProxyIP;
      address = addressRemote;
      portWithRandomLog = "" + portRemote + "--" + Math.random() + " " + (isUDP ? "udp" : "tcp");
      isHeaderParsed = true;
      if (isUDP) {
        isDns = true;
      }
      const rawClientData = chunk.slice(rawDataIndex);
      if (isDns) {
        const { write } = await handleUDPOutBound(webSocket, new Uint8Array([]), log);
        udpStreamWrite = write;
        udpStreamWrite(rawClientData);
        return;
      }
      handleTCPOutBound(remoteSocketWrapper, connTrackingId, addressRemote, portRemote, rawClientData, webSocket, new Uint8Array([]), proxyIP, log, handleDownload);
    },
    close() {
      log("readableWebSocketStream closed");
      if (activeUserID && connTrackingId) {
        trackConnectionEnd(activeUserID, connTrackingId);
      }
    },
    abort(reason) {
      log("readableWebSocketStream aborted", JSON.stringify(reason));
      if (activeUserID && connTrackingId) {
        trackConnectionEnd(activeUserID, connTrackingId);
      }
    }
  })).catch((err) => {
    log("pipeTo error", err);
    if (activeUserID && connTrackingId) {
      trackConnectionEnd(activeUserID, connTrackingId);
    }
    safeCloseWebSocket(webSocket);
  });
  return new Response(null, { status: 101, webSocket: client });
}

// src/templates.js
function nginxPage() {
  return `<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');

html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto; font-family: Vazirmatn, Tahoma, sans-serif; }
</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js">
      function updateSelectionToolbar() {
        const toolbar = document.getElementById('proxyip-selection-toolbar');
        const countSpan = document.getElementById('proxyip-toolbar-count');
        if (!toolbar || !countSpan) return;
        
        const count = proxyIPSelectedRows.size;
        countSpan.textContent = count;
        if (count > 0) {
          toolbar.classList.add('show');
        } else {
          toolbar.classList.remove('show');
        }
      }

      function toggleProxyIPSelection(checkbox) {
        const key = checkbox.value;
        if (checkbox.checked) {
          proxyIPSelectedRows.add(key);
        } else {
          proxyIPSelectedRows.delete(key);
        }
        updateSelectionToolbar();
        const tr = checkbox.closest('tr');
        if (tr) {
          if (checkbox.checked) tr.classList.add('bg-primary/5');
          else tr.classList.remove('bg-primary/5');
        }
      }

      function toggleSelectAllProxyIP(checkbox) {
        const checkboxes = document.querySelectorAll('.proxyip-checkbox');
        checkboxes.forEach(cb => {
          cb.checked = checkbox.checked;
          const key = cb.value;
          if (checkbox.checked) {
            proxyIPSelectedRows.add(key);
          } else {
            proxyIPSelectedRows.delete(key);
          }
          const tr = cb.closest('tr');
          if (tr) {
            if (checkbox.checked) tr.classList.add('bg-primary/5');
            else tr.classList.remove('bg-primary/5');
          }
        });
        updateSelectionToolbar();
      }

  <\/script>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>
<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>
<p><em>Thank you for using nginx.</em></p>
</body>
</html>`;
}
function loginPage(uuid, host) {
  return `<!DOCTYPE html>
<html class="dark" dir="rtl" lang="fa"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>\u067E\u0646\u0647\u0627\u0646 | \u0648\u0631\u0648\u062F \u0628\u0647 \u0633\u0627\u0645\u0627\u0646\u0647</title>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Vazirmatn & Plus Jakarta Sans -->
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "secondary": "#ffb0cd",
                    "on-primary": "#490080",
                    "primary-fixed": "#f0dbff",
                    "inverse-surface": "#e4e1ea",
                    "on-primary-fixed-variant": "#6900b3",
                    "surface-container": "#1f1f26",
                    "primary-container": "#b76dff",
                    "background": "#131319",
                    "surface": "#131319",
                    "on-surface-variant": "#cfc2d6",
                    "on-secondary-fixed": "#3e0022",
                    "tertiary-fixed": "#6ffbbe",
                    "secondary-fixed-dim": "#ffb0cd",
                    "inverse-on-surface": "#303037",
                    "on-background": "#e4e1ea",
                    "surface-tint": "#ddb7ff",
                    "on-tertiary-container": "#00311f",
                    "surface-variant": "#35343b",
                    "on-tertiary-fixed": "#002113",
                    "tertiary-fixed-dim": "#4edea3",
                    "on-error-container": "#ffdad6",
                    "secondary-fixed": "#ffd9e4",
                    "surface-container-lowest": "#0e0e14",
                    "surface-container-low": "#1b1b22",
                    "on-secondary": "#640039",
                    "on-surface": "#e4e1ea",
                    "on-secondary-fixed-variant": "#8c0053",
                    "primary": "#ddb7ff",
                    "inverse-primary": "#842bd2",
                    "on-tertiary-fixed-variant": "#005236",
                    "on-primary-container": "#400071",
                    "outline": "#988d9f",
                    "outline-variant": "#4d4354",
                    "surface-dim": "#131319",
                    "error-container": "#93000a",
                    "on-error": "#690005",
                    "tertiary": "#4edea3",
                    "error": "#ffb4ab",
                    "on-secondary-container": "#ffbad3",
                    "tertiary-container": "#00a572",
                    "surface-bright": "#393840",
                    "on-tertiary": "#003824",
                    "primary-fixed-dim": "#ddb7ff"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "fontFamily": {
                    "vazir": ["Vazirmatn", "sans-serif"],
                    "headline-lg": ["Plus Jakarta Sans", "Vazirmatn"],
                    "headline-md": ["Plus Jakarta Sans", "Vazirmatn"],
                    "body-lg": ["Inter", "Vazirmatn"],
                    "label-md": ["Geist", "Vazirmatn"],
                    "display-lg": ["Plus Jakarta Sans", "Vazirmatn"]
            },
            "fontSize": {
                    "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
                    "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
                    "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "label-md": ["14px", {"lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "500"}],
                    "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}]
            }
          },
        },
      }
    <\/script>
<style>
        body {
            background-color: #131319;
            margin: 0;
            overflow: hidden;
            font-family: 'Vazirmatn', sans-serif;
        }
        
        .glass-panel {
            background: rgba(25, 25, 32, 0.6);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
        }

        .neon-glow-primary {
            box-shadow: 0 0 20px rgba(221, 183, 255, 0.2);
        }

        .neon-glow-error {
            box-shadow: 0 0 30px rgba(255, 180, 171, 0.3);
        }

        .input-focus-effect:focus-within .lock-icon {
            color: #ddb7ff;
            filter: drop-shadow(0 0 8px rgba(221, 183, 255, 0.8));
            transition: all 0.3s ease;
        }

        @keyframes pulse-loading {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(0.98); }
        }

        .loading-pulse {
            animation: pulse-loading 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        .shake-error {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddb7ff; border-radius: 10px; }
    </style>
</head>
<body class="bg-background text-on-background flex items-center justify-center h-screen w-screen relative overflow-hidden">
<!-- Full Screen Background Shader -->
<div class="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-60" style="display:block;">
<canvas id="shader-canvas-ANIMATION_2" style="display:block;width:100%;height:100%"></canvas>
<script>
(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_2');

  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = \`attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
  const fs = \`precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    vec2 p1 = vec2(0.5 + 0.3 * sin(u_time * 0.4), 0.5 + 0.2 * cos(u_time * 0.5));
    vec2 p2 = vec2(0.3 + 0.2 * cos(u_time * 0.3), 0.7 + 0.1 * sin(u_time * 0.6));
    vec2 p3 = vec2(0.7 + 0.2 * sin(u_time * 0.5), 0.3 + 0.2 * cos(u_time * 0.4));
    
    vec3 col1 = vec3(0.658, 0.333, 0.968); // #a855f7 (Purple)
    vec3 col2 = vec3(0.925, 0.282, 0.6);   // #ec4899 (Pink/Magenta)
    vec3 col3 = vec3(0.062, 0.725, 0.505); // #10b981 (Cyan/Emerald)
    
    float d1 = length(uv - p1);
    float d2 = length(uv - p2);
    float d3 = length(uv - p3);
    
    float f1 = 0.5 / (1.0 + d1 * 5.0);
    float f2 = 0.5 / (1.0 + d2 * 4.0);
    float f3 = 0.5 / (1.0 + d3 * 6.0);
    
    vec3 aurora = (col1 * f1 + col2 * f2 + col3 * f3) * 0.4;
    vec3 bg = vec3(0.02, 0.02, 0.04); // Deep dark background
    
    gl_FragColor = vec4(bg + aurora, 1.0);
}\`;
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // requestAnimationFrame(render); // Disabled for performance
  }
  render(0);
})();
<\/script>
</div>
<!-- Main Content Canvas -->
<main class="relative z-10 w-full max-w-md px-6">
<!-- Login Card -->
<div class="glass-panel p-10 rounded-[2rem] flex flex-col items-center gap-8 transition-all duration-500 hover:border-white/20">
<!-- Branding -->
<div class="text-center">
<h1 class="font-display-lg text-display-lg text-primary tracking-tighter mb-2">\u067E\u0646\u0647\u0627\u0646</h1>
<p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-60">Penhan \u2022 Deep Space Command</p>
</div>
<!-- Form -->
<form class="w-full space-y-6" id="loginForm">
<!-- Password with Glowing Icon -->
<div class="space-y-2 input-focus-effect">
<label class="font-label-md text-label-md text-on-surface-variant mr-1 block">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067E\u0646\u0644</label>
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute right-4 text-on-surface-variant/50 lock-icon transition-all duration-300" data-icon="lock">lock</span>
<input class="w-full bg-white/5 border border-white/10 rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-body-md font-body-md" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" type="password" id="passInput" autofocus autocomplete="current-password"/>
</div>
</div>
<!-- Action Button -->
<button class="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl neon-glow-primary hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3" type="submit" id="loginBtn">
<span>\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0644 \u0641\u0631\u0645\u0627\u0646\u062F\u0647\u06CC</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">arrow_back</span>
</button>
</form>
</div>
<!-- Footer Decoration -->
<div class="mt-8 text-center">
<p class="font-label-md text-label-md text-on-surface-variant opacity-30">ENCRYPTED END-TO-END CONNECTION ESTABLISHED</p>
</div>
</main>
<!-- Floating Toast Notification -->
<div class="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-0 translate-y-[-20px] transition-all duration-500" id="toast">
<div class="glass-panel border-error/30 neon-glow-error shake-error px-6 py-4 rounded-full flex items-center gap-4 text-error">
<span class="material-symbols-outlined">error</span>
<span class="font-body-md text-body-md font-bold" id="toast-text">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A</span>
</div>
</div>
<!-- Interaction Script -->
<script>
    const path = window.location.pathname;
    const bp = path.endsWith('/panel-login') ? path.slice(0, -12) : (path.endsWith('/') ? path.slice(0, -1) : path);

    async function doLogin() {
      const input = document.getElementById('passInput');
      const p = input.value.trim();
      const btn = document.getElementById('loginBtn');

      if (!p) {
        showToast('\u274C \u0644\u0637\u0641\u0627\u064B \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F', 'error');
        return;
      }

      btn.innerHTML = \`<div class="w-6 h-6 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>\`;
      btn.classList.add('loading-pulse');
      btn.disabled = true;

      try {
        const r = await fetch(bp + '/panel-auth', {
          method: 'POST',
          body: p
        });
        const d = await r.json();
        if (d.ok) {
          window.location.href = bp;
        } else {
          showToast('\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A', 'error');
          input.value = '';
          input.focus();
        }
      } catch (e) {
        showToast('\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631', 'error');
      } finally {
        btn.innerHTML = \`<span>\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0644 \u0641\u0631\u0645\u0627\u0646\u062F\u0647\u06CC</span><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">arrow_back</span>\`;
        btn.classList.remove('loading-pulse');
        btn.disabled = false;
      }
    }

    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      doLogin();
    });

    function showToast(msg, type) {
      const toast = document.getElementById('toast');
      const toastText = document.getElementById('toast-text');
      toastText.textContent = msg;
      
      toast.classList.remove('opacity-0', 'translate-y-[-20px]');
      toast.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-20px]');
        toast.classList.remove('opacity-100', 'translate-y-0');
      }, 3500);
    }
  <\/script>
</body>
</html>`;
}
function setupPage(hasD1, hasPassword, hasUUID, currentUUID, currentProxyIP) {
  const allGood = hasD1 && hasPassword && hasUUID;
  const dbBadge = hasD1 ? `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
      <span class="status-dot bg-tertiary status-pulse"></span>
      <span class="text-tertiary text-sm font-bold">\u0645\u062A\u0635\u0644</span>
    </div>` : `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/30">
      <span class="status-dot bg-error status-pulse" style="animation-name: pulse-red;"></span>
      <span class="text-error text-sm font-bold">\u0642\u0637\u0639 \u0627\u062A\u0635\u0627\u0644</span>
    </div>`;
  const passBadge = hasPassword ? `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
      <span class="status-dot bg-tertiary status-pulse"></span>
      <span class="text-tertiary text-sm font-bold">\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647</span>
    </div>` : `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/30">
      <span class="status-dot bg-error status-pulse" style="animation-name: pulse-red;"></span>
      <span class="text-error text-sm font-bold">\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647</span>
    </div>`;
  const uuidBadge = hasUUID ? `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
      <span class="status-dot bg-tertiary status-pulse"></span>
      <span class="text-tertiary text-sm font-bold">\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647</span>
    </div>` : `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/30">
      <span class="status-dot bg-error status-pulse" style="animation-name: pulse-red;"></span>
      <span class="text-error text-sm font-bold">\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647</span>
    </div>`;
  const proxyIPBadge = currentProxyIP ? `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
      <span class="status-dot bg-tertiary status-pulse"></span>
      <span class="text-tertiary text-sm font-bold">\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647</span>
    </div>` : `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30">
      <span class="status-dot bg-secondary status-pulse-amber"></span>
      <span class="text-secondary text-sm font-bold">\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC</span>
    </div>`;
  return `<!DOCTYPE html>
<html class="dark" dir="rtl" lang="fa"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>\u067E\u0646\u0647\u0627\u0646 | \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0627\u0648\u0644\u06CC\u0647</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&amp;family=Inter:wght@100..900&amp;family=Plus+Jakarta+Sans:wght@100..900&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            font-family: 'Vazirmatn', sans-serif;
            background-color: #131319;
            overflow: hidden;
        }
        .glass-card {
            backdrop-filter: blur(24px);
            background: rgba(31, 31, 38, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0, 0, 0, 0.5);
        }
        .neon-glow-purple {
            box-shadow: 0 0 20px rgba(221, 183, 255, 0.3);
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .status-pulse {
            animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
            0% { box-shadow: 0 0 0 0px rgba(78, 222, 163, 0.4); }
            100% { box-shadow: 0 0 0 10px rgba(78, 222, 163, 0); }
        }
        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0px rgba(255, 180, 171, 0.4); }
            100% { box-shadow: 0 0 0 10px rgba(255, 180, 171, 0); }
        }
        .status-pulse-amber {
            animation: pulse-amber 2s infinite;
        }
        @keyframes pulse-amber {
            0% { box-shadow: 0 0 0 0px rgba(255, 176, 205, 0.4); }
            100% { box-shadow: 0 0 0 10px rgba(255, 176, 205, 0); }
        }
        .slide-up-btn {
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .slide-up-btn:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(170, 2, 102, 0.4);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "secondary": "#ffb0cd",
                      "on-primary": "#490080",
                      "primary-fixed": "#f0dbff",
                      "inverse-surface": "#e4e1ea",
                      "on-primary-fixed-variant": "#6900b3",
                      "surface-container": "#1f1f26",
                      "primary-container": "#b76dff",
                      "background": "#131319",
                      "surface": "#131319",
                      "on-surface-variant": "#cfc2d6",
                      "on-secondary-fixed": "#3e0022",
                      "tertiary-fixed": "#6ffbbe",
                      "secondary-fixed-dim": "#ffb0cd",
                      "inverse-on-surface": "#303037",
                      "on-background": "#e4e1ea",
                      "surface-tint": "#ddb7ff",
                      "on-tertiary-container": "#00311f",
                      "surface-variant": "#35343b",
                      "on-tertiary-fixed": "#002113",
                      "tertiary-fixed-dim": "#4edea3",
                      "on-error-container": "#ffdad6",
                      "secondary-fixed": "#ffd9e4",
                      "surface-container-lowest": "#0e0e14",
                      "surface-container-low": "#1b1b22",
                      "on-secondary": "#640039",
                      "on-surface": "#e4e1ea",
                      "on-secondary-fixed-variant": "#8c0053",
                      "primary": "#ddb7ff",
                      "inverse-primary": "#842bd2",
                      "on-tertiary-fixed-variant": "#005236",
                      "on-primary-container": "#400071",
                      "outline": "#988d9f",
                      "outline-variant": "#4d4354",
                      "surface-dim": "#131319",
                      "error-container": "#93000a",
                      "on-error": "#690005",
                      "tertiary": "#4edea3",
                      "error": "#ffb4ab",
                      "on-secondary-container": "#ffbad3",
                      "tertiary-container": "#00a572",
                      "surface-bright": "#393840",
                      "on-tertiary": "#003824",
                      "primary-fixed-dim": "#ddb7ff"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "gutter": "1.5rem",
                      "container_padding": "2rem",
                      "stack_xs": "0.5rem",
                      "stack_md": "1rem",
                      "stack_lg": "2rem",
                      "sidebar_width": "280px"
              },
              "fontFamily": {
                      "headline-lg": ["Plus Jakarta Sans"],
                      "headline-md": ["Plus Jakarta Sans"],
                      "body-lg": ["Inter"],
                      "label-md": ["Geist"],
                      "code-sm": ["JetBrains Mono"],
                      "headline-lg-mobile": ["Plus Jakarta Sans"],
                      "body-md": ["Inter"],
                      "display-lg": ["Plus Jakarta Sans"]
              },
              "fontSize": {
                      "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
                      "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
                      "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                      "label-md": ["14px", {"lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "500"}],
                      "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                      "headline-lg-mobile": ["28px", {"lineHeight": "1.2", "fontWeight": "700"}],
                      "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                      "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}]
              }
            },
          },
        }
    <\/script>
</head>
<body class="flex items-center justify-center min-h-screen p-6 relative overflow-hidden">
<!-- Background Shader -->
<div class="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-60" style="display:block;">
<canvas id="shader-canvas-ANIMATION_2" style="display:block;width:100%;height:100%"></canvas>
<script>
(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_2');

  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = \`attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
  const fs = \`precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    vec2 p1 = vec2(0.5 + 0.3 * sin(u_time * 0.4), 0.5 + 0.2 * cos(u_time * 0.5));
    vec2 p2 = vec2(0.3 + 0.2 * cos(u_time * 0.3), 0.7 + 0.1 * sin(u_time * 0.6));
    vec2 p3 = vec2(0.7 + 0.2 * sin(u_time * 0.5), 0.3 + 0.2 * cos(u_time * 0.4));
    
    vec3 col1 = vec3(0.658, 0.333, 0.968); // #a855f7 (Purple)
    vec3 col2 = vec3(0.925, 0.282, 0.6);   // #ec4899 (Pink/Magenta)
    vec3 col3 = vec3(0.062, 0.725, 0.505); // #10b981 (Cyan/Emerald)
    
    float d1 = length(uv - p1);
    float d2 = length(uv - p2);
    float d3 = length(uv - p3);
    
    float f1 = 0.5 / (1.0 + d1 * 5.0);
    float f2 = 0.5 / (1.0 + d2 * 4.0);
    float f3 = 0.5 / (1.0 + d3 * 6.0);
    
    vec3 aurora = (col1 * f1 + col2 * f2 + col3 * f3) * 0.4;
    vec3 bg = vec3(0.02, 0.02, 0.04); // Deep dark background
    
    gl_FragColor = vec4(bg + aurora, 1.0);
}\`;
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // requestAnimationFrame(render); // Disabled for performance
  }
  render(0);
})();
<\/script>
</div>
<!-- Content Wrapper -->
<main class="relative z-10 w-full max-w-xl">
<div class="glass-card rounded-[2rem] p-10 md:p-14 overflow-hidden relative">
<!-- Branding Header -->
<div class="flex flex-col items-center mb-10 text-center">
<div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary-container p-[1px] mb-6 shadow-2xl">
<div class="w-full h-full bg-background rounded-2xl flex items-center justify-center">
<span class="material-symbols-outlined text-4xl text-primary" data-icon="rocket_launch">rocket_launch</span>
</div>
</div>
<h1 class="text-on-surface font-bold text-3xl mb-2">\u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0627\u0648\u0644\u06CC\u0647 \u0633\u06CC\u0633\u062A\u0645</h1>
<p class="text-on-surface-variant font-label-md text-label-md opacity-70">Deep Space Command - Initial System Setup</p>
</div>
<!-- Setup Status List -->
<div class="space-y-4 mb-12">
<!-- Database Item -->
<div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-tertiary" data-icon="database">database</span>
</div>
<span class="text-on-surface font-medium">\u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 D1 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 (Cloudflare D1)</span>
</div>
${dbBadge}
</div>
<!-- Password Item -->
<div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-tertiary" data-icon="lock">lock</span>
</div>
<span class="text-on-surface font-medium">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067E\u0646\u0644 (Panel Password)</span>
</div>
${passBadge}
</div>
<!-- Admin UUID Item -->
<div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-tertiary" data-icon="fingerprint">fingerprint</span>
</div>
<span class="text-on-surface font-medium">\u0634\u0646\u0627\u0633\u0647 \u0627\u062F\u0645\u06CC\u0646 (Admin UUID)</span>
</div>
${uuidBadge}
</div>
<!-- Proxy IP Item -->
<div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-secondary" data-icon="settings_ethernet">settings_ethernet</span>
</div>
<span class="text-on-surface font-medium opacity-60">\u0622\u06CC\u200C\u067E\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC (Proxy IP)</span>
</div>
${proxyIPBadge}
</div>
</div>
<!-- Footer Action -->
<div class="pt-6 border-t border-white/10">
${allGood ? `
<button class="slide-up-btn w-full bg-gradient-to-l from-primary-container to-secondary-container text-on-primary-container font-bold py-4 rounded-2xl flex items-center justify-center gap-3 group" onclick="window.location.href='/panel'">
<span>\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A</span>
<span class="material-symbols-outlined group-hover:translate-x-[-4px] transition-transform" data-icon="arrow_back">arrow_back</span>
</button>
` : `
<div class="text-center py-4 px-6 rounded-xl bg-error/5 border border-error/20 text-error text-sm font-medium">
  \u26A0\uFE0F \u062A\u0627 \u0632\u0645\u0627\u0646\u06CC \u06A9\u0647 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 D1 \u0648 \u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC \u0628\u0627\u0644\u0627 \u0631\u0627 \u0628\u0647 \u062F\u0631\u0633\u062A\u06CC \u062A\u0646\u0638\u06CC\u0645 \u0646\u06A9\u0646\u06CC\u062F\u060C \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0642\u0627\u0628\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u062E\u0648\u0627\u0647\u062F \u0628\u0648\u062F.
</div>
`}
<div class="mt-8 flex justify-center items-center gap-6 text-on-surface-variant opacity-40 text-xs">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-base" data-icon="verified_user">verified_user</span>
<span>Secure Connection</span>
</div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-base" data-icon="shield">shield</span>
<span>Orbit Guard Active</span>
</div>
</div>
</div>
<!-- Atmospheric Glows -->
<div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]"></div>
<div class="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-[80px]"></div>
</div>
<!-- Footer Meta -->
<p class="text-center mt-8 text-on-surface-variant/40 text-xs font-label-md tracking-widest">
            PENHAN DEEP SPACE COMMAND \xA9 2026 \u2022 SYSTEM INITIALIZATION COMPLETE
        </p>
</main>
<script>
        // Micro-interactions for button and status items
        const btn = document.querySelector('.slide-up-btn');
        if (btn) {
          btn.addEventListener('mousedown', function() {
              this.style.transform = 'scale(0.98)';
          });
          btn.addEventListener('mouseup', function() {
              this.style.transform = 'scale(1) translateY(-4px)';
          });
        }

        // Add subtle hover effect to cards
        const items = document.querySelectorAll('.space-y-4 > div');
        items.forEach(el => {
          el.addEventListener('mouseenter', () => {
            el.style.transform = 'translateY(-2px)';
            el.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'translateY(0)';
            el.style.borderColor = 'rgba(255, 255, 255, 0.05)';
          });
        });
      <\/script>
    </body>
    </html>`;
}
function subscriptionPage(hostname, user, vlessWS, trojanWS) {
  if (typeof user === "string") {
    user = { id: user, name: "\u06A9\u0627\u0631\u0628\u0631 \u0628\u062F\u0648\u0646 \u0646\u0627\u0645", limit_bytes: 0, used_bytes: 0, enabled: true, expiry_date: 0 };
  }
  const subLink = `https://${hostname}/${user.id}/sub`;
  const name = user.name || "\u06A9\u0627\u0631\u0628\u0631 \u0628\u062F\u0648\u0646 \u0646\u0627\u0645";
  const limit = user.limit_bytes || 0;
  const used = user.used_bytes || 0;
  let percent = 0;
  let usageText = "\u0646\u0627\u0645\u062D\u062F\u0648\u062F";
  const formatBytes = (b) => {
    if (b < 1024)
      return b + " B";
    if (b < 1024 * 1024)
      return (b / 1024).toFixed(1) + " KB";
    if (b < 1024 * 1024 * 1024)
      return (b / (1024 * 1024)).toFixed(1) + " MB";
    return (b / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };
  if (limit > 0) {
    percent = Math.min(100, Math.round(used / limit * 100));
    usageText = `${formatBytes(used)} / ${formatBytes(limit)}`;
  } else {
    usageText = `${formatBytes(used)} (\u0628\u062F\u0648\u0646 \u0633\u0642\u0641)`;
  }
  let expiryAbsolute = "\u0646\u0627\u0645\u062D\u062F\u0648\u062F";
  let expiryRelative = "\u221E";
  let expiryPercent = 100;
  if (user.expiry_date > 0) {
    const d = new Date(user.expiry_date);
    const pad = (n) => n.toString().padStart(2, "0");
    expiryAbsolute = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const diff = user.expiry_date - Date.now();
    if (diff < 0) {
      expiryRelative = "\u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647";
      expiryPercent = 0;
    } else {
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
      if (days > 0) {
        expiryRelative = `${days} \u0631\u0648\u0632 \u0648 ${hours} \u0633\u0627\u0639\u062A \u062F\u06CC\u06AF\u0631`;
      } else {
        expiryRelative = `${hours} \u0633\u0627\u0639\u062A \u062F\u06CC\u06AF\u0631`;
      }
      expiryPercent = Math.min(100, Math.round(diff / (30 * 24 * 60 * 60 * 1e3) * 100));
    }
  }
  let statusClass = "active";
  let statusText = "\u0641\u0639\u0627\u0644";
  let statusColorClass = "from-tertiary to-transparent";
  let statusBadgeClass = "bg-tertiary text-on-tertiary neon-glow-success";
  if (!user.enabled) {
    statusClass = "banned";
    statusText = "\u0645\u0633\u062F\u0648\u062F \u0634\u062F\u0647";
    statusColorClass = "from-error to-transparent";
    statusBadgeClass = "bg-error text-on-error neon-glow-error";
  } else if (limit > 0 && used >= limit) {
    statusClass = "disabled";
    statusText = "\u067E\u0627\u06CC\u0627\u0646 \u062D\u062C\u0645";
    statusColorClass = "from-secondary to-transparent";
    statusBadgeClass = "bg-secondary text-on-secondary neon-glow-error";
  } else if (user.expiry_date > 0 && Date.now() > user.expiry_date) {
    statusClass = "disabled";
    statusText = "\u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647";
    statusColorClass = "from-secondary to-transparent";
    statusBadgeClass = "bg-secondary text-on-secondary neon-glow-error";
  }
  return `<!DOCTYPE html>
<html class="dark" dir="rtl" lang="fa"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>\u067E\u0646\u0647\u0627\u0646 | \u067E\u0646\u0644 \u06A9\u0627\u0631\u0628\u0631\u06CC - ${name}</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"><\/script>
<style>
        body {
            font-family: 'Vazirmatn', sans-serif;
            background-color: #131319;
            overflow-x: hidden;
            color: #e4e1ea;
        }

        .glass-panel {
            background: rgba(31, 31, 38, 0.3);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .glass-panel:hover {
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 20px rgba(221, 183, 255, 0.1);
        }

        .neon-glow-primary {
            box-shadow: 0 0 15px rgba(221, 183, 255, 0.4);
        }

        .neon-glow-success {
            box-shadow: 0 0 15px rgba(78, 222, 163, 0.4);
        }

        .neon-glow-error {
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }

        .status-ring {
            position: relative;
        }

        .status-ring::before {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid ${statusClass === "active" ? "#4edea3" : "#ffb4ab"};
            animation: pulse-ring 2s infinite;
        }

        @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 0.4; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ddb7ff;
            border-radius: 10px;
        }
        
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .farsi-nums {
            font-feature-settings: "ss01", "ss02", "ss03", "ss04";
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "secondary": "#ffb0cd",
                      "on-primary": "#490080",
                      "primary-fixed": "#f0dbff",
                      "inverse-surface": "#e4e1ea",
                      "on-primary-fixed-variant": "#6900b3",
                      "surface-container": "#1f1f26",
                      "primary-container": "#b76dff",
                      "background": "#131319",
                      "surface": "#131319",
                      "on-surface-variant": "#cfc2d6",
                      "on-secondary-fixed": "#3e0022",
                      "tertiary-fixed": "#6ffbbe",
                      "secondary-fixed-dim": "#ffb0cd",
                      "inverse-on-surface": "#303037",
                      "on-background": "#e4e1ea",
                      "surface-tint": "#ddb7ff",
                      "on-tertiary-container": "#00311f",
                      "surface-variant": "#35343b",
                      "on-tertiary-fixed": "#002113",
                      "tertiary-fixed-dim": "#4edea3",
                      "on-error-container": "#ffdad6",
                      "secondary-fixed": "#ffd9e4",
                      "surface-container-lowest": "#0e0e14",
                      "surface-container-low": "#1b1b22",
                      "on-secondary": "#640039",
                      "on-surface": "#e4e1ea",
                      "on-secondary-fixed-variant": "#8c0053",
                      "primary": "#ddb7ff",
                      "inverse-primary": "#842bd2",
                      "on-tertiary-fixed-variant": "#005236",
                      "on-primary-container": "#400071",
                      "outline": "#988d9f",
                      "surface-container-highest": "#35343b",
                      "surface-container-high": "#2a2930",
                      "on-primary-fixed": "#2c0051",
                      "secondary-container": "#aa0266",
                      "outline-variant": "#4d4354",
                      "surface-dim": "#131319",
                      "error-container": "#93000a",
                      "on-error": "#690005",
                      "tertiary": "#4edea3",
                      "error": "#ffb4ab",
                      "on-secondary-container": "#ffbad3",
                      "tertiary-container": "#00a572",
                      "surface-bright": "#393840",
                      "on-tertiary": "#003824",
                      "primary-fixed-dim": "#ddb7ff"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "gutter": "1.5rem",
                      "container_padding": "2rem",
                      "stack_xs": "0.5rem",
                      "stack_md": "1rem",
                      "stack_lg": "2rem",
                      "sidebar_width": "280px"
              },
              "fontFamily": {
                      "headline-lg": ["Plus Jakarta Sans", "Vazirmatn"],
                      "headline-md": ["Plus Jakarta Sans", "Vazirmatn"],
                      "body-lg": ["Inter", "Vazirmatn"],
                      "label-md": ["Geist", "Vazirmatn"],
                      "code-sm": ["JetBrains Mono"],
                      "headline-lg-mobile": ["Plus Jakarta Sans", "Vazirmatn"],
                      "body-md": ["Inter", "Vazirmatn"],
                      "display-lg": ["Plus Jakarta Sans", "Vazirmatn"]
              }
            }
          }
        }
    <\/script>
</head>
<body class="min-h-screen relative overflow-y-auto custom-scrollbar">
<!-- Background Shader -->
<div class="fixed inset-0 w-full h-full -z-10 opacity-60" style="display:block;">
<canvas id="shader-canvas-ANIMATION_2" style="display:block;width:100%;height:100%"></canvas>
<script>
(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_2');

  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = \`attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
  const fs = \`precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    vec2 p1 = vec2(0.5 + 0.3 * sin(u_time * 0.4), 0.5 + 0.2 * cos(u_time * 0.5));
    vec2 p2 = vec2(0.3 + 0.2 * cos(u_time * 0.3), 0.7 + 0.1 * sin(u_time * 0.6));
    vec2 p3 = vec2(0.7 + 0.2 * sin(u_time * 0.5), 0.3 + 0.2 * cos(u_time * 0.4));
    
    vec3 col1 = vec3(0.658, 0.333, 0.968); // #a855f7 (Purple)
    vec3 col2 = vec3(0.925, 0.282, 0.6);   // #ec4899 (Pink/Magenta)
    vec3 col3 = vec3(0.062, 0.725, 0.505); // #10b981 (Cyan/Emerald)
    
    float d1 = length(uv - p1);
    float d2 = length(uv - p2);
    float d3 = length(uv - p3);
    
    float f1 = 0.5 / (1.0 + d1 * 5.0);
    float f2 = 0.5 / (1.0 + d2 * 4.0);
    float f3 = 0.5 / (1.0 + d3 * 6.0);
    
    vec3 aurora = (col1 * f1 + col2 * f2 + col3 * f3) * 0.4;
    vec3 bg = vec3(0.02, 0.02, 0.04); // Deep dark background
    
    gl_FragColor = vec4(bg + aurora, 1.0);
}\`;
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // requestAnimationFrame(render); // Disabled for performance
  }
  render(0);
})();
<\/script>
</div>
<!-- Top Bar -->
<header class="w-full h-20 px-gutter flex items-center justify-between sticky top-0 z-50 bg-background/20 backdrop-blur-md">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center neon-glow-primary">
<span class="material-symbols-outlined text-on-primary-container">rocket_launch</span>
</div>
<div>
<h1 class="text-primary font-headline-md text-2xl tracking-tight leading-tight">Penhan</h1>
<p class="text-on-surface-variant text-xs opacity-70">Deep Space Command</p>
</div>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10">
<span class="text-on-surface font-label-md text-sm">${name}</span>
<div class="w-8 h-8 rounded-full overflow-hidden status-ring">
<img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXf8jzSr96FLJnNWvAqy1fiCKEkfkTdZCGRRnoGFf969YMhPV7MUJQxyWGmfkRe0ktEbIs2Dp-x11qSalOOgvZNQagYgWOGMrhs1H9_ZwzpYKi3gnjFbZp7t_yQQCV3OJ26XL51SwddJ3bViwjJxEsWbuce4-x_ehnPOlK0NC_smWBdkFwxmxyCla3hxV_Ew_7N6pXOhMHfkibcIZCqge7abGrGqaJZKiqPT1LCf0BIsx1pl1YOMiO2lsNL4ryBrPqhrpZZMnJbw"/>
</div>
</div>
</div>
</header>
<main class="container mx-auto px-gutter py-8 max-w-6xl">
<!-- Top Section: Bento Grid -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
<!-- User Status Card -->
<div class="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
<div class="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/10 rounded-full blur-3xl group-hover:bg-tertiary/20 transition-all"></div>
<div class="relative mb-6">
<div class="w-32 h-32 rounded-full p-1 bg-gradient-to-tr ${statusColorClass} status-ring">
<img class="w-full h-full rounded-full object-cover border-4 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlvFEDkTAEU64SUSLm2Lh497mtd01iowj2c4VSPh2wR1Q3icTd07CJXgDZhggbkm7-eHsZ--Nc0sto8gTowXXOv2X-I8IkXFuTNOUaq8w7FrhvTLCOlLmY7dELqktWidhd1N-TA-BHJh75h-G4D5mcpS6p7NWhPhSQBcrRm6r_kq_SV0zvawvnsHVYVwQZ_PYLbQ2Dtx8lNYH-r6beXmaShZX8NJqv2hCq241SNGbALBnUrCKR0matkCb62b9TlChQEMdhg6p7JQ"/>
</div>
<div class="absolute bottom-1 right-1 ${statusBadgeClass} px-3 py-1 rounded-full text-xs font-bold">
    ${statusText}
</div>
</div>
<h2 class="text-on-surface font-headline-md text-xl mb-1">${name}</h2>
<p class="text-on-surface-variant font-body-md text-sm opacity-80 mb-6" style="direction:ltr">#PX-${user.id.substring(0, 8)}</p>
<div class="flex items-center gap-2 px-6 py-2 bg-tertiary/10 text-tertiary rounded-full border border-tertiary/20">
<span class="material-symbols-outlined text-sm">verified_user</span>
<span class="text-xs font-bold">${user.enabled ? "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0641\u0639\u0627\u0644" : "\u063A\u06CC\u0631 \u0641\u0639\u0627\u0644"}</span>
</div>
</div>
<!-- Gauges Section -->
<div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
<!-- Gauge 1: Expiry -->
<div class="glass-panel p-6 rounded-3xl flex flex-col justify-between overflow-hidden relative">
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-on-surface-variant text-sm font-label-md">\u0627\u0639\u062A\u0628\u0627\u0631 \u0632\u0645\u0627\u0646\u06CC</p>
<h3 class="text-on-surface font-headline-md text-xl farsi-nums mt-1">${expiryAbsolute}</h3>
</div>
<span class="material-symbols-outlined text-primary text-3xl">schedule</span>
</div>
<div class="relative h-24 w-full flex items-end">
<div class="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
<div class="absolute top-0 right-0 h-full bg-primary neon-glow-primary rounded-full transition-all duration-1000" style="width: ${expiryPercent}%;"></div>
</div>
<div class="absolute bottom-4 left-0 right-0 flex justify-between text-[10px] text-on-surface-variant font-label-md">
<span>\u0634\u0631\u0648\u0639 \u062F\u0648\u0631\u0647</span>
<span>${expiryRelative}</span>
</div>
</div>
</div>
<!-- Gauge 2: Traffic -->
<div class="glass-panel p-6 rounded-3xl flex flex-col justify-between overflow-hidden relative">
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-on-surface-variant text-sm font-label-md">\u062D\u062C\u0645 \u0645\u0635\u0631\u0641\u06CC</p>
<h3 class="text-on-surface font-headline-md text-xl farsi-nums mt-1">${usageText}</h3>
</div>
<span class="material-symbols-outlined text-tertiary text-3xl">data_usage</span>
</div>
<div class="space-y-2">
<div class="flex justify-between text-xs text-on-surface-variant farsi-nums">
<span>\u0645\u0635\u0631\u0641 \u0634\u062F\u0647: ${formatBytes(used)}</span>
<span>\u06A9\u0644: ${limit > 0 ? formatBytes(limit) : "\u0646\u0627\u0645\u062D\u062F\u0648\u062F"}</span>
</div>
<div class="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
<div class="absolute top-0 right-0 h-full bg-tertiary neon-glow-success rounded-full transition-all duration-1000" style="width: ${percent}%;"></div>
</div>
</div>
<div class="mt-4 flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-tertiary pulse" style="background:#34d399"></div>
<p class="text-tertiary text-xs">\u0627\u062A\u0635\u0627\u0644 \u067E\u0627\u06CC\u062F\u0627\u0631</p>
</div>
</div>
</div>
</div>
<!-- Configuration Section -->
<h3 class="text-on-surface font-headline-md text-xl mb-6 pr-2 border-r-4 border-primary">\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0627\u062A\u0635\u0627\u0644</h3>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
<!-- VLESS Card -->
<div class="glass-panel rounded-3xl p-6 relative group border-t border-r border-white/5 hover:border-primary/30 transition-all">
<div class="flex items-center gap-4 mb-6">
<div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
<span class="material-symbols-outlined">bolt</span>
</div>
<div>
<h4 class="text-on-surface font-headline-md text-lg">VLESS + WS</h4>
<p class="text-on-surface-variant text-xs">\u0645\u0646\u0627\u0633\u0628 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646\u062A\u0631\u0646\u062A\u200C\u0647\u0627\u06CC \u067E\u0631\u0633\u0631\u0639\u062A</p>
</div>
</div>
<div class="bg-surface-container-lowest/50 rounded-xl p-4 mb-6 font-code-sm text-xs break-all border border-white/5 text-on-surface-variant/80 select-all" style="direction:ltr; text-align:left;">
    ${vlessWS}
</div>
<div class="grid grid-cols-2 gap-3">
<button class="flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-label-md text-sm hover:opacity-90 active:scale-95 transition-all" onclick="navigator.clipboard.writeText('${vlessWS}').then(() => alert('\u06A9\u0627\u0646\u0641\u06CC\u06AF VLESS \u06A9\u067E\u06CC \u0634\u062F'))">
<span class="material-symbols-outlined text-lg">content_copy</span>
                        \u06A9\u067E\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF
                    </button>
<button class="flex items-center justify-center gap-2 py-3 bg-white/5 text-on-surface border border-white/10 rounded-xl font-label-md text-sm hover:bg-white/10 active:scale-95 transition-all" onclick="showQrModal('${vlessWS}', '\u0627\u062A\u0635\u0627\u0644 VLESS WS')">
<span class="material-symbols-outlined text-lg">qr_code_2</span>
                        \u0646\u0645\u0627\u06CC\u0634 QR
                    </button>
</div>
</div>
<!-- Trojan Card -->
<div class="glass-panel rounded-3xl p-6 relative group border-t border-r border-white/5 hover:border-secondary/30 transition-all">
<div class="flex items-center gap-4 mb-6">
<div class="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
<span class="material-symbols-outlined">security</span>
</div>
<div>
<h4 class="text-on-surface font-headline-md text-lg">Trojan + WS</h4>
<p class="text-on-surface-variant text-xs">\u0627\u0645\u0646\u06CC\u062A \u0628\u0627\u0644\u0627 \u0648 \u062F\u0648\u0631 \u0632\u062F\u0646 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A\u200C\u0647\u0627</p>
</div>
</div>
<div class="bg-surface-container-lowest/50 rounded-xl p-4 mb-6 font-code-sm text-xs break-all border border-white/5 text-on-surface-variant/80 select-all" style="direction:ltr; text-align:left;">
    ${trojanWS}
</div>
<div class="grid grid-cols-2 gap-3">
<button class="flex items-center justify-center gap-2 py-3 bg-secondary text-on-secondary rounded-xl font-label-md text-sm hover:opacity-90 active:scale-95 transition-all" onclick="navigator.clipboard.writeText('${trojanWS}').then(() => alert('\u06A9\u0627\u0646\u0641\u06CC\u06AF Trojan \u06A9\u067E\u06CC \u0634\u062F'))">
<span class="material-symbols-outlined text-lg">content_copy</span>
                        \u06A9\u067E\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF
                    </button>
<button class="flex items-center justify-center gap-2 py-3 bg-white/5 text-on-surface border border-white/10 rounded-xl font-label-md text-sm hover:bg-white/10 active:scale-95 transition-all" onclick="showQrModal('${trojanWS}', '\u0627\u062A\u0635\u0627\u0644 TROJAN WS')">
<span class="material-symbols-outlined text-lg">qr_code_2</span>
                        \u0646\u0645\u0627\u06CC\u0634 QR
                    </button>
</div>
</div>
</div>
<!-- Subscription Section -->
<div class="glass-panel rounded-[2rem] p-10 overflow-hidden relative">
<div class="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
<div class="relative z-10 flex flex-col md:flex-row items-center gap-10">
<!-- QR Code Display -->
<div class="w-48 h-48 bg-white p-3 rounded-2xl neon-glow-primary shrink-0 flex items-center justify-center">
<canvas id="sub-qr-canvas" style="display:block; width:100%; height:100%;"></canvas>
</div>
<div class="flex-1 text-center md:text-right">
<h3 class="text-on-surface font-headline-md text-2xl mb-4">\u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u200C\u0627\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646 \u0647\u0648\u0634\u0645\u0646\u062F</h3>
<p class="text-on-surface-variant font-body-md mb-8 max-w-xl text-justify">\u0628\u0627 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0644\u06CC\u0646\u06A9 \u0632\u06CC\u0631 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u062A\u0645\u0627\u0645 \u06A9\u0627\u0646\u0641\u06CC\u06AF\u200C\u0647\u0627\u06CC \u062E\u0648\u062F \u0631\u0627 \u062F\u0631 \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631\u0647\u0627\u06CC V2Ray\u060C Shadowrocket \u06CC\u0627 V2rayNG \u0628\u0647 \u0635\u0648\u0631\u062A \u06CC\u06A9\u062C\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u0648 \u0628\u0647 \u0635\u0648\u0631\u062A \u062E\u0648\u062F\u06A9\u0627\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u06A9\u0646\u06CC\u062F.</p>
<div class="flex flex-col sm:flex-row items-center gap-4">
<button class="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-l from-primary to-primary-container text-on-primary rounded-2xl font-headline-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" onclick="navigator.clipboard.writeText('${subLink}').then(() => alert('\u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u200C\u0627\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646 \u06A9\u067E\u06CC \u0634\u062F'))">
<span class="material-symbols-outlined">link</span>
                            \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u200C\u0627\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646
                        </button>
</div>
</div>
</div>
</div>
<footer class="mt-20 py-10 border-t border-white/5 text-center">
<p class="text-on-surface-variant/40 text-sm font-label-md">Penhan Deep Space Command \xA9 2026 - All Systems Operational</p>
</footer>
</main>

<!-- QR Modal -->
<div id="qr-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:none; justify-content:center; align-items:center; z-index:10000; transition:0.3s;" onclick="closeQrModal()">
  <div style="background:rgba(31,31,38,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:28px; padding:28px 20px; max-width:320px; width:90%; box-shadow:0 30px 60px rgba(0,0,0,0.8); animation: zoomIn 0.25s; display:flex; flex-direction:column; align-items:center;" onclick="event.stopPropagation()">
    <style>
      @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    </style>
    <h3 id="qr-modal-title" style="font-size:16px; margin-bottom:20px; font-weight:800; color:#fff;"></h3>
    <div style="background:#fff; padding:12px; border-radius:16px; margin-bottom:24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); direction:ltr;">
      <canvas id="qr-canvas" style="display:block;"></canvas>
    </div>
    <button onclick="closeQrModal()" style="width:100%; padding:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; color:#fff; font-weight:700; cursor:pointer; transition:0.2s; outline:none;">\u0628\u0633\u062A\u0646</button>
  </div>
</div>

<script>
        let qrInstance = null;
        function showQrModal(value, title) {
          document.getElementById('qr-modal-title').textContent = title;
          document.getElementById('qr-modal').style.display = 'flex';
          if (!qrInstance) {
            qrInstance = new QRious({
              element: document.getElementById('qr-canvas'),
              size: 200,
              level: 'L'
            });
          }
          qrInstance.value = value;
        }
        function closeQrModal() {
          document.getElementById('qr-modal').style.display = 'none';
        }

        document.addEventListener('DOMContentLoaded', () => {
            // Generate Sub QR Code
            new QRious({
              element: document.getElementById('sub-qr-canvas'),
              size: 160,
              value: '${subLink}',
              level: 'L'
            });

            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mousedown', () => {
                    btn.style.transform = 'scale(0.95)';
                });
                btn.addEventListener('mouseup', () => {
                    btn.style.transform = 'scale(1)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'scale(1)';
                });
            });

            // Smooth opacity entrance for cards
            const panels = document.querySelectorAll('.glass-panel');
            panels.forEach((panel, index) => {
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    panel.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    panel.style.opacity = '1';
                    panel.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        });
<\/script>
</body></html>`;
}
function panelPage(hostname, adminUUID, defaultProxyIP, cfAccountId, cfApiToken) {
  return `<!DOCTYPE html>
<html class="dark" dir="rtl" lang="fa"><head>
<meta charset="UTF-8">
<title>\u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u067E\u0646\u0647\u0627\u0646</title>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<!-- Tailwind CDN with forms and container queries -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
<!-- Icons & Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet"/>
<style>
    body {
        font-family: 'Vazirmatn', sans-serif;
        background-color: #131319;
        color: #e4e1ea;
        margin: 0;
        overflow: hidden;
    }
    .glass-panel {
        background: rgba(25, 25, 32, 0.4);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02), 0 20px 50px rgba(0,0,0,0.4);
    }
    .neon-glow-primary {
        box-shadow: 0 0 20px rgba(221, 183, 255, 0.25);
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(221, 183, 255, 0.2);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(221, 183, 255, 0.4);
    }
    /* Modals overlays styling */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(12px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 24px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .modal-overlay.active {
        display: flex;
        opacity: 1;
    }
    .modal-card {
        background: rgba(31, 31, 38, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 32px;
        max-width: 480px;
        width: 100%;
        transform: scale(0.95);
        transition: transform 0.3s ease;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .modal-overlay.active .modal-card {
        transform: scale(1);
    }
    /* Table hover */
    tbody tr {
        transition: background-color 0.2s ease;
    }
    tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.03);
    }
    /* Toolbar Selection */
    .pip-selbar {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 0 18px;
        margin-bottom: 0;
        height: 0;
        overflow: hidden;
        background: linear-gradient(90deg, rgba(139, 92, 246, 0.16), rgba(139, 92, 246, 0.04));
        border: 1px solid transparent;
        border-radius: 14px 14px 0 0;
        opacity: 0;
        transition: all 0.25s ease;
    }
    .pip-selbar.show {
        height: 56px;
        opacity: 1;
        margin-bottom: -1px;
        border-color: #ddb7ff;
    }
    /* Spinner spin */
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .pip-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top-color: #ddb7ff;
        border-radius: 50%;
        animation: spin .6s linear infinite;
    }
    .pip-act.spin {
        pointer-events: none;
        opacity: 0.7;
    }
    /* Toast notifications */
    .pip-toasts {
        position: fixed;
        bottom: 24px;
        left: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 9999;
    }
    .pip-toast {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 240px;
        max-width: 360px;
        padding: 13px 16px;
        border-radius: 12px;
        background: rgba(31, 31, 38, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 30px -8px rgba(0,0,0,0.6);
        font-size: 13px;
        font-weight: 600;
        color: #e4e1ea;
        animation: toastIn .25s cubic-bezier(.16,1,.3,1);
    }
    .pip-toast.ok { border-color: rgba(78, 222, 163, 0.4); }
    .pip-toast.err { border-color: rgba(255, 180, 171, 0.4); }
    .pip-toast.info { border-color: rgba(221, 183, 255, 0.4); }
    .pip-toast .tico { font-size: 16px; }
    @keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    .pip-toast.out { animation:toastOut .25s forwards; }
    @keyframes toastOut { to { opacity:0; transform:translateX(-20px); } }

    .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
</style>
</head>
<body class="custom-scrollbar h-screen overflow-hidden">
<!-- Global Background WebGL Shader -->
<div class="fixed inset-0 w-full h-full -z-10 opacity-30" style="display:block;">
<canvas id="shader-canvas-ANIMATION_2" style="display:block;width:100%;height:100%"></canvas>
<script>
(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_2');
  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = \`attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
  const fs = \`precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
    vec2 uv = v_texCoord;
    vec2 p1 = vec2(0.5 + 0.3 * sin(u_time * 0.4), 0.5 + 0.2 * cos(u_time * 0.5));
    vec2 p2 = vec2(0.3 + 0.2 * cos(u_time * 0.3), 0.7 + 0.1 * sin(u_time * 0.6));
    vec2 p3 = vec2(0.7 + 0.2 * sin(u_time * 0.5), 0.3 + 0.2 * cos(u_time * 0.4));
    vec3 col1 = vec3(0.658, 0.333, 0.968); // #a855f7 (Purple)
    vec3 col2 = vec3(0.925, 0.282, 0.6);   // #ec4899 (Pink)
    vec3 col3 = vec3(0.062, 0.725, 0.505); // #10b981 (Cyan/Emerald)
    float d1 = length(uv - p1);
    float d2 = length(uv - p2);
    float d3 = length(uv - p3);
    float f1 = 0.5 / (1.0 + d1 * 5.0);
    float f2 = 0.5 / (1.0 + d2 * 4.0);
    float f3 = 0.5 / (1.0 + d3 * 6.0);
    vec3 aurora = (col1 * f1 + col2 * f2 + col3 * f3) * 0.4;
    vec3 bg = vec3(0.02, 0.02, 0.04);
    gl_FragColor = vec4(bg + aurora, 1.0);
}\`;
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });
  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // requestAnimationFrame(render); // Disabled for performance
  }
  render(0);
})();
<\/script>
</div>

<!-- Sidebar Fixed Right -->
<aside class="fixed top-0 right-0 h-full w-[280px] bg-surface-container/30 backdrop-blur-xl border-l border-white/5 shadow-2xl z-50 flex flex-col py-8 px-4">
<div class="mb-12 px-2">
<div class="font-headline-md text-headline-md font-bold text-primary flex items-center gap-3">
<div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-lg neon-glow-primary">
<span class="material-symbols-outlined text-on-primary-container">rocket_launch</span>
</div>
<div>
<h1 class="font-bold text-primary tracking-tight">\u067E\u0646\u0644 \u067E\u0646\u0647\u0627\u200C\u0646</h1>
<p class="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">Deep Space Command</p>
</div>
</div>
</div>
<nav class="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
<button id="nav-users" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-primary font-bold border-r-2 border-primary bg-primary/5 transition-all duration-300" onclick="nav('users')">
<span class="material-symbols-outlined">group</span>
<span class="font-body-md text-sm">\u06A9\u0627\u0631\u0628\u0631\u0627\u0646</span>
</button>
<button id="nav-proxyip" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all duration-300" onclick="nav('proxyip')">
<span class="material-symbols-outlined">settings_ethernet</span>
<span class="font-body-md text-sm">\u067E\u0631\u0648\u06A9\u0633\u06CC IP</span>
</button>
<button id="nav-nodes" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all duration-300" onclick="nav('nodes')">
<span class="material-symbols-outlined">lan</span>
<span class="font-body-md text-sm">\u0646\u0648\u062F\u0647\u0627</span>
</button>
<button id="nav-api" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all duration-300" onclick="nav('api')">
<span class="material-symbols-outlined">key</span>
<span class="font-body-md text-sm">\u062A\u0648\u06A9\u0646\u200C\u0647\u0627\u06CC API</span>
</button>
<button id="nav-settings" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all duration-300" onclick="nav('settings')">
<span class="material-symbols-outlined">settings</span>
<span class="font-body-md text-sm">\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0633\u06CC\u0633\u062A\u0645</span>
</button>
</nav>
<div class="mt-auto border-t border-white/5 pt-6 space-y-2">
<button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-error transition-all duration-300 text-right" onclick="window.location.href='/'">
<span class="material-symbols-outlined">logout</span>
<span class="font-body-md text-sm">\u062E\u0631\u0648\u062C \u0627\u0632 \u067E\u0646\u0644</span>
</button>
</div>
</aside>

<!-- TopAppBar Fixed -->
<header class="fixed top-0 left-0 right-[280px] h-16 flex justify-between items-center px-8 z-40 bg-transparent">
<div class="flex items-center gap-4 bg-surface-container/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 w-80">
<span class="material-symbols-outlined text-on-surface-variant text-sm">search</span>
<input class="bg-transparent border-none focus:ring-0 text-xs w-full placeholder-on-surface-variant/40 text-white" placeholder="\u062C\u0633\u062A\u062C\u0648..." type="text" oninput="searchFilter(this.value)"/>
</div>
<div class="flex items-center gap-3">
<div class="h-10 px-4 rounded-full flex items-center gap-3 bg-surface-container/60 border border-white/5">
<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary overflow-hidden flex items-center justify-center">
<span class="material-symbols-outlined text-sm text-white">person</span>
</div>
<span class="text-xs text-white">\u0627\u062F\u0645\u06CC\u0646 \u0627\u0631\u0634\u062F</span>
</div>
</div>
</header>

<!-- Main Container -->
<main class="mr-[280px] pt-24 px-8 pb-32 h-screen overflow-y-auto custom-scrollbar">
<div class="max-w-7xl mx-auto">

  <!-- ================= USERS PAGE ================= -->
  <div id="page-users" class="page active space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-white">\u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646</h2>
        <p class="text-on-surface-variant mt-1 text-sm">\u062A\u0639\u0631\u06CC\u0641 \u0648 \u0645\u0627\u0646\u06CC\u062A\u0648\u0631\u06CC\u0646\u06AF \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0641\u0639\u0627\u0644 \u0633\u06CC\u0633\u062A\u0645 \u062F\u0631 \u0632\u0645\u0627\u0646 \u0648\u0627\u0642\u0639\u06CC</p>
      </div>
      <button class="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all" onclick="openAddUserModal()">
        <span class="material-symbols-outlined text-sm">person_add</span>
        <span class="text-xs">\u0627\u0641\u0632\u0648\u062F\u0646 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F</span>
      </button>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative group">
        <div class="relative z-10">
          <p class="text-on-surface-variant text-xs mb-2">\u06A9\u0644 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646</p>
          <h3 id="stat-total-users" class="text-3xl font-bold text-white">0</h3>
        </div>
        <div class="absolute -left-4 -bottom-4 opacity-10 text-white">
          <span class="material-symbols-outlined text-[100px]">groups</span>
        </div>
      </div>
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative group">
        <div class="relative z-10">
          <p class="text-on-surface-variant text-xs mb-2">\u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0641\u0639\u0627\u0644</p>
          <h3 id="stat-active-users" class="text-3xl font-bold text-tertiary">0</h3>
        </div>
        <div class="absolute -left-4 -bottom-4 opacity-10 text-tertiary">
          <span class="material-symbols-outlined text-[100px]">bolt</span>
        </div>
      </div>
      <div class="glass-panel rounded-2xl p-6 flex items-center gap-6 overflow-hidden relative">
        <div id="cf-circle-container" class="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg class="w-full h-full transform -rotate-90">
            <circle class="text-white/5" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-width="5"></circle>
            <circle id="cf-circle-progress" class="text-primary drop-shadow-[0_0_8px_rgba(221,183,255,0.6)]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-dasharray="175.8" stroke-dashoffset="0" stroke-width="5"></circle>
          </svg>
          <div id="cf-circle-text" class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">0%</div>
        </div>
        <div>
          <p class="text-on-surface-variant text-xs mb-1">\u0627\u0645\u0631\u0648\u0632 \u0648\u0631\u06A9\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631</p>
          <h3 id="stat-cf-reqs" class="text-lg font-bold text-white">\u062F\u0631 \u062D\u0627\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A...</h3>
        </div>
        <button class="absolute left-4 top-4 text-on-surface-variant hover:text-white" onclick="loadCfMetrics()">
          <span class="material-symbols-outlined text-sm">refresh</span>
        </button>
      </div>
    </div>

    <!-- Table content -->
    <div class="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr class="bg-white/5 text-on-surface-variant text-xs">
            <th class="py-4 px-6 font-medium">\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631</th>
            <th class="py-4 px-6 font-medium">UUID</th>
            <th class="py-4 px-6 font-medium">\u0648\u0636\u0639\u06CC\u062A \u0627\u062A\u0635\u0627\u0644</th>
            <th class="py-4 px-6 font-medium">\u062A\u0631\u0627\u0641\u06CC\u06A9 \u0645\u0635\u0631\u0641\u06CC</th>
            <th class="py-4 px-6 font-medium">\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u0642\u0636\u0627</th>
            <th class="py-4 px-6 font-medium text-left">\u0639\u0645\u0644\u06CC\u0627\u062A</th>
          </tr>
        </thead>
        <tbody id="users-tbody" class="divide-y divide-white/5 text-sm">
          <tr><td colspan="6" class="py-10 text-center text-on-surface-variant/50">\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0644\u06CC\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ================= PROXY IP PAGE ================= -->
  <div id="page-proxyip" class="page hidden space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-white">\u0645\u062F\u06CC\u0631\u06CC\u062A Proxy IP</h2>
        <p class="text-on-surface-variant mt-1 text-sm">\u067E\u0627\u06CC\u0634\u060C \u0645\u0631\u062A\u0628\u200C\u0633\u0627\u0632\u06CC \u0648 \u0627\u06CC\u0645\u067E\u0648\u0631\u062A \u062F\u0633\u062A\u0647\u200C\u0627\u06CC \u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC \u062A\u0645\u06CC\u0632 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs" onclick="openProxyIPImportModal()">
          <span class="material-symbols-outlined text-sm text-primary">download</span>
          <span>\u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0644\u06CC\u0633\u062A</span>
        </button>
        <button class="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs" onclick="openProxyIPAddModal()">
          <span class="material-symbols-outlined text-sm text-primary">add</span>
          <span>\u0622\u06CC\u200C\u067E\u06CC \u062C\u062F\u06CC\u062F</span>
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
        <div>
          <p class="text-on-surface-variant text-xs mb-2">\u06A9\u0644 \u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627</p>
          <h3 id="stat-total-proxyip" class="text-3xl font-bold text-white">0</h3>
        </div>
        <span class="material-symbols-outlined text-[100px] opacity-10 absolute -left-4 -bottom-4 text-white">language</span>
      </div>
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
        <div>
          <p class="text-on-surface-variant text-xs mb-2">\u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644</p>
          <h3 id="stat-active-proxyip" class="text-3xl font-bold text-tertiary">0</h3>
        </div>
        <span class="material-symbols-outlined text-[100px] opacity-10 absolute -left-4 -bottom-4 text-tertiary">check_circle</span>
      </div>
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
        <div>
          <p class="text-on-surface-variant text-xs mb-2">\u0645\u06CC\u0627\u0646\u06AF\u06CC\u0646 \u067E\u06CC\u0646\u06AF (\u0627\u0632 \u0645\u0631\u0648\u0631\u06AF\u0631)</p>
          <h3 id="stat-avg-ping" class="text-3xl font-bold text-secondary">--</h3>
        </div>
        <button class="absolute left-4 top-4 text-on-surface-variant hover:text-white" onclick="refreshAllProxyIP(event)">
          <span class="material-symbols-outlined text-sm">bolt</span>
        </button>
      </div>
    </div>

    <!-- Toolbar Filters -->
    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
      <div class="flex flex-wrap items-center gap-3">
        <select id="proxyip-filter-country" class="bg-white/5 border border-white/10 rounded-lg text-xs py-2 px-4 focus:ring-0 focus:border-primary text-white" onchange="filterProxyIP()">
          <option value="" class="bg-[#121212] text-white">\u{1F30D} \u0647\u0645\u0647 \u06A9\u0634\u0648\u0631\u0647\u0627</option>
          <option value="DE" class="bg-[#121212] text-white">\u{1F1E9}\u{1F1EA} \u0622\u0644\u0645\u0627\u0646</option>
          <option value="US" class="bg-[#121212] text-white">\u{1F1FA}\u{1F1F8} \u0622\u0645\u0631\u06CC\u06A9\u0627</option>
          <option value="NL" class="bg-[#121212] text-white">\u{1F1F3}\u{1F1F1} \u0647\u0644\u0646\u062F</option>
          <option value="FR" class="bg-[#121212] text-white">\u{1F1EB}\u{1F1F7} \u0641\u0631\u0627\u0646\u0633\u0647</option>
          <option value="SG" class="bg-[#121212] text-white">\u{1F1F8}\u{1F1EC} \u0633\u0646\u06AF\u0627\u067E\u0648\u0631</option>
          <option value="JP" class="bg-[#121212] text-white">\u{1F1EF}\u{1F1F5} \u0698\u0627\u067E\u0646</option>
          <option value="TR" class="bg-[#121212] text-white">\u{1F1F9}\u{1F1F7} \u062A\u0631\u06A9\u06CC\u0647</option>
        </select>
        <select id="proxyip-filter-status" class="bg-white/5 border border-white/10 rounded-lg text-xs py-2 px-4 focus:ring-0 focus:border-primary text-white" onchange="filterProxyIP()">
          <option value="" class="bg-[#121212] text-white">\u26A1 \u0647\u0645\u0647 \u0648\u0636\u0639\u06CC\u062A\u200C\u0647\u0627</option>
          <option value="active" class="bg-[#121212] text-white">\u2705 \u0641\u0639\u0627\u0644</option>
          <option value="slow" class="bg-[#121212] text-white">\u{1F422} \u06A9\u0646\u062F</option>
          <option value="dead" class="bg-[#121212] text-white">\u274C \u0642\u0637\u0639</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 text-white" onclick="fetchProxyIPFromSources(event)">
          <span class="material-symbols-outlined text-sm">cloud_download</span>
          <span>\u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u062A\u0648\u0645\u0627\u062A\u06CC\u06A9</span>
        </button>
        <button class="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 text-white" onclick="detectCountriesForIPs(event)">
          <span class="material-symbols-outlined text-sm">map</span>
          <span>\u062A\u0634\u062E\u06CC\u0635 \u0644\u0648\u06A9\u06CC\u0634\u0646</span>
        </button>
        <button class="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 text-white" onclick="refreshAllProxyIP(event)">
          <span class="material-symbols-outlined text-sm">speed</span>
          <span>\u062A\u0633\u062A \u0647\u0645\u06AF\u0627\u0646\u06CC</span>
        </button>
      </div>
    </div>

    <!-- Selection Bar -->
    <div id="proxyip-selection-toolbar" class="pip-selbar border-white/10">
      <div class="cnt text-sm">
        <span class="num text-xs px-2 py-0.5 rounded-full" id="proxyip-toolbar-count">0</span>
        <span id="proxyip-selected-count">\u0645\u0648\u0631\u062F \u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u062F\u0647</span>
      </div>
      <button class="flex items-center gap-1 bg-error/20 hover:bg-error/30 border border-error/40 text-error rounded-lg px-4 py-1.5 text-xs font-bold transition-all" onclick="deleteSelectedProxyIP()">
        <span class="material-symbols-outlined text-sm">delete</span>
        <span>\u062D\u0630\u0641 \u062F\u0633\u062A\u0647\u200C\u0627\u06CC</span>
      </button>
    </div>

    <!-- Table -->
    <div class="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr class="bg-white/5 text-on-surface-variant text-xs">
            <th class="py-4 px-6 text-center w-12">
              <input type="checkbox" id="proxyip-select-all" class="pip-check rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30" onchange="toggleSelectAllProxyIP(this)">
            </th>
            <th class="py-4 px-6 text-center w-12">#</th>
            <th class="py-4 px-6 font-medium">\u0622\u062F\u0631\u0633 IP</th>
            <th class="py-4 px-6 font-medium">\u067E\u0648\u0631\u062A</th>
            <th class="py-4 px-6 font-medium">\u0644\u0648\u06A9\u06CC\u0634\u0646 / \u06A9\u0634\u0648\u0631</th>
            <th class="py-4 px-6 font-medium">ISP \u067E\u0631\u0648\u0648\u0627\u06CC\u062F\u0631</th>
            <th class="py-4 px-6 font-medium">\u067E\u06CC\u0646\u06AF</th>
            <th class="py-4 px-6 font-medium">\u0648\u0636\u0639\u06CC\u062A</th>
            <th class="py-4 px-6 text-left">\u0639\u0645\u0644\u06CC\u0627\u062A</th>
          </tr>
        </thead>
        <tbody id="proxyip-tbody" class="divide-y divide-white/5 text-sm">
          <tr><td colspan="9" class="py-10 text-center text-on-surface-variant/50">\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0644\u06CC\u0633\u062A \u067E\u0631\u0648\u06A9\u0633\u06CC\u200C\u0647\u0627...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ================= NODES PAGE (MOCKUP) ================= -->
  <div id="page-nodes" class="page hidden space-y-6">
    <div>
      <h2 class="font-headline-lg text-headline-lg text-white">\u0645\u062F\u06CC\u0631\u06CC\u062A \u0646\u0648\u062F\u0647\u0627</h2>
      <p class="text-on-surface-variant mt-1 text-sm">\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0633\u0631\u0648\u0631\u0647\u0627\u06CC \u0645\u0631\u0632\u06CC (Edge Nodes) \u062C\u0647\u062A \u062A\u0648\u0632\u06CC\u0639 \u062A\u0631\u0627\u0641\u06CC\u06A9 \u062F\u0631 \u0622\u06CC\u0646\u062F\u0647</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between border-t-2 border-primary">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h4 class="text-white font-bold text-lg mb-1">Edge Node #1 (\u062A\u0647\u0631\u0627\u0646)</h4>
            <p class="text-xs text-on-surface-variant/80">\u0633\u0631\u0648\u0631 \u067E\u0631\u0648\u06A9\u0633\u06CC \u0644\u0628\u0647 \u0627\u06CC\u0631\u0627\u0646</p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary">
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
            \u0641\u0639\u0627\u0644
          </span>
        </div>
        <div class="space-y-3 text-sm border-t border-white/5 pt-4">
          <div class="flex justify-between"><span class="text-on-surface-variant">\u0622\u062F\u0631\u0633 \u0633\u0631\u0648\u0631:</span><span class="font-mono text-white">node1.penhan.space</span></div>
          <div class="flex justify-between"><span class="text-on-surface-variant">\u067E\u0631\u0648\u062A\u06A9\u0644\u200C\u0647\u0627:</span><span class="text-white">VLESS WS, Trojan WS</span></div>
        </div>
      </div>
      <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between border-t-2 border-secondary">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h4 class="text-white font-bold text-lg mb-1">Edge Node #2 (\u062E\u0627\u0631\u062C)</h4>
            <p class="text-xs text-on-surface-variant/80">\u0633\u0631\u0648\u0631 \u06A9\u0645\u06A9\u06CC \u062E\u0627\u0631\u062C \u06A9\u0634\u0648\u0631</p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary">
            <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            \u067E\u0634\u062A\u06CC\u0628\u0627\u0646
          </span>
        </div>
        <div class="space-y-3 text-sm border-t border-white/5 pt-4">
          <div class="flex justify-between"><span class="text-on-surface-variant">\u0622\u062F\u0631\u0633 \u0633\u0631\u0648\u0631:</span><span class="font-mono text-white">node2.penhan.space</span></div>
          <div class="flex justify-between"><span class="text-on-surface-variant">\u067E\u0631\u0648\u062A\u06A9\u0644\u200C\u0647\u0627:</span><span class="text-white">VLESS WS, Trojan WS</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= API TOKENS PAGE ================= -->
  <div id="page-api" class="page hidden space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-white">\u062A\u0648\u06A9\u0646\u200C\u0647\u0627\u06CC API</h2>
        <p class="text-on-surface-variant mt-1 text-sm">\u0633\u0627\u062E\u062A \u06A9\u0644\u06CC\u062F\u0647\u0627\u06CC \u062F\u0633\u062A\u0631\u0633\u06CC API \u062C\u0647\u062A \u0627\u062A\u0635\u0627\u0644 \u0631\u0628\u0627\u062A\u200C\u0647\u0627\u06CC \u062A\u0644\u06AF\u0631\u0627\u0645\u06CC \u0648 \u0627\u067E\u0644\u06CC\u06A9\u06CC\u0634\u0646\u200C\u0647\u0627</p>
      </div>
      <button class="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all text-xs" onclick="openModal('token-modal')">
        <span class="material-symbols-outlined text-sm">key</span>
        <span>\u0627\u06CC\u062C\u0627\u062F \u062A\u0648\u06A9\u0646 \u062C\u062F\u06CC\u062F</span>
      </button>
    </div>

    <div class="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr class="bg-white/5 text-on-surface-variant text-xs">
            <th class="py-4 px-6 font-medium">\u0646\u0627\u0645 \u062A\u0648\u06A9\u0646 / \u0631\u0628\u0627\u062A</th>
            <th class="py-4 px-6 font-medium">\u06A9\u0644\u06CC\u062F \u062A\u0648\u06A9\u0646 (API Key)</th>
            <th class="py-4 px-6 font-medium text-left">\u0639\u0645\u0644\u06CC\u0627\u062A</th>
          </tr>
        </thead>
        <tbody id="tokens-tbody" class="divide-y divide-white/5 text-sm">
          <tr><td colspan="3" class="py-10 text-center text-on-surface-variant/50">\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u062A\u0648\u06A9\u0646\u200C\u0647\u0627...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- API Docs -->
    <div class="glass-panel p-8 rounded-3xl space-y-4">
      <h3 class="text-white font-bold text-lg">\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 API</h3>
      <p class="text-sm text-on-surface-variant/80">\u0628\u0631\u0627\u06CC \u062E\u0648\u062F\u06A9\u0627\u0631\u0633\u0627\u0632\u06CC \u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u067E\u0646\u0647\u0627\u0646\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u200C\u0647\u0627\u06CC \u062E\u0648\u062F \u0631\u0627 \u0628\u0647 \u0627\u0646\u062F\u067E\u0648\u06CC\u0646\u062A\u200C\u0647\u0627\u06CC \u0632\u06CC\u0631 \u0627\u0631\u0633\u0627\u0644 \u06A9\u0646\u06CC\u062F:</p>
      <pre class="bg-black/40 border border-white/5 p-4 rounded-xl text-xs font-mono text-primary-fixed overflow-x-auto text-left leading-relaxed" style="direction:ltr;">
# \u0627\u06CC\u062C\u0627\u062F \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F
curl -X POST https://${hostname}/api/users \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"id":"UUID", "name":"User1", "limit_bytes": 10737418240, "expiry_date": 1712000000000}'

# \u062F\u0631\u06CC\u0627\u0641\u062A \u0644\u06CC\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646
curl -X GET https://${hostname}/api/users \\
  -H "Authorization: Bearer YOUR_TOKEN"
      </pre>
    </div>
  </div>

  <!-- ================= SETTINGS PAGE ================= -->
  <div id="page-settings" class="page hidden space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-white">\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0639\u0645\u0648\u0645\u06CC</h2>
        <p class="text-on-surface-variant mt-1 text-sm">\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0647\u0648\u06CC\u062A \u0627\u062F\u0645\u06CC\u0646\u060C \u06A9\u0644\u06CC\u062F\u0647\u0627 \u0648 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u06A9\u0644\u0627\u062F\u0641\u0644\u0631</p>
      </div>
      <button class="bg-primary text-on-primary font-bold py-2.5 px-6 rounded-xl hover:opacity-90 transition-all active:scale-95" onclick="saveSettings()">
        <span>\u0630\u062E\u06CC\u0631\u0647 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A</span>
      </button>
    </div>

    <div class="glass-panel p-8 rounded-3xl max-w-2xl space-y-6">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">UUID \u0627\u062F\u0645\u06CC\u0646 (\u062C\u0647\u062A \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A)</label>
        <input type="text" id="st-uuid" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value="${adminUUID}">
      </div>
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F \u067E\u0646\u0644 \u0627\u062F\u0645\u06CC\u0646</label>
        <input type="password" id="st-pass" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" placeholder="\u0628\u0631\u0627\u06CC \u0639\u062F\u0645 \u062A\u063A\u06CC\u06CC\u0631 \u062E\u0627\u0644\u06CC \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F">
      </div>
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">Proxy IP \u067E\u06CC\u0634\u200C\u0641\u0631\u0636</label>
        <input type="text" id="st-proxy" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value="${defaultProxyIP || ""}" placeholder="1.2.3.4">
      </div>
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">Cloudflare Account ID</label>
        <input type="text" id="st-cf-account" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value="${cfAccountId || ""}" placeholder="\u0645\u062B\u0627\u0644: 8e5f2...">
      </div>
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">Cloudflare API Token</label>
        <input type="password" id="st-cf-token" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" placeholder="\u0628\u0631\u0627\u06CC \u0639\u062F\u0645 \u062A\u063A\u06CC\u06CC\u0631 \u062E\u0627\u0644\u06CC \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F">
        <span class="text-[10px] text-on-surface-variant/50 block">\u0628\u0627 \u0633\u0637\u062D \u062F\u0633\u062A\u0631\u0633\u06CC Account Analytics: Read \u062C\u0647\u062A \u0627\u0633\u062A\u0639\u0644\u0627\u0645 \u0645\u06CC\u0632\u0627\u0646 \u0644\u06CC\u0645\u06CC\u062A \u0631\u06CC\u06A9\u0648\u0626\u0633\u062A\u200C\u0647\u0627\u06CC \u0648\u0631\u06A9\u0631 \u0634\u0645\u0627</span>
      </div>
    </div>
  </div>

</div>
</main>

<!-- ================= SYSTEM MODALS ================= -->

<!-- User Modal (Redesigned) -->
<div class="modal-overlay" id="user-modal" onclick="closeModal('user-modal')">
  <div class="modal-card" onclick="event.stopPropagation()">
    <div class="flex justify-between items-center mb-6">
      <h3 id="user-modal-title" class="text-white font-bold text-lg">\u0627\u0641\u0632\u0648\u062F\u0646 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F</h3>
      <button class="text-on-surface-variant hover:text-white" onclick="closeModal('user-modal')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u0634\u0646\u0627\u0633\u0647 UUID</label>
        <div class="flex gap-2">
          <input type="text" id="u-uuid" class="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50">
          <button class="bg-white/5 border border-white/10 rounded-xl px-3 hover:bg-white/10 text-white" onclick="generateUUID()">\u0633\u062E\u062A</button>
        </div>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631</label>
        <input type="text" id="u-name" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="\u0645\u062B\u0627\u0644: \u06AF\u0648\u0634\u06CC \u0639\u0644\u06CC">
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">\u0633\u0642\u0641 \u062D\u062C\u0645 (\u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A\u060C 0=\u0646\u0627\u0645\u062D\u062F\u0648\u062F)</label>
          <input type="number" id="u-limit" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" value="0">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">\u062A\u0639\u062F\u0627\u062F \u06A9\u0627\u0631\u0628\u0631 \u0645\u062C\u0627\u0632 (\u0627\u062A\u0635\u0627\u0644 \u0647\u0645\u0632\u0645\u0627\u0646)</label>
          <input type="number" id="u-connlimit" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" value="0">
        </div>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u0645\u0647\u0644\u062A \u0632\u0645\u0627\u0646\u06CC (\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u0642\u0636\u0627)</label>
        <input type="datetime-local" id="u-expiry" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 text-right">
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u062A\u0645\u06CC\u0632 \u0622\u06CC\u200C\u067E\u06CC \u0627\u062E\u062A\u0635\u0627\u0635\u06CC (Clean IP)</label>
        <input type="text" id="u-cleanip" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" placeholder="\u062E\u0627\u0644\u06CC \u0628\u0631\u0627\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0622\u06CC\u200C\u067E\u06CC \u0633\u0631\u0648\u0631">
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC \u0627\u062E\u062A\u0635\u0627\u0635\u06CC (Proxy IP)</label>
        <textarea id="u-proxyip" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" rows="2" placeholder="\u06CC\u06A9 \u06CC\u0627 \u0686\u0646\u062F \u0622\u06CC\u200C\u067E\u06CC"></textarea>
      </div>
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all mt-4" onclick="saveUser()">\u0630\u062E\u06CC\u0631\u0647 \u06A9\u0627\u0631\u0628\u0631</button>
    </div>
  </div>
</div>

<!-- Token Modal (Redesigned) -->
<div class="modal-overlay" id="token-modal" onclick="closeModal('token-modal')">
  <div class="modal-card" onclick="event.stopPropagation()">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-white font-bold text-lg">\u0627\u06CC\u062C\u0627\u062F \u062A\u0648\u06A9\u0646 \u062C\u062F\u06CC\u062F</h3>
      <button class="text-on-surface-variant hover:text-white" onclick="closeModal('token-modal')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u0634\u0646\u0627\u0633\u0647 \u06A9\u0644\u06CC\u062F \u062F\u0633\u062A\u0631\u0633\u06CC (Key)</label>
        <div class="flex gap-2">
          <input type="text" id="t-key" class="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50">
          <button class="bg-white/5 border border-white/10 rounded-xl px-3 hover:bg-white/10 text-white" onclick="document.getElementById('t-key').value = crypto.randomUUID().replace(/-/g,'')">\u062A\u0648\u0644\u06CC\u062F</button>
        </div>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u0646\u0627\u0645 \u0631\u0628\u0627\u062A / \u06A9\u0627\u0631\u0628\u0631 \u062A\u0648\u06A9\u0646</label>
        <input type="text" id="t-name" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="\u0645\u062B\u0627\u0644: \u0631\u0628\u0627\u062A \u062A\u0644\u06AF\u0631\u0627\u0645\u06CC \u067E\u0646\u0647\u0627\u0646">
      </div>
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all mt-4" onclick="saveToken()">\u0630\u062E\u06CC\u0631\u0647 \u062A\u0648\u06A9\u0646</button>
    </div>
  </div>
</div>

<!-- Add Proxy IP Modal (Redesigned) -->
<div class="modal-overlay" id="proxyip-add-modal" onclick="closeModal('proxyip-add-modal')">
  <div class="modal-card" onclick="event.stopPropagation()">
    <div class="flex justify-between items-center mb-6">
      <h3 id="proxyip-add-modal-title" class="text-white font-bold text-lg">\u0627\u0641\u0632\u0648\u062F\u0646 Proxy IP \u062C\u062F\u06CC\u062F</h3>
      <button class="text-on-surface-variant hover:text-white" onclick="closeModal('proxyip-add-modal')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2 space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">\u0622\u06CC\u200C\u067E\u06CC (IPv4)</label>
          <input type="text" id="pi-ip" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" placeholder="1.2.3.4">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">\u067E\u0648\u0631\u062A</label>
          <input type="number" id="pi-port" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" value="443">
        </div>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u06A9\u0634\u0648\u0631 (\u06A9\u062F \u062F\u0648 \u062D\u0631\u0641\u06CC - \u062E\u0627\u0644\u06CC \u062C\u0647\u062A \u062A\u0634\u062E\u06CC\u0635 \u062E\u0648\u062F\u06A9\u0627\u0631)</label>
        <input type="text" id="pi-country" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" placeholder="\u0645\u062B\u0627\u0644: DE" maxlength="2" style="text-transform:uppercase">
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">\u0634\u0647\u0631 (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)</label>
          <input type="text" id="pi-city" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="Frankfurt">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">ISP (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)</label>
          <input type="text" id="pi-isp" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="Hetzner">
        </div>
      </div>
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all mt-4" onclick="saveProxyIP()">\u0630\u062E\u06CC\u0631\u0647 \u067E\u0631\u0648\u06A9\u0633\u06CC</button>
    </div>
  </div>
</div>

<!-- Import Proxy IP Modal (Redesigned) -->
<div class="modal-overlay" id="proxyip-import-modal" onclick="closeModal('proxyip-import-modal')">
  <div class="modal-card" onclick="event.stopPropagation()">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-white font-bold text-lg">\u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0644\u06CC\u0633\u062A \u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627</h3>
      <button class="text-on-surface-variant hover:text-white" onclick="closeModal('proxyip-import-modal')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u0641\u0631\u0645\u062A \u0644\u06CC\u0633\u062A</label>
        <select id="pi-import-format" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50">
          <option value="ip:port" class="bg-[#121212] text-white">ip:port (\u0647\u0631 \u062E\u0637 \u06CC\u06A9 \u0622\u06CC\u200C\u067E\u06CC)</option>
        </select>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">\u0644\u06CC\u0633\u062A \u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627</label>
        <textarea id="pi-import-text" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" rows="8" placeholder="1.2.3.4:443&#10;5.6.7.8:8443 # \u062A\u0648\u0636\u06CC\u062D"></textarea>
      </div>
      <span class="text-[10px] text-on-surface-variant/50 block">\u067E\u0633 \u0627\u0632 \u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627\u060C \u06A9\u0634\u0648\u0631 \u0647\u0631\u06A9\u062F\u0627\u0645 \u0628\u0647 \u0635\u0648\u0631\u062A \u062E\u0648\u062F\u06A9\u0627\u0631 \u06A9\u0648\u0626\u0631\u06CC \u0632\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.</span>
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all mt-4" onclick="importProxyIP()">\u0627\u06CC\u0645\u067E\u0648\u0631\u062A \u067E\u0631\u0648\u06A9\u0633\u06CC\u200C\u0647\u0627</button>
    </div>
  </div>
</div>

<div class="pip-toasts" id="pip-toasts"></div>

<script>
    const basePath = '/api';

    function showToast(msg, type) {
      type = type || 'info';
      const wrap = document.getElementById('pip-toasts');
      if (!wrap) return;
      const ico = type === 'ok' ? '\u2705' : (type === 'err' ? '\u274C' : '\u2139\uFE0F');
      const el = document.createElement('div');
      el.className = 'pip-toast ' + type;
      el.innerHTML = '<span class="tico">' + ico + '</span><span>' + msg + '</span>';
      wrap.appendChild(el);
      setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 260);
      }, 3200);
    }

    function nav(page) {
      document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('active');
      });
      document.querySelectorAll('aside nav button').forEach(b => {
        b.classList.remove('text-primary', 'font-bold', 'border-r-2', 'border-primary', 'bg-primary/5');
        b.classList.add('text-on-surface-variant', 'hover:bg-white/5', 'hover:text-primary');
      });
      
      const targetPage = document.getElementById('page-' + page);
      if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
      }
      
      const targetNav = document.getElementById('nav-' + page);
      if (targetNav) {
        targetNav.classList.add('text-primary', 'font-bold', 'border-r-2', 'border-primary', 'bg-primary/5');
        targetNav.classList.remove('text-on-surface-variant', 'hover:bg-white/5', 'hover:text-primary');
      }
      
      if (page === 'proxyip') {
        setTimeout(loadProxyIP, 50);
      }
    }

    function openModal(id) { document.getElementById(id).classList.add('active'); }
    function closeModal(id) { document.getElementById(id).classList.remove('active'); }

    function generateUUID() {
      document.getElementById('u-uuid').value = crypto.randomUUID();
    }
    
    function formatBytes(b) {
      if (!b) return "0 B";
      if (b < 1024) return b + " B";
      if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
      if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + " MB";
      return (b / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }

    // Client-side search filters
    let searchVal = '';
    function searchFilter(val) {
      searchVal = val.toLowerCase();
      // Apply filters for active page
      const activePage = document.querySelector('.page.active');
      if (activePage.id === 'page-users') {
        const rows = document.querySelectorAll('#users-tbody tr');
        rows.forEach(row => {
          const txt = row.textContent.toLowerCase();
          if (txt.includes(searchVal)) row.style.display = '';
          else row.style.display = 'none';
        });
      } else if (activePage.id === 'page-proxyip') {
        const rows = document.querySelectorAll('#proxyip-tbody tr');
        rows.forEach(row => {
          const txt = row.textContent.toLowerCase();
          if (txt.includes(searchVal)) row.style.display = '';
          else row.style.display = 'none';
        });
      }
    }

    async function loadUsers() {
      try {
        const res = await fetch(basePath + '/users');
        const data = await res.json();
        
        const totalUsers = data.users.length;
        const activeUsers = data.users.filter(u => u.enabled).length;
        document.getElementById('stat-total-users').textContent = totalUsers;
        document.getElementById('stat-active-users').textContent = activeUsers;
        
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';
        if (data.users.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="py-10 text-center text-on-surface-variant/50">\u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F</td></tr>';
          return;
        }
        data.users.forEach(u => {
          let expiryHTML = '<span class="text-on-surface-variant/70 text-xs">\u0646\u0627\u0645\u062D\u062F\u0648\u062F</span>';
          if (u.expiry_date) {
            const d = new Date(u.expiry_date);
            const pad = (n) => n.toString().padStart(2, '0');
            const abs = \`\${d.getFullYear()}/\${pad(d.getMonth() + 1)}/\${pad(d.getDate())} \${pad(d.getHours())}:\${pad(d.getMinutes())}\`;
            
            const diff = u.expiry_date - Date.now();
            let rel = '';
            let badgeClass = 'green';
            if (diff < 0) {
               rel = '\u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647';
               badgeClass = 'red';
            } else {
               const days = Math.floor(diff / 86400000);
               const hours = Math.floor((diff % 86400000) / 3600000);
               rel = days > 0 ? \`\${days} \u0631\u0648\u0632 \u0648 \${hours} \u0633\u0627\u0639\u062A\` : \`\${hours} \u0633\u0627\u0639\u062A\`;
            }
            
            expiryHTML = \`<div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
              <span style="font-size:12px; font-weight:600; direction:ltr;">\${abs}</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold \${badgeClass === 'green' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}">\${rel}</span>
            </div>\`;
          }
          let statusBadge = u.enabled ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary">\u0641\u0639\u0627\u0644</span>' : '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error">\u0645\u0633\u062F\u0648\u062F</span>';
          
          let connLimitLabel = u.conn_limit > 0 ? u.conn_limit : '\u221E';
          let activeConnsLabel = u.active_connections !== undefined ? u.active_connections : 0;
          let activeConnsColor = activeConnsLabel > 0 ? 'var(--success)' : 'var(--muted)';
          
          tbody.innerHTML += \`<tr class="group hover:bg-white/5 transition-colors">
            <td class="py-5 px-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                  <span class="material-symbols-outlined text-on-surface-variant">person</span>
                </div>
                <div>
                  <div class="text-white font-medium flex items-center gap-2">
                    \${u.name}
                    <button class="material-symbols-outlined text-xs hover:text-primary" onclick="editUser('\${u.id}', '\${u.name}', \${u.limit_bytes}, \${u.expiry_date}, '\${u.clean_ip}', \${u.conn_limit || 0}, '\${(u.proxy_ip || '').replace(/\\r?\\n/g, '\\\\n')}')">edit</button>
                  </div>
                </div>
              </div>
            </td>
            <td class="py-5 px-6">
              <div class="flex items-center gap-2 group/uuid">
                <code class="text-code-sm text-on-surface-variant/80 bg-white/5 px-2 py-1 rounded">\${u.id.substring(0,8)}...</code>
                <button class="material-symbols-outlined text-sm opacity-0 group-hover/uuid:opacity-100 hover:text-primary transition-all" onclick="navigator.clipboard.writeText('\${u.id}').then(() => showToast('UUID \u06A9\u067E\u06CC \u0634\u062F', 'ok'))">content_copy</button>
              </div>
            </td>
            <td class="py-5 px-6">
              <div class="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-white">
                \${statusBadge}
                <span class="text-on-surface-variant/70">\u{1F465} \${activeConnsLabel}/\${connLimitLabel}</span>
              </div>
            </td>
            <td class="py-5 px-6 text-on-surface-variant" style="direction:ltr; text-align:right;">
              <div class="w-32 inline-block">
                <div class="flex justify-between text-[10px] mb-1">
                  <span>\${formatBytes(u.used_bytes)}</span>
                  <span class="text-on-surface-variant/60">\${u.limit_bytes ? formatBytes(u.limit_bytes) : '\u221E'}</span>
                </div>
                <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-primary" style="width: \${u.limit_bytes ? Math.min(100, Math.round((u.used_bytes / u.limit_bytes) * 100)) : 0}%"></div>
                </div>
              </div>
            </td>
            <td class="py-5 px-6 text-on-surface-variant">
              \${expiryHTML}
            </td>
            <td class="py-5 px-6">
              <div class="flex items-center justify-end gap-2">
                <button class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/10 hover:bg-white/5 transition-all text-on-surface-variant" onclick="toggleUser('\${u.id}')">
                  \${u.enabled ? '\u0645\u0633\u062F\u0648\u062F\u0633\u0627\u0632\u06CC' : '\u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC'}
                </button>
                <button class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/10 hover:bg-white/5 transition-all text-on-surface-variant" onclick="window.open('https://\${window.location.hostname}/\${u.id}/sub', '_blank')">
                  \u0633\u0627\u0628
                </button>
                <button class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors" onclick="deleteUser('\${u.id}')">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </td>
          </tr>\`;
        });
      } catch(e) { console.error(e); }
    }
    
    async function saveUser() {
       const id = document.getElementById('u-uuid').value;
       const name = document.getElementById('u-name').value;
       let gb = parseFloat(document.getElementById('u-limit').value) || 0;
       let connLimit = parseInt(document.getElementById('u-connlimit').value) || 0;
       const expiryVal = document.getElementById('u-expiry').value;
       const clean = document.getElementById('u-cleanip').value;
       const proxyip = document.getElementById('u-proxyip').value;
       
       if (!id || !name) { showToast("\u0646\u0627\u0645 \u0648 UUID \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A!", 'err'); return; }
       
       const limit_bytes = gb * 1024 * 1024 * 1024;
       const expiry_date = expiryVal ? new Date(expiryVal).getTime() : 0;
       
       await fetch(basePath + '/users', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ 
           id, name, limit_bytes, expiry_date, 
           clean_ip: clean, proxy_ip: proxyip, 
           conn_limit: connLimit 
         })
       });
       closeModal('user-modal');
       loadUsers();
    }
    
    async function toggleUser(id) {
       await fetch(basePath + '/users/' + id + '/toggle', {method: 'POST'});
       loadUsers();
    }
    
    async function deleteUser(id) {
       if(confirm('\u0622\u06CC\u0627 \u0645\u0637\u0645\u0626\u0646 \u0647\u0633\u062A\u06CC\u062F\u061F')) {
          await fetch(basePath + '/users/' + id, {method: 'DELETE'});
          loadUsers();
       }
    }
    
    async function loadTokens() {
      try {
        const res = await fetch(basePath + '/tokens');
        const data = await res.json();
        const tbody = document.getElementById('tokens-tbody');
        tbody.innerHTML = '';
        data.tokens.forEach(t => {
          tbody.innerHTML += \`<tr class="group hover:bg-white/5 transition-colors">
            <td class="py-4 px-6 text-white font-medium">\${t.name}</td>
            <td class="py-4 px-6"><span class="font-mono text-sm bg-white/5 px-2 py-1 rounded text-primary-fixed">\${t.key}</span></td>
            <td class="py-4 px-6 text-left"><button class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all" onclick="deleteToken('\${t.key}')">\u062D\u0630\u0641 \u06A9\u0644\u06CC\u062F</button></td>
          </tr>\`;
        });
      } catch(e) { console.error(e); }
    }
    
    async function saveToken() {
       const key = document.getElementById('t-key').value;
       const name = document.getElementById('t-name').value;
       if (!key || !name) return;
       await fetch(basePath + '/tokens', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ key, name })
       });
       closeModal('token-modal');
       loadTokens();
    }
    
    async function deleteToken(key) {
       if (confirm('\u0622\u06CC\u0627 \u0645\u0627\u06CC\u0644 \u0628\u0647 \u062D\u0630\u0641 \u0627\u06CC\u0646 \u062A\u0648\u06A9\u0646 \u0647\u0633\u062A\u06CC\u062F\u061F')) {
         await fetch(basePath + '/tokens/' + key, {method: 'DELETE'});
         loadTokens();
       }
    }

    async function saveSettings() {
       const u = document.getElementById('st-uuid').value;
       const p = document.getElementById('st-pass').value;
       const prox = document.getElementById('st-proxy').value;
       const cfAcc = document.getElementById('st-cf-account').value;
       const cfTok = document.getElementById('st-cf-token').value;
       const payload = { uuid: u, proxyIP: prox, cfAccountId: cfAcc, cfApiToken: cfTok };
       if (p) payload.password = p;
       
       await fetch(basePath + '/settings', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify(payload)
       });
       showToast('\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.', 'ok');
       loadCfMetrics();
    }

    function openAddUserModal() {
      document.getElementById('u-uuid').value = '';
      document.getElementById('u-uuid').disabled = false;
      document.getElementById('u-name').value = '';
      document.getElementById('u-limit').value = 0;
      document.getElementById('u-connlimit').value = 0;
      document.getElementById('u-expiry').value = '';
      document.getElementById('u-cleanip').value = '';
      document.getElementById('u-proxyip').value = '';
      document.getElementById('user-modal-title').textContent = '\u0627\u0641\u0632\u0648\u062F\u0646 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F';
      generateUUID();
      openModal('user-modal');
    }

    function editUser(id, name, limitBytes, expiryDate, cleanIp, connLimit, proxyIp) {
      document.getElementById('u-uuid').value = id;
      document.getElementById('u-uuid').disabled = true;
      document.getElementById('u-name').value = name;
      document.getElementById('u-limit').value = limitBytes ? (limitBytes / (1024 * 1024 * 1024)).toFixed(2) : 0;
      document.getElementById('u-connlimit').value = connLimit || 0;
      
      if (expiryDate > 0) {
        const d = new Date(expiryDate);
        const pad = (n) => n.toString().padStart(2, '0');
        document.getElementById('u-expiry').value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      } else {
        document.getElementById('u-expiry').value = '';
      }
      document.getElementById('u-cleanip').value = cleanIp || '';
      document.getElementById('u-proxyip').value = proxyIp || '';
      document.getElementById('user-modal-title').textContent = '\u0648\u06CC\u0631\u0627\u06CC\u0634 \u06A9\u0627\u0631\u0628\u0631';
      openModal('user-modal');
    }

    async function loadCfMetrics() {
      try {
        const res = await fetch('/api/cf-metrics');
        const data = await res.json();
        if (data.ok) {
          const reqs = data.requestsUsed;
          const limit = data.limit;
          const percent = Math.min(100, Math.round((reqs / limit) * 100));
          document.getElementById('stat-cf-reqs').innerHTML = reqs.toLocaleString() + ' <span style="font-size:10px; color:#a1a1aa">/ ' + limit.toLocaleString() + '</span>';
          document.getElementById('cf-circle-container').style.display = 'block';
          document.getElementById('cf-circle-progress').setAttribute('stroke-dasharray', (percent * 1.758) + ', 175.8');
          document.getElementById('cf-circle-text').textContent = percent + '%';
          if (percent > 85) {
            document.getElementById('cf-circle-progress').setAttribute('stroke', 'var(--color-error)');
          } else if (percent > 60) {
            document.getElementById('cf-circle-progress').setAttribute('stroke', '#fbbf24');
          } else {
            document.getElementById('cf-circle-progress').setAttribute('stroke', 'var(--color-primary)');
          }
        } else {
          if (data.error && data.error !== 'Not Configured') {
            document.getElementById('stat-cf-reqs').innerHTML = '<span style="font-size:10px; color:var(--danger)">\u062E\u0637\u0627: ' + data.error + '</span>';
          } else {
            document.getElementById('stat-cf-reqs').innerHTML = '<span style="font-size:10px; color:#a1a1aa">\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647</span>';
          }
          document.getElementById('cf-circle-container').style.display = 'none';
        }
      } catch (e) {
        console.error(e);
      }
    }

    // ============ Proxy IP Manager ============
    let proxyIPData = [];
    let proxyIPSelectedRows = new Set();

    function countryToFlag(cc) {
      if (!cc || cc.length !== 2 || !/^[A-Za-z]{2}$/.test(cc)) return '\u{1F30D}';
      const A = 0x1F1E6;
      const up = cc.toUpperCase();
      return String.fromCodePoint(A + up.charCodeAt(0) - 65, A + up.charCodeAt(1) - 65);
    }

    const COUNTRY_NAMES_FA = {
      US: '\u0622\u0645\u0631\u06CC\u06A9\u0627', DE: '\u0622\u0644\u0645\u0627\u0646', NL: '\u0647\u0644\u0646\u062F', FR: '\u0641\u0631\u0627\u0646\u0633\u0647',
      GB: '\u0627\u0646\u06AF\u0644\u0633\u062A\u0627\u0646', SG: '\u0633\u0646\u06AF\u0627\u067E\u0648\u0631', JP: '\u0698\u0627\u067E\u0646', TR: '\u062A\u0631\u06A9\u06CC\u0647', CA: '\u06A9\u0627\u0646\u0627\u062F\u0627',
      FI: '\u0641\u0646\u0644\u0627\u0646\u062F', SE: '\u0633\u0648\u0626\u062F', RU: '\u0631\u0648\u0633\u06CC\u0647', PL: '\u0644\u0647\u0633\u062A\u0627\u0646', CH: '\u0633\u0648\u0626\u06CC\u0633',
      AT: '\u0627\u062A\u0631\u06CC\u0634', IT: '\u0627\u06CC\u062A\u0627\u0644\u06CC\u0627', ES: '\u0627\u0633\u067E\u0627\u0646\u06CC\u0627', AE: '\u0627\u0645\u0627\u0631\u0627\u062A', IN: '\u0647\u0646\u062F',
      HK: '\u0647\u0646\u06AF\u200C\u06A9\u0646\u06AF', KR: '\u06A9\u0631\u0647 \u062C\u0646\u0648\u0628\u06CC', AU: '\u0627\u0633\u062A\u0631\u0627\u0644\u06CC\u0627', BR: '\u0628\u0631\u0632\u06CC\u0644', CN: '\u0686\u06CC\u0646',
      UA: '\u0627\u0648\u06A9\u0631\u0627\u06CC\u0646', RO: '\u0631\u0648\u0645\u0627\u0646\u06CC', CZ: '\u0686\u06A9', BE: '\u0628\u0644\u0698\u06CC\u06A9', DK: '\u062F\u0627\u0646\u0645\u0627\u0631\u06A9',
      NO: '\u0646\u0631\u0648\u0698', IE: '\u0627\u06CC\u0631\u0644\u0646\u062F', LU: '\u0644\u0648\u06A9\u0632\u0627\u0645\u0628\u0648\u0631\u06AF', LT: '\u0644\u06CC\u062A\u0648\u0627\u0646\u06CC', LV: '\u0644\u062A\u0648\u0646\u06CC',
      EE: '\u0627\u0633\u062A\u0648\u0646\u06CC', BG: '\u0628\u0644\u063A\u0627\u0631\u0633\u062A\u0627\u0646', HU: '\u0645\u062C\u0627\u0631\u0633\u062A\u0627\u0646', PT: '\u067E\u0631\u062A\u063A\u0627\u0644', GR: '\u06CC\u0648\u0646\u0627\u0646',
      IL: '\u0627\u0633\u0631\u0627\u0626\u06CC\u0644', SA: '\u0639\u0631\u0628\u0633\u062A\u0627\u0646', QA: '\u0642\u0637\u0631', TW: '\u062A\u0627\u06CC\u0648\u0627\u0646', TH: '\u062A\u0627\u06CC\u0644\u0646\u062F',
      VN: '\u0648\u06CC\u062A\u0646\u0627\u0645', ID: '\u0627\u0646\u062F\u0648\u0646\u0632\u06CC', MY: '\u0645\u0627\u0644\u0632\u06CC', PH: '\u0641\u06CC\u0644\u06CC\u067E\u06CC\u0646', ZA: '\u0622\u0641\u0631\u06CC\u0642\u0627\u06CC \u062C\u0646\u0648\u0628\u06CC'
    };
    function countryName(cc) {
      if (!cc) return '\u2014';
      return COUNTRY_NAMES_FA[cc.toUpperCase()] || cc.toUpperCase();
    }

    async function loadProxyIP() {
      try {
        const res = await fetch(basePath + '/proxyip');
        if (!res.ok) throw new Error('Failed to load proxy IPs');
        const data = await res.json();
        proxyIPData = data.proxyip || [];
        renderProxyIPTable();
        updateProxyIPStats();
      } catch (e) {
        console.error(e);
        document.getElementById('proxyip-tbody').innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 40px; color:#a1a1aa;">\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC: ' + e.message + '</td></tr>';
      }
    }

    function updateProxyIPStats() {
      const total = proxyIPData.length;
      const active = proxyIPData.filter(p => p.status === 'active').length;
      const avgPing = active > 0 ? Math.round(proxyIPData.filter(p => p.status === 'active').reduce((a, b) => a + (b.ping || 0), 0) / active) : 0;
      
      document.getElementById('stat-total-proxyip').textContent = total;
      document.getElementById('stat-active-proxyip').textContent = active;
      document.getElementById('stat-avg-ping').textContent = avgPing > 0 ? avgPing + ' ms' : '--';
    }

    let proxyTableRenderId = 0;

    
    let proxyIPSearchVal = '';
    let currentProxyIPPage = 1;
    const PROXY_IP_PER_PAGE = 100;

    function renderProxyIPTable() {
      const tbody = document.getElementById('proxyip-tbody');
      const countryFilter = document.getElementById('proxyip-filter-country')?.value || '';
      const statusFilter = document.getElementById('proxyip-filter-status')?.value || '';

      let filtered = proxyIPData;
      if (countryFilter) filtered = filtered.filter(p => p.country === countryFilter);
      if (statusFilter) filtered = filtered.filter(p => p.status === statusFilter);
      if (proxyIPSearchVal) {
        filtered = filtered.filter(p => {
          const txt = (p.ip + ' ' + p.port + ' ' + (p.country || '') + ' ' + (p.city || '') + ' ' + (p.isp || '')).toLowerCase();
          return txt.includes(proxyIPSearchVal);
        });
      }

      const totalPages = Math.ceil(filtered.length / PROXY_IP_PER_PAGE) || 1;
      if (currentProxyIPPage > totalPages) currentProxyIPPage = totalPages;
      if (currentProxyIPPage < 1) currentProxyIPPage = 1;

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="py-10 text-center text-on-surface-variant/40"><div class="text-3xl mb-2">\u2601\uFE0F</div>\u0647\u06CC\u0686 \u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC\u200C\u0627\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F</td></tr>';
        const pagination = document.getElementById('proxyip-pagination');
        if (pagination) pagination.innerHTML = '';
        updateSelectionToolbar();
        return;
      }

      const startIdx = (currentProxyIPPage - 1) * PROXY_IP_PER_PAGE;
      const pageData = filtered.slice(startIdx, startIdx + PROXY_IP_PER_PAGE);

      const html = pageData.map((p, offset) => {
        const idx = startIdx + offset;
        const st = p.status === 'active' ? 'on' : (p.status === 'slow' ? 'slow' : (p.status === 'unknown' ? 'unk' : 'off'));
        const stText = p.status === 'active' ? '\u0641\u0639\u0627\u0644' : (p.status === 'slow' ? '\u06A9\u0646\u062F' : (p.status === 'unknown' ? '\u0646\u0627\u0645\u0634\u062E\u0635' : '\u0645\u0631\u062F\u0647'));
        const pingTxt = p.status === 'active' || p.status === 'slow' ? (p.ping || 0) + ' ms' : '-';
        const pingCls = p.ping == null ? '' : (p.ping < 300 ? 'good' : (p.ping < 800 ? 'mid' : 'bad'));
        
        let flag = countryToFlag(p.country);
        let cname = countryName(p.country);
        let loc = p.city ? cname + ' \u2014 ' + p.city : cname;
        const key = p.ip + ':' + p.port;
        const isSel = proxyIPSelectedRows.has(key);

        return '
' +
        '        <tr class="group hover:bg-white/5 transition-all ' + (isSel ? 'bg-primary/5' : '') + '">
' +
        '          <td class="py-4 px-6 text-center">
' +
        '            <input type="checkbox" class="pip-check proxyip-checkbox rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30" value="' + key + '" ' + (isSel ? 'checked' : '') + ' onchange="toggleProxyIPSelection(this)">
' +
        '          </td>
' +
        '          <td class="py-4 px-6 text-center text-on-surface-variant/60 font-semibold text-xs">' + (idx + 1) + '</td>
' +
        '          <td class="py-4 px-6 font-mono text-sm tracking-wide text-white">' + p.ip + '</td>
' +
        '          <td class="py-4 px-6 font-mono text-xs text-on-surface-variant/70"><span class="bg-white/5 px-2 py-1 rounded">' + p.port + '</span></td>
' +
        '          <td class="py-4 px-6 text-sm text-on-surface-variant"><span class="mr-2">' + flag + '</span> ' + loc + '</td>
' +
        '          <td class="py-4 px-6 text-xs text-on-surface-variant/80 max-w-[150px] truncate" title="' + (p.isp || '') + '">' + (p.isp || '-') + '</td>
' +
        '          <td class="py-4 px-6 font-mono font-bold text-xs"><span class="' + (pingCls === 'good' ? 'text-tertiary' : (pingCls === 'mid' ? 'text-secondary' : 'text-error')) + '">' + pingTxt + '</span></td>
' +
        '          <td class="py-4 px-6">
' +
        '            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ' + (st === 'on' ? 'bg-tertiary/10 text-tertiary' : (st === 'slow' ? 'bg-secondary/10 text-secondary' : (st === 'unk' ? 'bg-white/5 text-on-surface-variant/60' : 'bg-error/10 text-error'))) + '">
' +
        '              <span class="w-1.5 h-1.5 rounded-full ' + (st === 'on' ? 'bg-tertiary' : (st === 'slow' ? 'bg-secondary' : (st === 'unk' ? 'bg-on-surface-variant/60' : 'bg-error'))) + '"></span>
' +
        '              ' + stText + '
' +
        '            </span>
' +
        '          </td>
' +
        '          <td class="py-4 px-6">
' +
        '            <div class="flex items-center justify-end gap-2">
' +
        '              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" onclick="testProxyIP('' + p.ip + '', ' + p.port + ', event)" title="\u062A\u0633\u062A \u0627\u062A\u0635\u0627\u0644">
' +
        '                <span class="material-symbols-outlined text-sm">bolt</span>
' +
        '              </button>
' +
        '              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors" onclick="deleteProxyIP('' + p.ip + '', ' + p.port + ')" title="\u062D\u0630\u0641">
' +
        '                <span class="material-symbols-outlined text-sm">delete</span>
' +
        '              </button>
' +
        '            </div>
' +
        '          </td>
' +
        '        </tr>';
      }).join('');
      
tbody.innerHTML = html;
      updateSelectionToolbar();

      // Update Pagination UI
      const pagination = document.getElementById('proxyip-pagination');
      if (pagination) {
          const paginationHtml = '
' +
            '            <div class="flex items-center justify-between w-full p-4 bg-white/5 border-t border-white/5 text-sm text-on-surface-variant">
' +
            '              <div>\u0646\u0645\u0627\u06CC\u0634 ' + (startIdx + 1) + ' \u062A\u0627 ' + Math.min(startIdx + PROXY_IP_PER_PAGE, filtered.length) + ' \u0627\u0632 ' + filtered.length + ' \u0622\u06CC\u200C\u067E\u06CC</div>
' +
            '              <div class="flex items-center gap-2">
' +
            '                <button class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
' +
            '                  onclick="changeProxyIPPage(-1)" ' + (currentProxyIPPage === 1 ? 'disabled' : '') + '>\u0642\u0628\u0644\u06CC</button>
' +
            '                <span class="px-3">\u0635\u0641\u062D\u0647 ' + currentProxyIPPage + ' \u0627\u0632 ' + totalPages + '</span>
' +
            '                <button class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
' +
            '                  onclick="changeProxyIPPage(1)" ' + (currentProxyIPPage === totalPages ? 'disabled' : '') + '>\u0628\u0639\u062F\u06CC</button>
' +
            '              </div>
' +
            '            </div>';
          pagination.innerHTML = paginationHtml;
      }
    }

    window.changeProxyIPPage = function(delta) {
      currentProxyIPPage += delta;
      renderProxyIPTable();
    }
    
    function filterProxyIP() {
      renderProxyIPTable();
    }

    async function pingIPClient(ip, port, timeoutMs = 2500) {
      const start = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        await fetch('https://' + ip + ':' + port + '/cdn-cgi/trace', {
          mode: 'no-cors',
          signal: controller.signal
        });
        clearTimeout(timeout);
        const ping = Date.now() - start;
        return { ip, port, ping, status: 'active' };
      } catch (e) {
        clearTimeout(timeout);
        return { ip, port, ping: null, status: 'dead' };
      }
    }

    async function refreshAllProxyIP(e) {
      const btn = e && e.target ? e.target.closest('button') : null;
      let originalText = '';
      if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '\u{1F504} \u062F\u0631 \u062D\u0627\u0644 \u062A\u0633\u062A...';
        btn.disabled = true;
      }

      try {
        const results = [];
        const batchSize = 10;
        
        for (let i = 0; i < proxyIPData.length; i += batchSize) {
          const batch = proxyIPData.slice(i, i + batchSize);
          if (btn) btn.innerHTML = '\u{1F504} \u062F\u0631 \u062D\u0627\u0644 \u062A\u0633\u062A (' + i + '/' + proxyIPData.length + ')...';
          const batchResults = await Promise.all(batch.map(p => pingIPClient(p.ip, p.port)));
          results.push(...batchResults);
        }

        if (btn) btn.innerHTML = '\u{1F4BE} \u062F\u0631 \u062D\u0627\u0644 \u0630\u062E\u06CC\u0631\u0647...';

        const res = await fetch(basePath + '/proxyip/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results })
        });
        const data = await res.json();
        if (data.ok) {
          showToast('\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0645\u0648\u0641\u0642: ' + results.filter(r => r.status === 'active').length + ' \u0622\u06CC\u200C\u067E\u06CC \u0641\u0639\u0627\u0644', 'ok');
          await loadProxyIP();
        } else {
          alert('\u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647\u200C\u0633\u0627\u0632\u06CC \u0646\u062A\u0627\u06CC\u062C: ' + (data.error || '\u0646\u0627\u0645\u0634\u062E\u0635'));
        }
      } catch (e) {
        alert('\u062E\u0637\u0627 \u062F\u0631 \u062A\u0633\u062A \u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627: ' + e.message);
      } finally {
        if (btn) {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      }
    }

    async function testProxyIP(ip, port, ev) {
        const btn = ev && ev.target ? ev.target.closest('button') : null;
        let original = null;
        if (btn) { original = btn.innerHTML; btn.classList.add('spin'); btn.innerHTML = '<span class="material-symbols-outlined spin text-sm">sync</span>'; }
  
        try {
          const resTest = await fetch(basePath + '/proxyip/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ips: [{ip, port}] })
          });
          const testData = await resTest.json();
          if (!testData.ok || !testData.results || testData.results.length === 0) throw new Error('Test failed');
          
          const r = testData.results[0];

          const res = await fetch(basePath + '/proxyip/bulk-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: [r] })
          });
          const data = await res.json();
          if (data.ok) {
            if (r.status === 'active' || r.status === 'slow') {
              showToast(ip + ' \u0641\u0639\u0627\u0644 \u0627\u0633\u062A \u0628\u0627 \u067E\u06CC\u0646\u06AF ' + r.ping + 'ms', 'ok');
            } else {
              showToast(ip + ' \u067E\u0627\u0633\u062E \u0646\u062F\u0627\u062F (\u0645\u0631\u062F\u0647)', 'err');
            }
            const item = proxyIPData.find(p => p.ip === ip && p.port == port);
            if (item) { item.status = r.status; item.ping = r.ping; item.last_check = Date.now(); }
            renderProxyIPTable();
            updateProxyIPStats();
          } else {
            alert('\u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647\u200C\u0633\u0627\u0632\u06CC \u0646\u062A\u06CC\u062C\u0647: ' + (data.error || '\u0646\u0627\u0634\u0646\u0627\u062E\u062A\u0647'));
          }
        } catch (e) {
          alert('\u062E\u0637\u0627: ' + e.message);
        } finally {
          if (btn) { btn.innerHTML = original; btn.classList.remove('spin'); }
        }
      }

      async function deleteProxyIP(ip, port) {
      if (!confirm(\`\u0622\u06CC\u0627 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u06CC\u062F \${ip}:\${port} \u0631\u0627 \u062D\u0630\u0641 \u06A9\u0646\u06CC\u062F\u061F\`)) return;

      try {
        const res = await fetch(basePath + '/proxyip', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, port })
        });
        const data = await res.json();
        if (data.ok) loadProxyIP();
        else alert('\u062E\u0637\u0627: ' + (data.error || '\u0646\u0627\u0645\u0634\u062E\u0635'));
      } catch (e) {
        alert('\u062E\u0637\u0627: ' + e.message);
      }
    }

    // Proxy IP Import Modal
    function openProxyIPImportModal() {
      document.getElementById('pi-import-text').value = '';
      document.getElementById('pi-import-format').value = 'ip:port';
      openModal('proxyip-import-modal');
    }

    async function importProxyIP() {
      const text = document.getElementById('pi-import-text').value.trim();
      const format = document.getElementById('pi-import-format').value;
      if (!text) { alert('\u0645\u062A\u0646 \u062E\u0627\u0644\u06CC \u0627\u0633\u062A'); return; }
      
      try {
        const res = await fetch(basePath + '/proxyip/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, format })
        });
        const data = await res.json();
        if (data.ok) {
          closeModal('proxyip-import-modal');
          alert('\u2705 ' + (data.count || 0) + ' \u0622\u06CC\u200C\u067E\u06CC \u0648\u0627\u0631\u062F \u0634\u062F');
          loadProxyIP();
        } else {
          alert('\u062E\u0637\u0627: ' + (data.error || '\u0646\u0627\u0645\u0634\u062E\u0635'));
        }
      } catch (e) {
        alert('\u062E\u0637\u0627: ' + e.message);
      }
    }

    async function deleteSelectedProxyIP() {
      if (proxyIPSelectedRows.size === 0) { alert('\u0647\u06CC\u0686 \u0622\u06CC\u200C\u067E\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0634\u062F\u0647'); return; }
      if (!confirm(\`\u0622\u06CC\u0627 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u06CC\u062F \${proxyIPSelectedRows.size} \u0622\u06CC\u200C\u067E\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u062F\u0647 \u0631\u0627 \u062D\u0630\u0641 \u06A9\u0646\u06CC\u062F\u061F\`)) return;
      
      const ips = Array.from(proxyIPSelectedRows).map(v => {
        const [ip, port] = v.split(':');
        return { ip, port: parseInt(port) };
      });
      
      try {
        const res = await fetch(basePath + '/proxyip/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ips })
        });
        const data = await res.json();
        if (data.ok) {
          proxyIPSelectedRows.clear();
          loadProxyIP();
        } else {
          alert('\u062E\u0637\u0627: ' + (data.error || '\u0646\u0627\u0645\u0634\u062E\u0635'));
        }
      } catch (e) {
        alert('\u062E\u0637\u0627: ' + e.message);
      }
    }


// Init

    loadUsers();
    loadTokens();
    loadCfMetrics();

  <\/script>
</body>
</html>`;
}

// src/index.js
async function testProxyIPConnection(ip, port = 443) {
  const start = Date.now();
  const timeoutMs = 5e3;
  let socket;
  try {
    socket = connect4({ hostname: ip, port: parseInt(port) });
    const writer = socket.writable.getWriter();
    const req = `GET /__down?bytes=5000 HTTP/1.1\r
Host: speed.cloudflare.com\r
Connection: close\r
\r
`;
    await writer.write(new TextEncoder().encode(req));
    writer.releaseLock();
    const reader = socket.readable.getReader();
    const readPromise = reader.read();
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    });
    timeoutPromise.catch(() => {
    });
    const { value, done } = await Promise.race([readPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    reader.releaseLock();
    try {
      socket.close();
    } catch (e) {
    }
    if (!value || done)
      return { ok: false, ping: 0, status: "dead" };
    const responseText = new TextDecoder().decode(value);
    const isBadRequest = /^HTTP\/1\.[01] 400/.test(responseText);
    const hasCFRay = /cf-ray:/i.test(responseText);
    if (isBadRequest && hasCFRay) {
      const ping = Date.now() - start;
      return { ok: true, ping, status: ping > 1500 ? "slow" : "active" };
    } else {
      return { ok: false, ping: 0, status: "dead" };
    }
  } catch (e) {
    if (socket) {
      try {
        socket.close();
      } catch (e2) {
      }
    }
    return { ok: false, ping: 0, status: "dead" };
  }
}
var rateLimitMap = /* @__PURE__ */ new Map();
var usersCache = null;
var usersCacheTime = 0;
async function getAllUsers(env) {
  if (usersCache && Date.now() - usersCacheTime < 1e4)
    return usersCache;
  if (!env.DB)
    return [];
  try {
    const { results } = await env.DB.prepare("SELECT * FROM users").all();
    usersCache = results;
    usersCacheTime = Date.now();
    return results;
  } catch (e) {
    return [];
  }
}
async function getAllTokens(env) {
  if (!env.DB)
    return [];
  try {
    const { results } = await env.DB.prepare("SELECT * FROM api_keys").all();
    return results;
  } catch (e) {
    return [];
  }
}
var proxyPoolCache = null;
var proxyPoolCacheTime = 0;
async function getProxyPoolString(env) {
  if (!env.DB)
    return "";
  if (proxyPoolCache !== null && Date.now() - proxyPoolCacheTime < 3e4)
    return proxyPoolCache;
  try {
    let { results } = await env.DB.prepare(
      "SELECT ip, port FROM proxyip WHERE status = 'active' ORDER BY ping ASC LIMIT 50"
    ).all();
    if (!results || results.length === 0) {
      ({ results } = await env.DB.prepare(
        "SELECT ip, port FROM proxyip ORDER BY last_check DESC LIMIT 50"
      ).all());
    }
    const str = (results || []).map((r) => r.port && r.port !== 443 ? `${r.ip}:${r.port}` : `${r.ip}`).join("\n");
    proxyPoolCache = str;
    proxyPoolCacheTime = Date.now();
    return str;
  } catch (e) {
    return proxyPoolCache || "";
  }
}
var src_default = {
  async fetch(request, env, ctx) {
    try {
      await setupD1Schema(env);
      let currentProxyIPRaw = await getSettingD1(env, "proxy_ip") || env.PROXYIP || "";
      let currentPanelPass = await getSettingD1(env, "panel_pass") || env.PANEL_PASSWORD || env.PASSWORD || "";
      let currentAdminUUID = await getSettingD1(env, "uuid") || env.UUID || "";
      let cfAccountId = await getSettingD1(env, "cf_account_id") || "";
      let cfApiToken = await getSettingD1(env, "cf_api_token") || "";
      const upgradeHeader = request.headers.get("Upgrade");
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
        if (!env.DB)
          return true;
        let user = usersCache?.find((u) => u.id === userID);
        if (!user)
          return true;
        const total = upload + download;
        user.used_bytes += total;
        pendingUsageBytes += total;
        const now = Date.now();
        if (pendingUsageBytes >= 512 * 1024 || now - lastUsageUpdate > 5e3 && pendingUsageBytes > 0) {
          const bytesToUpdate = pendingUsageBytes;
          pendingUsageBytes = 0;
          lastUsageUpdate = now;
          ctx.waitUntil(updateUsageD1(env, userID, bytesToUpdate).catch(console.error));
        }
        if (user.limit_bytes > 0 && user.used_bytes >= user.limit_bytes)
          return false;
        if (user.expiry_date > 0 && now > user.expiry_date)
          return false;
        return true;
      };
      if (upgradeHeader === "websocket") {
        const decodedPath = decodeURIComponent(path).toLowerCase();
        const pool = await getProxyPoolString(env);
        const effectiveProxyIP = [currentProxyIPRaw, pool].filter(Boolean).join("\n");
        if (decodedPath.includes("trojan-ws") || decodedPath.includes("trojan")) {
          return await trojanOverWSHandler(request, authenticate, effectiveProxyIP, onUsage);
        } else {
          return await vlessOverWSHandler(request, authenticate, effectiveProxyIP, onUsage);
        }
      }
      const isSetupComplete = !!currentPanelPass && !!currentAdminUUID && !!env.DB;
      if (!isSetupComplete) {
        if (path === "/panel" || path === "/") {
          return new Response(setupPage(!!env.DB, !!currentPanelPass, !!currentAdminUUID, currentAdminUUID, currentProxyIPRaw), {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
      }
      if (path === "/") {
        return new Response(nginxPage(), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Server": "nginx/1.24.0" } });
      }
      if (path === "/panel") {
        const host = request.headers.get("Host");
        if (currentPanelPass && !await isAuthed(request, currentPanelPass)) {
          return new Response(loginPage("/panel", host), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
        }
        return new Response(panelPage(host, currentAdminUUID, currentProxyIPRaw, cfAccountId, cfApiToken), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
      if (path === "/panel/panel-auth" && request.method === "POST") {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const now = Date.now();
        const rl = rateLimitMap.get(ip) || { count: 0, time: now };
        if (now - rl.time > 6e4) {
          rl.count = 0;
          rl.time = now;
        }
        rl.count++;
        rateLimitMap.set(ip, rl);
        if (rl.count > 10)
          return new Response(JSON.stringify({ ok: false, error: "Too Many Requests" }), { status: 429 });
        const body = (await request.text()).trim();
        if (body === currentPanelPass) {
          const hashedToken = await hashPassword(currentPanelPass);
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": "panel_auth=" + hashedToken + "; Path=/; Max-Age=86400; SameSite=Lax; Secure"
            }
          });
        }
        return new Response(JSON.stringify({ ok: false }), { status: 200 });
      }
      const checkApiAuth = async (req) => {
        return await checkMasterAuth(req, env, currentPanelPass);
      };
      if (path.startsWith("/api/")) {
        if (!await checkApiAuth(request)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/users") {
          if (request.method === "GET") {
            const users = await getAllUsers(env);
            const usersWithConns = users.map((u) => ({
              ...u,
              active_connections: getActiveConnectionCount(u.id)
            }));
            return new Response(JSON.stringify({ ok: true, users: usersWithConns }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
          if (request.method === "POST") {
            const b = await request.json();
            const proxyIpVal = b.proxy_ip !== void 0 ? b.proxy_ip.trim() : "";
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
              b.id,
              b.name,
              b.clean_ip || "",
              proxyIpVal,
              b.limit_bytes || 0,
              b.expiry_date || 0,
              b.enabled === false ? 0 : 1,
              b.conn_limit || 0
            ).run();
            usersCache = null;
            return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
        }
        if (path.startsWith("/api/users/") && request.method === "DELETE") {
          const id = path.split("/").pop();
          await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
          usersCache = null;
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path.startsWith("/api/users/") && path.endsWith("/toggle") && request.method === "POST") {
          const id = path.split("/")[3];
          await env.DB.prepare("UPDATE users SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = ?").bind(id).run();
          usersCache = null;
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/tokens") {
          if (request.method === "GET") {
            const tokens = await getAllTokens(env);
            return new Response(JSON.stringify({ ok: true, tokens }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
          if (request.method === "POST") {
            const b = await request.json();
            await env.DB.prepare("INSERT INTO api_keys (key, name, scopes, created_at) VALUES (?, ?, ?, ?)").bind(b.key, b.name, b.scopes || "api", Date.now()).run();
            return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
        }
        if (path.startsWith("/api/tokens/") && request.method === "DELETE") {
          const key = path.split("/").pop();
          await env.DB.prepare("DELETE FROM api_keys WHERE key = ?").bind(key).run();
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/settings" && request.method === "POST") {
          const b = await request.json();
          if (b.proxyIP !== void 0)
            await setSettingD1(env, "proxy_ip", b.proxyIP.trim());
          if (b.password !== void 0)
            await setSettingD1(env, "panel_pass", b.password.trim());
          if (b.uuid !== void 0 && isValidUUID(b.uuid.trim()))
            await setSettingD1(env, "uuid", b.uuid.trim());
          if (b.cfAccountId !== void 0)
            await setSettingD1(env, "cf_account_id", b.cfAccountId.trim());
          if (b.cfApiToken !== void 0)
            await setSettingD1(env, "cf_api_token", b.cfApiToken.trim());
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/cf-metrics" && request.method === "GET") {
          const accountId = await getSettingD1(env, "cf_account_id");
          const apiToken = await getSettingD1(env, "cf_api_token");
          if (!accountId || !apiToken) {
            return new Response(JSON.stringify({ ok: false, error: "Not Configured" }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
          const now = /* @__PURE__ */ new Date();
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
            const cfRes = await fetch("https://api.cloudflare.com/client/v4/graphql", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ query })
            });
            const cfData = await cfRes.json();
            if (cfData.errors && cfData.errors.length > 0) {
              return new Response(JSON.stringify({ ok: false, error: cfData.errors[0].message }), { status: 200, headers: { "Content-Type": "application/json" } });
            }
            const accounts = cfData?.data?.viewer?.accounts;
            let requestsUsed = 0;
            if (accounts && accounts.length > 0 && accounts[0].workersInvocationsAdaptive && accounts[0].workersInvocationsAdaptive.length > 0) {
              requestsUsed = accounts[0].workersInvocationsAdaptive[0].sum.requests || 0;
            }
            return new Response(JSON.stringify({ ok: true, requestsUsed, limit: 1e5 }), { status: 200, headers: { "Content-Type": "application/json" } });
          } catch (e) {
            return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
        }
        if (path.startsWith("/api/proxyip") && request.method !== "GET") {
          proxyPoolCache = null;
        }
        if (path === "/api/proxyip/test" && request.method === "POST") {
          const b = await request.json();
          const ips = b.ips;
          if (!ips || !Array.isArray(ips))
            return new Response(JSON.stringify({ ok: false, error: "invalid data" }), { status: 400 });
          const testPromises = ips.map(async (p) => {
            const res = await testProxyIPConnection(p.ip, p.port);
            return { ip: p.ip, port: p.port, ...res };
          });
          const results = await Promise.all(testPromises);
          return new Response(JSON.stringify({ ok: true, results }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/proxyip" && request.method === "GET") {
          if (!env.DB)
            return new Response(JSON.stringify({ ok: false, error: "DB not available" }), { status: 500, headers: { "Content-Type": "application/json" } });
          const { results } = await env.DB.prepare("SELECT * FROM proxyip ORDER BY status DESC, ping ASC").all();
          return new Response(JSON.stringify({ ok: true, proxyip: results }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/proxyip" && request.method === "POST") {
          if (!env.DB)
            return new Response(JSON.stringify({ ok: false, error: "DB not available" }), { status: 500, headers: { "Content-Type": "application/json" } });
          const b = await request.json();
          const { ip, port, country, city, isp } = b;
          if (!ip)
            return new Response(JSON.stringify({ ok: false, error: "IP is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
          const p = parseInt(b.port) || 443;
          let geoCountry = (b.country || "").trim();
          let geoCity = (b.city || "").trim();
          let geoIsp = (b.isp || "").trim();
          if (!geoCountry && /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
            const g = await detectCountry(ip);
            if (g) {
              geoCountry = g.country;
              geoCity = geoCity || g.city;
              geoIsp = geoIsp || g.isp;
            }
          }
          try {
            await env.DB.prepare(`INSERT INTO proxyip (ip, port, country, city, isp, status, last_check) VALUES (?, ?, ?, ?, ?, 'unknown', ?)
                    ON CONFLICT(ip, port) DO UPDATE SET country=excluded.country, city=excluded.city, isp=excluded.isp`).bind(ip, p, geoCountry, geoCity, geoIsp, Date.now()).run();
            return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
          } catch (e) {
            return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
          }
        }
        if (path === "/api/proxyip" && request.method === "DELETE") {
          if (!env.DB)
            return new Response(JSON.stringify({ ok: false, error: "DB not available" }), { status: 500, headers: { "Content-Type": "application/json" } });
          const b = await request.json();
          const { ip, port } = b;
          if (!ip)
            return new Response(JSON.stringify({ ok: false, error: "IP is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
          const p = parseInt(port) || 443;
          try {
            await env.DB.prepare("DELETE FROM proxyip WHERE ip = ? AND port = ?").bind(ip, p).run();
            return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
          } catch (e) {
            return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
          }
        }
        if (path === "/api/proxyip/bulk-update" && request.method === "POST") {
          if (!env.DB)
            return new Response(JSON.stringify({ ok: false, error: "DB not available" }), { status: 500, headers: { "Content-Type": "application/json" } });
          const b = await request.json();
          const { results } = b;
          if (!Array.isArray(results) || results.length === 0) {
            return new Response(JSON.stringify({ ok: false, error: "Invalid data format" }), { status: 400, headers: { "Content-Type": "application/json" } });
          }
          const statements = results.map((r) => {
            return env.DB.prepare(`UPDATE proxyip SET status = ?, ping = ?, last_check = ? WHERE ip = ? AND port = ?`).bind(r.status, r.ping, Date.now(), r.ip, r.port);
          });
          try {
            await env.DB.batch(statements);
            proxyPoolCache = null;
            return new Response(JSON.stringify({ ok: true, updated: results.length }), { status: 200, headers: { "Content-Type": "application/json" } });
          } catch (e) {
            return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
          }
        }
        async function detectCountry(ip) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3e3);
            const resp = await fetch("http://ip-api.com/json/" + ip + "?fields=countryCode,country,regionName,city,isp,org,as", {
              signal: controller.signal,
              cf: { resolveTimeout: 2e3 }
            });
            clearTimeout(timeout);
            if (!resp.ok)
              return null;
            const data = await resp.json();
            if (data.countryCode) {
              return {
                country: data.countryCode,
                // ISO code: IR, US, DE, etc.
                countryName: data.country,
                // Full name
                city: data.city || "",
                isp: data.isp || data.org || data.as || ""
              };
            }
          } catch (e) {
            console.error("GeoIP error for", ip, e.message);
          }
          return null;
        }
        async function batchDetectCountries(ips) {
          const out = /* @__PURE__ */ new Map();
          if (!ips.length)
            return out;
          for (let i = 0; i < ips.length; i += 100) {
            const chunk = ips.slice(i, i + 100);
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 8e3);
              const resp = await fetch("http://ip-api.com/batch?fields=status,countryCode,country,city,isp,org,as,query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(chunk),
                signal: controller.signal
              });
              clearTimeout(timeout);
              if (!resp.ok)
                continue;
              const arr = await resp.json();
              if (Array.isArray(arr)) {
                for (const d of arr) {
                  if (d && d.status === "success" && d.countryCode) {
                    out.set(d.query, {
                      country: d.countryCode,
                      city: d.city || "",
                      isp: d.isp || d.org || d.as || ""
                    });
                  }
                }
              }
            } catch (e) {
              console.error("Batch GeoIP error:", e.message);
            }
            if (i + 100 < ips.length)
              await new Promise((r) => setTimeout(r, 4200));
          }
          return out;
        }
        if (path === "/api/proxyip/fetch" && request.method === "POST") {
          try {
            const colo = request.cf && request.cf.colo ? String(request.cf.colo) : "";
            const sources = [
              "https://raw.githubusercontent.com/cmliu/edgetunnel/main/proxyip.txt",
              "https://raw.githubusercontent.com/cmliu/edgetunnel/main/CF-CIDR.txt"
            ];
            const coloDomains = [
              "proxyip.cmliu.com",
              "proxyip.fxxk.dedyn.io"
            ];
            let allIPs = [];
            for (const source of sources) {
              try {
                const resp = await fetch(source);
                if (resp.ok) {
                  const text = await resp.text();
                  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
                  allIPs.push(...lines);
                }
              } catch (e) {
                console.error("Failed to fetch from", source, e);
              }
            }
            let coloCount = 0;
            for (const d of coloDomains) {
              try {
                const coloIPs = await fetchColoProxyIPs(d, colo);
                for (const cip of coloIPs) {
                  allIPs.push(cip);
                  coloCount++;
                }
              } catch (e) {
                console.error("colo resolve failed for", d, e);
              }
            }
            const validIPs = [];
            for (const line of allIPs) {
              const match = line.match(/^([\d\.]+)(?::(\d+))?(?:\s*#\s*(.+))?$/);
              if (match) {
                validIPs.push({
                  ip: match[1],
                  port: parseInt(match[2]) || 443,
                  remark: match[3] || ""
                });
              }
            }
            const MAX_FETCH = 300;
            const toInsert = validIPs.slice(0, MAX_FETCH);
            let inserted = 0;
            try {
              const insertStatements = toInsert.map((item) => {
                return env.DB.prepare(`INSERT INTO proxyip (ip, port, country, city, isp, status, last_check) VALUES (?, ?, '', '', '', 'unknown', ?)
                                      ON CONFLICT(ip, port) DO NOTHING`).bind(item.ip, item.port, Date.now());
              });
              if (insertStatements.length > 0) {
                const batchResults = await env.DB.batch(insertStatements);
                inserted = batchResults.reduce((acc, curr) => {
                  const chg = curr.meta ? curr.meta.changes || 0 : curr.success !== false ? 1 : 0;
                  return acc + chg;
                }, 0);
              }
            } catch (e) {
              console.error("Batch insert error in fetch:", e.message);
            }
            try {
              const ipList = [...new Set(toInsert.map((p) => p.ip).filter((ip) => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)))];
              const geoMap = await batchDetectCountries(ipList);
              const updateStatements = [];
              for (const item of toInsert) {
                const geo = geoMap.get(item.ip);
                if (!geo)
                  continue;
                updateStatements.push(
                  env.DB.prepare("UPDATE proxyip SET country = ?, city = ?, isp = ? WHERE ip = ? AND port = ?").bind(geo.country, geo.city, geo.isp, item.ip, item.port)
                );
              }
              if (updateStatements.length > 0) {
                await env.DB.batch(updateStatements);
              }
            } catch (e) {
              console.error("Batch update error in fetch:", e.message);
            }
            return new Response(JSON.stringify({ ok: true, count: inserted }), { status: 200, headers: { "Content-Type": "application/json" } });
          } catch (e) {
            return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
          }
        }
        if (path === "/api/proxyip/import" && request.method === "POST") {
          const b = await request.json();
          const { text, format } = b;
          if (!text)
            return new Response(JSON.stringify({ ok: false, error: "Text is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
          let lines = text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
          const parsed = [];
          for (const line of lines) {
            const match = line.match(/^([\d\.]+):(\d+)(?:\s*#\s*(.+))?$/) || line.match(/^([\d\.]+)$/);
            if (match) {
              parsed.push({ ip: match[1], port: parseInt(match[2]) || 443 });
            }
          }
          let inserted = 0;
          try {
            const insertStatements = parsed.map((item) => {
              return env.DB.prepare(`INSERT INTO proxyip (ip, port, country, city, isp, status, last_check) VALUES (?, ?, '', '', '', 'unknown', ?)
                                    ON CONFLICT(ip, port) DO NOTHING`).bind(item.ip, item.port, Date.now());
            });
            if (insertStatements.length > 0) {
              const batchResults = await env.DB.batch(insertStatements);
              inserted = batchResults.reduce((acc, curr) => {
                const chg = curr.meta ? curr.meta.changes || 0 : curr.success !== false ? 1 : 0;
                return acc + chg;
              }, 0);
            }
          } catch (e) {
            console.error("Batch insert error in import:", e.message);
          }
          try {
            const ipList = [...new Set(parsed.map((p) => p.ip).filter((ip) => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)))];
            const geoMap = await batchDetectCountries(ipList);
            const updateStatements = [];
            for (const item of parsed) {
              const geo = geoMap.get(item.ip);
              if (!geo)
                continue;
              updateStatements.push(
                env.DB.prepare("UPDATE proxyip SET country = ?, city = ?, isp = ? WHERE ip = ? AND port = ?").bind(geo.country, geo.city, geo.isp, item.ip, item.port)
              );
            }
            if (updateStatements.length > 0) {
              await env.DB.batch(updateStatements);
            }
          } catch (e) {
            console.error("Batch update error in import:", e.message);
          }
          return new Response(JSON.stringify({ ok: true, count: inserted }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/proxyip/bulk-delete" && request.method === "POST") {
          const b = await request.json();
          const { ips } = b;
          if (!Array.isArray(ips) || ips.length === 0)
            return new Response(JSON.stringify({ ok: false, error: "Invalid data" }), { status: 400, headers: { "Content-Type": "application/json" } });
          let deleted = 0;
          try {
            const deleteStatements = ips.map((item) => {
              return env.DB.prepare("DELETE FROM proxyip WHERE ip = ? AND port = ?").bind(item.ip, item.port);
            });
            if (deleteStatements.length > 0) {
              const batchResults = await env.DB.batch(deleteStatements);
              deleted = batchResults.reduce((acc, curr) => {
                const chg = curr.meta ? curr.meta.changes || 0 : curr.success !== false ? 1 : 0;
                return acc + chg;
              }, 0);
            }
          } catch (e) {
            console.error("Batch delete error:", e.message);
          }
          return new Response(JSON.stringify({ ok: true, deleted }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/proxyip/detect-countries" && request.method === "POST") {
          if (!env.DB)
            return new Response(JSON.stringify({ ok: false, error: "DB not available" }), { status: 500, headers: { "Content-Type": "application/json" } });
          const { results: dbResults } = await env.DB.prepare("SELECT * FROM proxyip WHERE country = '' OR country IS NULL LIMIT 100").all();
          if (!dbResults.length) {
            return new Response(JSON.stringify({ ok: true, updated: 0 }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
          const ipList = [...new Set(dbResults.map((r) => r.ip).filter((ip) => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)))];
          const geoMap = await batchDetectCountries(ipList);
          let updated = 0;
          try {
            const updateStatements = [];
            for (const item of dbResults) {
              const geo = geoMap.get(item.ip) || { country: "\u{1F30D}", city: "", isp: "" };
              updateStatements.push(
                env.DB.prepare("UPDATE proxyip SET country = ?, city = ?, isp = ? WHERE ip = ? AND port = ?").bind(geo.country, geo.city, geo.isp, item.ip, item.port)
              );
            }
            if (updateStatements.length > 0) {
              const batchResults = await env.DB.batch(updateStatements);
              updated = batchResults.reduce((acc, curr) => {
                const chg = curr.meta ? curr.meta.changes || 0 : curr.success !== false ? 1 : 0;
                return acc + chg;
              }, 0);
            }
          } catch (e) {
            console.error("Batch update error in detect-countries:", e.message);
          }
          return new Response(JSON.stringify({ ok: true, updated }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ ok: false, error: "Not Found" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      if (path.endsWith("/sub")) {
        const parts = path.split("/");
        const subId = parts[1] === "sub" ? parts[2] : parts[1];
        const users = await getAllUsers(env);
        const user = users.find((u) => u.id === subId);
        if (user) {
          const host = request.headers.get("Host");
          const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();
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
          const randomizeCase = (str) => str.split("").map((c) => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join("");
          const randomSNI = randomizeCase(host);
          const junkVal = Math.random().toString(36).substring(2, 10);
          const vlessPathObj = { junk: junkVal, protocol: "vl" };
          const trojanPathObj = { junk: junkVal, protocol: "tr" };
          const vlessObfuscatedPath = "/" + btoa(JSON.stringify(vlessPathObj));
          const trojanObfuscatedPath = "/trojan-" + btoa(JSON.stringify(trojanPathObj));
          const addr = user.clean_ip || host;
          const userProxyIPs = parseProxyIps(user.proxy_ip || currentProxyIPRaw);
          const proxyIpNote = userProxyIPs.length > 1 ? ` (${userProxyIPs.length} IPs)` : "";
          const vlessWS = `vless://${user.id}@${addr}:443?encryption=none&security=tls&sni=${randomSNI}&fp=chrome&alpn=http%2F1.1&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(vlessObfuscatedPath + "?ed=2048")}#VLESS-${user.name}${proxyIpNote}`;
          const trojanWS = `trojan://${user.id}@${addr}:443?security=tls&sni=${randomSNI}&fp=chrome&alpn=http%2F1.1&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(trojanObfuscatedPath)}#Trojan-${user.name}${proxyIpNote}`;
          let multiProxyExport = "";
          if (userProxyIPs.length > 0) {
            userProxyIPs.forEach((pip, idx) => {
              if (!pip)
                return;
              const pipLabel = pip.includes(":") ? pip.split(":")[0] : pip;
              multiProxyExport += `
${vlessWS.replace("#VLESS-", `#VLESS-${user.name}-${pipLabel}`)}
`;
              multiProxyExport += `${trojanWS.replace("#Trojan-", `#Trojan-${user.name}-${pipLabel}`)}
`;
            });
          }
          const uriOutput = vlessWS + "\n" + trojanWS + (multiProxyExport ? "\n" + multiProxyExport : "");
          if (isBrowser) {
            return new Response(subscriptionPage(host, user, vlessWS, trojanWS), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
          }
          return new Response(btoa(unescape(encodeURIComponent(uriOutput))), {
            status: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
        }
        return new Response(nginxPage(), {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8", "Server": "nginx/1.24.0" }
        });
      }
      if (path === "/panel/save-uuid" && request.method === "POST") {
        const body = (await request.text()).trim();
        if (isValidUUID(body))
          await setSettingD1(env, "uuid", body);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      if (path === "/panel/save-password" && request.method === "POST") {
        const body = (await request.text()).trim();
        await setSettingD1(env, "panel_pass", body);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      return new Response(nginxPage(), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8", "Server": "nginx/1.24.0" }
      });
    } catch (err) {
      console.error(err);
      const msg = err && (err.stack || err.message) || String(err);
      return new Response("Internal Server Error: " + msg, { status: 500 });
    }
  }
};
export {
  src_default as default
};

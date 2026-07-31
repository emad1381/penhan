// src/helpers.js
var WS_READY_STATE_OPEN = 1;
var WS_READY_STATE_CLOSING = 2;
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
      enabled BOOLEAN DEFAULT 1
    );`,
    `CREATE TABLE IF NOT EXISTS api_keys (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
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
    throw new Error("D1 database binding is unavailable");
  try {
    await env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key, value).run();
  } catch (e) {
    console.error("Setting save error", e);
    throw e;
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
import { connect } from "cloudflare:sockets";
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
async function handleTCPOutBound(remoteSocketWrapper, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, proxyIP, log, onDownload) {
  async function connectAndWrite(address, port) {
    const tcpSocket = connect({ hostname: address, port });
    remoteSocketWrapper.value = tcpSocket;
    log("connected to " + address + ":" + port);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(rawClientData);
    writer.releaseLock();
    tcpSocket.closed.catch((error) => {
      log("tcpSocket closed: " + error);
    }).finally(() => {
      remoteSocketWrapper.value = null;
    });
    return tcpSocket;
  }
  async function retry() {
    if (!proxyIP) {
      log("no proxy IP configured, retry impossible");
      webSocket.close(1011, "Connection failed: no proxy IP");
      return;
    }
    log("retrying with proxy IP: " + proxyIP);
    try {
      const tcpSocket = await connectAndWrite(proxyIP, portRemote);
      remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log, onDownload);
    } catch (err) {
      log("retry connect failed: " + err);
      webSocket.close(1011, "Retry failed: " + err);
    }
  }
  try {
    const tcpSocket = await connectAndWrite(addressRemote, portRemote);
    await remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retry, log, onDownload);
  } catch (error) {
    log("first connection attempt failed: " + error);
    if (proxyIP) {
      retry();
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
      const userObj = await authenticate(userID);
      if (!userObj || !userObj.enabled) {
        log("user auth failed or disabled");
        throw new Error("user not found or disabled");
      }
      activeUserID = userObj.id;
      const proxyIP = userObj.proxy_ip || defaultProxyIP;
      address = addressRemote;
      portWithRandomLog = "" + portRemote + "--" + Math.random() + " " + (isUDP ? "udp" : "tcp");
      if (hasError) {
        log("header parse error: " + message);
        throw new Error(message);
      }
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
      handleTCPOutBound(remoteSocketWrapper, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, proxyIP, log, handleDownload);
    },
    close() {
      log("readableWebSocketStream closed");
    },
    abort(reason) {
      log("readableWebSocketStream aborted", JSON.stringify(reason));
    }
  })).catch((err) => {
    log("pipeTo error", err);
    safeCloseWebSocket(webSocket);
  });
  return new Response(null, { status: 101, webSocket: client });
}

// src/trojan.js
import { connect as connect2 } from "cloudflare:sockets";
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
      const userObj = await authenticate(clientHash);
      if (!userObj || !userObj.enabled) {
        log("user auth failed or disabled");
        throw new Error("user not found or disabled");
      }
      activeUserID = userObj.id;
      const proxyIP = userObj.proxy_ip || defaultProxyIP;
      address = addressRemote;
      portWithRandomLog = "" + portRemote + "--" + Math.random() + " " + (isUDP ? "udp" : "tcp");
      if (hasError) {
        log("header parse error: " + message);
        throw new Error(message);
      }
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
      handleTCPOutBound(remoteSocketWrapper, addressRemote, portRemote, rawClientData, webSocket, new Uint8Array([]), proxyIP, log, handleDownload);
    },
    close() {
      log("readableWebSocketStream closed");
    },
    abort(reason) {
      log("readableWebSocketStream aborted", JSON.stringify(reason));
    }
  })).catch((err) => {
    log("pipeTo error", err);
    safeCloseWebSocket(webSocket);
  });
  return new Response(null, { status: 101, webSocket: client });
}

// src/proxy-ip.js
var DOH_ENDPOINT = "https://cloudflare-dns.com/dns-query";
var PROXY_IP_DOMAIN_SUFFIX = "proxyip.cmliussss.net";
var DISCOVERY_CACHE_TTL_MIN = 60;
var DISCOVERY_CACHE_TTL_MAX = 300;
var METADATA_CACHE_TTL = 86400;
var MAX_PROXY_RECORDS = 32;
var REQUEST_TIMEOUT_MS = 2500;
var ProxyIpError = class extends Error {
  constructor(code, message, status = 503) {
    super(message);
    this.code = code;
    this.status = status;
  }
};
function jsonHeaders(maxAge) {
  return {
    "Content-Type": "application/json",
    "Cache-Control": `public, max-age=${maxAge}`
  };
}
function getCache() {
  return typeof caches !== "undefined" && caches.default ? caches.default : null;
}
function cacheRequest(namespace, key) {
  return new Request(`https://proxy-ip-cache.invalid/${namespace}/${encodeURIComponent(key)}`);
}
async function getCachedJson(namespace, key) {
  const cache = getCache();
  if (!cache)
    return null;
  try {
    const response = await cache.match(cacheRequest(namespace, key));
    return response ? await response.json() : null;
  } catch (error) {
    return null;
  }
}
async function putCachedJson(namespace, key, value, maxAge) {
  const cache = getCache();
  if (!cache)
    return;
  try {
    await cache.put(cacheRequest(namespace, key), new Response(JSON.stringify(value), {
      headers: jsonHeaders(maxAge)
    }));
  } catch (error) {
    console.warn("Proxy IP cache write failed", error);
  }
}
async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new ProxyIpError("UPSTREAM_TIMEOUT", "Proxy IP provider did not respond in time.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
function isValidIPv4(value) {
  if (typeof value !== "string" || !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value))
    return false;
  return value.split(".").every((segment) => {
    const parsed = Number(segment);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 255;
  });
}
function isValidIPv6(value) {
  if (typeof value !== "string" || value.length < 2 || value.length > 45)
    return false;
  if (!/^[0-9a-f:]+$/i.test(value) || value.includes(":::"))
    return false;
  const compressed = value.split("::");
  if (compressed.length > 2)
    return false;
  const groups = (part) => part ? part.split(":") : [];
  const left = groups(compressed[0]);
  const right = compressed.length === 2 ? groups(compressed[1]) : [];
  const allGroups = left.concat(right);
  if (!allGroups.every((group) => /^[0-9a-f]{1,4}$/i.test(group)))
    return false;
  return compressed.length === 2 ? allGroups.length < 8 : allGroups.length === 8;
}
function isValidIpAddress(value) {
  return isValidIPv4(value) || isValidIPv6(value);
}
function normalizeColo(value) {
  const colo = String(value || "").trim().toUpperCase();
  return /^[A-Z0-9]{3}$/.test(colo) ? colo : null;
}
function getIngressColo(request) {
  const colo = normalizeColo(request.cf && request.cf.colo);
  if (!colo) {
    throw new ProxyIpError("COLO_UNAVAILABLE", "Cloudflare ingress colo is unavailable for this request.");
  }
  return colo;
}
function buildProxyHostname(colo) {
  const normalizedColo = normalizeColo(colo);
  if (!normalizedColo) {
    throw new ProxyIpError("COLO_UNAVAILABLE", "Cloudflare ingress colo is unavailable for this request.");
  }
  return `${normalizedColo.toLowerCase()}.${PROXY_IP_DOMAIN_SUFFIX}`;
}
function clampDiscoveryTtl(records) {
  const ttls = records.map((record) => Number(record.ttl)).filter((ttl2) => Number.isFinite(ttl2) && ttl2 > 0);
  const ttl = ttls.length ? Math.min(...ttls) : DISCOVERY_CACHE_TTL_MIN;
  return Math.max(DISCOVERY_CACHE_TTL_MIN, Math.min(DISCOVERY_CACHE_TTL_MAX, ttl));
}
async function queryDoh(name, type) {
  const url = new URL(DOH_ENDPOINT);
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);
  let response;
  try {
    response = await fetchWithTimeout(url.toString(), {
      headers: { Accept: "application/dns-json" }
    });
  } catch (error) {
    if (error instanceof ProxyIpError)
      throw error;
    throw new ProxyIpError("DNS_LOOKUP_FAILED", "Unable to resolve Proxy IP records.");
  }
  if (!response.ok) {
    throw new ProxyIpError("DNS_LOOKUP_FAILED", "Unable to resolve Proxy IP records.");
  }
  try {
    return await response.json();
  } catch (error) {
    throw new ProxyIpError("DNS_LOOKUP_FAILED", "Unable to resolve Proxy IP records.");
  }
}
async function resolveDnsFamily(hostname, queryType, answerType, family) {
  const result = await queryDoh(hostname, queryType);
  if (result.Status !== 0) {
    return {
      records: [],
      warning: `${family} DNS lookup returned status ${result.Status}.`
    };
  }
  const records = [];
  for (const answer of Array.isArray(result.Answer) ? result.Answer : []) {
    if (answer.type !== answerType || !isValidIpAddress(answer.data))
      continue;
    records.push({
      address: answer.data,
      family,
      ttl: Math.max(0, Number(answer.TTL) || 0)
    });
  }
  return { records, warning: null };
}
function deduplicateRecords(records) {
  const seen = /* @__PURE__ */ new Set();
  return records.filter((record) => {
    const key = record.address.toLowerCase();
    if (seen.has(key))
      return false;
    seen.add(key);
    return true;
  });
}
function expandIPv6(address) {
  const parts = address.split("::");
  const left = parts[0] ? parts[0].split(":") : [];
  const right = parts[1] ? parts[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  const groups = left.concat(Array(Math.max(0, missing)).fill("0"), right);
  return groups.map((group) => group.padStart(4, "0")).join("");
}
function teamCymruOrigin(address) {
  if (isValidIPv4(address)) {
    return `${address.split(".").reverse().join(".")}.origin.asn.cymru.com`;
  }
  const expanded = expandIPv6(address);
  return `${expanded.split("").reverse().join(".")}.origin6.asn.cymru.com`;
}
function cleanTxtValue(value) {
  return String(value || "").trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
}
async function queryTxt(name) {
  const result = await queryDoh(name, "TXT");
  if (result.Status !== 0)
    return [];
  return (Array.isArray(result.Answer) ? result.Answer : []).filter((answer) => answer.type === 16 && typeof answer.data === "string").map((answer) => cleanTxtValue(answer.data)).filter(Boolean);
}
function countryNameFa(code) {
  if (!code || !/^[A-Z]{2}$/.test(code))
    return "\u0646\u0627\u0645\u0634\u062E\u0635";
  try {
    return new Intl.DisplayNames(["fa"], { type: "region" }).of(code) || code;
  } catch (error) {
    return code;
  }
}
async function getIpMetadata(address) {
  const cacheKey = address.toLowerCase();
  const cached = await getCachedJson("metadata-v1", cacheKey);
  if (cached)
    return cached;
  try {
    const originAnswers = await queryTxt(teamCymruOrigin(address));
    const originFields = (originAnswers[0] || "").split("|").map((value) => value.trim());
    const asnNumber = originFields[0];
    const countryCode = (originFields[1] || "").toUpperCase();
    if (!/^\d+$/.test(asnNumber))
      throw new Error("Invalid ASN answer");
    const asnAnswers = await queryTxt(`AS${asnNumber}.asn.cymru.com`);
    const asnFields = (asnAnswers[0] || "").split("|").map((value) => value.trim());
    const metadata = {
      metadataStatus: "ok",
      isp: {
        asn: `AS${asnNumber}`,
        name: asnFields[4] || "\u0646\u0627\u0645 \u0634\u0628\u06A9\u0647 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A"
      },
      country: {
        code: /^[A-Z]{2}$/.test(countryCode) ? countryCode : "--",
        name: countryNameFa(countryCode)
      }
    };
    await putCachedJson("metadata-v1", cacheKey, metadata, METADATA_CACHE_TTL);
    return metadata;
  } catch (error) {
    return {
      metadataStatus: "unavailable",
      isp: { asn: "--", name: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0634\u0628\u06A9\u0647 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A" },
      country: { code: "--", name: "\u0646\u0627\u0645\u0634\u062E\u0635" }
    };
  }
}
async function enrichRecords(records) {
  const enriched = [];
  const queue = [...records];
  const workerCount = Math.min(4, queue.length);
  async function worker() {
    while (queue.length) {
      const record = queue.shift();
      const metadata = await getIpMetadata(record.address);
      enriched.push({ ...record, ...metadata });
    }
  }
  await Promise.all(Array.from({ length: workerCount }, worker));
  return records.map((record) => enriched.find((item) => item.address === record.address) || record);
}
async function resolveProxyRecords(request, { refresh = false, enrich = true } = {}) {
  const colo = getIngressColo(request);
  const hostname = buildProxyHostname(colo);
  const cacheKey = colo.toLowerCase();
  if (!refresh) {
    const cached = await getCachedJson("discovery-v1", cacheKey);
    if (cached)
      return cached;
  }
  const [ipv4Result, ipv6Result] = await Promise.allSettled([
    resolveDnsFamily(hostname, "A", 1, "IPv4"),
    resolveDnsFamily(hostname, "AAAA", 28, "IPv6")
  ]);
  if (ipv4Result.status === "rejected" && ipv6Result.status === "rejected") {
    throw new ProxyIpError("DNS_LOOKUP_FAILED", "Unable to resolve Proxy IP records.");
  }
  const warnings = [];
  const records = [];
  for (const [family, result] of [["IPv4", ipv4Result], ["IPv6", ipv6Result]]) {
    if (result.status === "fulfilled") {
      records.push(...result.value.records);
      if (result.value.warning)
        warnings.push(result.value.warning);
    } else {
      warnings.push(`${family} records could not be retrieved.`);
    }
  }
  const uniqueRecords = deduplicateRecords(records);
  if (uniqueRecords.length > MAX_PROXY_RECORDS) {
    throw new ProxyIpError("TOO_MANY_RECORDS", "The Proxy IP DNS response contains too many records.");
  }
  const response = {
    colo,
    records: enrich ? await enrichRecords(uniqueRecords) : uniqueRecords,
    partial: warnings.length > 0,
    warnings
  };
  if (!response.partial) {
    await putCachedJson("discovery-v1", cacheKey, response, clampDiscoveryTtl(uniqueRecords));
  }
  return response;
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
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
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07070c;
      --card-bg: rgba(18, 18, 30, 0.6);
      --border: rgba(255, 255, 255, 0.08);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.3);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --error: #ef4444;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Vazirmatn, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow-x: hidden;
      position: relative;
    }

    body::before, body::after {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      opacity: 0.15;
      filter: blur(50px);
      z-index: -1;
    }
    body::before { top: 15%; left: 15%; }
    body::after { bottom: 15%; right: 15%; }

    .login-container {
      width: 100%;
      max-width: 400px;
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      text-align: center;
      position: relative;
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .icon-wrapper {
      width: 72px;
      height: 72px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 32px;
      color: var(--accent);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    h1 {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #a78bfa, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 30px;
    }

    .input-field {
      width: 100%;
      padding: 14px 16px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border);
      border-radius: 14px;
      color: var(--text);
      font-size: 15px;
      outline: none;
      transition: all 0.3s ease;
      text-align: center;
      direction: ltr;
      margin-bottom: 8px;
    }

    .input-field:focus {
      border-color: var(--accent);
      background: rgba(139, 92, 246, 0.05);
      box-shadow: 0 0 0 4px var(--accent-glow);
    }

    .error-msg {
      font-size: 12px;
      color: var(--error);
      margin-bottom: 20px;
      min-height: 18px;
      transition: all 0.3s;
      opacity: 0;
    }

    .error-msg.visible { opacity: 1; }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #7c3aed, #db2777);
      border: none;
      border-radius: 14px;
      color: white;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
    }

    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(124, 58, 237, 0.5);
    }

    .btn-login:active { transform: translateY(0); }

    .toast {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(239, 68, 68, 0.9);
      backdrop-filter: blur(8px);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      opacity: 0;
      pointer-events: none;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
</head>
<body>
  <div class="toast" id="toast"></div>

  <div class="login-container">
    <div class="icon-wrapper">\u{1F512}</div>
    <h1>\u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0646\u0647\u0627\u0646</h1>
    <p class="subtitle">\u0628\u0631\u0627\u06CC \u0648\u0631\u0648\u062F \u0628\u0647 \u0628\u062E\u0634 \u0645\u062F\u06CC\u0631\u06CC\u062A\u060C \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F</p>
    
    <input type="password" class="input-field" id="passInput" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autofocus autocomplete="current-password">
    <div class="error-msg" id="error"></div>

    <button class="btn-login" id="loginBtn" onclick="doLogin()">\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644</button>
  </div>

  <script>
    const path = window.location.pathname;
    const bp = path.endsWith('/panel-login') ? path.slice(0, -12) : (path.endsWith('/') ? path.slice(0, -1) : path);

    async function doLogin() {
      const input = document.getElementById('passInput');
      const p = input.value.trim();
      const btn = document.getElementById('loginBtn');
      const err = document.getElementById('error');

      if (!p) {
        err.textContent = '\u274C \u0644\u0637\u0641\u0627\u064B \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F';
        err.classList.add('visible');
        return;
      }

      err.classList.remove('visible');
      btn.textContent = '\u062F\u0631 \u062D\u0627\u0644 \u0628\u0631\u0631\u0633\u06CC...';
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
          err.textContent = '\u274C \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A';
          err.classList.add('visible');
          input.value = '';
          input.focus();
        }
      } catch (e) {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631');
      } finally {
        btn.textContent = '\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644';
        btn.disabled = false;
      }
    }

    document.getElementById('passInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        doLogin();
      }
    });

    function showToast(m) {
      const t = document.getElementById('toast');
      t.textContent = m;
      t.classList.add('show');
      setTimeout(function() { t.classList.remove('show'); }, 3000);
    }
  <\/script>
</body>
</html>`;
}
function setupPage(hasD1, hasPassword, hasUUID, currentUUID, currentProxyIP) {
  const allGood = hasD1 && hasPassword && hasUUID;
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u067E\u0646\u0644 \u067E\u0646\u0647\u0627\u0646</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07070e;
      --card-bg: rgba(18, 18, 30, 0.45);
      --border: rgba(255, 255, 255, 0.06);
      --accent: #a855f7;
      --accent-glow: rgba(168, 85, 247, 0.25);
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: Vazirmatn, system-ui, -apple-system, sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; overflow-x: hidden; position: relative; }
    
    .blob { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, var(--accent) 0%, transparent 70%); opacity: 0.12; filter: blur(80px); z-index: -1; pointer-events: none; }
    .blob-1 { top: -10%; left: -10%; }
    .blob-2 { bottom: -10%; right: -10%; }

    .container { width: 100%; max-width: 650px; background: var(--card-bg); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border: 1px solid var(--border); border-radius: 32px; padding: 48px 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05); }
    
    .logo-area { text-align: center; margin-bottom: 32px; }
    .logo-icon { font-size: 40px; margin-bottom: 12px; display: inline-block; animation: float 3s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    
    h1 { font-family: Vazirmatn, sans-serif; font-size: 26px; font-weight: 850; margin-bottom: 8px; text-align: center; background: linear-gradient(135deg, #c084fc, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { text-align: center; font-size: 14px; color: var(--text-muted); margin-bottom: 36px; line-height: 1.6; }
    
    .card-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
    .variable-card { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border); border-radius: 20px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; }
    .variable-card:hover { border-color: rgba(168, 85, 247, 0.3); transform: translateY(-2px); }
    
    .card-details { flex: 1; padding-left: 20px; text-align: right; }
    .card-title { font-size: 16px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .desc { font-size: 13px; color: var(--text-muted); margin-top: 6px; line-height: 1.6; }
    
    .code { font-family: 'Outfit', monospace; font-size: 12px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); padding: 2px 8px; border-radius: 6px; color: #e9d5ff; white-space: nowrap; direction: ltr; display: inline-block; margin: 2px 0; }
    .value-display { font-family: 'Outfit', monospace; font-size: 11px; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; color: #cbd5e1; direction: ltr; display: inline-block; word-break: break-all; margin-top: 4px; }
    
    .badge { padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; transition: 0.2s; }
    .badge.ok { background: rgba(16, 185, 129, 0.08); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.15); }
    .badge.fail { background: rgba(239, 68, 68, 0.08); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.15); }
    .badge.info { background: rgba(168, 85, 247, 0.08); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.15); }
    
    .success-panel { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1)); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 24px; padding: 28px; text-align: center; animation: pulseGlow 2s infinite alternate; }
    @keyframes pulseGlow { 0% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.05); } 100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.15); } }
    .success-title { font-size: 18px; font-weight: 800; color: #34d399; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .success-desc { font-size: 13px; color: var(--text); line-height: 1.6; margin-bottom: 20px; }
    
    .action-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; border: none; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3); }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(168, 85, 247, 0.45); }
    
    .warning-panel { text-align: center; padding: 16px; border-radius: 16px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.15); color: #fbbf24; font-size: 13px; font-weight: 500; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>

  <div class="container">
    <div class="logo-area">
      <div class="logo-icon">\u{1F52E}</div>
      <h1>\u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u067E\u0646\u0644 \u067E\u0646\u0647\u0627\u0646</h1>
      <div class="subtitle">\u0628\u0631\u0627\u06CC \u0634\u0631\u0648\u0639 \u0628\u0647 \u06A9\u0627\u0631 \u067E\u0631\u0648\u06A9\u0633\u06CC\u060C \u0648\u0636\u0639\u06CC\u062A \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 \u0648 \u0645\u062A\u063A\u06CC\u0631\u0647\u0627 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u0648 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F.</div>
    </div>

    <div class="card-list">
      <!-- Database Card -->
      <div class="variable-card">
        <div class="card-details">
          <div class="card-title">\u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 Cloudflare D1</div>
          <div class="desc">\u0628\u0631\u0627\u06CC \u0630\u062E\u06CC\u0631\u0647\u200C\u0633\u0627\u0632\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0648 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0633\u06CC\u0633\u062A\u0645 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A. \u0646\u0627\u0645 \u0628\u0627\u06CC\u0646\u062F\u06CC\u0646\u06AF \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 \u0631\u0627 \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u062F\u0642\u06CC\u0642\u0627\u064B <span class="code">DB</span> \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.</div>
        </div>
        <div class="badge ${hasD1 ? "ok" : "fail"}">${hasD1 ? "\u0645\u062A\u0635\u0644 \u0634\u062F\u0647" : "\u0645\u062A\u0635\u0644 \u0646\u06CC\u0633\u062A"}</div>
      </div>
      
      <!-- Password Card -->
      <div class="variable-card">
        <div class="card-details">
          <div class="card-title">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u062F\u0645\u06CC\u0646 <span class="code">PANEL_PASSWORD</span></div>
          <div class="desc">\u062C\u0647\u062A \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A. \u06CC\u06A9 \u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC \u0628\u0627 \u0627\u06CC\u0646 \u0646\u0627\u0645 \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0633\u0627\u0632\u06CC\u062F (\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0645\u06CC\u200C\u0634\u0648\u062F \u0622\u0646 \u0631\u0627 Encrypt \u06A9\u0646\u06CC\u062F).</div>
        </div>
        <div class="badge ${hasPassword ? "ok" : "fail"}">${hasPassword ? "\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647" : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647"}</div>
      </div>

      <!-- UUID Card -->
      <div class="variable-card">
        <div class="card-details">
          <div class="card-title">\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 <span class="code">UUID</span></div>
          <div class="desc">\u0634\u0646\u0627\u0633\u0647 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0633\u06CC\u0633\u062A\u0645. \u06CC\u06A9 \u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC \u0628\u0627 \u0646\u0627\u0645 <span class="code">UUID</span> \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0633\u0627\u0632\u06CC\u062F.<br>${currentUUID ? `\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC: <span class="value-display">${currentUUID}</span>` : ""}</div>
        </div>
        <div class="badge ${hasUUID ? "ok" : "fail"}">${hasUUID ? "\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647" : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647"}</div>
      </div>

      <!-- Proxy IP Card -->
      <div class="variable-card">
        <div class="card-details">
          <div class="card-title">\u0622\u06CC\u200C\u067E\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC <span class="code">PROXYIP</span></div>
          <div class="desc">\u0622\u06CC\u200C\u067E\u06CC \u062A\u0645\u06CC\u0632 \u06CC\u0627 \u067E\u0631\u0648\u06A9\u0633\u06CC \u067E\u06CC\u0634\u200C\u0641\u0631\u0636. ${currentProxyIP ? `\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC: <span class="value-display">${currentProxyIP}</span>` : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647."}</div>
        </div>
        <div class="badge info">\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC</div>
      </div>
    </div>

    ${allGood ? `
    <div class="success-panel">
      <div class="success-title">\u{1F389} \u0633\u06CC\u0633\u062A\u0645 \u06A9\u0627\u0645\u0644\u0627\u064B \u0622\u0645\u0627\u062F\u0647 \u0627\u0633\u062A!</div>
      <div class="success-desc">\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC\u200C\u0647\u0627 \u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F. \u0627\u0632 \u0627\u06CC\u0646 \u067E\u0633 \u0628\u0627 \u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0622\u062F\u0631\u0633 \u0648\u0631\u06A9\u0631\u060C \u0635\u0641\u062D\u0647 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 Nginx \u062C\u0647\u062A \u0627\u0633\u062A\u062A\u0627\u0631 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u062E\u0648\u0627\u0647\u062F \u0634\u062F.</div>
      <button class="action-btn" onclick="window.location.href='/panel'">\u{1F6AA} \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A</button>
    </div>
    ` : `
    <div class="warning-panel">
      \u26A0\uFE0F \u062A\u0627 \u0632\u0645\u0627\u0646\u06CC \u06A9\u0647 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 D1 \u0648 \u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC \u0628\u0627\u0644\u0627 \u0631\u0627 \u0628\u0647 \u062F\u0631\u0633\u062A\u06CC \u062A\u0646\u0638\u06CC\u0645 \u0646\u06A9\u0646\u06CC\u062F\u060C \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0642\u0627\u0628\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u062E\u0648\u0627\u0647\u062F \u0628\u0648\u062F.
    </div>
    `}
  </div>
</body>
</html>`;
}
function subscriptionPage(hostname, user, vlessWS, trojanWS) {
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
  if (user.expiry_date > 0) {
    const d = new Date(user.expiry_date);
    const pad = (n) => n.toString().padStart(2, "0");
    expiryAbsolute = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const diff = user.expiry_date - Date.now();
    if (diff < 0) {
      expiryRelative = "\u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647";
    } else {
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
      if (days > 0) {
        expiryRelative = `${days} \u0631\u0648\u0632 \u0648 ${hours} \u0633\u0627\u0639\u062A \u062F\u06CC\u06AF\u0631`;
      } else {
        expiryRelative = `${hours} \u0633\u0627\u0639\u062A \u062F\u06CC\u06AF\u0631`;
      }
    }
  }
  let statusClass = "active";
  let statusText = "\u0641\u0639\u0627\u0644";
  let statusIcon = '<span style="font-size:10px;">\u25CF</span>';
  if (!user.enabled) {
    statusClass = "banned";
    statusText = "\u0645\u0633\u062F\u0648\u062F \u0634\u062F\u0647";
    statusIcon = '<span class="blink-icon" style="font-size:12px;">\u26A0\uFE0F</span>';
  } else if (limit > 0 && used >= limit) {
    statusClass = "disabled";
    statusText = "\u063A\u06CC\u0631 \u0641\u0639\u0627\u0644 (\u0627\u062A\u0645\u0627\u0645 \u062D\u062C\u0645)";
    statusIcon = '<span class="blink-icon" style="font-size:10px;">\u25CF</span>';
  } else if (user.expiry_date > 0 && Date.now() > user.expiry_date) {
    statusClass = "disabled";
    statusText = "\u063A\u06CC\u0631 \u0641\u0639\u0627\u0644 (\u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647)";
    statusIcon = '<span class="blink-icon" style="font-size:10px;">\u25CF</span>';
  }
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0646\u0647\u0627\u0646 - ${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;800&family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"><\/script>
  <style>
    :root {
      --bg: #07070e;
      --card-bg: rgba(18, 18, 30, 0.45);
      --border: rgba(255, 255, 255, 0.06);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.2);
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --success: #10b981;
      --error: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Vazirmatn, system-ui, -apple-system, sans-serif; }
    body { background-color: var(--bg); color: var(--text); display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; overflow-x: hidden; position: relative; }
    
    .blob { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, var(--accent) 0%, transparent 70%); opacity: 0.15; filter: blur(80px); z-index: -1; pointer-events: none; }
    .blob-1 { top: 10%; left: 10%; }
    
    .container { width: 100%; max-width: 500px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 28px; padding: 40px 32px; backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); box-shadow: 0 30px 60px rgba(0,0,0,0.6); text-align: center; }
    
    .user-avatar { width: 64px; height: 64px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3); }
    
    h1 { font-size: 22px; margin-bottom: 6px; font-weight: 850; color: #fff; }
    
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 32px; }
    .status-badge.active { background: rgba(16, 185, 129, 0.08); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.15); }
    .status-badge.disabled { background: rgba(239, 68, 68, 0.08); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.15); }
    .status-badge.banned { background: rgba(245, 158, 11, 0.08); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.15); }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.1; } }
    .blink-icon { animation: blink 1s ease-in-out infinite; }
    
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .stat-card { background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: 20px; padding: 18px; text-align: center; }
    .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
    .stat-val { font-size: 15px; font-weight: 700; color: #fff; direction: ltr; margin-top: 8px; }
    
    .usage-container { background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: 20px; padding: 20px; margin-bottom: 28px; text-align: right; }
    .usage-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
    .progress-bar-bg { width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 10px; margin-top: 12px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #ec4899); width: ${percent}%; border-radius: 10px; box-shadow: 0 0 10px rgba(168,85,247,0.5); }
    
    .config-card { background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border); border-radius: 20px; padding: 18px 20px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
    .config-card:hover { border-color: rgba(168, 85, 247, 0.3); }
    .config-info { text-align: right; }
    .config-name { font-size: 14px; font-weight: 700; color: #fff; }
    .config-desc { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    
    .btn-copy { background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); color: #c084fc; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-copy:hover { background: var(--accent); color: white; border-color: var(--accent); }

    .btn-qr { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: #fff; padding: 8px 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .btn-qr:hover { background: var(--accent); border-color: var(--accent); color: white; }
    
    .btn-sub { width: 100%; padding: 16px; background: linear-gradient(135deg, #a855f7, #ec4899); border: none; border-radius: 16px; color: white; font-weight: 800; font-size: 15px; cursor: pointer; margin-top: 12px; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.25); transition: 0.3s; }
    .btn-sub:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(168, 85, 247, 0.4); }

    .btn-sub-qr { width: 100%; padding: 14px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; color: #c084fc; font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 12px; transition: 0.3s; }
    .btn-sub-qr:hover { background: rgba(168, 85, 247, 0.15); transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="blob blob-1"></div>
  
  <div class="container">
    <div class="user-avatar">\u{1F464}</div>
    <h1>${name}</h1>
    <div class="status-badge ${statusClass}">
      ${statusIcon} ${statusText}
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">\u0627\u0639\u062A\u0628\u0627\u0631 \u0632\u0645\u0627\u0646\u06CC</div>
        <div class="stat-val" style="font-size:14px; direction:ltr;">${expiryAbsolute}</div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">${expiryRelative}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">\u062A\u0631\u0627\u0641\u06CC\u06A9 \u0645\u0635\u0631\u0641\u06CC</div>
        <div class="stat-val">${usageText}</div>
      </div>
    </div>
    
    ${limit > 0 ? `
    <div class="usage-container">
      <div class="usage-header">
        <span style="color:var(--text-muted)">\u062F\u0631\u0635\u062F \u0645\u0635\u0631\u0641</span>
        <span style="font-family: 'Outfit', sans-serif; font-weight:bold; color:#fff">${percent}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill"></div>
      </div>
    </div>
    ` : ""}
    
    <!-- Config Cards -->
    <div class="config-card">
      <div class="config-info">
        <div class="config-name">\u0627\u062A\u0635\u0627\u0644 VLESS WS</div>
        <div class="config-desc">\u0645\u0646\u0627\u0633\u0628 \u0628\u0631\u0627\u06CC \u062A\u0645\u0627\u0645 \u0633\u06CC\u0633\u062A\u0645\u200C\u0639\u0627\u0645\u0644\u200C\u0647\u0627</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-copy" onclick="navigator.clipboard.writeText('${vlessWS}').then(() => alert('\u06A9\u0627\u0646\u0641\u06CC\u06AF VLESS \u06A9\u067E\u06CC \u0634\u062F'))">\u06A9\u067E\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF</button>
        <button class="btn-qr" onclick="showQrModal('${vlessWS}', '\u0627\u062A\u0635\u0627\u0644 VLESS WS')" title="\u0646\u0645\u0627\u06CC\u0634 QR \u06A9\u062F">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <line x1="7" y1="7" x2="7" y2="7" />
            <line x1="17" y1="7" x2="17" y2="7" />
            <line x1="17" y1="17" x2="17" y2="17" />
            <line x1="7" y1="17" x2="7" y2="17" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="config-card">
      <div class="config-info">
        <div class="config-name">\u0627\u062A\u0635\u0627\u0644 TROJAN WS</div>
        <div class="config-desc">\u0633\u0627\u0632\u06AF\u0627\u0631 \u0628\u0627 \u06A9\u0644\u0627\u06CC\u0646\u062A\u200C\u0647\u0627\u06CC \u0645\u062D\u0628\u0648\u0628</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-copy" onclick="navigator.clipboard.writeText('${trojanWS}').then(() => alert('\u06A9\u0627\u0646\u0641\u06CC\u06AF Trojan \u06A9\u067E\u06CC \u0634\u062F'))">\u06A9\u067E\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF</button>
        <button class="btn-qr" onclick="showQrModal('${trojanWS}', '\u0627\u062A\u0635\u0627\u0644 TROJAN WS')" title="\u0646\u0645\u0627\u06CC\u0634 QR \u06A9\u062F">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <line x1="7" y1="7" x2="7" y2="7" />
            <line x1="17" y1="7" x2="17" y2="7" />
            <line x1="17" y1="17" x2="17" y2="17" />
            <line x1="7" y1="17" x2="7" y2="17" />
          </svg>
        </button>
      </div>
    </div>
    
    <button class="btn-sub" onclick="navigator.clipboard.writeText('${subLink}').then(() => alert('\u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628 \u06A9\u067E\u06CC \u0634\u062F'))">\u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u200C\u0627\u0633\u06A9\u0631\u0627\u06CC\u0628 (Subscription Link)</button>
    <button class="btn-sub-qr" onclick="showQrModal('${subLink}', '\u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u200C\u0627\u0633\u06A9\u0631\u0627\u06CC\u0628')">\u0646\u0645\u0627\u06CC\u0634 QR \u06A9\u062F \u0633\u0627\u0628\u200C\u0627\u0633\u06A9\u0631\u0627\u06CC\u0628</button>
  </div>

  <!-- QR Modal -->
  <div id="qr-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:none; justify-content:center; align-items:center; z-index:10000; transition:0.3s;" onclick="closeQrModal()">
    <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:28px; padding:28px 20px; max-width:320px; width:90%; box-shadow:0 30px 60px rgba(0,0,0,0.8); animation: zoomIn 0.25s; display:flex; flex-direction:column; align-items:center;" onclick="event.stopPropagation()">
      <style>
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      </style>
      <h3 id="qr-modal-title" style="font-size:16px; margin-bottom:20px; font-weight:800; color:#fff;"></h3>
      <div style="background:#fff; padding:12px; border-radius:16px; margin-bottom:24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); direction:ltr;">
        <canvas id="qr-canvas" style="display:block;"></canvas>
      </div>
      <button onclick="closeQrModal()" style="width:100%; padding:12px; background:rgba(255,255,255,0.06); border:1px solid var(--border); border-radius:12px; color:#fff; font-weight:700; cursor:pointer; transition:0.2s; outline:none;">\u0628\u0633\u062A\u0646</button>
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
          size: 240,
          level: 'L'
        });
      }
      qrInstance.value = value;
    }
    function closeQrModal() {
      document.getElementById('qr-modal').style.display = 'none';
    }
  <\/script>
</body>
</html>`;
}
function panelPage(hostname, adminUUID, defaultProxyIP, cfAccountId, cfApiToken) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>\u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0646\u0647\u0627\u0646</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --bg: #09090b; --surface: #18181b; --surface-hover: #27272a; --border: #27272a; --primary: #a855f7; --primary-hover: #9333ea; --text: #fafafa; --muted: #a1a1aa; --danger: #ef4444; --success: #10b981; }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: Vazirmatn, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); display: flex; height: 100vh; overflow: hidden; }
    
    /* Sidebar */
    .sidebar { width: 260px; background: var(--surface); border-left: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px 0; }
    .brand { padding: 0 24px 20px; font-size: 24px; font-weight: 800; border-bottom: 1px solid var(--border); margin-bottom: 20px; background: linear-gradient(135deg, #c084fc, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-item { width: 100%; padding: 12px 24px; color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 12px; border: 0; background: transparent; text-align: right; transition: 0.2s; font: inherit; font-weight: 500; }
    .nav-item:hover, .nav-item.active { background: var(--surface-hover); color: var(--primary); border-right: 3px solid var(--primary); }
    .github-link:hover { color: var(--primary) !important; background: var(--surface-hover); }
    .github-link:hover svg { transform: scale(1.1); }
    .nav-icon { font-size: 18px; }
    
    /* Main Content */
    .main { flex: 1; overflow-y: auto; padding: 32px; background: radial-gradient(circle at top right, rgba(168, 85, 247, 0.05), transparent 50%); }
    .page { display: none; animation: fadeIn 0.3s; }
    .page.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .title { font-size: 24px; font-weight: bold; }
    
    .btn { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; }
    .btn:hover { background: var(--primary-hover); }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: var(--surface-hover); }
    .btn-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.2); }
    
    /* Tables */
    .table-container { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 16px; text-align: right; border-bottom: 1px solid var(--border); }
    th { background: rgba(255,255,255,0.02); color: var(--muted); font-size: 13px; font-weight: 600; }
    tr:hover { background: rgba(255,255,255,0.02); }
    tr:last-child td { border-bottom: none; }
    
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge.green { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .badge.red { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
    
    /* Forms & Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 50; }
    .modal-overlay.active { display: flex; }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 480px; padding: 24px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .modal-close { cursor: pointer; color: var(--muted); font-size: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 8px; font-size: 14px; color: var(--muted); }
    .form-control { width: 100%; padding: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; outline: none; }
    .form-control:focus { border-color: var(--primary); }
    
    /* Utils */
    .code-span { font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #a5b4fc; direction: ltr; display: inline-block; }
    .flex-gap { display: flex; gap: 8px; }
    .docs-box { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-top: 32px; }
    pre { background: var(--bg); padding: 16px; border-radius: 8px; overflow-x: auto; direction: ltr; font-size: 13px; color: #e2e8f0; margin-top: 10px; border: 1px solid var(--border); }

    /* Proxy IP discovery */
    .proxy-page { max-width: 1120px; }
    .proxy-heading { align-items: flex-start; }
    .proxy-kicker { color: var(--primary); font-size: 12px; font-weight: 800; letter-spacing: .04em; margin-bottom: 6px; }
    .proxy-subtitle { color: var(--muted); font-size: 13px; line-height: 1.8; max-width: 640px; }
    .proxy-refresh { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
    .proxy-refresh[disabled], .proxy-apply[disabled] { cursor: wait; opacity: .62; }
    .proxy-route { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; gap: 14px; position: relative; padding: 24px; margin-bottom: 16px; overflow: hidden; background: linear-gradient(115deg, rgba(168,85,247,.14), rgba(24,24,27,.96) 45%, rgba(236,72,153,.09)); border: 1px solid rgba(168,85,247,.28); border-radius: 16px; }
    .proxy-route::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px); background-size: 20px 20px; mask-image: linear-gradient(90deg, transparent, black 25%, black 75%, transparent); pointer-events: none; }
    .proxy-route-node, .proxy-route-line { position: relative; z-index: 1; }
    .proxy-route-node { min-width: 0; }
    .proxy-route-node small { display: block; color: var(--muted); font-size: 11px; margin-bottom: 5px; }
    .proxy-route-node strong { font-size: 14px; font-weight: 700; }
    .proxy-route-node.is-colo { text-align: center; }
    .proxy-colo { display: inline-block; color: #f5e8ff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: clamp(30px, 5vw, 46px); font-weight: 800; letter-spacing: .06em; line-height: 1; text-shadow: 0 0 24px rgba(168,85,247,.55); }
    .proxy-route-node.is-colo small { margin-top: 7px; margin-bottom: 0; }
    .proxy-route-line { width: 52px; height: 1px; background: linear-gradient(90deg, transparent, rgba(192,132,252,.9)); }
    .proxy-route-line.reverse { background: linear-gradient(90deg, rgba(236,72,153,.9), transparent); }
    .proxy-route-end { text-align: left; }
    .proxy-route-end strong { color: #fce7f3; }
    .proxy-current { display: flex; align-items: center; justify-content: space-between; gap: 18px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; margin-bottom: 16px; }
    .proxy-current-copy { min-width: 0; }
    .proxy-current-copy h3 { font-size: 14px; margin-bottom: 4px; }
    .proxy-current-copy p { color: var(--muted); font-size: 12px; line-height: 1.65; }
    .proxy-current-value { flex: 0 0 auto; color: #ddd6fe; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; direction: ltr; unicode-bidi: plaintext; }
    .proxy-status { display: none; border: 1px solid transparent; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 13px; line-height: 1.7; }
    .proxy-status.show { display: block; }
    .proxy-status.info { background: rgba(168,85,247,.09); border-color: rgba(168,85,247,.25); color: #ddd6fe; }
    .proxy-status.warn { background: rgba(245,158,11,.09); border-color: rgba(245,158,11,.28); color: #fcd34d; }
    .proxy-status.error { background: rgba(239,68,68,.09); border-color: rgba(239,68,68,.28); color: #fca5a5; }
    .proxy-records { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
    .proxy-records-title { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 17px 18px; border-bottom: 1px solid var(--border); }
    .proxy-records-title h3 { font-size: 15px; }
    .proxy-records-title span { color: var(--muted); font-size: 12px; }
    .proxy-records-table th { white-space: nowrap; }
    .proxy-records-table td { vertical-align: middle; font-size: 13px; }
    .proxy-radio { appearance: none; width: 18px; height: 18px; margin: 0; border: 1px solid #52525b; border-radius: 50%; background: var(--bg); cursor: pointer; display: grid; place-content: center; }
    .proxy-radio::before { content: ''; width: 8px; height: 8px; border-radius: 50%; transform: scale(0); background: white; transition: transform .16s ease; }
    .proxy-radio:checked { background: var(--primary); border-color: var(--primary); }
    .proxy-radio:checked::before { transform: scale(1); }
    .proxy-radio:focus-visible { outline: 3px solid rgba(168,85,247,.4); outline-offset: 3px; }
    .proxy-record-row { cursor: pointer; transition: background .16s ease, box-shadow .16s ease; }
    .proxy-record-row.selected { background: rgba(168,85,247,.11); box-shadow: inset -3px 0 0 var(--primary); }
    .proxy-record-row.current .proxy-ip { color: #6ee7b7; }
    .proxy-ip, .proxy-asn { direction: ltr; unicode-bidi: plaintext; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-variant-numeric: tabular-nums; }
    .proxy-ip { color: #ddd6fe; font-weight: 700; }
    .proxy-record-meta { color: var(--muted); font-size: 11px; margin-top: 4px; }
    .proxy-family { display: inline-flex; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; background: rgba(255,255,255,.06); color: #d4d4d8; direction: ltr; }
    .proxy-meta-unavailable { color: #a1a1aa; }
    .proxy-empty { padding: 44px 24px; color: var(--muted); font-size: 13px; text-align: center; }
    .proxy-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; border-top: 1px solid var(--border); }
    .proxy-actions-note { color: var(--muted); font-size: 12px; line-height: 1.65; max-width: 580px; }
    .proxy-apply { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 8px; }
    .proxy-modal-address { direction: ltr; unicode-bidi: plaintext; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #ddd6fe; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px; text-align: center; font-weight: 700; margin: 14px 0; }
    .proxy-confirm-copy { color: var(--muted); font-size: 13px; line-height: 1.8; }
    @media (max-width: 760px) {
      body { height: auto; min-height: 100vh; overflow: auto; flex-direction: column; }
      .sidebar { width: 100%; min-height: auto; border-left: 0; border-bottom: 1px solid var(--border); flex-direction: row; flex-wrap: wrap; padding: 12px 0; }
      .brand { width: 100%; padding: 0 20px 12px; margin-bottom: 6px; }
      .sidebar .nav-item { padding: 9px 14px; font-size: 12px; }
      .sidebar > div[style="flex:1"] { display: none; }
      .github-link { display: none !important; }
      .main { width: 100%; padding: 20px 14px; overflow: visible; }
      .header, .proxy-heading { gap: 14px; flex-direction: column; align-items: stretch; margin-bottom: 20px; }
      .proxy-refresh { justify-content: center; }
      .proxy-route { grid-template-columns: 1fr; gap: 10px; padding: 20px; text-align: center; }
      .proxy-route-node, .proxy-route-end { text-align: center; }
      .proxy-route-line { width: 1px; height: 22px; margin: auto; background: linear-gradient(180deg, transparent, rgba(192,132,252,.9)); }
      .proxy-route-line.reverse { background: linear-gradient(180deg, rgba(236,72,153,.9), transparent); }
      .proxy-current, .proxy-actions { align-items: stretch; flex-direction: column; }
      .proxy-current-value { text-align: right; }
      .proxy-records { overflow: visible; background: transparent; border: 0; }
      .proxy-records-title { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 10px; }
      .proxy-records-table, .proxy-records-table tbody, .proxy-records-table tr, .proxy-records-table td { display: block; width: 100%; }
      .proxy-records-table thead { display: none; }
      .proxy-record-row { position: relative; margin-bottom: 10px; padding: 11px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
      .proxy-record-row.selected { box-shadow: inset -3px 0 0 var(--primary); }
      .proxy-records-table td { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px 0; border: 0; text-align: left; }
      .proxy-records-table td::before { content: attr(data-label); color: var(--muted); font-size: 11px; direction: rtl; text-align: right; }
      .proxy-records-table td:first-child { position: absolute; top: 13px; left: 14px; width: auto; padding: 0; }
      .proxy-records-table td:first-child::before { display: none; }
      .proxy-records-table td:nth-child(2) { padding-left: 34px; }
      .proxy-actions .btn { width: 100%; justify-content: center; }
    }
    @media (prefers-reduced-motion: reduce) {
      .page, .proxy-record-row, .proxy-radio::before { animation: none; transition: none; }
    }
  </style>
</head>
<body>

  <!-- Sidebar -->
  <div class="sidebar">
    <div class="brand">\u0646\u0647\u0627\u0646</div>
    <button type="button" class="nav-item active" onclick="nav('users', this)"><span class="nav-icon">\u{1F465}</span> \u06A9\u0627\u0631\u0628\u0631\u0627\u0646</button>
    <button type="button" class="nav-item" onclick="nav('api', this)"><span class="nav-icon">\u{1F511}</span> \u062A\u0648\u06A9\u0646\u200C\u0647\u0627\u06CC API</button>
    <button type="button" class="nav-item" onclick="nav('proxy-ips', this)"><span class="nav-icon">\u25C8</span> \u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC</button>
    <button type="button" class="nav-item" onclick="nav('settings', this)"><span class="nav-icon">\u2699\uFE0F</span> \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0633\u06CC\u0633\u062A\u0645</button>
    <div style="flex:1"></div>
    <a href="https://github.com/emad1381/penhan" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 12px 24px; color: var(--muted); text-decoration: none; transition: 0.2s; font-weight: 500;" class="github-link">
      <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" style="transition: transform 0.2s; vertical-align: middle;">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      <span>\u06AF\u06CC\u062A\u200C\u0647\u0627\u0628 \u067E\u0631\u0648\u0698\u0647</span>
    </a>
    <button type="button" class="nav-item" onclick="window.location.href='/'" style="color:var(--danger)"><span class="nav-icon">\u{1F6AA}</span> \u062E\u0631\u0648\u062C</button>
  </div>

  <!-- Main -->
  <div class="main">
  
    <!-- Users Page -->
    <div id="page-users" class="page active">
      <div class="header">
        <h2 class="title">\u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646</h2>
        <button class="btn" onclick="openAddUserModal()">+ \u0627\u0641\u0632\u0648\u062F\u0646 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F</button>
      </div>
      
      <div class="dashboard-stats" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px;">
          <div style="font-size:12px; color:var(--muted)">\u062A\u0639\u062F\u0627\u062F \u06A9\u0644 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646</div>
          <div id="stat-total-users" style="font-size:22px; font-weight:bold; margin-top:8px;">0</div>
        </div>
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px;">
          <div style="font-size:12px; color:var(--muted)">\u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0641\u0639\u0627\u0644</div>
          <div id="stat-active-users" style="font-size:22px; font-weight:bold; margin-top:8px; color:var(--success)">0</div>
        </div>
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div style="font-size:12px; color:var(--muted); display:flex; align-items:center; gap:6px;">
              \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u200C\u0647\u0627\u06CC \u0627\u0645\u0631\u0648\u0632 \u0648\u0631\u06A9\u0631
              <span style="cursor:pointer; font-size:11px;" onclick="loadCfMetrics(); this.style.transform='rotate(360deg)'; setTimeout(()=>this.style.transform='', 300); transition='0.3s';" title="\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC">\u{1F504}</span>
            </div>
            <div id="stat-cf-reqs" style="font-size:18px; font-weight:bold; margin-top:8px;">\u062F\u0631 \u062D\u0627\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A...</div>
          </div>
          <!-- Circular progress chart -->
          <div id="cf-circle-container" style="width:42px; height:42px; position:relative; display:none;">
            <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform: rotate(-90deg);">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272a" stroke-width="4" />
              <path id="cf-circle-progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" stroke-width="4" stroke-dasharray="0, 100" />
            </svg>
            <div id="cf-circle-text" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:bold; font-family:'Outfit', sans-serif;">0%</div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>\u0646\u0627\u0645</th>
              <th>UUID</th>
              <th>\u0648\u0636\u0639\u06CC\u062A</th>
              <th>\u0645\u0635\u0631\u0641</th>
              <th>\u0645\u0647\u0644\u062A</th>
              <th>\u0639\u0645\u0644\u06CC\u0627\u062A</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            <tr><td colspan="6" style="text-align:center; padding: 40px; color:var(--muted)">\u062F\u0631 \u062D\u0627\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- API Page -->
    <div id="page-api" class="page">
      <div class="header">
        <h2 class="title">\u062A\u0648\u06A9\u0646\u200C\u0647\u0627\u06CC API</h2>
        <button class="btn" onclick="openModal('token-modal')">+ \u0633\u0627\u062E\u062A \u062A\u0648\u06A9\u0646 \u062C\u062F\u06CC\u062F</button>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>\u0646\u0627\u0645 \u0631\u0628\u0627\u062A/\u062A\u0648\u06A9\u0646</th>
              <th>\u06A9\u0644\u06CC\u062F (Key)</th>
              <th>\u0639\u0645\u0644\u06CC\u0627\u062A</th>
            </tr>
          </thead>
          <tbody id="tokens-tbody">
          </tbody>
        </table>
      </div>
      
      <div class="docs-box">
        <h3>\u062F\u0627\u06A9\u06CC\u0648\u0645\u0646\u062A \u0627\u062A\u0635\u0627\u0644 API</h3>
        <p style="color:var(--muted); margin-top:8px; font-size:14px;">\u0628\u0627 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u06A9\u0644\u06CC\u062F\u0647\u0627\u06CC \u0628\u0627\u0644\u0627 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0631\u0628\u0627\u062A \u062A\u0644\u06AF\u0631\u0627\u0645 \u06CC\u0627 \u0647\u0631 \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631 \u062F\u06CC\u06AF\u0631\u06CC\u060C \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0631\u0627 \u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0646\u06CC\u062F.</p>
        <pre>
# \u0633\u0627\u062E\u062A \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F
curl -X POST https://${hostname}/api/users   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"id":"UUID", "name":"User1", "limit_bytes": 10737418240, "expiry_date": 1712...}'

# \u06AF\u0631\u0641\u062A\u0646 \u0644\u06CC\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646
curl -X GET https://${hostname}/api/users -H "Authorization: Bearer YOUR_TOKEN"
        </pre>
      </div>
    </div>
    
    <!-- Proxy IP Page -->
    <section id="page-proxy-ips" class="page proxy-page" aria-labelledby="proxy-page-title">
      <div class="header proxy-heading">
        <div>
          <div class="proxy-kicker">ROUTING DISCOVERY</div>
          <h2 id="proxy-page-title" class="title">\u0622\u06CC\u200C\u067E\u06CC\u200C\u0647\u0627\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC</h2>
          <p class="proxy-subtitle">\u0631\u06A9\u0648\u0631\u062F\u0647\u0627 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0645\u0631\u06A9\u0632 \u0648\u0631\u0648\u062F\u06CC Cloudflare \u0628\u0631\u0627\u06CC \u0647\u0645\u06CC\u0646 \u0628\u0627\u0632\u062F\u06CC\u062F \u067E\u0646\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u0645\u0627 \u0641\u0642\u0637 \u0645\u0633\u06CC\u0631 \u062A\u0644\u0627\u0634 \u0645\u062C\u062F\u062F \u0627\u062A\u0635\u0627\u0644 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0631\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0645\u06CC\u200C\u062F\u0647\u062F.</p>
        </div>
        <button type="button" id="proxy-refresh" class="btn btn-outline proxy-refresh" onclick="loadProxyIps(true)">\u21BB \u062F\u0631\u06CC\u0627\u0641\u062A \u0631\u06A9\u0648\u0631\u062F\u0647\u0627</button>
      </div>

      <div id="proxy-route" class="proxy-route" hidden>
        <div class="proxy-route-node">
          <small>\u062F\u0631\u062E\u0648\u0627\u0633\u062A \u067E\u0646\u0644</small>
          <strong>\u0648\u0631\u0648\u062F\u06CC Cloudflare</strong>
        </div>
        <div class="proxy-route-line"></div>
        <div class="proxy-route-node is-colo">
          <span id="proxy-colo" class="proxy-colo">---</span>
          <small>\u0645\u0631\u06A9\u0632 \u0648\u0631\u0648\u062F\u06CC \u0641\u0639\u0644\u06CC</small>
        </div>
        <div class="proxy-route-line reverse"></div>
        <div class="proxy-route-node proxy-route-end">
          <small>\u0645\u0646\u0628\u0639 \u062E\u0648\u062F\u06A9\u0627\u0631</small>
          <strong id="proxy-source-label">\u0631\u06A9\u0648\u0631\u062F\u0647\u0627\u06CC \u0622\u0645\u0627\u062F\u0647</strong>
        </div>
      </div>

      <div class="proxy-current">
        <div class="proxy-current-copy">
          <h3>Proxy IP \u0633\u0631\u0627\u0633\u0631\u06CC \u0641\u0639\u0627\u0644</h3>
          <p>\u0627\u06CC\u0646 \u0645\u0642\u062F\u0627\u0631 \u0641\u0642\u0637 \u0647\u0646\u06AF\u0627\u0645\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u06A9\u0647 \u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0645\u0642\u0635\u062F \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0627\u0634\u062F. \u062A\u0646\u0638\u06CC\u0645 \u0622\u0646 \u0631\u0648\u06CC \u0647\u0645\u0647\u0654 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0627\u062B\u0631 \u0645\u06CC\u200C\u06AF\u0630\u0627\u0631\u062F.</p>
        </div>
        <div id="proxy-current-value" class="proxy-current-value">${defaultProxyIP || "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647"}</div>
      </div>

      <div id="proxy-status" class="proxy-status" role="status" aria-live="polite"></div>

      <div class="proxy-records">
        <div class="proxy-records-title">
          <h3>\u0631\u06A9\u0648\u0631\u062F\u0647\u0627\u06CC DNS \u062F\u0631\u06CC\u0627\u0641\u062A\u200C\u0634\u062F\u0647</h3>
          <span id="proxy-record-count">\u0628\u0631\u0627\u06CC \u0634\u0631\u0648\u0639\u060C \u062F\u0631\u06CC\u0627\u0641\u062A \u0631\u06A9\u0648\u0631\u062F\u0647\u0627 \u0631\u0627 \u0628\u0632\u0646\u06CC\u062F</span>
        </div>
        <table class="proxy-records-table">
          <thead>
            <tr>
              <th aria-label="\u0627\u0646\u062A\u062E\u0627\u0628"></th>
              <th>\u0622\u06CC\u200C\u067E\u06CC</th>
              <th>\u0646\u0648\u0639</th>
              <th>\u0634\u0628\u06A9\u0647 / ISP</th>
              <th>\u06A9\u0634\u0648\u0631 \u062B\u0628\u062A ASN</th>
              <th>TTL</th>
            </tr>
          </thead>
          <tbody id="proxy-records-body">
            <tr><td colspan="6" class="proxy-empty">\u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0641\u0642\u0637 \u0632\u0645\u0627\u0646\u06CC \u0622\u063A\u0627\u0632 \u0645\u06CC\u200C\u0634\u0648\u062F \u06A9\u0647 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u0631\u0627 \u0628\u0627\u0632 \u06A9\u0646\u06CC\u062F.</td></tr>
          </tbody>
        </table>
        <div class="proxy-actions">
          <p class="proxy-actions-note">\u0642\u0628\u0644 \u0627\u0632 \u0627\u0639\u0645\u0627\u0644\u060C IP \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 \u062F\u0648\u0628\u0627\u0631\u0647 \u0627\u0632 DNS \u0645\u0646\u0628\u0639 \u0628\u0631\u0631\u0633\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F \u062A\u0627 \u0645\u0642\u062F\u0627\u0631 \u0645\u0646\u0642\u0636\u06CC \u06CC\u0627 \u062A\u063A\u06CC\u06CC\u0631\u06A9\u0631\u062F\u0647 \u0630\u062E\u06CC\u0631\u0647 \u0646\u0634\u0648\u062F.</p>
          <button type="button" id="proxy-apply" class="btn proxy-apply" onclick="openProxyApplyModal()" disabled>\u062A\u0646\u0638\u06CC\u0645 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 Proxy IP \u0633\u0631\u0627\u0633\u0631\u06CC <span>\u2190</span></button>
        </div>
      </div>
    </section>

    <!-- Settings Page -->
    <div id="page-settings" class="page">
      <div class="header">
        <h2 class="title">\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u06A9\u0644\u06CC</h2>
        <button class="btn" onclick="saveSettings()">\u0630\u062E\u06CC\u0631\u0647 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A</button>
      </div>
      
      <div style="background:var(--surface); border:1px solid var(--border); padding:24px; border-radius:12px; max-width: 600px;">
        <div class="form-group">
          <label>UUID \u0627\u062F\u0645\u06CC\u0646 (\u0628\u0631\u0627\u06CC \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644)</label>
          <input type="text" class="form-control" id="st-uuid" value="${adminUUID}">
        </div>
        <div class="form-group">
          <label>\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067E\u0646\u0644</label>
          <input type="password" class="form-control" id="st-pass" placeholder="\u0628\u0631\u0627\u06CC \u0639\u062F\u0645 \u062A\u063A\u06CC\u06CC\u0631 \u062E\u0627\u0644\u06CC \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F">
        </div>
        <div class="form-group">
          <label>\u0622\u06CC\u200C\u067E\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 (Proxy IP)</label>
          <input type="text" class="form-control" id="st-proxy" value="${defaultProxyIP || ""}" placeholder="\u0645\u062B\u0627\u0644: 1.2.3.4">
        </div>
        <div class="form-group">
          <label>Cloudflare Account ID</label>
          <input type="text" class="form-control" id="st-cf-account" value="${cfAccountId || ""}" placeholder="\u0645\u062B\u0627\u0644: 8e5f2...">
        </div>
        <div class="form-group">
          <label>Cloudflare API Token (\u0628\u0627 \u062F\u0633\u062A\u0631\u0633\u06CC Account Analytics: Read)</label>
          <input type="password" class="form-control" id="st-cf-token" value="${cfApiToken || ""}" placeholder="\u0628\u0631\u0627\u06CC \u0639\u062F\u0645 \u062A\u063A\u06CC\u06CC\u0631 \u062E\u0627\u0644\u06CC \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F">
        </div>
      </div>
    </div>
    
  </div>

  <!-- Modals -->
  <div class="modal-overlay" id="user-modal">
    <div class="modal">
      <div class="modal-header">
        <h3 id="user-modal-title">\u0627\u0641\u0632\u0648\u062F\u0646 \u06A9\u0627\u0631\u0628\u0631</h3>
        <div class="modal-close" onclick="closeModal('user-modal')">&times;</div>
      </div>
      <div class="form-group">
        <label>\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631</label>
        <input type="text" id="u-name" class="form-control" placeholder="\u0645\u062B\u0627\u0644: Ali iPhone">
      </div>
      <div class="form-group" style="display:flex; gap:8px;">
        <div style="flex:1">
          <label>UUID (\u0634\u0646\u0627\u0633\u0647 \u06CC\u06A9\u062A\u0627)</label>
          <input type="text" id="u-uuid" class="form-control" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
        </div>
        <div style="align-self: flex-end;">
          <button class="btn btn-outline" onclick="generateUUID()">\u062A\u0648\u0644\u06CC\u062F</button>
        </div>
      </div>
      <div class="form-group">
        <label>\u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u062D\u062C\u0645 (GB) - 0 \u0628\u0631\u0627\u06CC \u0646\u0627\u0645\u062D\u062F\u0648\u062F</label>
        <input type="number" id="u-limit" class="form-control" value="0">
      </div>
      <div class="form-group">
        <label>\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u0642\u0636\u0627 (\u0628\u0631\u0627\u06CC \u0646\u0627\u0645\u062D\u062F\u0648\u062F\u060C \u062E\u0627\u0644\u06CC \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F)</label>
        <input type="datetime-local" id="u-expiry" class="form-control">
      </div>
      <div class="form-group">
        <label>Clean IP \u0627\u062E\u062A\u0635\u0627\u0635\u06CC (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)</label>
        <input type="text" id="u-cleanip" class="form-control" placeholder="\u0622\u06CC\u200C\u067E\u06CC \u062A\u0645\u06CC\u0632 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631">
      </div>
      <button class="btn" style="width:100%; margin-top:16px;" onclick="saveUser()">\u0630\u062E\u06CC\u0631\u0647 \u06A9\u0627\u0631\u0628\u0631</button>
    </div>
  </div>

  <div class="modal-overlay" id="token-modal">
    <div class="modal">
      <div class="modal-header">
        <h3>\u0627\u0641\u0632\u0648\u062F\u0646 \u062A\u0648\u06A9\u0646 API</h3>
        <div class="modal-close" onclick="closeModal('token-modal')">&times;</div>
      </div>
      <div class="form-group">
        <label>\u0646\u0627\u0645 \u0631\u0628\u0627\u062A \u06CC\u0627 \u062A\u0648\u06A9\u0646</label>
        <input type="text" id="t-name" class="form-control" placeholder="\u0645\u062B\u0627\u0644: Telegram Bot">
      </div>
      <div class="form-group" style="display:flex; gap:8px;">
        <div style="flex:1">
          <label>\u062A\u0648\u06A9\u0646</label>
          <input type="text" id="t-key" class="form-control">
        </div>
        <div style="align-self: flex-end;">
          <button class="btn btn-outline" onclick="document.getElementById('t-key').value = crypto.randomUUID().replace(/-/g, '')">\u062A\u0648\u0644\u06CC\u062F</button>
        </div>
      </div>
      <button class="btn" style="width:100%; margin-top:16px;" onclick="saveToken()">\u0627\u06CC\u062C\u0627\u062F \u062A\u0648\u06A9\u0646</button>
    </div>
  </div>

  <div class="modal-overlay" id="proxy-apply-modal" role="dialog" aria-modal="true" aria-labelledby="proxy-apply-title">
    <div class="modal">
      <div class="modal-header">
        <h3 id="proxy-apply-title">\u062A\u0623\u06CC\u06CC\u062F Proxy IP \u0633\u0631\u0627\u0633\u0631\u06CC</h3>
        <button type="button" class="modal-close" aria-label="\u0628\u0633\u062A\u0646" onclick="closeModal('proxy-apply-modal')">&times;</button>
      </div>
      <p class="proxy-confirm-copy">\u0627\u06CC\u0646 \u0645\u0642\u062F\u0627\u0631 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0645\u0633\u06CC\u0631 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0627\u062A\u0635\u0627\u0644 \u0628\u0631\u0627\u06CC \u0647\u0645\u0647\u0654 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0630\u062E\u06CC\u0631\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0647\u0645\u06CC\u0634\u0647 \u0627\u0648\u0644\u0648\u06CC\u062A \u062F\u0627\u0631\u062F \u0648 \u0641\u0642\u0637 \u062F\u0631 \u0635\u0648\u0631\u062A \u062E\u0637\u0627 \u0627\u0632 \u0627\u06CC\u0646 IP \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u062E\u0648\u0627\u0647\u062F \u0634\u062F.</p>
      <div id="proxy-apply-address" class="proxy-modal-address">\u2014</div>
      <div style="display:flex; gap:8px; margin-top:18px;">
        <button type="button" class="btn btn-outline" style="flex:1" onclick="closeModal('proxy-apply-modal')">\u0627\u0646\u0635\u0631\u0627\u0641</button>
        <button type="button" id="proxy-confirm-apply" class="btn" style="flex:1" onclick="applySelectedProxyIp()">\u062A\u0623\u06CC\u06CC\u062F \u0648 \u0627\u0639\u0645\u0627\u0644</button>
      </div>
    </div>
  </div>

  <script>
    const basePath = '/api';
    const proxyIpState = { loaded: false, loading: false, selected: null, records: [] };

    function nav(page, trigger) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + page).classList.add('active');
      (trigger || event.currentTarget).classList.add('active');
      if (page === 'proxy-ips' && !proxyIpState.loaded && !proxyIpState.loading) loadProxyIps(false);
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
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#a1a1aa">\u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F</td></tr>';
          return;
        }
        data.users.forEach(u => {
          let usage = u.limit_bytes ? \`\${formatBytes(u.used_bytes)} / \${formatBytes(u.limit_bytes)}\` : \`\${formatBytes(u.used_bytes)} (\u221E)\`;
          let expiryHTML = '<span style="color:#a1a1aa">\u0646\u0627\u0645\u062D\u062F\u0648\u062F (\u221E)</span>';
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
              <span class="badge \${badgeClass}" style="font-size:10px; padding:2px 6px;">\${rel}</span>
            </div>\`;
          }
          let statusBadge = u.enabled ? '<span class="badge green">\u0641\u0639\u0627\u0644</span>' : '<span class="badge red">\u0645\u0633\u062F\u0648\u062F</span>';
          
          tbody.innerHTML += \`<tr>
            <td style="font-weight:600">\${u.name} <span style="cursor:pointer; margin-right:6px;" onclick="editUser('\${u.id}', '\${u.name}', \${u.limit_bytes}, \${u.expiry_date}, '\${u.clean_ip}')">\u270F\uFE0F</span></td>
            <td><span class="code-span">\${u.id.substring(0,8)}...</span></td>
            <td>\${statusBadge}</td>
            <td style="direction:ltr; text-align:right">\${usage}</td>
            <td>\${expiryHTML}</td>
            <td>
              <div class="flex-gap">
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="toggleUser('\${u.id}')">\${u.enabled ? '\u0645\u0633\u062F\u0648\u062F' : '\u0622\u0632\u0627\u062F\u0633\u0627\u0632\u06CC'}</button>
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="window.open('https://\${window.location.hostname}/\${u.id}/sub', '_blank')">\u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628</button>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:11px" onclick="deleteUser('\${u.id}')">\u{1F5D1}\uFE0F</button>
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
       const expiryVal = document.getElementById('u-expiry').value;
       const clean = document.getElementById('u-cleanip').value;
       
       if (!id || !name) { alert("\u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0646\u0627\u0645 \u0648 UUID \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A!"); return; }
       
       const limit_bytes = gb * 1024 * 1024 * 1024;
       const expiry_date = expiryVal ? new Date(expiryVal).getTime() : 0;
       
       await fetch(basePath + '/users', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ id, name, limit_bytes, expiry_date, clean_ip: clean })
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
          tbody.innerHTML += \`<tr>
            <td>\${t.name}</td>
            <td><span class="code-span">\${t.key}</span></td>
            <td><button class="btn btn-danger" style="padding:4px 8px" onclick="deleteToken('\${t.key}')">\u062D\u0630\u0641</button></td>
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
       await fetch(basePath + '/tokens/' + key, {method: 'DELETE'});
       loadTokens();
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
       alert('\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.');
       loadCfMetrics();
    }

    function openAddUserModal() {
      document.getElementById('u-uuid').value = '';
      document.getElementById('u-uuid').disabled = false;
      document.getElementById('u-name').value = '';
      document.getElementById('u-limit').value = 0;
      document.getElementById('u-expiry').value = '';
      document.getElementById('u-cleanip').value = '';
      document.getElementById('user-modal-title').textContent = '\u0627\u0641\u0632\u0648\u062F\u0646 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F';
      generateUUID();
      openModal('user-modal');
    }

    function editUser(id, name, limitBytes, expiryDate, cleanIp) {
      document.getElementById('u-uuid').value = id;
      document.getElementById('u-uuid').disabled = true;
      document.getElementById('u-name').value = name;
      document.getElementById('u-limit').value = limitBytes ? (limitBytes / (1024 * 1024 * 1024)).toFixed(2) : 0;
      
      if (expiryDate > 0) {
        const d = new Date(expiryDate);
        const pad = (n) => n.toString().padStart(2, '0');
        document.getElementById('u-expiry').value = \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())}T\${pad(d.getHours())}:\${pad(d.getMinutes())}\`;
      } else {
        document.getElementById('u-expiry').value = '';
      }
      document.getElementById('u-cleanip').value = cleanIp || '';
      document.getElementById('user-modal-title').textContent = '\u0648\u06CC\u0631\u0627\u06CC\u0634 \u06A9\u0627\u0631\u0628\u0631';
      openModal('user-modal');
    }

    function setProxyStatus(message, type = 'info') {
      const status = document.getElementById('proxy-status');
      status.textContent = message || '';
      status.className = message ? 'proxy-status show ' + type : 'proxy-status';
    }

    function setProxyLoading(loading) {
      proxyIpState.loading = loading;
      const refresh = document.getElementById('proxy-refresh');
      const apply = document.getElementById('proxy-apply');
      refresh.disabled = loading;
      refresh.textContent = loading ? '\u062F\u0631 \u062D\u0627\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A...' : '\u21BB \u062F\u0631\u06CC\u0627\u0641\u062A \u0631\u06A9\u0648\u0631\u062F\u0647\u0627';
      apply.disabled = loading || !proxyIpState.selected;
    }

    function renderProxyRecords() {
      const body = document.getElementById('proxy-records-body');
      const count = document.getElementById('proxy-record-count');
      const apply = document.getElementById('proxy-apply');
      const current = document.getElementById('proxy-current-value').textContent.trim();
      body.innerHTML = '';

      if (!proxyIpState.records.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.className = 'proxy-empty';
        cell.textContent = '\u0628\u0631\u0627\u06CC \u0645\u0631\u06A9\u0632 \u0648\u0631\u0648\u062F\u06CC \u0641\u0639\u0644\u06CC \u0647\u06CC\u0686 \u0631\u06A9\u0648\u0631\u062F A \u06CC\u0627 AAAA \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F.';
        row.appendChild(cell);
        body.appendChild(row);
        count.textContent = '\u06F0 \u0631\u06A9\u0648\u0631\u062F';
        apply.disabled = true;
        return;
      }

      count.textContent = proxyIpState.records.length.toLocaleString('fa-IR') + ' \u0631\u06A9\u0648\u0631\u062F \u0622\u0645\u0627\u062F\u0647\u0654 \u0627\u0646\u062A\u062E\u0627\u0628';
      proxyIpState.records.forEach((record) => {
        const row = document.createElement('tr');
        row.className = 'proxy-record-row' + (proxyIpState.selected === record.address ? ' selected' : '') + (current === record.address ? ' current' : '');
        row.tabIndex = 0;
        row.setAttribute('role', 'radio');
        row.setAttribute('aria-checked', proxyIpState.selected === record.address ? 'true' : 'false');
        row.addEventListener('click', () => selectProxyRecord(record.address));
        row.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectProxyRecord(record.address);
          }
        });

        const selectCell = document.createElement('td');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'proxy-ip';
        radio.className = 'proxy-radio';
        radio.checked = proxyIpState.selected === record.address;
        radio.setAttribute('aria-label', '\u0627\u0646\u062A\u062E\u0627\u0628 ' + record.address);
        radio.addEventListener('click', (event) => { event.stopPropagation(); selectProxyRecord(record.address); });
        selectCell.appendChild(radio);

        const addressCell = document.createElement('td');
        addressCell.dataset.label = '\u0622\u06CC\u200C\u067E\u06CC';
        const address = document.createElement('div');
        address.className = 'proxy-ip';
        address.textContent = record.address;
        addressCell.appendChild(address);
        if (current === record.address) {
          const meta = document.createElement('div');
          meta.className = 'proxy-record-meta';
          meta.textContent = '\u062A\u0646\u0638\u06CC\u0645 \u0633\u0631\u0627\u0633\u0631\u06CC \u0641\u0639\u0644\u06CC';
          addressCell.appendChild(meta);
        }

        const familyCell = document.createElement('td');
        familyCell.dataset.label = '\u0646\u0648\u0639';
        const family = document.createElement('span');
        family.className = 'proxy-family';
        family.textContent = record.family;
        familyCell.appendChild(family);

        const ispCell = document.createElement('td');
        ispCell.dataset.label = '\u0634\u0628\u06A9\u0647 / ISP';
        const asn = document.createElement('div');
        asn.className = 'proxy-asn';
        asn.textContent = record.isp && record.isp.asn ? record.isp.asn : '--';
        const isp = document.createElement('div');
        isp.className = 'proxy-record-meta' + (record.metadataStatus === 'unavailable' ? ' proxy-meta-unavailable' : '');
        isp.textContent = record.isp && record.isp.name ? record.isp.name : '\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A';
        ispCell.append(asn, isp);

        const countryCell = document.createElement('td');
        countryCell.dataset.label = '\u06A9\u0634\u0648\u0631 \u062B\u0628\u062A ASN';
        const country = document.createElement('span');
        country.textContent = record.country && record.country.name ? record.country.name : '\u0646\u0627\u0645\u0634\u062E\u0635';
        const countryCode = document.createElement('div');
        countryCode.className = 'proxy-record-meta proxy-asn';
        countryCode.textContent = record.country && record.country.code ? record.country.code : '--';
        countryCell.append(country, countryCode);

        const ttlCell = document.createElement('td');
        ttlCell.dataset.label = 'TTL';
        ttlCell.className = 'proxy-asn';
        ttlCell.textContent = (record.ttl || 0).toLocaleString('en-US') + 's';

        row.append(selectCell, addressCell, familyCell, ispCell, countryCell, ttlCell);
        body.appendChild(row);
      });

      apply.disabled = proxyIpState.loading || !proxyIpState.selected;
    }

    function selectProxyRecord(address) {
      proxyIpState.selected = address;
      renderProxyRecords();
      setProxyStatus('\u0631\u06A9\u0648\u0631\u062F \u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u062F. \u0628\u0631\u0627\u06CC \u0630\u062E\u06CC\u0631\u0647\u0654 \u0622\u0646 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 Proxy IP \u0633\u0631\u0627\u0633\u0631\u06CC\u060C \u062F\u06A9\u0645\u0647\u0654 \u0627\u0639\u0645\u0627\u0644 \u0631\u0627 \u0628\u0632\u0646\u06CC\u062F.', 'info');
    }

    async function loadProxyIps(refresh) {
      setProxyLoading(true);
      setProxyStatus(refresh ? '\u0631\u06A9\u0648\u0631\u062F\u0647\u0627 \u062F\u0631 \u062D\u0627\u0644 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0647\u0633\u062A\u0646\u062F...' : '\u0631\u06A9\u0648\u0631\u062F\u0647\u0627\u06CC Proxy IP \u062F\u0631 \u062D\u0627\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A \u0647\u0633\u062A\u0646\u062F...', 'info');
      try {
        const res = await fetch(basePath + '/proxy-ips' + (refresh ? '?refresh=1' : ''), { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error && data.error.message ? data.error.message : '\u062F\u0631\u06CC\u0627\u0641\u062A \u0631\u06A9\u0648\u0631\u062F\u0647\u0627 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F.');
        }

        proxyIpState.loaded = true;
        proxyIpState.records = Array.isArray(data.records) ? data.records : [];
        proxyIpState.selected = proxyIpState.records.some((record) => record.address === proxyIpState.selected) ? proxyIpState.selected : null;
        document.getElementById('proxy-route').hidden = false;
        document.getElementById('proxy-colo').textContent = data.ingress && data.ingress.colo ? data.ingress.colo : '---';
        document.getElementById('proxy-source-label').textContent = '\u0645\u0646\u0628\u0639 \u062E\u0648\u062F\u06A9\u0627\u0631 \u0641\u0639\u0627\u0644';
        document.getElementById('proxy-current-value').textContent = data.effectiveProxyIp || '\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647';
        renderProxyRecords();

        if (!proxyIpState.records.length) {
          setProxyStatus('\u0628\u0631\u0627\u06CC \u0645\u0631\u06A9\u0632 \u0648\u0631\u0648\u062F\u06CC \u0641\u0639\u0644\u06CC \u0631\u06A9\u0648\u0631\u062F A \u06CC\u0627 AAAA \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A. \u06A9\u0645\u06CC \u0628\u0639\u062F \u062F\u0648\u0628\u0627\u0631\u0647 \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F.', 'warn');
        } else if (data.partial) {
          setProxyStatus('\u0631\u06A9\u0648\u0631\u062F\u0647\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F\u0646\u062F\u060C \u0627\u0645\u0627 \u0628\u062E\u0634\u06CC \u0627\u0632 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0634\u0628\u06A9\u0647 \u06A9\u0627\u0645\u0644 \u0646\u06CC\u0633\u062A: ' + (data.warnings || []).join(' '), 'warn');
        } else {
          setProxyStatus('\u0631\u06A9\u0648\u0631\u062F\u0647\u0627 \u0622\u0645\u0627\u062F\u0647\u200C\u0627\u0646\u062F. \u06A9\u0634\u0648\u0631 \u0646\u0645\u0627\u06CC\u0634\u200C\u062F\u0627\u062F\u0647\u200C\u0634\u062F\u0647\u060C \u06A9\u0634\u0648\u0631 \u062B\u0628\u062A ASN \u0627\u0633\u062A \u0648 \u0645\u06A9\u0627\u0646 \u062F\u0642\u06CC\u0642 IP \u0645\u062D\u0633\u0648\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.', 'info');
        }
      } catch (error) {
        proxyIpState.loaded = false;
        proxyIpState.selected = null;
        renderProxyRecords();
        setProxyStatus(error.message || '\u062F\u0631\u06CC\u0627\u0641\u062A \u0631\u06A9\u0648\u0631\u062F\u0647\u0627\u06CC Proxy IP \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F. \u062F\u0648\u0628\u0627\u0631\u0647 \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F.', 'error');
      } finally {
        setProxyLoading(false);
      }
    }

    function openProxyApplyModal() {
      if (!proxyIpState.selected || proxyIpState.loading) return;
      document.getElementById('proxy-apply-address').textContent = proxyIpState.selected;
      openModal('proxy-apply-modal');
    }

    async function applySelectedProxyIp() {
      if (!proxyIpState.selected) return;
      const button = document.getElementById('proxy-confirm-apply');
      button.disabled = true;
      button.textContent = '\u062F\u0631 \u062D\u0627\u0644 \u0628\u0631\u0631\u0633\u06CC \u0648 \u0630\u062E\u06CC\u0631\u0647...';
      setProxyLoading(true);
      try {
        const res = await fetch(basePath + '/proxy-ips/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: proxyIpState.selected }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          const code = data.error && data.error.code;
          if (code === 'NOT_IN_CURRENT_DNS_ANSWER') {
            throw new Error('\u0631\u06A9\u0648\u0631\u062F DNS \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A. \u0644\u06CC\u0633\u062A \u0631\u0627 \u062A\u0627\u0632\u0647\u200C\u0633\u0627\u0632\u06CC \u06A9\u0646\u06CC\u062F \u0648 \u062F\u0648\u0628\u0627\u0631\u0647 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F.');
          }
          throw new Error(data.error && data.error.message ? data.error.message : '\u0630\u062E\u06CC\u0631\u0647\u0654 Proxy IP \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F.');
        }
        document.getElementById('proxy-current-value').textContent = data.proxyIP;
        document.getElementById('st-proxy').value = data.proxyIP;
        closeModal('proxy-apply-modal');
        renderProxyRecords();
        setProxyStatus('Proxy IP \u0633\u0631\u0627\u0633\u0631\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0631\u0648\u06CC ' + data.proxyIP + ' \u062A\u0646\u0638\u06CC\u0645 \u0634\u062F.', 'info');
      } catch (error) {
        closeModal('proxy-apply-modal');
        setProxyStatus(error.message || '\u0630\u062E\u06CC\u0631\u0647\u0654 Proxy IP \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F.', 'error');
      } finally {
        button.disabled = false;
        button.textContent = '\u062A\u0623\u06CC\u06CC\u062F \u0648 \u0627\u0639\u0645\u0627\u0644';
        setProxyLoading(false);
      }
    }

    async function loadCfMetrics() {
      try {
        const res = await fetch('/api/cf-metrics');
        const data = await res.json();
        if (data.ok) {
          const reqs = data.requestsUsed;
          const limit = data.limit;
          const percent = Math.min(100, Math.round((reqs / limit) * 100));
          document.getElementById('stat-cf-reqs').innerHTML = reqs.toLocaleString() + ' <span style="font-size:10px; color:var(--muted)">/ ' + limit.toLocaleString() + '</span>';
          document.getElementById('cf-circle-container').style.display = 'block';
          document.getElementById('cf-circle-progress').setAttribute('stroke-dasharray', percent + ', 100');
          document.getElementById('cf-circle-text').textContent = percent + '%';
          if (percent > 85) {
            document.getElementById('cf-circle-progress').setAttribute('stroke', 'var(--danger)');
          } else if (percent > 60) {
            document.getElementById('cf-circle-progress').setAttribute('stroke', 'orange');
          } else {
            document.getElementById('cf-circle-progress').setAttribute('stroke', 'var(--primary)');
          }
        } else {
          if (data.error && data.error !== 'Not Configured') {
            document.getElementById('stat-cf-reqs').innerHTML = '<span style="font-size:10px; color:var(--danger)">\u062E\u0637\u0627: ' + data.error + '</span>';
          } else {
            document.getElementById('stat-cf-reqs').innerHTML = '<span style="font-size:10px; color:var(--muted)">\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 (\u062F\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A)</span>';
          }
          document.getElementById('cf-circle-container').style.display = 'none';
        }
      } catch (e) {
        console.error(e);
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
var src_default = {
  async fetch(request, env, ctx) {
    try {
      await setupD1Schema(env);
      let currentProxyIP = await getSettingD1(env, "proxy_ip") || env.PROXYIP || "";
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
        if (decodedPath.includes("trojan-ws") || decodedPath.includes("trojan")) {
          return await trojanOverWSHandler(request, authenticate, currentProxyIP, onUsage);
        } else {
          return await vlessOverWSHandler(request, authenticate, currentProxyIP, onUsage);
        }
      }
      const isSetupComplete = !!currentPanelPass && !!currentAdminUUID && !!env.DB;
      if (!isSetupComplete) {
        if (path === "/panel" || path === "/") {
          return new Response(setupPage(!!env.DB, !!currentPanelPass, !!currentAdminUUID, currentAdminUUID, currentProxyIP), {
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
        return new Response(panelPage(host, currentAdminUUID, currentProxyIP, cfAccountId, cfApiToken), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
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
        if (currentPanelPass && await isAuthed(req, currentPanelPass))
          return true;
        const authHeader = req.headers.get("Authorization");
        let token = "";
        if (authHeader && authHeader.startsWith("Bearer "))
          token = authHeader.substring(7).trim();
        else
          token = new URL(req.url).searchParams.get("token") || "";
        if (token) {
          const tokens = await getAllTokens(env);
          if (tokens.some((t) => t.key === token))
            return true;
        }
        return false;
      };
      if (path.startsWith("/api/")) {
        if (!await checkApiAuth(request)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/users") {
          if (request.method === "GET") {
            const users = await getAllUsers(env);
            return new Response(JSON.stringify({ ok: true, users }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
          if (request.method === "POST") {
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
              `).bind(b.id, b.name, b.clean_ip || "", b.proxy_ip || "", b.limit_bytes || 0, b.expiry_date || 0, b.enabled === false ? 0 : 1).run();
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
            await env.DB.prepare("INSERT INTO api_keys (key, name, created_at) VALUES (?, ?, ?)").bind(b.key, b.name, Date.now()).run();
            return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
        }
        if (path.startsWith("/api/tokens/") && request.method === "DELETE") {
          const key = path.split("/").pop();
          await env.DB.prepare("DELETE FROM api_keys WHERE key = ?").bind(key).run();
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (path === "/api/proxy-ips" && request.method === "GET") {
          try {
            const refresh = url.searchParams.get("refresh") === "1";
            const discovery = await resolveProxyRecords(request, { refresh });
            return new Response(JSON.stringify({
              ok: true,
              ingress: { colo: discovery.colo, source: "request.cf.colo" },
              effectiveProxyIp: currentProxyIP,
              records: discovery.records,
              partial: discovery.partial,
              warnings: discovery.warnings
            }), {
              status: 200,
              headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
            });
          } catch (error) {
            const knownError = error instanceof ProxyIpError;
            return new Response(JSON.stringify({
              ok: false,
              error: {
                code: knownError ? error.code : "PROXY_IP_DISCOVERY_FAILED",
                message: knownError ? error.message : "Unable to discover Proxy IP records."
              }
            }), {
              status: knownError ? error.status : 503,
              headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
            });
          }
        }
        if (path === "/api/proxy-ips/apply" && request.method === "POST") {
          try {
            const contentLength = Number(request.headers.get("Content-Length") || 0);
            if (contentLength > 1024) {
              return new Response(JSON.stringify({ ok: false, error: { code: "INVALID_REQUEST", message: "Request body is too large." } }), { status: 413, headers: { "Content-Type": "application/json" } });
            }
            const body = await request.json();
            const address = typeof body.address === "string" ? body.address.trim() : "";
            if (!isValidIpAddress(address)) {
              return new Response(JSON.stringify({ ok: false, error: { code: "INVALID_PROXY_IP", message: "A valid IPv4 or IPv6 address is required." } }), { status: 400, headers: { "Content-Type": "application/json" } });
            }
            const discovery = await resolveProxyRecords(request, { refresh: true, enrich: false });
            if (!discovery.records.some((record) => record.address.toLowerCase() === address.toLowerCase())) {
              return new Response(JSON.stringify({ ok: false, error: { code: "NOT_IN_CURRENT_DNS_ANSWER", message: "The selected IP is no longer in the current DNS response. Refresh and try again." } }), { status: 409, headers: { "Content-Type": "application/json" } });
            }
            if (!env.DB) {
              throw new ProxyIpError("SETTINGS_UNAVAILABLE", "The database binding is unavailable.");
            }
            await setSettingD1(env, "proxy_ip", address);
            return new Response(JSON.stringify({ ok: true, proxyIP: address }), { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
          } catch (error) {
            const knownError = error instanceof ProxyIpError;
            return new Response(JSON.stringify({
              ok: false,
              error: {
                code: knownError ? error.code : "PROXY_IP_APPLY_FAILED",
                message: knownError ? error.message : "Unable to apply the Proxy IP."
              }
            }), {
              status: knownError ? error.status : 503,
              headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
            });
          }
        }
        if (path === "/api/settings" && request.method === "POST") {
          const b = await request.json();
          if (b.proxyIP !== void 0) {
            const proxyIP = typeof b.proxyIP === "string" ? b.proxyIP.trim() : "";
            if (proxyIP && !isValidIpAddress(proxyIP)) {
              return new Response(JSON.stringify({ ok: false, error: "Proxy IP must be a valid IPv4 or IPv6 address." }), { status: 400, headers: { "Content-Type": "application/json" } });
            }
            await setSettingD1(env, "proxy_ip", proxyIP);
          }
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
          const isBrowser = userAgent.includes("mozilla") || userAgent.includes("chrome") || userAgent.includes("safari") || userAgent.includes("applewebkit");
          const isProxyClient = !isBrowser || userAgent.includes("v2ray") || userAgent.includes("hiddify") || userAgent.includes("clash") || userAgent.includes("sing-box") || userAgent.includes("shadowrocket") || userAgent.includes("streisand") || userAgent.includes("v2box") || userAgent.includes("foxray") || userAgent.includes("loon") || userAgent.includes("nekobox");
          const randomizeCase = (str) => str.split("").map((c) => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join("");
          const randomSNI = randomizeCase(host);
          const junkVal = Math.random().toString(36).substring(2, 10);
          const vlessPathObj = { junk: junkVal, protocol: "vl" };
          const trojanPathObj = { junk: junkVal, protocol: "tr" };
          const vlessObfuscatedPath = "/" + btoa(JSON.stringify(vlessPathObj));
          const trojanObfuscatedPath = "/trojan-" + btoa(JSON.stringify(trojanPathObj));
          const addr = user.clean_ip || host;
          const vlessWS = `vless://${user.id}@${addr}:443?encryption=none&security=tls&sni=${randomSNI}&fp=chrome&alpn=http%2F1.1&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(vlessObfuscatedPath + "?ed=2048")}#VLESS-${user.name}`;
          const trojanWS = `trojan://${user.id}@${addr}:443?security=tls&sni=${randomSNI}&fp=chrome&alpn=http%2F1.1&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(trojanObfuscatedPath)}#Trojan-${user.name}`;
          if (isProxyClient) {
            return new Response(btoa(unescape(encodeURIComponent(vlessWS + "\n" + trojanWS + "\n"))), { status: 200, headers: { "Content-Type": "text/plain" } });
          }
          return new Response(subscriptionPage(host, user, vlessWS, trojanWS), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
        }
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
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
export {
  src_default as default
};

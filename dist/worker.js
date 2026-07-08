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
function stringify2(arr, offset = 0) {
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
  const userID = stringify2(new Uint8Array(vlessBuffer.slice(1, 17)));
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
  const handleUpload = (bytes) => {
    currentSessionUpload += bytes;
    if (onUsage) {
      return onUsage(bytes, 0);
    }
    return true;
  };
  const handleDownload = (bytes) => {
    currentSessionDownload += bytes;
    if (onUsage) {
      return onUsage(0, bytes);
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
  const handleUpload = (bytes) => {
    currentSessionUpload += bytes;
    if (onUsage) {
      return onUsage(bytes, 0);
    }
    return true;
  };
  const handleDownload = (bytes) => {
    currentSessionDownload += bytes;
    if (onUsage) {
      return onUsage(0, bytes);
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
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800&display=swap" rel="stylesheet">
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
function setupPage(hasD1, hasPassword, hasUUID, currentUUID, currentProxyIP, envKeys = []) {
  const allGood = hasD1 && hasPassword && hasUUID;
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0646\u0635\u0628 \u0648 \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u067E\u0646\u0644 \u067E\u0646\u0647\u0627\u0646</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07070c;
      --card-bg: rgba(18, 18, 30, 0.6);
      --border: rgba(255, 255, 255, 0.08);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.3);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: Vazirmatn, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-x: hidden; position: relative; }
    body::before, body::after { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, var(--accent) 0%, transparent 70%); opacity: 0.15; filter: blur(50px); z-index: -1; }
    body::before { top: -10%; left: -10%; }
    body::after { bottom: -10%; right: -10%; }
    .container { width: 100%; max-width: 600px; background: var(--card-bg); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 20px; text-align: center; background: linear-gradient(135deg, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .status-box { background: rgba(0,0,0,0.3); border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid var(--border); }
    .item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .item:last-child { border-bottom: none; }
    .item-title { font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 10px; }
    .badge { padding: 4px 10px; border-radius: 8px; font-size: 13px; font-weight: 700; white-space: nowrap; }
    .badge.ok { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge.fail { background: rgba(239, 68, 68, 0.15); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge.warn { background: rgba(245, 158, 11, 0.15); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge.info { background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
    .desc { font-size: 13px; color: var(--text-muted); margin-top: 5px; line-height: 1.6; }
    .code { background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #f472b6; word-break: break-all; }
    .links-box { margin-top: 20px; padding: 15px; border-radius: 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
    .links-box h3 { color: var(--success); margin-bottom: 10px; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>\u2699\uFE0F \u0646\u0635\u0628 \u0648 \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0648\u0631\u06A9\u0631</h1>
    <p style="text-align:center; font-size:14px; color:var(--text-muted); margin-bottom:25px;">
      \u0628\u0631\u0627\u06CC \u0639\u0645\u0644\u06A9\u0631\u062F \u0635\u062D\u06CC\u062D \u067E\u0631\u0648\u06A9\u0633\u06CC\u060C \u0648\u0636\u0639\u06CC\u062A \u0645\u062A\u063A\u06CC\u0631\u0647\u0627 \u0648 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 \u0631\u0627 \u062F\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F.
    </p>

    <div class="status-box">
      <!-- D1 Database Check -->
      <div class="item">
        <div>
          <div class="item-title">\u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 Cloudflare D1</div>
          <div class="desc">\u0628\u0631\u0627\u06CC \u0630\u062E\u06CC\u0631\u0647\u200C\u0633\u0627\u0632\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0648 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0633\u06CC\u0633\u062A\u0645 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A. \u062F\u0631 \u0628\u062E\u0634 Bindings \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u06CC\u06A9 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 D1 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F \u0648 \u0646\u0627\u0645 \u0628\u0627\u06CC\u0646\u062F\u06CC\u0646\u06AF \u0622\u0646 \u0631\u0627 \u062F\u0642\u06CC\u0642\u0627\u064B <span class="code">DB</span> \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.</div>
        </div>
        <div class="badge ${hasD1 ? "ok" : "fail"}">${hasD1 ? "\u0645\u062A\u0635\u0644 \u0634\u062F \u2705" : "\u0645\u062A\u0635\u0644 \u0646\u06CC\u0633\u062A \u274C"}</div>
      </div>
      
      <!-- Password Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u062F\u0645\u06CC\u0646 <span class="code">PASSWORD</span></div>
          <div class="desc">\u0628\u0631\u0627\u06CC \u0627\u0645\u0646\u06CC\u062A \u067E\u0646\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A. \u06CC\u06A9 \u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC \u0628\u0647 \u0646\u0627\u0645 <span class="code">PASSWORD</span> \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0633\u0627\u0632\u06CC\u062F (\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0645\u06CC\u200C\u0634\u0648\u062F \u0622\u0646 \u0631\u0627 \u0631\u0645\u0632\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646\u06CC\u062F).</div>
        </div>
        <div class="badge ${hasPassword ? "ok" : "fail"}">${hasPassword ? "\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2705" : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u274C"}</div>
      </div>

      <!-- UUID Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 <span class="code">UUID</span></div>
          <div class="desc">\u0634\u0645\u0627 \u0628\u0627\u06CC\u062F \u06CC\u06A9 UUID \u0645\u0639\u062A\u0628\u0631 (\u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC <span class="code">UUID</span>) \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F \u06A9\u0647 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0622\u062F\u0631\u0633 \u067E\u0646\u0644 \u0627\u062F\u0645\u06CC\u0646 \u0634\u0645\u0627 \u0639\u0645\u0644 \u0645\u06CC\u200C\u06A9\u0646\u062F. ${currentUUID ? `\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC: <span class="code">${currentUUID}</span>` : ""}</div>
        </div>
        <div class="badge ${hasUUID ? "ok" : "fail"}">${hasUUID ? "\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2705" : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u274C"}</div>
      </div>

      <!-- Proxy IP Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0622\u06CC\u200C\u067E\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC <span class="code">PROXYIP</span></div>
          <div class="desc">\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC: ${currentProxyIP ? '<span class="code">' + currentProxyIP + "</span>" : "\u0646\u062F\u0627\u0631\u062F"}. \u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC <span class="code">PROXYIP</span> \u0628\u0631\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u0628\u0631\u062E\u06CC \u0633\u0627\u06CC\u062A\u200C\u0647\u0627.</div>
        </div>
        <div class="badge info">\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC \u2139\uFE0F</div>
      </div>
    </div>

    ${allGood ? `
    <div class="links-box">
      <h3>\u2705 \u0633\u06CC\u0633\u062A\u0645 \u06A9\u0627\u0645\u0644\u0627\u064B \u0622\u0645\u0627\u062F\u0647 \u0627\u0633\u062A!</h3>
      <div class="desc" style="color:var(--text);">
        \u0627\u0632 \u0627\u06CC\u0646 \u067E\u0633 \u0628\u0627 \u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0622\u062F\u0631\u0633 \u0627\u0635\u0644\u06CC \u0648\u0631\u06A9\u0631\u060C \u0635\u0641\u062D\u0647 \u062C\u0639\u0644\u06CC Nginx \u0631\u0627 \u062E\u0648\u0627\u0647\u06CC\u062F \u062F\u06CC\u062F \u062A\u0627 \u0627\u0633\u062A\u062A\u0627\u0631 \u062D\u0641\u0638 \u0634\u0648\u062F.<br><br>
        \u{1F517} <strong>\u0622\u062F\u0631\u0633 \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0634\u0645\u0627:</strong><br><span class="code" style="color:#a78bfa;">/panel</span><br><br>
      </div>
    </div>
    ` : `
    <div style="text-align:center; margin-top:20px; color:var(--warning); font-size:14px; font-weight: 500;">
      \u26A0\uFE0F \u062A\u0627 \u0632\u0645\u0627\u0646\u06CC \u06A9\u0647 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 D1 \u0648 \u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC \u0631\u0627 \u062A\u0646\u0638\u06CC\u0645 \u0646\u06A9\u0646\u06CC\u062F\u060C \u0627\u0645\u0646\u06CC\u062A \u0648 \u0639\u0645\u0644\u06A9\u0631\u062F \u067E\u0631\u0648\u06A9\u0633\u06CC \u0634\u0645\u0627 \u06A9\u0627\u0645\u0644 \u0646\u062E\u0648\u0627\u0647\u062F \u0628\u0648\u062F!
    </div>
    `}

    <div style="margin-top:20px; padding:10px; border-radius:8px; background:rgba(255,255,255,0.02); border:1px solid var(--border); font-size:11px; font-family:monospace; text-align:left; direction:ltr; color:var(--text-muted); word-break:break-all;">
      DEBUG Env Keys: [${envKeys.join(", ")}]
    </div>
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
  let daysLeftText = "\u0646\u0627\u0645\u062D\u062F\u0648\u062F";
  if (user.expiry_date > 0) {
    const diff = user.expiry_date - Date.now();
    if (diff < 0) {
      daysLeftText = "\u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647";
    } else {
      const days = Math.ceil(diff / (1e3 * 60 * 60 * 24));
      daysLeftText = days + " \u0631\u0648\u0632";
    }
  }
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0646\u0647\u0627\u0646 - ${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --bg: #0f111a; --card: rgba(22, 24, 38, 0.7); --border: rgba(255, 255, 255, 0.08); --accent: #8b5cf6; --text: #f8fafc; --muted: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Vazirmatn, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    body::before { content: ""; position: absolute; width: 300px; height: 300px; background: var(--accent); filter: blur(150px); opacity: 0.2; z-index: -1; }
    .container { width: 100%; max-width: 480px; background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 32px; backdrop-filter: blur(20px); text-align: center; }
    h1 { font-size: 24px; margin-bottom: 8px; font-weight: 800; background: linear-gradient(to right, #c084fc, #f472b6); -webkit-background-clip: text; color: transparent; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: rgba(16, 185, 129, 0.1); color: #10b981; margin-bottom: 24px; }
    .status-badge.disabled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .stat-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 16px; padding: 16px; text-align: center; }
    .stat-val { font-size: 16px; font-weight: 700; color: #a5b4fc; direction: ltr; margin-top: 8px; }
    
    .progress-bar-bg { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-top: 12px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #d946ef); width: ${percent}%; border-radius: 10px; }
    
    .config-box { background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 16px; text-align: left; direction: ltr; position: relative; }
    .config-title { font-size: 12px; color: var(--muted); margin-bottom: 8px; font-weight: bold; text-transform: uppercase; text-align: right; direction: rtl; }
    .config-val { font-family: monospace; font-size: 11px; color: #cbd5e1; word-break: break-all; opacity: 0.8; }
    .btn-copy { position: absolute; top: 12px; right: 12px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); color: white; padding: 6px 12px; border-radius: 8px; font-size: 11px; cursor: pointer; transition: all 0.2s; }
    .btn-copy:hover { background: var(--accent); }
    .btn-sub { width: 100%; padding: 14px; background: linear-gradient(135deg, #7c3aed, #db2777); border: none; border-radius: 14px; color: white; font-weight: bold; cursor: pointer; font-size: 15px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${name}</h1>
    <div class="status-badge ${user.enabled ? "" : "disabled"}">${user.enabled ? "\u{1F7E2} \u0641\u0639\u0627\u0644" : "\u{1F534} \u0645\u0633\u062F\u0648\u062F"}</div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div style="font-size: 12px; color: var(--muted)">\u062A\u0631\u0627\u0641\u06CC\u06A9 \u0645\u0635\u0631\u0641\u06CC</div>
        <div class="stat-val">${usageText}</div>
        <div class="progress-bar-bg"><div class="progress-bar-fill"></div></div>
      </div>
      <div class="stat-card">
        <div style="font-size: 12px; color: var(--muted)">\u0627\u0639\u062A\u0628\u0627\u0631 \u0632\u0645\u0627\u0646\u06CC</div>
        <div class="stat-val">${daysLeftText}</div>
      </div>
    </div>
    
    <div class="config-box">
      <div class="config-title">VLESS WS</div>
      <button class="btn-copy" onclick="navigator.clipboard.writeText('${vlessWS}')">\u06A9\u067E\u06CC</button>
      <div class="config-val">${vlessWS.substring(0, 50)}...</div>
    </div>
    <div class="config-box">
      <div class="config-title">Trojan WS</div>
      <button class="btn-copy" onclick="navigator.clipboard.writeText('${trojanWS}')">\u06A9\u067E\u06CC</button>
      <div class="config-val">${trojanWS.substring(0, 50)}...</div>
    </div>
    
    <button class="btn-sub" onclick="navigator.clipboard.writeText('${subLink}')">\u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u0627\u06CC\u0628 (\u0628\u062F\u0648\u0646 \u0641\u06CC\u0644\u062A\u0631)</button>
  </div>
</body>
</html>`;
}
function panelPage(hostname, adminUUID) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>\u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0646\u0647\u0627\u0646</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --bg: #09090b; --surface: #18181b; --surface-hover: #27272a; --border: #27272a; --primary: #a855f7; --primary-hover: #9333ea; --text: #fafafa; --muted: #a1a1aa; --danger: #ef4444; --success: #10b981; }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: Vazirmatn, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); display: flex; height: 100vh; overflow: hidden; }
    
    /* Sidebar */
    .sidebar { width: 260px; background: var(--surface); border-left: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px 0; }
    .brand { padding: 0 24px 20px; font-size: 24px; font-weight: 800; border-bottom: 1px solid var(--border); margin-bottom: 20px; background: linear-gradient(135deg, #c084fc, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-item { padding: 12px 24px; color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; font-weight: 500; }
    .nav-item:hover, .nav-item.active { background: var(--surface-hover); color: var(--primary); border-right: 3px solid var(--primary); }
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
  </style>
</head>
<body>

  <!-- Sidebar -->
  <div class="sidebar">
    <div class="brand">\u0646\u0647\u0627\u0646</div>
    <div class="nav-item active" onclick="nav('users')"><span class="nav-icon">\u{1F465}</span> \u06A9\u0627\u0631\u0628\u0631\u0627\u0646</div>
    <div class="nav-item" onclick="nav('api')"><span class="nav-icon">\u{1F511}</span> \u062A\u0648\u06A9\u0646\u200C\u0647\u0627\u06CC API</div>
    <div class="nav-item" onclick="nav('settings')"><span class="nav-icon">\u2699\uFE0F</span> \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0633\u06CC\u0633\u062A\u0645</div>
    <div style="flex:1"></div>
    <div class="nav-item" onclick="window.location.href='/'" style="color:var(--danger)"><span class="nav-icon">\u{1F6AA}</span> \u062E\u0631\u0648\u062C</div>
  </div>

  <!-- Main -->
  <div class="main">
  
    <!-- Users Page -->
    <div id="page-users" class="page active">
      <div class="header">
        <h2 class="title">\u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646</h2>
        <button class="btn" onclick="openModal('user-modal')">+ \u0627\u0641\u0632\u0648\u062F\u0646 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F</button>
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
          <input type="text" class="form-control" id="st-proxy" placeholder="\u0645\u062B\u0627\u0644: 1.2.3.4">
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
        <label>\u0627\u0639\u062A\u0628\u0627\u0631 \u0632\u0645\u0627\u0646\u06CC (\u0631\u0648\u0632) - 0 \u0628\u0631\u0627\u06CC \u0646\u0627\u0645\u062D\u062F\u0648\u062F</label>
        <input type="number" id="u-days" class="form-control" value="0">
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

  <script>
    const basePath = '/api';

    function nav(page) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + page).classList.add('active');
      event.currentTarget.classList.add('active');
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
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';
        if (data.users.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#a1a1aa">\u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F</td></tr>';
          return;
        }
        data.users.forEach(u => {
          let usage = u.limit_bytes ? \`\${formatBytes(u.used_bytes)} / \${formatBytes(u.limit_bytes)}\` : \`\${formatBytes(u.used_bytes)} (\u221E)\`;
          let days = '\u221E';
          if (u.expiry_date) {
            let left = Math.ceil((u.expiry_date - Date.now()) / 86400000);
            days = left < 0 ? '\u0645\u0646\u0642\u0636\u06CC' : left + ' \u0631\u0648\u0632';
          }
          let statusBadge = u.enabled ? '<span class="badge green">\u0641\u0639\u0627\u0644</span>' : '<span class="badge red">\u0645\u0633\u062F\u0648\u062F</span>';
          
          tbody.innerHTML += \`<tr>
            <td style="font-weight:600">\${u.name}</td>
            <td><span class="code-span">\${u.id.substring(0,8)}...</span></td>
            <td>\${statusBadge}</td>
            <td style="direction:ltr; text-align:right">\${usage}</td>
            <td>\${days}</td>
            <td>
              <div class="flex-gap">
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="toggleUser('\${u.id}')">\${u.enabled ? '\u0645\u0633\u062F\u0648\u062F' : '\u0622\u0632\u0627\u062F\u0633\u0627\u0632\u06CC'}</button>
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="window.open('https://\${hostname}/\${u.id}/sub', '_blank')">\u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628</button>
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
       let days = parseInt(document.getElementById('u-days').value) || 0;
       const clean = document.getElementById('u-cleanip').value;
       
       if (!id || !name) { alert("\u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0646\u0627\u0645 \u0648 UUID \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A!"); return; }
       
       const limit_bytes = gb * 1024 * 1024 * 1024;
       const expiry_date = days > 0 ? Date.now() + (days * 86400000) : 0;
       
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
       const payload = { uuid: u, proxyIP: prox };
       if (p) payload.password = p;
       
       await fetch(basePath + '/settings', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify(payload)
       });
       alert('\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F.');
    }

    // Init
    loadUsers();
    loadTokens();
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
      let currentPanelPass = await getSettingD1(env, "panel_pass") || env.PASSWORD || "";
      let currentAdminUUID = await getSettingD1(env, "uuid") || env.UUID || "";
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
      const onUsage = (userID) => {
        return (upload, download) => {
          if (!env.DB)
            return true;
          let user = usersCache?.find((u) => u.id === userID);
          if (!user)
            return true;
          user.used_bytes += upload + download;
          if (upload + download > 0) {
            ctx.waitUntil(updateUsageD1(env, userID, upload + download).catch(console.error));
          }
          if (user.limit_bytes > 0 && user.used_bytes >= user.limit_bytes)
            return false;
          if (user.expiry_date > 0 && Date.now() > user.expiry_date)
            return false;
          return true;
        };
      };
      if (upgradeHeader === "websocket") {
        const decodedPath = decodeURIComponent(path).toLowerCase();
        if (decodedPath.includes("trojan-ws") || decodedPath.includes("trojan")) {
          return await trojanOverWSHandler(request, authenticate, currentProxyIP, (up, down) => true);
        } else {
          return await vlessOverWSHandler(request, authenticate, currentProxyIP, (up, down) => true);
        }
      }
      if (path === "/") {
        let showSetup = false;
        if (!currentPanelPass || !currentAdminUUID || !env.DB)
          showSetup = true;
        else if (await isAuthed(request, currentPanelPass))
          showSetup = true;
        if (showSetup) {
          const envKeys = Object.keys(env);
          if (path === "/debug-env") {
            return new Response(JSON.stringify({
              PASSWORD_type: typeof env.PASSWORD,
              PASSWORD_length: env.PASSWORD ? env.PASSWORD.length : null,
              UUID_type: typeof env.UUID,
              UUID_length: env.UUID ? env.UUID.length : null,
              db_panel_pass: await getSettingD1(env, "panel_pass"),
              db_uuid: await getSettingD1(env, "uuid")
            }), { headers: { "Content-Type": "application/json" } });
          }
          return new Response(setupPage(!!env.DB, !!currentPanelPass, !!currentAdminUUID, currentAdminUUID, currentProxyIP, envKeys), {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
        return new Response(nginxPage(), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Server": "nginx/1.24.0" } });
      }
      if (path === "/panel") {
        const host = request.headers.get("Host");
        if (currentPanelPass && !await isAuthed(request, currentPanelPass)) {
          return new Response(loginPage("/panel", host), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
        }
        return new Response(panelPage(host, currentAdminUUID, currentProxyIP), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
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
            await env.DB.prepare("INSERT INTO users (id, name, clean_ip, proxy_ip, limit_bytes, expiry_date, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(b.id, b.name, b.clean_ip || "", b.proxy_ip || "", b.limit_bytes || 0, b.expiry_date || 0, b.enabled === false ? 0 : 1).run();
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
        if (path === "/api/settings" && request.method === "POST") {
          const b = await request.json();
          if (b.proxyIP !== void 0)
            await setSettingD1(env, "proxy_ip", b.proxyIP.trim());
          if (b.password !== void 0)
            await setSettingD1(env, "panel_pass", b.password.trim());
          if (b.uuid !== void 0 && isValidUUID(b.uuid.trim()))
            await setSettingD1(env, "uuid", b.uuid.trim());
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
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
          const isProxyClient = userAgent.includes("v2ray") || userAgent.includes("hiddify") || userAgent.includes("clash") || userAgent.includes("sing-box");
          const addr = user.clean_ip || currentProxyIP || host;
          const vlessWS = `vless://${user.id}@${addr}:443?encryption=none&security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=/?ed=2048#VLESS-${user.name}`;
          const trojanWS = `trojan://${user.id}@${addr}:443?security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=/trojan-ws#Trojan-${user.name}`;
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

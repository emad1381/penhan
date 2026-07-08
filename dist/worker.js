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
function isApiAuthed(request, currentPanelPass, currentUserID) {
  const authHeader = request.headers.get("Authorization");
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    const url = new URL(request.url);
    token = url.searchParams.get("token") || "";
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
function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel)
          return;
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
async function handleTCPOutBound(remoteSocketWrapper, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, proxyIP, log) {
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
      remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log);
    } catch (err) {
      log("retry connect failed: " + err);
      webSocket.close(1011, "Retry failed: " + err);
    }
  }
  try {
    const tcpSocket = await connectAndWrite(addressRemote, portRemote);
    await remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retry, log);
  } catch (error) {
    log("first connection attempt failed: " + error);
    if (proxyIP) {
      retry();
    } else {
      webSocket.close(1011, "Connection failed: " + error);
    }
  }
}
async function remoteSocketToWS(remoteSocket, webSocket, vlessResponseHeader, retry, log) {
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
function processVlessHeader(vlessBuffer, userID) {
  if (vlessBuffer.byteLength < 24) {
    return { hasError: true, message: "invalid data" };
  }
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isValidUser = false;
  let isUDP = false;
  if (stringify2(new Uint8Array(vlessBuffer.slice(1, 17))) === userID) {
    isValidUser = true;
  }
  if (!isValidUser) {
    return { hasError: true, message: "invalid user" };
  }
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
    isUDP
  };
}
async function vlessOverWSHandler(request, userID, proxyIP) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);
  webSocket.accept();
  webSocket.binaryType = "arraybuffer";
  let address = "";
  let portWithRandomLog = "";
  const log = (info, event) => {
    console.log("[VLESS WS " + address + ":" + portWithRandomLog + "] " + info, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";
  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);
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
        isUDP
      } = processVlessHeader(chunk, userID);
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
      handleTCPOutBound(remoteSocketWrapper, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, proxyIP, log);
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
async function trojanOverWSHandler(request, trojanPass, proxyIP) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);
  webSocket.accept();
  webSocket.binaryType = "arraybuffer";
  let address = "";
  let portWithRandomLog = "";
  const log = (info, event) => {
    console.log("[Trojan WS " + address + ":" + portWithRandomLog + "] " + info, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";
  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);
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
      const trojanPasswordHash = sha224_and_224(trojanPass, true);
      const {
        hasError,
        message,
        portRemote = 443,
        addressRemote = "",
        rawDataIndex,
        isUDP
      } = processTrojanHeader(chunk, trojanPasswordHash);
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
      handleTCPOutBound(remoteSocketWrapper, addressRemote, portRemote, rawClientData, webSocket, new Uint8Array([]), proxyIP, log);
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
  <style>
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');

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
      font-family: Vazirmatn, Tahoma, sans-serif;
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
function subscriptionPage(hostname, uuid, currentTrPass, currentCleanIP, currentVlessPath, currentTrojanPath) {
  const addr = currentCleanIP || hostname;
  const vlessPath = currentVlessPath || "/?ed=2048";
  const trojanPath = currentTrojanPath || `/${uuid}/trojan-ws`;
  const vlessWS = `vless://${uuid}@${addr}:443?encryption=none&security=tls&sni=${hostname}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${hostname}&path=${encodeURIComponent(vlessPath)}#VLESS-WS-${hostname}`;
  const trojanWS = `trojan://${currentTrPass}@${addr}:443?security=tls&sni=${hostname}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${hostname}&path=${encodeURIComponent(trojanPath)}#Trojan-WS-${hostname}`;
  const subLink = `https://${hostname}/${uuid}/sub`;
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0627\u062A\u0635\u0627\u0644 \u0646\u0647\u0627\u0646</title>
  <style>
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');

    :root {
      --bg: #07070c;
      --card-bg: rgba(18, 18, 35, 0.55);
      --border: rgba(255, 255, 255, 0.05);
      --border-focus: rgba(139, 92, 246, 0.4);
      --accent: #8b5cf6;
      --accent-gradient: linear-gradient(135deg, #7c3aed, #d946ef);
      --text: #f3f4f6;
      --text-muted: #8e939e;
      --bg-darker: rgba(0, 0, 0, 0.25);
      --success: #10b981;
      --error: #ef4444;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Vazirmatn, Tahoma, sans-serif;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      overflow-x: hidden;
      position: relative;
    }

    body::before, body::after {
      content: "";
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: var(--accent);
      filter: blur(130px);
      opacity: 0.15;
      z-index: 0;
      pointer-events: none;
    }
    body::before { top: 10%; right: 10%; }
    body::after { bottom: 10%; left: 10%; }

    .sub-container {
      width: 100%;
      max-width: 520px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 30px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      z-index: 1;
      position: relative;
    }

    .header {
      text-align: center;
      margin-bottom: 25px;
    }

    .header-logo {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .header-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #a78bfa, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 50px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      font-size: 11px;
      font-weight: 700;
      border: 1px solid rgba(16, 185, 129, 0.2);
      margin-top: 10px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.6; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.6; }
    }

    .sub-link-card {
      background: var(--bg-darker);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 25px;
      text-align: center;
    }

    .sub-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 8px;
      font-weight: 600;
    }

    .sub-input-group {
      display: flex;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 4px;
      align-items: center;
      gap: 4px;
    }

    .sub-url {
      flex: 1;
      font-family: Vazirmatn, Tahoma, sans-serif;
      font-size: 11px;
      color: #a5b4fc;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 10px;
      direction: ltr;
      text-align: left;
    }

    .btn-action {
      background: var(--accent-gradient);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .config-card {
      background: var(--bg-darker);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 15px;
      position: relative;
    }

    .config-tag {
      position: absolute;
      top: 15px;
      left: 16px;
      font-size: 9px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(139, 92, 246, 0.1);
      color: #a78bfa;
      border: 1px solid rgba(139, 92, 246, 0.2);
      font-family: Vazirmatn, Tahoma, sans-serif;
    }

    .config-title {
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .config-link-container {
      font-family: Vazirmatn, Tahoma, sans-serif;
      font-size: 10px;
      color: #a5b4fc;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      padding: 8px;
      word-break: break-all;
      direction: ltr;
      text-align: left;
      margin-bottom: 12px;
      max-height: 50px;
      overflow-y: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .config-actions {
      display: flex;
      gap: 8px;
    }

    .btn-config {
      flex: 1;
      padding: 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: white;
    }

    .btn-copy-link {
      background: var(--accent-gradient);
    }

    .btn-qr {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-qr:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .config-obfuscation-box {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px dashed rgba(139, 92, 246, 0.15);
      font-size: 10px;
    }

    .obf-header {
      font-weight: 700;
      color: #c084fc;
      margin-bottom: 6px;
      text-align: right;
      direction: rtl;
    }

    .obf-item {
      margin-bottom: 3px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      gap: 10px;
      direction: ltr;
    }

    .obf-val {
      font-family: Vazirmatn, Tahoma, sans-serif;
      color: #a5b4fc;
      word-break: break-all;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(5, 5, 10, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      z-index: 1000;
      padding: 20px;
    }

    .modal.show {
      opacity: 1;
      pointer-events: auto;
    }

    .modal-content {
      background: #111122;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 25px;
      width: 100%;
      max-width: 320px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      transform: scale(0.9);
      transition: transform 0.3s;
    }

    .modal.show .modal-content {
      transform: scale(1);
    }

    .modal-title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .qr-img {
      width: 200px;
      height: 200px;
      background: white;
      border-radius: 12px;
      padding: 10px;
      margin: 0 auto 15px;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .toast {
      position: fixed;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(139, 92, 246, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 10px 20px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      z-index: 2000;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
    }

    .toast.show {
      transform: translateX(-50%) translateY(0);
    }

    .toast.err {
      background: rgba(239, 68, 68, 0.9);
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    }

    .footer {
      text-align: center;
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 25px;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
</head>
<body>
  <div class="sub-container">
    <div class="header">
      <div class="header-logo">\u{1F6F0}\uFE0F</div>
      <div class="header-title">\u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0627\u062A\u0635\u0627\u0644 \u0646\u0647\u0627\u0646 (Nahan)</div>
      <div>
        <span class="status-badge">
          <span class="status-dot"></span>
          \u0627\u0634\u062A\u0631\u0627\u06A9 \u0634\u0645\u0627 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A
        </span>
      </div>
    </div>

    <div class="sub-link-card">
      <div class="sub-label">\u{1F517} \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u0627\u06CC\u0628 \u0645\u0633\u062A\u0642\u06CC\u0645 (\u062C\u0647\u062A \u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u062F\u0631 \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631):</div>
      <div class="sub-input-group">
        <div class="sub-url" id="subUrl">${subLink}</div>
        <button class="btn-action" onclick="copyText('subUrl', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
      </div>
    </div>

    <div class="section-title">\u{1F680} \u06A9\u0627\u0646\u0641\u06CC\u06AF\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644 \u0634\u0645\u0627 (Configs):</div>

    <div class="config-card">
      <span class="config-tag">VLESS WS</span>
      <div class="config-title">\u{1F680} VLESS over Custom WebSocket</div>
      <div class="config-link-container" id="link-vlessWS">${vlessWS}</div>
      <div class="config-actions">
        <button class="btn-config btn-copy-link" onclick="copyText('link-vlessWS', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
        <button class="btn-config btn-qr" onclick="showQR('${vlessWS}', 'VLESS WS')">\u{1F50D} \u0646\u0645\u0627\u06CC\u0634 QR</button>
      </div>
      <div class="config-obfuscation-box">
        <div class="obf-header">\u{1F4A1} \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u06A9\u0644\u0627\u06CC\u0646\u062A (Custom WS Headers):</div>
        <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${hostname}</span></div>
        <div class="obf-item"><strong>Path:</strong> <span class="obf-val">${vlessPath}</span></div>
        <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
      </div>
    </div>

    <div class="config-card">
      <span class="config-tag">Trojan WS</span>
      <div class="config-title">\u{1F511} Trojan over Custom WebSocket</div>
      <div class="config-link-container" id="link-trojanWS">${trojanWS}</div>
      <div class="config-actions">
        <button class="btn-config btn-copy-link" onclick="copyText('link-trojanWS', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
        <button class="btn-config btn-qr" onclick="showQR('${trojanWS}', 'Trojan WS')">\u{1F50D} \u0646\u0645\u0627\u06CC\u0634 QR</button>
      </div>
      <div class="config-obfuscation-box">
        <div class="obf-header">\u{1F4A1} \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u06A9\u0644\u0627\u06CC\u0646\u062A (Custom WS Headers):</div>
        <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${hostname}</span></div>
        <div class="obf-item"><strong>Path:</strong> <span class="obf-val">${trojanPath}</span></div>
        <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
      </div>
    </div>

    <div class="footer">
      \u0637\u0631\u0627\u062D\u06CC \u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u0639\u0628\u0648\u0631 \u0627\u0632 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A\u200C\u0647\u0627 \u0648 \u062D\u0641\u0638 \u0622\u0632\u0627\u062F\u06CC \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u2764\uFE0F
    </div>
  </div>

  <div class="modal" id="qrModal">
    <div class="modal-content">
      <div class="modal-title" id="modalTitle">\u06A9\u062F QR \u0627\u062A\u0635\u0627\u0644</div>
      <div id="qrContainer" class="qr-img" style="background:white; padding:10px; border-radius:10px; display:inline-block;"></div>
      <button class="btn-close" onclick="closeModal()">\u0628\u0633\u062A\u0646 \u067E\u0646\u062C\u0631\u0647</button>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    function copyText(elementId, btn) {
      const text = document.getElementById(elementId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('\u{1F4CB} \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u06A9\u067E\u06CC \u0634\u062F!');
        const prev = btn.textContent;
        btn.textContent = '\u2705 \u06A9\u067E\u06CC \u0634\u062F!';
        setTimeout(() => { btn.textContent = prev; }, 2000);
      }).catch(() => {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u06A9\u067E\u06CC \u06A9\u0631\u062F\u0646', true);
      });
    }

    function showQR(link, title) {
      const modal = document.getElementById('qrModal');
      const modalTitle = document.getElementById('modalTitle');
      const qrImage = document.getElementById('qrImage');
      
      modalTitle.textContent = '\u06A9\u062F QR \u0628\u0631\u0627\u06CC: ' + title;
      qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(link);
      modal.classList.add('show');
    }

    function closeModal() {
      document.getElementById('qrModal').classList.remove('show');
    }

    function showToast(msg, isErr) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast' + (isErr ? ' err' : '') + ' show';
      setTimeout(() => { t.classList.remove('show'); }, 3000);
    }
  <\/script>
</body>
</html>`;
}
function panelPage(hostname, uuid, currentTrPass, currentCleanIP, currentProxyIP, currentVlessPath, currentTrojanPath, hasPass, cfColo = "N/A", tlsVersion = "N/A") {
  const addr = currentCleanIP || hostname;
  const vlessPath = currentVlessPath || "/?ed=2048";
  const trojanPath = currentTrojanPath || `/${uuid}/trojan-ws`;
  const vlessWS = `vless://${uuid}@${addr}:443?encryption=none&security=tls&sni=${hostname}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${hostname}&path=${encodeURIComponent(vlessPath)}#VLESS-WS-${hostname}`;
  const trojanWS = `trojan://${currentTrPass}@${addr}:443?security=tls&sni=${hostname}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${hostname}&path=${encodeURIComponent(trojanPath)}#Trojan-WS-${hostname}`;
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u062F\u0627\u0634\u0628\u0648\u0631\u062F \u0645\u062F\u06CC\u0631\u06CC\u062A \u0646\u0647\u0627\u0646</title>
  <style>
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');

    :root {
      --bg: #07070c;
      --card-bg: rgba(18, 18, 35, 0.55);
      --border: rgba(255, 255, 255, 0.05);
      --border-focus: rgba(139, 92, 246, 0.4);
      --accent: #8b5cf6;
      --accent-gradient: linear-gradient(135deg, #7c3aed, #d946ef);
      --text: #f3f4f6;
      --text-muted: #8e939e;
      --bg-darker: rgba(0, 0, 0, 0.25);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.1);
      --error: #ef4444;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Vazirmatn, Tahoma, sans-serif;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      overflow-x: hidden;
      position: relative;
    }

    body::before, body::after {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      opacity: 0.08;
      filter: blur(80px);
      z-index: -1;
    }
    body::before { top: 10%; left: 5%; }
    body::after { bottom: 10%; right: 5%; }

    .container {
      width: 100%;
      max-width: 680px;
      background: var(--card-bg);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 30px;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.02);
      animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
    }

    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--success-glow);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.15);
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .badge-status::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }

    .header h1 {
      font-size: 22px;
      font-weight: 900;
      background: linear-gradient(135deg, #a78bfa, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }

    .header p {
      font-size: 13px;
      color: var(--text-muted);
    }

    /* Tabs */
    .tabs-nav {
      display: flex;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px;
      border-radius: 14px;
      margin-bottom: 25px;
      border: 1px solid var(--border);
    }

    .tab-btn {
      flex: 1;
      padding: 10px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.25s;
      text-align: center;
    }

    .tab-btn:hover {
      color: var(--text);
    }

    .tab-btn.active {
      background: var(--accent-gradient);
      color: white;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
    }

    .tab-content {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Dashboard Cards */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    @media (max-width: 500px) {
      .grid-2 { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: var(--bg-darker);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .stat-val {
      font-size: 16px;
      font-weight: 800;
      color: #c8c8ff;
      word-break: break-all;
    }

    /* Latency Checker */
    .ping-box {
      background: var(--bg-darker);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px;
      text-align: center;
      margin-top: 15px;
    }

    .ping-results {
      margin-top: 12px;
      display: flex;
      justify-content: center;
      gap: 15px;
      font-size: 12px;
      font-family: Vazirmatn, Tahoma, sans-serif;
    }

    .ping-tag {
      background: rgba(255, 255, 255, 0.03);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
    }

    /* Config Card list */
    .config-card {
      background: var(--bg-darker);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px;
      margin-bottom: 15px;
      position: relative;
    }

    .config-tag {
      position: absolute;
      top: 18px;
      left: 20px;
      font-size: 9px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(139, 92, 246, 0.1);
      color: #a78bfa;
      border: 1px solid rgba(139, 92, 246, 0.2);
      font-family: Vazirmatn, Tahoma, sans-serif;
    }

    .config-title {
      font-size: 14px;
      font-weight: 800;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .config-link-container {
      font-family: Vazirmatn, Tahoma, sans-serif;
      font-size: 11px;
      color: #a5b4fc;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      padding: 10px;
      word-break: break-all;
      direction: ltr;
      max-height: 54px;
      overflow-y: hidden;
      margin-bottom: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .config-actions {
      display: flex;
      gap: 10px;
    }

    .config-obfuscation-box {
      margin-top: 15px;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px dashed rgba(139, 92, 246, 0.2);
      font-size: 11px;
    }
    .obf-header {
      font-weight: 700;
      color: #c084fc;
      margin-bottom: 8px;
      text-align: right;
      direction: rtl;
    }
    .obf-item {
      margin-bottom: 4px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      gap: 10px;
      direction: ltr;
    }
    .obf-val {
      font-family: Vazirmatn, Tahoma, sans-serif;
      color: #a5b4fc;
      word-break: break-all;
    }

    .btn-config {
      flex: 1;
      padding: 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.25s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-copy-link {
      background: var(--accent-gradient);
      color: white;
      box-shadow: 0 4px 10px rgba(124, 58, 237, 0.2);
    }

    .btn-copy-link:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
    }

    .btn-qr {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-qr:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }

    /* Modal for QR Code */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .modal.show {
      opacity: 1;
      pointer-events: auto;
    }

    .modal-content {
      background: #111122;
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 30px;
      max-width: 340px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      transform: translateY(10px);
      transition: transform 0.3s ease;
    }

    .modal.show .modal-content {
      transform: translateY(0);
    }

    .modal-title {
      font-size: 15px;
      font-weight: 800;
      margin-bottom: 15px;
    }

    .qr-container {
      background: white;
      padding: 15px;
      border-radius: 16px;
      display: inline-block;
      margin-bottom: 20px;
    }

    .qr-image {
      display: block;
      width: 200px;
      height: 200px;
    }

    .btn-modal-close {
      width: 100%;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text-muted);
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s;
    }

    .btn-modal-close:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    /* Form Styles */
    .field-card {
      background: var(--bg-darker);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px;
      margin-bottom: 16px;
    }

    .field-label {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .field-desc {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 12px;
      line-height: 1.6;
    }

    .field-input-group {
      display: flex;
      gap: 10px;
    }

    .field-input {
      flex: 1;
      padding: 12px 14px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text);
      font-size: 13px;
      outline: none;
      transition: all 0.25s;
      direction: ltr;
    }

    .field-input:focus {
      border-color: var(--accent);
      background: rgba(139, 92, 246, 0.03);
    }

    .btn-save {
      padding: 12px 20px;
      background: var(--accent-gradient);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s;
    }

    .btn-save:hover {
      transform: translateY(-1px);
    }

    .field-status {
      font-size: 11px;
      margin-top: 8px;
      color: var(--text-muted);
    }

    /* Toast */
    .toast {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(16, 185, 129, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: white;
      padding: 12px 28px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      opacity: 0;
      pointer-events: none;
      z-index: 3000;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .toast.err { background: rgba(239, 68, 68, 0.95); }

    .btn-logout {
      width: 100%;
      padding: 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.15);
      border-radius: 12px;
      color: #f87171;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
      transition: all 0.25s;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.2);
      color: white;
    }

    .footer {
      text-align: center;
      margin-top: 25px;
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.8;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
</head>
<body>
  <div class="toast" id="toast"></div>

  <!-- QR Code Modal -->
  <div class="modal" id="qrModal">
    <div class="modal-content">
      <div class="modal-title" id="modalTitle">\u06A9\u062F QR \u06A9\u0627\u0646\u0641\u06CC\u06AF</div>
      <div class="qr-container">
        <div id="qrContainer" class="qr-image" style="background:white; padding:10px; border-radius:10px; display:inline-block; margin: 0 auto;"></div>
      </div>
      <button class="btn-modal-close" onclick="closeModal()">\u0628\u0633\u062A\u0646 \u067E\u0646\u062C\u0631\u0647</button>
    </div>
  </div>

  <div class="container">
    <div class="header">
      <div class="badge-status">\u0648\u0631\u06A9\u0631 \u0641\u0639\u0627\u0644</div>
      <h1>\u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0646\u0647\u0627\u0646</h1>
      <p>\u0645\u062F\u06CC\u0631\u06CC\u062A \u067E\u0631\u0648\u06A9\u0633\u06CC\u200C\u0647\u0627\u060C \u0622\u06CC\u200C\u067E\u06CC \u062A\u0645\u06CC\u0632 \u0648 \u0631\u0648\u062A\u06CC\u0646\u06AF \u062A\u0631\u0627\u0641\u06CC\u06A9</p>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-nav">
      <button class="tab-btn active" onclick="switchTab('dashboard')">\u{1F4CA} \u067E\u06CC\u0634\u062E\u0648\u0627\u0646</button>
      <button class="tab-btn" onclick="switchTab('configs')">\u{1F517} \u06A9\u0627\u0646\u0641\u06CC\u06AF\u200C\u0647\u0627</button>
      <button class="tab-btn" onclick="switchTab('settings')">\u2699\uFE0F \u062A\u0646\u0638\u06CC\u0645\u0627\u062A</button>
      <button class="tab-btn" onclick="switchTab('system')">\u{1F5A5}\uFE0F \u0633\u06CC\u0633\u062A\u0645</button>
    </div>

    <!-- Tab 1: Dashboard -->
    <div class="tab-content active" id="tab-dashboard">
      <div class="grid-2">
        <div class="stat-card">
          <div class="stat-title">\u0622\u06CC\u200C\u067E\u06CC \u062A\u0645\u06CC\u0632 \u0641\u0639\u0627\u0644</div>
          <div class="stat-val" id="statCleanIP">${currentCleanIP || "\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631"}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">\u0648\u0636\u0639\u06CC\u062A \u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC</div>
          <div class="stat-val" id="statProxyIP">${currentProxyIP || "\u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645 (\u0628\u062F\u0648\u0646 \u067E\u0631\u0648\u06A9\u0633\u06CC)"}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="stat-card">
          <div class="stat-title">\u062F\u06CC\u062A\u0627\u0633\u0646\u062A\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 (Colo)</div>
          <div class="stat-val">${cfColo}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">\u0646\u0633\u062E\u0647 TLS \u0645\u0631\u0648\u0631\u06AF\u0631</div>
          <div class="stat-val">${tlsVersion}</div>
        </div>
      </div>

      <!-- Subscription Link Card -->
      <div class="stat-card" style="margin-bottom: 20px; border: 1px solid rgba(139, 92, 246, 0.2);">
        <div class="stat-title" style="color: #c084fc; font-weight: 800; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>\u{1F310}</span> \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u0627\u06CC\u0628 \u0645\u0633\u062A\u0642\u06CC\u0645 (Subscription URL)
        </div>
        <div class="stat-desc" style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; text-align: right; direction: rtl;">
          \u0627\u06CC\u0646 \u0644\u06CC\u0646\u06A9 \u0631\u0627 \u06A9\u067E\u06CC \u06A9\u0631\u062F\u0647 \u0648 \u062F\u0631 \u06A9\u0644\u0627\u06CC\u0646\u062A \u062E\u0648\u062F (v2rayNG, Hiddify, Shadowrocket) \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F \u062A\u0627 \u0647\u0645\u0647\u200C\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF\u200C\u0647\u0627 \u0628\u0647 \u0635\u0648\u0631\u062A \u062E\u0648\u062F\u06A9\u0627\u0631 \u0627\u0636\u0627\u0641\u0647 \u0648 \u0622\u067E\u062F\u06CC\u062A \u0634\u0648\u0646\u062F.
        </div>
        <div class="sub-input-group" style="display: flex; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 12px; padding: 6px; align-items: center; gap: 6px;">
          <div id="lblSubLink" style="flex: 1; font-family: Vazirmatn, Tahoma, sans-serif; font-size: 11px; color: #a5b4fc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 10px; direction: ltr; text-align: left;">https://${hostname}/${uuid}/sub</div>
          <button class="btn-save" style="margin: 0; padding: 8px 16px; font-size: 11px; border-radius: 8px;" onclick="copyLink('lblSubLink', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
        </div>
      </div>

      <div class="ping-box">
        <div class="stat-title" style="margin-bottom: 8px;">\u062A\u0633\u062A \u0633\u0631\u0639\u062A \u067E\u0627\u0633\u062E\u06AF\u0648\u06CC\u06CC (Latency Checker)</div>
        <button class="btn-save" onclick="checkLatency(this)">\u0634\u0631\u0648\u0639 \u062A\u0633\u062A \u067E\u06CC\u0646\u06AF</button>
        <div class="ping-results" id="pingResults" style="display: none;">
          <div class="ping-tag">\u06AF\u0648\u06AF\u0644: <span id="ping-google">--</span></div>
          <div class="ping-tag">\u06A9\u0644\u0627\u062F\u0641\u0644\u0631: <span id="ping-cf">--</span></div>
          <div class="ping-tag">\u0648\u0631\u06A9\u0631 \u0634\u0645\u0627: <span id="ping-worker">--</span></div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Configs -->
    <div class="tab-content" id="tab-configs">
      <!-- VLESS WS -->
      <div class="config-card">
        <span class="config-tag">VLESS WS</span>
        <div class="config-title">\u{1F680} VLESS over Custom WebSocket</div>
        <div class="config-link-container" id="link-vlessWS">${vlessWS}</div>
        <div class="config-actions">
          <button class="btn-config btn-copy-link" onclick="copyLink('link-vlessWS', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
          <button class="btn-config btn-qr" onclick="showQR('${vlessWS}', 'VLESS WS')">\u{1F50D} \u0646\u0645\u0627\u06CC\u0634 QR</button>
        </div>
        <div class="config-obfuscation-box">
          <div class="obf-header">\u{1F4A1} \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u06A9\u0644\u0627\u06CC\u0646\u062A (Custom WS Headers):</div>
          <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${hostname}</span></div>
          <div class="obf-item"><strong>Path:</strong> <span class="obf-val" id="lblVlessPath">${vlessPath}</span></div>
          <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
        </div>
      </div>

      <!-- Trojan WS -->
      <div class="config-card">
        <span class="config-tag">Trojan WS</span>
        <div class="config-title">\u{1F511} Trojan over Custom WebSocket</div>
        <div class="config-link-container" id="link-trojanWS">${trojanWS}</div>
        <div class="config-actions">
          <button class="btn-config btn-copy-link" onclick="copyLink('link-trojanWS', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
          <button class="btn-config btn-qr" onclick="showQR('${trojanWS}', 'Trojan WS')">\u{1F50D} \u0646\u0645\u0627\u06CC\u0634 QR</button>
        </div>
        <div class="config-obfuscation-box">
          <div class="obf-header">\u{1F4A1} \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u06A9\u0644\u0627\u06CC\u0646\u062A (Custom WS Headers):</div>
          <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${hostname}</span></div>
          <div class="obf-item"><strong>Path:</strong> <span class="obf-val" id="lblTrojanPath">${trojanPath}</span></div>
          <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Settings -->
    <div class="tab-content" id="tab-settings">
      <!-- Clean IP Config -->
      <div class="field-card">
        <div class="field-label">\u{1F6E1}\uFE0F \u062F\u0627\u0645\u0646\u0647/\u0622\u06CC\u200C\u067E\u06CC \u062A\u0645\u06CC\u0632 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 (Clean IP / Domain)</div>
        <div class="field-desc">\u0627\u06CC\u0646 \u0622\u062F\u0631\u0633 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0622\u062F\u0631\u0633 \u0627\u0635\u0644\u06CC (Address) \u062F\u0631 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u06A9\u0644\u0627\u06CC\u0646\u062A \u0642\u0631\u0627\u0631 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F. \u062F\u0631 \u0635\u0648\u0631\u062A \u062E\u0627\u0644\u06CC \u0628\u0648\u062F\u0646\u060C \u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputCleanIP" placeholder="\u0645\u062B\u0627\u0644: clean.domain.com" value="${currentCleanIP}">
          <button class="btn-save" id="btnCleanIP" onclick="saveCleanIP()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusCleanIP">${currentCleanIP ? "\u2705 \u0641\u0639\u0627\u0644: " + currentCleanIP : "\u26AA \u062E\u0627\u0644\u06CC \u2014 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631"}</div>
      </div>

      <!-- Proxy IP Config -->
      <div class="field-card">
        <div class="field-label">\u{1F501} \u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC \u067E\u0634\u062A \u067E\u0631\u062F\u0647 (Proxy IP)</div>
        <div class="field-desc">\u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC \u0641\u0642\u0637 \u0628\u0631\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u062F\u0631 \u0628\u06A9\u200C\u0627\u0646\u062F \u0648\u0631\u06A9\u0631 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u0648 \u0646\u0628\u0627\u06CC\u062F \u062F\u0631 \u0644\u06CC\u0646\u06A9 \u06A9\u0644\u0627\u06CC\u0646\u062A\u200C\u0647\u0627 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0634\u0648\u062F.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputProxyIP" placeholder="\u0645\u062B\u0627\u0644: 1.1.1.1:443" value="${currentProxyIP}">
          <button class="btn-save" id="btnProxyIP" onclick="saveProxyIP()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusProxyIP">${currentProxyIP ? "\u2705 \u0641\u0639\u0627\u0644: " + currentProxyIP : "\u26AA \u062E\u0627\u0644\u06CC \u2014 \u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645"}</div>
      </div>

      <!-- Password Protection -->
      <div class="field-card">
        <div class="field-label">\u{1F511} \u0645\u062D\u0627\u0641\u0638\u062A \u0627\u0632 \u067E\u0646\u0644</div>
        <div class="field-desc">\u0628\u0631\u0627\u06CC \u0627\u0645\u0646\u06CC\u062A \u067E\u0646\u0644, \u0631\u0645\u0632 \u0639\u0628\u0648\u0631\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F. \u062E\u0627\u0644\u06CC \u06AF\u0630\u0627\u0634\u062A\u0646 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631\u060C \u0642\u0641\u0644 \u067E\u0646\u0644 \u0631\u0627 \u0628\u0631\u0645\u06CC\u062F\u0627\u0631\u062F.</div>
        <div class="field-input-group">
          <input type="password" class="field-input" id="inputPassword" placeholder="\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F">
          <button class="btn-save" id="btnPass" onclick="savePassword()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusPass">${hasPass ? "\u{1F512} \u067E\u0646\u0644 \u062F\u0627\u0631\u0627\u06CC \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0633\u062A" : "\u{1F513} \u067E\u0646\u0644 \u0628\u062F\u0648\u0646 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631"}</div>
      </div>

      <!-- UUID Config -->
      <div class="field-card">
        <div class="field-label">\u{1F511} \u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 (UUID)</div>
        <div class="field-desc">\u0634\u0646\u0627\u0633\u0647 \u06CC\u06A9\u062A\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631. \u062F\u0642\u062A \u06A9\u0646\u06CC\u062F \u0628\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0627\u06CC\u0646 \u0634\u0646\u0627\u0633\u0647\u060C \u0622\u062F\u0631\u0633 \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0634\u0645\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputUUID" placeholder="\u0645\u062B\u0627\u0644: 86c50e3a-..." value="${uuid}">
          <button class="btn-save" id="btnUUID" onclick="saveUUID()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
      </div>

      <!-- Trojan Pass Config -->
      <div class="field-card">
        <div class="field-label">\u{1F510} \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062A\u0631\u0648\u062C\u0627\u0646 (TR_PASS)</div>
        <div class="field-desc">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0645\u0648\u0631\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0628\u0631\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u067E\u0631\u0648\u062A\u06A9\u0644 \u062A\u0631\u0648\u062C\u0627\u0646.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputTrPass" placeholder="\u0631\u0645\u0632 \u062C\u062F\u06CC\u062F \u062A\u0631\u0648\u062C\u0627\u0646" value="${currentTrPass}">
          <button class="btn-save" id="btnTrPass" onclick="saveTrPass()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
      </div>

      <!-- VLESS WS Path Config -->
      <div class="field-card">
        <div class="field-label">\u{1F6E4}\uFE0F \u0645\u0633\u06CC\u0631 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC VLESS WebSocket (Obfuscated Path)</div>
        <div class="field-desc">\u062A\u063A\u06CC\u06CC\u0631 \u0645\u0633\u06CC\u0631 \u0648\u0628\u200C\u0633\u0648\u06A9\u062A \u0628\u0631\u0627\u06CC \u0641\u0631\u06CC\u0628 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF. \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: <code>/?ed=2048</code></div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputVlessPath" placeholder="\u0645\u062B\u0627\u0644: /api/v3/telemetry" value="${currentVlessPath}">
          <button class="btn-save" id="btnVlessPath" onclick="saveVlessPath()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusVlessPath" style="font-family: Vazirmatn, Tahoma, sans-serif;">${currentVlessPath ? "\u2705 \u0645\u0633\u06CC\u0631 \u0633\u0641\u0627\u0631\u0634\u06CC: " + currentVlessPath : "\u26AA \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: /?ed=2048"}</div>
      </div>

      <!-- Trojan WS Path Config -->
      <div class="field-card">
        <div class="field-label">\u{1F6E4}\uFE0F \u0645\u0633\u06CC\u0631 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC Trojan WebSocket (Obfuscated Path)</div>
        <div class="field-desc">\u062A\u063A\u06CC\u06CC\u0631 \u0645\u0633\u06CC\u0631 \u0648\u0628\u200C\u0633\u0648\u06A9\u062A \u062A\u0631\u0648\u062C\u0627\u0646 \u0628\u0631\u0627\u06CC \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632\u06CC \u062A\u0631\u0627\u0641\u06CC\u06A9 \u0641\u0627\u06CC\u0644. \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: <code>/${uuid}/trojan-ws</code></div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputTrojanPath" placeholder="\u0645\u062B\u0627\u0644: /assets/js/jquery.min.js" value="${currentTrojanPath}">
          <button class="btn-save" id="btnTrojanPath" onclick="saveTrojanPath()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusTrojanPath" style="font-family: Vazirmatn, Tahoma, sans-serif;">${currentTrojanPath ? "\u2705 \u0645\u0633\u06CC\u0631 \u0633\u0641\u0627\u0631\u0634\u06CC: " + currentTrojanPath : "\u26AA \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: /" + uuid + "/trojan-ws"}</div>
      </div>
    </div>

    <!-- Tab 4: System -->
    <div class="tab-content" id="tab-system">
      <div class="stat-card" style="margin-bottom: 12px;">
        <div class="stat-title">\u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631 (Worker Host)</div>
        <div class="stat-val" id="valHost">${hostname}</div>
      </div>
      <div class="stat-card" style="margin-bottom: 12px;">
        <div class="stat-title">\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 (UUID)</div>
        <div class="stat-val" id="valUuid">${uuid}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">\u062D\u0627\u0644\u062A \u062A\u0648\u0633\u0639\u0647</div>
        <div class="stat-val" style="color: var(--success);">\u0631\u0648\u0634\u0646 (Active)</div>
      </div>

      <button class="btn-logout" onclick="logout()">\u{1F6AA} \u062E\u0631\u0648\u062C \u0627\u0632 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A</button>
    </div>

    <div class="footer">
      \u0637\u0631\u0627\u062D\u06CC \u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u0639\u0628\u0648\u0631 \u0627\u0632 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A\u200C\u0647\u0627 \u0648 \u062D\u0641\u0638 \u0622\u0632\u0627\u062F\u06CC \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u2764\uFE0F
    </div>
  </div>

  <script>
    const path = window.location.pathname;
    const bp = path.endsWith('/save-cleanip') || path.endsWith('/save-proxy') || path.endsWith('/save-password')
      ? path.slice(0, path.lastIndexOf('/'))
      : (path.endsWith('/') ? path.slice(0, -1) : path);

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.getAttribute('onclick').includes(tabId));
      if (activeBtn) activeBtn.classList.add('active');
      
      const activeContent = document.getElementById('tab-' + tabId);
      if (activeContent) activeContent.classList.add('active');
    }

    async function saveCleanIP() {
      const val = document.getElementById('inputCleanIP').value.trim();
      const btn = document.getElementById('btnCleanIP');
      const status = document.getElementById('statusCleanIP');
      const statDash = document.getElementById('statCleanIP');
      
      btn.textContent = '...';
      btn.disabled = true;
      try {
        const res = await fetch(bp + '/save-cleanip', { method: 'POST', body: val });
        const data = await res.json();
        if (data.ok) {
          showToast('\u2705 \u062F\u0627\u0645\u0646\u0647/\u0622\u06CC\u200C\u067E\u06CC \u062A\u0645\u06CC\u0632 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F');
          status.textContent = data.cleanIP ? '\u2705 \u0641\u0639\u0627\u0644: ' + data.cleanIP : '\u26AA \u062E\u0627\u0644\u06CC \u2014 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631';
          statDash.textContent = data.cleanIP || '\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631';
          updateLinks();
        } else {
          showToast('\u274C \u062E\u0637\u0627\u06CC\u06CC \u0631\u062E \u062F\u0627\u062F', true);
        }
      } catch(e) {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631', true);
      } finally {
        btn.textContent = '\u0630\u062E\u06CC\u0631\u0647';
        btn.disabled = false;
      }
    }

    async function saveProxyIP() {
      const val = document.getElementById('inputProxyIP').value.trim();
      const btn = document.getElementById('btnProxyIP');
      const status = document.getElementById('statusProxyIP');
      const statDash = document.getElementById('statProxyIP');
      
      btn.textContent = '...';
      btn.disabled = true;
      try {
        const res = await fetch(bp + '/save-proxy', { method: 'POST', body: val });
        const data = await res.json();
        if (data.ok) {
          showToast('\u2705 \u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F');
          status.textContent = data.proxyIP ? '\u2705 \u0641\u0639\u0627\u0644: ' + data.proxyIP : '\u26AA \u062E\u0627\u0644\u06CC \u2014 \u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645';
          statDash.textContent = data.proxyIP || '\u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645 (\u0628\u062F\u0648\u0646 \u067E\u0631\u0648\u06A9\u0633\u06CC)';
        } else {
          showToast('\u274C \u062E\u0637\u0627\u06CC\u06CC \u0631\u062E \u062F\u0627\u062F', true);
        }
      } catch(e) {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631', true);
      } finally {
        btn.textContent = '\u0630\u062E\u06CC\u0631\u0647';
        btn.disabled = false;
      }
    }

    async function savePassword() {
      const val = document.getElementById('inputPassword').value.trim();
      const btn = document.getElementById('btnPass');
      const status = document.getElementById('statusPass');
      
      btn.textContent = '...';
      btn.disabled = true;
      try {
        const res = await fetch(bp + '/save-password', { method: 'POST', body: val });
        const data = await res.json();
        if (data.ok) {
          showToast(data.enabled ? '\u2705 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F' : '\u{1F513} \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F');
          status.textContent = data.enabled ? '\u{1F512} \u067E\u0646\u0644 \u062F\u0627\u0631\u0627\u06CC \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0633\u062A' : '\u{1F513} \u067E\u0646\u0644 \u0628\u062F\u0648\u0646 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631';
          document.getElementById('inputPassword').value = '';
        } else {
          showToast('\u274C \u062E\u0637\u0627\u06CC\u06CC \u0631\u062E \u062F\u0627\u062F', true);
        }
      } catch(e) {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631', true);
      } finally {
        btn.textContent = '\u0630\u062E\u06CC\u0631\u0647';
        btn.disabled = false;
      }
    }

    async function saveVlessPath() {
      const val = document.getElementById('inputVlessPath').value.trim();
      const btn = document.getElementById('btnVlessPath');
      const status = document.getElementById('statusVlessPath');
      
      btn.textContent = '...';
      btn.disabled = true;
      try {
        const res = await fetch(bp + '/save-vlesspath', { method: 'POST', body: val });
        const data = await res.json();
        if (data.ok) {
          showToast('\u2705 \u0645\u0633\u06CC\u0631 VLESS \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F');
          status.textContent = data.path ? '\u2705 \u0645\u0633\u06CC\u0631 \u0633\u0641\u0627\u0631\u0634\u06CC: ' + data.path : '\u26AA \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: /?ed=2048';
          updateLinks();
        } else {
          showToast('\u274C \u062E\u0637\u0627\u06CC\u06CC \u0631\u062E \u062F\u0627\u062F', true);
        }
      } catch(e) {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631', true);
      } finally {
        btn.textContent = '\u0630\u062E\u06CC\u0631\u0647';
        btn.disabled = false;
      }
    }

    async function saveUUID() {
      const val = document.getElementById('inputUUID').value.trim();
      const btn = document.getElementById('btnUUID');
      
      btn.textContent = '...';
      btn.disabled = true;
      try {
        const res = await fetch(bp + '/save-uuid', { method: 'POST', body: val });
        const data = await res.json();
        if (data.ok) {
          showToast('\u2705 \u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u060C \u062F\u0631 \u062D\u0627\u0644 \u0627\u0646\u062A\u0642\u0627\u0644...');
          setTimeout(() => {
            window.location.href = '/' + val;
          }, 1500);
        } else {
          showToast('\u274C UUID \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A', true);
        }
      } catch(e) {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631', true);
      } finally {
        btn.textContent = '\u0630\u062E\u06CC\u0631\u0647';
        btn.disabled = false;
      }
    }

    async function saveTrPass() {
      const val = document.getElementById('inputTrPass').value.trim();
      const btn = document.getElementById('btnTrPass');
      
      btn.textContent = '...';
      btn.disabled = true;
      try {
        const res = await fetch(bp + '/save-trpass', { method: 'POST', body: val });
        const data = await res.json();
        if (data.ok) {
          showToast('\u2705 \u0631\u0645\u0632 \u062A\u0631\u0648\u062C\u0627\u0646 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast('\u274C \u062E\u0637\u0627\u06CC\u06CC \u0631\u062E \u062F\u0627\u062F', true);
        }
      } catch(e) {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631', true);
      } finally {
        btn.textContent = '\u0630\u062E\u06CC\u0631\u0647';
        btn.disabled = false;
      }
    }

    async function saveTrojanPath() {
      const val = document.getElementById('inputTrojanPath').value.trim();
      const btn = document.getElementById('btnTrojanPath');
      const status = document.getElementById('statusTrojanPath');
      const uu = document.getElementById('valUuid').textContent.trim();
      
      btn.textContent = '...';
      btn.disabled = true;
      try {
        const res = await fetch(bp + '/save-trojanpath', { method: 'POST', body: val });
        const data = await res.json();
        if (data.ok) {
          showToast('\u2705 \u0645\u0633\u06CC\u0631 Trojan \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F');
          status.textContent = data.path ? '\u2705 \u0645\u0633\u06CC\u0631 \u0633\u0641\u0627\u0631\u0634\u06CC: ' + data.path : '\u26AA \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: /' + uu + '/trojan-ws';
          updateLinks();
        } else {
          showToast('\u274C \u062E\u0637\u0627\u06CC\u06CC \u0631\u062E \u062F\u0627\u062F', true);
        }
      } catch(e) {
        showToast('\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631', true);
      } finally {
        btn.textContent = '\u0630\u062E\u06CC\u0631\u0647';
        btn.disabled = false;
      }
    }

    function updateLinks() {
      const host = document.getElementById('valHost').textContent.trim();
      const uu = document.getElementById('valUuid').textContent.trim();
      const cleanVal = document.getElementById('inputCleanIP').value.trim();
      const addr = cleanVal || host;
      
      let vlessPathInput = document.getElementById('inputVlessPath').value.trim() || '/?ed=2048';
      let trojanPathInput = document.getElementById('inputTrojanPath').value.trim() || ('/' + uu + '/trojan-ws');
      
      if (vlessPathInput && !vlessPathInput.startsWith('/')) vlessPathInput = '/' + vlessPathInput;
      if (trojanPathInput && !trojanPathInput.startsWith('/')) trojanPathInput = '/' + trojanPathInput;

      const vlessWS = 'vless://' + uu + '@' + addr + ':443?encryption=none&security=tls&sni=' + host + '&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=' + host + '&path=' + encodeURIComponent(vlessPathInput) + '#VLESS-WS-' + host;
      const trojanWS = 'trojan://${currentTrPass}@' + addr + ':443?security=tls&sni=' + host + '&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=' + host + '&path=' + encodeURIComponent(trojanPathInput) + '#Trojan-WS-' + host;

      document.getElementById('link-vlessWS').textContent = vlessWS;
      document.getElementById('link-trojanWS').textContent = trojanWS;
      
      document.getElementById('lblVlessPath').textContent = vlessPathInput;
      document.getElementById('lblTrojanPath').textContent = trojanPathInput;
      
      const subWS = 'https://' + host + '/' + uu + '/sub';
      const lblSub = document.getElementById('lblSubLink');
      if (lblSub) lblSub.textContent = subWS;
    }

    function copyLink(elementId, btn) {
      const linkText = document.getElementById(elementId).textContent;
      navigator.clipboard.writeText(linkText).then(() => {
        showToast('\u{1F4CB} \u06A9\u0627\u0646\u0641\u06CC\u06AF \u06A9\u067E\u06CC \u0634\u062F!');
        const prevText = btn.textContent;
        btn.textContent = '\u2705 \u06A9\u067E\u06CC \u0634\u062F!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        setTimeout(() => {
          btn.textContent = prevText;
          btn.style.background = 'var(--accent-gradient)';
        }, 2000);
      }).catch(() => {
        showToast('\u274C \u062E\u0637\u0627\u06CC\u06CC \u062F\u0631 \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9 \u0631\u062E \u062F\u0627\u062F', true);
      });
    }

    function showQR(link, title) {
      const modal = document.getElementById('qrModal');
      const modalTitle = document.getElementById('modalTitle');
      const qrImage = document.getElementById('qrImage');
      
      modalTitle.textContent = '\u06A9\u062F QR \u0628\u0631\u0627\u06CC: ' + title;
      qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(link);
      modal.classList.add('show');
    }

    function closeModal() {
      document.getElementById('qrModal').classList.remove('show');
    }

    async function checkLatency(btn) {
      btn.disabled = true;
      btn.textContent = '\u062F\u0631 \u062D\u0627\u0644 \u062A\u0633\u062A \u067E\u06CC\u0646\u06AF...';
      const results = document.getElementById('pingResults');
      results.style.display = 'flex';
      
      const targets = [
        { id: 'ping-google', url: 'https://www.google.com/generate_204' },
        { id: 'ping-cf', url: 'https://1.1.1.1/generate_204' },
        { id: 'ping-worker', url: bp + '/panel-auth' }
      ];

      for (const target of targets) {
        const span = document.getElementById(target.id);
        span.textContent = '...';
        const start = Date.now();
        try {
          await fetch(target.url, { mode: 'no-cors', cache: 'no-store' });
          const latency = Date.now() - start;
          span.textContent = latency + 'ms';
          span.style.color = latency < 150 ? '#34d399' : (latency < 300 ? '#fbbf24' : '#f87171');
        } catch(e) {
          span.textContent = '\u062E\u0637\u0627';
          span.style.color = '#ef4444';
        }
      }
      btn.disabled = false;
      btn.textContent = '\u0634\u0631\u0648\u0639 \u0645\u062C\u062F\u062F \u062A\u0633\u062A \u067E\u06CC\u0646\u06AF';
    }

    function logout() {
      document.cookie = 'panel_auth=; Path=/; Max-Age=0; SameSite=Lax';
      window.location.href = bp;
    }

    function showToast(msg, isErr) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast' + (isErr ? ' err' : '') + ' show';
      setTimeout(() => { t.classList.remove('show'); }, 3000);
    }
  <\/script>
</body>
</html>`;
}
function setupPage(hasKV, hasPassword, hasUUID, hasTrPass, currentUUID, currentProxyIP) {
  const allGood = hasKV && hasPassword && hasUUID && hasTrPass;
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0646\u0635\u0628 \u0648 \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u067E\u0646\u0644 \u067E\u0646\u0647\u0627\u0646</title>
  <style>
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');
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
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: Vazirmatn, Tahoma, sans-serif; }
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
      \u0628\u0631\u0627\u06CC \u0639\u0645\u0644\u06A9\u0631\u062F \u0635\u062D\u06CC\u062D \u067E\u0631\u0648\u06A9\u0633\u06CC\u060C \u0648\u0636\u0639\u06CC\u062A \u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC \u0632\u06CC\u0631 \u0631\u0627 \u062F\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F.
    </p>

    <div class="status-box">
      <!-- KV Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0641\u0636\u0627\u06CC \u0630\u062E\u06CC\u0631\u0647\u200C\u0633\u0627\u0632\u06CC KV <span class="code">nahan</span></div>
          <div class="desc">\u0628\u0631\u0627\u06CC \u0630\u062E\u06CC\u0631\u0647 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u067E\u0646\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A. \u062F\u0631 \u0628\u062E\u0634 Bindings \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u06CC\u06A9 KV \u0628\u0633\u0627\u0632\u06CC\u062F \u0648 \u0646\u0627\u0645 \u0622\u0646 \u0631\u0627 \u062F\u0642\u06CC\u0642\u0627\u064B <span class="code">nahan</span> \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.</div>
        </div>
        <div class="badge ${hasKV ? "ok" : "fail"}">${hasKV ? "\u0645\u062A\u0635\u0644 \u0634\u062F \u2705" : "\u0645\u062A\u0635\u0644 \u0646\u06CC\u0633\u062A \u274C"}</div>
      </div>
      
      <!-- Password Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u062F\u0645\u06CC\u0646 <span class="code">PASSWORD</span></div>
          <div class="desc">\u0628\u0631\u0627\u06CC \u0627\u0645\u0646\u06CC\u062A \u067E\u0646\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A. \u06CC\u06A9 \u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC \u0628\u0647 \u0646\u0627\u0645 <span class="code">PASSWORD</span> \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0633\u0627\u0632\u06CC\u062F.</div>
        </div>
        <div class="badge ${hasPassword ? "ok" : "fail"}">${hasPassword ? "\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2705" : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u274C"}</div>
      </div>

      <!-- UUID Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 <span class="code">UUID</span></div>
          <div class="desc">\u0634\u0645\u0627 \u0628\u0627\u06CC\u062F \u06CC\u06A9 UUID \u0645\u0639\u062A\u0628\u0631 (\u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC <span class="code">UUID</span>) \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F. ${currentUUID ? `\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC: <span class="code">${currentUUID}</span>` : ""}</div>
        </div>
        <div class="badge ${hasUUID ? "ok" : "fail"}">${hasUUID ? "\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2705" : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u274C"}</div>
      </div>

      <!-- Trojan Pass Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062A\u0631\u0648\u062C\u0627\u0646 <span class="code">TR_PASS</span></div>
          <div class="desc">\u0631\u0645\u0632 \u062A\u0631\u0648\u062C\u0627\u0646 \u0627\u062C\u0628\u0627\u0631\u06CC \u0627\u0633\u062A (\u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC <span class="code">TR_PASS</span>). \u0628\u0631\u0627\u06CC \u062C\u0644\u0648\u06AF\u06CC\u0631\u06CC \u0627\u0632 \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u0634\u062F\u0646 \u062A\u0648\u0633\u0637 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0627\u06CC\u062F \u0628\u0627 UUID \u0645\u062A\u0641\u0627\u0648\u062A \u0628\u0627\u0634\u062F.</div>
        </div>
        <div class="badge ${hasTrPass ? "ok" : "fail"}">${hasTrPass ? "\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2705" : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u274C"}</div>
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
        \u{1F517} <strong>\u0622\u062F\u0631\u0633 \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0634\u0645\u0627:</strong><br><span class="code" style="color:#a78bfa;">/\${currentUUID}</span><br><br>
        \u{1F517} <strong>\u0622\u062F\u0631\u0633 \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u0627\u06CC\u067E \u0634\u0645\u0627:</strong><br><span class="code" style="color:#a78bfa;">/\${currentUUID}/sub</span><br>
      </div>
    </div>
    ` : `
    <div style="text-align:center; margin-top:20px; color:var(--warning); font-size:14px; font-weight: 500;">
      \u26A0\uFE0F \u062A\u0627 \u0632\u0645\u0627\u0646\u06CC \u06A9\u0647 \u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0632\u0627\u0645\u06CC (KV \u0648 Password) \u0631\u0627 \u062A\u0646\u0638\u06CC\u0645 \u0646\u06A9\u0646\u06CC\u062F\u060C \u0627\u0645\u0646\u06CC\u062A \u0648 \u0639\u0645\u0644\u06A9\u0631\u062F \u067E\u0631\u0648\u06A9\u0633\u06CC \u0634\u0645\u0627 \u06A9\u0627\u0645\u0644 \u0646\u062E\u0648\u0627\u0647\u062F \u0628\u0648\u062F!
    </div>
    `}
  </div>
</body>
</html>`;
}

// src/index.js
var rateLimitMap = /* @__PURE__ */ new Map();
var src_default = {
  async fetch(request, env, ctx) {
    try {
      let savedProxyIP = "";
      let savedCleanIP = "";
      let savedPass = "";
      let savedVlessPath = "";
      let savedTrojanPath = "";
      let savedUUID = "";
      let savedTrPass = "";
      if (env.nahan) {
        savedProxyIP = await env.nahan.get("proxy_ip") || "";
        savedCleanIP = await env.nahan.get("clean_ip") || "";
        savedPass = await env.nahan.get("panel_pass") || "";
        savedVlessPath = await env.nahan.get("vless_ws_path") || "";
        savedTrojanPath = await env.nahan.get("trojan_ws_path") || "";
        savedUUID = await env.nahan.get("uuid") || "";
        savedTrPass = await env.nahan.get("tr_pass") || "";
      }
      let currentProxyIP = savedProxyIP || env.PROXYIP || "";
      let currentCleanIP = savedCleanIP || "";
      let currentPanelPass = savedPass || env.PASSWORD || "";
      let currentVlessPath = savedVlessPath || "";
      let currentTrojanPath = savedTrojanPath || "";
      let currentUserID = savedUUID || env.UUID || "";
      let currentTrPass = savedTrPass || env.TR_PASS || "";
      const upgradeHeader = request.headers.get("Upgrade");
      const url = new URL(request.url);
      const path = url.pathname;
      if (upgradeHeader === "websocket") {
        const decodedPath = decodeURIComponent(path).toLowerCase();
        const isTrojan = currentTrojanPath ? decodedPath.includes(decodeURIComponent(currentTrojanPath).toLowerCase()) : decodedPath.includes("trojan-ws") || decodedPath.includes("trojan");
        if (isTrojan) {
          return await trojanOverWSHandler(request, currentTrPass, currentProxyIP);
        } else {
          return await vlessOverWSHandler(request, currentUserID, currentProxyIP);
        }
      }
      if (path === "/") {
        const hasKV = !!env.nahan;
        const hasPassword = !!currentPanelPass;
        const hasUUID = !!currentUserID && isValidUUID(currentUserID);
        const hasTrPass = !!currentTrPass;
        let showSetup = false;
        if (!hasKV || !hasPassword || !hasUUID || !hasTrPass) {
          showSetup = true;
        } else if (hasPassword && await isAuthed(request, currentPanelPass)) {
          showSetup = true;
        }
        if (showSetup) {
          return new Response(setupPage(hasKV, hasPassword, hasUUID, hasTrPass, currentUserID, currentProxyIP), {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
        return new Response(nginxPage(), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", "Server": "nginx/1.24.0" }
        });
      }
      if (path === "/" + currentUserID) {
        const host = request.headers.get("Host");
        if (currentPanelPass && !await isAuthed(request, currentPanelPass)) {
          return new Response(loginPage(currentUserID, host), {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
        const cfColo = request.cf ? request.cf.colo : "N/A";
        const tlsVersion = request.cf ? request.cf.tlsVersion : "N/A";
        return new Response(panelPage(host, currentUserID, currentTrPass, currentCleanIP, currentProxyIP, currentVlessPath, currentTrojanPath, !!currentPanelPass, cfColo, tlsVersion), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
      if (path === "/" + currentUserID + "/sub" || path === "/sub/" + currentUserID) {
        const host = request.headers.get("Host");
        const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();
        const isProxyClient = userAgent.includes("v2ray") || userAgent.includes("hiddify") || userAgent.includes("clash") || userAgent.includes("sing-box") || userAgent.includes("shadowrocket") || userAgent.includes("streisand") || userAgent.includes("quantumult") || userAgent.includes("surge") || userAgent.includes("foxray") || userAgent.includes("stash") || userAgent.includes("v2fly") || userAgent.includes("xray");
        if (isProxyClient) {
          const addr = currentCleanIP || host;
          const vlessPath = currentVlessPath || "/?ed=2048";
          const trojanPath = currentTrojanPath || `/${currentUserID}/trojan-ws`;
          const vlessWS = `vless://${currentUserID}@${addr}:443?encryption=none&security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(vlessPath)}#VLESS-WS-${host}`;
          const trojanWS = `trojan://${currentTrPass}@${addr}:443?security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(trojanPath)}#Trojan-WS-${host}`;
          const plainConfigs = `${vlessWS}
${trojanWS}
`;
          const base64Configs = btoa(unescape(encodeURIComponent(plainConfigs)));
          return new Response(base64Configs, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store"
            }
          });
        } else {
          return new Response(subscriptionPage(host, currentUserID, currentTrPass, currentCleanIP, currentVlessPath, currentTrojanPath), {
            status: 200,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-store"
            }
          });
        }
      }
      if (path === "/api/info" || path === "/" + currentUserID + "/api/info") {
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        const host = request.headers.get("Host");
        const addr = currentCleanIP || host;
        const vlessPath = currentVlessPath || "/?ed=2048";
        const trojanPath = currentTrojanPath || `/${currentUserID}/trojan-ws`;
        const vlessWS = `vless://${currentUserID}@${addr}:443?encryption=none&security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(vlessPath)}#VLESS-WS-${host}`;
        const trojanWS = `trojan://${currentTrPass}@${addr}:443?security=tls&sni=${host}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${host}&path=${encodeURIComponent(trojanPath)}#Trojan-WS-${host}`;
        const subWS = `https://${host}/${currentUserID}/sub`;
        return new Response(JSON.stringify({
          ok: true,
          uuid: currentUserID,
          host,
          cleanIP: currentCleanIP || null,
          proxyIP: currentProxyIP || null,
          vlessPath,
          trojanPath,
          links: {
            vless: vlessWS,
            trojan: trojanWS,
            subscription: subWS
          },
          system: {
            cfColo: request.cf ? request.cf.colo : "N/A",
            tlsVersion: request.cf ? request.cf.tlsVersion : "N/A"
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (path === "/api/settings" || path === "/" + currentUserID + "/api/settings") {
        if (request.method !== "POST") {
          return new Response(JSON.stringify({ ok: false, error: "Method Not Allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
          });
        }
        if (!isApiAuthed(request, currentPanelPass, currentUserID)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        let body = {};
        try {
          body = await request.json();
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        if (body.cleanIP !== void 0) {
          const val = body.cleanIP.trim();
          currentCleanIP = val;
          if (env.nahan)
            await env.nahan.put("clean_ip", val, { expirationTtl: 31536e3 });
        }
        if (body.proxyIP !== void 0) {
          const val = body.proxyIP.trim();
          currentProxyIP = val;
          if (env.nahan)
            await env.nahan.put("proxy_ip", val, { expirationTtl: 31536e3 });
        }
        if (body.vlessPath !== void 0) {
          let val = body.vlessPath.trim() || "/?ed=2048";
          if (val && !val.startsWith("/"))
            val = "/" + val;
          currentVlessPath = val;
          if (env.nahan)
            await env.nahan.put("vless_ws_path", val, { expirationTtl: 31536e3 });
        }
        if (body.trojanPath !== void 0) {
          let val = body.trojanPath.trim() || `/${currentUserID}/trojan-ws`;
          if (val && !val.startsWith("/"))
            val = "/" + val;
          currentTrojanPath = val;
          if (env.nahan)
            await env.nahan.put("trojan_ws_path", val, { expirationTtl: 31536e3 });
        }
        if (body.password !== void 0) {
          const val = body.password.trim();
          currentPanelPass = val;
          if (env.nahan)
            await env.nahan.put("panel_pass", val, { expirationTtl: 31536e3 });
        }
        if (body.uuid !== void 0) {
          const val = body.uuid.trim();
          if (isValidUUID(val)) {
            currentUserID = val;
            if (env.nahan)
              await env.nahan.put("uuid", val, { expirationTtl: 31536e3 });
          }
        }
        if (body.tr_pass !== void 0) {
          const val = body.tr_pass.trim();
          if (val) {
            currentTrPass = val;
            if (env.nahan)
              await env.nahan.put("tr_pass", val, { expirationTtl: 31536e3 });
          }
        }
        return new Response(JSON.stringify({
          ok: true,
          message: "Settings updated successfully",
          settings: {
            cleanIP: currentCleanIP || null,
            proxyIP: currentProxyIP || null,
            vlessPath: currentVlessPath || "/?ed=2048",
            trojanPath: currentTrojanPath || `/${currentUserID}/trojan-ws`,
            hasPassword: !!currentPanelPass,
            uuid: currentUserID,
            tr_pass: currentTrPass
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (path === "/" + currentUserID + "/panel-auth") {
        if (request.method !== "POST") {
          return new Response("Method Not Allowed", { status: 405 });
        }
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const now = Date.now();
        const rl = rateLimitMap.get(ip) || { count: 0, time: now };
        if (now - rl.time > 6e4) {
          rl.count = 0;
          rl.time = now;
        }
        rl.count++;
        rateLimitMap.set(ip, rl);
        if (rl.count > 10) {
          return new Response(JSON.stringify({ ok: false, error: "Too Many Requests" }), { status: 429, headers: { "Content-Type": "application/json" } });
        }
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
        return new Response(JSON.stringify({ ok: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (path === "/" + currentUserID + "/save-password") {
        if (request.method !== "POST")
          return new Response("Method Not Allowed", { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID))
          return new Response("Unauthorized", { status: 401 });
        const body = (await request.text()).trim();
        const savedPassNew = body || "";
        const panelPassNew = savedPassNew || env.PASSWORD || "";
        if (env.nahan) {
          await env.nahan.put("panel_pass", savedPassNew, { expirationTtl: 31536e3 });
        }
        return new Response(JSON.stringify({ ok: true, enabled: !!panelPassNew }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
      if (path === "/" + currentUserID + "/save-cleanip") {
        if (request.method !== "POST")
          return new Response("Method Not Allowed", { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID))
          return new Response("Unauthorized", { status: 401 });
        const body = await request.text();
        const savedCleanIPNew = body.trim();
        if (env.nahan) {
          await env.nahan.put("clean_ip", savedCleanIPNew, { expirationTtl: 31536e3 });
        }
        return new Response(JSON.stringify({ ok: true, cleanIP: savedCleanIPNew }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
      if (path === "/" + currentUserID + "/save-proxy") {
        if (request.method !== "POST")
          return new Response("Method Not Allowed", { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID))
          return new Response("Unauthorized", { status: 401 });
        const body = await request.text();
        const savedProxyIPNew = body.trim();
        const proxyIPNew = savedProxyIPNew || env.PROXYIP || "";
        if (env.nahan) {
          await env.nahan.put("proxy_ip", savedProxyIPNew, { expirationTtl: 31536e3 });
        }
        return new Response(JSON.stringify({ ok: true, proxyIP: proxyIPNew }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
      if (path === "/" + currentUserID + "/save-vlesspath") {
        if (request.method !== "POST")
          return new Response("Method Not Allowed", { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID))
          return new Response("Unauthorized", { status: 401 });
        const body = (await request.text()).trim();
        let newPath = body;
        if (newPath && !newPath.startsWith("/")) {
          newPath = "/" + newPath;
        }
        if (env.nahan) {
          await env.nahan.put("vless_ws_path", newPath, { expirationTtl: 31536e3 });
        }
        return new Response(JSON.stringify({ ok: true, path: newPath }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
      if (path === "/" + currentUserID + "/save-trojanpath") {
        if (request.method !== "POST")
          return new Response("Method Not Allowed", { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID))
          return new Response("Unauthorized", { status: 401 });
        const body = (await request.text()).trim();
        let newPath = body;
        if (newPath && !newPath.startsWith("/")) {
          newPath = "/" + newPath;
        }
        if (env.nahan) {
          await env.nahan.put("trojan_ws_path", newPath, { expirationTtl: 31536e3 });
        }
        return new Response(JSON.stringify({ ok: true, path: newPath }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
      if (path === "/" + currentUserID + "/save-uuid") {
        if (request.method !== "POST")
          return new Response("Method Not Allowed", { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID))
          return new Response("Unauthorized", { status: 401 });
        const body = (await request.text()).trim();
        if (!isValidUUID(body)) {
          return new Response(JSON.stringify({ ok: false, error: "Invalid UUID" }), { status: 400 });
        }
        if (env.nahan) {
          await env.nahan.put("uuid", body, { expirationTtl: 31536e3 });
        }
        return new Response(JSON.stringify({ ok: true, uuid: body }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
      if (path === "/" + currentUserID + "/save-trpass") {
        if (request.method !== "POST")
          return new Response("Method Not Allowed", { status: 405 });
        if (!isApiAuthed(request, currentPanelPass, currentUserID))
          return new Response("Unauthorized", { status: 401 });
        const body = (await request.text()).trim();
        if (!body) {
          return new Response(JSON.stringify({ ok: false, error: "Password required" }), { status: 400 });
        }
        if (env.nahan) {
          await env.nahan.put("tr_pass", body, { expirationTtl: 31536e3 });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
      if (path === "/api/ping") {
        return new Response(JSON.stringify({ ok: true, pong: Date.now() }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
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

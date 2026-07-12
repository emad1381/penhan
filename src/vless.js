// VLESS Protocol Handler
import { connect } from 'cloudflare:sockets';
import { 
  WS_READY_STATE_OPEN, safeCloseWebSocket, base64ToArrayBuffer, isValidUUID, stringify, sha224_and_224,
  parseProxyIps, pickRandomProxyIp, tryConnectWithFallback,
  trackConnectionStart, trackConnectionEnd
} from './helpers.js';

async function handleUDPOutBound(webSocket, vlessResponseHeader, log) {
  let isVlessHeaderSent = false;
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      for (let index = 0; index < chunk.byteLength;) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPacketLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPacketLength));
        index = index + 2 + udpPacketLength;
        controller.enqueue(udpData);
      }
    },
  });
  transformStream.readable.pipeTo(new WritableStream({
    async write(chunk) {
      const resp = await fetch('https://cloudflare-dns.com/dns-query', {
        method: 'POST',
        headers: { 'content-type': 'application/dns-message' },
        body: chunk,
      });
      const dnsQueryResult = await resp.arrayBuffer();
      const udpSize = dnsQueryResult.byteLength;
      const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
      if (webSocket.readyState === WS_READY_STATE_OPEN) {
        log('doh success, dns message length: ' + udpSize);
        if (isVlessHeaderSent || vlessResponseHeader.byteLength === 0) {
          webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
        } else {
          webSocket.send(await new Blob([vlessResponseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
          isVlessHeaderSent = true;
        }
      }
    }
  })).catch((error) => { log('dns udp has error: ' + error); });
  const writer = transformStream.writable.getWriter();
  return { write(chunk) { writer.write(chunk); } };
}

function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log, onUpload) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener('message', (event) => {
        if (readableStreamCancel) return;
        if (onUpload) {
          const uploadOk = onUpload(event.data.byteLength || event.data.size || 0);
          if (!uploadOk) {
            controller.error(new Error('User limit exceeded during upload'));
            safeCloseWebSocket(webSocketServer);
            return;
          }
        }
        controller.enqueue(event.data);
      });
      webSocketServer.addEventListener('close', () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) return;
        controller.close();
      });
      webSocketServer.addEventListener('error', (err) => {
        log('webSocketServer has error');
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) { controller.error(error); }
      else if (earlyData) { controller.enqueue(earlyData); }
    },
    pull(controller) {},
    cancel(reason) {
      if (readableStreamCancel) return;
      log('ReadableStream was canceled, due to ' + reason);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    }
  });
  return stream;
}

/**
 * Enhanced TCP outbound handler with multi-ProxyIP support.
 * 
 * Flow:
 * 1. Try direct connection to addressRemote
 * 2. If direct fails, try each proxy IP in sequence
 * 3. If no proxy IP works, send close to WebSocket
 */
async function handleTCPOutBound(remoteSocketWrapper, userConnId, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, proxyIP, log, onDownload) {
  async function connectAndWrite(address, port) {
    const tcpSocket = connect({ hostname: address, port: port });
    remoteSocketWrapper.value = tcpSocket;
    log('connected to ' + address + ':' + port);
    const writer = tcpSocket.writable.getWriter();
    try {
      await writer.write(rawClientData);
    } catch (e) {
      log('write error: ' + e.message);
      writer.releaseLock();
      throw e;
    }
    writer.releaseLock();
    tcpSocket.closed.catch(error => { 
      log('tcpSocket closed: ' + error); 
    }).finally(() => { 
      remoteSocketWrapper.value = null; 
    });
    return tcpSocket;
  }

  async function retryWithFallback() {
    // Parse proxy IPs - user may have multiple
    const proxyIps = parseProxyIps(proxyIP);
    
    if (!proxyIps || proxyIps.length === 0) {
      log('no proxy IP configured, retry impossible');
      webSocket.close(1011, 'Connection failed: no proxy IP');
      return;
    }

    log('retrying with ' + proxyIps.length + ' proxy IP(s)');
    
    // Prioritize first IP (explicitly configured), pick up to 2 random from top 5 pool for fast fallback
    const candidates = [];
    if (proxyIps.length > 0) candidates.push(proxyIps[0]);
    if (proxyIps.length > 1) {
      const pool = proxyIps.slice(1, 6);
      const shuffledPool = pool.sort(() => Math.random() - 0.5).slice(0, 2);
      shuffledPool.forEach(ip => { if (!candidates.includes(ip)) candidates.push(ip); });
    }
    
    for (let i = 0; i < candidates.length; i++) {
      const currentProxyIp = candidates[i];
      if (!currentProxyIp) continue;
      
      log(`retry attempt ${i + 1}/${candidates.length} with proxy: ${currentProxyIp}`);
      try {
        const tcpSocket = await connectAndWrite(currentProxyIp, portRemote);
        // Success! Stream data
        await remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log, onDownload);
        return; // done
      } catch (err) {
        log(`proxy ${currentProxyIp} failed: ${err.message || err}`);
        remoteSocketWrapper.value = null;
      }
    }

    // All proxies exhausted
    log('all proxy IPs exhausted, closing connection');
    webSocket.close(1011, 'All proxies failed');
  }

  try {
    // First attempt: try direct connection
    const tcpSocket = await connectAndWrite(addressRemote, portRemote);
    await remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retryWithFallback, log, onDownload);
  } catch (error) {
    log('first connection attempt failed: ' + error);
    if (proxyIP) { 
      retryWithFallback(); 
    } else { 
      webSocket.close(1011, 'Connection failed: ' + error); 
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
            controller.error('webSocket.readyState is not open, maybe close');
            return;
          }
          if (onDownload) {
            const downloadOk = onDownload(chunk.byteLength || chunk.size || 0);
            if (!downloadOk) {
              controller.error(new Error('User limit exceeded during download'));
              safeCloseWebSocket(webSocket);
              return;
            }
          }
          if (vlessHeader && vlessHeader.byteLength > 0) {
            webSocket.send(await new Blob([vlessHeader, chunk]).arrayBuffer());
            vlessHeader = null;
          } else { webSocket.send(chunk); }
        },
        close() { log('remoteConnection.readable is close with hasIncomingData is ' + hasIncomingData); },
        abort(reason) { console.error('remoteConnection.readable abort', reason); },
      })
    );
  } catch (error) {
    console.error('remoteSocketToWS has exception', error.stack || error);
  }
  if (hasIncomingData === false && retry) {
    log('retry: no incoming data from target');
    retry();
  }
}


function processVlessHeader(vlessBuffer) {
  if (vlessBuffer.byteLength < 24) { return { hasError: true, message: 'invalid data' }; }
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isUDP = false;
  const userID = stringify(new Uint8Array(vlessBuffer.slice(1, 17)));
  const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];
  const command = new Uint8Array(vlessBuffer.slice(18 + optLength, 18 + optLength + 1))[0];
  if (command === 1) { /* TCP */ }
  else if (command === 2) { isUDP = true; }
  else { return { hasError: true, message: 'command ' + command + ' is not supported' }; }
  const portIndex = 18 + optLength + 1;
  const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(vlessBuffer.slice(addressIndex, addressIndex + 1));
  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = '';
  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join('.');
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
      for (let i = 0; i < 8; i++) { ipv6.push(dataView.getUint16(i * 2).toString(16)); }
      addressValue = ipv6.join(':');
      break;
    default:
      return { hasError: true, message: 'invalid addressType is ' + addressType };
  }
  if (!addressValue) { return { hasError: true, message: 'addressValue is empty' }; }
  return {
    hasError: false, addressRemote: addressValue, addressType,
    portRemote, rawDataIndex: addressValueIndex + addressLength, vlessVersion: version, isUDP, userID
  };
}

async function vlessOverWSHandler(request, authenticate, defaultProxyIP, onUsage) {
  // @ts-ignore
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);

  webSocket.accept();
  webSocket.binaryType = 'arraybuffer';
  
  let currentSessionUpload = 0;
  let currentSessionDownload = 0;
  let activeUserID = null;
  let connTrackingId = null;
  
  const handleUpload = (bytes) => {
    currentSessionUpload += bytes;
    if (onUsage && activeUserID) {
      return onUsage(activeUserID, bytes, 0); // returns false if limit exceeded
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

  let address = '';
  let portWithRandomLog = '';
  const log = (info, event) => {
    console.log('[VLESS WS ' + address + ':' + portWithRandomLog + '] ' + info, event || '');
  };

  const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';
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
            log('socket write error: ' + err);
            controller.error(err);
            return;
          }
        } else {
          log('socket closed, aborting session');
          controller.error(new Error('socket already closed'));
          return;
        }
      }

      const {
        hasError, message,
        portRemote = 443, addressRemote = '',
        rawDataIndex, vlessVersion = new Uint8Array([0, 0]), isUDP,
        userID
      } = processVlessHeader(chunk);

      // Validate header BEFORE using userID for authentication
      if (hasError) { log('header parse error: ' + message); throw new Error(message); }

      const userObj = await authenticate(userID);
      if (!userObj || !userObj.enabled) {
        log('user auth failed or disabled');
        throw new Error('user not found or disabled');
      }
      activeUserID = userObj.id;
      
      // Track connection start
      const connLimit = userObj.conn_limit || 0;
      connTrackingId = trackConnectionStart(activeUserID, connLimit);
      if (connTrackingId === false) {
        log('connection limit exceeded for user');
        throw new Error('connection limit exceeded');
      }
      
      // Get proxy IPs: user-specific proxy_ip or global default
      // Support multi-proxyIP: user can have comma/line-separated list
      const proxyIP = userObj.proxy_ip || defaultProxyIP;

      address = addressRemote;
      portWithRandomLog = '' + portRemote + '--' + Math.random() + ' ' + (isUDP ? 'udp' : 'tcp');

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
      log('readableWebSocketStream closed');
      // Clean up connection tracking
      if (activeUserID && connTrackingId) {
        trackConnectionEnd(activeUserID, connTrackingId);
      }
    },
    abort(reason) { 
      log('readableWebSocketStream aborted', JSON.stringify(reason));
      if (activeUserID && connTrackingId) {
        trackConnectionEnd(activeUserID, connTrackingId);
      }
    },
  })).catch((err) => {
    log('pipeTo error', err);
    if (activeUserID && connTrackingId) {
      trackConnectionEnd(activeUserID, connTrackingId);
    }
    safeCloseWebSocket(webSocket);
  });

  return new Response(null, { status: 101, webSocket: client });
}

// ============ Trojan over WebSocket Handler ============

export { vlessOverWSHandler, makeReadableWebSocketStream, handleTCPOutBound, remoteSocketToWS, handleUDPOutBound };

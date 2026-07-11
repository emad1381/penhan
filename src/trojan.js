// Trojan Protocol Handler
import { connect } from 'cloudflare:sockets';
import { 
  WS_READY_STATE_OPEN, safeCloseWebSocket, base64ToArrayBuffer, sha224_and_224,
  parseProxyIps, pickRandomProxyIp, tryConnectWithFallback,
  trackConnectionStart, trackConnectionEnd
} from './helpers.js';
import { makeReadableWebSocketStream, handleTCPOutBound, remoteSocketToWS, handleUDPOutBound } from './vless.js';



// ============ WebSocket Stream Helpers ============



// ============ Trojan Header Parser ============
function processTrojanHeader(buffer, trojanPasswordHash) {
  if (buffer.byteLength < 56 + 2 + 1 + 1 + 2 + 2) {
    return { hasError: true, message: 'invalid data length' };
  }
  
  const clientHash = new TextDecoder().decode(buffer.slice(0, 56));
  if (clientHash !== trojanPasswordHash) {
    return { hasError: true, message: 'invalid password hash' };
  }
  
  const commandIndex = 56 + 2;
  const command = new Uint8Array(buffer.slice(commandIndex, commandIndex + 1))[0];
  let isUDP = false;
  if (command === 1) { /* TCP */ }
  else if (command === 2) { isUDP = true; }
  else { return { hasError: true, message: 'command ' + command + ' not supported' }; }
  
  const addressTypeIndex = commandIndex + 1;
  const addressType = new Uint8Array(buffer.slice(addressTypeIndex, addressTypeIndex + 1))[0];
  
  let addressLength = 0;
  let addressValueIndex = addressTypeIndex + 1;
  let addressValue = '';
  
  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(buffer.slice(addressValueIndex, addressValueIndex + addressLength)).join('.');
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
      for (let i = 0; i < 8; i++) { ipv6.push(dataView.getUint16(i * 2).toString(16)); }
      addressValue = ipv6.join(':');
      break;
    default:
      return { hasError: true, message: 'invalid address type: ' + addressType };
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
    console.log('[Trojan WS ' + address + ':' + portWithRandomLog + '] ' + info, event || '');
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

      // We don't have the user's plain pass, we only have the hash.
      // But we need to identify the user. We will pass the clientHash.
      
      const clientHash = new TextDecoder().decode(chunk.slice(0, 56));
      
      const {
        hasError, message,
        portRemote = 443, addressRemote = '',
        rawDataIndex, isUDP,
      } = processTrojanHeader(chunk, clientHash);

      // Validate header BEFORE proceeding
      if (hasError) { log('header parse error: ' + message); throw new Error(message); }

      const userObj = await authenticate(clientHash);
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
      
      // Get proxy IPs (support multi-ProxyIP)
      const proxyIP = userObj.proxy_ip || defaultProxyIP;

      address = addressRemote;
      portWithRandomLog = '' + portRemote + '--' + Math.random() + ' ' + (isUDP ? 'udp' : 'tcp');

      isHeaderParsed = true;


      if (isUDP) {
        isDns = true;
      }

      const rawClientData = chunk.slice(rawDataIndex);

      if (isDns) {
        const { write } = await handleUDPOutBound(webSocket, new Uint8Array([]), log); // No server response header in Trojan
        udpStreamWrite = write;
        udpStreamWrite(rawClientData);
        return;
      }

      handleTCPOutBound(remoteSocketWrapper, connTrackingId, addressRemote, portRemote, rawClientData, webSocket, new Uint8Array([]), proxyIP, log, handleDownload);
    },
    close() { 
      log('readableWebSocketStream closed');
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

// ============ VLESS & Trojan Header Parsers ============

export { trojanOverWSHandler };

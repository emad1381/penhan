// Trojan Protocol Handler
import { connect } from 'cloudflare:sockets';
import { WS_READY_STATE_OPEN, safeCloseWebSocket, base64ToArrayBuffer, sha224_and_224 } from './helpers.js';
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

// ============ VLESS Header Parser ============
function processVlessHeader(vlessBuffer, userID) {
  if (vlessBuffer.byteLength < 24) { return { hasError: true, message: 'invalid data' }; }
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isValidUser = false;
  let isUDP = false;
  if (stringify(new Uint8Array(vlessBuffer.slice(1, 17))) === userID) { isValidUser = true; }
  if (!isValidUser) { return { hasError: true, message: 'invalid user' }; }
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
    portRemote, rawDataIndex: addressValueIndex + addressLength, vlessVersion: version, isUDP,
  };
}

async function trojanOverWSHandler(request, userID, proxyIP) {
  // @ts-ignore
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);

  webSocket.accept();
  webSocket.binaryType = 'arraybuffer';

  let address = '';
  let portWithRandomLog = '';
  const log = (info, event) => {
    console.log('[Trojan WS ' + address + ':' + portWithRandomLog + '] ' + info, event || '');
  };

  const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';
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

      const trojanPasswordHash = sha224_and_224(userID, true);
      const {
        hasError, message,
        portRemote = 443, addressRemote = '',
        rawDataIndex, isUDP,
      } = processTrojanHeader(chunk, trojanPasswordHash);

      address = addressRemote;
      portWithRandomLog = '' + portRemote + '--' + Math.random() + ' ' + (isUDP ? 'udp' : 'tcp');

      if (hasError) { log('header parse error: ' + message); throw new Error(message); }

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

      handleTCPOutBound(remoteSocketWrapper, addressRemote, portRemote, rawClientData, webSocket, new Uint8Array([]), proxyIP, log);
    },
    close() { log('readableWebSocketStream closed'); },
    abort(reason) { log('readableWebSocketStream aborted', JSON.stringify(reason)); },
  })).catch((err) => {
    log('pipeTo error', err);
    safeCloseWebSocket(webSocket);
  });

  return new Response(null, { status: 101, webSocket: client });
}

// ============ VLESS & Trojan Header Parsers ============

export { trojanOverWSHandler };

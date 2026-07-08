function B(t,e=!1){let g=(i,h,n)=>i&h^~i&n,r=(i,h,n)=>i&h^i&n^h&n,b=i=>(i>>>2|i<<30)^(i>>>13|i<<19)^(i>>>22|i<<10),d=i=>(i>>>6|i<<26)^(i>>>11|i<<21)^(i>>>25|i<<7),p=i=>(i>>>7|i<<25)^(i>>>18|i<<14)^i>>>3,f=i=>(i>>>17|i<<15)^(i>>>19|i<<13)^i>>>10,s=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],c=e?[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428]:[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],l=[],v=t.length;for(let i=0;i<v;i++)l[i>>>2]|=(t.charCodeAt(i)&255)<<24-i%4*8;let u=v*8;l[u>>>5]|=128<<24-u%32;let m=(u+64>>>9)+1<<4;for(;l.length<m;)l.push(0);l[m-2]=u/4294967296|0,l[m-1]=u|0;let x=new Int32Array(64);for(let i=0;i<l.length;i+=16){for(let P=0;P<16;P++)x[P]=l[i+P];for(let P=16;P<64;P++)x[P]=f(x[P-2])+x[P-7]+p(x[P-15])+x[P-16]|0;let[h,n,a,w,k,S,T,C]=c;for(let P=0;P<64;P++){let A=C+d(k)+g(k,S,T)+s[P]+x[P]|0,R=b(h)+r(h,n,a)|0;C=T,T=S,S=k,k=w+A|0,w=a,a=n,n=h,h=A+R|0}c[0]=c[0]+h|0,c[1]=c[1]+n|0,c[2]=c[2]+a|0,c[3]=c[3]+w|0,c[4]=c[4]+k|0,c[5]=c[5]+S|0,c[6]=c[6]+T|0,c[7]=c[7]+C|0}let o=i=>{let h=(i>>>0).toString(16);return"00000000".substring(h.length)+h},y=e?7:8,j="";for(let i=0;i<y;i++)j+=o(c[i]);return j}function N(t){if(!t)return{error:null};try{t=t.replace(/-/g,"+").replace(/_/g,"/");let e=atob(t);return{earlyData:Uint8Array.from(e,r=>r.charCodeAt(0)).buffer,error:null}}catch(e){return{error:e}}}function E(t){return/^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t)}var I=[];for(let t=0;t<256;++t)I.push((t+256).toString(16).slice(1));function Z(t,e=0){return(I[t[e+0]]+I[t[e+1]]+I[t[e+2]]+I[t[e+3]]+"-"+I[t[e+4]]+I[t[e+5]]+"-"+I[t[e+6]]+I[t[e+7]]+"-"+I[t[e+8]]+I[t[e+9]]+"-"+I[t[e+10]]+I[t[e+11]]+I[t[e+12]]+I[t[e+13]]+I[t[e+14]]+I[t[e+15]]).toLowerCase()}function H(t,e=0){let g=Z(t,e);if(!E(g))throw TypeError("Stringified UUID is invalid");return g}function U(t){try{(t.readyState===1||t.readyState===2)&&t.close()}catch(e){console.error("safeCloseWebSocket error",e)}}async function $(t){let e=new TextEncoder().encode(t),g=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(g)).map(b=>b.toString(16).padStart(2,"0")).join("")}function z(t,e){if(typeof t!="string"||typeof e!="string"||t.length!==e.length)return!1;let g=0;for(let r=0;r<t.length;r++)g|=t.charCodeAt(r)^e.charCodeAt(r);return g===0}async function L(t,e){let r=(t.headers.get("Cookie")||"").match(/(?:^|;\s*)panel_auth=([^;]*)/);if(!r||!r[1])return!1;let b=await $(e);return z(r[1],b)}function W(t,e,g){let r=t.headers.get("Authorization"),b="";return r&&r.startsWith("Bearer ")?b=r.substring(7).trim():b=new URL(t.url).searchParams.get("token")||"",!!(e&&z(b,e)||z(b,g)||!e&&!b)}import{connect as tt}from"cloudflare:sockets";async function D(t,e,g){let r=!1,b=new TransformStream({transform(p,f){for(let s=0;s<p.byteLength;){let c=p.slice(s,s+2),l=new DataView(c).getUint16(0),v=new Uint8Array(p.slice(s+2,s+2+l));s=s+2+l,f.enqueue(v)}}});b.readable.pipeTo(new WritableStream({async write(p){let s=await(await fetch("https://cloudflare-dns.com/dns-query",{method:"POST",headers:{"content-type":"application/dns-message"},body:p})).arrayBuffer(),c=s.byteLength,l=new Uint8Array([c>>8&255,c&255]);t.readyState===1&&(g("doh success, dns message length: "+c),r||e.byteLength===0?t.send(await new Blob([l,s]).arrayBuffer()):(t.send(await new Blob([e,l,s]).arrayBuffer()),r=!0))}})).catch(p=>{g("dns udp has error: "+p)});let d=b.writable.getWriter();return{write(p){d.write(p)}}}function V(t,e,g){let r=!1;return new ReadableStream({start(d){t.addEventListener("message",s=>{r||d.enqueue(s.data)}),t.addEventListener("close",()=>{U(t),!r&&d.close()}),t.addEventListener("error",s=>{g("webSocketServer has error"),d.error(s)});let{earlyData:p,error:f}=N(e);f?d.error(f):p&&d.enqueue(p)},pull(d){},cancel(d){r||(g("ReadableStream was canceled, due to "+d),r=!0,U(t))}})}async function O(t,e,g,r,b,d,p,f){async function s(l,v){let u=tt({hostname:l,port:v});t.value=u,f("connected to "+l+":"+v);let m=u.writable.getWriter();return await m.write(r),m.releaseLock(),u.closed.catch(x=>{f("tcpSocket closed: "+x)}).finally(()=>{t.value=null}),u}async function c(){if(!p){f("no proxy IP configured, retry impossible"),b.close(1011,"Connection failed: no proxy IP");return}f("retrying with proxy IP: "+p);try{let l=await s(p,g);Y(l,b,d,null,f)}catch(l){f("retry connect failed: "+l),b.close(1011,"Retry failed: "+l)}}try{let l=await s(e,g);await Y(l,b,d,c,f)}catch(l){f("first connection attempt failed: "+l),p?c():b.close(1011,"Connection failed: "+l)}}async function Y(t,e,g,r,b){let d=g,p=!1;try{await t.readable.pipeTo(new WritableStream({async write(f,s){if(p=!0,e.readyState!==1){s.error("webSocket.readyState is not open, maybe close");return}d&&d.byteLength>0?(e.send(await new Blob([d,f]).arrayBuffer()),d=null):e.send(f)},close(){b("remoteConnection.readable is close with hasIncomingData is "+p)},abort(f){console.error("remoteConnection.readable abort",f)}}))}catch(f){console.error("remoteSocketToWS has exception",f.stack||f)}p===!1&&r&&(b("retry: no incoming data from target"),r())}function et(t,e){if(t.byteLength<24)return{hasError:!0,message:"invalid data"};let g=new Uint8Array(t.slice(0,1)),r=!1,b=!1;if(H(new Uint8Array(t.slice(1,17)))===e&&(r=!0),!r)return{hasError:!0,message:"invalid user"};let d=new Uint8Array(t.slice(17,18))[0],p=new Uint8Array(t.slice(18+d,18+d+1))[0];if(p!==1)if(p===2)b=!0;else return{hasError:!0,message:"command "+p+" is not supported"};let f=18+d+1,s=t.slice(f,f+2),c=new DataView(s).getUint16(0),l=f+2,u=new Uint8Array(t.slice(l,l+1))[0],m=0,x=l+1,o="";switch(u){case 1:m=4,o=new Uint8Array(t.slice(x,x+m)).join(".");break;case 2:m=new Uint8Array(t.slice(x,x+1))[0],x+=1,o=new TextDecoder().decode(t.slice(x,x+m));break;case 3:m=16;let y=new DataView(t.slice(x,x+m)),j=[];for(let i=0;i<8;i++)j.push(y.getUint16(i*2).toString(16));o=j.join(":");break;default:return{hasError:!0,message:"invalid addressType is "+u}}return o?{hasError:!1,addressRemote:o,addressType:u,portRemote:c,rawDataIndex:x+m,vlessVersion:g,isUDP:b}:{hasError:!0,message:"addressValue is empty"}}async function J(t,e,g){let r=new WebSocketPair,[b,d]=Object.values(r);d.accept(),d.binaryType="arraybuffer";let p="",f="",s=(o,y)=>{console.log("[VLESS WS "+p+":"+f+"] "+o,y||"")},c=t.headers.get("sec-websocket-protocol")||"",l=V(d,c,s),v={value:null},u=null,m=!1,x=!1;return l.pipeTo(new WritableStream({async write(o,y){if(m&&u)return u(o);if(x)if(v.value)try{let C=v.value.writable.getWriter();await C.write(o),C.releaseLock();return}catch(C){s("socket write error: "+C),y.error(C);return}else{s("socket closed, aborting session"),y.error(new Error("socket already closed"));return}let{hasError:j,message:i,portRemote:h=443,addressRemote:n="",rawDataIndex:a,vlessVersion:w=new Uint8Array([0,0]),isUDP:k}=et(o,e);if(p=n,f=""+h+"--"+Math.random()+" "+(k?"udp":"tcp"),j)throw s("header parse error: "+i),new Error(i);x=!0,k&&(m=!0);let S=new Uint8Array([w[0],0]),T=o.slice(a);if(m){let{write:C}=await D(d,S,s);u=C,u(T);return}O(v,n,h,T,d,S,g,s)},close(){s("readableWebSocketStream closed")},abort(o){s("readableWebSocketStream aborted",JSON.stringify(o))}})).catch(o=>{s("pipeTo error",o),U(d)}),new Response(null,{status:101,webSocket:b})}import"cloudflare:sockets";function at(t,e){if(t.byteLength<64)return{hasError:!0,message:"invalid data length"};if(new TextDecoder().decode(t.slice(0,56))!==e)return{hasError:!0,message:"invalid password hash"};let r=58,b=new Uint8Array(t.slice(r,r+1))[0],d=!1;if(b!==1)if(b===2)d=!0;else return{hasError:!0,message:"command "+b+" not supported"};let p=r+1,f=new Uint8Array(t.slice(p,p+1))[0],s=0,c=p+1,l="";switch(f){case 1:s=4,l=new Uint8Array(t.slice(c,c+s)).join(".");break;case 3:s=new Uint8Array(t.slice(c,c+1))[0],c+=1,l=new TextDecoder().decode(t.slice(c,c+s));break;case 4:s=16;let x=new DataView(t.slice(c,c+s)),o=[];for(let y=0;y<8;y++)o.push(x.getUint16(y*2).toString(16));l=o.join(":");break;default:return{hasError:!0,message:"invalid address type: "+f}}let v=c+s,u=new DataView(t.slice(v,v+2)).getUint16(0),m=v+2+2;return{hasError:!1,addressRemote:l,portRemote:u,rawDataIndex:m,isUDP:d}}async function Q(t,e,g){let r=new WebSocketPair,[b,d]=Object.values(r);d.accept(),d.binaryType="arraybuffer";let p="",f="",s=(o,y)=>{console.log("[Trojan WS "+p+":"+f+"] "+o,y||"")},c=t.headers.get("sec-websocket-protocol")||"",l=V(d,c,s),v={value:null},u=null,m=!1,x=!1;return l.pipeTo(new WritableStream({async write(o,y){if(m&&u)return u(o);if(x)if(v.value)try{let T=v.value.writable.getWriter();await T.write(o),T.releaseLock();return}catch(T){s("socket write error: "+T),y.error(T);return}else{s("socket closed, aborting session"),y.error(new Error("socket already closed"));return}let j=B(e,!0),{hasError:i,message:h,portRemote:n=443,addressRemote:a="",rawDataIndex:w,isUDP:k}=at(o,j);if(p=a,f=""+n+"--"+Math.random()+" "+(k?"udp":"tcp"),i)throw s("header parse error: "+h),new Error(h);x=!0,k&&(m=!0);let S=o.slice(w);if(m){let{write:T}=await D(d,new Uint8Array([]),s);u=T,u(S);return}O(v,a,n,S,d,new Uint8Array([]),g,s)},close(){s("readableWebSocketStream closed")},abort(o){s("readableWebSocketStream aborted",JSON.stringify(o))}})).catch(o=>{s("pipeTo error",o),U(d)}),new Response(null,{status:101,webSocket:b})}function _(){return`<!DOCTYPE html>
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
</html>`}function X(t,e){return`<!DOCTYPE html>
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
</html>`}function F(t,e,g,r,b,d){let p=r||t,f=b||"/?ed=2048",s=d||`/${e}/trojan-ws`,c=`vless://${e}@${p}:443?encryption=none&security=tls&sni=${t}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${t}&path=${encodeURIComponent(f)}#VLESS-WS-${t}`,l=`trojan://${g}@${p}:443?security=tls&sni=${t}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${t}&path=${encodeURIComponent(s)}#Trojan-WS-${t}`;return`<!DOCTYPE html>
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
        <div class="sub-url" id="subUrl">${`https://${t}/${e}/sub`}</div>
        <button class="btn-action" onclick="copyText('subUrl', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
      </div>
    </div>

    <div class="section-title">\u{1F680} \u06A9\u0627\u0646\u0641\u06CC\u06AF\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644 \u0634\u0645\u0627 (Configs):</div>

    <div class="config-card">
      <span class="config-tag">VLESS WS</span>
      <div class="config-title">\u{1F680} VLESS over Custom WebSocket</div>
      <div class="config-link-container" id="link-vlessWS">${c}</div>
      <div class="config-actions">
        <button class="btn-config btn-copy-link" onclick="copyText('link-vlessWS', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
        <button class="btn-config btn-qr" onclick="showQR('${c}', 'VLESS WS')">\u{1F50D} \u0646\u0645\u0627\u06CC\u0634 QR</button>
      </div>
      <div class="config-obfuscation-box">
        <div class="obf-header">\u{1F4A1} \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u06A9\u0644\u0627\u06CC\u0646\u062A (Custom WS Headers):</div>
        <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${t}</span></div>
        <div class="obf-item"><strong>Path:</strong> <span class="obf-val">${f}</span></div>
        <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
      </div>
    </div>

    <div class="config-card">
      <span class="config-tag">Trojan WS</span>
      <div class="config-title">\u{1F511} Trojan over Custom WebSocket</div>
      <div class="config-link-container" id="link-trojanWS">${l}</div>
      <div class="config-actions">
        <button class="btn-config btn-copy-link" onclick="copyText('link-trojanWS', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
        <button class="btn-config btn-qr" onclick="showQR('${l}', 'Trojan WS')">\u{1F50D} \u0646\u0645\u0627\u06CC\u0634 QR</button>
      </div>
      <div class="config-obfuscation-box">
        <div class="obf-header">\u{1F4A1} \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u06A9\u0644\u0627\u06CC\u0646\u062A (Custom WS Headers):</div>
        <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${t}</span></div>
        <div class="obf-item"><strong>Path:</strong> <span class="obf-val">${s}</span></div>
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
</html>`}function K(t,e,g,r,b,d,p,f,s="N/A",c="N/A"){let l=r||t,v=d||"/?ed=2048",u=p||`/${e}/trojan-ws`,m=`vless://${e}@${l}:443?encryption=none&security=tls&sni=${t}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${t}&path=${encodeURIComponent(v)}#VLESS-WS-${t}`,x=`trojan://${g}@${l}:443?security=tls&sni=${t}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${t}&path=${encodeURIComponent(u)}#Trojan-WS-${t}`;return`<!DOCTYPE html>
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
          <div class="stat-val" id="statCleanIP">${r||"\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631"}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">\u0648\u0636\u0639\u06CC\u062A \u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC</div>
          <div class="stat-val" id="statProxyIP">${b||"\u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645 (\u0628\u062F\u0648\u0646 \u067E\u0631\u0648\u06A9\u0633\u06CC)"}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="stat-card">
          <div class="stat-title">\u062F\u06CC\u062A\u0627\u0633\u0646\u062A\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 (Colo)</div>
          <div class="stat-val">${s}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">\u0646\u0633\u062E\u0647 TLS \u0645\u0631\u0648\u0631\u06AF\u0631</div>
          <div class="stat-val">${c}</div>
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
          <div id="lblSubLink" style="flex: 1; font-family: Vazirmatn, Tahoma, sans-serif; font-size: 11px; color: #a5b4fc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 10px; direction: ltr; text-align: left;">https://${t}/${e}/sub</div>
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
        <div class="config-link-container" id="link-vlessWS">${m}</div>
        <div class="config-actions">
          <button class="btn-config btn-copy-link" onclick="copyLink('link-vlessWS', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
          <button class="btn-config btn-qr" onclick="showQR('${m}', 'VLESS WS')">\u{1F50D} \u0646\u0645\u0627\u06CC\u0634 QR</button>
        </div>
        <div class="config-obfuscation-box">
          <div class="obf-header">\u{1F4A1} \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u06A9\u0644\u0627\u06CC\u0646\u062A (Custom WS Headers):</div>
          <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${t}</span></div>
          <div class="obf-item"><strong>Path:</strong> <span class="obf-val" id="lblVlessPath">${v}</span></div>
          <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
        </div>
      </div>

      <!-- Trojan WS -->
      <div class="config-card">
        <span class="config-tag">Trojan WS</span>
        <div class="config-title">\u{1F511} Trojan over Custom WebSocket</div>
        <div class="config-link-container" id="link-trojanWS">${x}</div>
        <div class="config-actions">
          <button class="btn-config btn-copy-link" onclick="copyLink('link-trojanWS', this)">\u{1F4CB} \u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9</button>
          <button class="btn-config btn-qr" onclick="showQR('${x}', 'Trojan WS')">\u{1F50D} \u0646\u0645\u0627\u06CC\u0634 QR</button>
        </div>
        <div class="config-obfuscation-box">
          <div class="obf-header">\u{1F4A1} \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u06A9\u0644\u0627\u06CC\u0646\u062A (Custom WS Headers):</div>
          <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${t}</span></div>
          <div class="obf-item"><strong>Path:</strong> <span class="obf-val" id="lblTrojanPath">${u}</span></div>
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
          <input type="text" class="field-input" id="inputCleanIP" placeholder="\u0645\u062B\u0627\u0644: clean.domain.com" value="${r}">
          <button class="btn-save" id="btnCleanIP" onclick="saveCleanIP()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusCleanIP">${r?"\u2705 \u0641\u0639\u0627\u0644: "+r:"\u26AA \u062E\u0627\u0644\u06CC \u2014 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631"}</div>
      </div>

      <!-- Proxy IP Config -->
      <div class="field-card">
        <div class="field-label">\u{1F501} \u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC \u067E\u0634\u062A \u067E\u0631\u062F\u0647 (Proxy IP)</div>
        <div class="field-desc">\u067E\u0631\u0648\u06A9\u0633\u06CC \u0622\u06CC\u200C\u067E\u06CC \u0641\u0642\u0637 \u0628\u0631\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u062F\u0631 \u0628\u06A9\u200C\u0627\u0646\u062F \u0648\u0631\u06A9\u0631 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u0648 \u0646\u0628\u0627\u06CC\u062F \u062F\u0631 \u0644\u06CC\u0646\u06A9 \u06A9\u0644\u0627\u06CC\u0646\u062A\u200C\u0647\u0627 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0634\u0648\u062F.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputProxyIP" placeholder="\u0645\u062B\u0627\u0644: 1.1.1.1:443" value="${b}">
          <button class="btn-save" id="btnProxyIP" onclick="saveProxyIP()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusProxyIP">${b?"\u2705 \u0641\u0639\u0627\u0644: "+b:"\u26AA \u062E\u0627\u0644\u06CC \u2014 \u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645"}</div>
      </div>

      <!-- Password Protection -->
      <div class="field-card">
        <div class="field-label">\u{1F511} \u0645\u062D\u0627\u0641\u0638\u062A \u0627\u0632 \u067E\u0646\u0644</div>
        <div class="field-desc">\u0628\u0631\u0627\u06CC \u0627\u0645\u0646\u06CC\u062A \u067E\u0646\u0644, \u0631\u0645\u0632 \u0639\u0628\u0648\u0631\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F. \u062E\u0627\u0644\u06CC \u06AF\u0630\u0627\u0634\u062A\u0646 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631\u060C \u0642\u0641\u0644 \u067E\u0646\u0644 \u0631\u0627 \u0628\u0631\u0645\u06CC\u062F\u0627\u0631\u062F.</div>
        <div class="field-input-group">
          <input type="password" class="field-input" id="inputPassword" placeholder="\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F">
          <button class="btn-save" id="btnPass" onclick="savePassword()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusPass">${f?"\u{1F512} \u067E\u0646\u0644 \u062F\u0627\u0631\u0627\u06CC \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0633\u062A":"\u{1F513} \u067E\u0646\u0644 \u0628\u062F\u0648\u0646 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631"}</div>
      </div>

      <!-- UUID Config -->
      <div class="field-card">
        <div class="field-label">\u{1F511} \u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 (UUID)</div>
        <div class="field-desc">\u0634\u0646\u0627\u0633\u0647 \u06CC\u06A9\u062A\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631. \u062F\u0642\u062A \u06A9\u0646\u06CC\u062F \u0628\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0627\u06CC\u0646 \u0634\u0646\u0627\u0633\u0647\u060C \u0622\u062F\u0631\u0633 \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0634\u0645\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputUUID" placeholder="\u0645\u062B\u0627\u0644: 86c50e3a-..." value="${e}">
          <button class="btn-save" id="btnUUID" onclick="saveUUID()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
      </div>

      <!-- Trojan Pass Config -->
      <div class="field-card">
        <div class="field-label">\u{1F510} \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062A\u0631\u0648\u062C\u0627\u0646 (TR_PASS)</div>
        <div class="field-desc">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0645\u0648\u0631\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0628\u0631\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u067E\u0631\u0648\u062A\u06A9\u0644 \u062A\u0631\u0648\u062C\u0627\u0646.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputTrPass" placeholder="\u0631\u0645\u0632 \u062C\u062F\u06CC\u062F \u062A\u0631\u0648\u062C\u0627\u0646" value="${g}">
          <button class="btn-save" id="btnTrPass" onclick="saveTrPass()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
      </div>

      <!-- VLESS WS Path Config -->
      <div class="field-card">
        <div class="field-label">\u{1F6E4}\uFE0F \u0645\u0633\u06CC\u0631 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC VLESS WebSocket (Obfuscated Path)</div>
        <div class="field-desc">\u062A\u063A\u06CC\u06CC\u0631 \u0645\u0633\u06CC\u0631 \u0648\u0628\u200C\u0633\u0648\u06A9\u062A \u0628\u0631\u0627\u06CC \u0641\u0631\u06CC\u0628 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF. \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: <code>/?ed=2048</code></div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputVlessPath" placeholder="\u0645\u062B\u0627\u0644: /api/v3/telemetry" value="${d}">
          <button class="btn-save" id="btnVlessPath" onclick="saveVlessPath()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusVlessPath" style="font-family: Vazirmatn, Tahoma, sans-serif;">${d?"\u2705 \u0645\u0633\u06CC\u0631 \u0633\u0641\u0627\u0631\u0634\u06CC: "+d:"\u26AA \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: /?ed=2048"}</div>
      </div>

      <!-- Trojan WS Path Config -->
      <div class="field-card">
        <div class="field-label">\u{1F6E4}\uFE0F \u0645\u0633\u06CC\u0631 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC Trojan WebSocket (Obfuscated Path)</div>
        <div class="field-desc">\u062A\u063A\u06CC\u06CC\u0631 \u0645\u0633\u06CC\u0631 \u0648\u0628\u200C\u0633\u0648\u06A9\u062A \u062A\u0631\u0648\u062C\u0627\u0646 \u0628\u0631\u0627\u06CC \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632\u06CC \u062A\u0631\u0627\u0641\u06CC\u06A9 \u0641\u0627\u06CC\u0644. \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: <code>/${e}/trojan-ws</code></div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputTrojanPath" placeholder="\u0645\u062B\u0627\u0644: /assets/js/jquery.min.js" value="${p}">
          <button class="btn-save" id="btnTrojanPath" onclick="saveTrojanPath()">\u0630\u062E\u06CC\u0631\u0647</button>
        </div>
        <div class="field-status" id="statusTrojanPath" style="font-family: Vazirmatn, Tahoma, sans-serif;">${p?"\u2705 \u0645\u0633\u06CC\u0631 \u0633\u0641\u0627\u0631\u0634\u06CC: "+p:"\u26AA \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: /"+e+"/trojan-ws"}</div>
      </div>
    </div>

    <!-- Tab 4: System -->
    <div class="tab-content" id="tab-system">
      <div class="stat-card" style="margin-bottom: 12px;">
        <div class="stat-title">\u062F\u0627\u0645\u0646\u0647 \u0648\u0631\u06A9\u0631 (Worker Host)</div>
        <div class="stat-val" id="valHost">${t}</div>
      </div>
      <div class="stat-card" style="margin-bottom: 12px;">
        <div class="stat-title">\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 (UUID)</div>
        <div class="stat-val" id="valUuid">${e}</div>
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
      const trojanWS = 'trojan://${g}@' + addr + ':443?security=tls&sni=' + host + '&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=' + host + '&path=' + encodeURIComponent(trojanPathInput) + '#Trojan-WS-' + host;

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
</html>`}function q(t,e,g,r,b,d){let p=t&&e&&g&&r;return`<!DOCTYPE html>
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
        <div class="badge ${t?"ok":"fail"}">${t?"\u0645\u062A\u0635\u0644 \u0634\u062F \u2705":"\u0645\u062A\u0635\u0644 \u0646\u06CC\u0633\u062A \u274C"}</div>
      </div>
      
      <!-- Password Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u062F\u0645\u06CC\u0646 <span class="code">PASSWORD</span></div>
          <div class="desc">\u0628\u0631\u0627\u06CC \u0627\u0645\u0646\u06CC\u062A \u067E\u0646\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A. \u06CC\u06A9 \u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC \u0628\u0647 \u0646\u0627\u0645 <span class="code">PASSWORD</span> \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0633\u0627\u0632\u06CC\u062F.</div>
        </div>
        <div class="badge ${e?"ok":"fail"}">${e?"\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2705":"\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u274C"}</div>
      </div>

      <!-- UUID Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0634\u0646\u0627\u0633\u0647 \u06A9\u0627\u0631\u0628\u0631 <span class="code">UUID</span></div>
          <div class="desc">\u0634\u0645\u0627 \u0628\u0627\u06CC\u062F \u06CC\u06A9 UUID \u0645\u0639\u062A\u0628\u0631 (\u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC <span class="code">UUID</span>) \u062F\u0631 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F. ${b?`\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC: <span class="code">${b}</span>`:""}</div>
        </div>
        <div class="badge ${g?"ok":"fail"}">${g?"\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2705":"\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u274C"}</div>
      </div>

      <!-- Trojan Pass Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062A\u0631\u0648\u062C\u0627\u0646 <span class="code">TR_PASS</span></div>
          <div class="desc">\u0631\u0645\u0632 \u062A\u0631\u0648\u062C\u0627\u0646 \u0627\u062C\u0628\u0627\u0631\u06CC \u0627\u0633\u062A (\u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC <span class="code">TR_PASS</span>). \u0628\u0631\u0627\u06CC \u062C\u0644\u0648\u06AF\u06CC\u0631\u06CC \u0627\u0632 \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u0634\u062F\u0646 \u062A\u0648\u0633\u0637 \u06A9\u0644\u0627\u062F\u0641\u0644\u0631 \u0628\u0627\u06CC\u062F \u0628\u0627 UUID \u0645\u062A\u0641\u0627\u0648\u062A \u0628\u0627\u0634\u062F.</div>
        </div>
        <div class="badge ${r?"ok":"fail"}">${r?"\u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u2705":"\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u274C"}</div>
      </div>

      <!-- Proxy IP Check -->
      <div class="item">
        <div>
          <div class="item-title">\u0622\u06CC\u200C\u067E\u06CC \u067E\u0631\u0648\u06A9\u0633\u06CC <span class="code">PROXYIP</span></div>
          <div class="desc">\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC: ${d?'<span class="code">'+d+"</span>":"\u0646\u062F\u0627\u0631\u062F"}. \u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC <span class="code">PROXYIP</span> \u0628\u0631\u0627\u06CC \u062F\u0648\u0631 \u0632\u062F\u0646 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u0628\u0631\u062E\u06CC \u0633\u0627\u06CC\u062A\u200C\u0647\u0627.</div>
        </div>
        <div class="badge info">\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC \u2139\uFE0F</div>
      </div>
    </div>

    ${p?`
    <div class="links-box">
      <h3>\u2705 \u0633\u06CC\u0633\u062A\u0645 \u06A9\u0627\u0645\u0644\u0627\u064B \u0622\u0645\u0627\u062F\u0647 \u0627\u0633\u062A!</h3>
      <div class="desc" style="color:var(--text);">
        \u0627\u0632 \u0627\u06CC\u0646 \u067E\u0633 \u0628\u0627 \u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0622\u062F\u0631\u0633 \u0627\u0635\u0644\u06CC \u0648\u0631\u06A9\u0631\u060C \u0635\u0641\u062D\u0647 \u062C\u0639\u0644\u06CC Nginx \u0631\u0627 \u062E\u0648\u0627\u0647\u06CC\u062F \u062F\u06CC\u062F \u062A\u0627 \u0627\u0633\u062A\u062A\u0627\u0631 \u062D\u0641\u0638 \u0634\u0648\u062F.<br><br>
        \u{1F517} <strong>\u0622\u062F\u0631\u0633 \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0634\u0645\u0627:</strong><br><span class="code" style="color:#a78bfa;">/\${currentUUID}</span><br><br>
        \u{1F517} <strong>\u0622\u062F\u0631\u0633 \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u0627\u06CC\u067E \u0634\u0645\u0627:</strong><br><span class="code" style="color:#a78bfa;">/\${currentUUID}/sub</span><br>
      </div>
    </div>
    `:`
    <div style="text-align:center; margin-top:20px; color:var(--warning); font-size:14px; font-weight: 500;">
      \u26A0\uFE0F \u062A\u0627 \u0632\u0645\u0627\u0646\u06CC \u06A9\u0647 \u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0632\u0627\u0645\u06CC (KV \u0648 Password) \u0631\u0627 \u062A\u0646\u0638\u06CC\u0645 \u0646\u06A9\u0646\u06CC\u062F\u060C \u0627\u0645\u0646\u06CC\u062A \u0648 \u0639\u0645\u0644\u06A9\u0631\u062F \u067E\u0631\u0648\u06A9\u0633\u06CC \u0634\u0645\u0627 \u06A9\u0627\u0645\u0644 \u0646\u062E\u0648\u0627\u0647\u062F \u0628\u0648\u062F!
    </div>
    `}
  </div>
</body>
</html>`}var G=new Map;var kt={async fetch(t,e,g){try{let r="",b="",d="",p="",f="",s="",c="";e.nahan&&(r=await e.nahan.get("proxy_ip")||"",b=await e.nahan.get("clean_ip")||"",d=await e.nahan.get("panel_pass")||"",p=await e.nahan.get("vless_ws_path")||"",f=await e.nahan.get("trojan_ws_path")||"",s=await e.nahan.get("uuid")||"",c=await e.nahan.get("tr_pass")||"");let l=r||e.PROXYIP||"",v=b||"",u=d||e.PASSWORD||"",m=p||"",x=f||"",o=s||e.UUID||"",y=c||e.TR_PASS||"",j=t.headers.get("Upgrade"),h=new URL(t.url).pathname;if(j==="websocket"){let n=decodeURIComponent(h).toLowerCase();return(x?n.includes(decodeURIComponent(x).toLowerCase()):n.includes("trojan-ws")||n.includes("trojan"))?await Q(t,y,l):await J(t,o,l)}if(h==="/"){let n=!!e.nahan,a=!!u,w=!!o&&E(o),k=!!y,S=!1;return(!n||!a||!w||!k||a&&await L(t,u))&&(S=!0),S?new Response(q(n,a,w,k,o,l),{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}}):new Response(_(),{status:200,headers:{"Content-Type":"text/html; charset=utf-8",Server:"nginx/1.24.0"}})}if(h==="/"+o){let n=t.headers.get("Host");if(u&&!await L(t,u))return new Response(X(o,n),{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}});let a=t.cf?t.cf.colo:"N/A",w=t.cf?t.cf.tlsVersion:"N/A";return new Response(K(n,o,y,v,l,m,x,!!u,a,w),{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}})}if(h==="/"+o+"/sub"||h==="/sub/"+o){let n=t.headers.get("Host"),a=(t.headers.get("User-Agent")||"").toLowerCase();if(a.includes("v2ray")||a.includes("hiddify")||a.includes("clash")||a.includes("sing-box")||a.includes("shadowrocket")||a.includes("streisand")||a.includes("quantumult")||a.includes("surge")||a.includes("foxray")||a.includes("stash")||a.includes("v2fly")||a.includes("xray")){let k=v||n,S=m||"/?ed=2048",T=x||`/${o}/trojan-ws`,C=`vless://${o}@${k}:443?encryption=none&security=tls&sni=${n}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${n}&path=${encodeURIComponent(S)}#VLESS-WS-${n}`,P=`trojan://${y}@${k}:443?security=tls&sni=${n}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${n}&path=${encodeURIComponent(T)}#Trojan-WS-${n}`,A=`${C}
${P}
`,R=btoa(unescape(encodeURIComponent(A)));return new Response(R,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}})}else return new Response(F(n,o,y,v,m,x),{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}})}if(h==="/api/info"||h==="/"+o+"/api/info"){if(!W(t,u,o))return new Response(JSON.stringify({ok:!1,error:"Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});let n=t.headers.get("Host"),a=v||n,w=m||"/?ed=2048",k=x||`/${o}/trojan-ws`,S=`vless://${o}@${a}:443?encryption=none&security=tls&sni=${n}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${n}&path=${encodeURIComponent(w)}#VLESS-WS-${n}`,T=`trojan://${y}@${a}:443?security=tls&sni=${n}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${n}&path=${encodeURIComponent(k)}#Trojan-WS-${n}`,C=`https://${n}/${o}/sub`;return new Response(JSON.stringify({ok:!0,uuid:o,host:n,cleanIP:v||null,proxyIP:l||null,vlessPath:w,trojanPath:k,links:{vless:S,trojan:T,subscription:C},system:{cfColo:t.cf?t.cf.colo:"N/A",tlsVersion:t.cf?t.cf.tlsVersion:"N/A"}}),{status:200,headers:{"Content-Type":"application/json"}})}if(h==="/api/settings"||h==="/"+o+"/api/settings"){if(t.method!=="POST")return new Response(JSON.stringify({ok:!1,error:"Method Not Allowed"}),{status:405,headers:{"Content-Type":"application/json"}});if(!W(t,u,o))return new Response(JSON.stringify({ok:!1,error:"Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});let n={};try{n=await t.json()}catch{return new Response(JSON.stringify({ok:!1,error:"Invalid JSON"}),{status:400,headers:{"Content-Type":"application/json"}})}if(n.cleanIP!==void 0){let a=n.cleanIP.trim();v=a,e.nahan&&await e.nahan.put("clean_ip",a,{expirationTtl:31536e3})}if(n.proxyIP!==void 0){let a=n.proxyIP.trim();l=a,e.nahan&&await e.nahan.put("proxy_ip",a,{expirationTtl:31536e3})}if(n.vlessPath!==void 0){let a=n.vlessPath.trim()||"/?ed=2048";a&&!a.startsWith("/")&&(a="/"+a),m=a,e.nahan&&await e.nahan.put("vless_ws_path",a,{expirationTtl:31536e3})}if(n.trojanPath!==void 0){let a=n.trojanPath.trim()||`/${o}/trojan-ws`;a&&!a.startsWith("/")&&(a="/"+a),x=a,e.nahan&&await e.nahan.put("trojan_ws_path",a,{expirationTtl:31536e3})}if(n.password!==void 0){let a=n.password.trim();u=a,e.nahan&&await e.nahan.put("panel_pass",a,{expirationTtl:31536e3})}if(n.uuid!==void 0){let a=n.uuid.trim();E(a)&&(o=a,e.nahan&&await e.nahan.put("uuid",a,{expirationTtl:31536e3}))}if(n.tr_pass!==void 0){let a=n.tr_pass.trim();a&&(y=a,e.nahan&&await e.nahan.put("tr_pass",a,{expirationTtl:31536e3}))}return new Response(JSON.stringify({ok:!0,message:"Settings updated successfully",settings:{cleanIP:v||null,proxyIP:l||null,vlessPath:m||"/?ed=2048",trojanPath:x||`/${o}/trojan-ws`,hasPassword:!!u,uuid:o,tr_pass:y}}),{status:200,headers:{"Content-Type":"application/json"}})}if(h==="/"+o+"/panel-auth"){if(t.method!=="POST")return new Response("Method Not Allowed",{status:405});let n=t.headers.get("CF-Connecting-IP")||"unknown",a=Date.now(),w=G.get(n)||{count:0,time:a};if(a-w.time>6e4&&(w.count=0,w.time=a),w.count++,G.set(n,w),w.count>10)return new Response(JSON.stringify({ok:!1,error:"Too Many Requests"}),{status:429,headers:{"Content-Type":"application/json"}});if((await t.text()).trim()===u){let S=await $(u);return new Response(JSON.stringify({ok:!0}),{status:200,headers:{"Content-Type":"application/json","Set-Cookie":"panel_auth="+S+"; Path=/; Max-Age=86400; SameSite=Lax; Secure"}})}return new Response(JSON.stringify({ok:!1}),{status:200,headers:{"Content-Type":"application/json"}})}if(h==="/"+o+"/save-password"){if(t.method!=="POST")return new Response("Method Not Allowed",{status:405});if(!W(t,u,o))return new Response("Unauthorized",{status:401});let a=(await t.text()).trim()||"",w=a||e.PASSWORD||"";return e.nahan&&await e.nahan.put("panel_pass",a,{expirationTtl:31536e3}),new Response(JSON.stringify({ok:!0,enabled:!!w}),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}})}if(h==="/"+o+"/save-cleanip"){if(t.method!=="POST")return new Response("Method Not Allowed",{status:405});if(!W(t,u,o))return new Response("Unauthorized",{status:401});let a=(await t.text()).trim();return e.nahan&&await e.nahan.put("clean_ip",a,{expirationTtl:31536e3}),new Response(JSON.stringify({ok:!0,cleanIP:a}),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}})}if(h==="/"+o+"/save-proxy"){if(t.method!=="POST")return new Response("Method Not Allowed",{status:405});if(!W(t,u,o))return new Response("Unauthorized",{status:401});let a=(await t.text()).trim(),w=a||e.PROXYIP||"";return e.nahan&&await e.nahan.put("proxy_ip",a,{expirationTtl:31536e3}),new Response(JSON.stringify({ok:!0,proxyIP:w}),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}})}if(h==="/"+o+"/save-vlesspath"){if(t.method!=="POST")return new Response("Method Not Allowed",{status:405});if(!W(t,u,o))return new Response("Unauthorized",{status:401});let a=(await t.text()).trim();return a&&!a.startsWith("/")&&(a="/"+a),e.nahan&&await e.nahan.put("vless_ws_path",a,{expirationTtl:31536e3}),new Response(JSON.stringify({ok:!0,path:a}),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}})}if(h==="/"+o+"/save-trojanpath"){if(t.method!=="POST")return new Response("Method Not Allowed",{status:405});if(!W(t,u,o))return new Response("Unauthorized",{status:401});let a=(await t.text()).trim();return a&&!a.startsWith("/")&&(a="/"+a),e.nahan&&await e.nahan.put("trojan_ws_path",a,{expirationTtl:31536e3}),new Response(JSON.stringify({ok:!0,path:a}),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}})}if(h==="/"+o+"/save-uuid"){if(t.method!=="POST")return new Response("Method Not Allowed",{status:405});if(!W(t,u,o))return new Response("Unauthorized",{status:401});let n=(await t.text()).trim();return E(n)?(e.nahan&&await e.nahan.put("uuid",n,{expirationTtl:31536e3}),new Response(JSON.stringify({ok:!0,uuid:n}),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}})):new Response(JSON.stringify({ok:!1,error:"Invalid UUID"}),{status:400})}if(h==="/"+o+"/save-trpass"){if(t.method!=="POST")return new Response("Method Not Allowed",{status:405});if(!W(t,u,o))return new Response("Unauthorized",{status:401});let n=(await t.text()).trim();return n?(e.nahan&&await e.nahan.put("tr_pass",n,{expirationTtl:31536e3}),new Response(JSON.stringify({ok:!0}),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}})):new Response(JSON.stringify({ok:!1,error:"Password required"}),{status:400})}return h==="/api/ping"?new Response(JSON.stringify({ok:!0,pong:Date.now()}),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}):new Response(_(),{status:404,headers:{"Content-Type":"text/html; charset=utf-8",Server:"nginx/1.24.0"}})}catch(r){return console.error(r),new Response("Internal Server Error",{status:500})}}};export{kt as default};

function nginxPage() {
  return `<!DOCTYPE html>\n<html>\n<head>\n<title>Welcome to nginx!</title>\n<style>
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');
\nhtml { color-scheme: light dark; }\nbody { width: 35em; margin: 0 auto; font-family: Vazirmatn, Tahoma, sans-serif; }\n</style>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>\n</head>\n<body>\n<h1>Welcome to nginx!</h1>\n<p>If you see this page, the nginx web server is successfully installed and\nworking. Further configuration is required.</p>\n<p>For online documentation and support please refer to\n<a href="http://nginx.org/">nginx.org</a>.<br/>\nCommercial support is available at\n<a href="http://nginx.com/">nginx.com</a>.</p>\n<p><em>Thank you for using nginx.</em></p>\n</body>\n</html>`;
}

function loginPage(uuid, host) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>┘ê╪▒┘ê╪» ╪¿┘ç ┘╛┘å┘ä ┘à╪»█î╪▒█î╪¬</title>
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>
  <div class="toast" id="toast"></div>

  <div class="login-container">
    <div class="icon-wrapper">≡ƒöÆ</div>
    <h1>┘╛┘å┘ä ┘à╪»█î╪▒█î╪¬ ┘å┘ç╪º┘å</h1>
    <p class="subtitle">╪¿╪▒╪º█î ┘ê╪▒┘ê╪» ╪¿┘ç ╪¿╪«╪┤ ┘à╪»█î╪▒█î╪¬╪î ╪▒┘à╪▓ ╪╣╪¿┘ê╪▒ ╪▒╪º ┘ê╪º╪▒╪» ┌⌐┘å█î╪»</p>
    
    <input type="password" class="input-field" id="passInput" placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó" autofocus autocomplete="current-password">
    <div class="error-msg" id="error"></div>

    <button class="btn-login" id="loginBtn" onclick="doLogin()">┘ê╪▒┘ê╪» ╪¿┘ç ┘╛┘å┘ä</button>
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
        err.textContent = 'Γ¥î ┘ä╪╖┘ü╪º┘ï ╪▒┘à╪▓ ╪╣╪¿┘ê╪▒ ╪▒╪º ┘ê╪º╪▒╪» ┌⌐┘å█î╪»';
        err.classList.add('visible');
        return;
      }

      err.classList.remove('visible');
      btn.textContent = '╪»╪▒ ╪¡╪º┘ä ╪¿╪▒╪▒╪│█î...';
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
          err.textContent = 'Γ¥î ╪▒┘à╪▓ ╪╣╪¿┘ê╪▒ ╪º╪┤╪¬╪¿╪º┘ç ╪º╪│╪¬';
          err.classList.add('visible');
          input.value = '';
          input.focus();
        }
      } catch (e) {
        showToast('Γ¥î ╪«╪╖╪º ╪»╪▒ ╪¿╪▒┘é╪▒╪º╪▒█î ╪º╪▒╪¬╪¿╪º╪╖ ╪¿╪º ╪│╪▒┘ê╪▒');
      } finally {
        btn.textContent = '┘ê╪▒┘ê╪» ╪¿┘ç ┘╛┘å┘ä';
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
  </script>
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
  <title>┘å╪╡╪¿ ┘ê ╪▒╪º┘çΓÇî╪º┘å╪»╪º╪▓█î ┘╛┘å┘ä ┘╛┘å┘ç╪º┘å</title>
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
    <h1>ΓÜÖ∩╕Å ┘å╪╡╪¿ ┘ê ╪▒╪º┘çΓÇî╪º┘å╪»╪º╪▓█î ┘ê╪▒┌⌐╪▒</h1>
    <p style="text-align:center; font-size:14px; color:var(--text-muted); margin-bottom:25px;">
      ╪¿╪▒╪º█î ╪╣┘à┘ä┌⌐╪▒╪» ╪╡╪¡█î╪¡ ┘╛╪▒┘ê┌⌐╪│█î╪î ┘ê╪╢╪╣█î╪¬ ┘à╪¬╪║█î╪▒┘ç╪º█î ╪▓█î╪▒ ╪▒╪º ╪»╪▒ ╪¬┘å╪╕█î┘à╪º╪¬ ┌⌐┘ä╪º╪»┘ü┘ä╪▒ ╪¿╪▒╪▒╪│█î ┌⌐┘å█î╪».
    </p>

    <div class="status-box">
      <!-- KV Check -->
      <div class="item">
        <div>
          <div class="item-title">┘ü╪╢╪º█î ╪░╪«█î╪▒┘çΓÇî╪│╪º╪▓█î KV <span class="code">nahan</span></div>
          <div class="desc">╪¿╪▒╪º█î ╪░╪«█î╪▒┘ç ╪¬┘å╪╕█î┘à╪º╪¬ ┘╛┘å┘ä ╪º┘ä╪▓╪º┘à█î ╪º╪│╪¬. ╪»╪▒ ╪¿╪«╪┤ Bindings ┌⌐┘ä╪º╪»┘ü┘ä╪▒ █î┌⌐ KV ╪¿╪│╪º╪▓█î╪» ┘ê ┘å╪º┘à ╪ó┘å ╪▒╪º ╪»┘é█î┘é╪º┘ï <span class="code">nahan</span> ╪¿┌»╪░╪º╪▒█î╪».</div>
        </div>
        <div class="badge ${hasKV ? 'ok' : 'fail'}">${hasKV ? '┘à╪¬╪╡┘ä ╪┤╪» Γ£à' : '┘à╪¬╪╡┘ä ┘å█î╪│╪¬ Γ¥î'}</div>
      </div>
      
      <!-- Password Check -->
      <div class="item">
        <div>
          <div class="item-title">╪▒┘à╪▓ ╪╣╪¿┘ê╪▒ ╪º╪»┘à█î┘å <span class="code">PASSWORD</span></div>
          <div class="desc">╪¿╪▒╪º█î ╪º┘à┘å█î╪¬ ┘╛┘å┘ä ╪º┘ä╪▓╪º┘à█î ╪º╪│╪¬. █î┌⌐ ┘à╪¬╪║█î╪▒ ┘à╪¡█î╪╖█î ╪¿┘ç ┘å╪º┘à <span class="code">PASSWORD</span> ╪»╪▒ ┌⌐┘ä╪º╪»┘ü┘ä╪▒ ╪¿╪│╪º╪▓█î╪».</div>
        </div>
        <div class="badge ${hasPassword ? 'ok' : 'fail'}">${hasPassword ? '╪¬┘å╪╕█î┘à ╪┤╪»┘ç Γ£à' : '╪¬┘å╪╕█î┘à ┘å╪┤╪»┘ç Γ¥î'}</div>
      </div>

      <!-- UUID Check -->
      <div class="item">
        <div>
          <div class="item-title">╪┤┘å╪º╪│┘ç ┌⌐╪º╪▒╪¿╪▒ <span class="code">UUID</span></div>
          <div class="desc">╪┤┘à╪º ╪¿╪º█î╪» █î┌⌐ UUID ┘à╪╣╪¬╪¿╪▒ (┘à╪¬╪║█î╪▒ ┘à╪¡█î╪╖█î <span class="code">UUID</span>) ╪»╪▒ ┌⌐┘ä╪º╪»┘ü┘ä╪▒ ╪¬┘å╪╕█î┘à ┌⌐┘å█î╪». ${currentUUID ? `┘à┘é╪»╪º╪▒ ┘ü╪╣┘ä█î: <span class="code">${currentUUID}</span>` : ''}</div>
        </div>
        <div class="badge ${hasUUID ? 'ok' : 'fail'}">${hasUUID ? '╪¬┘å╪╕█î┘à ╪┤╪»┘ç Γ£à' : '╪¬┘å╪╕█î┘à ┘å╪┤╪»┘ç Γ¥î'}</div>
      </div>

      <!-- Trojan Pass Check -->
      <div class="item">
        <div>
          <div class="item-title">╪▒┘à╪▓ ╪╣╪¿┘ê╪▒ ╪¬╪▒┘ê╪¼╪º┘å <span class="code">TR_PASS</span></div>
          <div class="desc">╪▒┘à╪▓ ╪¬╪▒┘ê╪¼╪º┘å ╪º╪¼╪¿╪º╪▒█î ╪º╪│╪¬ (┘à╪¬╪║█î╪▒ ┘à╪¡█î╪╖█î <span class="code">TR_PASS</span>). ╪¿╪▒╪º█î ╪¼┘ä┘ê┌»█î╪▒█î ╪º╪▓ ╪┤┘å╪º╪│╪º█î█î ╪┤╪»┘å ╪¬┘ê╪│╪╖ ┌⌐┘ä╪º╪»┘ü┘ä╪▒ ╪¿╪º█î╪» ╪¿╪º UUID ┘à╪¬┘ü╪º┘ê╪¬ ╪¿╪º╪┤╪».</div>
        </div>
        <div class="badge ${hasTrPass ? 'ok' : 'fail'}">${hasTrPass ? '╪¬┘å╪╕█î┘à ╪┤╪»┘ç Γ£à' : '╪¬┘å╪╕█î┘à ┘å╪┤╪»┘ç Γ¥î'}</div>
      </div>

      <!-- Proxy IP Check -->
      <div class="item">
        <div>
          <div class="item-title">╪ó█îΓÇî┘╛█î ┘╛╪▒┘ê┌⌐╪│█î <span class="code">PROXYIP</span></div>
          <div class="desc">┘à┘é╪»╪º╪▒ ┘ü╪╣┘ä█î: ${currentProxyIP ? '<span class="code">'+currentProxyIP+'</span>' : '┘å╪»╪º╪▒╪»'}. ┘à╪¬╪║█î╪▒ ┘à╪¡█î╪╖█î <span class="code">PROXYIP</span> ╪¿╪▒╪º█î ╪»┘ê╪▒ ╪▓╪»┘å ┘à╪¡╪»┘ê╪»█î╪¬ ╪¿╪▒╪«█î ╪│╪º█î╪¬ΓÇî┘ç╪º.</div>
        </div>
        <div class="badge info">╪º╪«╪¬█î╪º╪▒█î Γä╣∩╕Å</div>
      </div>
    </div>

    ${allGood ? `
    <div class="links-box">
      <h3>Γ£à ╪│█î╪│╪¬┘à ┌⌐╪º┘à┘ä╪º┘ï ╪ó┘à╪º╪»┘ç ╪º╪│╪¬!</h3>
      <div class="desc" style="color:var(--text);">
        ╪º╪▓ ╪º█î┘å ┘╛╪│ ╪¿╪º ╪¿╪º╪▓ ┌⌐╪▒╪»┘å ╪ó╪»╪▒╪│ ╪º╪╡┘ä█î ┘ê╪▒┌⌐╪▒╪î ╪╡┘ü╪¡┘ç ╪¼╪╣┘ä█î Nginx ╪▒╪º ╪«┘ê╪º┘ç█î╪» ╪»█î╪» ╪¬╪º ╪º╪│╪¬╪¬╪º╪▒ ╪¡┘ü╪╕ ╪┤┘ê╪».<br><br>
        ≡ƒöù <strong>╪ó╪»╪▒╪│ ┘ê╪▒┘ê╪» ╪¿┘ç ┘╛┘å┘ä ╪┤┘à╪º:</strong><br><span class="code" style="color:#a78bfa;">/\x24{currentUUID}</span><br><br>
        ≡ƒöù <strong>╪ó╪»╪▒╪│ ┘ä█î┘å┌⌐ ╪│╪º╪¿╪│┌⌐╪▒╪º█î┘╛ ╪┤┘à╪º:</strong><br><span class="code" style="color:#a78bfa;">/\x24{currentUUID}/sub</span><br>
      </div>
    </div>
    ` : `
    <div style="text-align:center; margin-top:20px; color:var(--warning); font-size:14px; font-weight: 500;">
      ΓÜá∩╕Å ╪¬╪º ╪▓┘à╪º┘å█î ┌⌐┘ç ┘à┘ê╪º╪▒╪» ╪º┘ä╪▓╪º┘à█î (KV ┘ê Password) ╪▒╪º ╪¬┘å╪╕█î┘à ┘å┌⌐┘å█î╪»╪î ╪º┘à┘å█î╪¬ ┘ê ╪╣┘à┘ä┌⌐╪▒╪» ┘╛╪▒┘ê┌⌐╪│█î ╪┤┘à╪º ┌⌐╪º┘à┘ä ┘å╪«┘ê╪º┘ç╪» ╪¿┘ê╪»!
    </div>
    `}
  </div>
</body>
</html>`;
}























function subscriptionPage(hostname, user, vlessWS, trojanWS) {
  const subLink = `https://${hostname}/${user.id}/sub`;
  const name = user.name || 'کاربر بدون نام';
  
  // محاسبه گراف مصرف
  const limit = user.limit_bytes || 0;
  const used = user.used_bytes || 0;
  let percent = 0;
  let usageText = "نامحدود";
  
  const formatBytes = (b) => {
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + " MB";
    return (b / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };
  
  if (limit > 0) {
    percent = Math.min(100, Math.round((used / limit) * 100));
    usageText = `${formatBytes(used)} / ${formatBytes(limit)}`;
  } else {
    usageText = `${formatBytes(used)} (بدون سقف)`;
  }
  
  let daysLeftText = "نامحدود";
  if (user.expiry_date > 0) {
     const diff = user.expiry_date - Date.now();
     if (diff < 0) {
       daysLeftText = "منقضی شده";
     } else {
       const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
       daysLeftText = days + " روز";
     }
  }

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>پروفایل نهان - ${name}</title>
  <style>
    @import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');
    :root { --bg: #0f111a; --card: rgba(22, 24, 38, 0.7); --border: rgba(255, 255, 255, 0.08); --accent: #8b5cf6; --text: #f8fafc; --muted: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Vazirmatn, sans-serif; }
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
    <div class="status-badge ${user.enabled ? '' : 'disabled'}">${user.enabled ? '🟢 فعال' : '🔴 مسدود'}</div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div style="font-size: 12px; color: var(--muted)">ترافیک مصرفی</div>
        <div class="stat-val">${usageText}</div>
        <div class="progress-bar-bg"><div class="progress-bar-fill"></div></div>
      </div>
      <div class="stat-card">
        <div style="font-size: 12px; color: var(--muted)">اعتبار زمانی</div>
        <div class="stat-val">${daysLeftText}</div>
      </div>
    </div>
    
    <div class="config-box">
      <div class="config-title">VLESS WS</div>
      <button class="btn-copy" onclick="navigator.clipboard.writeText('${vlessWS}')">کپی</button>
      <div class="config-val">${vlessWS.substring(0, 50)}...</div>
    </div>
    <div class="config-box">
      <div class="config-title">Trojan WS</div>
      <button class="btn-copy" onclick="navigator.clipboard.writeText('${trojanWS}')">کپی</button>
      <div class="config-val">${trojanWS.substring(0, 50)}...</div>
    </div>
    
    <button class="btn-sub" onclick="navigator.clipboard.writeText('${subLink}')">کپی لینک سابسکرایب (بدون فیلتر)</button>
  </div>
</body>
</html>`;
}


function panelPage(hostname, adminUUID) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>پنل مدیریت نهان</title>
  <style>
    @import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');
    :root { --bg: #09090b; --surface: #18181b; --surface-hover: #27272a; --border: #27272a; --primary: #a855f7; --primary-hover: #9333ea; --text: #fafafa; --muted: #a1a1aa; --danger: #ef4444; --success: #10b981; }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: Vazirmatn, sans-serif; }
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
    <div class="brand">نهان</div>
    <div class="nav-item active" onclick="nav('users')"><span class="nav-icon">👥</span> کاربران</div>
    <div class="nav-item" onclick="nav('api')"><span class="nav-icon">🔑</span> توکن‌های API</div>
    <div class="nav-item" onclick="nav('settings')"><span class="nav-icon">⚙️</span> تنظیمات سیستم</div>
    <div style="flex:1"></div>
    <div class="nav-item" onclick="window.location.href='/'" style="color:var(--danger)"><span class="nav-icon">🚪</span> خروج</div>
  </div>

  <!-- Main -->
  <div class="main">
  
    <!-- Users Page -->
    <div id="page-users" class="page active">
      <div class="header">
        <h2 class="title">مدیریت کاربران</h2>
        <button class="btn" onclick="openModal('user-modal')">+ افزودن کاربر جدید</button>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>نام</th>
              <th>UUID</th>
              <th>وضعیت</th>
              <th>مصرف</th>
              <th>مهلت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            <tr><td colspan="6" style="text-align:center; padding: 40px; color:var(--muted)">در حال دریافت...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- API Page -->
    <div id="page-api" class="page">
      <div class="header">
        <h2 class="title">توکن‌های API</h2>
        <button class="btn" onclick="openModal('token-modal')">+ ساخت توکن جدید</button>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>نام ربات/توکن</th>
              <th>کلید (Key)</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody id="tokens-tbody">
          </tbody>
        </table>
      </div>
      
      <div class="docs-box">
        <h3>داکیومنت اتصال API</h3>
        <p style="color:var(--muted); margin-top:8px; font-size:14px;">با استفاده از کلیدهای بالا می‌توانید از طریق ربات تلگرام یا هر نرم‌افزار دیگری، کاربران را مدیریت کنید.</p>
        <pre>
# ساخت کاربر جدید
curl -X POST https://${hostname}/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"UUID", "name":"User1", "limit_bytes": 10737418240, "expiry_date": 1712...}'

# گرفتن لیست کاربران
curl -X GET https://${hostname}/api/users -H "Authorization: Bearer YOUR_TOKEN"
        </pre>
      </div>
    </div>
    
    <!-- Settings Page -->
    <div id="page-settings" class="page">
      <div class="header">
        <h2 class="title">تنظیمات کلی</h2>
        <button class="btn" onclick="saveSettings()">ذخیره تغییرات</button>
      </div>
      
      <div style="background:var(--surface); border:1px solid var(--border); padding:24px; border-radius:12px; max-width: 600px;">
        <div class="form-group">
          <label>UUID ادمین (برای ورود به پنل)</label>
          <input type="text" class="form-control" id="st-uuid" value="${adminUUID}">
        </div>
        <div class="form-group">
          <label>رمز عبور پنل</label>
          <input type="password" class="form-control" id="st-pass" placeholder="برای عدم تغییر خالی بگذارید">
        </div>
        <div class="form-group">
          <label>آی‌پی پروکسی پیش‌فرض (Proxy IP)</label>
          <input type="text" class="form-control" id="st-proxy" placeholder="مثال: 1.2.3.4">
        </div>
      </div>
    </div>
    
  </div>

  <!-- Modals -->
  <div class="modal-overlay" id="user-modal">
    <div class="modal">
      <div class="modal-header">
        <h3 id="user-modal-title">افزودن کاربر</h3>
        <div class="modal-close" onclick="closeModal('user-modal')">&times;</div>
      </div>
      <div class="form-group">
        <label>نام کاربر</label>
        <input type="text" id="u-name" class="form-control" placeholder="مثال: Ali iPhone">
      </div>
      <div class="form-group" style="display:flex; gap:8px;">
        <div style="flex:1">
          <label>UUID (شناسه یکتا)</label>
          <input type="text" id="u-uuid" class="form-control" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
        </div>
        <div style="align-self: flex-end;">
          <button class="btn btn-outline" onclick="generateUUID()">تولید</button>
        </div>
      </div>
      <div class="form-group">
        <label>محدودیت حجم (GB) - 0 برای نامحدود</label>
        <input type="number" id="u-limit" class="form-control" value="0">
      </div>
      <div class="form-group">
        <label>اعتبار زمانی (روز) - 0 برای نامحدود</label>
        <input type="number" id="u-days" class="form-control" value="0">
      </div>
      <div class="form-group">
        <label>Clean IP اختصاصی (اختیاری)</label>
        <input type="text" id="u-cleanip" class="form-control" placeholder="آی‌پی تمیز کلادفلر">
      </div>
      <button class="btn" style="width:100%; margin-top:16px;" onclick="saveUser()">ذخیره کاربر</button>
    </div>
  </div>

  <div class="modal-overlay" id="token-modal">
    <div class="modal">
      <div class="modal-header">
        <h3>افزودن توکن API</h3>
        <div class="modal-close" onclick="closeModal('token-modal')">&times;</div>
      </div>
      <div class="form-group">
        <label>نام ربات یا توکن</label>
        <input type="text" id="t-name" class="form-control" placeholder="مثال: Telegram Bot">
      </div>
      <div class="form-group" style="display:flex; gap:8px;">
        <div style="flex:1">
          <label>توکن</label>
          <input type="text" id="t-key" class="form-control">
        </div>
        <div style="align-self: flex-end;">
          <button class="btn btn-outline" onclick="document.getElementById('t-key').value = crypto.randomUUID().replace(/-/g, '')">تولید</button>
        </div>
      </div>
      <button class="btn" style="width:100%; margin-top:16px;" onclick="saveToken()">ایجاد توکن</button>
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
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#a1a1aa">کاربری یافت نشد</td></tr>';
          return;
        }
        data.users.forEach(u => {
          let usage = u.limit_bytes ? \`\${formatBytes(u.used_bytes)} / \${formatBytes(u.limit_bytes)}\` : \`\${formatBytes(u.used_bytes)} (∞)\`;
          let days = '∞';
          if (u.expiry_date) {
            let left = Math.ceil((u.expiry_date - Date.now()) / 86400000);
            days = left < 0 ? 'منقضی' : left + ' روز';
          }
          let statusBadge = u.enabled ? '<span class="badge green">فعال</span>' : '<span class="badge red">مسدود</span>';
          
          tbody.innerHTML += \`<tr>
            <td style="font-weight:600">\${u.name}</td>
            <td><span class="code-span">\${u.id.substring(0,8)}...</span></td>
            <td>\${statusBadge}</td>
            <td style="direction:ltr; text-align:right">\${usage}</td>
            <td>\${days}</td>
            <td>
              <div class="flex-gap">
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="toggleUser('\${u.id}')">\${u.enabled ? 'مسدود' : 'آزادسازی'}</button>
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="window.open('https://\${hostname}/\${u.id}/sub', '_blank')">لینک ساب</button>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:11px" onclick="deleteUser('\${u.id}')">🗑️</button>
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
       
       if (!id || !name) { alert("وارد کردن نام و UUID الزامی است!"); return; }
       
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
       if(confirm('آیا مطمئن هستید؟')) {
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
            <td><button class="btn btn-danger" style="padding:4px 8px" onclick="deleteToken('\${t.key}')">حذف</button></td>
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
       alert('تنظیمات با موفقیت ذخیره شد.');
    }

    // Init
    loadUsers();
    loadTokens();
  </script>
</body>
</html>`;
}


export { nginxPage, loginPage, subscriptionPage, panelPage, setupPage };

// HTML Templates for the Penhan Worker

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
  <title>ورود به پنل مدیریت</title>
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
    <div class="icon-wrapper">🔒</div>
    <h1>پنل مدیریت نهان</h1>
    <p class="subtitle">برای ورود به بخش مدیریت، رمز عبور را وارد کنید</p>
    
    <input type="password" class="input-field" id="passInput" placeholder="••••••••" autofocus autocomplete="current-password">
    <div class="error-msg" id="error"></div>

    <button class="btn-login" id="loginBtn" onclick="doLogin()">ورود به پنل</button>
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
        err.textContent = '❌ لطفاً رمز عبور را وارد کنید';
        err.classList.add('visible');
        return;
      }

      err.classList.remove('visible');
      btn.textContent = 'در حال بررسی...';
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
          err.textContent = '❌ رمز عبور اشتباه است';
          err.classList.add('visible');
          input.value = '';
          input.focus();
        }
      } catch (e) {
        showToast('❌ خطا در برقراری ارتباط با سرور');
      } finally {
        btn.textContent = 'ورود به پنل';
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

function subscriptionPage(hostname, uuid, currentTrPass, currentCleanIP, currentVlessPath, currentTrojanPath) {
  const addr = currentCleanIP || hostname;
  const vlessPath = currentVlessPath || '/?ed=2048';
  const trojanPath = currentTrojanPath || `/${uuid}/trojan-ws`;

  const vlessWS = `vless://${uuid}@${addr}:443?encryption=none&security=tls&sni=${hostname}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${hostname}&path=${encodeURIComponent(vlessPath)}#VLESS-WS-${hostname}`;
  const trojanWS = `trojan://${currentTrPass}@${addr}:443?security=tls&sni=${hostname}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${hostname}&path=${encodeURIComponent(trojanPath)}#Trojan-WS-${hostname}`;
  
  const subLink = `https://${hostname}/${uuid}/sub`;

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>پروفایل اتصال نهان</title>
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>
  <div class="sub-container">
    <div class="header">
      <div class="header-logo">🛰️</div>
      <div class="header-title">پروفایل اتصال نهان (Nahan)</div>
      <div>
        <span class="status-badge">
          <span class="status-dot"></span>
          اشتراک شما فعال است
        </span>
      </div>
    </div>

    <div class="sub-link-card">
      <div class="sub-label">🔗 لینک سابسکرایب مستقیم (جهت وارد کردن در نرم‌افزار):</div>
      <div class="sub-input-group">
        <div class="sub-url" id="subUrl">${subLink}</div>
        <button class="btn-action" onclick="copyText('subUrl', this)">📋 کپی لینک</button>
      </div>
    </div>

    <div class="section-title">🚀 کانفیگ‌های فعال شما (Configs):</div>

    <div class="config-card">
      <span class="config-tag">VLESS WS</span>
      <div class="config-title">🚀 VLESS over Custom WebSocket</div>
      <div class="config-link-container" id="link-vlessWS">${vlessWS}</div>
      <div class="config-actions">
        <button class="btn-config btn-copy-link" onclick="copyText('link-vlessWS', this)">📋 کپی لینک</button>
        <button class="btn-config btn-qr" onclick="showQR('${vlessWS}', 'VLESS WS')">🔍 نمایش QR</button>
      </div>
      <div class="config-obfuscation-box">
        <div class="obf-header">💡 پارامترهای دور زدن فیلترینگ کلاینت (Custom WS Headers):</div>
        <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${hostname}</span></div>
        <div class="obf-item"><strong>Path:</strong> <span class="obf-val">${vlessPath}</span></div>
        <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
      </div>
    </div>

    <div class="config-card">
      <span class="config-tag">Trojan WS</span>
      <div class="config-title">🔑 Trojan over Custom WebSocket</div>
      <div class="config-link-container" id="link-trojanWS">${trojanWS}</div>
      <div class="config-actions">
        <button class="btn-config btn-copy-link" onclick="copyText('link-trojanWS', this)">📋 کپی لینک</button>
        <button class="btn-config btn-qr" onclick="showQR('${trojanWS}', 'Trojan WS')">🔍 نمایش QR</button>
      </div>
      <div class="config-obfuscation-box">
        <div class="obf-header">💡 پارامترهای دور زدن فیلترینگ کلاینت (Custom WS Headers):</div>
        <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${hostname}</span></div>
        <div class="obf-item"><strong>Path:</strong> <span class="obf-val">${trojanPath}</span></div>
        <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
      </div>
    </div>

    <div class="footer">
      طراحی شده برای عبور از محدودیت‌ها و حفظ آزادی اینترنت ❤️
    </div>
  </div>

  <div class="modal" id="qrModal">
    <div class="modal-content">
      <div class="modal-title" id="modalTitle">کد QR اتصال</div>
      <div id="qrContainer" class="qr-img" style="background:white; padding:10px; border-radius:10px; display:inline-block;"></div>
      <button class="btn-close" onclick="closeModal()">بستن پنجره</button>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    function copyText(elementId, btn) {
      const text = document.getElementById(elementId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 با موفقیت کپی شد!');
        const prev = btn.textContent;
        btn.textContent = '✅ کپی شد!';
        setTimeout(() => { btn.textContent = prev; }, 2000);
      }).catch(() => {
        showToast('❌ خطا در کپی کردن', true);
      });
    }

    function showQR(link, title) {
      const modal = document.getElementById('qrModal');
      const modalTitle = document.getElementById('modalTitle');
      const qrImage = document.getElementById('qrImage');
      
      modalTitle.textContent = 'کد QR برای: ' + title;
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
  </script>
</body>
</html>`;
}

function panelPage(hostname, uuid, currentTrPass, currentCleanIP, currentProxyIP, currentVlessPath, currentTrojanPath, hasPass, cfColo = 'N/A', tlsVersion = 'N/A') {
  const addr = currentCleanIP || hostname;
  
  const vlessPath = currentVlessPath || '/?ed=2048';
  const trojanPath = currentTrojanPath || `/${uuid}/trojan-ws`;

  const vlessWS = `vless://${uuid}@${addr}:443?encryption=none&security=tls&sni=${hostname}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${hostname}&path=${encodeURIComponent(vlessPath)}#VLESS-WS-${hostname}`;
  const trojanWS = `trojan://${currentTrPass}@${addr}:443?security=tls&sni=${hostname}&fp=chrome&insecure=0&allowInsecure=0&type=ws&host=${hostname}&path=${encodeURIComponent(trojanPath)}#Trojan-WS-${hostname}`;

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>داشبورد مدیریت نهان</title>
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>
  <div class="toast" id="toast"></div>

  <!-- QR Code Modal -->
  <div class="modal" id="qrModal">
    <div class="modal-content">
      <div class="modal-title" id="modalTitle">کد QR کانفیگ</div>
      <div class="qr-container">
        <div id="qrContainer" class="qr-image" style="background:white; padding:10px; border-radius:10px; display:inline-block; margin: 0 auto;"></div>
      </div>
      <button class="btn-modal-close" onclick="closeModal()">بستن پنجره</button>
    </div>
  </div>

  <div class="container">
    <div class="header">
      <div class="badge-status">ورکر فعال</div>
      <h1>پنل مدیریت نهان</h1>
      <p>مدیریت پروکسی‌ها، آی‌پی تمیز و روتینگ ترافیک</p>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-nav">
      <button class="tab-btn active" onclick="switchTab('dashboard')">📊 پیشخوان</button>
      <button class="tab-btn" onclick="switchTab('configs')">🔗 کانفیگ‌ها</button>
      <button class="tab-btn" onclick="switchTab('settings')">⚙️ تنظیمات</button>
      <button class="tab-btn" onclick="switchTab('system')">🖥️ سیستم</button>
    </div>

    <!-- Tab 1: Dashboard -->
    <div class="tab-content active" id="tab-dashboard">
      <div class="grid-2">
        <div class="stat-card">
          <div class="stat-title">آی‌پی تمیز فعال</div>
          <div class="stat-val" id="statCleanIP">${currentCleanIP || 'استفاده از دامنه ورکر'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">وضعیت پروکسی آی‌پی</div>
          <div class="stat-val" id="statProxyIP">${currentProxyIP || 'اتصال مستقیم (بدون پروکسی)'}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="stat-card">
          <div class="stat-title">دیتاسنتر کلادفلر (Colo)</div>
          <div class="stat-val">${cfColo}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">نسخه TLS مرورگر</div>
          <div class="stat-val">${tlsVersion}</div>
        </div>
      </div>

      <!-- Subscription Link Card -->
      <div class="stat-card" style="margin-bottom: 20px; border: 1px solid rgba(139, 92, 246, 0.2);">
        <div class="stat-title" style="color: #c084fc; font-weight: 800; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>🌐</span> لینک سابسکرایب مستقیم (Subscription URL)
        </div>
        <div class="stat-desc" style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; text-align: right; direction: rtl;">
          این لینک را کپی کرده و در کلاینت خود (v2rayNG, Hiddify, Shadowrocket) وارد کنید تا همه‌ی کانفیگ‌ها به صورت خودکار اضافه و آپدیت شوند.
        </div>
        <div class="sub-input-group" style="display: flex; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 12px; padding: 6px; align-items: center; gap: 6px;">
          <div id="lblSubLink" style="flex: 1; font-family: Vazirmatn, Tahoma, sans-serif; font-size: 11px; color: #a5b4fc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 10px; direction: ltr; text-align: left;">https://${hostname}/${uuid}/sub</div>
          <button class="btn-save" style="margin: 0; padding: 8px 16px; font-size: 11px; border-radius: 8px;" onclick="copyLink('lblSubLink', this)">📋 کپی لینک</button>
        </div>
      </div>

      <div class="ping-box">
        <div class="stat-title" style="margin-bottom: 8px;">تست سرعت پاسخگویی (Latency Checker)</div>
        <button class="btn-save" onclick="checkLatency(this)">شروع تست پینگ</button>
        <div class="ping-results" id="pingResults" style="display: none;">
          <div class="ping-tag">گوگل: <span id="ping-google">--</span></div>
          <div class="ping-tag">کلادفلر: <span id="ping-cf">--</span></div>
          <div class="ping-tag">ورکر شما: <span id="ping-worker">--</span></div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Configs -->
    <div class="tab-content" id="tab-configs">
      <!-- VLESS WS -->
      <div class="config-card">
        <span class="config-tag">VLESS WS</span>
        <div class="config-title">🚀 VLESS over Custom WebSocket</div>
        <div class="config-link-container" id="link-vlessWS">${vlessWS}</div>
        <div class="config-actions">
          <button class="btn-config btn-copy-link" onclick="copyLink('link-vlessWS', this)">📋 کپی لینک</button>
          <button class="btn-config btn-qr" onclick="showQR('${vlessWS}', 'VLESS WS')">🔍 نمایش QR</button>
        </div>
        <div class="config-obfuscation-box">
          <div class="obf-header">💡 پارامترهای دور زدن فیلترینگ کلاینت (Custom WS Headers):</div>
          <div class="obf-item"><strong>Host:</strong> <span class="obf-val">${hostname}</span></div>
          <div class="obf-item"><strong>Path:</strong> <span class="obf-val" id="lblVlessPath">${vlessPath}</span></div>
          <div class="obf-item"><strong>User-Agent:</strong> <span class="obf-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36</span></div>
        </div>
      </div>

      <!-- Trojan WS -->
      <div class="config-card">
        <span class="config-tag">Trojan WS</span>
        <div class="config-title">🔑 Trojan over Custom WebSocket</div>
        <div class="config-link-container" id="link-trojanWS">${trojanWS}</div>
        <div class="config-actions">
          <button class="btn-config btn-copy-link" onclick="copyLink('link-trojanWS', this)">📋 کپی لینک</button>
          <button class="btn-config btn-qr" onclick="showQR('${trojanWS}', 'Trojan WS')">🔍 نمایش QR</button>
        </div>
        <div class="config-obfuscation-box">
          <div class="obf-header">💡 پارامترهای دور زدن فیلترینگ کلاینت (Custom WS Headers):</div>
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
        <div class="field-label">🛡️ دامنه/آی‌پی تمیز کلادفلر (Clean IP / Domain)</div>
        <div class="field-desc">این آدرس به عنوان آدرس اصلی (Address) در پروفایل کلاینت قرار می‌گیرد. در صورت خالی بودن، دامنه ورکر استفاده می‌شود.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputCleanIP" placeholder="مثال: clean.domain.com" value="${currentCleanIP}">
          <button class="btn-save" id="btnCleanIP" onclick="saveCleanIP()">ذخیره</button>
        </div>
        <div class="field-status" id="statusCleanIP">${currentCleanIP ? '✅ فعال: ' + currentCleanIP : '⚪ خالی — پیش‌فرض دامنه ورکر'}</div>
      </div>

      <!-- Proxy IP Config -->
      <div class="field-card">
        <div class="field-label">🔁 پروکسی آی‌پی پشت پرده (Proxy IP)</div>
        <div class="field-desc">پروکسی آی‌پی فقط برای دور زدن فیلترینگ در بک‌اند ورکر استفاده می‌شود و نباید در لینک کلاینت‌ها نمایش داده شود.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputProxyIP" placeholder="مثال: 1.1.1.1:443" value="${currentProxyIP}">
          <button class="btn-save" id="btnProxyIP" onclick="saveProxyIP()">ذخیره</button>
        </div>
        <div class="field-status" id="statusProxyIP">${currentProxyIP ? '✅ فعال: ' + currentProxyIP : '⚪ خالی — اتصال مستقیم'}</div>
      </div>

      <!-- Password Protection -->
      <div class="field-card">
        <div class="field-label">🔑 محافظت از پنل</div>
        <div class="field-desc">برای امنیت پنل, رمز عبوری وارد کنید. خالی گذاشتن رمز عبور، قفل پنل را برمیدارد.</div>
        <div class="field-input-group">
          <input type="password" class="field-input" id="inputPassword" placeholder="رمز عبور جدید">
          <button class="btn-save" id="btnPass" onclick="savePassword()">ذخیره</button>
        </div>
        <div class="field-status" id="statusPass">${hasPass ? '🔒 پنل دارای رمز عبور است' : '🔓 پنل بدون رمز عبور'}</div>
      </div>

      <!-- UUID Config -->
      <div class="field-card">
        <div class="field-label">🔑 شناسه کاربر (UUID)</div>
        <div class="field-desc">شناسه یکتای اتصال برای کاربر. دقت کنید با تغییر این شناسه، آدرس ورود به پنل شما تغییر می‌کند.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputUUID" placeholder="مثال: 86c50e3a-..." value="${uuid}">
          <button class="btn-save" id="btnUUID" onclick="saveUUID()">ذخیره</button>
        </div>
      </div>

      <!-- Trojan Pass Config -->
      <div class="field-card">
        <div class="field-label">🔐 رمز عبور تروجان (TR_PASS)</div>
        <div class="field-desc">رمز عبور مورد استفاده برای اتصال از طریق پروتکل تروجان.</div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputTrPass" placeholder="رمز جدید تروجان" value="${currentTrPass}">
          <button class="btn-save" id="btnTrPass" onclick="saveTrPass()">ذخیره</button>
        </div>
      </div>

      <!-- VLESS WS Path Config -->
      <div class="field-card">
        <div class="field-label">🛤️ مسیر اختصاصی VLESS WebSocket (Obfuscated Path)</div>
        <div class="field-desc">تغییر مسیر وب‌سوکت برای فریب فیلترینگ. پیش‌فرض: <code>/?ed=2048</code></div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputVlessPath" placeholder="مثال: /api/v3/telemetry" value="${currentVlessPath}">
          <button class="btn-save" id="btnVlessPath" onclick="saveVlessPath()">ذخیره</button>
        </div>
        <div class="field-status" id="statusVlessPath" style="font-family: Vazirmatn, Tahoma, sans-serif;">${currentVlessPath ? '✅ مسیر سفارشی: ' + currentVlessPath : '⚪ پیش‌فرض: /?ed=2048'}</div>
      </div>

      <!-- Trojan WS Path Config -->
      <div class="field-card">
        <div class="field-label">🛤️ مسیر اختصاصی Trojan WebSocket (Obfuscated Path)</div>
        <div class="field-desc">تغییر مسیر وب‌سوکت تروجان برای شبیه‌سازی ترافیک فایل. پیش‌فرض: <code>/${uuid}/trojan-ws</code></div>
        <div class="field-input-group">
          <input type="text" class="field-input" id="inputTrojanPath" placeholder="مثال: /assets/js/jquery.min.js" value="${currentTrojanPath}">
          <button class="btn-save" id="btnTrojanPath" onclick="saveTrojanPath()">ذخیره</button>
        </div>
        <div class="field-status" id="statusTrojanPath" style="font-family: Vazirmatn, Tahoma, sans-serif;">${currentTrojanPath ? '✅ مسیر سفارشی: ' + currentTrojanPath : '⚪ پیش‌فرض: /' + uuid + '/trojan-ws'}</div>
      </div>
    </div>

    <!-- Tab 4: System -->
    <div class="tab-content" id="tab-system">
      <div class="stat-card" style="margin-bottom: 12px;">
        <div class="stat-title">دامنه ورکر (Worker Host)</div>
        <div class="stat-val" id="valHost">${hostname}</div>
      </div>
      <div class="stat-card" style="margin-bottom: 12px;">
        <div class="stat-title">شناسه کاربر (UUID)</div>
        <div class="stat-val" id="valUuid">${uuid}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">حالت توسعه</div>
        <div class="stat-val" style="color: var(--success);">روشن (Active)</div>
      </div>

      <button class="btn-logout" onclick="logout()">🚪 خروج از پنل مدیریت</button>
    </div>

    <div class="footer">
      طراحی شده برای عبور از محدودیت‌ها و حفظ آزادی اینترنت ❤️
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
          showToast('✅ دامنه/آی‌پی تمیز با موفقیت ذخیره شد');
          status.textContent = data.cleanIP ? '✅ فعال: ' + data.cleanIP : '⚪ خالی — پیش‌فرض دامنه ورکر';
          statDash.textContent = data.cleanIP || 'استفاده از دامنه ورکر';
          updateLinks();
        } else {
          showToast('❌ خطایی رخ داد', true);
        }
      } catch(e) {
        showToast('❌ خطا در ارتباط با سرور', true);
      } finally {
        btn.textContent = 'ذخیره';
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
          showToast('✅ پروکسی آی‌پی با موفقیت ذخیره شد');
          status.textContent = data.proxyIP ? '✅ فعال: ' + data.proxyIP : '⚪ خالی — اتصال مستقیم';
          statDash.textContent = data.proxyIP || 'اتصال مستقیم (بدون پروکسی)';
        } else {
          showToast('❌ خطایی رخ داد', true);
        }
      } catch(e) {
        showToast('❌ خطا در ارتباط با سرور', true);
      } finally {
        btn.textContent = 'ذخیره';
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
          showToast(data.enabled ? '✅ رمز عبور با موفقیت تغییر کرد' : '🔓 رمز عبور با موفقیت حذف شد');
          status.textContent = data.enabled ? '🔒 پنل دارای رمز عبور است' : '🔓 پنل بدون رمز عبور';
          document.getElementById('inputPassword').value = '';
        } else {
          showToast('❌ خطایی رخ داد', true);
        }
      } catch(e) {
        showToast('❌ خطا در ارتباط با سرور', true);
      } finally {
        btn.textContent = 'ذخیره';
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
          showToast('✅ مسیر VLESS با موفقیت ذخیره شد');
          status.textContent = data.path ? '✅ مسیر سفارشی: ' + data.path : '⚪ پیش‌فرض: /?ed=2048';
          updateLinks();
        } else {
          showToast('❌ خطایی رخ داد', true);
        }
      } catch(e) {
        showToast('❌ خطا در ارتباط با سرور', true);
      } finally {
        btn.textContent = 'ذخیره';
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
          showToast('✅ شناسه کاربر با موفقیت تغییر کرد، در حال انتقال...');
          setTimeout(() => {
            window.location.href = '/' + val;
          }, 1500);
        } else {
          showToast('❌ UUID وارد شده نامعتبر است', true);
        }
      } catch(e) {
        showToast('❌ خطا در ارتباط با سرور', true);
      } finally {
        btn.textContent = 'ذخیره';
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
          showToast('✅ رمز تروجان با موفقیت تغییر کرد');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast('❌ خطایی رخ داد', true);
        }
      } catch(e) {
        showToast('❌ خطا در ارتباط با سرور', true);
      } finally {
        btn.textContent = 'ذخیره';
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
          showToast('✅ مسیر Trojan با موفقیت ذخیره شد');
          status.textContent = data.path ? '✅ مسیر سفارشی: ' + data.path : '⚪ پیش‌فرض: /' + uu + '/trojan-ws';
          updateLinks();
        } else {
          showToast('❌ خطایی رخ داد', true);
        }
      } catch(e) {
        showToast('❌ خطا در ارتباط با سرور', true);
      } finally {
        btn.textContent = 'ذخیره';
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
        showToast('📋 کانفیگ کپی شد!');
        const prevText = btn.textContent;
        btn.textContent = '✅ کپی شد!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        setTimeout(() => {
          btn.textContent = prevText;
          btn.style.background = 'var(--accent-gradient)';
        }, 2000);
      }).catch(() => {
        showToast('❌ خطایی در کپی لینک رخ داد', true);
      });
    }

    function showQR(link, title) {
      const modal = document.getElementById('qrModal');
      const modalTitle = document.getElementById('modalTitle');
      const qrImage = document.getElementById('qrImage');
      
      modalTitle.textContent = 'کد QR برای: ' + title;
      qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(link);
      modal.classList.add('show');
    }

    function closeModal() {
      document.getElementById('qrModal').classList.remove('show');
    }

    async function checkLatency(btn) {
      btn.disabled = true;
      btn.textContent = 'در حال تست پینگ...';
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
          span.textContent = 'خطا';
          span.style.color = '#ef4444';
        }
      }
      btn.disabled = false;
      btn.textContent = 'شروع مجدد تست پینگ';
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
  <title>نصب و راه‌اندازی پنل پنهان</title>
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
    <h1>⚙️ نصب و راه‌اندازی ورکر</h1>
    <p style="text-align:center; font-size:14px; color:var(--text-muted); margin-bottom:25px;">
      برای عملکرد صحیح پروکسی، وضعیت متغیرهای زیر را در تنظیمات کلادفلر بررسی کنید.
    </p>

    <div class="status-box">
      <!-- KV Check -->
      <div class="item">
        <div>
          <div class="item-title">فضای ذخیره‌سازی KV <span class="code">nahan</span></div>
          <div class="desc">برای ذخیره تنظیمات پنل الزامی است. در بخش Bindings کلادفلر یک KV بسازید و نام آن را دقیقاً <span class="code">nahan</span> بگذارید.</div>
        </div>
        <div class="badge ${hasKV ? 'ok' : 'fail'}">${hasKV ? 'متصل شد ✅' : 'متصل نیست ❌'}</div>
      </div>
      
      <!-- Password Check -->
      <div class="item">
        <div>
          <div class="item-title">رمز عبور ادمین <span class="code">PASSWORD</span></div>
          <div class="desc">برای امنیت پنل الزامی است. یک متغیر محیطی به نام <span class="code">PASSWORD</span> در کلادفلر بسازید.</div>
        </div>
        <div class="badge ${hasPassword ? 'ok' : 'fail'}">${hasPassword ? 'تنظیم شده ✅' : 'تنظیم نشده ❌'}</div>
      </div>

      <!-- UUID Check -->
      <div class="item">
        <div>
          <div class="item-title">شناسه کاربر <span class="code">UUID</span></div>
          <div class="desc">شما باید یک UUID معتبر (متغیر محیطی <span class="code">UUID</span>) در کلادفلر تنظیم کنید. ${currentUUID ? `مقدار فعلی: <span class="code">${currentUUID}</span>` : ''}</div>
        </div>
        <div class="badge ${hasUUID ? 'ok' : 'fail'}">${hasUUID ? 'تنظیم شده ✅' : 'تنظیم نشده ❌'}</div>
      </div>

      <!-- Trojan Pass Check -->
      <div class="item">
        <div>
          <div class="item-title">رمز عبور تروجان <span class="code">TR_PASS</span></div>
          <div class="desc">رمز تروجان اجباری است (متغیر محیطی <span class="code">TR_PASS</span>). برای جلوگیری از شناسایی شدن توسط کلادفلر باید با UUID متفاوت باشد.</div>
        </div>
        <div class="badge ${hasTrPass ? 'ok' : 'fail'}">${hasTrPass ? 'تنظیم شده ✅' : 'تنظیم نشده ❌'}</div>
      </div>

      <!-- Proxy IP Check -->
      <div class="item">
        <div>
          <div class="item-title">آی‌پی پروکسی <span class="code">PROXYIP</span></div>
          <div class="desc">مقدار فعلی: ${currentProxyIP ? '<span class="code">'+currentProxyIP+'</span>' : 'ندارد'}. متغیر محیطی <span class="code">PROXYIP</span> برای دور زدن محدودیت برخی سایت‌ها.</div>
        </div>
        <div class="badge info">اختیاری ℹ️</div>
      </div>
    </div>

    ${allGood ? `
    <div class="links-box">
      <h3>✅ سیستم کاملاً آماده است!</h3>
      <div class="desc" style="color:var(--text);">
        از این پس با باز کردن آدرس اصلی ورکر، صفحه جعلی Nginx را خواهید دید تا استتار حفظ شود.<br><br>
        🔗 <strong>آدرس ورود به پنل شما:</strong><br><span class="code" style="color:#a78bfa;">/\x24{currentUUID}</span><br><br>
        🔗 <strong>آدرس لینک سابسکرایپ شما:</strong><br><span class="code" style="color:#a78bfa;">/\x24{currentUUID}/sub</span><br>
      </div>
    </div>
    ` : `
    <div style="text-align:center; margin-top:20px; color:var(--warning); font-size:14px; font-weight: 500;">
      ⚠️ تا زمانی که موارد الزامی (KV و Password) را تنظیم نکنید، امنیت و عملکرد پروکسی شما کامل نخواهد بود!
    </div>
    `}
  </div>
</body>
</html>`;
}

export { nginxPage, loginPage, subscriptionPage, panelPage, setupPage };

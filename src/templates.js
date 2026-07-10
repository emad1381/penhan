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

function setupPage(hasD1, hasPassword, hasUUID, currentUUID, currentProxyIP) {
  const allGood = hasD1 && hasPassword && hasUUID;
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>راه‌اندازی پنل پنهان</title>
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
      <div class="logo-icon">🔮</div>
      <h1>راه‌اندازی پنل پنهان</h1>
      <div class="subtitle">برای شروع به کار پروکسی، وضعیت دیتابیس و متغیرها را بررسی و تنظیم کنید.</div>
    </div>

    <div class="card-list">
      <!-- Database Card -->
      <div class="variable-card">
        <div class="card-details">
          <div class="card-title">دیتابیس Cloudflare D1</div>
          <div class="desc">برای ذخیره‌سازی کاربران و تنظیمات سیستم الزامی است. نام بایندینگ دیتابیس را در کلادفلر دقیقاً <span class="code">DB</span> بگذارید.</div>
        </div>
        <div class="badge ${hasD1 ? 'ok' : 'fail'}">${hasD1 ? 'متصل شده' : 'متصل نیست'}</div>
      </div>
      
      <!-- Password Card -->
      <div class="variable-card">
        <div class="card-details">
          <div class="card-title">رمز عبور ادمین <span class="code">PANEL_PASSWORD</span></div>
          <div class="desc">جهت ورود به پنل مدیریت. یک متغیر محیطی با این نام در کلادفلر بسازید (پیشنهاد می‌شود آن را Encrypt کنید).</div>
        </div>
        <div class="badge ${hasPassword ? 'ok' : 'fail'}">${hasPassword ? 'تنظیم شده' : 'تنظیم نشده'}</div>
      </div>

      <!-- UUID Card -->
      <div class="variable-card">
        <div class="card-details">
          <div class="card-title">شناسه کاربر <span class="code">UUID</span></div>
          <div class="desc">شناسه پیش‌فرض سیستم. یک متغیر محیطی با نام <span class="code">UUID</span> در کلادفلر بسازید.<br>${currentUUID ? `مقدار فعلی: <span class="value-display">${currentUUID}</span>` : ''}</div>
        </div>
        <div class="badge ${hasUUID ? 'ok' : 'fail'}">${hasUUID ? 'تنظیم شده' : 'تنظیم نشده'}</div>
      </div>

      <!-- Proxy IP Card -->
      <div class="variable-card">
        <div class="card-details">
          <div class="card-title">آی‌پی پروکسی <span class="code">PROXYIP</span></div>
          <div class="desc">آی‌پی تمیز یا پروکسی پیش‌فرض. ${currentProxyIP ? `مقدار فعلی: <span class="value-display">${currentProxyIP}</span>` : 'تنظیم نشده.'}</div>
        </div>
        <div class="badge info">اختیاری</div>
      </div>
    </div>

    ${allGood ? `
    <div class="success-panel">
      <div class="success-title">🎉 سیستم کاملاً آماده است!</div>
      <div class="success-desc">پیکربندی‌ها تکمیل شد. از این پس با باز کردن آدرس ورکر، صفحه پیش‌فرض Nginx جهت استتار نشان داده خواهد شد.</div>
      <button class="action-btn" onclick="window.location.href='/panel'">🚪 ورود به پنل مدیریت</button>
    </div>
    ` : `
    <div class="warning-panel">
      ⚠️ تا زمانی که دیتابیس D1 و متغیرهای الزامی بالا را به درستی تنظیم نکنید، پنل مدیریت قابل استفاده نخواهد بود.
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
  
  let expiryAbsolute = "نامحدود";
  let expiryRelative = "∞";
  
  if (user.expiry_date > 0) {
    const d = new Date(user.expiry_date);
    const pad = (n) => n.toString().padStart(2, '0');
    expiryAbsolute = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    
    const diff = user.expiry_date - Date.now();
    if (diff < 0) {
      expiryRelative = "منقضی شده";
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) {
        expiryRelative = `${days} روز و ${hours} ساعت دیگر`;
      } else {
        expiryRelative = `${hours} ساعت دیگر`;
      }
    }
  }
  
  let statusClass = 'active';
  let statusText = 'فعال';
  let statusIcon = '<span style="font-size:10px;">●</span>';
  
  if (!user.enabled) {
    statusClass = 'banned';
    statusText = 'مسدود شده';
    statusIcon = '<span class="blink-icon" style="font-size:12px;">⚠️</span>';
  } else if (limit > 0 && used >= limit) {
    statusClass = 'disabled';
    statusText = 'غیر فعال (اتمام حجم)';
    statusIcon = '<span class="blink-icon" style="font-size:10px;">●</span>';
  } else if (user.expiry_date > 0 && Date.now() > user.expiry_date) {
    statusClass = 'disabled';
    statusText = 'غیر فعال (منقضی شده)';
    statusIcon = '<span class="blink-icon" style="font-size:10px;">●</span>';
  }

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>پروفایل نهان - ${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;800&family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
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
    <div class="user-avatar">👤</div>
    <h1>${name}</h1>
    <div class="status-badge ${statusClass}">
      ${statusIcon} ${statusText}
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">اعتبار زمانی</div>
        <div class="stat-val" style="font-size:14px; direction:ltr;">${expiryAbsolute}</div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">${expiryRelative}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">ترافیک مصرفی</div>
        <div class="stat-val">${usageText}</div>
      </div>
    </div>
    
    ${limit > 0 ? `
    <div class="usage-container">
      <div class="usage-header">
        <span style="color:var(--text-muted)">درصد مصرف</span>
        <span style="font-family: 'Outfit', sans-serif; font-weight:bold; color:#fff">${percent}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill"></div>
      </div>
    </div>
    ` : ''}
    
    <!-- Config Cards -->
    <div class="config-card">
      <div class="config-info">
        <div class="config-name">اتصال VLESS WS</div>
        <div class="config-desc">مناسب برای تمام سیستم‌عامل‌ها</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-copy" onclick="navigator.clipboard.writeText('${vlessWS}').then(() => alert('کانفیگ VLESS کپی شد'))">کپی کانفیگ</button>
        <button class="btn-qr" onclick="showQrModal('${vlessWS}', 'اتصال VLESS WS')" title="نمایش QR کد">
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
        <div class="config-name">اتصال TROJAN WS</div>
        <div class="config-desc">سازگار با کلاینت‌های محبوب</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-copy" onclick="navigator.clipboard.writeText('${trojanWS}').then(() => alert('کانفیگ Trojan کپی شد'))">کپی کانفیگ</button>
        <button class="btn-qr" onclick="showQrModal('${trojanWS}', 'اتصال TROJAN WS')" title="نمایش QR کد">
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
    
    <button class="btn-sub" onclick="navigator.clipboard.writeText('${subLink}').then(() => alert('لینک ساب کپی شد'))">کپی لینک ساب‌اسکرایب (Subscription Link)</button>
    <button class="btn-sub-qr" onclick="showQrModal('${subLink}', 'لینک ساب‌اسکرایب')">نمایش QR کد ساب‌اسکرایب</button>
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
      <button onclick="closeQrModal()" style="width:100%; padding:12px; background:rgba(255,255,255,0.06); border:1px solid var(--border); border-radius:12px; color:#fff; font-weight:700; cursor:pointer; transition:0.2s; outline:none;">بستن</button>
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
  </script>
</body>
</html>`;
}


function panelPage(hostname, adminUUID, defaultProxyIP, cfAccountId, cfApiToken) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>پنل مدیریت نهان</title>
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
    .nav-item { padding: 12px 24px; color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; font-weight: 500; }
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
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 50; padding: 24px; overflow-y: auto; }
    .modal-overlay.active { display: flex; }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 480px; padding: 24px; max-height: calc(100vh - 48px); overflow-y: auto; margin: auto; }

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
    <div class="nav-item" onclick="nav('proxyip')"><span class="nav-icon">🌐</span> مدیریت Proxy IP</div>
    <div class="nav-item" onclick="nav('api')"><span class="nav-icon">🔑</span> توکن‌های API</div>
    <div class="nav-item" onclick="nav('settings')"><span class="nav-icon">⚙️</span> تنظیمات سیستم</div>
    <div style="flex:1"></div>
    <a href="https://github.com/emad1381/penhan" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 12px 24px; color: var(--muted); text-decoration: none; transition: 0.2s; font-weight: 500;" class="github-link">
      <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" style="transition: transform 0.2s; vertical-align: middle;">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      <span>گیت‌هاب پروژه</span>
    </a>
    <div class="nav-item" onclick="window.location.href='/'" style="color:var(--danger)"><span class="nav-icon">🚪</span> خروج</div>
  </div>

  <!-- Main -->
  <div class="main">
  
    <!-- Users Page -->
    <div id="page-users" class="page active">
      <div class="header">
        <h2 class="title">مدیریت کاربران</h2>
        <button class="btn" onclick="openAddUserModal()">+ افزودن کاربر جدید</button>
      </div>
      
      <div class="dashboard-stats" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px;">
          <div style="font-size:12px; color:var(--muted)">تعداد کل کاربران</div>
          <div id="stat-total-users" style="font-size:22px; font-weight:bold; margin-top:8px;">0</div>
        </div>
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px;">
          <div style="font-size:12px; color:var(--muted)">کاربران فعال</div>
          <div id="stat-active-users" style="font-size:22px; font-weight:bold; margin-top:8px; color:var(--success)">0</div>
        </div>
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div style="font-size:12px; color:var(--muted); display:flex; align-items:center; gap:6px;">
              درخواست‌های امروز ورکر
              <span style="cursor:pointer; font-size:11px;" onclick="loadCfMetrics(); this.style.transform='rotate(360deg)'; setTimeout(()=>this.style.transform='', 300); transition='0.3s';" title="بروزرسانی">🔄</span>
            </div>
            <div id="stat-cf-reqs" style="font-size:18px; font-weight:bold; margin-top:8px;">در حال دریافت...</div>
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
          <input type="text" class="form-control" id="st-proxy" value="${defaultProxyIP || ''}" placeholder="مثال: 1.2.3.4">
        </div>
        <div class="form-group">
          <label>Cloudflare Account ID</label>
          <input type="text" class="form-control" id="st-cf-account" value="${cfAccountId || ''}" placeholder="مثال: 8e5f2...">
        </div>
        <div class="form-group">
          <label>Cloudflare API Token (با دسترسی Account Analytics: Read)</label>
          <input type="password" class="form-control" id="st-cf-token" value="${cfApiToken || ''}" placeholder="برای عدم تغییر خالی بگذارید">
        </div>
      </div>
    </div>
    
  </div>

      <!-- Proxy IP Manager Page -->
    <div id="page-proxyip" class="page">
      <div class="header">
        <h2 class="title">مدیریت Proxy IP</h2>
        <button class="btn" onclick="openModal('proxyip-add-modal')">+ افزودن Proxy IP</button>
      </div>

      <!-- Stats Cards -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px;">
          <div style="font-size:12px; color:var(--muted)">کل Proxy IPها</div>
          <div id="stat-total-proxyip" style="font-size:22px; font-weight:bold; margin-top:8px;">0</div>
        </div>
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px;">
          <div style="font-size:12px; color:var(--muted)">آی‌پی‌های فعال</div>
          <div id="stat-active-proxyip" style="font-size:22px; font-weight:bold; margin-top:8px; color:var(--success)">0</div>
        </div>
        <div class="stat-box-mini" style="background:var(--surface); border:1px solid var(--border); padding:16px; border-radius:12px;">
          <div style="font-size:12px; color:var(--muted); display:flex; align-items:center; gap:6px;">
            میانگین پینگ
            <span style="cursor:pointer; font-size:11px;" onclick="refreshAllProxyIP(); this.style.transform='rotate(360deg)'; setTimeout(()=>this.style.transform='', 300); transition='0.3s';" title="بروزرسانی">🔄</span>
          </div>
          <div id="stat-avg-ping" style="font-size:18px; font-weight:bold; margin-top:8px;">--</div>
        </div>
      </div>

      <!-- Filters & Actions -->
                  <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; align-items:center;">
                    <select id="proxyip-filter-country" class="form-control" style="width:auto; min-width:180px;" onchange="filterProxyIP()">
                      <option value="">🌍 همه کشورها</option>
                      <option value="IR">🇮🇷 ایران</option>
                      <option value="DE">🇩🇪 آلمان</option>
                      <option value="US">🇺🇸 آمریکا</option>
                      <option value="NL">🇳🇱 هلند</option>
                      <option value="FR">🇫🇷 فرانسه</option>
                      <option value="SG">🇸🇬 سنگاپور</option>
                      <option value="JP">🇯🇵 ژاپن</option>
                      <option value="TR">🇹🇷 ترکیه</option>
                    </select>
                    <select id="proxyip-filter-status" class="form-control" style="width:auto; min-width:150px;" onchange="filterProxyIP()">
                      <option value="">⚡ همه وضعیت‌ها</option>
                      <option value="active">✅ فعال</option>
                      <option value="slow">🐢 کند</option>
                      <option value="dead">❌ مرده</option>
                    </select>
                    <button class="btn btn-outline" onclick="refreshAllProxyIP()" style="display:flex; align-items:center; gap:6px;">
                      🔄 بروزرسانی همه
                    </button>
                    <button class="btn btn-outline" onclick="fetchProxyIPFromSources()" style="display:flex; align-items:center; gap:6px;">
                      ☁️ دریافت از منابع عمومی
                    </button>
                    <button class="btn btn-outline" onclick="detectCountriesForIPs()" style="display:flex; align-items:center; gap:6px;">
                      🌍 تشخیص کشورها
                    </button>
                    <div style="flex:1"></div>
                    <button class="btn" onclick="openModal('proxyip-import-modal')" style="display:flex; align-items:center; gap:6px;">
                      📥 وارد کردن لیست
                    </button>
                  </div>

            <!-- Selection Toolbar (appears when items selected) -->
            <div id="proxyip-selection-toolbar" style="display:none; gap:12px; margin-bottom:16px; padding:12px 16px; background:var(--surface); border:1px solid var(--border); border-radius:12px; align-items:center; flex-wrap:wrap;">
              <span id="proxyip-selected-count" style="font-weight:600; color:var(--primary);">۰ آی‌پی انتخاب شده</span>
              <div style="flex:1"></div>
              <button class="btn btn-outline" onclick="selectAllProxyIP(true)" style="font-size:12px;">✅ انتخاب همه</button>
              <button class="btn btn-outline" onclick="selectAllProxyIP(false)" style="font-size:12px;">❌ لغو انتخاب</button>
              <button class="btn btn-danger" onclick="deleteSelectedProxyIP()" style="display:flex; align-items:center; gap:6px; font-weight:600;">
                🗑️ حذف انتخاب‌ها (<span id="proxyip-toolbar-count">0</span>)
              </button>
            </div>

            <!-- Proxy IP Table -->
            <div class="table-container">
              <!-- Proxy IP Table -->
                    <div class="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th style="width:50px; text-align:center;">
                              <input type="checkbox" id="proxyip-select-all" onchange="toggleSelectAllProxyIP(this)" title="انتخاب/لغو همه آی‌پی‌های قابل مشاهده">
                            </th>
                            <th>آی‌پی / هاست</th>
                            <th>پورت</th>
                            <th>کشور / شهر</th>
                            <th>اسن / ISP</th>
                            <th>پینگ (ms)</th>
                            <th>وضعیت</th>
                            <th>آخرین چک</th>
                            <th>عملیات</th>
                          </tr>
                        </thead>
                        <tbody id="proxyip-tbody">
                          <tr><td colspan="9" style="text-align:center; padding: 40px; color:var(--muted)">در حال دریافت...</td></tr>
                        </tbody>
                      </table>
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
        <label>محدودیت اتصالات همزمان (Connection Limit) - 0 برای نامحدود</label>
        <input type="number" id="u-connlimit" class="form-control" value="0">
      </div>
      <div class="form-group">
        <label>تاریخ انقضا (برای نامحدود، خالی بگذارید)</label>
        <input type="datetime-local" id="u-expiry" class="form-control">
      </div>
      <div class="form-group">
        <label>Clean IP اختصاصی (اختیاری)</label>
        <input type="text" id="u-cleanip" class="form-control" placeholder="آی‌پی تمیز کلادفلر">
      </div>
      <div class="form-group">
        <label>Proxy IP اختصاصی (اختیاری - چندگانه با خط جدید/کاما جدا کنید)</label>
        <textarea id="u-proxyip" class="form-control" rows="2" placeholder="مثال: 1.2.3.4&#10;5.6.7.8"></textarea>
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
        
        const totalUsers = data.users.length;
        const activeUsers = data.users.filter(u => u.enabled).length;
        document.getElementById('stat-total-users').textContent = totalUsers;
        document.getElementById('stat-active-users').textContent = activeUsers;
        
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';
        if (data.users.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#a1a1aa">کاربری یافت نشد</td></tr>';
          return;
        }
        data.users.forEach(u => {
          let usage = u.limit_bytes ? \`\${formatBytes(u.used_bytes)} / \${formatBytes(u.limit_bytes)}\` : \`\${formatBytes(u.used_bytes)} (∞)\`;
          let expiryHTML = '<span style="color:#a1a1aa">نامحدود (∞)</span>';
          if (u.expiry_date) {
            const d = new Date(u.expiry_date);
            const pad = (n) => n.toString().padStart(2, '0');
            const abs = \`\${d.getFullYear()}/\${pad(d.getMonth() + 1)}/\${pad(d.getDate())} \${pad(d.getHours())}:\${pad(d.getMinutes())}\`;
            
            const diff = u.expiry_date - Date.now();
            let rel = '';
            let badgeClass = 'green';
            if (diff < 0) {
               rel = 'منقضی شده';
               badgeClass = 'red';
            } else {
               const days = Math.floor(diff / 86400000);
               const hours = Math.floor((diff % 86400000) / 3600000);
               rel = days > 0 ? \`\${days} روز و \${hours} ساعت\` : \`\${hours} ساعت\`;
            }
            
            expiryHTML = \`<div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
              <span style="font-size:12px; font-weight:600; direction:ltr;">\${abs}</span>
              <span class="badge \${badgeClass}" style="font-size:10px; padding:2px 6px;">\${rel}</span>
            </div>\`;
          }
          let statusBadge = u.enabled ? '<span class="badge green">فعال</span>' : '<span class="badge red">مسدود</span>';
          
          // Conn Limit label
          let connLimitLabel = u.conn_limit > 0 ? u.conn_limit : '∞';
          let activeConnsLabel = u.active_connections !== undefined ? u.active_connections : 0;
          let activeConnsColor = activeConnsLabel > 0 ? 'var(--success)' : 'var(--muted)';
          
          tbody.innerHTML += \`<tr>
            <td style="font-weight:600">
              \${u.name} 
              <span style="cursor:pointer; margin-right:6px;" onclick="editUser('\${u.id}', '\${u.name}', \${u.limit_bytes}, \${u.expiry_date}, '\${u.clean_ip}', \${u.conn_limit || 0}, '\${(u.proxy_ip || '').replace(/\\r?\\n/g, '\\\\n')}')">✏️</span>
            </td>
            <td><span class="code-span">\${u.id.substring(0,8)}...</span></td>
            <td>\${statusBadge} <span class="badge" style="color:\${activeConnsColor}; background:rgba(255,255,255,0.02)">👥 \${activeConnsLabel}/\${connLimitLabel}</span></td>
            <td style="direction:ltr; text-align:right">\${usage}</td>
            <td>\${expiryHTML}</td>
            <td>
              <div class="flex-gap">
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="toggleUser('\${u.id}')">\${u.enabled ? 'مسدود' : 'آزادسازی'}</button>
                <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="window.open('https://\${window.location.hostname}/\${u.id}/sub', '_blank')">لینک ساب</button>
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
       let connLimit = parseInt(document.getElementById('u-connlimit').value) || 0;
       const expiryVal = document.getElementById('u-expiry').value;
       const clean = document.getElementById('u-cleanip').value;
       const proxyip = document.getElementById('u-proxyip').value;
       
       if (!id || !name) { alert("وارد کردن نام و UUID الزامی است!"); return; }
       
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
       const cfAcc = document.getElementById('st-cf-account').value;
       const cfTok = document.getElementById('st-cf-token').value;
       const payload = { uuid: u, proxyIP: prox, cfAccountId: cfAcc, cfApiToken: cfTok };
       if (p) payload.password = p;
       
       await fetch(basePath + '/settings', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify(payload)
       });
       alert('تنظیمات با موفقیت ذخیره شد.');
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
      document.getElementById('user-modal-title').textContent = 'افزودن کاربر جدید';
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
      document.getElementById('user-modal-title').textContent = 'ویرایش کاربر';
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
            document.getElementById('stat-cf-reqs').innerHTML = '<span style="font-size:10px; color:var(--danger)">خطا: ' + data.error + '</span>';
          } else {
            document.getElementById('stat-cf-reqs').innerHTML = '<span style="font-size:10px; color:var(--muted)">تنظیم نشده (در تنظیمات)</span>';
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
        document.getElementById('proxyip-tbody').innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 40px; color:var(--muted);">خطا در بارگذاری: ' + e.message + '</td></tr>';
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

    function renderProxyIPTable() {
      const tbody = document.getElementById('proxyip-tbody');
      const countryFilter = document.getElementById('proxyip-filter-country')?.value || '';
      const statusFilter = document.getElementById('proxyip-filter-status')?.value || '';

      let filtered = proxyIPData;
      if (countryFilter) filtered = filtered.filter(p => p.country === countryFilter);
      if (statusFilter) filtered = filtered.filter(p => p.status === statusFilter);

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 40px; color:var(--muted)">هیچ Proxy IPی یافت نشد</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(p => {
        const statusClass = p.status === 'active' ? 'green' : (p.status === 'slow' ? 'yellow' : 'red');
        const statusText = p.status === 'active' ? '✅ فعال' : (p.status === 'slow' ? '🐢 کند' : '❌ مرده');
        const countryFlag = p.country === 'IR' ? '🇮🇷' : p.country === 'DE' ? '🇩🇪' : p.country === 'US' ? '🇺🇸' : p.country === 'NL' ? '🇳🇱' : p.country === 'FR' ? '🇫🇷' : p.country === 'SG' ? '🇸🇬' : p.country === 'JP' ? '🇯🇵' : p.country === 'TR' ? '🇹🇷' : '🌍';
        const lastCheck = p.last_check ? new Date(p.last_check).toLocaleString('fa-IR') : '—';
        
        return \`<tr>
          <td style="text-align:center;"><input type="checkbox" class="proxyip-checkbox" value="\${p.ip}:\${p.port}" onchange="toggleProxyIPSelection(this)"></td>
          <td style="font-family:monospace; font-size:13px;">\${p.ip}:\${p.port}</td>
          <td>\${p.port}</td>
          <td>\${countryFlag} \${p.city || '—'}</td>
          <td>\${p.isp || '—'}</td>
          <td style="font-family:monospace;">\${p.ping || '—'}</td>
          <td><span class="badge \${statusClass}">\${statusText}</span></td>
          <td style="font-size:12px; color:var(--muted);">\${lastCheck}</td>
          <td>
            <div class="flex-gap">
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px" onclick="testProxyIP('\${p.ip}', \${p.port})">تست</button>
              <button class="btn btn-danger" style="padding:4px 8px; font-size:11px" onclick="deleteProxyIP('\${p.ip}', \${p.port})">🗑️</button>
            </div>
          </td>
        </tr>\`;
      }).join('');
    }

    function filterProxyIP() {
      renderProxyIPTable();
    }

    async function refreshAllProxyIP() {
      const btn = event.target.closest('button');
      const originalText = btn.innerHTML;
      btn.innerHTML = '🔄 در حال تست...';
      btn.disabled = true;
      
      try {
        const res = await fetch(basePath + '/proxyip/refresh', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          await loadProxyIP();
        } else {
          alert('خطا: ' + (data.error || 'نامشخص'));
        }
      } catch (e) {
        alert('خطا در تست: ' + e.message);
      }
      btn.innerHTML = originalText;
      btn.disabled = false;
    }

    async function testProxyIP(ip, port) {
      if (!confirm(\`آیا می‌خواهید \${ip}:\${port} را تست کنید؟\`)) return;
      
      try {
        const res = await fetch(basePath + '/proxyip/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, port })
        });
        const data = await res.json();
        if (data.success) {
          alert(\`✅ تست موفق! پینگ: \${data.ping} ms\`);
          loadProxyIP();
        } else {
          alert('❌ تست ناموفق: ' + (data.error || 'نامشخص'));
        }
      } catch (e) {
        alert('خطا: ' + e.message);
      }
    }

    async function fetchProxyIPFromSources() {
          const btn = event.target.closest('button');
          const originalText = btn.innerHTML;
          btn.innerHTML = '☁️ در حال دریافت...';
          btn.disabled = true;
      
          try {
            const res = await fetch(basePath + '/proxyip/fetch', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
              alert('✅ ${data.count} آی‌پی جدید دریافت شد');
              loadProxyIP();
            } else {
              alert('خطا: ' + (data.error || 'نامشخص'));
            }
          } catch (e) {
            alert('خطا: ' + e.message);
          }
          btn.innerHTML = originalText;
          btn.disabled = false;
        }

        async function detectCountriesForIPs() {
          const btn = event.target.closest('button');
          const originalText = btn.innerHTML;
          btn.innerHTML = '🌍 در حال تشخیص...';
          btn.disabled = true;

          try {
            // Get IPs that don't have country yet
            const res = await fetch(basePath + '/proxyip');
            const data = await res.json();
            const ipsWithoutCountry = (data.proxyip || []).filter(p => !p.country || p.country === '');
        
            if (ipsWithoutCountry.length === 0) {
              alert('✅ همه آی‌پی‌ها کشور دارند');
              btn.innerHTML = originalText;
              btn.disabled = false;
              return;
            }

            let detected = 0;
            for (const item of ipsWithoutCountry) {
              try {
                const geoResp = await fetch('http://ip-api.com/json/' + item.ip + '?fields=countryCode,country,regionName,city,isp,org,as', { cf: { resolveTimeout: 2000 } });
                if (geoResp.ok) {
                  const geoData = await geoResp.json();
                  if (geoData.countryCode) {
                    // Update in DB
                    await fetch(basePath + '/proxyip', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        ip: item.ip, 
                        port: item.port,
                        country: geoData.countryCode,
                        city: geoData.city || '',
                        isp: geoData.isp || geoData.org || geoData.as || ''
                      })
                    });
                    detected++;
                  }
                }
                // Rate limit: 45 req/min = ~1.3s delay
                await new Promise(r => setTimeout(r, 1400));
              } catch(e) { console.error('GeoIP error for', item.ip, e); }
            }

            alert('✅ ' + detected + ' آی‌پی کشورشان تشخیص داده شد');
            loadProxyIP();
          } catch (e) {
            alert('خطا: ' + e.message);
          }
          btn.innerHTML = originalText;
          btn.disabled = false;
        }

        function toggleProxyIPSelection(checkbox) {
          const val = checkbox.value;
          if (checkbox.checked) proxyIPSelectedRows.add(val);
          else proxyIPSelectedRows.delete(val);
          updateSelectionToolbar();
        }

        function toggleSelectAllProxyIP(selectAllCheckbox) {
          const isChecked = selectAllCheckbox.checked;
          const checkboxes = document.querySelectorAll('.proxyip-checkbox');
          checkboxes.forEach(cb => {
            cb.checked = isChecked;
            const val = cb.value;
            if (isChecked) proxyIPSelectedRows.add(val);
            else proxyIPSelectedRows.delete(val);
          });
          updateSelectionToolbar();
        }

        function selectAllProxyIP(select) {
          const checkboxes = document.querySelectorAll('.proxyip-checkbox');
          const selectAllCheckbox = document.getElementById('proxyip-select-all');
          if (select) {
            checkboxes.forEach(cb => {
              cb.checked = true;
              proxyIPSelectedRows.add(cb.value);
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = true;
          } else {
            checkboxes.forEach(cb => {
              cb.checked = false;
              proxyIPSelectedRows.delete(cb.value);
            });
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
          }
          updateSelectionToolbar();
        }

        function updateSelectionToolbar() {
          const count = proxyIPSelectedRows.size;
          const toolbar = document.getElementById('proxyip-selection-toolbar');
          const countEl = document.getElementById('proxyip-selected-count');
          const toolbarCountEl = document.getElementById('proxyip-toolbar-count');
          const selectAllCheckbox = document.getElementById('proxyip-select-all');
      
          if (count > 0) {
            toolbar.style.display = 'flex';
            countEl.textContent = count + ' آی‌پی انتخاب شده';
            toolbarCountEl.textContent = count;
          } else {
            toolbar.style.display = 'none';
            countEl.textContent = '۰ آی‌پی انتخاب شده';
            toolbarCountEl.textContent = 0;
          }
      
          // Update select-all checkbox state
          const visibleCheckboxes = document.querySelectorAll('.proxyip-checkbox');
          if (visibleCheckboxes.length > 0) {
            const checkedVisible = Array.from(visibleCheckboxes).filter(cb => cb.checked).length;
            selectAllCheckbox.checked = checkedVisible === visibleCheckboxes.length && checkedVisible > 0;
            selectAllCheckbox.indeterminate = checkedVisible > 0 && checkedVisible < visibleCheckboxes.length;
          } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
          }
        }

    function openProxyIPAddModal() {
      document.getElementById('proxyip-add-modal-title').textContent = 'افزودن Proxy IP جدید';
      document.getElementById('pi-ip').value = '';
      document.getElementById('pi-port').value = '443';
      document.getElementById('pi-country').value = '';
      document.getElementById('pi-city').value = '';
      document.getElementById('pi-isp').value = '';
      openModal('proxyip-add-modal');
    }

    async function saveProxyIP() {
      const ip = document.getElementById('pi-ip').value.trim();
      const port = parseInt(document.getElementById('pi-port').value) || 443;
      const country = document.getElementById('pi-country').value.trim();
      const city = document.getElementById('pi-city').value.trim();
      const isp = document.getElementById('pi-isp').value.trim();
      
      if (!ip) { alert('آی‌پی الزامی است'); return; }
      
      try {
        const res = await fetch(basePath + '/proxyip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, port, country, city, isp })
        });
        const data = await res.json();
        if (data.success) {
          closeModal('proxyip-add-modal');
          loadProxyIP();
        } else {
          alert('خطا: ' + (data.error || 'نامشخص'));
        }
      } catch (e) {
        alert('خطا: ' + e.message);
      }
    }

    async function deleteProxyIP(ip, port) {
      if (!confirm(\`آیا می‌خواهید \${ip}:\${port} را حذف کنید؟\`)) return;
      
      try {
        const res = await fetch(basePath + '/proxyip', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, port })
        });
        const data = await res.json();
        if (data.success) loadProxyIP();
        else alert('خطا: ' + (data.error || 'نامشخص'));
      } catch (e) {
        alert('خطا: ' + e.message);
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
      if (!text) { alert('متن خالی است'); return; }
      
      try {
        const res = await fetch(basePath + '/proxyip/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, format })
        });
        const data = await res.json();
        if (data.success) {
          closeModal('proxyip-import-modal');
          alert('✅ \${data.count} آی‌پی وارد شد');
          loadProxyIP();
        } else {
          alert('خطا: ' + (data.error || 'نامشخص'));
        }
      } catch (e) {
        alert('خطا: ' + e.message);
      }
    }

    async function deleteSelectedProxyIP() {
      if (proxyIPSelectedRows.size === 0) { alert('هیچ آی‌پی انتخاب نشده'); return; }
      if (!confirm(\`آیا می‌خواهید \${proxyIPSelectedRows.size} آی‌پی انتخاب شده را حذف کنید؟\`)) return;
      
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
        if (data.success) {
          proxyIPSelectedRows.clear();
          loadProxyIP();
        } else {
          alert('خطا: ' + (data.error || 'نامشخص'));
        }
      } catch (e) {
        alert('خطا: ' + e.message);
      }
    }


// Init
    loadUsers();
    loadTokens();
    loadCfMetrics();
  </script>
</body>
</html>`;
}


export { nginxPage, loginPage, subscriptionPage, panelPage, setupPage };

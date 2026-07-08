const fs = require('fs');

try {
  let content = fs.readFileSync('src/templates.js', 'utf8');

  // Remove the last export line
  content = content.replace(/export \{ nginxPage, loginPage, subscriptionPage, panelPage \};/g, '');

  const setupPageFunc = `
function setupPage(hasKV, hasPassword, currentUUID, currentProxyIP) {
  const allGood = hasKV && hasPassword;
  return \`<!DOCTYPE html>
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
        <div class="badge \${hasKV ? 'ok' : 'fail'}">\${hasKV ? 'متصل شد ✅' : 'متصل نیست ❌'}</div>
      </div>
      
      <!-- Password Check -->
      <div class="item">
        <div>
          <div class="item-title">رمز عبور ادمین <span class="code">PASSWORD</span></div>
          <div class="desc">برای امنیت پنل الزامی است. یک متغیر محیطی (Environment Variable) به نام <span class="code">PASSWORD</span> در کلادفلر بسازید.</div>
        </div>
        <div class="badge \${hasPassword ? 'ok' : 'fail'}">\${hasPassword ? 'تنظیم شده ✅' : 'تنظیم نشده ❌'}</div>
      </div>

      <!-- UUID Check -->
      <div class="item">
        <div>
          <div class="item-title">شناسه کاربر <span class="code">UUID</span></div>
          <div class="desc">شناسه فعلی شما: <span class="code">\${currentUUID}</span>. برای تغییر آن می‌توانید متغیر محیطی <span class="code">UUID</span> را تغییر دهید.</div>
        </div>
        <div class="badge info">اختیاری ℹ️</div>
      </div>

      <!-- Proxy IP Check -->
      <div class="item">
        <div>
          <div class="item-title">آی‌پی پروکسی <span class="code">PROXYIP</span></div>
          <div class="desc">مقدار فعلی: \${currentProxyIP ? '<span class="code">'+currentProxyIP+'</span>' : 'ندارد'}. متغیر محیطی <span class="code">PROXYIP</span> برای دور زدن محدودیت برخی سایت‌ها.</div>
        </div>
        <div class="badge info">اختیاری ℹ️</div>
      </div>
    </div>

    \${allGood ? \`
    <div class="links-box">
      <h3>✅ سیستم کاملاً آماده است!</h3>
      <div class="desc" style="color:var(--text);">
        از این پس با باز کردن آدرس اصلی ورکر، صفحه جعلی Nginx را خواهید دید تا استتار حفظ شود.<br><br>
        🔗 <strong>آدرس ورود به پنل شما:</strong><br><span class="code" style="color:#a78bfa;">/\\x24{currentUUID}</span><br><br>
        🔗 <strong>آدرس لینک سابسکرایپ شما:</strong><br><span class="code" style="color:#a78bfa;">/\\x24{currentUUID}/sub</span><br>
      </div>
    </div>
    \` : \`
    <div style="text-align:center; margin-top:20px; color:var(--warning); font-size:14px; font-weight: 500;">
      ⚠️ تا زمانی که موارد الزامی (KV و Password) را تنظیم نکنید، امنیت و عملکرد پروکسی شما کامل نخواهد بود!
    </div>
    \`}
  </div>
</body>
</html>\`;
}

export { nginxPage, loginPage, subscriptionPage, panelPage, setupPage };
`;

  content += setupPageFunc;
  fs.writeFileSync('src/templates.js', content, 'utf8');
  console.log('✅ templates.js updated with setupPage.');
} catch (e) {
  console.error('Error updating templates.js:', e);
}

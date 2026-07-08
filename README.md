# 🚀 Penhan (پنهان)

**Modular VLESS & Trojan over WebSocket — Cloudflare Worker**

یک پروکسی سبک و حرفه‌ای مبتنی بر کلادفلر ورکر با پشتیبانی از پروتکل‌های VLESS و Trojan روی WebSocket، همراه با پنل مدیریت شیک فارسی، صفحه سابسکرایب اختصاصی و API یکپارچه.

---

## ✨ ویژگی‌ها

- 🔒 **VLESS over WebSocket** — پروتکل مدرن و سبک
- 🔑 **Trojan over WebSocket** — سازگاری گسترده با کلاینت‌ها
- 🎨 **پنل مدیریت فارسی** — رابط کاربری شیشه‌ای (Glassmorphic) با تم تاریک
- 🌐 **صفحه سابسکرایب** — قابل استفاده در مرورگر و کلاینت‌های پروکسی
- 📡 **API یکپارچه** — مدیریت از طریق ربات تلگرام یا اسکریپت
- ⚙️ **ذخیره تنظیمات در KV** — Clean IP، Proxy IP، مسیرهای سفارشی
- 🔐 **احراز هویت** — رمز عبور پنل + توکن API

## 📁 ساختار پروژه

```
penhan/
├── src/
│   ├── index.js        # نقطه ورود و مسیریاب (Router)
│   ├── helpers.js      # توابع کمکی، رمزنگاری SHA-224، احراز هویت
│   ├── vless.js        # هندلر پروتکل VLESS
│   ├── trojan.js       # هندلر پروتکل Trojan
│   └── templates.js    # صفحات HTML (پنل، ورود، ساب، nginx)
├── dist/
│   └── worker.js       # خروجی کامپایل‌شده (آماده دیپلوی)
├── wrangler.toml       # پیکربندی Cloudflare Wrangler
├── package.json        # وابستگی‌ها و اسکریپت‌های بیلد
└── .gitignore
```

## 🛠️ نصب و راه‌اندازی

### پیش‌نیازها
- [Node.js](https://nodejs.org/) (نسخه 18+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### مراحل نصب

```bash
# کلون ریپازیتوری
git clone https://github.com/YOUR_USERNAME/penhan.git
cd penhan

# نصب وابستگی‌ها
npm install

# بیلد پروژه
npm run build

# دیپلوی روی کلادفلر
npx wrangler deploy
```

### استفاده سریع (بدون بیلد)

اگر نمی‌خواهید پروژه را بیلد کنید، فایل `worker.js` آماده را از بخش [Releases](../../releases) دانلود کرده و مستقیماً در داشبورد کلادفلر آپلود کنید.

## ⚙️ پیکربندی

فایل `wrangler.toml` را ویرایش کنید:

```toml
name = "penhan"
main = "dist/worker.js"
compatibility_date = "2023-12-01"

[[kv_namespaces]]
binding = "nahan"
id = "YOUR_KV_NAMESPACE_ID_HERE"
```

### متغیرهای محیطی (Environment Variables)

| متغیر | توضیحات |
|--------|---------|
| `UUID` | شناسه کاربری (اختیاری، پیش‌فرض در کد) |
| `PROXYIP` | پروکسی آی‌پی پیش‌فرض |
| `PASSWORD` | رمز عبور پنل ادمین |

## 📡 API Reference

### احراز هویت
```http
Authorization: Bearer <UUID_یا_رمز_پنل>
```
یا:
```
?token=<UUID_یا_رمز_پنل>
```

### اندپوینت‌ها

| متد | آدرس | توضیحات |
|-----|-------|---------|
| `GET` | `/api/info` | دریافت تمام اطلاعات و کانفیگ‌ها |
| `POST` | `/api/settings` | تغییر تنظیمات (JSON body) |
| `GET` | `/<UUID>/sub` | لینک سابسکرایب (Base64 برای کلاینت / HTML برای مرورگر) |

### نمونه درخواست
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-worker.workers.dev/api/info
```

## 📝 لایسنس

MIT License

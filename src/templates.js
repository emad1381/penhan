function nginxPage() {
  return `<!DOCTYPE html>\n<html>\n<head>\n<title>Welcome to nginx!</title>\n<style>
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css');
\nhtml { color-scheme: light dark; }\nbody { width: 35em; margin: 0 auto; font-family: Vazirmatn, Tahoma, sans-serif; }\n</style>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>\n</head>\n<body>\n<h1>Welcome to nginx!</h1>\n<p>If you see this page, the nginx web server is successfully installed and\nworking. Further configuration is required.</p>\n<p>For online documentation and support please refer to\n<a href="http://nginx.org/">nginx.org</a>.<br/>\nCommercial support is available at\n<a href="http://nginx.com/">nginx.com</a>.</p>\n<p><em>Thank you for using nginx.</em></p>\n</body>\n</html>`;
}

function loginPage(uuid, host) {
  return `<!DOCTYPE html>
<html class="dark" dir="rtl" lang="fa"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>پنهان | ورود به سامانه</title>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Vazirmatn & Plus Jakarta Sans -->
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "secondary": "#ffb0cd",
                    "on-primary": "#490080",
                    "primary-fixed": "#f0dbff",
                    "inverse-surface": "#e4e1ea",
                    "on-primary-fixed-variant": "#6900b3",
                    "surface-container": "#1f1f26",
                    "primary-container": "#b76dff",
                    "background": "#131319",
                    "surface": "#131319",
                    "on-surface-variant": "#cfc2d6",
                    "on-secondary-fixed": "#3e0022",
                    "tertiary-fixed": "#6ffbbe",
                    "secondary-fixed-dim": "#ffb0cd",
                    "inverse-on-surface": "#303037",
                    "on-background": "#e4e1ea",
                    "surface-tint": "#ddb7ff",
                    "on-tertiary-container": "#00311f",
                    "surface-variant": "#35343b",
                    "on-tertiary-fixed": "#002113",
                    "tertiary-fixed-dim": "#4edea3",
                    "on-error-container": "#ffdad6",
                    "secondary-fixed": "#ffd9e4",
                    "surface-container-lowest": "#0e0e14",
                    "surface-container-low": "#1b1b22",
                    "on-secondary": "#640039",
                    "on-surface": "#e4e1ea",
                    "on-secondary-fixed-variant": "#8c0053",
                    "primary": "#ddb7ff",
                    "inverse-primary": "#842bd2",
                    "on-tertiary-fixed-variant": "#005236",
                    "on-primary-container": "#400071",
                    "outline": "#988d9f",
                    "outline-variant": "#4d4354",
                    "surface-dim": "#131319",
                    "error-container": "#93000a",
                    "on-error": "#690005",
                    "tertiary": "#4edea3",
                    "error": "#ffb4ab",
                    "on-secondary-container": "#ffbad3",
                    "tertiary-container": "#00a572",
                    "surface-bright": "#393840",
                    "on-tertiary": "#003824",
                    "primary-fixed-dim": "#ddb7ff"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "fontFamily": {
                    "vazir": ["Vazirmatn", "sans-serif"],
                    "headline-lg": ["Plus Jakarta Sans", "Vazirmatn"],
                    "headline-md": ["Plus Jakarta Sans", "Vazirmatn"],
                    "body-lg": ["Inter", "Vazirmatn"],
                    "label-md": ["Geist", "Vazirmatn"],
                    "display-lg": ["Plus Jakarta Sans", "Vazirmatn"]
            },
            "fontSize": {
                    "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
                    "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
                    "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "label-md": ["14px", {"lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "500"}],
                    "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}]
            }
          },
        },
      }
    </script>
<style>
        body {
            background-color: #131319;
            margin: 0;
            overflow: hidden;
            font-family: 'Vazirmatn', sans-serif;
        }
        
        .glass-panel {
            background: rgba(25, 25, 32, 0.6);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
        }

        .neon-glow-primary {
            box-shadow: 0 0 20px rgba(221, 183, 255, 0.2);
        }

        .neon-glow-error {
            box-shadow: 0 0 30px rgba(255, 180, 171, 0.3);
        }

        .input-focus-effect:focus-within .lock-icon {
            color: #ddb7ff;
            filter: drop-shadow(0 0 8px rgba(221, 183, 255, 0.8));
            transition: all 0.3s ease;
        }

        @keyframes pulse-loading {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(0.98); }
        }

        .loading-pulse {
            animation: pulse-loading 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        .shake-error {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddb7ff; border-radius: 10px; }
    </style>
</head>
<body class="bg-background text-on-background flex items-center justify-center h-screen w-screen relative overflow-hidden">
<!-- Full Screen Background Shader -->
<div class="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-60" style="display:block;">
<canvas id="shader-canvas-ANIMATION_2" style="display:block;width:100%;height:100%"></canvas>
<script>
(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_2');

  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = \`attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
  const fs = \`precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    vec2 p1 = vec2(0.5 + 0.3 * sin(u_time * 0.4), 0.5 + 0.2 * cos(u_time * 0.5));
    vec2 p2 = vec2(0.3 + 0.2 * cos(u_time * 0.3), 0.7 + 0.1 * sin(u_time * 0.6));
    vec2 p3 = vec2(0.7 + 0.2 * sin(u_time * 0.5), 0.3 + 0.2 * cos(u_time * 0.4));
    
    vec3 col1 = vec3(0.658, 0.333, 0.968); // #a855f7 (Purple)
    vec3 col2 = vec3(0.925, 0.282, 0.6);   // #ec4899 (Pink/Magenta)
    vec3 col3 = vec3(0.062, 0.725, 0.505); // #10b981 (Cyan/Emerald)
    
    float d1 = length(uv - p1);
    float d2 = length(uv - p2);
    float d3 = length(uv - p3);
    
    float f1 = 0.5 / (1.0 + d1 * 5.0);
    float f2 = 0.5 / (1.0 + d2 * 4.0);
    float f3 = 0.5 / (1.0 + d3 * 6.0);
    
    vec3 aurora = (col1 * f1 + col2 * f2 + col3 * f3) * 0.4;
    vec3 bg = vec3(0.02, 0.02, 0.04); // Deep dark background
    
    gl_FragColor = vec4(bg + aurora, 1.0);
}\`;
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // requestAnimationFrame(render); // Disabled for performance
  }
  render(0);
})();
</script>
</div>
<!-- Main Content Canvas -->
<main class="relative z-10 w-full max-w-md px-6">
<!-- Login Card -->
<div class="glass-panel p-10 rounded-[2rem] flex flex-col items-center gap-8 transition-all duration-500 hover:border-white/20">
<!-- Branding -->
<div class="text-center">
<h1 class="font-display-lg text-display-lg text-primary tracking-tighter mb-2">پنهان</h1>
<p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-60">Penhan • Deep Space Command</p>
</div>
<!-- Form -->
<form class="w-full space-y-6" id="loginForm">
<!-- Password with Glowing Icon -->
<div class="space-y-2 input-focus-effect">
<label class="font-label-md text-label-md text-on-surface-variant mr-1 block">رمز عبور پنل</label>
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute right-4 text-on-surface-variant/50 lock-icon transition-all duration-300" data-icon="lock">lock</span>
<input class="w-full bg-white/5 border border-white/10 rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-body-md font-body-md" placeholder="••••••••" type="password" id="passInput" autofocus autocomplete="current-password"/>
</div>
</div>
<!-- Action Button -->
<button class="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl neon-glow-primary hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3" type="submit" id="loginBtn">
<span>ورود به پل فرماندهی</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">arrow_back</span>
</button>
</form>
</div>
<!-- Footer Decoration -->
<div class="mt-8 text-center">
<p class="font-label-md text-label-md text-on-surface-variant opacity-30">ENCRYPTED END-TO-END CONNECTION ESTABLISHED</p>
</div>
</main>
<!-- Floating Toast Notification -->
<div class="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-0 translate-y-[-20px] transition-all duration-500" id="toast">
<div class="glass-panel border-error/30 neon-glow-error shake-error px-6 py-4 rounded-full flex items-center gap-4 text-error">
<span class="material-symbols-outlined">error</span>
<span class="font-body-md text-body-md font-bold" id="toast-text">رمز عبور اشتباه است</span>
</div>
</div>
<!-- Interaction Script -->
<script>
    const path = window.location.pathname;
    const bp = path.endsWith('/panel-login') ? path.slice(0, -12) : (path.endsWith('/') ? path.slice(0, -1) : path);

    async function doLogin() {
      const input = document.getElementById('passInput');
      const p = input.value.trim();
      const btn = document.getElementById('loginBtn');

      if (!p) {
        showToast('❌ لطفاً رمز عبور را وارد کنید', 'error');
        return;
      }

      btn.innerHTML = \`<div class="w-6 h-6 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>\`;
      btn.classList.add('loading-pulse');
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
          showToast('رمز عبور اشتباه است', 'error');
          input.value = '';
          input.focus();
        }
      } catch (e) {
        showToast('خطا در ارتباط با سرور', 'error');
      } finally {
        btn.innerHTML = \`<span>ورود به پل فرماندهی</span><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">arrow_back</span>\`;
        btn.classList.remove('loading-pulse');
        btn.disabled = false;
      }
    }

    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      doLogin();
    });

    function showToast(msg, type) {
      const toast = document.getElementById('toast');
      const toastText = document.getElementById('toast-text');
      toastText.textContent = msg;
      
      toast.classList.remove('opacity-0', 'translate-y-[-20px]');
      toast.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-20px]');
        toast.classList.remove('opacity-100', 'translate-y-0');
      }, 3500);
    }
  </script>
</body>
</html>`;
}

function setupPage(hasD1, hasPassword, hasUUID, currentUUID, currentProxyIP) {
  const allGood = hasD1 && hasPassword && hasUUID;
  
  const dbBadge = hasD1 ? `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
      <span class="status-dot bg-tertiary status-pulse"></span>
      <span class="text-tertiary text-sm font-bold">متصل</span>
    </div>` : `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/30">
      <span class="status-dot bg-error status-pulse" style="animation-name: pulse-red;"></span>
      <span class="text-error text-sm font-bold">قطع اتصال</span>
    </div>`;

  const passBadge = hasPassword ? `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
      <span class="status-dot bg-tertiary status-pulse"></span>
      <span class="text-tertiary text-sm font-bold">تنظیم شده</span>
    </div>` : `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/30">
      <span class="status-dot bg-error status-pulse" style="animation-name: pulse-red;"></span>
      <span class="text-error text-sm font-bold">تنظیم نشده</span>
    </div>`;

  const uuidBadge = hasUUID ? `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
      <span class="status-dot bg-tertiary status-pulse"></span>
      <span class="text-tertiary text-sm font-bold">تنظیم شده</span>
    </div>` : `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/30">
      <span class="status-dot bg-error status-pulse" style="animation-name: pulse-red;"></span>
      <span class="text-error text-sm font-bold">تنظیم نشده</span>
    </div>`;

  const proxyIPBadge = currentProxyIP ? `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
      <span class="status-dot bg-tertiary status-pulse"></span>
      <span class="text-tertiary text-sm font-bold">تنظیم شده</span>
    </div>` : `
    <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30">
      <span class="status-dot bg-secondary status-pulse-amber"></span>
      <span class="text-secondary text-sm font-bold">اختیاری</span>
    </div>`;

  return `<!DOCTYPE html>
<html class="dark" dir="rtl" lang="fa"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>پنهان | راه‌اندازی اولیه</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&amp;family=Inter:wght@100..900&amp;family=Plus+Jakarta+Sans:wght@100..900&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            font-family: 'Vazirmatn', sans-serif;
            background-color: #131319;
            overflow: hidden;
        }
        .glass-card {
            backdrop-filter: blur(24px);
            background: rgba(31, 31, 38, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0, 0, 0, 0.5);
        }
        .neon-glow-purple {
            box-shadow: 0 0 20px rgba(221, 183, 255, 0.3);
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .status-pulse {
            animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
            0% { box-shadow: 0 0 0 0px rgba(78, 222, 163, 0.4); }
            100% { box-shadow: 0 0 0 10px rgba(78, 222, 163, 0); }
        }
        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0px rgba(255, 180, 171, 0.4); }
            100% { box-shadow: 0 0 0 10px rgba(255, 180, 171, 0); }
        }
        .status-pulse-amber {
            animation: pulse-amber 2s infinite;
        }
        @keyframes pulse-amber {
            0% { box-shadow: 0 0 0 0px rgba(255, 176, 205, 0.4); }
            100% { box-shadow: 0 0 0 10px rgba(255, 176, 205, 0); }
        }
        .slide-up-btn {
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .slide-up-btn:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(170, 2, 102, 0.4);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "secondary": "#ffb0cd",
                      "on-primary": "#490080",
                      "primary-fixed": "#f0dbff",
                      "inverse-surface": "#e4e1ea",
                      "on-primary-fixed-variant": "#6900b3",
                      "surface-container": "#1f1f26",
                      "primary-container": "#b76dff",
                      "background": "#131319",
                      "surface": "#131319",
                      "on-surface-variant": "#cfc2d6",
                      "on-secondary-fixed": "#3e0022",
                      "tertiary-fixed": "#6ffbbe",
                      "secondary-fixed-dim": "#ffb0cd",
                      "inverse-on-surface": "#303037",
                      "on-background": "#e4e1ea",
                      "surface-tint": "#ddb7ff",
                      "on-tertiary-container": "#00311f",
                      "surface-variant": "#35343b",
                      "on-tertiary-fixed": "#002113",
                      "tertiary-fixed-dim": "#4edea3",
                      "on-error-container": "#ffdad6",
                      "secondary-fixed": "#ffd9e4",
                      "surface-container-lowest": "#0e0e14",
                      "surface-container-low": "#1b1b22",
                      "on-secondary": "#640039",
                      "on-surface": "#e4e1ea",
                      "on-secondary-fixed-variant": "#8c0053",
                      "primary": "#ddb7ff",
                      "inverse-primary": "#842bd2",
                      "on-tertiary-fixed-variant": "#005236",
                      "on-primary-container": "#400071",
                      "outline": "#988d9f",
                      "outline-variant": "#4d4354",
                      "surface-dim": "#131319",
                      "error-container": "#93000a",
                      "on-error": "#690005",
                      "tertiary": "#4edea3",
                      "error": "#ffb4ab",
                      "on-secondary-container": "#ffbad3",
                      "tertiary-container": "#00a572",
                      "surface-bright": "#393840",
                      "on-tertiary": "#003824",
                      "primary-fixed-dim": "#ddb7ff"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "gutter": "1.5rem",
                      "container_padding": "2rem",
                      "stack_xs": "0.5rem",
                      "stack_md": "1rem",
                      "stack_lg": "2rem",
                      "sidebar_width": "280px"
              },
              "fontFamily": {
                      "headline-lg": ["Plus Jakarta Sans"],
                      "headline-md": ["Plus Jakarta Sans"],
                      "body-lg": ["Inter"],
                      "label-md": ["Geist"],
                      "code-sm": ["JetBrains Mono"],
                      "headline-lg-mobile": ["Plus Jakarta Sans"],
                      "body-md": ["Inter"],
                      "display-lg": ["Plus Jakarta Sans"]
              },
              "fontSize": {
                      "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
                      "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
                      "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                      "label-md": ["14px", {"lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "500"}],
                      "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                      "headline-lg-mobile": ["28px", {"lineHeight": "1.2", "fontWeight": "700"}],
                      "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                      "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}]
              }
            },
          },
        }
    </script>
</head>
<body class="flex items-center justify-center min-h-screen p-6 relative overflow-hidden">
<!-- Background Shader -->
<div class="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-60" style="display:block;">
<canvas id="shader-canvas-ANIMATION_2" style="display:block;width:100%;height:100%"></canvas>
<script>
(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_2');

  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = \`attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
  const fs = \`precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    vec2 p1 = vec2(0.5 + 0.3 * sin(u_time * 0.4), 0.5 + 0.2 * cos(u_time * 0.5));
    vec2 p2 = vec2(0.3 + 0.2 * cos(u_time * 0.3), 0.7 + 0.1 * sin(u_time * 0.6));
    vec2 p3 = vec2(0.7 + 0.2 * sin(u_time * 0.5), 0.3 + 0.2 * cos(u_time * 0.4));
    
    vec3 col1 = vec3(0.658, 0.333, 0.968); // #a855f7 (Purple)
    vec3 col2 = vec3(0.925, 0.282, 0.6);   // #ec4899 (Pink/Magenta)
    vec3 col3 = vec3(0.062, 0.725, 0.505); // #10b981 (Cyan/Emerald)
    
    float d1 = length(uv - p1);
    float d2 = length(uv - p2);
    float d3 = length(uv - p3);
    
    float f1 = 0.5 / (1.0 + d1 * 5.0);
    float f2 = 0.5 / (1.0 + d2 * 4.0);
    float f3 = 0.5 / (1.0 + d3 * 6.0);
    
    vec3 aurora = (col1 * f1 + col2 * f2 + col3 * f3) * 0.4;
    vec3 bg = vec3(0.02, 0.02, 0.04); // Deep dark background
    
    gl_FragColor = vec4(bg + aurora, 1.0);
}\`;
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // requestAnimationFrame(render); // Disabled for performance
  }
  render(0);
})();
</script>
</div>
<!-- Content Wrapper -->
<main class="relative z-10 w-full max-w-xl">
<div class="glass-card rounded-[2rem] p-10 md:p-14 overflow-hidden relative">
<!-- Branding Header -->
<div class="flex flex-col items-center mb-10 text-center">
<div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary-container p-[1px] mb-6 shadow-2xl">
<div class="w-full h-full bg-background rounded-2xl flex items-center justify-center">
<span class="material-symbols-outlined text-4xl text-primary" data-icon="rocket_launch">rocket_launch</span>
</div>
</div>
<h1 class="text-on-surface font-bold text-3xl mb-2">راه‌اندازی اولیه سیستم</h1>
<p class="text-on-surface-variant font-label-md text-label-md opacity-70">Deep Space Command - Initial System Setup</p>
</div>
<!-- Setup Status List -->
<div class="space-y-4 mb-12">
<!-- Database Item -->
<div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-tertiary" data-icon="database">database</span>
</div>
<span class="text-on-surface font-medium">دیتابیس D1 کلادفلر (Cloudflare D1)</span>
</div>
${dbBadge}
</div>
<!-- Password Item -->
<div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-tertiary" data-icon="lock">lock</span>
</div>
<span class="text-on-surface font-medium">رمز عبور پنل (Panel Password)</span>
</div>
${passBadge}
</div>
<!-- Admin UUID Item -->
<div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-tertiary" data-icon="fingerprint">fingerprint</span>
</div>
<span class="text-on-surface font-medium">شناسه ادمین (Admin UUID)</span>
</div>
${uuidBadge}
</div>
<!-- Proxy IP Item -->
<div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-secondary" data-icon="settings_ethernet">settings_ethernet</span>
</div>
<span class="text-on-surface font-medium opacity-60">آی‌پی پروکسی (Proxy IP)</span>
</div>
${proxyIPBadge}
</div>
</div>
<!-- Footer Action -->
<div class="pt-6 border-t border-white/10">
${allGood ? `
<button class="slide-up-btn w-full bg-gradient-to-l from-primary-container to-secondary-container text-on-primary-container font-bold py-4 rounded-2xl flex items-center justify-center gap-3 group" onclick="window.location.href='/panel'">
<span>ورود به پنل مدیریت</span>
<span class="material-symbols-outlined group-hover:translate-x-[-4px] transition-transform" data-icon="arrow_back">arrow_back</span>
</button>
` : `
<div class="text-center py-4 px-6 rounded-xl bg-error/5 border border-error/20 text-error text-sm font-medium">
  ⚠️ تا زمانی که دیتابیس D1 و متغیرهای الزامی بالا را به درستی تنظیم نکنید، پنل مدیریت قابل استفاده نخواهد بود.
</div>
`}
<div class="mt-8 flex justify-center items-center gap-6 text-on-surface-variant opacity-40 text-xs">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-base" data-icon="verified_user">verified_user</span>
<span>Secure Connection</span>
</div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-base" data-icon="shield">shield</span>
<span>Orbit Guard Active</span>
</div>
</div>
</div>
<!-- Atmospheric Glows -->
<div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]"></div>
<div class="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-[80px]"></div>
</div>
<!-- Footer Meta -->
<p class="text-center mt-8 text-on-surface-variant/40 text-xs font-label-md tracking-widest">
            PENHAN DEEP SPACE COMMAND © 2026 • SYSTEM INITIALIZATION COMPLETE
        </p>
</main>
<script>
        // Micro-interactions for button and status items
        const btn = document.querySelector('.slide-up-btn');
        if (btn) {
          btn.addEventListener('mousedown', function() {
              this.style.transform = 'scale(0.98)';
          });
          btn.addEventListener('mouseup', function() {
              this.style.transform = 'scale(1) translateY(-4px)';
          });
        }

        // Add subtle hover effect to cards
        const items = document.querySelectorAll('.space-y-4 > div');
        items.forEach(el => {
          el.addEventListener('mouseenter', () => {
            el.style.transform = 'translateY(-2px)';
            el.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'translateY(0)';
            el.style.borderColor = 'rgba(255, 255, 255, 0.05)';
          });
        });
      </script>
    </body>
    </html>`;
}

function subscriptionPage(hostname, user, vlessWS, trojanWS) {
  if (typeof user === 'string') {
    user = { id: user, name: 'کاربر بدون نام', limit_bytes: 0, used_bytes: 0, enabled: true, expiry_date: 0 };
  }
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
  let expiryPercent = 100;
  
  if (user.expiry_date > 0) {
    const d = new Date(user.expiry_date);
    const pad = (n) => n.toString().padStart(2, '0');
    expiryAbsolute = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    
    const diff = user.expiry_date - Date.now();
    if (diff < 0) {
      expiryRelative = "منقضی شده";
      expiryPercent = 0;
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) {
        expiryRelative = `${days} روز و ${hours} ساعت دیگر`;
      } else {
        expiryRelative = `${hours} ساعت دیگر`;
      }
      expiryPercent = Math.min(100, Math.round((diff / (30 * 24 * 60 * 60 * 1000)) * 100));
    }
  }
  
  let statusClass = 'active';
  let statusText = 'فعال';
  let statusColorClass = 'from-tertiary to-transparent';
  let statusBadgeClass = 'bg-tertiary text-on-tertiary neon-glow-success';
  
  if (!user.enabled) {
    statusClass = 'banned';
    statusText = 'مسدود شده';
    statusColorClass = 'from-error to-transparent';
    statusBadgeClass = 'bg-error text-on-error neon-glow-error';
  } else if (limit > 0 && used >= limit) {
    statusClass = 'disabled';
    statusText = 'پایان حجم';
    statusColorClass = 'from-secondary to-transparent';
    statusBadgeClass = 'bg-secondary text-on-secondary neon-glow-error';
  } else if (user.expiry_date > 0 && Date.now() > user.expiry_date) {
    statusClass = 'disabled';
    statusText = 'منقضی شده';
    statusColorClass = 'from-secondary to-transparent';
    statusBadgeClass = 'bg-secondary text-on-secondary neon-glow-error';
  }

  return `<!DOCTYPE html>
<html class="dark" dir="rtl" lang="fa"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>پنهان | پنل کاربری - ${name}</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
<style>
        body {
            font-family: 'Vazirmatn', sans-serif;
            background-color: #131319;
            overflow-x: hidden;
            color: #e4e1ea;
        }

        .glass-panel {
            background: rgba(31, 31, 38, 0.3);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .glass-panel:hover {
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 20px rgba(221, 183, 255, 0.1);
        }

        .neon-glow-primary {
            box-shadow: 0 0 15px rgba(221, 183, 255, 0.4);
        }

        .neon-glow-success {
            box-shadow: 0 0 15px rgba(78, 222, 163, 0.4);
        }

        .neon-glow-error {
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }

        .status-ring {
            position: relative;
        }

        .status-ring::before {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid ${statusClass === 'active' ? '#4edea3' : '#ffb4ab'};
            animation: pulse-ring 2s infinite;
        }

        @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 0.4; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ddb7ff;
            border-radius: 10px;
        }
        
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .farsi-nums {
            font-feature-settings: "ss01", "ss02", "ss03", "ss04";
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "secondary": "#ffb0cd",
                      "on-primary": "#490080",
                      "primary-fixed": "#f0dbff",
                      "inverse-surface": "#e4e1ea",
                      "on-primary-fixed-variant": "#6900b3",
                      "surface-container": "#1f1f26",
                      "primary-container": "#b76dff",
                      "background": "#131319",
                      "surface": "#131319",
                      "on-surface-variant": "#cfc2d6",
                      "on-secondary-fixed": "#3e0022",
                      "tertiary-fixed": "#6ffbbe",
                      "secondary-fixed-dim": "#ffb0cd",
                      "inverse-on-surface": "#303037",
                      "on-background": "#e4e1ea",
                      "surface-tint": "#ddb7ff",
                      "on-tertiary-container": "#00311f",
                      "surface-variant": "#35343b",
                      "on-tertiary-fixed": "#002113",
                      "tertiary-fixed-dim": "#4edea3",
                      "on-error-container": "#ffdad6",
                      "secondary-fixed": "#ffd9e4",
                      "surface-container-lowest": "#0e0e14",
                      "surface-container-low": "#1b1b22",
                      "on-secondary": "#640039",
                      "on-surface": "#e4e1ea",
                      "on-secondary-fixed-variant": "#8c0053",
                      "primary": "#ddb7ff",
                      "inverse-primary": "#842bd2",
                      "on-tertiary-fixed-variant": "#005236",
                      "on-primary-container": "#400071",
                      "outline": "#988d9f",
                      "surface-container-highest": "#35343b",
                      "surface-container-high": "#2a2930",
                      "on-primary-fixed": "#2c0051",
                      "secondary-container": "#aa0266",
                      "outline-variant": "#4d4354",
                      "surface-dim": "#131319",
                      "error-container": "#93000a",
                      "on-error": "#690005",
                      "tertiary": "#4edea3",
                      "error": "#ffb4ab",
                      "on-secondary-container": "#ffbad3",
                      "tertiary-container": "#00a572",
                      "surface-bright": "#393840",
                      "on-tertiary": "#003824",
                      "primary-fixed-dim": "#ddb7ff"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "gutter": "1.5rem",
                      "container_padding": "2rem",
                      "stack_xs": "0.5rem",
                      "stack_md": "1rem",
                      "stack_lg": "2rem",
                      "sidebar_width": "280px"
              },
              "fontFamily": {
                      "headline-lg": ["Plus Jakarta Sans", "Vazirmatn"],
                      "headline-md": ["Plus Jakarta Sans", "Vazirmatn"],
                      "body-lg": ["Inter", "Vazirmatn"],
                      "label-md": ["Geist", "Vazirmatn"],
                      "code-sm": ["JetBrains Mono"],
                      "headline-lg-mobile": ["Plus Jakarta Sans", "Vazirmatn"],
                      "body-md": ["Inter", "Vazirmatn"],
                      "display-lg": ["Plus Jakarta Sans", "Vazirmatn"]
              }
            }
          }
        }
    </script>
</head>
<body class="min-h-screen relative overflow-y-auto custom-scrollbar">
<!-- Background Shader -->
<div class="fixed inset-0 w-full h-full -z-10 opacity-60" style="display:block;">
<canvas id="shader-canvas-ANIMATION_2" style="display:block;width:100%;height:100%"></canvas>
<script>
(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_2');

  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = \`attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
  const fs = \`precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    vec2 p1 = vec2(0.5 + 0.3 * sin(u_time * 0.4), 0.5 + 0.2 * cos(u_time * 0.5));
    vec2 p2 = vec2(0.3 + 0.2 * cos(u_time * 0.3), 0.7 + 0.1 * sin(u_time * 0.6));
    vec2 p3 = vec2(0.7 + 0.2 * sin(u_time * 0.5), 0.3 + 0.2 * cos(u_time * 0.4));
    
    vec3 col1 = vec3(0.658, 0.333, 0.968); // #a855f7 (Purple)
    vec3 col2 = vec3(0.925, 0.282, 0.6);   // #ec4899 (Pink/Magenta)
    vec3 col3 = vec3(0.062, 0.725, 0.505); // #10b981 (Cyan/Emerald)
    
    float d1 = length(uv - p1);
    float d2 = length(uv - p2);
    float d3 = length(uv - p3);
    
    float f1 = 0.5 / (1.0 + d1 * 5.0);
    float f2 = 0.5 / (1.0 + d2 * 4.0);
    float f3 = 0.5 / (1.0 + d3 * 6.0);
    
    vec3 aurora = (col1 * f1 + col2 * f2 + col3 * f3) * 0.4;
    vec3 bg = vec3(0.02, 0.02, 0.04); // Deep dark background
    
    gl_FragColor = vec4(bg + aurora, 1.0);
}\`;
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // requestAnimationFrame(render); // Disabled for performance
  }
  render(0);
})();
</script>
</div>
<!-- Top Bar -->
<header class="w-full h-20 px-gutter flex items-center justify-between sticky top-0 z-50 bg-background/20 backdrop-blur-md">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center neon-glow-primary">
<span class="material-symbols-outlined text-on-primary-container">rocket_launch</span>
</div>
<div>
<h1 class="text-primary font-headline-md text-2xl tracking-tight leading-tight">Penhan</h1>
<p class="text-on-surface-variant text-xs opacity-70">Deep Space Command</p>
</div>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10">
<span class="text-on-surface font-label-md text-sm">${name}</span>
<div class="w-8 h-8 rounded-full overflow-hidden status-ring">
<img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXf8jzSr96FLJnNWvAqy1fiCKEkfkTdZCGRRnoGFf969YMhPV7MUJQxyWGmfkRe0ktEbIs2Dp-x11qSalOOgvZNQagYgWOGMrhs1H9_ZwzpYKi3gnjFbZp7t_yQQCV3OJ26XL51SwddJ3bViwjJxEsWbuce4-x_ehnPOlK0NC_smWBdkFwxmxyCla3hxV_Ew_7N6pXOhMHfkibcIZCqge7abGrGqaJZKiqPT1LCf0BIsx1pl1YOMiO2lsNL4ryBrPqhrpZZMnJbw"/>
</div>
</div>
</div>
</header>
<main class="container mx-auto px-gutter py-8 max-w-6xl">
<!-- Top Section: Bento Grid -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
<!-- User Status Card -->
<div class="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
<div class="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/10 rounded-full blur-3xl group-hover:bg-tertiary/20 transition-all"></div>
<div class="relative mb-6">
<div class="w-32 h-32 rounded-full p-1 bg-gradient-to-tr ${statusColorClass} status-ring">
<img class="w-full h-full rounded-full object-cover border-4 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlvFEDkTAEU64SUSLm2Lh497mtd01iowj2c4VSPh2wR1Q3icTd07CJXgDZhggbkm7-eHsZ--Nc0sto8gTowXXOv2X-I8IkXFuTNOUaq8w7FrhvTLCOlLmY7dELqktWidhd1N-TA-BHJh75h-G4D5mcpS6p7NWhPhSQBcrRm6r_kq_SV0zvawvnsHVYVwQZ_PYLbQ2Dtx8lNYH-r6beXmaShZX8NJqv2hCq241SNGbALBnUrCKR0matkCb62b9TlChQEMdhg6p7JQ"/>
</div>
<div class="absolute bottom-1 right-1 ${statusBadgeClass} px-3 py-1 rounded-full text-xs font-bold">
    ${statusText}
</div>
</div>
<h2 class="text-on-surface font-headline-md text-xl mb-1">${name}</h2>
<p class="text-on-surface-variant font-body-md text-sm opacity-80 mb-6" style="direction:ltr">#PX-${user.id.substring(0,8)}</p>
<div class="flex items-center gap-2 px-6 py-2 bg-tertiary/10 text-tertiary rounded-full border border-tertiary/20">
<span class="material-symbols-outlined text-sm">verified_user</span>
<span class="text-xs font-bold">${user.enabled ? 'اشتراک فعال' : 'غیر فعال'}</span>
</div>
</div>
<!-- Gauges Section -->
<div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
<!-- Gauge 1: Expiry -->
<div class="glass-panel p-6 rounded-3xl flex flex-col justify-between overflow-hidden relative">
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-on-surface-variant text-sm font-label-md">اعتبار زمانی</p>
<h3 class="text-on-surface font-headline-md text-xl farsi-nums mt-1">${expiryAbsolute}</h3>
</div>
<span class="material-symbols-outlined text-primary text-3xl">schedule</span>
</div>
<div class="relative h-24 w-full flex items-end">
<div class="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
<div class="absolute top-0 right-0 h-full bg-primary neon-glow-primary rounded-full transition-all duration-1000" style="width: ${expiryPercent}%;"></div>
</div>
<div class="absolute bottom-4 left-0 right-0 flex justify-between text-[10px] text-on-surface-variant font-label-md">
<span>شروع دوره</span>
<span>${expiryRelative}</span>
</div>
</div>
</div>
<!-- Gauge 2: Traffic -->
<div class="glass-panel p-6 rounded-3xl flex flex-col justify-between overflow-hidden relative">
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-on-surface-variant text-sm font-label-md">حجم مصرفی</p>
<h3 class="text-on-surface font-headline-md text-xl farsi-nums mt-1">${usageText}</h3>
</div>
<span class="material-symbols-outlined text-tertiary text-3xl">data_usage</span>
</div>
<div class="space-y-2">
<div class="flex justify-between text-xs text-on-surface-variant farsi-nums">
<span>مصرف شده: ${formatBytes(used)}</span>
<span>کل: ${limit > 0 ? formatBytes(limit) : 'نامحدود'}</span>
</div>
<div class="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
<div class="absolute top-0 right-0 h-full bg-tertiary neon-glow-success rounded-full transition-all duration-1000" style="width: ${percent}%;"></div>
</div>
</div>
<div class="mt-4 flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-tertiary pulse" style="background:#34d399"></div>
<p class="text-tertiary text-xs">اتصال پایدار</p>
</div>
</div>
</div>
</div>
<!-- Configuration Section -->
<h3 class="text-on-surface font-headline-md text-xl mb-6 pr-2 border-r-4 border-primary">تنظیمات اتصال</h3>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
<!-- VLESS Card -->
<div class="glass-panel rounded-3xl p-6 relative group border-t border-r border-white/5 hover:border-primary/30 transition-all">
<div class="flex items-center gap-4 mb-6">
<div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
<span class="material-symbols-outlined">bolt</span>
</div>
<div>
<h4 class="text-on-surface font-headline-md text-lg">VLESS + WS</h4>
<p class="text-on-surface-variant text-xs">مناسب برای اینترنت‌های پرسرعت</p>
</div>
</div>
<div class="bg-surface-container-lowest/50 rounded-xl p-4 mb-6 font-code-sm text-xs break-all border border-white/5 text-on-surface-variant/80 select-all" style="direction:ltr; text-align:left;">
    ${vlessWS}
</div>
<div class="grid grid-cols-2 gap-3">
<button class="flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-label-md text-sm hover:opacity-90 active:scale-95 transition-all" onclick="navigator.clipboard.writeText('${vlessWS}').then(() => alert('کانفیگ VLESS کپی شد'))">
<span class="material-symbols-outlined text-lg">content_copy</span>
                        کپی کانفیگ
                    </button>
<button class="flex items-center justify-center gap-2 py-3 bg-white/5 text-on-surface border border-white/10 rounded-xl font-label-md text-sm hover:bg-white/10 active:scale-95 transition-all" onclick="showQrModal('${vlessWS}', 'اتصال VLESS WS')">
<span class="material-symbols-outlined text-lg">qr_code_2</span>
                        نمایش QR
                    </button>
</div>
</div>
<!-- Trojan Card -->
<div class="glass-panel rounded-3xl p-6 relative group border-t border-r border-white/5 hover:border-secondary/30 transition-all">
<div class="flex items-center gap-4 mb-6">
<div class="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
<span class="material-symbols-outlined">security</span>
</div>
<div>
<h4 class="text-on-surface font-headline-md text-lg">Trojan + WS</h4>
<p class="text-on-surface-variant text-xs">امنیت بالا و دور زدن محدودیت‌ها</p>
</div>
</div>
<div class="bg-surface-container-lowest/50 rounded-xl p-4 mb-6 font-code-sm text-xs break-all border border-white/5 text-on-surface-variant/80 select-all" style="direction:ltr; text-align:left;">
    ${trojanWS}
</div>
<div class="grid grid-cols-2 gap-3">
<button class="flex items-center justify-center gap-2 py-3 bg-secondary text-on-secondary rounded-xl font-label-md text-sm hover:opacity-90 active:scale-95 transition-all" onclick="navigator.clipboard.writeText('${trojanWS}').then(() => alert('کانفیگ Trojan کپی شد'))">
<span class="material-symbols-outlined text-lg">content_copy</span>
                        کپی کانفیگ
                    </button>
<button class="flex items-center justify-center gap-2 py-3 bg-white/5 text-on-surface border border-white/10 rounded-xl font-label-md text-sm hover:bg-white/10 active:scale-95 transition-all" onclick="showQrModal('${trojanWS}', 'اتصال TROJAN WS')">
<span class="material-symbols-outlined text-lg">qr_code_2</span>
                        نمایش QR
                    </button>
</div>
</div>
</div>
<!-- Subscription Section -->
<div class="glass-panel rounded-[2rem] p-10 overflow-hidden relative">
<div class="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
<div class="relative z-10 flex flex-col md:flex-row items-center gap-10">
<!-- QR Code Display -->
<div class="w-48 h-48 bg-white p-3 rounded-2xl neon-glow-primary shrink-0 flex items-center justify-center">
<canvas id="sub-qr-canvas" style="display:block; width:100%; height:100%;"></canvas>
</div>
<div class="flex-1 text-center md:text-right">
<h3 class="text-on-surface font-headline-md text-2xl mb-4">لینک ساب‌اسکریپشن هوشمند</h3>
<p class="text-on-surface-variant font-body-md mb-8 max-w-xl text-justify">با استفاده از لینک زیر می‌توانید تمام کانفیگ‌های خود را در نرم‌افزارهای V2Ray، Shadowrocket یا V2rayNG به صورت یکجا دریافت و به صورت خودکار بروزرسانی کنید.</p>
<div class="flex flex-col sm:flex-row items-center gap-4">
<button class="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-l from-primary to-primary-container text-on-primary rounded-2xl font-headline-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" onclick="navigator.clipboard.writeText('${subLink}').then(() => alert('لینک ساب‌اسکریپشن کپی شد'))">
<span class="material-symbols-outlined">link</span>
                            کپی لینک ساب‌اسکریپشن
                        </button>
</div>
</div>
</div>
</div>
<footer class="mt-20 py-10 border-t border-white/5 text-center">
<p class="text-on-surface-variant/40 text-sm font-label-md">Penhan Deep Space Command © 2026 - All Systems Operational</p>
</footer>
</main>

<!-- QR Modal -->
<div id="qr-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:none; justify-content:center; align-items:center; z-index:10000; transition:0.3s;" onclick="closeQrModal()">
  <div style="background:rgba(31,31,38,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:28px; padding:28px 20px; max-width:320px; width:90%; box-shadow:0 30px 60px rgba(0,0,0,0.8); animation: zoomIn 0.25s; display:flex; flex-direction:column; align-items:center;" onclick="event.stopPropagation()">
    <style>
      @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    </style>
    <h3 id="qr-modal-title" style="font-size:16px; margin-bottom:20px; font-weight:800; color:#fff;"></h3>
    <div style="background:#fff; padding:12px; border-radius:16px; margin-bottom:24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); direction:ltr;">
      <canvas id="qr-canvas" style="display:block;"></canvas>
    </div>
    <button onclick="closeQrModal()" style="width:100%; padding:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; color:#fff; font-weight:700; cursor:pointer; transition:0.2s; outline:none;">بستن</button>
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
              size: 200,
              level: 'L'
            });
          }
          qrInstance.value = value;
        }
        function closeQrModal() {
          document.getElementById('qr-modal').style.display = 'none';
        }

        document.addEventListener('DOMContentLoaded', () => {
            // Generate Sub QR Code
            new QRious({
              element: document.getElementById('sub-qr-canvas'),
              size: 160,
              value: '${subLink}',
              level: 'L'
            });

            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mousedown', () => {
                    btn.style.transform = 'scale(0.95)';
                });
                btn.addEventListener('mouseup', () => {
                    btn.style.transform = 'scale(1)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'scale(1)';
                });
            });

            // Smooth opacity entrance for cards
            const panels = document.querySelectorAll('.glass-panel');
            panels.forEach((panel, index) => {
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    panel.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    panel.style.opacity = '1';
                    panel.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        });
</script>
</body></html>`;
}

function panelPage(hostname, adminUUID, defaultProxyIP, cfAccountId, cfApiToken) {
  return `<!DOCTYPE html>
<html class="dark" dir="rtl" lang="fa"><head>
<meta charset="UTF-8">
<title>پنل مدیریت پنهان</title>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<!-- Tailwind CDN with forms and container queries -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Icons & Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet"/>
<style>
    body {
        font-family: 'Vazirmatn', sans-serif;
        background-color: #131319;
        color: #e4e1ea;
        margin: 0;
        overflow: hidden;
    }
    .glass-panel {
        background: rgba(25, 25, 32, 0.4);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02), 0 20px 50px rgba(0,0,0,0.4);
    }
    .neon-glow-primary {
        box-shadow: 0 0 20px rgba(221, 183, 255, 0.25);
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(221, 183, 255, 0.2);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(221, 183, 255, 0.4);
    }
    /* Modals overlays styling */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(12px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 24px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .modal-overlay.active {
        display: flex;
        opacity: 1;
    }
    .modal-card {
        background: rgba(31, 31, 38, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 32px;
        max-width: 480px;
        width: 100%;
        transform: scale(0.95);
        transition: transform 0.3s ease;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .modal-overlay.active .modal-card {
        transform: scale(1);
    }
    /* Table hover */
    tbody tr {
        transition: background-color 0.2s ease;
    }
    tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.03);
    }
    /* Toolbar Selection */
    .pip-selbar {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 0 18px;
        margin-bottom: 0;
        height: 0;
        overflow: hidden;
        background: linear-gradient(90deg, rgba(139, 92, 246, 0.16), rgba(139, 92, 246, 0.04));
        border: 1px solid transparent;
        border-radius: 14px 14px 0 0;
        opacity: 0;
        transition: all 0.25s ease;
    }
    .pip-selbar.show {
        height: 56px;
        opacity: 1;
        margin-bottom: -1px;
        border-color: #ddb7ff;
    }
    /* Spinner spin */
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .pip-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top-color: #ddb7ff;
        border-radius: 50%;
        animation: spin .6s linear infinite;
    }
    .pip-act.spin {
        pointer-events: none;
        opacity: 0.7;
    }
    /* Toast notifications */
    .pip-toasts {
        position: fixed;
        bottom: 24px;
        left: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 9999;
    }
    .pip-toast {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 240px;
        max-width: 360px;
        padding: 13px 16px;
        border-radius: 12px;
        background: rgba(31, 31, 38, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 30px -8px rgba(0,0,0,0.6);
        font-size: 13px;
        font-weight: 600;
        color: #e4e1ea;
        animation: toastIn .25s cubic-bezier(.16,1,.3,1);
    }
    .pip-toast.ok { border-color: rgba(78, 222, 163, 0.4); }
    .pip-toast.err { border-color: rgba(255, 180, 171, 0.4); }
    .pip-toast.info { border-color: rgba(221, 183, 255, 0.4); }
    .pip-toast .tico { font-size: 16px; }
    @keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    .pip-toast.out { animation:toastOut .25s forwards; }
    @keyframes toastOut { to { opacity:0; transform:translateX(-20px); } }

    .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
</style>
</head>
<body class="custom-scrollbar h-screen overflow-hidden">
<!-- Global Background WebGL Shader -->
<div class="fixed inset-0 w-full h-full -z-10 opacity-30" style="display:block;">
<canvas id="shader-canvas-ANIMATION_2" style="display:block;width:100%;height:100%"></canvas>
<script>
(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_2');
  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = \`attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
  const fs = \`precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
    vec2 uv = v_texCoord;
    vec2 p1 = vec2(0.5 + 0.3 * sin(u_time * 0.4), 0.5 + 0.2 * cos(u_time * 0.5));
    vec2 p2 = vec2(0.3 + 0.2 * cos(u_time * 0.3), 0.7 + 0.1 * sin(u_time * 0.6));
    vec2 p3 = vec2(0.7 + 0.2 * sin(u_time * 0.5), 0.3 + 0.2 * cos(u_time * 0.4));
    vec3 col1 = vec3(0.658, 0.333, 0.968); // #a855f7 (Purple)
    vec3 col2 = vec3(0.925, 0.282, 0.6);   // #ec4899 (Pink)
    vec3 col3 = vec3(0.062, 0.725, 0.505); // #10b981 (Cyan/Emerald)
    float d1 = length(uv - p1);
    float d2 = length(uv - p2);
    float d3 = length(uv - p3);
    float f1 = 0.5 / (1.0 + d1 * 5.0);
    float f2 = 0.5 / (1.0 + d2 * 4.0);
    float f3 = 0.5 / (1.0 + d3 * 6.0);
    vec3 aurora = (col1 * f1 + col2 * f2 + col3 * f3) * 0.4;
    vec3 bg = vec3(0.02, 0.02, 0.04);
    gl_FragColor = vec4(bg + aurora, 1.0);
}\`;
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });
  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // requestAnimationFrame(render); // Disabled for performance
  }
  render(0);
})();
</script>
</div>

<!-- Sidebar Fixed Right -->
<aside class="fixed top-0 right-0 h-full w-[280px] bg-surface-container/30 backdrop-blur-xl border-l border-white/5 shadow-2xl z-50 flex flex-col py-8 px-4">
<div class="mb-12 px-2">
<div class="font-headline-md text-headline-md font-bold text-primary flex items-center gap-3">
<div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-lg neon-glow-primary">
<span class="material-symbols-outlined text-on-primary-container">rocket_launch</span>
</div>
<div>
<h1 class="font-bold text-primary tracking-tight">پنل پنها‌ن</h1>
<p class="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">Deep Space Command</p>
</div>
</div>
</div>
<nav class="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
<button id="nav-users" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-primary font-bold border-r-2 border-primary bg-primary/5 transition-all duration-300" onclick="nav('users')">
<span class="material-symbols-outlined">group</span>
<span class="font-body-md text-sm">کاربران</span>
</button>
<button id="nav-proxyip" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all duration-300" onclick="nav('proxyip')">
<span class="material-symbols-outlined">settings_ethernet</span>
<span class="font-body-md text-sm">پروکسی IP</span>
</button>
<button id="nav-nodes" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all duration-300" onclick="nav('nodes')">
<span class="material-symbols-outlined">lan</span>
<span class="font-body-md text-sm">نودها</span>
</button>
<button id="nav-api" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all duration-300" onclick="nav('api')">
<span class="material-symbols-outlined">key</span>
<span class="font-body-md text-sm">توکن‌های API</span>
</button>
<button id="nav-settings" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all duration-300" onclick="nav('settings')">
<span class="material-symbols-outlined">settings</span>
<span class="font-body-md text-sm">تنظیمات سیستم</span>
</button>
</nav>
<div class="mt-auto border-t border-white/5 pt-6 space-y-2">
<button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-error transition-all duration-300 text-right" onclick="window.location.href='/'">
<span class="material-symbols-outlined">logout</span>
<span class="font-body-md text-sm">خروج از پنل</span>
</button>
</div>
</aside>

<!-- TopAppBar Fixed -->
<header class="fixed top-0 left-0 right-[280px] h-16 flex justify-between items-center px-8 z-40 bg-transparent">
<div class="flex items-center gap-4 bg-surface-container/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 w-80">
<span class="material-symbols-outlined text-on-surface-variant text-sm">search</span>
<input class="bg-transparent border-none focus:ring-0 text-xs w-full placeholder-on-surface-variant/40 text-white" placeholder="جستجو..." type="text" oninput="searchFilter(this.value)"/>
</div>
<div class="flex items-center gap-3">
<div class="h-10 px-4 rounded-full flex items-center gap-3 bg-surface-container/60 border border-white/5">
<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary overflow-hidden flex items-center justify-center">
<span class="material-symbols-outlined text-sm text-white">person</span>
</div>
<span class="text-xs text-white">ادمین ارشد</span>
</div>
</div>
</header>

<!-- Main Container -->
<main class="mr-[280px] pt-24 px-8 pb-32 h-screen overflow-y-auto custom-scrollbar">
<div class="max-w-7xl mx-auto">

  <!-- ================= USERS PAGE ================= -->
  <div id="page-users" class="page active space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-white">مدیریت کاربران</h2>
        <p class="text-on-surface-variant mt-1 text-sm">تعریف و مانیتورینگ کاربران فعال سیستم در زمان واقعی</p>
      </div>
      <button class="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all" onclick="openAddUserModal()">
        <span class="material-symbols-outlined text-sm">person_add</span>
        <span class="text-xs">افزودن کاربر جدید</span>
      </button>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative group">
        <div class="relative z-10">
          <p class="text-on-surface-variant text-xs mb-2">کل کاربران</p>
          <h3 id="stat-total-users" class="text-3xl font-bold text-white">0</h3>
        </div>
        <div class="absolute -left-4 -bottom-4 opacity-10 text-white">
          <span class="material-symbols-outlined text-[100px]">groups</span>
        </div>
      </div>
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative group">
        <div class="relative z-10">
          <p class="text-on-surface-variant text-xs mb-2">کاربران فعال</p>
          <h3 id="stat-active-users" class="text-3xl font-bold text-tertiary">0</h3>
        </div>
        <div class="absolute -left-4 -bottom-4 opacity-10 text-tertiary">
          <span class="material-symbols-outlined text-[100px]">bolt</span>
        </div>
      </div>
      <div class="glass-panel rounded-2xl p-6 flex items-center gap-6 overflow-hidden relative">
        <div id="cf-circle-container" class="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg class="w-full h-full transform -rotate-90">
            <circle class="text-white/5" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-width="5"></circle>
            <circle id="cf-circle-progress" class="text-primary drop-shadow-[0_0_8px_rgba(221,183,255,0.6)]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-dasharray="175.8" stroke-dashoffset="0" stroke-width="5"></circle>
          </svg>
          <div id="cf-circle-text" class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">0%</div>
        </div>
        <div>
          <p class="text-on-surface-variant text-xs mb-1">امروز ورکر کلادفلر</p>
          <h3 id="stat-cf-reqs" class="text-lg font-bold text-white">در حال دریافت...</h3>
        </div>
        <button class="absolute left-4 top-4 text-on-surface-variant hover:text-white" onclick="loadCfMetrics()">
          <span class="material-symbols-outlined text-sm">refresh</span>
        </button>
      </div>
    </div>

    <!-- Table content -->
    <div class="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr class="bg-white/5 text-on-surface-variant text-xs">
            <th class="py-4 px-6 font-medium">نام کاربر</th>
            <th class="py-4 px-6 font-medium">UUID</th>
            <th class="py-4 px-6 font-medium">وضعیت اتصال</th>
            <th class="py-4 px-6 font-medium">ترافیک مصرفی</th>
            <th class="py-4 px-6 font-medium">تاریخ انقضا</th>
            <th class="py-4 px-6 font-medium text-left">عملیات</th>
          </tr>
        </thead>
        <tbody id="users-tbody" class="divide-y divide-white/5 text-sm">
          <tr><td colspan="6" class="py-10 text-center text-on-surface-variant/50">در حال بارگذاری لیست کاربران...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ================= PROXY IP PAGE ================= -->
  <div id="page-proxyip" class="page hidden space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-white">مدیریت Proxy IP</h2>
        <p class="text-on-surface-variant mt-1 text-sm">پایش، مرتب‌سازی و ایمپورت دسته‌ای آی‌پی‌های پروکسی تمیز کلادفلر</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs" onclick="openProxyIPImportModal()">
          <span class="material-symbols-outlined text-sm text-primary">download</span>
          <span>وارد کردن لیست</span>
        </button>
        <button class="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs" onclick="openProxyIPAddModal()">
          <span class="material-symbols-outlined text-sm text-primary">add</span>
          <span>آی‌پی جدید</span>
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
        <div>
          <p class="text-on-surface-variant text-xs mb-2">کل آی‌پی‌ها</p>
          <h3 id="stat-total-proxyip" class="text-3xl font-bold text-white">0</h3>
        </div>
        <span class="material-symbols-outlined text-[100px] opacity-10 absolute -left-4 -bottom-4 text-white">language</span>
      </div>
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
        <div>
          <p class="text-on-surface-variant text-xs mb-2">آی‌پی‌های فعال</p>
          <h3 id="stat-active-proxyip" class="text-3xl font-bold text-tertiary">0</h3>
        </div>
        <span class="material-symbols-outlined text-[100px] opacity-10 absolute -left-4 -bottom-4 text-tertiary">check_circle</span>
      </div>
      <div class="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
        <div>
          <p class="text-on-surface-variant text-xs mb-2">میانگین پینگ (از مرورگر)</p>
          <h3 id="stat-avg-ping" class="text-3xl font-bold text-secondary">--</h3>
        </div>
        <button class="absolute left-4 top-4 text-on-surface-variant hover:text-white" onclick="refreshAllProxyIP(event)">
          <span class="material-symbols-outlined text-sm">bolt</span>
        </button>
      </div>
    </div>

    <!-- Toolbar Filters -->
    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
      <div class="flex flex-wrap items-center gap-3">
        <select id="proxyip-filter-country" class="bg-white/5 border border-white/10 rounded-lg text-xs py-2 px-4 focus:ring-0 focus:border-primary text-white" onchange="filterProxyIP()">
          <option value="" class="bg-surface">🌍 همه کشورها</option>
          <option value="DE" class="bg-surface">🇩🇪 آلمان</option>
          <option value="US" class="bg-surface">🇺🇸 آمریکا</option>
          <option value="NL" class="bg-surface">🇳🇱 هلند</option>
          <option value="FR" class="bg-surface">🇫🇷 فرانسه</option>
          <option value="SG" class="bg-surface">🇸🇬 سنگاپور</option>
          <option value="JP" class="bg-surface">🇯🇵 ژاپن</option>
          <option value="TR" class="bg-surface">🇹🇷 ترکیه</option>
        </select>
        <select id="proxyip-filter-status" class="bg-white/5 border border-white/10 rounded-lg text-xs py-2 px-4 focus:ring-0 focus:border-primary text-white" onchange="filterProxyIP()">
          <option value="" class="bg-surface">⚡ همه وضعیت‌ها</option>
          <option value="active" class="bg-surface">✅ فعال</option>
          <option value="slow" class="bg-surface">🐢 کند</option>
          <option value="dead" class="bg-surface">❌ قطع</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 text-white" onclick="fetchProxyIPFromSources(event)">
          <span class="material-symbols-outlined text-sm">cloud_download</span>
          <span>دریافت اتوماتیک</span>
        </button>
        <button class="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 text-white" onclick="detectCountriesForIPs(event)">
          <span class="material-symbols-outlined text-sm">map</span>
          <span>تشخیص لوکیشن</span>
        </button>
        <button class="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 text-white" onclick="refreshAllProxyIP(event)">
          <span class="material-symbols-outlined text-sm">speed</span>
          <span>تست همگانی</span>
        </button>
      </div>
    </div>

    <!-- Selection Bar -->
    <div id="proxyip-selection-toolbar" class="pip-selbar border-white/10">
      <div class="cnt text-sm">
        <span class="num text-xs px-2 py-0.5 rounded-full" id="proxyip-toolbar-count">0</span>
        <span id="proxyip-selected-count">مورد انتخاب شده</span>
      </div>
      <button class="flex items-center gap-1 bg-error/20 hover:bg-error/30 border border-error/40 text-error rounded-lg px-4 py-1.5 text-xs font-bold transition-all" onclick="deleteSelectedProxyIP()">
        <span class="material-symbols-outlined text-sm">delete</span>
        <span>حذف دسته‌ای</span>
      </button>
    </div>

    <!-- Table -->
    <div class="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr class="bg-white/5 text-on-surface-variant text-xs">
            <th class="py-4 px-6 text-center w-12">
              <input type="checkbox" id="proxyip-select-all" class="pip-check rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30" onchange="toggleSelectAllProxyIP(this)">
            </th>
            <th class="py-4 px-6 text-center w-12">#</th>
            <th class="py-4 px-6 font-medium">آدرس IP</th>
            <th class="py-4 px-6 font-medium">پورت</th>
            <th class="py-4 px-6 font-medium">لوکیشن / کشور</th>
            <th class="py-4 px-6 font-medium">ISP پرووایدر</th>
            <th class="py-4 px-6 font-medium">پینگ</th>
            <th class="py-4 px-6 font-medium">وضعیت</th>
            <th class="py-4 px-6 text-left">عملیات</th>
          </tr>
        </thead>
        <tbody id="proxyip-tbody" class="divide-y divide-white/5 text-sm">
          <tr><td colspan="9" class="py-10 text-center text-on-surface-variant/50">در حال بارگذاری لیست پروکسی‌ها...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ================= NODES PAGE (MOCKUP) ================= -->
  <div id="page-nodes" class="page hidden space-y-6">
    <div>
      <h2 class="font-headline-lg text-headline-lg text-white">مدیریت نودها</h2>
      <p class="text-on-surface-variant mt-1 text-sm">پیکربندی سرورهای مرزی (Edge Nodes) جهت توزیع ترافیک در آینده</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between border-t-2 border-primary">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h4 class="text-white font-bold text-lg mb-1">Edge Node #1 (تهران)</h4>
            <p class="text-xs text-on-surface-variant/80">سرور پروکسی لبه ایران</p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary">
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
            فعال
          </span>
        </div>
        <div class="space-y-3 text-sm border-t border-white/5 pt-4">
          <div class="flex justify-between"><span class="text-on-surface-variant">آدرس سرور:</span><span class="font-mono text-white">node1.penhan.space</span></div>
          <div class="flex justify-between"><span class="text-on-surface-variant">پروتکل‌ها:</span><span class="text-white">VLESS WS, Trojan WS</span></div>
        </div>
      </div>
      <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between border-t-2 border-secondary">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h4 class="text-white font-bold text-lg mb-1">Edge Node #2 (خارج)</h4>
            <p class="text-xs text-on-surface-variant/80">سرور کمکی خارج کشور</p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary">
            <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            پشتیبان
          </span>
        </div>
        <div class="space-y-3 text-sm border-t border-white/5 pt-4">
          <div class="flex justify-between"><span class="text-on-surface-variant">آدرس سرور:</span><span class="font-mono text-white">node2.penhan.space</span></div>
          <div class="flex justify-between"><span class="text-on-surface-variant">پروتکل‌ها:</span><span class="text-white">VLESS WS, Trojan WS</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= API TOKENS PAGE ================= -->
  <div id="page-api" class="page hidden space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-white">توکن‌های API</h2>
        <p class="text-on-surface-variant mt-1 text-sm">ساخت کلیدهای دسترسی API جهت اتصال ربات‌های تلگرامی و اپلیکیشن‌ها</p>
      </div>
      <button class="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all text-xs" onclick="openModal('token-modal')">
        <span class="material-symbols-outlined text-sm">key</span>
        <span>ایجاد توکن جدید</span>
      </button>
    </div>

    <div class="glass-panel rounded-2xl overflow-hidden border border-white/5">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr class="bg-white/5 text-on-surface-variant text-xs">
            <th class="py-4 px-6 font-medium">نام توکن / ربات</th>
            <th class="py-4 px-6 font-medium">کلید توکن (API Key)</th>
            <th class="py-4 px-6 font-medium text-left">عملیات</th>
          </tr>
        </thead>
        <tbody id="tokens-tbody" class="divide-y divide-white/5 text-sm">
          <tr><td colspan="3" class="py-10 text-center text-on-surface-variant/50">در حال بارگذاری توکن‌ها...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- API Docs -->
    <div class="glass-panel p-8 rounded-3xl space-y-4">
      <h3 class="text-white font-bold text-lg">مستندات اتصال به API</h3>
      <p class="text-sm text-on-surface-variant/80">برای خودکارسازی مدیریت کاربران پنهان، می‌توانید درخواست‌های خود را به اندپوینت‌های زیر ارسال کنید:</p>
      <pre class="bg-black/40 border border-white/5 p-4 rounded-xl text-xs font-mono text-primary-fixed overflow-x-auto text-left leading-relaxed" style="direction:ltr;">
# ایجاد کاربر جدید
curl -X POST https://${hostname}/api/users \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"id":"UUID", "name":"User1", "limit_bytes": 10737418240, "expiry_date": 1712000000000}'

# دریافت لیست کاربران
curl -X GET https://${hostname}/api/users \\
  -H "Authorization: Bearer YOUR_TOKEN"
      </pre>
    </div>
  </div>

  <!-- ================= SETTINGS PAGE ================= -->
  <div id="page-settings" class="page hidden space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-white">تنظیمات عمومی</h2>
        <p class="text-on-surface-variant mt-1 text-sm">پیکربندی هویت ادمین، کلیدها و اتصالات کلادفلر</p>
      </div>
      <button class="bg-primary text-on-primary font-bold py-2.5 px-6 rounded-xl hover:opacity-90 transition-all active:scale-95" onclick="saveSettings()">
        <span>ذخیره تغییرات</span>
      </button>
    </div>

    <div class="glass-panel p-8 rounded-3xl max-w-2xl space-y-6">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">UUID ادمین (جهت احراز هویت)</label>
        <input type="text" id="st-uuid" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value="${adminUUID}">
      </div>
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">رمز عبور جدید پنل ادمین</label>
        <input type="password" id="st-pass" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" placeholder="برای عدم تغییر خالی بگذارید">
      </div>
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">Proxy IP پیش‌فرض</label>
        <input type="text" id="st-proxy" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value="${defaultProxyIP || ''}" placeholder="1.2.3.4">
      </div>
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">Cloudflare Account ID</label>
        <input type="text" id="st-cf-account" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value="${cfAccountId || ''}" placeholder="مثال: 8e5f2...">
      </div>
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant/80">Cloudflare API Token</label>
        <input type="password" id="st-cf-token" class="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" placeholder="برای عدم تغییر خالی بگذارید">
        <span class="text-[10px] text-on-surface-variant/50 block">با سطح دسترسی Account Analytics: Read جهت استعلام میزان لیمیت ریکوئست‌های ورکر شما</span>
      </div>
    </div>
  </div>

</div>
</main>

<!-- ================= SYSTEM MODALS ================= -->

<!-- User Modal (Redesigned) -->
<div class="modal-overlay" id="user-modal" onclick="closeModal('user-modal')">
  <div class="modal-card" onclick="event.stopPropagation()">
    <div class="flex justify-between items-center mb-6">
      <h3 id="user-modal-title" class="text-white font-bold text-lg">افزودن کاربر جدید</h3>
      <button class="text-on-surface-variant hover:text-white" onclick="closeModal('user-modal')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">شناسه UUID</label>
        <div class="flex gap-2">
          <input type="text" id="u-uuid" class="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50">
          <button class="bg-white/5 border border-white/10 rounded-xl px-3 hover:bg-white/10 text-white" onclick="generateUUID()">سخت</button>
        </div>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">نام کاربر</label>
        <input type="text" id="u-name" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="مثال: گوشی علی">
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">سقف حجم (گیگابایت، 0=نامحدود)</label>
          <input type="number" id="u-limit" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" value="0">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">تعداد کاربر مجاز (اتصال همزمان)</label>
          <input type="number" id="u-connlimit" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" value="0">
        </div>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">مهلت زمانی (تاریخ انقضا)</label>
        <input type="datetime-local" id="u-expiry" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50 text-right">
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">تمیز آی‌پی اختصاصی (Clean IP)</label>
        <input type="text" id="u-cleanip" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" placeholder="خالی برای استفاده از آی‌پی سرور">
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">پروکسی آی‌پی اختصاصی (Proxy IP)</label>
        <textarea id="u-proxyip" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" rows="2" placeholder="یک یا چند آی‌پی"></textarea>
      </div>
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all mt-4" onclick="saveUser()">ذخیره کاربر</button>
    </div>
  </div>
</div>

<!-- Token Modal (Redesigned) -->
<div class="modal-overlay" id="token-modal" onclick="closeModal('token-modal')">
  <div class="modal-card" onclick="event.stopPropagation()">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-white font-bold text-lg">ایجاد توکن جدید</h3>
      <button class="text-on-surface-variant hover:text-white" onclick="closeModal('token-modal')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">شناسه کلید دسترسی (Key)</label>
        <div class="flex gap-2">
          <input type="text" id="t-key" class="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50">
          <button class="bg-white/5 border border-white/10 rounded-xl px-3 hover:bg-white/10 text-white" onclick="document.getElementById('t-key').value = crypto.randomUUID().replace(/-/g,'')">تولید</button>
        </div>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">نام ربات / کاربر توکن</label>
        <input type="text" id="t-name" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="مثال: ربات تلگرامی پنهان">
      </div>
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all mt-4" onclick="saveToken()">ذخیره توکن</button>
    </div>
  </div>
</div>

<!-- Add Proxy IP Modal (Redesigned) -->
<div class="modal-overlay" id="proxyip-add-modal" onclick="closeModal('proxyip-add-modal')">
  <div class="modal-card" onclick="event.stopPropagation()">
    <div class="flex justify-between items-center mb-6">
      <h3 id="proxyip-add-modal-title" class="text-white font-bold text-lg">افزودن Proxy IP جدید</h3>
      <button class="text-on-surface-variant hover:text-white" onclick="closeModal('proxyip-add-modal')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2 space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">آی‌پی (IPv4)</label>
          <input type="text" id="pi-ip" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" placeholder="1.2.3.4">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">پورت</label>
          <input type="number" id="pi-port" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" value="443">
        </div>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">کشور (کد دو حرفی - خالی جهت تشخیص خودکار)</label>
        <input type="text" id="pi-country" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" placeholder="مثال: DE" maxlength="2" style="text-transform:uppercase">
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">شهر (اختیاری)</label>
          <input type="text" id="pi-city" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="Frankfurt">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-on-surface-variant/80">ISP (اختیاری)</label>
          <input type="text" id="pi-isp" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="Hetzner">
        </div>
      </div>
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all mt-4" onclick="saveProxyIP()">ذخیره پروکسی</button>
    </div>
  </div>
</div>

<!-- Import Proxy IP Modal (Redesigned) -->
<div class="modal-overlay" id="proxyip-import-modal" onclick="closeModal('proxyip-import-modal')">
  <div class="modal-card" onclick="event.stopPropagation()">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-white font-bold text-lg">وارد کردن لیست آی‌پی‌ها</h3>
      <button class="text-on-surface-variant hover:text-white" onclick="closeModal('proxyip-import-modal')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="space-y-4">
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">فرمت لیست</label>
        <select id="pi-import-format" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50">
          <option value="ip:port" class="bg-surface">ip:port (هر خط یک آی‌پی)</option>
        </select>
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-bold text-on-surface-variant/80">لیست آی‌پی‌ها</label>
        <textarea id="pi-import-text" class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono text-white focus:outline-none focus:border-primary/50" rows="8" placeholder="1.2.3.4:443&#10;5.6.7.8:8443 # توضیح"></textarea>
      </div>
      <span class="text-[10px] text-on-surface-variant/50 block">پس از وارد کردن آی‌پی‌ها، کشور هرکدام به صورت خودکار کوئری زده می‌شود.</span>
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all mt-4" onclick="importProxyIP()">ایمپورت پروکسی‌ها</button>
    </div>
  </div>
</div>

<div class="pip-toasts" id="pip-toasts"></div>

<script>
    const basePath = '/api';

    function showToast(msg, type) {
      type = type || 'info';
      const wrap = document.getElementById('pip-toasts');
      if (!wrap) return;
      const ico = type === 'ok' ? '✅' : (type === 'err' ? '❌' : 'ℹ️');
      const el = document.createElement('div');
      el.className = 'pip-toast ' + type;
      el.innerHTML = '<span class="tico">' + ico + '</span><span>' + msg + '</span>';
      wrap.appendChild(el);
      setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 260);
      }, 3200);
    }

    function nav(page) {
      document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('active');
      });
      document.querySelectorAll('aside nav button').forEach(b => {
        b.classList.remove('text-primary', 'font-bold', 'border-r-2', 'border-primary', 'bg-primary/5');
        b.classList.add('text-on-surface-variant', 'hover:bg-white/5', 'hover:text-primary');
      });
      
      const targetPage = document.getElementById('page-' + page);
      if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
      }
      
      const targetNav = document.getElementById('nav-' + page);
      if (targetNav) {
        targetNav.classList.add('text-primary', 'font-bold', 'border-r-2', 'border-primary', 'bg-primary/5');
        targetNav.classList.remove('text-on-surface-variant', 'hover:bg-white/5', 'hover:text-primary');
      }
      
      if (page === 'proxyip') {
        setTimeout(loadProxyIP, 50);
      }
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

    // Client-side search filters
    let searchVal = '';
    function searchFilter(val) {
      searchVal = val.toLowerCase();
      // Apply filters for active page
      const activePage = document.querySelector('.page.active');
      if (activePage.id === 'page-users') {
        const rows = document.querySelectorAll('#users-tbody tr');
        rows.forEach(row => {
          const txt = row.textContent.toLowerCase();
          if (txt.includes(searchVal)) row.style.display = '';
          else row.style.display = 'none';
        });
      } else if (activePage.id === 'page-proxyip') {
        const rows = document.querySelectorAll('#proxyip-tbody tr');
        rows.forEach(row => {
          const txt = row.textContent.toLowerCase();
          if (txt.includes(searchVal)) row.style.display = '';
          else row.style.display = 'none';
        });
      }
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
          tbody.innerHTML = '<tr><td colspan="6" class="py-10 text-center text-on-surface-variant/50">کاربری یافت نشد</td></tr>';
          return;
        }
        data.users.forEach(u => {
          let expiryHTML = '<span class="text-on-surface-variant/70 text-xs">نامحدود</span>';
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
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold \${badgeClass === 'green' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}">\${rel}</span>
            </div>\`;
          }
          let statusBadge = u.enabled ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary">فعال</span>' : '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error">مسدود</span>';
          
          let connLimitLabel = u.conn_limit > 0 ? u.conn_limit : '∞';
          let activeConnsLabel = u.active_connections !== undefined ? u.active_connections : 0;
          let activeConnsColor = activeConnsLabel > 0 ? 'var(--success)' : 'var(--muted)';
          
          tbody.innerHTML += \`<tr class="group hover:bg-white/5 transition-colors">
            <td class="py-5 px-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                  <span class="material-symbols-outlined text-on-surface-variant">person</span>
                </div>
                <div>
                  <div class="text-white font-medium flex items-center gap-2">
                    \${u.name}
                    <button class="material-symbols-outlined text-xs hover:text-primary" onclick="editUser('\${u.id}', '\${u.name}', \${u.limit_bytes}, \${u.expiry_date}, '\${u.clean_ip}', \${u.conn_limit || 0}, '\${(u.proxy_ip || '').replace(/\\r?\\n/g, '\\\\n')}')">edit</button>
                  </div>
                </div>
              </div>
            </td>
            <td class="py-5 px-6">
              <div class="flex items-center gap-2 group/uuid">
                <code class="text-code-sm text-on-surface-variant/80 bg-white/5 px-2 py-1 rounded">\${u.id.substring(0,8)}...</code>
                <button class="material-symbols-outlined text-sm opacity-0 group-hover/uuid:opacity-100 hover:text-primary transition-all" onclick="navigator.clipboard.writeText('\${u.id}').then(() => showToast('UUID کپی شد', 'ok'))">content_copy</button>
              </div>
            </td>
            <td class="py-5 px-6">
              <div class="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-white">
                \${statusBadge}
                <span class="text-on-surface-variant/70">👥 \${activeConnsLabel}/\${connLimitLabel}</span>
              </div>
            </td>
            <td class="py-5 px-6 text-on-surface-variant" style="direction:ltr; text-align:right;">
              <div class="w-32 inline-block">
                <div class="flex justify-between text-[10px] mb-1">
                  <span>\${formatBytes(u.used_bytes)}</span>
                  <span class="text-on-surface-variant/60">\${u.limit_bytes ? formatBytes(u.limit_bytes) : '∞'}</span>
                </div>
                <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-primary" style="width: \${u.limit_bytes ? Math.min(100, Math.round((u.used_bytes / u.limit_bytes) * 100)) : 0}%"></div>
                </div>
              </div>
            </td>
            <td class="py-5 px-6 text-on-surface-variant">
              \${expiryHTML}
            </td>
            <td class="py-5 px-6">
              <div class="flex items-center justify-end gap-2">
                <button class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/10 hover:bg-white/5 transition-all text-on-surface-variant" onclick="toggleUser('\${u.id}')">
                  \${u.enabled ? 'مسدودسازی' : 'فعال‌سازی'}
                </button>
                <button class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/10 hover:bg-white/5 transition-all text-on-surface-variant" onclick="window.open('https://\${window.location.hostname}/\${u.id}/sub', '_blank')">
                  ساب
                </button>
                <button class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors" onclick="deleteUser('\${u.id}')">
                  <span class="material-symbols-outlined">delete</span>
                </button>
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
       
       if (!id || !name) { showToast("نام و UUID الزامی است!", 'err'); return; }
       
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
          tbody.innerHTML += \`<tr class="group hover:bg-white/5 transition-colors">
            <td class="py-4 px-6 text-white font-medium">\${t.name}</td>
            <td class="py-4 px-6"><span class="font-mono text-sm bg-white/5 px-2 py-1 rounded text-primary-fixed">\${t.key}</span></td>
            <td class="py-4 px-6 text-left"><button class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all" onclick="deleteToken('\${t.key}')">حذف کلید</button></td>
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
       if (confirm('آیا مایل به حذف این توکن هستید؟')) {
         await fetch(basePath + '/tokens/' + key, {method: 'DELETE'});
         loadTokens();
       }
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
       showToast('تنظیمات با موفقیت ذخیره شد.', 'ok');
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
          document.getElementById('stat-cf-reqs').innerHTML = reqs.toLocaleString() + ' <span style="font-size:10px; color:#a1a1aa">/ ' + limit.toLocaleString() + '</span>';
          document.getElementById('cf-circle-container').style.display = 'block';
          document.getElementById('cf-circle-progress').setAttribute('stroke-dasharray', (percent * 1.758) + ', 175.8');
          document.getElementById('cf-circle-text').textContent = percent + '%';
          if (percent > 85) {
            document.getElementById('cf-circle-progress').setAttribute('stroke', 'var(--color-error)');
          } else if (percent > 60) {
            document.getElementById('cf-circle-progress').setAttribute('stroke', '#fbbf24');
          } else {
            document.getElementById('cf-circle-progress').setAttribute('stroke', 'var(--color-primary)');
          }
        } else {
          if (data.error && data.error !== 'Not Configured') {
            document.getElementById('stat-cf-reqs').innerHTML = '<span style="font-size:10px; color:var(--danger)">خطا: ' + data.error + '</span>';
          } else {
            document.getElementById('stat-cf-reqs').innerHTML = '<span style="font-size:10px; color:#a1a1aa">تنظیم نشده</span>';
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

    function countryToFlag(cc) {
      if (!cc || cc.length !== 2 || !/^[A-Za-z]{2}$/.test(cc)) return '🌍';
      const A = 0x1F1E6;
      const up = cc.toUpperCase();
      return String.fromCodePoint(A + up.charCodeAt(0) - 65, A + up.charCodeAt(1) - 65);
    }

    const COUNTRY_NAMES_FA = {
      US: 'آمریکا', DE: 'آلمان', NL: 'هلند', FR: 'فرانسه',
      GB: 'انگلستان', SG: 'سنگاپور', JP: 'ژاپن', TR: 'ترکیه', CA: 'کانادا',
      FI: 'فنلاند', SE: 'سوئد', RU: 'روسیه', PL: 'لهستان', CH: 'سوئیس',
      AT: 'اتریش', IT: 'ایتالیا', ES: 'اسپانیا', AE: 'امارات', IN: 'هند',
      HK: 'هنگ‌کنگ', KR: 'کره جنوبی', AU: 'استرالیا', BR: 'برزیل', CN: 'چین',
      UA: 'اوکراین', RO: 'رومانی', CZ: 'چک', BE: 'بلژیک', DK: 'دانمارک',
      NO: 'نروژ', IE: 'ایرلند', LU: 'لوکزامبورگ', LT: 'لیتوانی', LV: 'لتونی',
      EE: 'استونی', BG: 'بلغارستان', HU: 'مجارستان', PT: 'پرتغال', GR: 'یونان',
      IL: 'اسرائیل', SA: 'عربستان', QA: 'قطر', TW: 'تایوان', TH: 'تایلند',
      VN: 'ویتنام', ID: 'اندونزی', MY: 'مالزی', PH: 'فیلیپین', ZA: 'آفریقای جنوبی'
    };
    function countryName(cc) {
      if (!cc) return '—';
      return COUNTRY_NAMES_FA[cc.toUpperCase()] || cc.toUpperCase();
    }

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
        document.getElementById('proxyip-tbody').innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 40px; color:#a1a1aa;">خطا در بارگذاری: ' + e.message + '</td></tr>';
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
        tbody.innerHTML = '<tr><td colspan="9" class="py-10 text-center text-on-surface-variant/40"><div class="text-3xl mb-2">🌍</div>هیچ آی‌پی پروکسیی یافت نشد</td></tr>';
        updateSelectionToolbar();
        return;
      }

      tbody.innerHTML = filtered.map((p, idx) => {
        const st = p.status === 'active' ? 'on' : (p.status === 'slow' ? 'slow' : (p.status === 'unknown' ? 'unk' : 'off'));
        const stText = p.status === 'active' ? 'فعال' : (p.status === 'slow' ? 'کند' : (p.status === 'unknown' ? 'نامشخص' : 'مرده'));
        const flag = countryToFlag(p.country);
        const cname = countryName(p.country);
        const loc = p.city ? cname + ' · ' + p.city : cname;
        const key = p.ip + ':' + p.port;
        const isSel = proxyIPSelectedRows.has(key);
        const pingCls = p.ping == null ? '' : (p.ping < 300 ? 'good' : (p.ping < 800 ? 'mid' : 'bad'));
        const pingTxt = p.ping != null ? p.ping + ' ms' : '—';

        return \`
        <tr class="group hover:bg-white/5 transition-all \${isSel ? 'bg-primary/5' : ''}">
          <td class="py-4 px-6 text-center">
            <input type="checkbox" class="pip-check proxyip-checkbox rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30" value="\${key}" \${isSel ? 'checked' : ''} onchange="toggleProxyIPSelection(this)">
          </td>
          <td class="py-4 px-6 text-center text-on-surface-variant/60 font-semibold text-xs">\${idx + 1}</td>
          <td class="py-4 px-6 font-mono text-sm tracking-wide text-white">\${p.ip}</td>
          <td class="py-4 px-6 font-mono text-xs text-on-surface-variant/70"><span class="bg-white/5 px-2 py-1 rounded">\${p.port}</span></td>
          <td class="py-4 px-6 text-sm text-on-surface-variant"><span class="mr-2">\${flag}</span> \${loc}</td>
          <td class="py-4 px-6 text-xs text-on-surface-variant/80 max-w-[150px] truncate" title="\${p.isp || ''}">\${p.isp || '—'}</td>
          <td class="py-4 px-6 font-mono font-bold text-xs"><span class="\${pingCls === 'good' ? 'text-tertiary' : (pingCls === 'mid' ? 'text-secondary' : 'text-error')}">\${pingTxt}</span></td>
          <td class="py-4 px-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold \${st === 'on' ? 'bg-tertiary/10 text-tertiary' : (st === 'slow' ? 'bg-secondary/10 text-secondary' : (st === 'unk' ? 'bg-white/5 text-on-surface-variant/60' : 'bg-error/10 text-error'))}">
              <span class="w-1.5 h-1.5 rounded-full \${st === 'on' ? 'bg-tertiary' : (st === 'slow' ? 'bg-secondary' : (st === 'unk' ? 'bg-on-surface-variant/60' : 'bg-error'))}"></span>
              \${stText}
            </span>
          </td>

          <td class="py-4 px-6">
            <div class="flex items-center justify-end gap-2">
              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" onclick="testProxyIP('\${p.ip}', \${p.port}, event)" title="تست اتصال">
                <span class="material-symbols-outlined text-sm">bolt</span>
              </button>
              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors" onclick="deleteProxyIP('\${p.ip}', \${p.port})" title="حذف">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>\`;
      }).join('');
      updateSelectionToolbar();
    }

    function filterProxyIP() {
      renderProxyIPTable();
    }

    async function pingIPClient(ip, port, timeoutMs = 2500) {
      const start = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        await fetch('https://' + ip + ':' + port + '/cdn-cgi/trace', {
          mode: 'no-cors',
          signal: controller.signal
        });
        clearTimeout(timeout);
        const ping = Date.now() - start;
        return { ip, port, ping, status: 'active' };
      } catch (e) {
        clearTimeout(timeout);
        return { ip, port, ping: null, status: 'dead' };
      }
    }

    async function refreshAllProxyIP(e) {
      const btn = e && e.target ? e.target.closest('button') : null;
      let originalText = '';
      if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '🔄 در حال تست...';
        btn.disabled = true;
      }

      try {
        const results = [];
        const batchSize = 10;
        
        for (let i = 0; i < proxyIPData.length; i += batchSize) {
          const batch = proxyIPData.slice(i, i + batchSize);
          if (btn) btn.innerHTML = '🔄 در حال تست (' + i + '/' + proxyIPData.length + ')...';
          const batchResults = await Promise.all(batch.map(p => pingIPClient(p.ip, p.port)));
          results.push(...batchResults);
        }

        if (btn) btn.innerHTML = '💾 در حال ذخیره...';

        const res = await fetch(basePath + '/proxyip/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results })
        });
        const data = await res.json();
        if (data.ok) {
          showToast('بروزرسانی موفق: ' + results.filter(r => r.status === 'active').length + ' آی‌پی فعال', 'ok');
          await loadProxyIP();
        } else {
          alert('خطا در ذخیره‌سازی نتایج: ' + (data.error || 'نامشخص'));
        }
      } catch (e) {
        alert('خطا در تست آی‌پی‌ها: ' + e.message);
      } finally {
        if (btn) {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      }
    }

    async function testProxyIP(ip, port, ev) {
      const btn = ev && ev.target ? ev.target.closest('button') : null;
      let original = null;
      if (btn) { original = btn.innerHTML; btn.classList.add('spin'); btn.innerHTML = '<span class="pip-spinner"></span>'; }

      try {
        const r = await pingIPClient(ip, port);
        const res = await fetch(basePath + '/proxyip/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results: [r] })
        });
        const data = await res.json();
        if (data.ok) {
          if (r.status === 'active') {
            showToast(ip + ' فعال است · پینگ ' + r.ping + 'ms', 'ok');
          } else {
            showToast(ip + ' پاسخ نداد (مرده)', 'err');
          }
          const item = proxyIPData.find(p => p.ip === ip && p.port == port);
          if (item) { item.status = r.status; item.ping = r.ping; item.last_check = Date.now(); }
          renderProxyIPTable();
          updateProxyIPStats();
        } else {
          showToast('خطا در ذخیره‌سازی: ' + (data.error || 'نامشخص'), 'err');
        }
      } catch (e) {
        showToast('خطا در تست: ' + e.message, 'err');
      } finally {
        if (btn && original !== null) { btn.classList.remove('spin'); btn.innerHTML = original; }
      }
    }

    async function fetchProxyIPFromSources(e) {
      const btn = e && e.target ? e.target.closest('button') : null;
      let originalText = '';
      if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '☁️ در حال دریافت...';
        btn.disabled = true;
      }
  
      try {
        const res = await fetch(basePath + '/proxyip/fetch', { method: 'POST' });
        const data = await res.json();
        if (data.ok) {
          showToast('✅ ' + (data.count || 0) + ' آی‌پی جدید دریافت شد', 'ok');
          loadProxyIP();
        } else {
          showToast('خطا: ' + (data.error || 'نامشخص'), 'err');
        }
      } catch (e) {
        showToast('خطا: ' + e.message, 'err');
      } finally {
        if (btn) {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      }
    }

    async function detectCountriesForIPs(e) {
      const btn = e && e.target ? e.target.closest('button') : null;
      let originalText = '';
      if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '🌍 در حال تشخیص...';
        btn.disabled = true;
      }

      try {
        const res = await fetch(basePath + '/proxyip/detect-countries', { method: 'POST' });
        const data = await res.json();
        if (data.ok) {
          showToast('✅ کشورِ ' + (data.updated || 0) + ' آی‌پی تشخیص داده شد', 'ok');
          loadProxyIP();
        } else {
          showToast('خطا: ' + (data.error || 'نامشخص'), 'err');
        }
      } catch (e) {
        showToast('خطا: ' + e.message, 'err');
      } finally {
        if (btn) {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      }
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

    function updateSelectionToolbar() {
      const count = proxyIPSelectedRows.size;
      const toolbar = document.getElementById('proxyip-selection-toolbar');
      const countEl = document.getElementById('proxyip-selected-count');
      const toolbarCountEl = document.getElementById('proxyip-toolbar-count');
      const selectAllCheckbox = document.getElementById('proxyip-select-all');
  
      if (count > 0) {
        toolbar.classList.add('show');
        countEl.textContent = 'آی‌پی انتخاب شده';
        toolbarCountEl.textContent = count;
      } else {
        toolbar.classList.remove('show');
        countEl.textContent = 'آی‌پی انتخاب شده';
        toolbarCountEl.textContent = 0;
      }

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
      
      if (!ip) { showToast('آی‌پی الزامی است', 'err'); return; }
      
      try {
        const res = await fetch(basePath + '/proxyip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, port, country, city, isp })
        });
        const data = await res.json();
        if (data.ok) {
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
        if (data.ok) loadProxyIP();
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
        if (data.ok) {
          closeModal('proxyip-import-modal');
          alert('✅ ' + (data.count || 0) + ' آی‌پی وارد شد');
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
        if (data.ok) {
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

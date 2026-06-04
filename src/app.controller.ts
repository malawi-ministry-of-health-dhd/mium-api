import { Controller, Get, Res } from '@nestjs/common';
import express from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get('logo')
  getLogo(@Res() res: express.Response) {
    const logoPath = join(__dirname, '..', '..', 'public', 'muim_logo.png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(logoPath);
  }

  @Get()
  getLanding(@Res() res: express.Response) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MIUM API — MAHIS Integrated User Management</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Design tokens ── */
    :root {
      --bg:            #0d1117;
      --panel-bg:      rgba(0,0,0,0.58);
      --panel-border:  rgba(255,255,255,0.07);
      --card-bg:       rgba(255,255,255,0.05);
      --card-border:   rgba(255,255,255,0.10);
      --text-1:        #ffffff;
      --text-2:        rgba(255,255,255,0.58);
      --text-3:        rgba(255,255,255,0.30);
      --text-4:        rgba(255,255,255,0.20);
      --subtitle:      rgba(255,255,255,0.38);
      --feature:       rgba(255,255,255,0.55);
      --accent:        #4db6ac;
      --accent-dim:    rgba(77,182,172,0.12);
      --accent-border: rgba(77,182,172,0.30);
      --accent-glow:   rgba(77,182,172,0.32);
      --accent-hover:  rgba(77,182,172,0.50);
      --particle:      rgba(255,255,255,0.75);
      --line-alpha:    0.22;
      --toggle-bg:     rgba(255,255,255,0.08);
      --toggle-border: rgba(255,255,255,0.15);
      --toggle-icon:   rgba(255,255,255,0.7);
    }

    [data-theme="light"] {
      --bg:            #eef2f7;
      --panel-bg:      rgba(255,255,255,0.82);
      --panel-border:  rgba(0,0,0,0.08);
      --card-bg:       rgba(255,255,255,0.72);
      --card-border:   rgba(0,0,0,0.09);
      --text-1:        #0d1117;
      --text-2:        rgba(13,17,23,0.62);
      --text-3:        rgba(13,17,23,0.40);
      --text-4:        rgba(13,17,23,0.28);
      --subtitle:      rgba(13,17,23,0.42);
      --feature:       rgba(13,17,23,0.55);
      --accent:        #00897b;
      --accent-dim:    rgba(0,137,123,0.10);
      --accent-border: rgba(0,137,123,0.28);
      --accent-glow:   rgba(0,137,123,0.25);
      --accent-hover:  rgba(0,137,123,0.45);
      --particle:      rgba(30,50,80,0.55);
      --line-alpha:    0.12;
      --toggle-bg:     rgba(0,0,0,0.06);
      --toggle-border: rgba(0,0,0,0.12);
      --toggle-icon:   rgba(13,17,23,0.65);
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text-1);
      height: 100vh;
      overflow: hidden;
      display: flex;
      transition: background 0.35s ease, color 0.35s ease;
    }

    canvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    /* ── Theme toggle ── */
    .theme-toggle {
      position: fixed;
      top: 20px;
      right: 24px;
      z-index: 10;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--toggle-border);
      background: var(--toggle-bg);
      backdrop-filter: blur(8px);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.25s, border-color 0.25s, transform 0.18s;
      color: var(--toggle-icon);
    }
    .theme-toggle:hover { transform: scale(1.1); }
    .theme-toggle svg   { width: 18px; height: 18px; }
    .icon-sun  { display: none; }
    .icon-moon { display: block; }
    [data-theme="light"] .icon-sun  { display: block; }
    [data-theme="light"] .icon-moon { display: none; }

    /* ── Left logo panel ── */
    .logo-panel {
      position: relative;
      z-index: 2;
      width: 320px;
      min-width: 320px;
      height: 100vh;
      background: var(--panel-bg);
      border-right: 1px solid var(--panel-border);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 48px;
      gap: 24px;
      transition: background 0.35s ease, border-color 0.35s ease;
    }

    .logo-panel img {
      width: 200px;
      height: auto;
      object-fit: contain;
      filter: drop-shadow(0 6px 28px rgba(0,0,0,0.25));
    }

    .logo-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--text-3);
      text-align: center;
    }

    .panel-version {
      position: absolute;
      bottom: 24px;
      font-size: 0.68rem;
      color: var(--text-4);
    }

    /* ── Main content ── */
    .main {
      position: relative;
      z-index: 2;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(18px);
      border-radius: 20px;
      padding: 48px 52px;
      max-width: 580px;
      width: 100%;
      transition: background 0.35s ease, border-color 0.35s ease;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: var(--accent-dim);
      border: 1px solid var(--accent-border);
      color: var(--accent);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 100px;
      margin-bottom: 22px;
      transition: background 0.35s, border-color 0.35s, color 0.35s;
    }

    .badge-dot {
      width: 6px; height: 6px;
      background: var(--accent);
      border-radius: 50%;
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    h1 {
      font-size: 2.1rem;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 6px;
      color: var(--text-1);
    }

    .subtitle {
      font-size: 0.88rem;
      color: var(--subtitle);
      margin-bottom: 26px;
      letter-spacing: 0.04em;
    }

    .divider {
      width: 36px; height: 2px;
      background: linear-gradient(90deg, var(--accent), transparent);
      border-radius: 2px;
      margin-bottom: 26px;
    }

    .description {
      font-size: 0.92rem;
      line-height: 1.8;
      color: var(--text-2);
      margin-bottom: 28px;
    }

    .description strong { color: var(--text-1); font-weight: 600; }

    .features {
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin-bottom: 36px;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: var(--feature);
    }

    .feature-dot {
      width: 5px; height: 5px;
      background: var(--accent);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .btn-docs {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #4db6ac 0%, #00897b 100%);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 13px 28px;
      border-radius: 10px;
      text-decoration: none;
      box-shadow: 0 4px 22px var(--accent-glow);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }

    .btn-docs:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px var(--accent-hover);
    }

    .btn-docs svg { width: 17px; height: 17px; }

    footer {
      position: fixed;
      bottom: 18px;
      right: 24px;
      z-index: 3;
      font-size: 0.7rem;
      color: var(--text-4);
    }
  </style>
</head>
<body>

  <canvas id="c"></canvas>

  <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
    <!-- Moon: shown in dark mode (click → light) -->
    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
    <!-- Sun: shown in light mode (click → dark) -->
    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  </button>

  <div class="logo-panel">
    <img id="mium-logo" alt="MIUM Logo">
    <span class="logo-label">MIUM Platform</span>
    <span class="panel-version">v1.0</span>
  </div>

  <main class="main">
    <div class="card">
      <div class="badge"><span class="badge-dot"></span>Live</div>
      <h1>MAHIS Integrated<br>User Management</h1>
      <p class="subtitle">REST API &nbsp;·&nbsp; JWT Auth &nbsp;·&nbsp; Role-Based Access</p>
      <div class="divider"></div>
      <p class="description">
        MIUM is the <strong>central identity and access layer</strong> for the MAHIS ecosystem.
        It manages users, roles, programs and facility assignments — giving every connected
        health information system a single, trusted source of user data.
      </p>
      <div class="features">
        <div class="feature"><span class="feature-dot"></span>JWT-secured authentication &amp; session management</div>
        <div class="feature"><span class="feature-dot"></span>Role, program &amp; facility-based access control</div>
        <div class="feature"><span class="feature-dot"></span>MEMIS user synchronisation</div>
        <div class="feature"><span class="feature-dot"></span>Structured audit &amp; request logging</div>
      </div>
      <a class="btn-docs" href="api/docs" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        View API Documentation
      </a>
    </div>
  </main>

  <footer>© 2025 LUKE International · MAHIS</footer>

  <script>
    // ── Logo — tries /api/logo then falls back to /memis2/api/logo ──
    var logoPaths = ['/api/logo', '/memis2/api/logo'];
    (function tryNext(paths) {
      if (!paths.length) { console.warn('Logo: all paths exhausted'); return; }
      var path = paths[0];
      fetch(path)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.blob();
        })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var img = document.getElementById('mium-logo');
          img.src = url;
          img.onload = function () { URL.revokeObjectURL(url); };
          console.info('Logo loaded from:', path);
        })
        .catch(function (err) {
          console.warn('Logo fetch failed for ' + path + ':', err.message, '— trying next');
          tryNext(paths.slice(1));
        });
    })(logoPaths);

    (function () {
      // ── Theme ──────────────────────────────────────────────
      var html   = document.documentElement;
      var toggle = document.getElementById('themeToggle');
      var stored = localStorage.getItem('mium-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme  = stored || (prefersDark ? 'dark' : 'light');

      function applyTheme(t) {
        theme = t;
        html.setAttribute('data-theme', t);
        localStorage.setItem('mium-theme', t);
      }

      applyTheme(theme);

      toggle.addEventListener('click', function () {
        applyTheme(theme === 'dark' ? 'light' : 'dark');
      });

      // Stay in sync if OS preference changes and user hasn't overridden
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem('mium-theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });

      // ── Canvas ─────────────────────────────────────────────
      var canvas = document.getElementById('c');
      var ctx    = canvas.getContext('2d');
      var W, H;
      var mouse  = { x: -9999, y: -9999 };

      function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener('mouseleave', function () {
        mouse.x = -9999;
        mouse.y = -9999;
      });

      var COUNT        = 100;
      var CONNECT_DIST = 140;
      var REPEL_DIST   = 110;
      var BASE_SPEED   = 0.9;
      var DRIFT        = 0.06;  // random nudge each frame to keep stars moving

      var pts = [];
      for (var i = 0; i < COUNT; i++) {
        var angle = Math.random() * Math.PI * 2;
        var spd   = BASE_SPEED * (0.5 + Math.random() * 0.8);
        pts.push({
          x:  Math.random() * window.innerWidth,
          y:  Math.random() * window.innerHeight,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          r:  Math.random() * 1.4 + 0.8,
        });
      }

      function frame() {
        ctx.clearRect(0, 0, W, H);

        var i, j, p, q, dx, dy, dist, alpha, force, spd;

        for (i = 0; i < COUNT; i++) {
          p = pts[i];

          // Random drift — keeps stars moving continuously
          p.vx += (Math.random() - 0.5) * DRIFT;
          p.vy += (Math.random() - 0.5) * DRIFT;

          // Mouse repulsion
          dx   = p.x - mouse.x;
          dy   = p.y - mouse.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_DIST && dist > 0) {
            force = (REPEL_DIST - dist) / REPEL_DIST;
            p.vx += (dx / dist) * force * 0.4;
            p.vy += (dy / dist) * force * 0.4;
          }

          // Soft speed cap — clamp but don't damp so stars keep cruising
          spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > BASE_SPEED * 3.5) {
            p.vx = (p.vx / spd) * BASE_SPEED * 3.5;
            p.vy = (p.vy / spd) * BASE_SPEED * 3.5;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Wrap edges
          if (p.x < -10)     p.x = W + 10;
          if (p.x > W + 10)  p.x = -10;
          if (p.y < -10)     p.y = H + 10;
          if (p.y > H + 10)  p.y = -10;

          // Dot — colour based on current theme
          var isLight = html.getAttribute('data-theme') === 'light';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 6.2832);
          ctx.fillStyle = isLight ? 'rgba(30,50,80,0.55)' : 'rgba(255,255,255,0.75)';
          ctx.fill();
        }

        // Lines
        var isLight = html.getAttribute('data-theme') === 'light';
        var lineAlpha = isLight ? 0.12 : 0.22;
        var lineBase  = isLight ? '0,0,0' : '255,255,255';
        for (i = 0; i < COUNT - 1; i++) {
          for (j = i + 1; j < COUNT; j++) {
            p = pts[i]; q = pts[j];
            dx   = p.x - q.x;
            dy   = p.y - q.y;
            dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECT_DIST) {
              alpha = (1 - dist / CONNECT_DIST) * lineAlpha;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = 'rgba(' + lineBase + ',' + alpha + ')';
              ctx.lineWidth   = 0.7;
              ctx.stroke();
            }
          }
        }

        requestAnimationFrame(frame);
      }

      frame();
    })();
  </script>
</body>
</html>`;
    res.send(html);
  }
}

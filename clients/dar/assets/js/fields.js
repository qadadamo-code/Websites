/* DAR ME — generative canvas fields. Each <canvas class="fx" data-fx="mode"> gets one. */
(function () {
  const RED = [229, 9, 20];
  const RTL = document.documentElement.dir === 'rtl';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE = matchMedia('(max-width: 640px)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2);
  const fields = [];
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth; mouse.ty = e.clientY / innerHeight; }, { passive: true });

  const rnd = (a, b) => a + Math.random() * (b - a);
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // ---------- land points (Gulf region) ----------
  let LAND = null;
  function land() {
    if (LAND) return LAND;
    const D = window.DAR_LAND; LAND = [];
    if (!D) return LAND;
    D.rows.split('|').forEach((row, j) => {
      if (!row) return;
      const v = row.split(' ').map(Number);
      for (let k = 0; k < v.length; k += 2) for (let i = v[k]; i < v[k] + v[k + 1]; i++) LAND.push([D.lon0 + i * D.step, D.lat0 - j * D.step]);
    });
    return LAND;
  }
  const CITIES = [
    { n: 'AL KHOBAR', lon: 50.21, lat: 26.28, hq: 1 },
    { n: 'RIYADH', lon: 46.68, lat: 24.71 },
    { n: 'KUWAIT', lon: 47.98, lat: 29.37 },
    { n: 'MANAMA', lon: 50.58, lat: 26.22 },
    { n: 'DUBAI', lon: 55.27, lat: 25.2 },
    { n: 'AMMAN', lon: 35.93, lat: 31.95 },
    { n: 'JEDDAH', lon: 39.19, lat: 21.49 },
    { n: 'ABU DHABI', lon: 54.37, lat: 24.45 },
  ];

  // ---------- base class ----------
  function Field(cv) {
    this.cv = cv; this.ctx = cv.getContext('2d'); this.mode = cv.dataset.fx; this.mini = !!cv.dataset.mini;
    this.zoom = +(cv.dataset.zoom || 0); this.dim = !!cv.dataset.dim; this.t = 0; this.vis = false; this.intro = 0;
    this.resize(); this.init();
  }
  Field.prototype.resize = function () {
    const r = this.cv.getBoundingClientRect();
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.cv.width = Math.round(this.w * DPR); this.cv.height = Math.round(this.h * DPR);
    this.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (this.inited) this.init();
  };
  Field.prototype.init = function () { this.inited = true; (INIT[this.mode] || INIT.network).call(this); };
  Field.prototype.frame = function (dt) { this.t += dt; this.intro = Math.min(1, this.intro + dt / 2.2); (DRAW[this.mode] || DRAW.network).call(this, dt); };

  const INIT = {}, DRAW = {};

  /* ===== MAP: perspective dot-matrix of the Gulf with live arcs ===== */
  INIT.map = function () {
    const pts = land();
    const z = this.zoom;
    const c = z === 2 ? { lon: 50.0, lat: 26.3, s: 2.4 } : z === 1 ? { lon: 46.5, lat: 27.5, s: 1.15 } : { lon: 46.5, lat: 27.0, s: 1.0 };
    const unit = Math.max(this.w, this.h * 1.3) / 30 * c.s;
    const cosl = Math.cos(27 * Math.PI / 180);
    this.P = [];
    for (const p of pts) {
      const x = (p[0] - c.lon) * cosl * unit, y = (c.lat - p[1]) * unit;
      if (Math.abs(x) > this.w * 1.1 || Math.abs(y) > this.h * 1.6) continue;
      this.P.push({ x, y, s: Math.random(), d: Math.hypot(p[0] - 50.21, p[1] - 26.28) });
    }
    this.C = CITIES.map((q) => ({ ...q, x: (q.lon - c.lon) * cosl * unit, y: (c.lat - q.lat) * unit }));
    this.arcs = this.C.filter((q) => !q.hq).map((q, i) => ({ to: q, o: Math.random(), sp: rnd(0.12, 0.22) }));
    this.unit = unit;
    this.ox = this.zoom === 2 ? 0.62 : (this.w < 700 ? 0.5 : (RTL ? 0.36 : 0.64));
    if (this.zoom === 1) this.ox = this.w < 700 ? 0.5 : (RTL ? 0.32 : 0.68);
    if (this.zoom === 2 && RTL) this.ox = 0.38;
    if (this.w < 700) this.ox = 0.5;
    this.tilt = 0.95;
  };
  DRAW.map = function () {
    const g = this.ctx, w = this.w, h = this.h, t = this.t;
    g.clearRect(0, 0, w, h);
    mouse.x += (mouse.tx - mouse.x) * 0.04; mouse.y += (mouse.ty - mouse.y) * 0.04;
    const rot = (mouse.x - 0.5) * 0.12 + Math.sin(t * 0.07) * 0.05;
    const tilt = this.tilt + (mouse.y - 0.5) * 0.12;
    const cx = w * this.ox, cy = h * (this.zoom === 2 ? 0.5 : 0.52), f = 900;
    const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
    const proj = (x, y, z) => {
      const X = x * cr - y * sr, Y = x * sr + y * cr;
      const Y2 = Y * ct - z * st, Z2 = Y * st + z * ct;
      const k = f / (f + Z2);
      return [cx + X * k, cy + Y2 * k, k];
    };
    const wave = (t * 0.55) % 3.2;
    const B = [[], [], [], [], []];
    const rev = this.intro;
    for (const p of this.P) {
      const dn = p.d / 22;
      if (dn > rev * 1.3) continue;
      const q = proj(p.x, p.y, 0);
      if (q[0] < -10 || q[0] > w + 10 || q[1] < -10 || q[1] > h + 10) continue;
      let b = 0.25 + 0.35 * Math.sin(t * 0.9 + p.s * 12);
      const wd = Math.abs(dn - wave);
      if (wd < 0.12) b += (0.12 - wd) * 9;
      const lvl = Math.max(0, Math.min(4, Math.floor(b * 3)));
      B[lvl].push(q);
    }
    const cols = ['rgba(255,255,255,.16)', 'rgba(255,255,255,.28)', 'rgba(255,80,88,.5)', 'rgba(229,9,20,.85)', 'rgba(255,150,150,1)'];
    for (let i = 0; i < 5; i++) {
      g.fillStyle = this.dim ? cols[Math.min(i, 2)] : cols[i];
      g.beginPath();
      for (const q of B[i]) { const s = 2.1 * q[2]; g.rect(q[0] - s / 2, q[1] - s / 2, s, s); }
      g.fill();
    }
    // arcs
    const hq = this.C.find((q) => q.hq);
    const H = proj(hq.x, hq.y, 0);
    g.lineWidth = 1.1;
    for (const a of this.arcs) {
      const tt = a.to, T = proj(tt.x, tt.y, 0);
      const dist = Math.hypot(tt.x - hq.x, tt.y - hq.y);
      const lift = Math.min(200, dist * 0.35 + 20);
      const N = 40, path = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        path.push(proj(hq.x + (tt.x - hq.x) * u, hq.y + (tt.y - hq.y) * u, Math.sin(u * Math.PI) * lift));
      }
      const appear = Math.min(1, Math.max(0, (rev - 0.35) * 2));
      const upto = Math.floor(N * appear);
      g.strokeStyle = 'rgba(229,9,20,.32)';
      g.beginPath();
      for (let i = 0; i <= upto; i++) i ? g.lineTo(path[i][0], path[i][1]) : g.moveTo(path[i][0], path[i][1]);
      g.stroke();
      if (appear >= 1) {
        const u = (t * a.sp + a.o) % 1, idx = Math.floor(u * N);
        g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 2;
        g.beginPath();
        for (let i = Math.max(0, idx - 5); i <= idx; i++) i === Math.max(0, idx - 5) ? g.moveTo(path[i][0], path[i][1]) : g.lineTo(path[i][0], path[i][1]);
        g.stroke(); g.lineWidth = 1.1;
        const pp = path[idx];
        g.fillStyle = '#fff'; g.beginPath(); g.arc(pp[0], pp[1], 2.2, 0, 7); g.fill();
      }
    }
    // cities
    g.font = '500 10px "JetBrains Mono", monospace';
    g.textAlign = 'left';
    for (const q of this.C) {
      const P = proj(q.x, q.y, 0);
      if (P[0] < 0 || P[0] > w || P[1] < 0 || P[1] > h) continue;
      const pulse = (t * 0.6 + (q.hq ? 0 : q.lon * 0.1)) % 1;
      g.strokeStyle = rgba(RED, (1 - pulse) * (q.hq ? 0.9 : 0.5));
      g.beginPath(); g.ellipse(P[0], P[1], (q.hq ? 30 : 16) * pulse * P[2], (q.hq ? 30 : 16) * pulse * P[2] * Math.cos(tilt), 0, 0, 7); g.stroke();
      g.fillStyle = q.hq ? '#fff' : 'rgba(229,9,20,1)';
      g.shadowColor = '#E50914'; g.shadowBlur = q.hq ? 18 : 8;
      g.beginPath(); g.arc(P[0], P[1], q.hq ? 4 : 2.6, 0, 7); g.fill();
      g.shadowBlur = 0;
      if (!this.dim && q.n !== 'MANAMA' && (q.hq || this.w > 900)) {
        g.fillStyle = q.hq ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.4)';
        g.fillText(q.n, P[0] + 9, P[1] - 7);
      }
    }
  };

  /* ===== NETWORK: 3D node cloud ===== */
  INIT.network = function () {
    const n = this.mini ? 40 : (MOBILE ? 60 : 110);
    this.N = Array.from({ length: n }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(-1, 1), r: Math.random() }));
    this.pulses = [];
  };
  DRAW.network = function (dt) {
    const g = this.ctx, w = this.w, h = this.h, t = this.t;
    g.clearRect(0, 0, w, h);
    const a = t * 0.06 + (mouse.x - 0.5) * 0.6, b = (mouse.y - 0.5) * 0.4;
    const cx = w * (this.mini ? 0.75 : (w < 700 ? 0.5 : RTL ? 0.3 : 0.7)), cy = h * 0.5, S = Math.min(w, h) * (this.mini ? 0.55 : 0.48);
    const P = this.N.map((p) => {
      let x = p.x * Math.cos(a) - p.z * Math.sin(a), z = p.x * Math.sin(a) + p.z * Math.cos(a);
      let y = p.y * Math.cos(b) - z * Math.sin(b); z = p.y * Math.sin(b) + z * Math.cos(b);
      const k = 2.4 / (2.4 + z);
      return [cx + x * S * k, cy + y * S * k, k, p];
    });
    g.lineWidth = 0.6;
    const md = S * 0.42;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1], d = Math.hypot(dx, dy);
      if (d < md) { g.strokeStyle = `rgba(255,255,255,${(1 - d / md) * 0.16 * this.intro})`; g.beginPath(); g.moveTo(P[i][0], P[i][1]); g.lineTo(P[j][0], P[j][1]); g.stroke(); }
    }
    if (Math.random() < dt * 3) { const i = Math.floor(Math.random() * P.length); let best = -1, bd = 1e9; for (let j = 0; j < P.length; j++) { if (j === i) continue; const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); if (d < md && d < bd && Math.random() > 0.3) { bd = d; best = j; } } if (best >= 0) this.pulses.push({ i, j: best, u: 0 }); }
    for (const p of P) {
      g.fillStyle = p[3].r > 0.85 ? rgba(RED, 0.9) : `rgba(255,255,255,${0.25 + p[2] * 0.3})`;
      g.beginPath(); g.arc(p[0], p[1], (p[3].r > 0.85 ? 2.4 : 1.4) * p[2], 0, 7); g.fill();
    }
    g.lineWidth = 1.6;
    this.pulses = this.pulses.filter((q) => {
      q.u += dt * 1.4; if (q.u > 1) return false;
      const A = P[q.i], B = P[q.j], x = A[0] + (B[0] - A[0]) * q.u, y = A[1] + (B[1] - A[1]) * q.u;
      g.strokeStyle = rgba(RED, 0.5); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(x, y); g.stroke();
      g.fillStyle = '#fff'; g.shadowColor = '#E50914'; g.shadowBlur = 10; g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); g.shadowBlur = 0;
      return true;
    });
  };

  /* ===== AUTOMATE: documents flow through an AI gate and become processed data ===== */
  INIT.automate = function () {
    const lanes = this.mini ? 6 : (MOBILE ? 8 : 12);
    this.lanes = lanes;
    this.gx = this.w * (this.mini ? 0.72 : (this.w < 700 ? 0.5 : RTL ? 0.32 : 0.68));
    this.D = [];
    const n = this.mini ? 30 : (MOBILE ? 40 : 80);
    for (let i = 0; i < n; i++) this.D.push(this.newDoc(true));
  };
  Field.prototype.newDoc = function (any) {
    const lane = Math.floor(Math.random() * this.lanes);
    const span = this.mini ? this.w * 0.6 : this.w * 0.8;
    return { lane, x: any ? rnd(-span * 0.5, span) : -rnd(20, 200), v: rnd(40, 90), s: rnd(0.7, 1.2) };
  };
  DRAW.automate = function (dt) {
    const g = this.ctx, w = this.w, h = this.h, t = this.t;
    g.clearRect(0, 0, w, h);
    const top = h * 0.18, bot = h * 0.86, lh = (bot - top) / (this.lanes - 1);
    const dir = RTL ? -1 : 1, gx = this.gx, start = RTL ? w + 40 : -40;
    // lanes
    for (let i = 0; i < this.lanes; i++) {
      const y = top + i * lh;
      const gr = g.createLinearGradient(0, 0, w, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(gx / w, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(229,9,20,.12)');
      g.strokeStyle = gr; g.lineWidth = 1; g.setLineDash([2, 6]);
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    }
    g.setLineDash([]);
    // gate
    const gl = g.createLinearGradient(0, top - 40, 0, bot + 40);
    gl.addColorStop(0, 'rgba(229,9,20,0)'); gl.addColorStop(0.5, 'rgba(229,9,20,.9)'); gl.addColorStop(1, 'rgba(229,9,20,0)');
    g.fillStyle = gl; g.fillRect(gx - 1, top - 40, 2, bot - top + 80);
    const glow = g.createRadialGradient(gx, h / 2, 0, gx, h / 2, 160);
    glow.addColorStop(0, 'rgba(229,9,20,.18)'); glow.addColorStop(1, 'rgba(229,9,20,0)');
    g.fillStyle = glow; g.fillRect(gx - 160, 0, 320, h);
    // scanning bracket
    const sy = top + ((Math.sin(t * 1.2) + 1) / 2) * (bot - top);
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(gx - 14, sy - 10); g.lineTo(gx - 14, sy - 14); g.lineTo(gx + 14, sy - 14); g.lineTo(gx + 14, sy - 10); g.moveTo(gx - 14, sy + 10); g.lineTo(gx - 14, sy + 14); g.lineTo(gx + 14, sy + 14); g.lineTo(gx + 14, sy + 10); g.stroke();
    // docs
    for (const d of this.D) {
      d.x += d.v * dt * (d.x > (RTL ? 0 : 0) ? 1 : 1);
      const X = RTL ? w - d.x : d.x;
      const y = top + d.lane * lh;
      const passed = RTL ? X < gx : X > gx;
      if ((RTL && X < -30) || (!RTL && X > w + 30)) { Object.assign(d, this.newDoc(false)); continue; }
      if (!passed) {
        const near = 1 - Math.min(1, Math.abs(X - gx) / 200);
        g.strokeStyle = `rgba(255,255,255,${0.25 + near * 0.5})`; g.lineWidth = 1;
        const W = 10 * d.s, Hh = 13 * d.s;
        g.strokeRect(X - W / 2, y - Hh / 2, W, Hh);
        g.fillStyle = `rgba(255,255,255,${0.15 + near * 0.3})`;
        g.fillRect(X - W / 2 + 2, y - Hh / 2 + 3, W - 4, 1); g.fillRect(X - W / 2 + 2, y - Hh / 2 + 6, W - 5, 1); g.fillRect(X - W / 2 + 2, y - Hh / 2 + 9, W - 6, 1);
      } else {
        const k = Math.min(1, Math.abs(X - gx) / 60);
        g.fillStyle = rgba(RED, 0.95);
        g.shadowColor = '#E50914'; g.shadowBlur = 8;
        for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(X - dir * j * 7 * k, y + (j - 1) * 4 * k, 1.8, 0, 7); g.fill(); }
        g.shadowBlur = 0;
        g.strokeStyle = rgba(RED, 0.35); g.beginPath(); g.moveTo(X - dir * 40 * k, y); g.lineTo(X, y); g.stroke();
      }
    }
  };

  /* ===== TRANSFORM: legacy blocks convert into a connected core ===== */
  INIT.transform = function () {
    const s = this.mini ? 34 : (MOBILE ? 34 : 46);
    const x0 = this.mini ? this.w * 0.45 : (this.w < 700 ? 0 : RTL ? 0 : this.w * 0.38);
    const x1 = this.mini ? this.w : (this.w < 700 ? this.w : RTL ? this.w * 0.62 : this.w);
    this.G = [];
    this.cols = Math.floor((x1 - x0) / s); this.rows = Math.floor(this.h / s);
    for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) this.G.push({ x: x0 + c * s + s / 2, y: r * s + s / 2, c, r, j: Math.random() });
    this.s = s;
  };
  DRAW.transform = function () {
    const g = this.ctx, w = this.w, h = this.h, t = this.t, s = this.s;
    g.clearRect(0, 0, w, h);
    const per = 9, ph = (t % per) / per;
    const st = (n) => {
      const d = ((RTL ? this.cols - n.c : n.c) / this.cols) * 0.7 + (n.r / this.rows) * 0.3;
      let v = (ph * 1.8 - d - n.j * 0.15) * 3;
      if (ph > 0.82) v = Math.min(v, (1 - ph) / 0.18 * 3);
      return Math.max(0, Math.min(1, v));
    };
    const S = this.G.map(st);
    g.lineWidth = 1;
    this.G.forEach((n, i) => {
      const v = S[i];
      if (v > 0.5) {
        const right = this.G[i + 1], down = this.G[i + this.cols];
        g.strokeStyle = `rgba(229,9,20,${(v - 0.5) * 0.7})`;
        if (right && right.r === n.r && S[i + 1] > 0.5) { g.beginPath(); g.moveTo(n.x, n.y); g.lineTo(right.x, right.y); g.stroke(); }
        if (down && S[i + this.cols] > 0.5) { g.beginPath(); g.moveTo(n.x, n.y); g.lineTo(down.x, down.y); g.stroke(); }
      }
    });
    this.G.forEach((n, i) => {
      const v = S[i];
      const sz = (s * 0.42) * (1 - v) + 3 * v;
      if (v < 0.98) {
        g.strokeStyle = `rgba(255,255,255,${0.12 * (1 - v) + 0.05})`;
        g.strokeRect(n.x - sz / 2, n.y - sz / 2, sz, sz);
      }
      if (v > 0.02) {
        g.fillStyle = v > 0.95 && n.j > 0.9 ? '#fff' : rgba(RED, v);
        g.beginPath(); g.arc(n.x, n.y, 1.2 + v * 1.4, 0, 7); g.fill();
      }
    });
  };

  /* ===== COMPLY: governance radar with five domains ===== */
  INIT.comply = function () {
    this.cx = this.w * (this.mini ? 0.78 : (this.w < 700 ? 0.5 : RTL ? 0.28 : 0.72));
    this.cy = this.h * 0.5;
    this.R = Math.min(this.h * 0.42, this.w * (this.w < 700 ? 0.45 : 0.3));
    this.E = Array.from({ length: this.mini ? 30 : 70 }, () => ({ a: rnd(0, 6.28), r: rnd(0.4, 1.3), v: rnd(0.08, 0.2) }));
  };
  DRAW.comply = function (dt) {
    const g = this.ctx, w = this.w, h = this.h, t = this.t, cx = this.cx, cy = this.cy, R = this.R;
    g.clearRect(0, 0, w, h);
    for (let i = 1; i <= 4; i++) {
      g.strokeStyle = i === 4 ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.06)';
      g.setLineDash(i % 2 ? [2, 5] : []);
      g.beginPath(); g.arc(cx, cy, R * i / 4, 0, 7); g.stroke();
    }
    g.setLineDash([]);
    // sweep
    const sa = t * 0.7;
    const sw = g.createConicGradient ? g.createConicGradient(sa, cx, cy) : null;
    if (sw) {
      sw.addColorStop(0, 'rgba(229,9,20,.28)'); sw.addColorStop(0.12, 'rgba(229,9,20,0)'); sw.addColorStop(1, 'rgba(229,9,20,0)');
      g.fillStyle = sw; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(229,9,20,.8)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sa) * R, cy + Math.sin(sa) * R); g.stroke();
    // evidence particles spiralling in
    for (const p of this.E) {
      p.r -= p.v * dt * 0.35; p.a += dt * 0.25;
      if (p.r < 0.12) { p.r = rnd(1, 1.35); p.a = rnd(0, 6.28); }
      const x = cx + Math.cos(p.a) * p.r * R, y = cy + Math.sin(p.a) * p.r * R;
      g.fillStyle = `rgba(255,255,255,${Math.min(0.6, p.r * 0.5)})`;
      g.fillRect(x - 1, y - 1, 2, 2);
    }
    // five domains
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 5) + t * 0.05;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      let hit = ((sa - a) % 6.283 + 6.283) % 6.283; hit = hit < 0.5 ? 1 - hit / 0.5 : 0;
      g.strokeStyle = `rgba(229,9,20,${0.25 + hit * 0.6})`; g.setLineDash([3, 4]);
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); g.setLineDash([]);
      g.fillStyle = hit > 0.1 ? '#fff' : '#E50914'; g.shadowColor = '#E50914'; g.shadowBlur = 10 + hit * 20;
      g.beginPath(); g.arc(x, y, 4 + hit * 3, 0, 7); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = `rgba(229,9,20,${0.4 * (1 - hit)})`; g.beginPath(); g.arc(x, y, 12 + hit * 10, 0, 7); g.stroke();
    }
    g.fillStyle = 'rgba(229,9,20,.15)'; g.beginPath(); g.arc(cx, cy, R * 0.16, 0, 7); g.fill();
    g.fillStyle = '#E50914'; g.beginPath(); g.arc(cx, cy, 3, 0, 7); g.fill();
  };

  /* ===== UPSKILL: particles rise into ascending capability steps ===== */
  INIT.upskill = function () {
    const cols = this.mini ? 12 : (MOBILE ? 14 : 24);
    const x0 = this.mini ? this.w * 0.45 : (this.w < 700 ? this.w * 0.05 : RTL ? this.w * 0.04 : this.w * 0.42);
    const x1 = this.mini ? this.w * 0.98 : (this.w < 700 ? this.w * 0.95 : RTL ? this.w * 0.58 : this.w * 0.96);
    this.cw = (x1 - x0) / cols; this.x0 = x0; this.ncol = cols;
    this.Pp = [];
    const n = this.mini ? 160 : (MOBILE ? 260 : 520);
    for (let i = 0; i < n; i++) this.Pp.push(this.newP(true));
  };
  Field.prototype.newP = function (any) {
    const c = Math.floor(Math.random() * this.ncol);
    return { c, y: any ? rnd(0, this.h) : this.h + rnd(0, 60), v: rnd(30, 90), o: Math.random() };
  };
  DRAW.upskill = function (dt) {
    const g = this.ctx, w = this.w, h = this.h, t = this.t;
    g.clearRect(0, 0, w, h);
    const base = h * 0.9;
    const target = (c) => { const k = RTL ? (this.ncol - 1 - c) : c; return base - (0.12 + 0.68 * Math.pow(k / (this.ncol - 1), 1.15)) * h * 0.78 * (0.92 + 0.08 * Math.sin(t * 0.8 + c)); };
    // column guides
    for (let c = 0; c < this.ncol; c++) {
      const x = this.x0 + c * this.cw + this.cw / 2, ty = target(c);
      g.strokeStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(x, base); g.lineTo(x, h * 0.08); g.stroke();
      g.fillStyle = rgba(RED, 0.9); g.fillRect(x - this.cw * 0.3, ty - 1, this.cw * 0.6, 2);
    }
    for (const p of this.Pp) {
      p.y -= p.v * dt;
      const ty = target(p.c);
      if (p.y < ty) { Object.assign(p, this.newP(false)); continue; }
      const x = this.x0 + p.c * this.cw + this.cw / 2 + Math.sin(p.o * 20 + p.y * 0.02) * this.cw * 0.18;
      const near = 1 - Math.min(1, (p.y - ty) / 140);
      g.fillStyle = near > 0.6 ? rgba(RED, near) : `rgba(255,255,255,${0.12 + near * 0.4})`;
      g.fillRect(x - 1, p.y - 1, 2, 2);
    }
    g.strokeStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.moveTo(this.x0, base); g.lineTo(this.x0 + this.ncol * this.cw, base); g.stroke();
  };

  /* ===== TIMELINE (about): flowing strands of data across 20 years ===== */
  INIT.timeline = function () { this.S = Array.from({ length: MOBILE ? 9 : 16 }, (_, i) => ({ i, ph: rnd(0, 6), amp: rnd(0.04, 0.12), sp: rnd(0.2, 0.5) })); };
  DRAW.timeline = function () {
    const g = this.ctx, w = this.w, h = this.h, t = this.t;
    g.clearRect(0, 0, w, h);
    const x0 = w < 700 ? 0 : (RTL ? 0 : w * 0.3), x1 = w < 700 ? w : (RTL ? w * 0.7 : w);
    for (const s of this.S) {
      const yb = h * (0.25 + 0.5 * (s.i / this.S.length));
      g.beginPath();
      for (let x = x0; x <= x1; x += 6) {
        const u = (x - x0) / (x1 - x0);
        const y = yb + Math.sin(u * 6 + t * s.sp + s.ph) * h * s.amp * Math.sin(u * Math.PI);
        x === x0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.strokeStyle = s.i % 5 === 0 ? 'rgba(229,9,20,.35)' : 'rgba(255,255,255,.07)'; g.lineWidth = 1; g.stroke();
      const u = ((t * 0.06 * (1 + s.i % 3) + s.ph) % 1);
      const ux = RTL ? 1 - u : u, x = x0 + ux * (x1 - x0);
      const y = yb + Math.sin(ux * 6 + t * s.sp + s.ph) * h * s.amp * Math.sin(ux * Math.PI);
      g.fillStyle = s.i % 5 === 0 ? '#fff' : '#E50914'; g.shadowColor = '#E50914'; g.shadowBlur = 12;
      g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); g.shadowBlur = 0;
    }
  };

  /* ===== CONSTELLATION (clients) ===== */
  INIT.constellation = function () {
    const n = 16, cx = this.w < 700 ? 0.5 : RTL ? 0.3 : 0.7;
    this.K = Array.from({ length: n }, (_, i) => { const a = i / n * 6.283 + rnd(-0.2, 0.2), r = rnd(0.18, 0.42); return { x: cx + Math.cos(a) * r * (this.h / this.w) * 1.4, y: 0.5 + Math.sin(a) * r, a, r, tw: Math.random() }; });
    this.stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() }));
  };
  DRAW.constellation = function () {
    const g = this.ctx, w = this.w, h = this.h, t = this.t;
    g.clearRect(0, 0, w, h);
    for (const s of this.stars) { g.fillStyle = `rgba(255,255,255,${0.05 + 0.15 * Math.abs(Math.sin(t * 0.6 + s.s * 9))})`; g.fillRect(s.x * w, s.y * h, 1.2, 1.2); }
    const cx = (this.w < 700 ? 0.5 : RTL ? 0.3 : 0.7) * w, cy = 0.5 * h;
    const P = this.K.map((k) => { const a = k.a + t * 0.03; return [cx + Math.cos(a) * k.r * h * 1.0, cy + Math.sin(a) * k.r * h, k]; });
    g.lineWidth = 0.8;
    P.forEach((p, i) => {
      const q = P[(i + 1) % P.length], q2 = P[(i + 5) % P.length];
      g.strokeStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
      g.strokeStyle = 'rgba(229,9,20,.18)'; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q2[0], q2[1]); g.stroke();
      g.strokeStyle = 'rgba(229,9,20,.12)'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(p[0], p[1]); g.stroke();
    });
    P.forEach((p) => {
      const b = 0.5 + 0.5 * Math.sin(t * 1.4 + p[2].tw * 9);
      g.fillStyle = b > 0.8 ? '#fff' : '#E50914'; g.shadowColor = '#E50914'; g.shadowBlur = 6 + b * 14;
      g.beginPath(); g.arc(p[0], p[1], 2.5 + b * 1.5, 0, 7); g.fill(); g.shadowBlur = 0;
    });
    g.fillStyle = '#fff'; g.shadowColor = '#E50914'; g.shadowBlur = 24; g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.fill(); g.shadowBlur = 0;
    const pr = (t * 0.4) % 1; g.strokeStyle = rgba(RED, 1 - pr); g.beginPath(); g.arc(cx, cy, pr * h * 0.45, 0, 7); g.stroke();
  };

  /* ===== PULSE (CTA): power rings + dot grid ===== */
  INIT.pulse = function () { };
  DRAW.pulse = function () {
    const g = this.ctx, w = this.w, h = this.h, t = this.t;
    g.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h * 1.05, gap = 26;
    for (let y = gap / 2; y < h; y += gap) for (let x = (w / 2) % gap; x < w; x += gap) {
      const d = Math.hypot(x - cx, y - cy) / h;
      const wv = Math.sin(d * 14 - t * 2.2);
      const a = Math.max(0, wv) * 0.35 * Math.max(0, 1.1 - d);
      if (a < 0.02) continue;
      g.fillStyle = `rgba(229,9,20,${a})`; g.fillRect(x - 1, y - 1, 2, 2);
    }
    for (let i = 0; i < 3; i++) {
      const p = ((t * 0.25 + i / 3) % 1);
      g.strokeStyle = `rgba(229,9,20,${(1 - p) * 0.35})`; g.lineWidth = 1;
      g.beginPath(); g.arc(cx, cy, p * h * 1.1, Math.PI, 0); g.stroke();
    }
  };

  // ---------- loop ----------
  const io = new IntersectionObserver((es) => es.forEach((e) => { const f = e.target.__f; if (f) f.vis = e.isIntersecting; }), { rootMargin: '100px' });
  function mount(root) {
    (root || document).querySelectorAll('canvas.fx').forEach((cv) => {
      if (cv.__f) return;
      const f = new Field(cv); cv.__f = f; fields.push(f); io.observe(cv);
      if (REDUCED) { f.intro = 1; f.t = 3; f.frame(0); }
    });
  }
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!REDUCED && !document.hidden) for (const f of fields) if (f.vis && f.go !== false) f.frame(dt);
    requestAnimationFrame(loop);
  }
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => fields.forEach((f) => { const ow = f.w; const r = f.cv.getBoundingClientRect(); if (Math.abs(r.width - ow) > 40 || Math.abs(r.height - f.h) > 120) f.resize(); }), 200); });
  window.DARFX = { mount, fields, start() { mount(); requestAnimationFrame(loop); } };
})();

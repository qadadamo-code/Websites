// Daniel's Phone product reel — deterministic renderAt(t) for frame-by-frame capture.
const $ = (id) => document.getElementById(id);
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const oc = (x) => 1 - Math.pow(1 - cl(x), 3);
const oq = (x) => 1 - Math.pow(1 - cl(x), 5);
const ob = (x) => { x = cl(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const io = (x) => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const seg = (t, a, d, e = oc) => e((t - a) / d);
const FPS = 30;

// [id, start, end]
// v3: faster cut. OLD = original scene lengths; animations + clips run at OLD/new speed.
const OLD = { s0: 3.5, s1: 2, s2: 5, s3: 4.5, s4: 4.5, s5: 4.5, s6: 3.5, s7: 1.5, s8: 5, s9: 4.5, s10: 2.5, s11: 4, s12: 4.5 };
const S = [
  ['s0', 0, 2.6], ['s1', 2.6, 4.0], ['s2', 4.0, 7.4], ['s3', 7.4, 10.4], ['s4', 10.4, 13.4], ['s5', 13.4, 16.6],
  ['s6', 16.6, 18.6], ['s7', 18.6, 19.6], ['s8', 19.6, 23.0], ['s9', 23.0, 26.0], ['s10', 26.0, 27.6], ['s11', 27.6, 30.4], ['s12', 30.4, 34.4],
];
window.DURATION = 34.4;
const CUTS = S.slice(1).map((s) => s[1]);
const CLIPFR = { c0: 151, c1: 151, c2: 151, c3: 151, c4: 151, c5: 151, c6: 151 };

function inn(el, p, dy = 40, sc = 0) {
  el = typeof el === 'string' ? $(el) : el;
  el.style.opacity = cl(p * 1.4);
  el.style.transform = `translateY(${(1 - p) * dy}px)` + (sc ? ` scale(${1 + (1 - p) * sc})` : '');
  el.style.filter = p < 1 ? `blur(${(1 - p) * 10}px)` : 'none';
}
function chip(el, p) {
  el = $(el);
  el.style.opacity = cl(p * 2);
  el.style.transform = `translateX(-50%) scale(${0.6 + 0.4 * ob(p)})`;
}
function streak(id, t, a, d, dir = 1) {
  const p = (t - a) / d; const el = $(id);
  el.style.opacity = p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0;
  el.style.marginLeft = `${dir * (-1400 + 2800 * io(p))}px`;
}

const pending = [];
function setImg(img, src) {
  if (img.getAttribute('src') !== src) { img.setAttribute('src', src); pending.push(img.decode().catch(() => {})); }
}

// grain (deterministic per frame)
const g = $('grain').getContext('2d'); const gi = g.createImageData(540, 960);
function grain(fr) {
  let s = (fr * 9301 + 49297) % 233280;
  for (let i = 0; i < gi.data.length; i += 4) { s = (s * 9301 + 49297) % 233280; const v = (s / 233280) * 255; gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v; gi.data[i + 3] = 255; }
  g.putImageData(gi, 0, 0);
}

window.renderAt = async function (t) {
  pending.length = 0;
  for (const [id, a, b] of S) {
    const el = $(id); const on = t >= a && t < b; el.style.display = on ? 'block' : 'none';
    if (!on) continue;
    const k = OLD[id] / (b - a); const u = (t - a) * k;
    const img = el.querySelector('img.bg[data-clip]');
    if (img) {
      const c = img.dataset.clip; const n = CLIPFR[c];
      const fr = Math.min(n, 1 + Math.floor((t - a) * FPS * 1.2));
      setImg(img, `clips/${c}/${String(fr).padStart(4, '0')}.jpg`);
      const punch = 1 + 0.07 * (1 - seg(t, a, 0.45, oq));
      img.style.transform = `scale(${punch * (1 + 0.03 * (t - a) / (b - a))})`;
    }
    SC[id] && SC[id](t, u, OLD[id]);
  }
  // cut flash + light leak
  let f = 0, lk = 0;
  for (const c of CUTS) { const d = t - c; if (d >= 0 && d < 0.3) f = Math.max(f, 0.55 * Math.exp(-d * 14)); if (d > -0.15 && d < 0.45) lk = Math.max(lk, Math.sin(cl((d + 0.15) / 0.6) * Math.PI) * 0.55); }
  $('flash').style.opacity = f;
  $('leak').style.opacity = lk; $('leak').style.transform = `translateX(${(t * 160) % 400 - 200}px)`;
  grain(Math.floor(t * FPS));
  await Promise.all(pending);
};

const SC = {
  s0(t, u) {
    streak('st1', u, 0.1, 1.4, 1); streak('st2', u, 0.35, 1.4, -1);
    const p = seg(u, 0.25, 1.0, oq);
    const L = $('logo0'); L.style.opacity = cl(p * 1.3);
    L.style.transform = `scale(${1.35 - 0.35 * p}) translateY(${(1 - p) * 30}px)`;
    L.style.filter = `blur(${(1 - p) * 18}px) drop-shadow(0 0 ${40 + 30 * Math.sin(u * 3)}px rgba(245,122,10,.45))`;
    inn('tg1', seg(u, 1.45, 0.6)); inn('tg2', seg(u, 2.05, 0.6), 50, 0.2);
    if (u > 3.1) { const o = 1 - seg(u, 3.1, 0.4); L.style.opacity = o; $('tg1').style.opacity = o; $('tg2').style.opacity = o; }
  },
  s1(t, u) {
    const o = $('orb'); o.style.transform = `scale(${0.6 + 0.5 * seg(u, 0, 1.6)})`; o.style.opacity = 0.9;
    inn('k1', seg(u, 0.0, 0.45, oq), 0, 0.5);
    inn('k2', seg(u, 0.5, 0.5), 60); inn('k3', seg(u, 0.95, 0.5), 30);
  },
  s2(t, u) {
    inn('g1', seg(u, 0.35, 0.5)); inn('g2', seg(u, 0.6, 0.5, ob), 0, 0.6);
    inn('g3', seg(u, 1.6, 0.6), 50);
  },
  s3(t, u) { chip('ch3', seg(u, 0.4, 0.55, x => x)); inn('sb3', seg(u, 1.0, 0.5)); },
  s4(t, u) { chip('ch4', seg(u, 0.4, 0.55, x => x)); inn('sb4', seg(u, 1.0, 0.5)); },
  s5(t, u) {
    const p = seg(u, 0.2, 2.6, io); $('deg').textContent = Math.round(360 * p);
    inn('n5', seg(u, 0.1, 0.4)); inn('l5', seg(u, 0.6, 0.5));
    chip('ch5', seg(u, 2.3, 0.55, x => x));
  },
  s6(t, u, D) {
    const P = $('p6'); const p = seg(u, 0, 0.6, oq);
    P.style.transform = `translateY(${(1 - p) * 300}px) scale(${0.9 + 0.1 * p + 0.03 * u / D}) rotate(${(1 - p) * -4}deg)`; P.style.opacity = cl(p * 2);
    inn('h6', seg(u, 0.3, 0.5)); inn('f6', seg(u, 1.2, 0.5));
  },
  s7(t, u) { streak('st3', u, 0, 1.2, 1); inn('w7', seg(u, 0.1, 0.45, oq), 0, 0.4); },
  s8(t, u) {
    inn('k8a', seg(u, 0.3, 0.5)); inn('k8b', seg(u, 0.55, 0.5, ob), 0, 0.6);
    const p = seg(u, 1.4, 2.0, io); $('cm').textContent = Math.round(190 * p);
    inn('len8', seg(u, 1.3, 0.4), 30); $('rule8').style.width = `${520 * p}px`;
  },
  s9(t, u) { chip('ch9a', seg(u, 0.5, 0.55, x => x)); chip('ch9b', seg(u, 1.6, 0.55, x => x)); },
  s10(t, u, D) {
    const P = $('p10'); const p = seg(u, 0, 0.6, oq);
    P.style.transform = `translateX(${(1 - p) * -1100}px) scale(${0.95 + 0.05 * p + 0.03 * u / D})`; P.style.opacity = 1;
    inn('h10', seg(u, 0.35, 0.5));
  },
  s11(t, u) {
    inn('a11', seg(u, 0.25, 0.5)); inn('b11', seg(u, 0.55, 0.5)); inn('c11', seg(u, 0.95, 0.5), 30, 0.3);
    chip('ch11', seg(u, 1.8, 0.55, x => x));
  },
  s12(t, u) {
    streak('st4', u, 0.0, 1.5, 1); streak('st5', u, 0.25, 1.5, -1);
    const p = seg(u, 0.1, 0.9, oq); const L = $('logo12');
    L.style.opacity = cl(p * 1.3); L.style.transform = `scale(${1.25 - 0.25 * p})`;
    L.style.filter = `blur(${(1 - p) * 14}px) drop-shadow(0 0 ${40 + 25 * Math.sin(u * 3)}px rgba(245,122,10,.45))`;
    inn('o1', seg(u, 0.8, 0.5)); inn('o2', seg(u, 1.05, 0.55, ob), 30, 0.3);
    $('o3').style.width = `${560 * seg(u, 1.4, 0.6, io)}px`;
    inn('o4', seg(u, 1.6, 0.5)); inn('o5', seg(u, 1.85, 0.5)); inn('o6', seg(u, 2.1, 0.5)); inn('o7', seg(u, 2.35, 0.5));
    if (u > 4.1) { const o = 1 - seg(u, 4.1, 0.4); document.getElementById('s12').style.opacity = o; } else document.getElementById('s12').style.opacity = 1;
  },
};

document.fonts.ready.then(() => { window.ready = true; });

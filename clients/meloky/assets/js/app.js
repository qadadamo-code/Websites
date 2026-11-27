/* Meloky Furniture — app */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var D = window.ML, I = window.ML_I18N, L = window.ML_LOGO;
  var isMobile = function () { return window.matchMedia('(max-width:860px)').matches; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var stReady = false;
  var fmt = function (n) { return Number(n).toLocaleString('en-US'); };

  /* ---------- language ---------- */
  var params = new URLSearchParams(location.search);
  var lang = params.get('lang') || store.get('ml-lang', 'ar');
  if (!I[lang]) lang = 'ar';
  var t = function (k) { return (I[lang] && I[lang][k]) || I.ar[k] || I.en[k] || ''; };

  /* ---------- logo ---------- */
  var gid = 0;
  function grad(id) {
    return '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="1100"><stop offset="0" stop-color="#F7DF9A"/><stop offset=".38" stop-color="#D6A84E"/><stop offset=".62" stop-color="#F0D08A"/><stop offset="1" stop-color="#9A6C2A"/></linearGradient><clipPath id="' + id + 'c"><rect x="0" y="0" width="2000" height="462"/></clipPath></defs>';
  }
  function markPaths(id) { return '<path clip-path="url(#' + id + 'c)" d="' + L.A + '"/><path d="' + L.M + '"/><path d="' + L.star + '"/>'; }
  function drawLogo(svg, kind) {
    var id = 'mlg' + (gid++), inner = '';
    if (kind === 'mark') inner = markPaths(id);
    else if (kind === 'word') inner = '<path d="' + L.word + '"/>';
    else inner = markPaths(id) + '<path d="' + L.lines + '"/><path d="' + L.word + '"/>';
    svg.innerHTML = grad(id) + '<g fill="url(#' + id + ')">' + inner + '</g>';
  }
  $$('[data-logo]').forEach(function (s) { drawLogo(s, s.getAttribute('data-logo')); });

  /* ---------- intro ---------- */
  var intro = $('#intro'), introDone = false;
  function endIntro() {
    if (introDone) return; introDone = true;
    intro.classList.add('is-done');
    document.body.classList.remove('is-locked');
    setTimeout(function () { intro.style.display = 'none'; }, 1100);
  }
  (function runIntro() {
    var seen = false;
    try { seen = sessionStorage.getItem('ml-intro') === '1'; } catch (e) {}
    if (seen || window.matchMedia('(prefers-reduced-motion:reduce)').matches) { intro.style.display = 'none'; introDone = true; return; }
    document.body.classList.add('is-locked');
    try { sessionStorage.setItem('ml-intro', '1'); } catch (e) {}
    var svg = $('#introLogo'), id = 'mli';
    svg.innerHTML = grad(id) + '<g class="m">' + markPaths(id) + '</g><g class="w" fill="url(#' + id + ')"><path d="' + L.lines + '"/><path d="' + L.word + '"/></g>';
    var ps = $$('.m path', svg);
    ps.forEach(function (p, i) {
      var len = 4000; try { len = p.getTotalLength(); } catch (e) {}
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      p.getBoundingClientRect();
      p.style.transition = 'stroke-dashoffset 1.9s cubic-bezier(.6,.05,.3,1) ' + (i * 0.25) + 's, fill .8s ease, stroke-width .8s ease';
      requestAnimationFrame(function () { p.style.strokeDashoffset = 0; });
    });
    setTimeout(function () { ps.forEach(function (p) { p.style.fill = 'url(#' + id + ')'; p.style.strokeWidth = '0'; }); }, 2000);
    setTimeout(function () { intro.classList.add('is-word'); }, 2300);
    setTimeout(endIntro, 3700);
    $('#introSkip').addEventListener('click', endIntro);
  })();

  /* ---------- theme ---------- */
  function themeColor() { $('meta[name="theme-color"]').setAttribute('content', root.dataset.theme === 'day' ? '#f4eee4' : '#120d09'); }
  $('#themeBtn').addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'day' ? 'night' : 'day';
    try { localStorage.setItem('ml-theme', root.dataset.theme); } catch (e) {}
    themeColor(); renderBlueprint();
  });
  themeColor();

  /* ---------- contacts ---------- */
  function wa(msg) { return 'https://wa.me/' + D.config.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function bindContacts() {
    $$('[data-wa]').forEach(function (a) { a.href = wa(t('wa.hello') + ' — Meloky Furniture'); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-tel]').forEach(function (a) { a.href = 'tel:' + D.config.phone; });
    $$('[data-phone]').forEach(function (s) { s.textContent = D.config.phoneDisplay; });
  }

  /* ---------- language UI ---------- */
  function buildLangUI() {
    var menu = $('#langMenu'), m2 = $('#mnavLangs');
    menu.innerHTML = ''; m2.innerHTML = '';
    window.ML_LANGS.forEach(function (l) {
      var li = document.createElement('li');
      li.innerHTML = '<button role="option" data-l="' + l.code + '" aria-selected="' + (l.code === lang) + '"><span>' + l.label + '</span><small>' + l.short + '</small></button>';
      menu.appendChild(li);
      var b = document.createElement('button');
      b.textContent = l.label; b.dataset.l = l.code; b.setAttribute('aria-selected', l.code === lang);
      m2.appendChild(b);
    });
    $$('[data-l]').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); setLang(b.dataset.l); $('#lang').classList.remove('is-open'); setNav(false); }); });
  }
  $('#langBtn').addEventListener('click', function (e) { e.stopPropagation(); var o = $('#lang').classList.toggle('is-open'); this.setAttribute('aria-expanded', o); });
  document.addEventListener('click', function () { $('#lang').classList.remove('is-open'); });

  function setLang(code) {
    lang = code; store.set('ml-lang', code);
    var meta = window.ML_LANGS.filter(function (l) { return l.code === code; })[0];
    root.lang = code; root.dir = meta.dir;
    $('#langShort').textContent = meta.short;
    document.title = t('meta.title');
    var u = new URL(location.href); if (code === 'ar') u.searchParams.delete('lang'); else u.searchParams.set('lang', code);
    history.replaceState(null, '', u.toString());
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    buildLangUI();
    renderStatement(); renderMarquee(); renderAccord(); renderMeasure(); renderShop(); renderSteps(); renderExport(); renderList();
    bindContacts();
    if (stReady) { setupStatement(); ScrollTrigger.refresh(); }
  }

  /* ---------- statement ---------- */
  function renderStatement() {
    var el = $('#statement'), txt = t('statement');
    var zh = lang === 'zh';
    var tokens = zh ? txt.split('') : txt.split(/\s+/);
    var gs = Math.floor(tokens.length * 0.62);
    el.innerHTML = tokens.map(function (w, i) {
      var g = (zh ? (i >= gs && i < gs + 8) : (i >= gs && i < gs + 3)) ? ' gold' : '';
      return '<span class="w' + g + '">' + w + '</span>';
    }).join(zh ? '' : ' ');
  }
  var stmtST;
  function setupStatement() {
    if (stmtST) stmtST.kill();
    var ws = $$('#statement .w');
    stmtST = ScrollTrigger.create({
      trigger: '#statement', start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: function (s) { var n = Math.round(s.progress * ws.length); ws.forEach(function (w, i) { w.classList.toggle('on', i < n); }); }
    });
  }

  /* ---------- marquee ---------- */
  function renderMarquee() {
    var words = D.collections.map(function (c) { return t('col.' + c.id); });
    var html = words.map(function (w) { return '<span>' + w + '</span>'; }).join('');
    $('#marq').innerHTML = html + html + html + html;
  }

  /* ---------- collections accordion ---------- */
  var accIdx = 0;
  function renderAccord() {
    $('#accord').innerHTML = D.collections.map(function (c, i) {
      return '<article class="acc' + (i === accIdx ? ' is-on' : '') + '" data-i="' + i + '" tabindex="0"><img src="assets/img/' + c.img + '.webp" alt="' + t('col.' + c.id) + '" loading="lazy">' +
        '<span class="acc__n num">0' + (i + 1) + '</span><span class="acc__v">' + t('col.' + c.id) + '</span>' +
        '<div class="acc__body"><h3>' + t('col.' + c.id) + '</h3><p>' + t('col.' + c.id + '.d') + '</p><a class="link" href="#showroom" data-cat="' + c.cat + '"><span>' + t('col.view') + '</span> <i>↗</i></a></div></article>';
    }).join('');
    $$('.acc').forEach(function (a) {
      var act = function () { accIdx = +a.dataset.i; $$('.acc').forEach(function (b) { b.classList.toggle('is-on', b === a); }); };
      a.addEventListener('mouseenter', function () { if (!isMobile()) act(); });
      a.addEventListener('focus', act);
      a.addEventListener('click', act);
    });
    $$('.acc [data-cat]').forEach(function (l) { l.addEventListener('click', function () { filterShop(l.dataset.cat); }); });
  }

  /* ---------- made-to-measure configurator ---------- */
  var ms = store.get('ml-ms', null) || { type: 'buffet', w: 160, h: 90, fin: 'walnut', hdl: 'gold' };
  function typeObj() { return D.types.filter(function (x) { return x.id === ms.type; })[0]; }
  function finObj() { return D.finishes.filter(function (x) { return x.id === ms.fin; })[0]; }
  function hdlObj() { return D.handles.filter(function (x) { return x.id === ms.hdl; })[0]; }
  function setRange(el, min, max, val) { el.min = min; el.max = max; el.value = val; el.style.setProperty('--p', ((val - min) / (max - min) * 100) + '%'); }
  function renderMeasure() {
    $('#msType').innerHTML = D.types.map(function (x) { return '<button type="button" data-v="' + x.id + '" aria-pressed="' + (x.id === ms.type) + '">' + t('type.' + x.id) + '</button>'; }).join('');
    $$('#msType button').forEach(function (b) {
      b.addEventListener('click', function () {
        ms.type = b.dataset.v; var o = typeObj(); ms.w = o.w; ms.h = o.h;
        $$('#msType button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        syncRanges(); renderBlueprint();
      });
    });
    $('#msFinish').innerHTML = D.finishes.map(function (f) { return '<button type="button" class="sw" role="radio" aria-checked="' + (f.id === ms.fin) + '" data-v="' + f.id + '" title="' + t('fin.' + f.id) + '" aria-label="' + t('fin.' + f.id) + '" style="--c:linear-gradient(135deg,' + f.c2 + ',' + f.c + ')"><i></i></button>'; }).join('');
    $('#msHandle').innerHTML = D.handles.map(function (h) { return '<button type="button" class="sw' + (h.id === 'none' ? ' sw--none' : '') + '" role="radio" aria-checked="' + (h.id === ms.hdl) + '" data-v="' + h.id + '" title="' + t('hdl.' + h.id) + '" aria-label="' + t('hdl.' + h.id) + '" style="--c:' + h.c + '"><i></i></button>'; }).join('');
    $$('#msFinish .sw').forEach(function (b) { b.addEventListener('click', function () { ms.fin = b.dataset.v; $$('#msFinish .sw').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); renderBlueprint(); }); });
    $$('#msHandle .sw').forEach(function (b) { b.addEventListener('click', function () { ms.hdl = b.dataset.v; $$('#msHandle .sw').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); renderBlueprint(); }); });
    syncRanges(); renderBlueprint();
  }
  function syncRanges() {
    var o = typeObj();
    ms.w = Math.min(o.wr[1], Math.max(o.wr[0], ms.w)); ms.h = Math.min(o.hr[1], Math.max(o.hr[0], ms.h));
    setRange($('#msW'), o.wr[0], o.wr[1], ms.w); setRange($('#msH'), o.hr[0], o.hr[1], ms.h);
  }
  $('#msW').addEventListener('input', function () { ms.w = +this.value; this.style.setProperty('--p', ((ms.w - this.min) / (this.max - this.min) * 100) + '%'); renderBlueprint(); });
  $('#msH').addEventListener('input', function () { ms.h = +this.value; this.style.setProperty('--p', ((ms.h - this.min) / (this.max - this.min) * 100) + '%'); renderBlueprint(); });

  function rect(x, y, w, h, fill, cls, extra) { return '<rect class="' + (cls || '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" fill="' + fill + '" ' + (extra || '') + '/>'; }
  function handle(x, y, len, vertical, col) {
    if (ms.hdl === 'none') return '';
    return vertical ? rect(x - 1.6, y, 3.2, len, col, '', 'rx="1.6"') : rect(x, y - 1.6, len, 3.2, col, '', 'rx="1.6"');
  }
  function renderBlueprint() {
    var svg = $('#bpSvg'); if (!svg) return;
    var day = root.dataset.theme === 'day';
    var o = typeObj(), f = finObj(), hd = hdlObj();
    var S = Math.min(430 / o.wr[1], 290 / o.hr[1]);
    var W = ms.w * S, H = ms.h * S;
    var floor = 352, x0 = 300 - W / 2, y0 = floor - H;
    var stroke = day ? 'rgba(42,30,21,.55)' : 'rgba(241,232,218,.4)';
    var line = 'stroke="' + stroke + '" stroke-width="1"';
    var body = f.c, face = f.c2, hc = hd.c;
    var glass = day ? 'rgba(160,190,200,.35)' : 'rgba(170,200,210,.22)';
    var stone = '#e6d9c2';
    var g = '';
    // floor
    g += '<line class="floor" x1="40" y1="' + floor + '" x2="560" y2="' + floor + '"/>';
    function doors(x, y, w, h, n, style) {
      var out = '', dw = w / n;
      for (var i = 0; i < n; i++) {
        var dx = x + i * dw;
        out += rect(dx + 1.5, y + 1.5, dw - 3, h - 3, face, 'door', line + ' rx="2"');
        if (style === 'flute') { for (var k = 1; k < 9; k++) { var fx = dx + 1.5 + (dw - 3) * k / 9; out += '<line x1="' + fx.toFixed(1) + '" y1="' + (y + 6) + '" x2="' + fx.toFixed(1) + '" y2="' + (y + h - 6) + '" stroke="' + body + '" stroke-opacity=".55" stroke-width="1.2"/>'; } }
        if (style === 'panel') out += rect(dx + 7, y + 7, dw - 14, h - 14, 'none', '', line + ' rx="2"');
        if (style === 'glass') { out += rect(dx + 6, y + 6, dw - 12, h - 12, glass, 'glass', line); }
        var hx = (i % 2 === 0) ? dx + dw - 8 : dx + 8;
        if (n === 1) hx = dx + dw - 8;
        out += handle(hx, y + h * 0.5 - Math.min(18, h * 0.18), Math.min(36, h * 0.36), true, hc);
      }
      return out;
    }
    if (ms.type === 'buffet') {
      var leg = 12 * S, top = 3.2 * S;
      g += rect(x0 + 10, floor - leg, 5, leg, body, 'leg') + rect(x0 + W - 15, floor - leg, 5, leg, body, 'leg');
      g += rect(x0, y0 + top, W, H - top - leg, body, 'body', line + ' rx="3"');
      g += rect(x0 - 3, y0, W + 6, top, stone, 'top', line + ' rx="2"');
      var n = Math.max(2, Math.min(6, Math.round(ms.w / 42)));
      g += doors(x0 + 4, y0 + top + 4, W - 8, H - top - leg - 8, n, 'flute');
    } else if (ms.type === 'niche') {
      var pl = 10 * S, cor = 6 * S, low = (ms.h * 0.36) * S;
      g += rect(x0 + 6, floor - pl, W - 12, pl, body, 'body', line);
      g += rect(x0, y0 + cor, W, H - cor - pl, body, 'body', line);
      g += rect(x0 - 5, y0, W + 10, cor, body, 'top', line + ' rx="2"');
      var n2 = ms.w >= 170 ? 3 : 2, dw = (W - 8) / n2;
      g += doors(x0 + 4, floor - pl - low, W - 8, low - 4, n2, 'panel');
      var uy = y0 + cor + 4, uh = H - cor - pl - low - 6;
      for (var i = 0; i < n2; i++) {
        var dx = x0 + 4 + i * dw, r = (dw - 3) / 2;
        var p = 'M' + (dx + 1.5) + ' ' + (uy + uh) + 'V' + (uy + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (dx + dw - 1.5) + ' ' + (uy + r) + 'V' + (uy + uh) + 'Z';
        g += '<path class="door" d="' + p + '" fill="' + face + '" ' + line + '/>';
        var ri = r - 6;
        var pi = 'M' + (dx + 7.5) + ' ' + (uy + uh - 6) + 'V' + (uy + r) + 'A' + ri + ' ' + ri + ' 0 0 1 ' + (dx + dw - 7.5) + ' ' + (uy + r) + 'V' + (uy + uh - 6) + 'Z';
        g += '<path class="glass" d="' + pi + '" fill="' + glass + '" ' + line + '/>';
        for (var s = 1; s < 4; s++) { var sy = uy + r + (uh - r) * s / 4; g += '<line class="shelf" x1="' + (dx + 8) + '" y1="' + sy.toFixed(1) + '" x2="' + (dx + dw - 8) + '" y2="' + sy.toFixed(1) + '" stroke="' + stroke + '"/>'; }
        g += '<circle cx="' + (dx + dw / 2) + '" cy="' + (uy + r * 0.55) + '" r="' + Math.min(10, r * 0.3) + '" fill="#f4d58c" opacity=".35"/>';
      }
    } else if (ms.type === 'coffee') {
      var lowH = 88 * S, gap = 52 * S, ctop = 3 * S, upH = H - lowH - gap;
      g += rect(x0, floor - lowH + ctop, W, lowH - ctop, body, 'body', line + ' rx="2"');
      g += rect(x0 - 3, floor - lowH, W + 6, ctop, stone, 'top', line);
      g += rect(x0 + 2, floor - lowH - gap, W - 4, gap, day ? '#efe6d6' : '#3a2f25', 'body', line);
      for (var v = 1; v < 6; v++) g += '<line x1="' + (x0 + 2) + '" y1="' + (floor - lowH - gap * v / 6).toFixed(1) + '" x2="' + (x0 + W - 2) + '" y2="' + (floor - lowH - gap * v / 6).toFixed(1) + '" stroke="' + stroke + '" stroke-opacity=".35"/>';
      g += '<rect x="' + (x0 + 6) + '" y="' + (floor - lowH - gap) + '" width="' + (W - 12) + '" height="6" fill="#f4d58c" opacity=".45"/>';
      g += rect(x0, y0, W, upH, body, 'body', line + ' rx="2"');
      var nu = Math.max(2, Math.min(6, Math.round(ms.w / 40)));
      g += doors(x0 + 3, y0 + 3, W - 6, upH - 6, nu, 'glass');
      var dh = 16 * S;
      g += rect(x0 + 3, floor - lowH + ctop + 3, W - 6, dh, face, 'door', line + ' rx="2"') + handle(x0 + W / 2 - 15, floor - lowH + ctop + 3 + dh / 2, 30, false, hc);
      g += doors(x0 + 3, floor - lowH + ctop + dh + 5, W - 6, lowH - ctop - dh - 8, nu, 'panel');
    } else {
      var pl2 = 6 * S;
      g += rect(x0, y0, W, H - pl2, body, 'body', line + ' rx="2"');
      g += rect(x0 + 4, floor - pl2, W - 8, pl2, body, 'body', line);
      var nw = Math.max(2, Math.min(6, Math.round(ms.w / 50))), wdw = (W - 6) / nw;
      for (var j = 0; j < nw; j++) {
        var gx = x0 + 3 + j * wdw, isG = nw >= 4 && (j === Math.floor(nw / 2) - 1 || j === Math.floor(nw / 2));
        g += rect(gx + 1.2, y0 + 3, wdw - 2.4, H - pl2 - 6, face, 'door', line + ' rx="2"');
        if (isG) { g += rect(gx + 6, y0 + 9, wdw - 12, H - pl2 - 18, glass, 'glass', line); for (var q = 1; q < 6; q++) g += '<line class="shelf" x1="' + (gx + 7) + '" y1="' + (y0 + 9 + (H - pl2 - 18) * q / 6).toFixed(1) + '" x2="' + (gx + wdw - 7) + '" y2="' + (y0 + 9 + (H - pl2 - 18) * q / 6).toFixed(1) + '" stroke="' + stroke + '"/>'; }
        g += handle(j % 2 === 0 ? gx + wdw - 8 : gx + 8, y0 + H * 0.38, H * 0.24, true, hc);
      }
    }
    // dimensions
    var dy = floor + 26;
    g += '<path class="dim" d="M' + x0 + ' ' + (dy - 7) + 'V' + (dy + 7) + 'M' + (x0 + W) + ' ' + (dy - 7) + 'V' + (dy + 7) + 'M' + x0 + ' ' + dy + 'H' + (x0 + W) + '"/>';
    g += '<rect x="' + (300 - 38) + '" y="' + (dy - 11) + '" width="76" height="22" rx="11" fill="' + (day ? '#fffaf2' : '#1f1711') + '"/><text class="dimt" x="300" y="' + (dy + 4.5) + '" text-anchor="middle">' + ms.w + ' cm</text>';
    var dx2 = x0 + W + 30;
    g += '<path class="dim" d="M' + (dx2 - 7) + ' ' + y0 + 'H' + (dx2 + 7) + 'M' + (dx2 - 7) + ' ' + floor + 'H' + (dx2 + 7) + 'M' + dx2 + ' ' + y0 + 'V' + floor + '"/>';
    g += '<g transform="translate(' + dx2 + ' ' + ((y0 + floor) / 2) + ') rotate(-90)"><rect x="-36" y="-11" width="72" height="22" rx="11" fill="' + (day ? '#fffaf2' : '#1f1711') + '"/><text class="dimt" x="0" y="4.5" text-anchor="middle">' + ms.h + ' cm</text></g>';
    svg.innerHTML = g;
    // price / ref
    var price = Math.round(o.rate * ms.w * Math.pow(ms.h / o.h, 0.6) * f.f / 500) * 500;
    $('#bpPrice').textContent = fmt(price);
    $('#bpDays').textContent = ms.type === 'wardrobe' || ms.type === 'coffee' ? '30–45' : '21–30';
    var ref = 'ML-' + ms.type.slice(0, 2).toUpperCase() + '-' + ms.w + 'x' + ms.h + '-' + ms.fin.slice(0, 2).toUpperCase();
    $('#bpRef').textContent = ref;
    $('#msWv').textContent = ms.w; $('#msHv').textContent = ms.h;
    var msg = [t('ms.wa') + ' — Meloky Furniture', '', t('ms.type') + ': ' + t('type.' + ms.type), t('ms.width') + ': ' + ms.w + ' ' + t('ms.cm'), t('ms.height') + ': ' + ms.h + ' ' + t('ms.cm'), t('ms.finish') + ': ' + t('fin.' + ms.fin), t('ms.handle') + ': ' + t('hdl.' + ms.hdl), t('ms.est') + ': ' + fmt(price) + ' ' + t('shop.currency'), t('ms.ref') + ': ' + ref].join('\n');
    var a = $('#bpSend'); a.href = wa(msg); a.target = '_blank'; a.rel = 'noopener';
    store.set('ml-ms', ms);
  }

  /* ---------- shop ---------- */
  var list = store.get('ml-list', []);
  var curCat = 'all';
  function prodById(id) { return D.products.filter(function (p) { return p.id === id; })[0]; }
  function pname(p) { return t('p.' + p.id); }
  function renderShop() {
    var cats = ['all', 'living', 'bedroom', 'dining', 'storage', 'decor'];
    $('#chips').innerHTML = cats.map(function (c) { return '<button class="chip' + (c === curCat ? ' is-on' : '') + '" data-c="' + c + '">' + (c === 'all' ? t('shop.all') : t('cat.' + c)) + '</button>'; }).join('');
    $$('#chips .chip').forEach(function (b) { b.addEventListener('click', function () { filterShop(b.dataset.c); }); });
    $('#grid').innerHTML = D.products.map(function (p) {
      var on = list.indexOf(p.id) > -1;
      return '<article class="card rv" data-cat="' + p.cat + '" data-id="' + p.id + '">' +
        '<div class="card__img" data-qv><img src="assets/img/' + p.id + '.webp" alt="' + pname(p) + '" loading="lazy"></div>' +
        '<div class="card__body"><span class="card__cat">' + t('cat.' + p.cat) + '</span><h3>' + pname(p) + '</h3>' +
        '<div class="card__row"><span class="card__price">' + t('shop.from') + ' <b class="num">' + fmt(p.price) + '</b> ' + t('shop.currency') + '</span>' +
        '<button class="heart' + (on ? ' on' : '') + '" data-heart aria-label="' + t('shop.add') + '"><svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/></svg></button></div></div></article>';
    }).join('');
    $$('#grid .card').forEach(function (c) {
      c.querySelector('[data-heart]').addEventListener('click', function () { toggleList(c.dataset.id); });
      c.querySelector('[data-qv]').addEventListener('click', function () { openModal(c.dataset.id); });
    });
    filterShop(curCat, true);
    observeReveal();
  }
  function filterShop(cat, silent) {
    curCat = cat;
    $$('#chips .chip').forEach(function (b) { b.classList.toggle('is-on', b.dataset.c === cat); });
    $$('#grid .card').forEach(function (c) { c.classList.toggle('is-hidden', cat !== 'all' && c.dataset.cat !== cat); });
    if (!silent && window.ScrollTrigger) ScrollTrigger.refresh();
  }
  function toggleList(id) {
    var i = list.indexOf(id);
    if (i > -1) list.splice(i, 1); else list.push(id);
    store.set('ml-list', list);
    $$('[data-id="' + id + '"] [data-heart]').forEach(function (h) { h.classList.toggle('on', i < 0); });
    var lb = $('#listBtn'); lb.classList.remove('bump'); void lb.offsetWidth; lb.classList.add('bump');
    renderList(); updateModalBtn();
  }
  function renderList() {
    $('#listCount').textContent = list.length;
    $('#listBtn').classList.toggle('has', list.length > 0);
    var body = $('#drawerBody');
    if (!list.length) { body.innerHTML = '<p class="drawer__empty">' + t('list.empty') + '</p>'; $('#drawerSend').style.display = 'none'; return; }
    $('#drawerSend').style.display = '';
    body.innerHTML = list.map(function (id) {
      var p = prodById(id); if (!p) return '';
      return '<div class="li"><img src="assets/img/' + p.id + '.webp" alt=""><div><h4>' + pname(p) + '</h4><p>' + t('shop.from') + ' <span class="num">' + fmt(p.price) + '</span> ' + t('shop.currency') + '</p></div><button class="x" data-rm="' + p.id + '" aria-label="remove">×</button></div>';
    }).join('');
    $$('[data-rm]').forEach(function (b) { b.addEventListener('click', function () { toggleList(b.dataset.rm); }); });
    var msg = t('wa.list') + '\n' + list.map(function (id, k) { var p = prodById(id); return p ? (k + 1) + '. ' + pname(p) + ' (' + t('shop.from') + ' ' + fmt(p.price) + ' ' + t('shop.currency') + ')' : ''; }).join('\n');
    var s = $('#drawerSend'); s.href = wa(msg); s.target = '_blank'; s.rel = 'noopener';
  }
  function lockScroll(o) { if (window.__lenis) { o ? __lenis.stop() : __lenis.start(); } document.body.classList.toggle('is-locked', o); }
  function openDrawer(o) { $('#drawer').classList.toggle('is-open', o); $('#drawer').setAttribute('aria-hidden', !o); lockScroll(o); }
  $('#listBtn').addEventListener('click', function () { openDrawer(true); });
  $('#drawerX').addEventListener('click', function () { openDrawer(false); });
  $('#drawer').addEventListener('click', function (e) { if (e.target === this) openDrawer(false); });

  var mId = null;
  function openModal(id) {
    var p = prodById(id); if (!p) return; mId = id;
    $('#modalImg').src = 'assets/img/' + p.id + '.webp'; $('#modalImg').alt = pname(p);
    $('#modalCat').textContent = t('cat.' + p.cat);
    $('#modalName').textContent = pname(p);
    $('#modalDesc').textContent = t('p.' + p.id + '.d');
    $('#modalPrice').innerHTML = t('shop.from') + ' <b class="num">' + fmt(p.price) + '</b> ' + t('shop.currency');
    $('#modalSpecs').innerHTML = '<li><span>' + t('shop.dims') + '</span><span class="num">' + p.dims + '</span></li><li><span>✦</span><span>' + t('shop.made') + '</span></li>';
    $('#modalWa').href = wa(t('wa.hello') + ': ' + pname(p) + ' — Meloky Furniture');
    updateModalBtn();
    $('#modal').classList.add('is-open'); $('#modal').setAttribute('aria-hidden', 'false');
    lockScroll(true);
  }
  function updateModalBtn() { if (!mId) return; var on = list.indexOf(mId) > -1; $('#modalAdd').textContent = on ? t('shop.added') : t('shop.add'); }
  function closeModal() { if (!mId) return; $('#modal').classList.remove('is-open'); $('#modal').setAttribute('aria-hidden', 'true'); mId = null; lockScroll(false); }
  $('#modalAdd').addEventListener('click', function () { if (mId) toggleList(mId); });
  $('#modalX').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); if ($('#drawer').classList.contains('is-open')) openDrawer(false); } });

  /* ---------- craft ---------- */
  function renderSteps() {
    $('#steps').innerHTML = D.craft.map(function (c) {
      return '<li class="step rv"><img src="assets/img/' + c.img + '.webp" alt="" loading="lazy"><span class="step__n num">0' + c.id + '</span><div class="step__b"><h3>' + t('craft.' + c.id + '.t') + '</h3><p>' + t('craft.' + c.id + '.p') + '</p></div></li>';
    }).join('');
    observeReveal();
  }

  /* ---------- export ---------- */
  function renderExport() {
    var opts = ['living', 'bedroom', 'dining', 'storage', 'decor'].map(function (c) { return '<option>' + t('cat.' + c) + '</option>'; }).join('') + '<option>' + t('ex.full') + '</option>';
    $('#exItems').innerHTML = opts;
  }
  $('#exForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, lines = [t('wa.export'), ''];
    [['ex.company', f.company.value], ['ex.country', f.country.value], ['ex.items', f.items.value], ['ex.qty', f.qty.value], ['ex.notes', f.notes.value]].forEach(function (r) { if (r[1] && r[1].trim()) lines.push(t(r[0]) + ': ' + r[1].trim()); });
    window.open(wa(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------- nav ---------- */
  function setNav(o) {
    document.body.classList.toggle('nav-open', o);
    document.body.classList.toggle('is-locked', o);
    if (window.__lenis) o ? __lenis.stop() : __lenis.start();
    onScroll(window.scrollY);
  }
  $('#burger').addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
  function go(hash) {
    var el = $(hash); if (!el) return;
    var off = hash === '#top' ? 0 : -(isMobile() ? 56 : 70);
    if (window.__lenis) __lenis.scrollTo(el, { offset: off, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var h = a.getAttribute('href'); if (h.length < 2) return;
    e.preventDefault(); if (document.body.classList.contains('nav-open')) setNav(false); go(h);
  });

  /* ---------- reveal & counters ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observeReveal() { $$('.rv:not(.in)').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 80 + 'ms'; if (io) io.observe(el); else el.classList.add('in'); }); }
  $$('.h2, .sec-head .lead, .bp, .measure__info .ctl, .form, .vcard, .ticks li').forEach(function (el) { el.classList.add('rv'); });
  var cio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return; cio.unobserve(en.target);
      var el = en.target, to = +el.dataset.count, st = performance.now();
      (function tick(now) { var k = Math.min(1, (now - st) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(st);
    });
  }) : null;
  $$('[data-count]').forEach(function (el) { if (cio) cio.observe(el); else el.textContent = el.dataset.count; });

  /* ---------- hero frames ---------- */
  var FR = window.ML_FRAMES || 72, frames = [], cur = 0;
  var cv = $('#heroCanvas'), cx = cv.getContext('2d');
  function src(i) { return 'assets/seq/f' + String(i + 1).padStart(3, '0') + '.webp'; }
  function sizeCanvas() { var dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; }
  function draw(i) {
    i = Math.max(0, Math.min(FR - 1, i));
    var im = frames[i];
    if (!im || !im.complete || !im.naturalWidth) { im = null; for (var k = i; k >= 0; k--) if (frames[k] && frames[k].complete && frames[k].naturalWidth) { im = frames[k]; break; } }
    if (!im) return;
    var W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight;
    var portrait = W / H < 1, s, w, h, x, y;
    if (portrait) { s = Math.max(W * 1.5 / iw, H * 0.4 / ih); w = iw * s; h = ih * s; x = (W - w) / 2; y = H * 0.34 - h / 2; }
    else { s = Math.max(W * 1.16 / iw, H / ih); w = iw * s; h = ih * s; x = (W - w) / 2 + (root.dir === 'rtl' ? -W * 0.08 : W * 0.08); y = (H - h) / 2 + H * 0.03; }
    cx.fillStyle = '#0c0806'; cx.fillRect(0, 0, W, H);
    cx.drawImage(im, x, y, w, h);
    if (portrait) {
      var e = h * 0.28, gr;
      gr = cx.createLinearGradient(0, y + h - e, 0, y + h); gr.addColorStop(0, 'rgba(12,8,6,0)'); gr.addColorStop(1, '#0c0806'); cx.fillStyle = gr; cx.fillRect(0, y + h - e, W, e + 1);
      gr = cx.createLinearGradient(0, y, 0, y + e * 0.8); gr.addColorStop(0, '#0c0806'); gr.addColorStop(1, 'rgba(12,8,6,0)'); cx.fillStyle = gr; cx.fillRect(0, y - 1, W, e * 0.8);
    }
  }
  function loadFrames() {
    for (var i = 0; i < FR; i++) {
      (function (i) {
        var im = new Image(); im.decoding = 'async'; im.src = src(i);
        im.onload = function () { if (i === 0 || i === cur) draw(cur); };
        frames[i] = im;
      })(i);
    }
  }
  sizeCanvas(); loadFrames();
  window.addEventListener('resize', function () { sizeCanvas(); draw(cur); });

  /* ---------- header / bbar ---------- */
  var lastY = 0, hdrHidden = false;
  function onScroll(y) {
    var hdr = $('#hdr'), navOpen = document.body.classList.contains('nav-open');
    var mob = isMobile();
    hdr.classList.toggle('is-solid', navOpen || y > (mob ? 24 : 60));
    var dy = y - lastY;
    if (mob && !navOpen) { if (y < 80) hdrHidden = false; else if (dy > 6) hdrHidden = true; else if (dy < -6) hdrHidden = false; }
    else hdrHidden = false;
    hdr.classList.toggle('is-hidden', hdrHidden);
    lastY = y;
    $('.bbar').classList.toggle('show', y > window.innerHeight * 0.6);
    $('.hero__hint').style.opacity = y > 60 ? 0 : 1;
  }

  /* ---------- init ---------- */
  setLang(lang);
  draw(0);

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger); stReady = true;
    if (window.Lenis && !window.matchMedia('(prefers-reduced-motion:reduce)').matches && !window.matchMedia('(hover:none),(pointer:coarse)').matches) {
      var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', function (e) { ScrollTrigger.update(); onScroll(e.scroll); });
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
    }
    var steps = $$('.hero__step'), step = 0;
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.3,
      onUpdate: function (s) {
        var p = s.progress;
        var fp = Math.min(1, Math.max(0, (p - 0.08) / 0.78));
        var f = Math.round(fp * (FR - 1));
        if (f !== cur) { cur = f; requestAnimationFrame(function () { draw(cur); }); }
        $('#heroBar').style.transform = 'scaleX(' + fp + ')';
        var ns = p < 0.3 ? 0 : p < 0.66 ? 1 : 2;
        if (ns !== step) { step = ns; steps.forEach(function (el, i) { el.classList.toggle('is-on', i === ns); }); }
      }
    });
    gsap.to('.export__bg', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.export', start: 'top bottom', end: 'bottom top', scrub: true } });
    setupStatement();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else {
    window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
  }
  onScroll(window.scrollY);
  observeReveal();
})();

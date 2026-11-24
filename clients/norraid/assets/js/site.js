/* NORRAID AFRICA – front-end behaviour. No dependencies, works without it too (progressive enhancement). */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* header shadow on scroll + sticky mobile donate bar */
  var hdr = $('[data-header]'), mDonate = $('.m-donate'), ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle('scrolled', y > 8);
    if (mDonate) {
      var nearEnd = (window.innerHeight + y) > (d.body.scrollHeight - 420);
      mDonate.classList.toggle('show', y > 520 && !nearEnd && !d.body.classList.contains('donate-page'));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* dropdowns */
  function closeAll(except) {
    $$('.dd.open').forEach(function (dd) {
      if (dd !== except) { dd.classList.remove('open'); var b = $('.dd-btn', dd); if (b) b.setAttribute('aria-expanded', 'false'); }
    });
  }
  $$('.dd').forEach(function (dd) {
    var btn = $('.dd-btn', dd);
    if (!btn) return;
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var open = !dd.classList.contains('open');
      closeAll(dd);
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var first = $('a', dd); if (first && ev.detail === 0) first.focus(); }
    });
  });
  d.addEventListener('click', function (ev) { if (!ev.target.closest('.dd')) closeAll(); });
  d.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    var openDd = $('.dd.open');
    closeAll();
    if (openDd) { var b = $('.dd-btn', openDd); if (b) b.focus(); }
    if (nav && nav.classList.contains('open')) toggleMenu(false);
  });

  /* mobile menu */
  var menuBtn = $('.menu-btn'), nav = $('#main-nav');
  function toggleMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    d.body.classList.toggle('menu-open', open);
    if (!open) closeAll();
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { toggleMenu(!nav.classList.contains('open')); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1120 && nav && nav.classList.contains('open')) toggleMenu(false); });

  /* remember language choice */
  $$('[data-setlang]').forEach(function (a) {
    a.addEventListener('click', function () {
      d.cookie = 'nr_lang=' + encodeURIComponent(a.getAttribute('data-setlang')) + ';path=/;max-age=31536000;samesite=lax' + (location.protocol === 'https:' ? ';secure' : '');
    });
  });

  /* reveal on scroll */
  var reveals = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min((i % 4) * 70, 210) + 'ms';
      io.observe(el);
    });
  }

  /* count-up numbers (only for verified data rendered with data-count) */
  var counters = $$('[data-count]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var fmt = new Intl.NumberFormat(root.lang || 'en', { numberingSystem: 'latn' });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, end = parseInt(el.getAttribute('data-count'), 10) || 0, t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          el.textContent = fmt.format(v);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* AJAX forms (newsletter, contact): progressive – plain POST still works */
  $$('form[data-ajax]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      if (!window.fetch || !window.FormData) return;
      ev.preventDefault();
      var msg = $('.form-msg', f), btn = $('[type=submit]', f);
      if (!f.checkValidity()) { f.reportValidity && f.reportValidity(); return; }
      if (btn) btn.disabled = true;
      if (msg) { msg.textContent = ''; msg.className = 'form-msg'; }
      fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' }, credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (msg) { msg.textContent = j.message || ''; msg.classList.add(j.ok ? 'ok' : 'err'); }
          if (j.ok) f.reset();
        })
        .catch(function () { f.submit(); })
        .then(function () { if (btn) btn.disabled = false; });
    });
  });

  /* donate form */
  var df = $('[data-donate]');
  if (df) {
    var i18n = {};
    try { i18n = JSON.parse(($('#donate-i18n') || {}).textContent || '{}'); } catch (e) {}
    var customRow = $('[data-custom]', df), customInput = $('#custom-amt'), err = $('[data-err]', df), summary = $('[data-summary]', df);
    var cur = new Intl.NumberFormat(root.lang || 'en', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, numberingSystem: 'latn' });
    function val(name) { var r = $('input[name="' + name + '"]:checked', df); return r ? r.value : ''; }
    function fundName() { var f = val('fund'); return f === 'general' || !f ? (i18n.general || '') : ((i18n.countries || {})[f] || f); }
    function amount() {
      var a = val('amount');
      if (a === 'custom') { var n = parseFloat(customInput && customInput.value); return isFinite(n) ? n : NaN; }
      return parseFloat(a);
    }
    function update() {
      var isCustom = val('amount') === 'custom';
      if (customRow) customRow.hidden = !isCustom;
      var a = amount();
      if (summary) {
        var tpl = (a >= 1 && a <= 10000) ? (i18n.summary || '') : (i18n.summary_any || '');
        summary.textContent = tpl.replace('{amount}', isFinite(a) ? cur.format(a) : '').replace('{fund}', fundName());
      }
      if (err && !isNaN(a) && a >= 1 && a <= 10000) err.hidden = true;
    }
    df.addEventListener('change', function (ev) {
      update();
      if (ev.target.name === 'amount' && ev.target.value === 'custom' && customInput) customInput.focus();
    });
    if (customInput) customInput.addEventListener('input', update);
    df.addEventListener('submit', function (ev) {
      var a = amount();
      if (isNaN(a) || a < 1 || a > 10000) {
        ev.preventDefault();
        if (err) { err.hidden = false; err.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); }
        if (customInput && val('amount') === 'custom') customInput.focus();
      }
    });
    update();
  }

  /* footer year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

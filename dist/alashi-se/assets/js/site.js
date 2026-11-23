(function () {
  var d = document, html = d.documentElement;
  html.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- intro (home, once per session)
  if (html.classList.contains('intro')) {
    var fired = false;
    var done = function () {
      if (fired) return; fired = true;
      try { sessionStorage.setItem('al-intro', '1'); } catch (e) {}
      html.classList.add('intro-out');
      html.classList.remove('intro');
      var ov = d.getElementById('intro');
      if (ov) setTimeout(function () { ov.remove(); html.classList.remove('intro-out'); }, 900);
    };
    setTimeout(done, 2100);
    d.addEventListener('click', function skip() { d.removeEventListener('click', skip); done(); }, { once: true });
  }

  // ---- header
  var hdr = d.getElementById('hdr'), lastY = 0;
  function onScroll() {
    var y = scrollY;
    hdr.classList.toggle('scrolled', y > 30);
    hdr.classList.toggle('hide', y > 500 && y > lastY && !d.getElementById('nav').classList.contains('open'));
    lastY = y;
    thread();
  }
  addEventListener('scroll', onScroll, { passive: true });

  // ---- mobile menu
  var burger = d.getElementById('burger'), nav = d.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    d.body.style.overflow = open ? 'hidden' : '';
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a') && nav.classList.contains('open')) burger.click(); });

  // ---- services dropdown (keyboard / touch)
  var dd = d.querySelector('.dd'), ddb = d.querySelector('.dd-btn');
  if (ddb) {
    ddb.addEventListener('click', function () { var o = dd.classList.toggle('open'); ddb.setAttribute('aria-expanded', o); });
    d.addEventListener('click', function (e) { if (!dd.contains(e.target)) { dd.classList.remove('open'); ddb.setAttribute('aria-expanded', 'false'); } });
  }

  // ---- reveal on scroll + counters
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      var c = e.target.querySelector('[data-count]');
      if (c) count(c);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  d.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  function count(el) {
    var raw = el.getAttribute('data-count'), n = parseInt(raw, 10), suf = raw.replace(/^\d+/, '');
    if (reduce || !n) return;
    var from = n > 1000 ? n - 40 : 0, t0 = performance.now(), dur = 1400;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (n - from) * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // ---- stitched threads draw with scroll
  var threads = [].slice.call(d.querySelectorAll('.hero-thread path, .steps-stitch path'));
  function thread() {
    if (reduce) return;
    var vh = innerHeight;
    threads.forEach(function (p) {
      var r = p.ownerSVGElement.getBoundingClientRect();
      var prog = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * .6)));
      if (p.closest('.hero-thread')) prog = Math.min(1, .35 + scrollY / (vh * .9));
      p.style.strokeDashoffset = (1 - prog).toFixed(3);
    });
  }
  threads.forEach(function (p) { p.style.strokeDashoffset = 1; });

  // ---- hero tags: subtle parallax
  var stack = d.querySelector('.ht-stack');
  if (stack && !reduce && matchMedia('(pointer:fine)').matches) {
    d.querySelector('.hero').addEventListener('pointermove', function (e) {
      var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      stack.style.transform = 'rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });
    stack.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
  }

  // ---- picker
  d.querySelectorAll('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      var k = c.getAttribute('data-k');
      d.querySelectorAll('.chip').forEach(function (x) { var on = x === c; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      d.querySelectorAll('.pk-panel').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-k') === k); });
    });
  });

  // ---- click-to-load map (no Google request until the visitor asks)
  d.querySelectorAll('.map').forEach(function (m) {
    var b = m.querySelector('.map-btn');
    if (!b) return;
    b.addEventListener('click', function () {
      var f = d.createElement('iframe');
      f.src = m.getAttribute('data-src'); f.title = 'Karta – Nygatan 22, Umeå'; f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      m.querySelector('.map-ph').remove(); m.appendChild(f);
    });
  });

  // ---- contact form -> mailto
  var form = d.getElementById('cform');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var body = (f.get('msg') || '') + '\n\n' + (f.get('name') || '') + '\n' + (f.get('phone') || '');
    location.href = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + encodeURIComponent('Fråga via alashi.se – ' + (f.get('name') || '')) + '&body=' + encodeURIComponent(body);
  });

  onScroll();
})();

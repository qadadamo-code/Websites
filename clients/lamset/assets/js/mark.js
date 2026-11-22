/* Lamset Decor · logo builder
   Roof is a real stroke (so it can be drawn), the fingerprint ridges and the
   script are traced shapes revealed with clips. */
(function () {
  'use strict';
  var M = window.LAMSA_MARK;
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* opts.build: add the clips used by the intro animation
     opts.only: 'print' renders only the fingerprint (used as a motif) */
  function mount(host, opts) {
    opts = opts || {};
    var id = 'lm' + (++uid);
    var only = opts.only;
    var vb = only === 'print' ? '940 740 1020 840' : '520 260 1820 2220';
    var svg = el('svg', { viewBox: vb, class: 'mark' + (opts.build ? ' mark--build' : ''), role: 'img', 'aria-label': 'لمسة ديكور Lamset Decor' });
    var defs = el('defs', {}, svg);

    if (!only) el('path', { d: M.roof, class: 'mark__roof', pathLength: 1 }, svg);

    var gp = el('g', { class: 'mark__print' }, svg);
    if (opts.build) {
      var cp = el('clipPath', { id: id + 'p' }, defs);
      el('circle', { class: 'mark__ripple', cx: 1450, cy: 1560, r: 0 }, cp);
      gp.setAttribute('clip-path', 'url(#' + id + 'p)');
    }
    M.print.forEach(function (d, i) { el('path', { d: d, class: 'mark__ridge', 'data-i': i }, gp); });

    if (!only) {
      var ga = el('g', { class: 'mark__ar' }, svg);
      var gl = el('g', { class: 'mark__la' }, svg);
      if (opts.build) {
        var ca = el('clipPath', { id: id + 'a' }, defs);
        el('rect', { class: 'mark__wipeA', x: 2320, y: 1400, width: 0, height: 600 }, ca);
        ga.setAttribute('clip-path', 'url(#' + id + 'a)');
        var cl = el('clipPath', { id: id + 'l' }, defs);
        el('rect', { class: 'mark__wipeL', x: 520, y: 1450, width: 0, height: 1050 }, cl);
        gl.setAttribute('clip-path', 'url(#' + id + 'l)');
      }
      el('path', { d: M.ar, class: 'mark__ink' }, ga);
      el('path', { d: M.la, class: 'mark__ink' }, gl);
    }
    host.innerHTML = '';
    host.appendChild(svg);
    return svg;
  }

  /* intro: roof is drawn, the touch ripples out, then the name is written */
  function build(svg) {
    if (!window.gsap) return null;
    var tl = gsap.timeline();
    var roof = svg.querySelector('.mark__roof');
    var ridges = svg.querySelectorAll('.mark__ridge');
    gsap.set(roof, { strokeDasharray: 1, strokeDashoffset: 1 });
    tl.to(roof, { strokeDashoffset: 0, duration: 1.2, ease: 'power3.inOut' }, 0.1)
      .to(svg.querySelector('.mark__ripple'), { attr: { r: 820 }, duration: 1.4, ease: 'power2.out' }, 0.7)
      .fromTo(ridges, { opacity: 0, scale: 0.86, transformOrigin: '50% 100%' }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.07 }, 0.7)
      .to(svg.querySelector('.mark__wipeA'), { attr: { x: 880, width: 1440 }, duration: 0.9, ease: 'power2.inOut' }, 1.45)
      .to(svg.querySelector('.mark__wipeL'), { attr: { width: 1700 }, duration: 1.0, ease: 'power2.inOut' }, 1.75);
    return tl;
  }

  window.LamsaMark = { mount: mount, build: build };
})();

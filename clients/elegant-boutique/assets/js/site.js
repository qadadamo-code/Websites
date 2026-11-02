/* Elegance Boutique — storefront interactions (vanilla JS + GSAP/ScrollTrigger + Lenis). */
(() => {
  'use strict';
  const EB = window.EB || { products: [], s: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const RTL = document.documentElement.dir === 'rtl';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const byId = Object.fromEntries(EB.products.map(p => [p.id, p]));
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const money = n => EB.lang === 'ar' ? `${fmt(n)} ${EB.cur}` : `${EB.cur} ${fmt(n)}`;
  EB.money = money;

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .9 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const lockScroll = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; if (lenis) on ? lenis.stop() : lenis.start(); };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t, { offset: 0, duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------------- preloader ---------------- */
  const pre = $('.preloader');
  const startPage = () => {
    document.body.classList.add('is-ready');
    $$('.hero [data-split]').forEach(el => { el.style.setProperty('--base', '150ms'); el.classList.add('is-in'); });
    if (hasGsap && $('.hero')) {
      gsap.from('.hero__eyebrow, .hero__sub, .hero__ctas, .hero__foot', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12, delay: .5 });
    }
    countUp();
  };
  if (pre) {
    const bar = $('.preloader__bar i');
    const imgs = $$('img').slice(0, 10);
    let loaded = 0;
    const tick = () => bar && bar.style.setProperty('--p', Math.min(1, ++loaded / (imgs.length + 1)));
    imgs.forEach(i => i.complete ? tick() : i.addEventListener('load', tick, { once: true }));
    const minTime = new Promise(r => setTimeout(r, reduce ? 0 : 1700));
    const ready = new Promise(r => { if (document.readyState === 'complete') r(); else addEventListener('load', r, { once: true }); setTimeout(r, 3500); });
    Promise.all([minTime, ready]).then(() => { bar && bar.style.setProperty('--p', 1); setTimeout(() => { pre.classList.add('is-done'); startPage(); setTimeout(() => pre.remove(), 1300); }, 250); });
  } else {
    requestAnimationFrame(startPage);
  }

  /* ---------------- header ---------------- */
  const hdr = $('[data-hdr]');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    if (hdr) {
      hdr.classList.toggle('is-scrolled', y > 40);
      hdr.classList.toggle('is-hidden', y > 500 && y > lastY + 4 && !document.body.classList.contains('no-hide'));
      if (y < lastY - 4) hdr.classList.remove('is-hidden');
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- menu + search ---------------- */
  const menu = $('[data-menu]');
  $$('[data-menu-open]').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect();
    menu.style.setProperty('--mx', (r.left + r.width / 2) + 'px');
    menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); lockScroll(true);
  }));
  $$('[data-menu-close]').forEach(b => b.addEventListener('click', () => { menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); lockScroll(false); }));

  const search = $('[data-search]'), sInput = $('[data-search-input]'), sRes = $('[data-search-results]');
  const renderSearch = q => {
    q = q.trim().toLowerCase();
    const list = q ? EB.products.filter(p => (p.name + ' ' + p.catName).toLowerCase().includes(q)) : EB.products.slice(0, 8);
    sRes.innerHTML = list.length ? list.map((p, i) => `<a class="search__item" style="--i:${i}" href="${p.url}"><img src="${p.img}" alt="" loading="lazy"><b>${esc(p.name)}</b><span>${money(p.price)}</span></a>`).join('')
      : `<p class="search__empty">${EB.s.noResults}</p>`;
  };
  const openSearch = () => { search.classList.add('is-open'); search.setAttribute('aria-hidden', 'false'); lockScroll(true); renderSearch(''); setTimeout(() => sInput.focus(), 80); };
  const closeSearch = () => { search.classList.remove('is-open'); search.setAttribute('aria-hidden', 'true'); lockScroll(false); };
  $$('[data-search-open]').forEach(b => b.addEventListener('click', openSearch));
  $$('[data-search-close]').forEach(b => b.addEventListener('click', closeSearch));
  sInput && sInput.addEventListener('input', () => renderSearch(sInput.value));
  sInput && sInput.addEventListener('keydown', e => { if (e.key === 'Enter' && sInput.value.trim()) location.href = 'shop.php?q=' + encodeURIComponent(sInput.value.trim()); });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (search && search.classList.contains('is-open')) closeSearch();
    if (menu && menu.classList.contains('is-open')) $('[data-menu-close]').click();
    closeCart(); closeLightbox();
  });

  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* ---------------- cart ---------------- */
  const KEY = 'eb_cart_v1';
  const read = () => { try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter(l => byId[l.id]); } catch (e) { return []; } };
  const write = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} };
  const Cart = {
    get: read,
    count: () => read().reduce((a, l) => a + l.qty, 0),
    subtotal: () => read().reduce((a, l) => a + byId[l.id].price * l.qty, 0),
    add(id, qty = 1) {
      const p = byId[id]; if (!p || p.stock < 1) return false;
      const c = read(); const line = c.find(l => l.id === id);
      if (line) line.qty = Math.min(p.stock, line.qty + qty); else c.push({ id, qty: Math.min(p.stock, qty) });
      write(c); render(); return true;
    },
    set(id, qty) {
      let c = read(); const p = byId[id];
      c = qty < 1 ? c.filter(l => l.id !== id) : c.map(l => l.id === id ? { ...l, qty: Math.min(p.stock, qty) } : l);
      write(c); render();
    },
    clear() { write([]); render(); },
  };
  EB.cart = Cart;

  const drawer = $('[data-cart]');
  function openCart() { if (!drawer) return; drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); lockScroll(true); }
  function closeCart() { if (!drawer || !drawer.classList.contains('is-open')) return; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); lockScroll(false); }
  $$('[data-cart-open]').forEach(b => b.addEventListener('click', openCart));
  $$('[data-cart-close]').forEach(b => b.addEventListener('click', closeCart));

  function render() {
    const c = read(), n = Cart.count(), sub = Cart.subtotal();
    $$('[data-cart-count]').forEach(el => { el.textContent = n; el.classList.toggle('has', n > 0); });
    if (!drawer) return;
    drawer.classList.toggle('is-empty', !c.length);
    const items = $('[data-cart-items]');
    items.innerHTML = c.length ? c.map(l => {
      const p = byId[l.id];
      return `<div class="citem"><a href="${p.url}"><img src="${p.img}" alt=""></a>
        <div><a class="citem__name" href="${p.url}">${esc(p.name)}</a><span class="citem__cat">${esc(p.catName)}</span><div class="citem__price">${money(p.price)}</div></div>
        <div class="citem__side"><div class="qty qty--sm"><button type="button" data-cq="-1" data-id="${p.id}" aria-label="-">−</button><input value="${l.qty}" readonly aria-label="qty"><button type="button" data-cq="1" data-id="${p.id}" aria-label="+">+</button></div>
        <button class="citem__rm" data-crm="${p.id}">${EB.s.remove}</button></div></div>`;
    }).join('') : `<div class="drawer__empty"><svg class="mono" viewBox="0 0 120 120"><use href="#eb-mono"/></svg><b>${EB.s.empty}</b><span>${EB.s.emptySub}</span><a class="btn btn--dark btn--sm" href="shop.php">${EB.s.shopAll}</a></div>`;
    $('[data-cart-subtotal]').textContent = money(sub);
    const meter = $('[data-ship-meter]');
    if (meter) {
      meter.hidden = !EB.freeShip || !c.length;
      const left = EB.freeShip - sub;
      meter.classList.toggle('is-ok', left <= 0);
      $('p', meter).textContent = left > 0 ? EB.s.freeLeft.replace('%s', money(left)) : EB.s.freeOk;
      meter.style.setProperty('--p', Math.min(100, sub / EB.freeShip * 100) + '%');
    }
    document.dispatchEvent(new CustomEvent('eb:cart'));
  }
  drawer && drawer.addEventListener('click', e => {
    const q = e.target.closest('[data-cq]'), rm = e.target.closest('[data-crm]');
    if (q) { const l = read().find(x => x.id === q.dataset.id); if (l) Cart.set(l.id, l.qty + +q.dataset.cq); }
    if (rm) Cart.set(rm.dataset.crm, 0);
  });
  $$('[data-checkout-link]').forEach(a => a.addEventListener('click', e => { if (!Cart.count()) e.preventDefault(); }));

  const toastEl = $('[data-toast]'); let toastT;
  function toast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2800);
  }
  EB.toast = toast;

  function flyToCart(fromEl, src) {
    const target = $('.cart-btn');
    if (!fromEl || !target || !hasGsap || reduce) return;
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const img = new Image(); img.src = src; img.className = 'fly';
    const size = Math.min(a.width, 160);
    Object.assign(img.style, { width: size + 'px', height: size * 4 / 3 + 'px', left: a.left + a.width / 2 - size / 2 + 'px', top: a.top + a.height / 2 - size * 2 / 3 + 'px' });
    document.body.appendChild(img);
    gsap.to(img, {
      x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2),
      scale: .12, opacity: .4, rotate: RTL ? -20 : 20, duration: .9, ease: 'power3.in',
      onComplete: () => { img.remove(); target.classList.remove('is-bump'); void target.offsetWidth; target.classList.add('is-bump'); },
    });
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.add, p = byId[id];
    let qty = 1;
    if (btn.hasAttribute('data-with-qty')) { const qi = $('[data-qty-input]'); qty = Math.max(1, parseInt(qi && qi.value, 10) || 1); }
    if (!p || !Cart.add(id, qty)) { toast(EB.s.soldOut); return; }
    const card = btn.closest('.pcard');
    const src = card ? $('img', card) : ($('.pdp__img.is-on') || btn.closest('section')?.querySelector('img,canvas'));
    flyToCart(src || btn, p.img);
    toast(`<img src="${p.img}" alt=""><span><b>${EB.s.added}</b> · ${esc(p.name)}</span>`);
  });
  $$('[data-buy-now]').forEach(b => b.addEventListener('click', () => {
    const qi = $('[data-qty-input]');
    const id = b.dataset.buyNow, qty = Math.max(1, parseInt(qi && qi.value, 10) || 1);
    const line = read().find(l => l.id === id);
    if (!line) Cart.add(id, qty); else if (line.qty < qty) Cart.set(id, qty);
    location.href = 'checkout.php';
  }));

  render();
  addEventListener('storage', e => e.key === KEY && render());

  /* qty stepper (product page) */
  const qWrap = $('[data-qty]');
  if (qWrap) {
    const inp = $('[data-qty-input]', qWrap), max = +inp.max || 20;
    const set = v => inp.value = Math.max(1, Math.min(max, v));
    $('[data-qty-minus]', qWrap).addEventListener('click', () => set(+inp.value - 1));
    $('[data-qty-plus]', qWrap).addEventListener('click', () => set(+inp.value + 1));
    inp.addEventListener('change', () => set(parseInt(inp.value, 10) || 1));
  }

  /* ---------------- newsletter ---------------- */
  $$('[data-news]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(); fd.append('email', $('input', f).value); fd.append('csrf', EB.csrf);
    fetch('api/subscribe.php', { method: 'POST', body: fd }).then(r => r.json()).then(r => {
      f.classList.add('is-done'); toast(r.msg || '✓');
    }).catch(() => toast('✓'));
  }));

  /* ---------------- reveals ---------------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('[data-reveal], [data-split]').forEach(el => { if (!el.closest('.hero')) io.observe(el); });

  function countUp() {
    $$('[data-count]').forEach(el => {
      const to = +el.dataset.count;
      if (!hasGsap || reduce) { el.textContent = to; return; }
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 2.2, delay: .8, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) });
    });
  }

  /* card info height (positions the quick-add button just above the text) */
  const sizeCards = () => $$('.pcard').forEach(c => { const i = $('.pcard__info', c); if (i) c.style.setProperty('--info-h', i.offsetHeight + 'px'); });
  sizeCards(); addEventListener('resize', sizeCards);
  document.fonts && document.fonts.ready.then(sizeCards);

  /* ---------------- pointer effects ---------------- */
  if (fine && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__ring span');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    const loop = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('pointerover', e => {
      const lab = e.target.closest('[data-cursor]'), link = e.target.closest('a,button,select,label,input');
      cur.classList.toggle('is-label', !!lab); label.textContent = lab ? lab.dataset.cursor : '';
      cur.classList.toggle('is-link', !lab && !!link);
      cur.classList.toggle('is-hidden', !!e.target.closest('[data-lens]'));
    });
    document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));

    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });

    $$('[data-tilt]').forEach(card => {
      const media = $('.pcard__media', card) || card;
      card.addEventListener('pointermove', e => {
        const r = media.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((x - .5) * 8).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
        card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
  }

  /* magnifier lens: works on the spotlight photo and the product gallery */
  $$('[data-lens]').forEach(box => {
    const lens = $('.spot__lens', box); if (!lens || !fine) return;
    const Z = 2.6;
    box.addEventListener('pointerenter', () => box.classList.add('is-lens'));
    box.addEventListener('pointerleave', () => box.classList.remove('is-lens'));
    box.addEventListener('pointermove', e => {
      const img = $('.pdp__img.is-on', box) || $('img', box);
      const r = box.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      lens.style.left = x + 'px'; lens.style.top = y + 'px';
      lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      lens.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`;
      lens.style.backgroundPosition = `${-(x * Z - 95)}px ${-(y * Z - 95)}px`;
    });
  });

  /* ---------------- scroll scenes (GSAP) ---------------- */
  if (hasGsap) {
    // hero film drifts and dims as you leave it
    if ($('.hero')) {
      gsap.to('.hero__video', { scale: 1.22, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__content', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } });
    }

    // manifesto: each word lights up as it scrolls through
    $$('[data-scrub-words]').forEach(p => {
      const words = p.textContent.trim().split(/\s+/);
      p.innerHTML = words.map(w => `<span class="sw">${esc(w)}</span>`).join(' ');
      const spans = $$('.sw', p);
      spans.forEach((s, i) => { if (/…|\.\.\./.test(s.textContent) || i >= spans.length - 2) s.dataset.gold = '1'; });
      ScrollTrigger.create({
        trigger: p, start: 'top 80%', end: 'bottom 40%', scrub: true,
        onUpdate: st => { const n = Math.round(st.progress * spans.length); spans.forEach((s, i) => { s.classList.toggle('is-lit', i < n); s.classList.toggle('is-gold', i < n && !!s.dataset.gold); }); },
      });
    });

    // DECONSTRUCT: canvas image sequence scrubbed by scroll
    const decon = $('[data-decon]');
    if (decon) {
      const canvas = $('canvas', decon), ctx = canvas.getContext('2d');
      const N = +decon.dataset.frames, path = decon.dataset.path;
      const frames = new Array(N); let cur = -1, want = 0;
      const draw = i => {
        i = Math.max(0, Math.min(N - 1, i)); want = i;
        const img = frames[i];
        if (!img || !img.complete || !img.naturalWidth) return;
        if (i === cur) return; cur = i;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      const load = i => { if (frames[i]) return; const im = new Image(); im.decoding = 'async'; im.src = `${path}${String(i + 1).padStart(3, '0')}.jpg`; im.onload = () => { if (i === want || cur === -1) { cur = -1; draw(want); } }; frames[i] = im; };
      load(0);
      // start fetching the whole sequence once the visitor gets near the section
      ScrollTrigger.create({ trigger: decon, start: 'top 250%', once: true, onEnter: () => { for (let i = 0; i < N; i++) load(i); } });

      const steps = $$('.decon__step', decon), cuts = [0, .14, .36, .58, .8];
      const ring = $('.decon__ring', decon), bg = $('.decon__bg span', decon), bar = $('.decon__progress', decon);
      ScrollTrigger.create({
        trigger: decon, start: 'top top', end: 'bottom bottom', scrub: .4,
        onUpdate: st => {
          const p = st.progress;
          // hold the assembled piece briefly, then play the explode across the middle of the section
          const f = Math.min(1, Math.max(0, (p - .06) / .78));
          draw(Math.round(f * (N - 1)));
          let s = 0; cuts.forEach((c, i) => { if (p >= c) s = i; });
          steps.forEach((el, i) => el.classList.toggle('is-on', i === s));
          ring.style.setProperty('--rot', (p * 220).toFixed(1) + 'deg');
          ring.style.setProperty('--sc', (1 + Math.sin(p * Math.PI) * .12).toFixed(3));
          bg.style.setProperty('--bgx', ((RTL ? 1 : -1) * p * 30).toFixed(1) + 'vw');
          bar.style.setProperty('--p', p.toFixed(3));
        },
      });
    }

    // LOOKBOOK: vertical scroll drives a horizontal track
    const look = $('[data-look]');
    if (look) {
      const track = $('[data-look-track]', look);
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, {
        x: () => (RTL ? 1 : -1) * dist(), ease: 'none',
        scrollTrigger: { trigger: look, start: 'top top', end: () => '+=' + dist(), pin: '.look__pin', scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      $$('.look__img img', look).forEach(img => gsap.fromTo(img, { xPercent: RTL ? 6 : -6 }, { xPercent: RTL ? -6 : 6, ease: 'none', scrollTrigger: { trigger: look, start: 'top top', end: () => '+=' + dist(), scrub: true } }));
    }

    // spotlight frame parallax
    if ($('.spot__frame')) gsap.fromTo('.spot__frame img', { scale: 1.15, yPercent: -4 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.spot', start: 'top bottom', end: 'bottom top', scrub: true } });
    if ($('.finale__bg')) gsap.fromTo('.finale__bg', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom top', scrub: true } });
    if ($('.shop-hero__bg img')) gsap.to('.shop-hero__bg img', { yPercent: 12, scale: 1.18, ease: 'none', scrollTrigger: { trigger: '.shop-hero', start: 'top top', end: 'bottom top', scrub: true } });
    if ($('.ftr__giant')) gsap.fromTo('.ftr__giant', { yPercent: 40, opacity: .2 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    // LOOK CLOSER (product page): photo grows to full screen and pans across the piece
    const closer = $('[data-closer]');
    if (closer) {
      const frame = $('.closer__frame', closer), img = $('[data-closer-img]', closer), text = $('.closer__text', closer), notes = $$('[data-note]', closer);
      const small = () => { const w = Math.min(420, innerWidth * .7); return { w, h: w * 4 / 3 }; };
      gsap.set(frame, { aspectRatio: 'auto', width: () => small().w, height: () => small().h });
      const tl = gsap.timeline({ scrollTrigger: { trigger: closer, start: 'top top', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true,
        onUpdate: st => { const p = st.progress; notes.forEach((n, i) => n.classList.toggle('is-on', p > .45 + i * .15)); } } });
      tl.to(frame, { width: () => innerWidth, height: () => innerHeight, borderRadius: 0, duration: .35, ease: 'power2.inOut' })
        .to(frame, { '--shade': 1, duration: .1 }, '<.25')
        .to(text, { opacity: 1, y: 0, duration: .15 }, '<')
        .to(img, { scale: 1.9, xPercent: RTL ? 12 : -12, yPercent: -10, duration: .3, ease: 'none' }, '>')
        .to(img, { xPercent: RTL ? -10 : 10, yPercent: 12, duration: .3, ease: 'none' }, '>');
    }

    addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------------- product gallery ---------------- */
  const pdp = $('[data-pdp]');
  if (pdp) {
    const slides = $$('[data-slide]', pdp), thumbs = $$('[data-thumb]', pdp), counter = $('[data-counter]', pdp);
    let idx = 0;
    const show = i => {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-on', k === idx));
      thumbs.forEach((t, k) => t.classList.toggle('is-on', k === idx));
      if (counter) counter.textContent = idx + 1;
    };
    thumbs.forEach(t => { t.addEventListener('click', () => show(+t.dataset.thumb)); t.addEventListener('pointerenter', () => fine && show(+t.dataset.thumb)); });
    const main = $('.pdp__main', pdp);
    let sx = null;
    main.addEventListener('pointerdown', e => sx = e.clientX);
    main.addEventListener('pointerup', e => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { show(idx + ((dx < 0) !== RTL ? 1 : -1)); return; }
      openLightbox(slides[idx].currentSrc || slides[idx].src);
    });

    // sticky buy bar once the main button scrolls away
    const sb = $('[data-sticky-buy]'), buy = $('.pdp__buy');
    if (sb && buy) new IntersectionObserver(([en]) => sb.classList.toggle('is-on', !en.isIntersecting && en.boundingClientRect.top < 0)).observe(buy);
  }
  const lb = $('[data-lightbox]');
  function openLightbox(src) { if (!lb) return; $('img', lb).src = src; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lockScroll(true); }
  function closeLightbox() { if (!lb || !lb.classList.contains('is-open')) return; lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lockScroll(false); }
  lb && lb.addEventListener('click', closeLightbox);
})();

/* ---------- story hero + display window ---------- */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RTL = document.documentElement.dir === 'rtl';

  /* hero slider */
  const hs = $('[data-hs]');
  if (hs) {
    const slides = $$('[data-hs-slide]', hs), titles = $$('[data-hs-title]', hs), dots = $$('[data-hs-dot]', hs);
    const DUR = [7000, 5200, 5200, 6500];
    let idx = 0, timer = null, visible = true;

    // ruby sequence: plays exploded → assembled ("from stone to signature")
    const cv = $('[data-hs-seq]', hs), ctx = cv && cv.getContext('2d');
    const N = cv ? +cv.dataset.frames : 0, frames = [];
    let loaded = 0, playing = null;
    const draw = i => { const im = frames[i]; if (im && im.complete && im.naturalWidth) { ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(im, 0, 0, cv.width, cv.height); } };
    if (cv) for (let i = 0; i < N; i++) {
      const im = new Image(); im.src = `${cv.dataset.path}${String(i + 1).padStart(3, '0')}.jpg`;
      im.onload = () => { loaded++; if (i === N - 1 && !playing) draw(N - 1); };
      frames[i] = im;
    }
    const playSeq = () => {
      if (!cv) return;
      cancelAnimationFrame(playing);
      if (reduce) { draw(0); return; }
      const t0 = performance.now(), hold = 700, len = 3600;
      const step = t => {
        const p = Math.min(1, Math.max(0, (t - t0 - hold) / len));
        const e = 1 - Math.pow(1 - p, 3);
        draw(Math.round((N - 1) * (1 - e)));
        if (p < 1) playing = requestAnimationFrame(step); else playing = null;
      };
      playing = requestAnimationFrame(step);
    };

    const go = (n, user) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-on', k === idx));
      titles.forEach((s, k) => s.classList.toggle('is-on', k === idx));
      dots.forEach((d, k) => { d.classList.remove('is-on'); if (k === idx) { void d.offsetWidth; d.classList.add('is-on'); } });
      hs.style.setProperty('--hs-dur', DUR[idx] + 'ms');
      $$('video', hs).forEach(v => { if (v.closest('[data-hs-slide]') === slides[idx]) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause(); });
      if (slides[idx].classList.contains('hs__slide--seq')) playSeq();
      clearTimeout(timer);
      if (visible && !reduce) timer = setTimeout(() => go(idx + 1), DUR[idx]);
    };
    $('[data-hs-next]', hs).addEventListener('click', () => go(idx + 1, true));
    $('[data-hs-prev]', hs).addEventListener('click', () => go(idx - 1, true));
    dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.hsDot, true)));
    let sx = null;
    hs.addEventListener('pointerdown', e => sx = e.clientX);
    hs.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) go(idx + ((dx < 0) !== RTL ? 1 : -1), true); });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; clearTimeout(timer); if (visible) timer = setTimeout(() => go(idx + 1), DUR[idx]); }).observe(hs);
    go(0);
  }

  /* display window */
  const vit = $('[data-vit]');
  if (vit) {
    const scene = $('[data-vit-scene]', vit), row = $('[data-vit-row]', vit), items = $$('[data-vit-item]', vit), card = $('[data-vit-card]', vit);
    const mobile = () => matchMedia('(max-width: 860px)').matches;
    const gs = window.gsap;
    let cur = -1;
    const setRow = (x, y, s, dur) => {
      if (gs && !reduce) gs.to(row, { x, y, scale: s, duration: dur, ease: 'expo.inOut' });
      else row.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    };
    const open = k => {
      cur = (k + items.length) % items.length;
      const it = items[cur], d = it.dataset;
      items.forEach((x, i) => x.classList.toggle('is-on', i === cur));
      vit.classList.add('is-zoom'); card.setAttribute('aria-hidden', 'false');
      vit.style.setProperty('--vt', getComputedStyle(it).getPropertyValue('--tone'));
      $('[data-vit-no]', card).textContent = `N° ${String(cur + 1).padStart(2, '0')} · ${d.cat}`;
      $('[data-vit-name]', card).textContent = d.name;
      $('[data-vit-price]', card).textContent = d.price;
      $('[data-vit-notes]', card).innerHTML = JSON.parse(d.notes || '[]').map(n => `<li>${n.replace(/[<>&]/g, '')}</li>`).join('');
      $('[data-vit-url]', card).href = d.url;
      const add = $('[data-vit-add]', card); add.dataset.add = d.id; add.disabled = +d.stock < 1;
      if (mobile()) return;
      // move the "camera": reset, measure, then scale the row so the chosen niche fills the window
      const niche = it.querySelector('.vit__niche');
      const W = scene.clientWidth, H = scene.clientHeight;
      const cx = it.offsetLeft + it.offsetWidth / 2, cy = it.offsetTop + niche.offsetTop + niche.offsetHeight / 2;
      const s = Math.min(2.3, (H * .72) / niche.offsetHeight);
      const tx = W * (RTL ? .64 : .36), ty = H * .48;
      setRow(tx - cx * s, ty - cy * s, s, 1.3);
    };
    const close = () => {
      if (cur < 0) return;
      cur = -1; vit.classList.remove('is-zoom'); card.setAttribute('aria-hidden', 'true');
      items.forEach(x => x.classList.remove('is-on'));
      setRow(0, 0, 1, 1.1);
    };
    items.forEach((it, k) => it.addEventListener('click', e => { e.stopPropagation(); cur === k ? close() : open(k); }));
    $('[data-vit-next]', card).addEventListener('click', () => open(cur + 1));
    $('[data-vit-prev]', card).addEventListener('click', () => open(cur - 1));
    $('[data-vit-back]', card).addEventListener('click', close);
    card.addEventListener('click', e => e.stopPropagation());
    scene.addEventListener('click', close);
    addEventListener('keydown', e => { if (cur < 0) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') open(cur + (RTL ? -1 : 1)); if (e.key === 'ArrowLeft') open(cur + (RTL ? 1 : -1)); });
    addEventListener('resize', () => { if (cur >= 0 && !mobile()) open(cur); });
    gs && gs.set(row, { transformOrigin: '0 0' });
  }
})();

(() => {
  const S = window.STORE, doc = document.documentElement;
  const $ = (q, c = document) => c.querySelector(q), $$ = (q, c = document) => [...c.querySelectorAll(q)];
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  let lang = doc.lang === 'en' ? 'en' : 'ar';
  const T = (ar, en) => lang === 'en' ? en : ar;
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const money = n => fmt(n) + ' ₪';
  const wa = msg => 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(msg);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth < 900;

  /* ---------- i18n ---------- */
  const tEls = $$('[data-en]');
  tEls.forEach(el => el.dataset.ar = el.innerHTML);
  const phEls = $$('[data-ph-en]');
  phEls.forEach(el => el.dataset.phAr = el.getAttribute('placeholder') || '');
  function applyLang() {
    doc.lang = lang; doc.dir = lang === 'ar' ? 'rtl' : 'ltr';
    tEls.forEach(el => el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.ar);
    phEls.forEach(el => el.setAttribute('placeholder', lang === 'en' ? el.dataset.phEn : el.dataset.phAr));
    $$('[data-brand]').forEach(el => el.textContent = S.brand[lang]);
    $$('[data-phone]').forEach(el => el.textContent = S.phoneDisplay);
    document.title = T("Daniel's Phone | موبايلات وإكسسوارات وصيانة في بيت جالا", "Daniel's Phone | Phones, accessories & repair in Beit Jala");
    renderGrid(); renderRepairs(); renderTrade(); renderCart();
    splitAll();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  $('#langBtn').addEventListener('click', () => { lang = lang === 'ar' ? 'en' : 'ar'; LS.set('bm-lang', lang); try { localStorage.setItem('bm-lang', lang); } catch (e) {} applyLang(); });

  /* ---------- theme ---------- */
  $('#themeBtn').addEventListener('click', () => {
    const t = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    doc.dataset.theme = t; try { localStorage.setItem('bm-theme', t); } catch (e) {}
    $('meta[name=theme-color]').setAttribute('content', t === 'dark' ? '#08090B' : '#F4F3EF');
  });

  /* ---------- header ---------- */
  const hd = $('#hd'); let lastY = 0;
  function onScrollHeader(y) {
    hd.classList.toggle('solid', y > 40);
    hd.classList.toggle('hide', y > lastY && y > 400 && !doc.classList.contains('nav-open'));
    lastY = y;
  }
  $('#burger').addEventListener('click', () => doc.classList.toggle('nav-open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => doc.classList.remove('nav-open')));

  /* ---------- split text ---------- */
  function splitAll() {
    $$('.split').forEach(el => {
      const txt = el.textContent.trim();
      el.innerHTML = txt.split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
      if (window.gsap && !reduce) gsap.fromTo($$('.w>span', el), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
  }

  /* ---------- products ---------- */
  const catName = { iphone: 'iPhone', samsung: 'Samsung', android: ['أندرويد', 'Android'], audio: ['سماعات', 'Audio'], wear: ['ساعات', 'Watches'], acc: ['إكسسوارات', 'Accessories'] };
  const cn = c => Array.isArray(catName[c]) ? T(...catName[c]) : catName[c];
  const tagName = { hot: ['الأكثر طلبًا', 'Best seller'], new: ['جديد', 'New'], value: ['أفضل قيمة', 'Best value'] };
  let curCat = 'all';
  function renderGrid() {
    const g = $('#grid');
    g.innerHTML = S.products.map(p => `
      <article class="card${curCat !== 'all' && p.cat !== curCat ? ' hide' : ''}" data-id="${p.id}" data-cat="${p.cat}">
        ${p.tag ? `<span class="badge ${p.tag}">${T(...tagName[p.tag])}</span>` : ''}
        <div class="card-media"><img src="assets/img/p/${p.id}.webp" alt="${p[lang].n}" loading="lazy" width="800" height="800"></div>
        <div class="card-body">
          <h3>${p[lang].n}</h3>
          <p>${p[lang].d}</p>
          <div class="swatches">${(p.colors || []).map(c => `<i style="background:${c[0]}"></i>`).join('')}</div>
          <div class="card-ft">
            <div class="price">${p.old ? `<s>${money(p.old)}</s>` : ''}${p.storage ? `<small>${T('من', 'from')}</small>` : ''}${money(p.price + (p.storage ? Math.min(...p.storage.map(s => s[1])) : 0))}</div>
            <button class="add" data-add="${p.id}" aria-label="add"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
          </div>
        </div>
      </article>`).join('');
    bindCards();
  }
  $$('#filters button').forEach(b => b.addEventListener('click', () => {
    $$('#filters button').forEach(x => x.classList.toggle('on', x === b));
    curCat = b.dataset.cat;
    const cards = $$('.card');
    cards.forEach(c => c.classList.toggle('hide', curCat !== 'all' && c.dataset.cat !== curCat));
    if (window.gsap) gsap.fromTo(cards.filter(c => !c.classList.contains('hide')), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out', stagger: .04 });
    ScrollTrigger && ScrollTrigger.refresh();
  }));
  function bindCards() {
    $$('.card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('[data-add]')) {
          const p = S.products.find(x => x.id === card.dataset.id);
          if (p.storage || p.colors) openQV(p.id); else addToCart(p, null, null, 1, card.querySelector('img'));
          return;
        }
        openQV(card.dataset.id);
      });
      if (matchMedia('(hover:hover)').matches) {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.style.transform = `perspective(900px) rotateY(${(x - .5) * 8}deg) rotateX(${(.5 - y) * 8}deg) translateY(-4px)`;
          card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
        });
        card.addEventListener('mouseleave', () => card.style.transform = '');
      }
    });
    if (window.gsap && !reduce) gsap.utils.toArray('.card').forEach((c, i) => gsap.from(c, { y: 60, opacity: 0, duration: .9, ease: 'power3.out', delay: (i % 4) * .06, scrollTrigger: { trigger: c, start: 'top 92%', once: true } }));
  }

  /* ---------- quick view ---------- */
  const qv = $('#qv'); let qs = {};
  function openQV(id) {
    const p = S.products.find(x => x.id === id); if (!p) return;
    qs = { p, st: p.storage ? (p.storage.find(s => s[1] === 0) || p.storage[0]) : null, co: p.colors ? p.colors[0] : null, q: 1 };
    $('#qvImg').src = `assets/img/p/${p.id}.webp`; $('#qvImg').alt = p[lang].n;
    $('#qvCat').textContent = cn(p.cat); $('#qvName').textContent = p[lang].n; $('#qvDesc').textContent = p[lang].d;
    $('#qvStorageWrap').style.display = p.storage ? '' : 'none';
    $('#qvColorWrap').style.display = p.colors ? '' : 'none';
    $('#qvStorage').innerHTML = (p.storage || []).map((s, i) => `<button class="chip${s === qs.st ? ' on' : ''}" data-i="${i}">${s[0]}</button>`).join('');
    $('#qvColors').innerHTML = (p.colors || []).map((c, i) => `<button class="sw${i === 0 ? ' on' : ''}" data-i="${i}" style="background:${c[0]}" aria-label="${c[2]}"></button>`).join('');
    $$('#qvStorage .chip').forEach(b => b.onclick = () => { qs.st = p.storage[b.dataset.i]; $$('#qvStorage .chip').forEach(x => x.classList.toggle('on', x === b)); qvPrice(); });
    $$('#qvColors .sw').forEach(b => b.onclick = () => { qs.co = p.colors[b.dataset.i]; $$('#qvColors .sw').forEach(x => x.classList.toggle('on', x === b)); qvPrice(); });
    qvPrice();
    qv.classList.add('open'); qv.setAttribute('aria-hidden', 'false'); lenis && lenis.stop();
  }
  function qvPrice() {
    const add = qs.st ? qs.st[1] : 0;
    $('#qvPrice').textContent = money((qs.p.price + add) * qs.q);
    $('#qvOld').textContent = qs.p.old ? money((qs.p.old + add) * qs.q) : '';
    $('#qvQty').textContent = qs.q;
    $('#qvColorName').textContent = qs.co ? '· ' + (lang === 'en' ? qs.co[2] : qs.co[1]) : '';
  }
  $$('#qv [data-q]').forEach(b => b.addEventListener('click', () => { qs.q = Math.max(1, Math.min(9, qs.q + +b.dataset.q)); qvPrice(); }));
  function closeQV() { qv.classList.remove('open'); qv.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
  $$('#qv [data-close]').forEach(b => b.addEventListener('click', closeQV));
  $('#qvAdd').addEventListener('click', () => { addToCart(qs.p, qs.st, qs.co, qs.q, $('#qvImg')); closeQV(); });
  $$('[data-quick]').forEach(b => b.addEventListener('click', () => openQV(b.dataset.quick)));

  /* ---------- cart ---------- */
  let cart = LS.get('bm-cart', []);
  const cartEl = $('#cart');
  function key(i) { return [i.id, i.st || '', i.co || ''].join('|'); }
  function addToCart(p, st, co, q, imgEl) {
    const item = { id: p.id, st: st ? st[0] : null, co: co ? co[2] : null, coAr: co ? co[1] : null, unit: p.price + (st ? st[1] : 0), q };
    const ex = cart.find(i => key(i) === key(item));
    if (ex) ex.q += q; else cart.push(item);
    LS.set('bm-cart', cart); renderCart();
    flyTo(imgEl);
    toast(T('انضاف للسلة ✓', 'Added to cart ✓'));
  }
  function flyTo(imgEl) {
    const btn = $('#cartBtn'); btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
    if (!imgEl || !window.gsap || reduce) return;
    const r = imgEl.getBoundingClientRect(), t = btn.getBoundingClientRect();
    const f = document.createElement('img'); f.src = imgEl.src; f.className = 'fly'; document.body.appendChild(f);
    gsap.set(f, { left: r.left + r.width / 2 - 35, top: r.top + r.height / 2 - 35 });
    gsap.to(f, { left: t.left + t.width / 2 - 35, top: t.top + t.height / 2 - 35, scale: .2, rotation: 25, duration: .85, ease: 'power3.in', onComplete: () => f.remove() });
  }
  function renderCart() {
    const n = cart.reduce((a, i) => a + i.q, 0), total = cart.reduce((a, i) => a + i.q * i.unit, 0);
    $('#cartCount').textContent = n; $('#cartCount').classList.toggle('on', n > 0);
    cartEl.classList.toggle('empty', !cart.length);
    $('#cartTotal').textContent = money(total);
    $('#cartItems').innerHTML = cart.map((i, k) => {
      const p = S.products.find(x => x.id === i.id); if (!p) return '';
      const meta = [i.st, lang === 'en' ? i.co : i.coAr].filter(Boolean).join(' · ');
      return `<div class="ci"><img src="assets/img/p/${p.id}.webp" alt=""><div><h4>${p[lang].n}</h4>${meta ? `<small>${meta}</small>` : ''}<div class="qty"><button data-k="${k}" data-d="-1">−</button><span>${i.q}</span><button data-k="${k}" data-d="1">+</button></div></div><div class="ci-p">${money(i.unit * i.q)}<a class="ci-rm" data-rm="${k}" href="#">${T('حذف', 'Remove')}</a></div></div>`;
    }).join('');
    $$('#cartItems [data-d]').forEach(b => b.onclick = () => { const it = cart[b.dataset.k]; it.q += +b.dataset.d; if (it.q < 1) cart.splice(b.dataset.k, 1); LS.set('bm-cart', cart); renderCart(); });
    $$('#cartItems [data-rm]').forEach(b => b.onclick = e => { e.preventDefault(); cart.splice(b.dataset.rm, 1); LS.set('bm-cart', cart); renderCart(); });
  }
  function openCart() { cartEl.classList.add('open'); cartEl.setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); }
  function closeCart() { cartEl.classList.remove('open'); cartEl.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
  $('#cartBtn').addEventListener('click', openCart);
  $$('[data-cclose]').forEach(b => b.addEventListener('click', closeCart));
  let deliv = 'delivery';
  $$('#deliv button').forEach(b => b.addEventListener('click', () => { deliv = b.dataset.v; $$('#deliv button').forEach(x => x.classList.toggle('on', x === b)); $('#cartArea').style.display = deliv === 'delivery' ? '' : 'none'; }));
  $('#cartForm').addEventListener('submit', e => {
    e.preventDefault(); if (!cart.length) return;
    const f = new FormData(e.target);
    const lines = cart.map(i => { const p = S.products.find(x => x.id === i.id); return `• ${p.en.n}${i.st ? ' · ' + i.st : ''}${i.co ? ' · ' + (lang === 'en' ? i.co : i.coAr) : ''} × ${i.q} = ${money(i.unit * i.q)}`; });
    const total = cart.reduce((a, i) => a + i.q * i.unit, 0);
    const msg = [T("مرحبا Daniel's Phone، بدي أطلب:", "Hi Daniel's Phone, I'd like to order:"), ...lines, '', T('المجموع: ', 'Total: ') + money(total),
      T('الاستلام: ', 'Fulfilment: ') + (deliv === 'delivery' ? T('توصيل', 'Delivery') + (f.get('area') ? ' – ' + f.get('area') : '') : T('استلام من المحل', 'Store pickup')),
      T('الدفع: ', 'Payment: ') + e.target.pay.selectedOptions[0].textContent, T('الاسم: ', 'Name: ') + f.get('name')].join('\n');
    window.open(wa(msg), '_blank');
  });
  $$('.wa-direct').forEach(a => { a.addEventListener('click', e => { e.preventDefault(); const m = a.dataset.msg; window.open(wa(m ? T('مرحبا، بدي أستفسر عن ', 'Hi, I want to ask about ') + m : T("مرحبا Daniel's Phone 👋", "Hi Daniel's Phone 👋")), '_blank'); }); a.setAttribute('href', '#'); });

  /* ---------- repairs ---------- */
  function renderRepairs() {
    $('#rpList').innerHTML = S.repairs.map(r => `<li>${T(r.ar, r.en)}<span>${T('من', 'from')}<b>${fmt(r.from)} ₪</b></span></li>`).join('');
    $('#rpIssue').innerHTML = S.repairs.map(r => `<option>${T(r.ar, r.en)}</option>`).join('') + `<option>${T('مشكلة ثانية', 'Something else')}</option>`;
  }
  $('#rpForm').addEventListener('submit', e => {
    e.preventDefault(); const f = new FormData(e.target);
    window.open(wa([T('مرحبا، بدي أحجز صيانة:', 'Hi, I want to book a repair:'), T('الجهاز: ', 'Device: ') + f.get('dev'), T('المشكلة: ', 'Issue: ') + f.get('issue'), T('الموعد: ', 'When: ') + e.target.when.selectedOptions[0].textContent, T('الاسم: ', 'Name: ') + f.get('name')].join('\n')), '_blank');
  });

  /* ---------- trade-in ---------- */
  let trF = 1, trShown = 0;
  function renderTrade() {
    const sel = $('#trModel'), cur = sel.value;
    sel.innerHTML = S.tradein.map((m, i) => `<option value="${i}">${m[0]}</option>`).join('');
    if (cur) sel.value = cur;
    calcTrade();
  }
  function calcTrade() {
    const m = S.tradein[$('#trModel').value || 0], v = Math.round(m[1] * trF / 10) * 10;
    const o = { n: trShown };
    if (window.gsap) gsap.to(o, { n: v, duration: .8, ease: 'power3.out', onUpdate: () => $('#trVal').textContent = fmt(o.n) }); else $('#trVal').textContent = fmt(v);
    trShown = v;
    const cond = $('#trCond button.on').textContent;
    $('#trBtn').onclick = e => { e.preventDefault(); window.open(wa(T(`مرحبا، بدي أبدّل ${m[0]} (الحالة: ${cond}). التقدير على الموقع ${fmt(v)} ₪`, `Hi, I'd like to trade in my ${m[0]} (condition: ${cond}). Website estimate ${fmt(v)} ₪`)), '_blank'); };
  }
  $('#trModel').addEventListener('change', calcTrade);
  $$('#trCond button').forEach(b => b.addEventListener('click', () => { trF = +b.dataset.f; $$('#trCond button').forEach(x => x.classList.toggle('on', x === b)); calcTrade(); }));

  /* ---------- toast ---------- */
  let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); }

  /* ---------- hero frames ---------- */
  const N = 97, frames = new Array(N), cv = $('#heroCanvas'), ctx = cv.getContext('2d');
  let curFrame = 0, loaded = 0;
  const src = i => `assets/img/seq/f${String(i + 1).padStart(3, '0')}.webp`;
  function sizeCanvas() { const dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; draw(curFrame); }
  function draw(i) {
    let img = frames[i];
    if (!img || !img.complete || !img.naturalWidth) { for (let k = i; k >= 0; k--) if (frames[k] && frames[k].naturalWidth) { img = frames[k]; break; } }
    if (!img || !img.naturalWidth) return;
    const cw = cv.width, ch = cv.height, ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let w, h, y;
    if (cr < 1) { w = cw * 1.75; h = w / ir; y = ch * .36 - h / 2; }
    else { if (cr > ir) { w = cw; h = cw / ir; } else { h = ch; w = ch * ir; } y = (ch - h) / 2; }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, y, w, h);
  }
  function loadFrames(onFirst) {
    const first = 24; let firstDone = 0;
    for (let i = 0; i < N; i++) {
      const im = new Image(); im.decoding = 'async';
      im.onload = im.onerror = () => { loaded++; if (i < first) { firstDone++; setLoader(firstDone / first); if (firstDone === first) onFirst(); } if (i === curFrame) draw(curFrame); };
      im.src = src(i); frames[i] = im;
    }
  }

  /* ---------- loader ---------- */
  let ldShown = 0;
  function setLoader(p) { const v = Math.round(p * 100); if (v > ldShown) { ldShown = v; $('#ldn').textContent = v; } }
  function hideLoader() { $('#loader').classList.add('done'); introAnim(); }

  /* ---------- lenis + scroll ---------- */
  let lenis = null;
  function initScroll() {
    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true });
      lenis.on('scroll', e => { ScrollTrigger.update(); onScrollHeader(e.scroll); });
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'); if (h.length > 1 && $(h)) { e.preventDefault(); lenis.scrollTo(h, { offset: h === '#top' ? 0 : -10, duration: 1.4 }); } }));
    } else addEventListener('scroll', () => onScrollHeader(scrollY), { passive: true });
  }

  function introAnim() {
    if (!window.gsap || reduce) return;
    gsap.from('.s1 > *', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .09, delay: .1 });
    gsap.from('.hd', { y: -30, opacity: 0, duration: 1, ease: 'expo.out', delay: .2 });
  }

  function initGsap() {
    gsap.registerPlugin(ScrollTrigger);
    // hero
    const tags = $$('.hero-tags li');
    const tl = gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: .6,
      onUpdate: st => { const f = Math.min(N - 1, Math.round(Math.min(1, st.progress / .82) * (N - 1))); if (f !== curFrame) { curFrame = f; draw(f); } $('#heroBar').style.transform = `scaleX(${st.progress})`; } } });
    tl.to('.s1', { opacity: 0, y: -60, duration: .12 }, 0.04)
      .to('.s2', { autoAlpha: 1, y: 0, duration: .1 }, .26).fromTo('.s2', { y: 40 }, { y: 0, duration: .1 }, .26)
      .to('.s2', { autoAlpha: 0, y: -40, duration: .08 }, .5)
      .fromTo(tags, { opacity: 0, x: () => lang === 'ar' ? -30 : 30 }, { opacity: 1, x: 0, stagger: .03, duration: .08 }, .6)
      .to('.s3', { autoAlpha: 1, duration: .1 }, .84).fromTo('.s3', { y: 50 }, { y: 0, duration: .1 }, .84)
      .to({}, { duration: .06 });
    ScrollTrigger.create({ trigger: '.s3', start: 'top bottom', endTrigger: '#hero', end: 'bottom bottom', onEnter: () => countUp($$('.hero-stats [data-count]')) });
    let countedHero = false;
    function countUp(els) { if (countedHero) return; countedHero = true; els.forEach(el => { const t = +el.dataset.count, o = { n: 0 }; gsap.to(o, { n: t, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = t % 1 ? o.n.toFixed(1) : Math.round(o.n) }); }); }
    // hero s3 progress-based count trigger
    tl.eventCallback('onUpdate', () => { if (tl.progress() > .86) countUp($$('.hero-stats [data-count]')); });

    // featured
    const vid = $('#ftVideo');
    ScrollTrigger.create({ trigger: '#featured', start: 'top 70%', end: 'bottom top', onToggle: s => s.isActive ? vid.play().catch(() => {}) : vid.pause() });
    gsap.timeline({ scrollTrigger: { trigger: '#featured', start: 'top top', end: 'bottom bottom', scrub: .8 } })
      .fromTo('.ft-media', { scale: .78, rotate: -6, borderRadius: '60px' }, { scale: 1, rotate: 0, borderRadius: '32px', duration: .5 })
      .from('.fc-copy > *', { y: 50, opacity: 0, stagger: .06, duration: .3 }, .05)
      .to('.ft-media', { scale: .94, duration: .3 }, .7);
    let ftCounted = false;
    ScrollTrigger.create({ trigger: '#featured', start: 'top 20%', onEnter: () => { if (ftCounted) return; ftCounted = true; $$('.specs [data-count]').forEach(el => { const t = +el.dataset.count, o = { n: 0 }; gsap.to(o, { n: t, duration: 1.5, ease: 'power3.out', onUpdate: () => el.textContent = t % 1 ? o.n.toFixed(1) : Math.round(o.n) }); }); } });

    // repair list
    gsap.from('.rp-list li', { x: () => lang === 'ar' ? 40 : -40, opacity: 0, stagger: .06, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.rp-list', start: 'top 80%' } });
    gsap.from('.rp-form', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.rp-form', start: 'top 85%' } });
    gsap.fromTo('.rp-bg video', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#repair', scrub: true } });
    gsap.from('.tr-card', { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.tr-card', start: 'top 85%' } });

    // howto
    const steps = $$('.ht-steps li'), bubs = $$('.bub');
    ScrollTrigger.create({ trigger: '#howto', start: 'top top', end: 'bottom bottom', onUpdate: st => {
      const s = Math.min(3, 1 + Math.floor(st.progress * 3.2));
      steps.forEach((li, i) => li.classList.toggle('on', i === s - 1));
      bubs.forEach(b => b.classList.toggle('show', +b.dataset.step <= s));
    } });
    gsap.fromTo('.phone', { y: 80, rotate: () => lang === 'ar' ? 12 : -12 }, { y: -20, rotate: () => lang === 'ar' ? 4 : -4, ease: 'none', scrollTrigger: { trigger: '#howto', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    // visit + reviews
    gsap.utils.toArray('.vs-grid > *, .rv-track blockquote').forEach((el, i) => gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', delay: (i % 3) * .08, scrollTrigger: { trigger: el, start: 'top 90%' } }));
    gsap.utils.toArray('.vs-grid video').forEach(v => ScrollTrigger.create({ trigger: v, start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? v.play().catch(() => {}) : v.pause() }));
    gsap.utils.toArray('.sec-head .lead, .sec-head .eyebrow, .filters').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  }

  /* ---------- boot ---------- */
  $('#yr').textContent = new Date().getFullYear();
  if (window.gsap) gsap.registerPlugin(ScrollTrigger);
  applyLang();
  sizeCanvas(); addEventListener('resize', () => { sizeCanvas(); });
  let booted = false;
  const boot = () => { if (booted) return; booted = true; draw(0); setTimeout(hideLoader, 250); };
  loadFrames(boot);
  setTimeout(boot, 6000);
  if (window.gsap) { initGsap(); initScroll(); } else addEventListener('scroll', () => onScrollHeader(scrollY), { passive: true });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeQV(); closeCart(); } });
})();

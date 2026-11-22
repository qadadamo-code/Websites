/* Ali Elbadry Furniture — v3 page logic */
(() => {
  const AB = window.AB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const mq = matchMedia('(max-width: 820px)');
  const isM = () => mq.matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;
  const wa = msg => `https://wa.me/${AB.config.whatsapp}?text=${encodeURIComponent(msg)}`;

  /* ---------- content ---------- */
  const IMG = { salon: 'salon', antrih: 'salon', bedroom: 'bedroom', dining: 'dining', corner: 'salon', vitrine: 'dining', dresser: 'bedroom', office: 'craft' };
  $('#catsList').innerHTML = AB.categories.map((c, i) => `
    <li><button class="cat" type="button" data-cat="${c.id}" data-img="${IMG[c.id] || 'salon'}" data-r>
      <span class="cat__n">${String(i + 1).padStart(2, '0')}</span>
      <svg viewBox="0 0 80 60" aria-hidden="true">${c.svg}</svg>
      <span class="cat__txt"><span class="cat__name">${c.name}</span><span class="cat__note cat__note--m">${c.note}</span></span>
      <span class="cat__note cat__note--d">${c.note}</span>
      <span class="cat__go" aria-hidden="true">↖</span>
    </button></li>`).join('');
  $('#colsTrack').innerHTML = AB.collections.map((c, i) => `
    <article class="col">
      <div class="col__img"><img src="assets/img/${c.img}.webp" srcset="assets/img/${c.img}-sm.webp 640w, assets/img/${c.img}.webp 1168w" sizes="(max-width:820px) 84vw, 60vw" alt="${c.name}" loading="lazy"><span class="col__tag">${c.kicker}</span></div>
      <div class="col__meta">
        <span class="col__n">0${i + 1}</span>
        <div><h3>${c.name}</h3><p>${c.desc}</p></div>
        <a class="btn btn--dark btn--sm" data-wa="أهلًا علي البدري، عايز أعرف تفاصيل وسعر ${c.name} (${c.kicker})" href="#">اسأل عن السعر</a>
      </div>
    </article>`).join('') + `
    <article class="col col--end"><div class="col__end">
      <img src="assets/img/crest.webp" alt="">
      <div><h3>مش لاقي اللي في دماغك؟ نفصّله لك على مقاسك.</h3><a href="#tailor" class="btn btn--gold">فصّل طقمك</a></div>
    </div></article>`;
  $('.cols__sticky').insertAdjacentHTML('beforeend', `<div class="cols__dots" id="colsDots">${AB.collections.map(() => '<i></i>').join('')}<i></i></div>`);
  if (!isM()) $('#colsDots').style.display = 'none';

  $('#craftList').innerHTML = AB.craft.map(c => `<li><b>${c.n}</b><div><h3>${c.t}</h3><p>${c.d}</p></div></li>`).join('');
  $('#journeyList').innerHTML = AB.timeline.map(t => `<li data-r><b>${t.y}</b><h3>${t.t}</h3><p>${t.d}</p></li>`).join('');

  // statement words
  const stEl = $('#statement');
  stEl.innerHTML = stEl.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', stEl);

  /* ---------- tailor ---------- */
  const st = { cat: null, style: AB.styles[0], finish: AB.finishes[0], fabric: AB.fabrics[0] };
  const lists = { cat: AB.categories, style: AB.styles, finish: AB.finishes, fabric: AB.fabrics };
  const chips = (items, kind) => items.map((it, i) => `<button type="button" class="chip" data-kind="${kind}" data-i="${i}">${it.c ? `<i style="background:${it.c}"></i>` : ''}${typeof it === 'string' ? it : it.name}</button>`).join('');
  $('#tCat').innerHTML = chips(AB.categories, 'cat');
  $('#tStyle').innerHTML = chips(AB.styles, 'style');
  $('#tFinish').innerHTML = chips(AB.finishes, 'finish');
  $('#tFabric').innerHTML = chips(AB.fabrics, 'fabric');
  function setC(id, v) { const el = $(id); if (el.textContent === v) return; el.textContent = v; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 900); }
  function renderTailor() {
    $$('.chip').forEach(c => c.classList.toggle('on', st[c.dataset.kind] === lists[c.dataset.kind][+c.dataset.i]));
    setC('#cCat', st.cat ? st.cat.name : '—'); setC('#cStyle', st.style); setC('#cFinish', st.finish.name); setC('#cFabric', st.fabric.name);
    $('.pv-frame').style.background = st.finish.c; $('.pv-fabric').style.background = st.fabric.c;
  }
  document.addEventListener('click', e => {
    const ch = e.target.closest('.chip');
    if (ch) { st[ch.dataset.kind] = lists[ch.dataset.kind][+ch.dataset.i]; renderTailor(); return; }
    const b = e.target.closest('.cat[data-cat]');
    if (b) { st.cat = AB.categories.find(c => c.id === b.dataset.cat) || null; renderTailor(); goTo('#tailor'); }
  });
  $('#tSend').addEventListener('click', () => {
    const L = ['أهلًا علي البدري، عايز أفصّل طقم:', `• القسم: ${st.cat ? st.cat.name : 'لسه بختار'}`, `• الطراز: ${st.style}`, `• تشطيب الخشب: ${st.finish.name}`, `• لون القماش: ${st.fabric.name}`];
    const n = $('#tName').value.trim(), c = $('#tCity').value.trim(), note = $('#tNote').value.trim();
    if (n) L.push(`• الاسم: ${n}`); if (c) L.push(`• المنطقة: ${c}`); if (note) L.push(`• ملاحظات: ${note}`);
    open(wa(L.join('\n')), '_blank', 'noopener');
  });
  renderTailor();

  /* ---------- links ---------- */
  $$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
  $('#callBtn').href = $('#mCall').href = 'tel:' + AB.config.phone;
  $('#fbBtn').href = AB.config.facebook;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- nav + smooth scroll ---------- */
  const nav = $('#nav');
  let lenis = null;
  function setupLenis() {
    const want = !isM() && !reduced && window.Lenis && matchMedia('(pointer:fine)').matches;
    if (want && !lenis) { lenis = new Lenis({ lerp: 0.1 }); lenis.on('scroll', onScroll); }
    if (!want && lenis) { lenis.destroy(); lenis = null; }
  }
  (function raf(t) { if (lenis) lenis.raf(t); requestAnimationFrame(raf); })(0);
  function closeMenu() { nav.classList.remove('open'); document.body.style.overflow = ''; $('#burger').setAttribute('aria-expanded', 'false'); }
  $('#burger').addEventListener('click', () => {
    const o = nav.classList.toggle('open');
    $('#burger').setAttribute('aria-expanded', String(o));
    document.body.style.overflow = o ? 'hidden' : '';
  });
  function goTo(sel) {
    const el = $(sel); if (!el) return;
    closeMenu();
    const off = -(isM() ? 60 : 66) + 1;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4 });
    else scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: reduced ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-wa')) return;
    const h = a.getAttribute('href'); if (h.length < 2) return;
    e.preventDefault(); goTo(h);
  });

  /* ---------- hero: shield opens into the room ---------- */
  const hero = $('#hero'), media = $('#heroMedia'), copy = $('#heroCopy'), shield = $('#shieldPath');
  const SH = [0, .08, .25, 0, .5, .06, .75, 0, 1, .08, 1, .62, 1, .86, .5, 1, 0, .86, 0, .62];
  const RE = [0, 0, .25, 0, .5, 0, .75, 0, 1, 0, 1, 1, 1, 1, .5, 1, 0, 1, 0, 1];
  function shieldD(t) {
    const v = SH.map((a, i) => (a + (RE[i] - a) * t).toFixed(4));
    return `M${v[0]},${v[1]} Q${v[2]},${v[3]} ${v[4]},${v[5]} Q${v[6]},${v[7]} ${v[8]},${v[9]} L${v[10]},${v[11]} Q${v[12]},${v[13]} ${v[14]},${v[15]} Q${v[16]},${v[17]} ${v[18]},${v[19]} Z`;
  }
  let VW = innerWidth, VH = innerHeight, start = null;
  function measureHero() {
    VW = document.documentElement.clientWidth; VH = innerHeight;
    if (!isM()) {
      const pad = Math.max(20, (VW - 1240) / 2);
      const w = Math.min(VW * 0.36, 520), h = Math.min(w * 1.2, VH - 190);
      start = { x: pad + 10, y: (VH - h) / 2 + 30, w: Math.min(w, h / 1.2 * 1.0 + w * 0), h };
      start.w = Math.min(w, h / 1.12);
    } else {
      const top = copy.getBoundingClientRect().height + 64 + 18 + 34;
      const h = Math.max(220, VH - top - 34);
      const w = Math.min(VW - 76, h * 0.86);
      start = { x: (VW - w) / 2, y: top, w, h };
    }
  }
  let lastE = -1;
  function heroFrame(t) {
    if (!start) measureHero();
    const e = easeIO(clamp(t / 0.78));
    if (Math.abs(e - lastE) < 0.0004) return; lastE = e;
    media.style.left = lerp(start.x, 0, e) + 'px';
    media.style.top = lerp(start.y, 0, e) + 'px';
    media.style.width = lerp(start.w, VW, e) + 'px';
    media.style.height = lerp(start.h, VH, e) + 'px';
    shield.setAttribute('d', shieldD(e));
    media.style.setProperty('--s', (1.14 - 0.14 * e).toFixed(4));
    media.style.setProperty('--ol', clamp(1 - e * 3).toFixed(3));
    media.style.setProperty('--ov', clamp((e - 0.5) / 0.5).toFixed(3));
    media.style.setProperty('--cap', clamp((e - 0.82) / 0.18).toFixed(3));
    hero.style.setProperty('--cue', clamp(1 - t * 8).toFixed(3));
    copy.style.opacity = clamp(1 - e * 2.2).toFixed(3);
    copy.style.transform = isM() ? `translateY(${-e * 40}px)` : `translateY(calc(-44% - ${e * 50}px))`;
    nav.classList.toggle('on-dark', e > 0.92 && t < 1);
  }

  /* ---------- collections ---------- */
  const colsSec = $('#collections'), track = $('#colsTrack');
  let colsDist = 0;
  function layoutCols() {
    if (isM()) { colsSec.style.height = ''; track.style.transform = ''; $('#colsDots').style.display = ''; return; }
    $('#colsDots').style.display = 'none';
    colsDist = Math.max(0, track.scrollWidth - VW + Math.max(20, (VW - 1240) / 2));
    colsSec.style.height = (VH + colsDist) + 'px';
  }
  track.addEventListener('scroll', () => {
    if (!isM()) return;
    const cards = $$('.col', track), mid = VW / 2;
    let best = 0, bd = 1e9;
    cards.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
    $$('#colsDots i').forEach((d, i) => d.classList.toggle('on', i === best));
  }, { passive: true });
  $$('#colsDots i')[0].classList.add('on');

  /* ---------- category preview (desktop) ---------- */
  const prev = $('#catsPreview'), prevImg = $('#catsPreviewImg');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let px = 0, py = 0, cx = 0, cy = 0, on = false;
    $('#catsList').addEventListener('pointerover', e => {
      const b = e.target.closest('.cat'); if (!b) return;
      const src = `assets/img/${b.dataset.img}-sm.webp`;
      if (!prevImg.src.endsWith(src)) prevImg.src = src;
      on = true; prev.classList.add('on');
    });
    $('#catsList').addEventListener('pointerleave', () => { on = false; prev.classList.remove('on'); });
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; });
    (function loop() { cx += (px - cx) * 0.14; cy += (py - cy) * 0.14; if (on) prev.style.transform = `translate3d(${cx - 130}px,${cy - 160}px,0) rotate(${(px - cx) * 0.04}deg)`; requestAnimationFrame(loop); })();
  }

  /* ---------- scroll ---------- */
  const craftItems = $$('#craftList li'), craftImg = $('#craftImg'), craftNum = $('#craftNum');
  const mbar = $('#mbar');
  let lastCraft = -1;
  function onScroll() {
    const y = lenis ? lenis.scroll : scrollY;
    nav.classList.toggle('scrolled', y > 30 && !(nav.classList.contains('on-dark')));

    // hero
    const hr = hero.getBoundingClientRect();
    const t = clamp(-hr.top / (hero.offsetHeight - VH));
    if (hr.bottom > 0) heroFrame(t);
    mbar.classList.toggle('show', t > 0.5);

    // statement words
    const sr = stEl.getBoundingClientRect();
    const sp = clamp((VH * 0.85 - sr.top) / (sr.height + VH * 0.35));
    const lit = Math.round(sp * words.length * 1.05);
    words.forEach((w, i) => w.classList.toggle('lit', i < lit));

    // collections
    if (!isM()) {
      const cr = colsSec.getBoundingClientRect();
      const p = colsDist ? clamp(-cr.top / colsDist) : 0;
      track.style.transform = `translate3d(${p * colsDist}px,0,0)`;
      $('#colsBar').style.setProperty('--cb', p.toFixed(3));
      const n = AB.collections.length;
      $('#colsCount').textContent = `0${Math.min(n, 1 + Math.floor(p * n * 0.999))} / 0${n}`;
      $$('.col__img img', track).forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        img.style.setProperty('--px', ((r.left + r.width / 2 - VW / 2) / VW * -40).toFixed(1) + 'px');
      });
    }

    // craft steps
    let best = 0, bd = 1e9;
    craftItems.forEach((li, i) => { const r = li.getBoundingClientRect(); const d = Math.abs(r.top + 40 - VH * 0.55); if (d < bd) { bd = d; best = i; } });
    if (best !== lastCraft) {
      lastCraft = best;
      craftItems.forEach((li, i) => li.classList.toggle('on', i === best));
      craftNum.textContent = AB.craft[best].n;
      craftImg.style.setProperty('--z', [1.06, 1.14, 1.24, 1.12, 1.02][best]);
    }
  }
  let ticking = false;
  addEventListener('scroll', () => { if (lenis) return; if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });

  /* ---------- reveal + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
  }), { threshold: 0.15 });
  $$('[data-r]').forEach(el => io.observe(el));
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, from = +(el.dataset.from || 0), t0 = performance.now();
    const f = now => { const k = clamp((now - t0) / 1800); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))) + (el.dataset.suffix || ''); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- resize ---------- */
  let lastW = innerWidth, lastH = innerHeight;
  function onResize(force) {
    const w = innerWidth, h = innerHeight;
    // ignore small height-only changes (phone address bar)
    if (!force && w === lastW && Math.abs(h - lastH) < 120) return;
    lastW = w; lastH = h;
    setupLenis(); measureHero(); lastE = -1; layoutCols(); onScroll();
  }
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => onResize(false), 100); });
  mq.addEventListener ? mq.addEventListener('change', () => onResize(true)) : mq.addListener(() => onResize(true));

  /* ---------- start ---------- */
  function start0() { setupLenis(); measureHero(); layoutCols(); lastE = -1; onScroll(); }
  start0();
  if (document.fonts) document.fonts.ready.then(() => { measureHero(); lastE = -1; layoutCols(); onScroll(); });
  const loaded = new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }));
  Promise.race([Promise.all([loaded, new Promise(r => setTimeout(r, 1200))]), new Promise(r => setTimeout(r, 4500))]).then(() => {
    $('#loader').classList.add('done'); html.classList.add('ready');
    measureHero(); lastE = -1; layoutCols(); onScroll();
  });
})();

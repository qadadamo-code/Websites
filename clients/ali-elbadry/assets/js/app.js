/* Ali Elbadry Furniture — page logic */
(() => {
  const AB = window.AB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mq = matchMedia('(max-width: 820px)');
  const isM = () => mq.matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wa = msg => `https://wa.me/${AB.config.whatsapp}?text=${encodeURIComponent(msg)}`;
  const html = document.documentElement;

  /* ---------- links ---------- */
  function bindWa(root = document) {
    $$('[data-wa]', root).forEach(a => { a.href = wa(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
  }
  $('#callBtn').href = 'tel:' + AB.config.phone;
  $('#fbBtn').href = AB.config.facebook;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- build: categories ---------- */
  $('#catsGrid').innerHTML = AB.categories.map((c, i) => `
    <button class="cat" type="button" data-cat="${c.id}">
      <svg viewBox="0 0 80 60" aria-hidden="true">${c.svg}</svg>
      <span class="cat__go" aria-hidden="true">↖</span>
      <h3>${c.name}</h3><p>${c.note}</p>
      <span class="cat__n">${String(i + 1).padStart(2, '0')}</span>
    </button>`).join('');

  /* ---------- build: timeline ---------- */
  $('#timelineTrack').insertAdjacentHTML('beforeend', AB.timeline.map((t, i) => `
    <article class="tl"><span class="tl__y">${t.y}</span>
      <div class="tl__card"><span class="num">${String(i + 1).padStart(2, '0')} / 0${AB.timeline.length}</span><h3>${t.t}</h3><p>${t.d}</p></div>
    </article>`).join(''));

  /* ---------- build: collections ---------- */
  $('#colsList').innerHTML = AB.collections.map((c, i) => `
    <article class="col" data-col="${c.id}">
      <div class="col__sticky"><div class="col__inner">
        <div class="col__scene">
          <img src="assets/img/${c.img}.webp" srcset="assets/img/${c.img}-sm.webp 640w, assets/img/${c.img}.webp 1168w" sizes="(max-width:820px) 100vw, 60vw" alt="${c.name} — ${c.kicker}" loading="lazy">
          <div class="door door--l"><span class="knob"></span><img src="assets/img/crest-dark.webp" alt=""></div>
          <div class="door door--r"><span class="knob"></span><img src="assets/img/crest-dark.webp" alt=""></div>
          ${c.spots.map(s => `<button type="button" class="spot ${s.x > 68 ? 'tip-left' : s.x < 32 ? 'tip-right' : ''} ${s.y < 28 ? 'tip-down' : ''}" style="left:${s.x}%;top:${s.y}%" aria-label="${s.t}"><span class="spot__tip"><b>${s.t}</b>${s.d}</span></button>`).join('')}
        </div>
        <div class="col__copy">
          <span class="num">0${i + 1} / 0${AB.collections.length}</span>
          <span class="kicker">${c.kicker}</span>
          <h3>${c.name}</h3>
          <p>${c.desc}</p>
          <div class="col__btns">
            <a class="btn btn--ink" data-wa="أهلًا علي البدري، عايز أعرف تفاصيل وسعر ${c.name} (${c.kicker})" href="#">اسأل عن السعر</a>
            <button class="btn btn--line" type="button" data-cat="${c.cat}">فصّل زيها</button>
          </div>
        </div>
      </div></div>
    </article>`).join('');

  /* ---------- build: craft ---------- */
  $('#craftList').innerHTML = AB.craft.map((c, i) => `<li data-i="${i}"><b>${c.n}</b><div><h3>${c.t}</h3><p>${c.d}</p></div></li>`).join('');

  /* ---------- configurator ---------- */
  const st = { cat: null, style: AB.styles[0], finish: AB.finishes[0], fabric: AB.fabrics[0] };
  const chipHTML = (items, kind) => items.map((it, i) => {
    const name = typeof it === 'string' ? it : it.name;
    const sw = it.c ? `<i style="background:${it.c}"></i>` : '';
    return `<button type="button" class="chip" data-kind="${kind}" data-i="${i}">${sw}${name}</button>`;
  }).join('');
  $('#tCat').innerHTML = chipHTML(AB.categories, 'cat');
  $('#tStyle').innerHTML = chipHTML(AB.styles, 'style');
  $('#tFinish').innerHTML = chipHTML(AB.finishes, 'finish');
  $('#tFabric').innerHTML = chipHTML(AB.fabrics, 'fabric');
  const lists = { cat: AB.categories, style: AB.styles, finish: AB.finishes, fabric: AB.fabrics };

  function setCert(id, val) {
    const el = $(id); if (el.textContent === val) return;
    el.textContent = val; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 900);
  }
  function renderTailor() {
    $$('.chip').forEach(ch => {
      const v = lists[ch.dataset.kind][+ch.dataset.i];
      ch.classList.toggle('on', st[ch.dataset.kind] === v);
    });
    setCert('#cCat', st.cat ? st.cat.name : '—');
    setCert('#cStyle', st.style);
    setCert('#cFinish', st.finish.name);
    setCert('#cFabric', st.fabric.name);
    setCert('#cName', $('#tName').value.trim() || '—');
    $('.pv-frame').style.background = st.finish.c;
    $('.pv-fabric').style.background = st.fabric.c;
  }
  document.addEventListener('click', e => {
    const ch = e.target.closest('.chip');
    if (ch) {
      const k = ch.dataset.kind; st[k] = lists[k][+ch.dataset.i]; renderTailor();
      if (k === 'fabric') { AB.chairSet && AB.chairSet('fabric', st.fabric.c); syncSw(); }
      if (k === 'finish') { AB.chairSet && AB.chairSet('frame', st.finish.id); syncSw(); }
    }
  });
  $('#tName').addEventListener('input', renderTailor);
  $('#tSend').addEventListener('click', () => {
    const lines = [
      'أهلًا علي البدري، عايز أفصّل طقم:',
      `• القسم: ${st.cat ? st.cat.name : 'لسه بختار'}`,
      `• الطراز: ${st.style}`,
      `• تشطيب الخشب: ${st.finish.name}`,
      `• لون القماش: ${st.fabric.name}`
    ];
    const n = $('#tName').value.trim(), c = $('#tCity').value.trim(), note = $('#tNote').value.trim();
    if (n) lines.push(`• الاسم: ${n}`);
    if (c) lines.push(`• المنطقة: ${c}`);
    if (note) lines.push(`• ملاحظات: ${note}`);
    open(wa(lines.join('\n')), '_blank', 'noopener');
  });

  // category buttons → preselect & go to tailor
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]:not(.chip)');
    if (!b) return;
    st.cat = AB.categories.find(c => c.id === b.dataset.cat) || null;
    renderTailor();
    goTo('#tailor');
  });

  /* ---------- hero swatches ---------- */
  const swRow = k => $(`.swatches__row[data-kind="${k}"]`);
  swRow('fabric').innerHTML = AB.fabrics.map((f, i) => `<button type="button" class="sw" data-i="${i}" title="${f.name}" aria-label="قماش ${f.name}" style="background:${f.c}"></button>`).join('');
  swRow('frame').innerHTML = AB.finishes.map((f, i) => `<button type="button" class="sw" data-i="${i}" title="${f.name}" aria-label="خشب ${f.name}" style="background:${f.c}"></button>`).join('');
  function syncSw() {
    $$('.sw', swRow('fabric')).forEach(b => b.classList.toggle('on', AB.fabrics[+b.dataset.i] === st.fabric));
    $$('.sw', swRow('frame')).forEach(b => b.classList.toggle('on', AB.finishes[+b.dataset.i] === st.finish));
  }
  $('#swatches').addEventListener('click', e => {
    const b = e.target.closest('.sw'); if (!b) return;
    const kind = b.parentElement.dataset.kind;
    if (kind === 'fabric') { st.fabric = AB.fabrics[+b.dataset.i]; AB.chairSet && AB.chairSet('fabric', st.fabric.c); }
    else { st.finish = AB.finishes[+b.dataset.i]; AB.chairSet && AB.chairSet('frame', st.finish.id); }
    syncSw(); renderTailor();
  });
  syncSw(); renderTailor();
  bindWa();

  /* ---------- nav ---------- */
  const nav = $('#nav');
  $('#burger').addEventListener('click', () => {
    const o = nav.classList.toggle('open');
    $('#burger').setAttribute('aria-expanded', o);
    document.body.style.overflow = o ? 'hidden' : '';
    if (lenis) o ? lenis.stop() : lenis.start();
  });
  function closeMenu() { nav.classList.remove('open'); document.body.style.overflow = ''; $('#burger').setAttribute('aria-expanded', false); if (lenis) lenis.start(); }

  /* ---------- smooth scroll (desktop only) ---------- */
  let lenis = null;
  function setupLenis() {
    const want = !isM() && !reduced && window.Lenis && matchMedia('(pointer:fine)').matches;
    if (want && !lenis) { lenis = new Lenis({ lerp: 0.1, smoothWheel: true }); lenis.on('scroll', onScroll); }
    if (!want && lenis) { lenis.destroy(); lenis = null; }
  }
  function lenisRaf(t) { if (lenis) lenis.raf(t); requestAnimationFrame(lenisRaf); }
  requestAnimationFrame(lenisRaf);

  function goTo(sel) {
    const el = $(sel); if (!el) return;
    closeMenu();
    const off = -parseInt(getComputedStyle(html).getPropertyValue('--nav-h') || 70) + 4;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4 });
    else scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: reduced ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-wa')) return;
    const h = a.getAttribute('href'); if (h.length < 2) return;
    e.preventDefault(); goTo(h);
  });

  /* ---------- hero progress ---------- */
  const hero = $('#hero'), steps = $$('#heroSteps li'), ring = $('#heroRing'), pct = $('#heroPct');
  const STEP_AT = [0, 0.12, 0.34, 0.56, 0.8];
  AB.heroTarget = 0;
  let auto = null; // phone: time-based build
  function playAuto() {
    const t0 = performance.now(), dur = 5200;
    cancelAnimationFrame(auto && auto.id);
    auto = { id: 0 };
    const step = now => {
      const t = clamp((now - t0) / dur);
      AB.heroTarget = t < 1 ? t * t * (3 - 2 * t) : 1;
      heroUI(AB.heroTarget);
      if (t < 1 && isM()) auto.id = requestAnimationFrame(step); else auto = null;
    };
    auto.id = requestAnimationFrame(step);
  }
  $('#replay').addEventListener('click', playAuto);
  function heroUI(p) {
    let k = 0; STEP_AT.forEach((s, i) => { if (p >= s) k = i; });
    steps.forEach((li, i) => { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
    ring.style.strokeDashoffset = 289 * (1 - p);
    pct.textContent = Math.round(p * 100) + '%';
    $('#swatches').classList.toggle('show', p > 0.62 || isM());
    $('.scroll-hint').style.opacity = p > 0.03 ? 0 : 1;
  }

  /* ---------- timeline ---------- */
  const tlSec = $('#timeline'), tlTrack = $('#timelineTrack'), tlFill = $('#timelineFill'), tlCards = () => $$('.tl');
  let tlDist = 0;
  function layoutTimeline() {
    if (isM()) { tlSec.style.height = ''; tlTrack.style.transform = ''; return; }
    tlDist = Math.max(0, tlTrack.scrollWidth - innerWidth);
    tlSec.style.height = (innerHeight + tlDist) + 'px';
  }

  /* ---------- per-frame scroll scenes ---------- */
  const cols = () => $$('.col');
  const craftItems = () => $$('#craftList li');
  const craftImg = $('#craftImg');
  const craftLook = [[1.05, 0, 1], [1.14, 0.15, 1], [1.24, 0.05, 1.1], [1.12, 0, 1.25], [1.02, 0, 1]];
  let lastCraft = -1;
  function onScroll() {
    const vh = innerHeight, y = lenis ? lenis.scroll : scrollY;
    nav.classList.toggle('scrolled', y > 20);

    // hero
    if (!isM()) {
      const r = hero.getBoundingClientRect();
      const p = clamp(-r.top / (hero.offsetHeight - vh));
      AB.heroTarget = p; heroUI(p);
    }

    // timeline
    const tr = tlSec.getBoundingClientRect();
    if (!isM()) {
      const p = tlDist ? clamp(-tr.top / tlDist) : 0;
      tlTrack.style.transform = `translate3d(${p * tlDist}px,0,0)`;
      tlFill.style.transform = `scaleX(${p})`;
      const n = AB.timeline.length;
      tlCards().forEach((c, i) => c.classList.toggle('on', i <= Math.round(p * (n - 1) + 0.2)));
    } else {
      const p = clamp((vh * 0.65 - tr.top) / tr.height);
      tlFill.style.transform = '';
      tlFill.style.setProperty('--tl', p);
      tlCards().forEach(c => c.classList.toggle('on', c.getBoundingClientRect().top < vh * 0.65));
    }

    // collections (palace doors)
    cols().forEach(col => {
      let d, p;
      if (!isM()) {
        const r = col.getBoundingClientRect();
        p = clamp(-r.top / (col.offsetHeight - vh));
        d = clamp((p - 0.05) / 0.5);
      } else {
        const r = $('.col__scene', col).getBoundingClientRect();
        p = clamp((vh - r.top) / (vh * 0.95));
        d = clamp((p - 0.28) / 0.45);
      }
      const e = 1 - Math.pow(1 - d, 3);
      const sc = $('.col__scene', col);
      sc.style.setProperty('--d', e.toFixed(4));
      sc.style.setProperty('--p', p.toFixed(4));
      col.classList.toggle('opened', e > 0.85);
    });

    // craft steps
    let best = 0, bd = 1e9;
    craftItems().forEach((li, i) => {
      const r = li.getBoundingClientRect();
      const dd = Math.abs(r.top + Math.min(r.height, 160) / 2 - vh * (isM() ? 0.62 : 0.5));
      if (dd < bd) { bd = dd; best = i; }
    });
    if (best !== lastCraft) {
      lastCraft = best;
      craftItems().forEach((li, i) => li.classList.toggle('on', i === best));
      $('#craftNum').textContent = AB.craft[best].n;
      const [z, s, sat] = craftLook[best];
      craftImg.style.setProperty('--z', z); craftImg.style.setProperty('--s', s); craftImg.style.setProperty('--sat', sat);
    }
  }
  let ticking = false;
  addEventListener('scroll', () => { if (lenis) return; if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });

  /* ---------- reveals + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    $$('[data-count]', e.target).forEach(countUp);
  }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], .cat').forEach(el => io.observe(el));
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, from = +(el.dataset.from || 0), t0 = performance.now(), dur = 1800;
    const f = now => { const t = clamp((now - t0) / dur); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  /* ---------- hotspots (tap on phones) ---------- */
  document.addEventListener('click', e => {
    const s = e.target.closest('.spot');
    $$('.spot.on').forEach(o => { if (o !== s) o.classList.remove('on'); });
    if (s) s.classList.toggle('on');
  });

  /* ---------- cursor (desktop) ---------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
    const cur = $('#cursor'); let x = -100, y = -100, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.classList.add('on'); });
    document.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('a,button,.spot,canvas')));
    const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
    loop();
  }

  /* ---------- responsive switch ---------- */
  let wasM = isM();
  function onResize() {
    const m = isM();
    setupLenis();
    layoutTimeline();
    if (m !== wasM) {
      wasM = m;
      if (m) playAuto(); else if (auto) { cancelAnimationFrame(auto.id); auto = null; }
    }
    onScroll();
    if (isM() && !auto) heroUI(AB.heroTarget);
  }
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(onResize, 120); });
  mq.addEventListener ? mq.addEventListener('change', onResize) : mq.addListener(onResize);

  /* ---------- loader ---------- */
  const bar = $('#loaderBar'); let lp = 12; bar.style.width = lp + '%';
  const tick = setInterval(() => { lp = Math.min(90, lp + Math.random() * 14); bar.style.width = lp + '%'; }, 200);
  const loaded = new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }));
  const ready3d = new Promise(r => AB.ready3d ? r() : addEventListener('ab:ready', r, { once: true }));
  const minShow = new Promise(r => setTimeout(r, 1700));
  Promise.race([Promise.all([loaded, ready3d, minShow]), new Promise(r => setTimeout(r, 5500))]).then(() => {
    clearInterval(tick); bar.style.width = '100%';
    setTimeout(() => {
      $('#loader').classList.add('done'); html.classList.add('ready');
      if (isM()) playAuto();
    }, 300);
  });

  setupLenis();
  layoutTimeline();
  onScroll();
  heroUI(0);
  if (document.fonts) document.fonts.ready.then(() => { layoutTimeline(); onScroll(); });
})();

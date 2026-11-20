/* Zaza Cuisine – interactions */
(() => {
  const D = window.ZAZA, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const store = { get(k){ try{return localStorage.getItem(k)}catch(e){return null} }, set(k,v){ try{localStorage.setItem(k,v)}catch(e){} } };
  const isMobile = matchMedia('(max-width:760px)').matches;
  const weak = isMobile || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let lang = store.get('zaza-lang') || 'ar';
  const T = o => (o && typeof o === 'object') ? o[lang] : o;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- i18n ---------- */
  $$('[data-en]').forEach(el => el.dataset.ar = el.innerHTML);
  $$('[data-ph-en]').forEach(el => el.dataset.phAr = el.placeholder);
  function applyLang(){
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-en]').forEach(el => el.innerHTML = lang === 'ar' ? el.dataset.ar : el.dataset.en);
    $$('[data-ph-en]').forEach(el => el.placeholder = lang === 'ar' ? el.dataset.phAr : el.dataset.phEn);
    document.title = lang === 'ar' ? 'Zaza Cuisine | مطبخ مصري بروح Zaza – منذ 2015' : 'Zaza Cuisine | The Egyptian table, served with passion';
    buildMarquee(); buildTagines(); buildTabs(); renderMenu(); buildBranches();
    $('#waFab').href = waLink(lang === 'ar' ? 'أهلاً Zaza، حابب أستفسر عن الحجز' : 'Hello Zaza, I would like to ask about a reservation');
  }
  $('#langBtn').addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar'; store.set('zaza-lang', lang); applyLang();
    requestAnimationFrame(() => { setupReel(); ScrollTrigger.refresh(); });
  });

  /* ---------- theme ---------- */
  const savedTheme = store.get('zaza-theme'); if (savedTheme) html.dataset.theme = savedTheme;
  $('#themeBtn').addEventListener('click', () => {
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark'; store.set('zaza-theme', html.dataset.theme);
  });

  const waLink = msg => `https://wa.me/${D.config.whatsapp}?text=${encodeURIComponent(msg)}`;

  /* ---------- marquee ---------- */
  let marqueeTw;
  function buildMarquee(){
    const words = lang === 'ar'
      ? ['ملوخية بالتقلية','طواجن النحاس','ميكس جريل على الفحم','حمام محشي','أطول فطيرة في مصر','كنافة على الفحم','فتة بالموزة','فطار مصري']
      : ['Molokhia & tasha','Copper-pot tagines','Charcoal mixed grill','Stuffed pigeon','Longest feteer in Egypt','Konafa on coal','Veal shank fattah','Egyptian breakfast'];
    const chunk = words.map(w => `<span>${w}</span>`).join('');
    const tr = $('#ropeTrack'); tr.innerHTML = chunk + chunk;
    if (marqueeTw) marqueeTw.kill();
    gsap.set(tr, { x: 0 });
    const w = tr.scrollWidth / 2;
    marqueeTw = gsap.to(tr, { x: lang === 'ar' ? w : -w, duration: 38, ease: 'none', repeat: -1 });
  }

  /* ---------- tagines ---------- */
  const tjImgFor = en => /Molokhia/.test(en) ? 'molokhia' : /Pigeon|Quail|Muammar/.test(en) ? 'pigeon' : /Shank|Lesan|Kofta|Waraket|Knuckle/.test(en) ? 'fattah' : 'hero-m';
  let tjIdx = 1;
  function buildTagines(){
    const items = D.menu.find(c => c.id === 'tajin').items;
    const list = $('#tjList'); list.innerHTML = '';
    items.forEach((it, i) => {
      const b = document.createElement('button'); b.type = 'button';
      b.textContent = lang === 'ar' ? it[1] : it[0];
      if (i === tjIdx) b.classList.add('on');
      b.addEventListener('click', () => pickTagine(i, true));
      list.appendChild(b);
    });
    pickTagine(tjIdx, false);
  }
  function pickTagine(i, anim){
    const it = D.menu.find(c => c.id === 'tajin').items[i]; tjIdx = i;
    $$('#tjList button').forEach((b, k) => b.classList.toggle('on', k === i));
    const src = `assets/img/${tjImgFor(it[0])}.webp`, img = $('#tjImg');
    $('#tjName').textContent = lang === 'ar' ? it[1] : it[0];
    $('#tjPrice').textContent = `${it[2]} EGP`;
    if (!anim) { img.src = src; return; }
    gsap.timeline()
      .to('#tjPlate', { rotate: lang === 'ar' ? 40 : -40, scale: .86, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { img.src = src; } })
      .set('#tjPlate', { rotate: lang === 'ar' ? -40 : 40 })
      .to('#tjPlate', { rotate: 0, scale: 1, opacity: 1, duration: .7, ease: 'back.out(1.4)' })
      .fromTo('#tjCard', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .45 }, '-=.45');
  }

  /* ---------- menu ---------- */
  const ICONS = {
    pot:'<path d="M4 11h16M5 11v4a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5v-4M2 11h2M20 11h2M9 7c0-1 1-1 1-2M13 7c0-1 1-1 1-2"/>',
    fire:'<path d="M12 21c-4 0-6-3-6-6 0-4 4-6 4-10 3 2 4 4 4 6 1-1 1-2 1-3 2 2 3 4 3 7 0 3-2 6-6 6z"/>',
    bowl:'<path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-1 1-1 1-2M12 7c0-1 1-1 1-2M16 7c0-1 1-1 1-2"/>',
    plate:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/>',
    wave:'<path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M12 3l3 6H9z"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    leaf:'<path d="M5 19C5 9 11 5 20 4c-1 9-5 15-15 15zM5 19l7-7"/>',
    star:'<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
    cup:'<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2"/>'
  };
  let curCat = 'tajin', query = '';
  function buildTabs(){
    const tabs = $('#menuTabs'); tabs.innerHTML = '';
    D.menu.forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.role = 'tab';
      b.textContent = T(c.name); b.classList.toggle('on', c.id === curCat && !query);
      b.addEventListener('click', () => { curCat = c.id; query = ''; $('#menuSearch').value = ''; buildTabs(); renderMenu(); });
      tabs.appendChild(b);
    });
  }
  function itemHTML(it, cat, i){
    const [en, ar, price, dEn, dAr, img] = it;
    const name = lang === 'ar' ? ar : en, alt = lang === 'ar' ? en : ar, desc = lang === 'ar' ? dAr : dEn;
    const p = Array.isArray(price)
      ? `${price[0]}<small>${lang === 'ar' ? 'فطيرة' : 'Feteer'}</small></div><div class="mi-p">${price[1]}<small>${lang === 'ar' ? 'رول' : 'Roll'}</small>`
      : `${price}<small>EGP</small>`;
    const th = img ? `<img src="assets/img/${img}-s.webp" alt="" loading="lazy">` : `<svg viewBox="0 0 24 24">${ICONS[cat.icon]}</svg>`;
    const priceCol = Array.isArray(price) ? `<div style="display:flex;gap:16px"><div class="mi-p">${p}</div></div>` : `<div class="mi-p">${p}</div>`;
    return `<div class="mi${img ? ' star' : ''}" style="animation-delay:${Math.min(i, 14) * 35}ms"><div class="mi-th">${th}</div><div><div class="mi-n">${name}</div>${desc ? `<div class="mi-d">${desc}</div>` : `<div class="mi-alt">${alt}</div>`}</div>${priceCol}</div>`;
  }
  function renderMenu(){
    const grid = $('#menuGrid'); let out = [], note = '';
    if (query) {
      const q = query.toLowerCase();
      D.menu.forEach(c => c.items.forEach(it => { if ((it[0] + ' ' + it[1]).toLowerCase().includes(q)) out.push(itemHTML(it, c, out.length)); }));
      note = lang === 'ar' ? `${out.length} نتيجة` : `${out.length} results`;
    } else {
      const c = D.menu.find(x => x.id === curCat);
      out = c.items.map((it, i) => itemHTML(it, c, i)); note = c.note ? T(c.note) : '';
    }
    grid.innerHTML = out.join('') || `<p class="menu-empty">${lang === 'ar' ? 'مفيش نتائج… جرّب كلمة تانية' : 'No dishes found, try another word'}</p>`;
    $('#menuNote').textContent = note;
  }
  $('#menuSearch').addEventListener('input', e => { query = e.target.value.trim(); buildTabs(); renderMenu(); });

  /* ---------- branches ---------- */
  function buildBranches(){
    $('#brGrid').innerHTML = D.branches.map(b => `
      <article class="br${b.id === 'kuwait' ? ' kw' : ''}">
        <div class="br-img"><img src="assets/img/${b.img}.webp" alt="" loading="lazy"><span class="br-tag">${T(b.tag)}</span></div>
        <div class="br-b"><span class="br-city">${T(b.city)}</span><h3>${T(b.name)}</h3><p>${T(b.addr)}</p>
          <div class="br-acts">
            ${b.map ? `<a href="https://www.google.com/maps?q=${b.map}" target="_blank" rel="noopener">${lang === 'ar' ? 'الخريطة' : 'Map'}</a>` : ''}
            ${b.phone ? `<a href="tel:${b.phone}">${lang === 'ar' ? 'اتصل' : 'Call'}</a>` : `<a href="#menu">${lang === 'ar' ? 'المنيو' : 'Menu'}</a>`}
          </div></div>
      </article>`).join('');
    $('#soonList').innerHTML = D.soon.map(s => `<span>${T(s)}</span>`).join('');
    $('#brSelect').innerHTML = D.branches.filter(b => b.phone).map(b => `<option value="${b.id}">${T(b.name)} – ${T(b.city)}</option>`).join('');
  }

  /* ---------- booking ---------- */
  let guests = 4;
  $$('.stepper button').forEach(b => b.addEventListener('click', () => { guests = Math.max(1, Math.min(40, guests + +b.dataset.g)); $('#gOut').textContent = guests; }));
  const dIn = $('#bookForm [name=date]'); const today = new Date(); dIn.min = today.toISOString().slice(0, 10); dIn.value = dIn.min;
  $('#bookForm').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target; let ok = true;
    ['name', 'phone', 'date', 'time'].forEach(n => { const el = f[n]; const bad = !el.value.trim() || (n === 'phone' && el.value.replace(/\D/g, '').length < 8); el.classList.toggle('err', bad); if (bad) ok = false; });
    if (!ok) { $('#fMsg').style.color = '#d0463b'; $('#fMsg').textContent = lang === 'ar' ? 'من فضلك كمّل البيانات المطلوبة' : 'Please complete the required fields'; return; }
    const br = D.branches.find(b => b.id === f.branch.value);
    const msg = lang === 'ar'
      ? `حجز طاولة – Zaza\nالاسم: ${f.name.value}\nالموبايل: ${f.phone.value}\nالفرع: ${T(br.name)}\nالتاريخ: ${f.date.value}  الساعة: ${f.time.value}\nعدد الضيوف: ${guests}${f.note.value ? `\nالمناسبة: ${f.note.value}` : ''}`
      : `Table reservation – Zaza\nName: ${f.name.value}\nPhone: ${f.phone.value}\nBranch: ${T(br.name)}\nDate: ${f.date.value}  Time: ${f.time.value}\nGuests: ${guests}${f.note.value ? `\nOccasion: ${f.note.value}` : ''}`;
    $('#fMsg').style.color = ''; $('#fMsg').textContent = lang === 'ar' ? 'بنفتح واتساب لتأكيد الحجز…' : 'Opening WhatsApp to confirm…';
    window.open(waLink(msg), '_blank');
  });

  /* ---------- header / nav ---------- */
  const hdr = $('#hdr');
  ScrollTrigger.create({ start: 80, onUpdate: s => hdr.classList.toggle('solid', s.scroll() > 80) });
  ScrollTrigger.create({ trigger: '#story', start: 'top 80%', onEnter: () => $('#waFab').classList.add('on'), onLeaveBack: () => $('#waFab').classList.remove('on') });
  $('#burger').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- smooth scroll ---------- */
  let lenis;
  if (!weak && !reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); } }));
  }

  /* ---------- lazy videos: load near view, play only when visible ---------- */
  const vids = $$('video[data-src]');
  const io = new IntersectionObserver(es => es.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) {
      if (!v.src) { v.src = v.dataset.src; v.load(); }
      if (v.classList.contains('hero-video') && document.body.classList.contains('is-loading')) return;
      const p = v.play(); if (p) p.then(() => v.classList.add('on')).catch(() => {});
    } else if (v.src) v.pause();
  }), { rootMargin: '200px 200px' });

  /* ---------- reel (pinned horizontal on desktop) ---------- */
  let reelST;
  function setupReel(){
    if (reelST) { reelST.kill(); reelST = null; gsap.set('#reelTrack', { x: 0 }); }
    if (isMobile) return;
    const track = $('#reelTrack');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const dir = lang === 'ar' ? 1 : -1;
    const tw = gsap.to(track, { x: () => dir * dist(), ease: 'none' });
    reelST = ScrollTrigger.create({
      trigger: '.reel-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, animation: tw, invalidateOnRefresh: true,
      onUpdate: s => gsap.set('#reelBar', { scaleX: s.progress })
    });
  }

  /* ---------- reveals ---------- */
  function reveals(){
    $$('.h2, .lead, .kicker, .story-pills, .chap-price, .book-form, .soon, .morning-price').forEach(el => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    ScrollTrigger.batch('.br', { start: 'top 90%', once: true, onEnter: b => gsap.from(b, { y: 60, opacity: 0, stagger: .1, duration: 1, ease: 'power3.out' }) });
    gsap.to('.morning-img img', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.morning', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.copper-stage', { rotate: -8 }, { rotate: 8, ease: 'none', scrollTrigger: { trigger: '.copper', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.hero-ring', { rotate: 120, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-in', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
    // story logo: the rope re-ties itself as you scroll
    const ss = $$('.story-mark .z-strand');
    gsap.from(ss, { scale: 0, opacity: 0, stagger: { each: .03 }, ease: 'back.out(2)', scrollTrigger: { trigger: '.story', start: 'top 75%', end: 'center center', scrub: 1 } });
    gsap.from('.story-mark .z-l, .story-mark .z-l2, .story-mark .z-est, .story-mark .z-k', { y: 40, opacity: 0, stagger: .05, scrollTrigger: { trigger: '.story', start: 'top 60%', end: 'center center', scrub: 1 } });
    $$('.chap').forEach(c => gsap.from(c.querySelector('video'), { scale: 1.25, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: undefined, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }

  /* ---------- intro: the rope ties itself ---------- */
  function intro(){
    const I = $('#intro');
    const strands = $$('.intro .z-strand'), knot = $$('.intro .z-k'), l1 = $$('.intro .z-l'), l2 = $$('.intro .z-l2');
    gsap.set([strands, knot], { transformBox: 'fill-box', transformOrigin: '50% 50%' });
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(strands, { opacity: 1, scale: 1, rotate: 0, duration: .5, ease: 'back.out(2.2)', stagger: { each: .035 }, startAt: { scale: .2, rotate: -60 } })
      .to(knot, { opacity: 1, scale: 1, duration: .6, ease: 'elastic.out(1,.55)', stagger: { each: .02, from: 'center' }, startAt: { scale: 1.8 } }, '-=.35')
      .to(l1, { opacity: 1, y: 0, duration: .7, ease: 'power4.out', stagger: .08, startAt: { y: 140 } }, '-=.4')
      .to(l2, { opacity: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .045, startAt: { y: 60 } }, '-=.45')
      .to('.intro .z-est', { opacity: 1, letterSpacing: 0, duration: .5 }, '-=.2')
      .to('.intro-line', { opacity: 1, duration: .5 }, '-=.3')
      .to({}, { duration: .55 });
    $('.intro-skip').addEventListener('click', () => tl.progress(1));
    function finish(){
      const from = $('.intro-logo').getBoundingClientRect(), to = $('.hdr-logo img').getBoundingClientRect();
      const out = gsap.timeline({ onComplete: () => { I.remove(); document.body.classList.remove('is-loading'); ScrollTrigger.refresh(); const hv = $('.hero-video'); if (hv.src) hv.play().then(() => hv.classList.add('on')).catch(() => {}); } });
      out.to('.intro-line, .intro-skip', { opacity: 0, duration: .3 })
        .to('.intro-logo', { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), scale: to.width / from.width, duration: .9, ease: 'power3.inOut' }, '<')
        .to(I, { clipPath: 'circle(0% at 50% 50%)', duration: 1, ease: 'power3.inOut' }, '-=.55')
        .from('.hdr', { opacity: 0, duration: .5 }, '-=.5')
        .from('.hero-poster img', { scale: 1.15, duration: 1.6, ease: 'power2.out' }, '-=1')
        .from('.hero-title .ln > span', { yPercent: 110, duration: 1, ease: 'power4.out', stagger: .12 }, '-=1.2')
        .from('.eyebrow, .hero-sub, .hero-ctas, .hero-foot', { y: 30, opacity: 0, stagger: .08, duration: .8 }, '-=.8');
      gsap.set(I, { clipPath: 'circle(150% at 50% 50%)' });
    }
  }

  /* ---------- boot ---------- */
  applyLang();
  vids.forEach(v => io.observe(v));
  setupReel(); reveals();
  if (reduce) { $('#intro').remove(); document.body.classList.remove('is-loading'); } else intro();
  addEventListener('load', () => ScrollTrigger.refresh());
})();

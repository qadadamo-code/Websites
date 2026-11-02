/* =========================================================
   BARCODE CAFE — interactions
   ========================================================= */
(() => {
  const CFG = window.BARCODE_CONFIG;
  const MENU = window.BARCODE_MENU;
  const MOODS = window.BARCODE_MOODS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const fmt = n => Number(n).toLocaleString("en-US");
  const money = n => `${fmt(n)} ${CFG.currency}`;
  const ITEMS = {};
  MENU.forEach(c => c.items.forEach((it, i) => (ITEMS[it.id] = { ...it, cat: c, code: `${c.code}-${String(i + 1).padStart(2, "0")}` })));

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- links from config ---------------- */
  const waLink = text => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
  const mailLink = (subject, body) => `mailto:${CFG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const waTexts = {
    nav: "مرحبًا باركود كافيه! أريد أن أطلب أونلاين 🍕☕",
    fab: "مرحبًا باركود كافيه! عندي سؤال بسيط…",
    footer: "مرحبًا باركود كافيه!",
    opening: "مرحبًا باركود كافيه! أريد دعوة يوم الافتتاح، وأرجو إبلاغي بالموعد أول بأول ✨"
  };
  $$("[data-wa]").forEach(a => (a.href = waLink(waTexts[a.dataset.wa] || waTexts.footer)));
  $$("[data-mail]").forEach(a => (a.href = `mailto:${CFG.email}`));
  $$("[data-cfg]").forEach(el => (el.textContent = CFG[el.dataset.cfg] || ""));
  $$("[data-social]").forEach(a => (a.href = CFG.social[a.dataset.social] || "#"));
  $("#year").textContent = new Date().getFullYear();

  /* ---------------- barcode generator ---------------- */
  function hash(str) { let h = 2166136261; for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function barcodeSVG(str, color = "currentColor", bars = 34) {
    let seed = hash(str) || 1;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const parts = [2, 1, 1, 1, 2]; // start guard
    for (let i = 0; i < bars; i++) parts.push(1 + Math.floor(rnd() * 3.2));
    parts.push(1, 1, 2, 1, 2);     // stop guard
    let x = 0, rects = "";
    parts.forEach((w, i) => { if (i % 2 === 0) rects += `<rect x="${x}" y="0" width="${w}" height="40"/>`; x += w; });
    return `<svg viewBox="0 0 ${x} 40" preserveAspectRatio="none" fill="${color}" aria-hidden="true">${rects}</svg>`;
  }
  function barDivs(el, str, n = 46) {
    let seed = hash(str);
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    let html = "";
    for (let i = 0; i < n; i++) {
      const w = 1 + Math.floor(rnd() * 4), gap = 1 + Math.floor(rnd() * 3);
      html += `<i style="width:${w * 1.6}px;margin-inline-end:${gap * 1.6}px"></i>`;
    }
    el.innerHTML = html;
  }

  /* ---------------- image-sequence player (scroll-scrubbed video) ---------------- */
  class Sequence {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.name = canvas.dataset.seq;
      this.count = +canvas.dataset.frames || 48;
      this.frames = new Array(this.count);
      this.current = 0;
      this.loaded = 0;
      this.started = false;
      this.resize();
      addEventListener("resize", () => this.resize());
    }
    src(i) { return `assets/seq/${this.name}/${String(i + 1).padStart(3, "0")}.jpg`; }
    load(onProgress) {
      if (this.started) return this.promise;
      this.started = true;
      // first frame first, then the rest
      const order = [0, ...Array.from({ length: this.count - 1 }, (_, i) => i + 1)];
      this.promise = new Promise(res => {
        order.forEach(i => {
          const img = new Image();
          img.decoding = "async";
          img.onload = img.onerror = () => {
            this.loaded++;
            if (i === this.current || (i === 0 && !this.frames[this.current])) this.draw(this.current);
            onProgress && onProgress(this.loaded / this.count);
            if (this.loaded === this.count) res();
          };
          img.src = this.src(i);
          this.frames[i] = img;
        });
      });
      return this.promise;
    }
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = this.canvas.getBoundingClientRect();
      this.canvas.width = Math.max(1, Math.round(r.width * dpr));
      this.canvas.height = Math.max(1, Math.round(r.height * dpr));
      this.draw(this.current, true);
    }
    nearest(i) {
      for (let d = 0; d < this.count; d++) {
        const a = this.frames[i - d], b = this.frames[i + d];
        if (a && a.complete && a.naturalWidth) return a;
        if (b && b.complete && b.naturalWidth) return b;
      }
      return null;
    }
    draw(i, force) {
      i = Math.max(0, Math.min(this.count - 1, Math.round(i)));
      if (i === this.current && !force && this._drawn === i) return;
      this.current = i;
      const img = this.nearest(i);
      if (!img) return;
      this._drawn = i;
      const { width: cw, height: ch } = this.canvas;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }
  }

  /* ---------------- build menu chapters ---------------- */
  const chapters = $("#chapters");
  const tabs = $("#menuTabs");
  MENU.forEach((c, ci) => {
    tabs.insertAdjacentHTML("beforeend", `<a href="#cat-${c.id}" data-cat="${c.id}">${c.title}<small>${String(ci + 1).padStart(2, "0")}</small></a>`);
    // Arabic letters must stay connected: animate whole words instead of letters
    const titleWords = c.title.split(" ").map(w => `<span class="ch">${w}</span>`).join(" ");
    chapters.insertAdjacentHTML("beforeend", `
      <div class="cat" id="cat-${c.id}" data-cat="${c.id}">
        <section class="chapter" data-chapter="${c.id}">
          <div class="chapter__pin">
            <canvas class="seq-canvas" data-seq="${c.seq}" data-frames="48"></canvas>
            <div class="chapter__shade"></div>
            <div class="scanline" aria-hidden="true"></div>
            <div class="chapter__code" aria-hidden="true">${c.code}</div>
            <div class="chapter__text">
              <div class="chapter__eyebrow latin" dir="ltr">${String(ci + 1).padStart(2, "0")} / ${String(MENU.length).padStart(2, "0")} · ${c.titleEn.toUpperCase()}</div>
              <h3 class="chapter__title">${titleWords}</h3>
              <p class="chapter__line">${c.line}</p>
              <a href="#items-${c.id}" class="btn btn--ghost btn--sm chapter__skip" data-skip>اعرض الأصناف ↓</a>
            </div>
            <div class="chapter__hud latin" aria-hidden="true">
              <div class="row"><span>SCANNING</span><span class="hud-frame">001/048</span></div>
              <div class="row" style="margin-top:6px"><span>${c.code}</span><span>${c.items.length} ITEMS</span></div>
              <div class="bar"><i></i></div>
            </div>
          </div>
        </section>
        <div class="items" id="items-${c.id}">
          <div class="wrap">
            <div class="items__head">
              <h3>${c.title}<span class="copper" style="color:var(--copper)">.</span></h3>
              <p>${c.items.length} أصناف · اضغط «أضف» وسنجهّز لك الفاتورة.</p>
            </div>
            <div class="items__hero"><img src="assets/img/${c.seq}.jpg" alt="${c.title} في باركود كافيه" loading="lazy"></div>
            <div class="grid">
              ${c.items.map((it, i) => `
                <article class="item" data-id="${it.id}">
                  <span class="item__qty latin" data-qty="${it.id}"></span>
                  <div class="item__top"><span class="item__code latin">${ITEMS[it.id].code}</span>${it.tag ? `<span class="item__tag">${it.tag}</span>` : ""}</div>
                  <h4>${it.name}</h4>
                  <p>${it.desc}</p>
                  <div class="item__bottom">
                    <div class="item__barcode" style="color:var(--brown)">${barcodeSVG(it.id + it.name)}</div>
                    <div class="item__price latin">${fmt(it.price)}<small>EGP</small></div>
                  </div>
                  <button class="item__add" data-add="${it.id}"><span>+</span> أضف إلى الفاتورة</button>
                </article>`).join("")}
            </div>
          </div>
        </div>
      </div>`);
  });

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (!reduce && !isTouch && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = target => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMobileNav();
    if (a.hasAttribute("data-close")) closeDrawer();
    scrollTo(el);
  });

  /* ---------------- sequences ---------------- */
  const seqs = $$(".seq-canvas").map(c => new Sequence(c));
  const heroSeq = seqs.find(s => s.canvas.closest(".hero"));

  /* ---------------- loader ---------------- */
  const loaderBars = $("#loaderBars");
  barDivs(loaderBars, "barcode-cafe", 38);
  const lbars = $$("i", loaderBars);
  const pctEl = $("#loaderPct");
  let pctShown = { v: 0 };
  const loaderTl = gsap.timeline();
  loaderTl.to(lbars, { scaleY: 1, duration: .5, ease: "power3.out", stagger: { each: .018, from: "random" } })
    .to(".loader__laser", { opacity: 1, duration: .1 }, "-=.2")
    .fromTo(".loader__laser", { top: 0 }, { top: 120, duration: .7, ease: "power1.inOut", yoyo: true, repeat: 1 }, "<")
    .to(".loader__logo", { opacity: 1, duration: .6 }, "-=.6");

  const heroLoad = heroSeq.load(p => gsap.to(pctShown, { v: p * 100, duration: .4, onUpdate: () => (pctEl.textContent = Math.round(pctShown.v)) }));
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const minTime = new Promise(r => setTimeout(r, 1800));
  const maxTime = new Promise(r => setTimeout(r, 6000));
  Promise.race([Promise.all([heroLoad, fontsReady, minTime]), maxTime]).then(() => {
    pctEl.textContent = "100";
    gsap.timeline({ onComplete: () => { $("#loader").remove(); document.body.classList.remove("is-loading"); lenis && lenis.start(); ScrollTrigger.refresh(); } })
      .to(lbars, { scaleY: 0, transformOrigin: "top", duration: .45, stagger: { each: .01, from: "center" }, ease: "power3.in" })
      .to(".loader__logo,.loader__meta", { opacity: 0, y: -10, duration: .3 }, "<")
      .to("#loader", { clipPath: "inset(0 0 100% 0)", duration: .9, ease: "expo.inOut" }, "-=.1")
      .add(heroIntro, "-=.55");
  });

  /* ---------------- hero ---------------- */
  gsap.set("#heroTitle .line>span", { yPercent: 110 });
  gsap.set(["#heroSub", "#heroCtas", ".hero__hint", ".hero__hud"], { opacity: 0, y: 20 });
  gsap.set("#heroRoundel", { scale: .6, rotate: -25, opacity: 0 });
  function heroIntro() {
    return gsap.timeline()
      .to("#heroRoundel", { scale: 1, rotate: 0, opacity: 1, duration: 1.4, ease: "expo.out" })
      .to("#heroTitle .line>span", { yPercent: 0, duration: 1.1, stagger: .12, ease: "expo.out" }, "-=1.1")
      .to(["#heroSub", "#heroCtas", ".hero__hint", ".hero__hud"], { opacity: 1, y: 0, duration: .9, stagger: .08, ease: "power3.out" }, "-=.8");
  }
  const heroHud = $('.hud-frame[data-hud="latte"]');
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom bottom", scrub: true,
    onUpdate: self => {
      const f = self.progress * (heroSeq.count - 1);
      heroSeq.draw(f);
      heroHud.textContent = `${String(Math.round(f) + 1).padStart(3, "0")}/${String(heroSeq.count).padStart(3, "0")}`;
    }
  });
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom bottom", scrub: .6 } })
    .to("#heroRoundel", { scale: .62, yPercent: -18, ease: "none" }, 0)
    .to(".hero__hint", { opacity: 0, duration: .1 }, 0)
    .to(["#heroSub", "#heroCtas"], { opacity: 0, y: -30, ease: "none", duration: .3 }, .45)
    .to("#heroTitle", { scale: .9, opacity: .0, ease: "none", duration: .3 }, .62)
    .to("#heroRoundel", { opacity: 0, ease: "none", duration: .25 }, .72)
    .to(".hero .scanline", { top: "100%", ease: "none", duration: 1 }, 0)
    .to(".hero__shade", { opacity: .55, ease: "none", duration: .5 }, .4);

  /* ---------------- chapters ---------------- */
  $$(".chapter").forEach(ch => {
    const seq = seqs.find(s => s.canvas.closest(".chapter") === ch);
    const hud = $(".hud-frame", ch), bar = $(".bar i", ch);
    ScrollTrigger.create({ trigger: ch, start: "top 250%", once: true, onEnter: () => seq.load() });
    ScrollTrigger.create({
      trigger: ch, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: self => {
        const p = Math.min(1, self.progress / .92);
        const f = p * (seq.count - 1);
        seq.draw(f);
        if (hud) hud.textContent = `${String(Math.round(f) + 1).padStart(3, "0")}/048`;
        if (bar) bar.style.transform = `scaleX(${self.progress})`;
      }
    });
    gsap.set($$(".chapter__title .ch", ch), { yPercent: 100, opacity: 0 });
    gsap.set([$(".chapter__eyebrow", ch), $(".chapter__line", ch), $(".chapter__skip", ch)], { opacity: 0, y: 24 });
    gsap.timeline({ scrollTrigger: { trigger: ch, start: "top 60%", toggleActions: "play none none reverse" } })
      .to($(".chapter__eyebrow", ch), { opacity: 1, y: 0, duration: .6, ease: "power3.out" })
      .to($$(".chapter__title .ch", ch), { yPercent: 0, opacity: 1, duration: 1, stagger: .08, ease: "expo.out" }, "-=.3")
      .to([$(".chapter__line", ch), $(".chapter__skip", ch)], { opacity: 1, y: 0, duration: .8, stagger: .1, ease: "power3.out" }, "-=.7");
    gsap.timeline({ scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom bottom", scrub: .5 } })
      .fromTo($(".chapter__code", ch), { xPercent: -20 }, { xPercent: 12, ease: "none" }, 0)
      .fromTo($(".scanline", ch), { top: "0%" }, { top: "100%", ease: "none" }, 0);
    gsap.to($(".chapter__text", ch), { opacity: 0, y: -60, ease: "none", scrollTrigger: { trigger: ch, start: "bottom 130%", end: "bottom bottom", scrub: true } });
  });

  // item reveals + hero image parallax
  $$(".items").forEach(sec => {
    gsap.from($$(".item", sec), { y: 60, opacity: 0, rotate: .6, duration: 1, ease: "expo.out", stagger: { each: .06 }, scrollTrigger: { trigger: $(".grid", sec), start: "top 85%" } });
    gsap.fromTo($(".items__hero img", sec), { yPercent: -12 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: $(".items__hero", sec), start: "top bottom", end: "bottom top", scrub: true } });
  });

  // tabs active state
  const tabLinks = $$("a", tabs);
  $$(".cat").forEach(cat => {
    ScrollTrigger.create({
      trigger: cat, start: "top 50%", end: "bottom 50%",
      onToggle: self => { if (self.isActive) { tabLinks.forEach(t => t.classList.toggle("is-active", t.dataset.cat === cat.dataset.cat)); const a = tabLinks.find(t => t.dataset.cat === cat.dataset.cat); a && a.scrollIntoView({ inline: "center", block: "nearest" }); } }
    });
  });

  /* ---------------- manifesto words ---------------- */
  $$("[data-split]").forEach(p => {
    p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
    gsap.to($$(".w", p), { opacity: 1, stagger: .05, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true } });
  });
  $$("[data-count]").forEach(el => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* ---------------- marquee ---------------- */
  $$(".marquee__row").forEach(row => {
    row.innerHTML += row.innerHTML;
    const dir = +row.dataset.dir;
    let x = 0, boost = 0;
    const half = () => row.scrollWidth / 2;
    ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top", onUpdate: s => (boost = Math.min(8, Math.abs(s.getVelocity()) / 300)) });
    gsap.ticker.add(() => {
      if (reduce) return;
      x -= (0.6 + boost) * dir;
      boost *= 0.92;
      const h = half();
      if (x < -h) x += h;
      if (x > 0) x -= h;
      row.style.transform = `translateX(${x}px)`;
    });
  });

  /* ---------------- nav behaviour ---------------- */
  const nav = $("#nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > lastY && y > 400 && !document.body.classList.contains("drawer-open"));
      lastY = y;
    }
  });
  const burger = $("#burger"), mnav = $("#mnav");
  burger.addEventListener("click", () => { burger.classList.toggle("is-open"); mnav.classList.toggle("is-open"); });
  function closeMobileNav() { burger.classList.remove("is-open"); mnav.classList.remove("is-open"); }

  /* ---------------- cursor + magnetic ---------------- */
  if (!isTouch && !reduce) {
    const cur = $("#cursor"), label = $("#cursorLabel");
    const xTo = gsap.quickTo(cur, "x", { duration: .25, ease: "power3" }), yTo = gsap.quickTo(cur, "y", { duration: .25, ease: "power3" });
    addEventListener("mousemove", e => { xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener("mouseover", e => {
      const card = e.target.closest(".item");
      cur.classList.toggle("is-big", !!card);
      label.textContent = card ? "أضف +" : "";
    });
    $$("[data-magnetic]").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: .7, ease: "elastic.out(1,.4)" }));
    });
    // gentle tilt on cards
    $$(".item").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        gsap.to(card, { rotateY: ((e.clientX - r.left) / r.width - .5) * 6, rotateX: -((e.clientY - r.top) / r.height - .5) * 6, transformPerspective: 800, duration: .4 });
      });
      card.addEventListener("mouseleave", () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .6 }));
    });
  }

  /* ---------------- toast ---------------- */
  const toastEl = $("#toast");
  let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 2200); }

  /* ---------------- cart ---------------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem("bc_cart") || "{}"); } catch { return {}; } },
    set(v) { try { localStorage.setItem("bc_cart", JSON.stringify(v)); } catch {} }
  };
  let cart = store.get();
  Object.keys(cart).forEach(k => { if (!ITEMS[k]) delete cart[k]; });
  const orderNo = (() => { let n; try { n = sessionStorage.getItem("bc_no"); } catch {} if (!n) { n = String(1000 + Math.floor(Math.random() * 9000)); try { sessionStorage.setItem("bc_no", n); } catch {} } return n; })();
  $("#receiptNo").textContent = `ORDER #${orderNo}`;
  $("#receiptBarcode").innerHTML = barcodeSVG("order" + orderNo, "var(--brown)", 60);

  const total = () => Object.entries(cart).reduce((s, [id, q]) => s + ITEMS[id].price * q, 0);
  const count = () => Object.values(cart).reduce((s, q) => s + q, 0);

  function add(id, q = 1, silent) {
    cart[id] = (cart[id] || 0) + q;
    if (cart[id] <= 0) delete cart[id];
    store.set(cart); render();
    if (!silent && q > 0) {
      toast(`أُضيف ${ITEMS[id].name} إلى الفاتورة`);
      const btn = $("#cartBtn"); btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
    }
  }
  function render() {
    const c = count();
    const cc = $("#cartCount"); cc.textContent = c; cc.classList.toggle("has", c > 0);
    $$("[data-qty]").forEach(el => {
      const q = cart[el.dataset.qty] || 0;
      el.textContent = q ? `×${q}` : ""; el.classList.toggle("has", q > 0);
      el.closest(".item").toggleAttribute("data-in", q > 0);
    });
    const list = $("#receiptItems");
    list.innerHTML = Object.entries(cart).map(([id, q]) => {
      const it = ITEMS[id];
      return `<li><span class="nm">${it.name}</span><span class="pr">${fmt(it.price * q)}</span>
        <div class="qty"><button data-dec="${id}" aria-label="أقل">−</button><b>${q}</b><button data-inc="${id}" aria-label="أكثر">+</button><span class="latin">× ${fmt(it.price)}</span></div></li>`;
    }).join("");
    $("#receiptEmpty").style.display = c ? "none" : "block";
    $("#orderForm").style.display = c ? "flex" : "none";
    $("#receiptTotal").textContent = money(total());
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-add]");
    if (a) {
      add(a.dataset.add);
      a.classList.add("added"); a.innerHTML = "✓ أُضيف";
      setTimeout(() => { a.classList.remove("added"); a.innerHTML = "<span>+</span> أضف إلى الفاتورة"; }, 1300);
      return;
    }
    const inc = e.target.closest("[data-inc]"); if (inc) return add(inc.dataset.inc, 1, true);
    const dec = e.target.closest("[data-dec]"); if (dec) return add(dec.dataset.dec, -1, true);
  });

  const drawer = $("#drawer");
  function openDrawer() {
    drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); document.body.classList.add("drawer-open");
    lenis && lenis.stop();
    const d = new Date();
    $("#receiptDate").textContent = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    gsap.fromTo(".receipt__paper", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "expo.out", delay: .15 });
  }
  function closeDrawer() { drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); document.body.classList.remove("drawer-open"); lenis && lenis.start(); }
  $("#cartBtn").addEventListener("click", openDrawer);
  $$("[data-close]", drawer).forEach(b => b.addEventListener("click", closeDrawer));
  addEventListener("keydown", e => e.key === "Escape" && closeDrawer());

  function orderText(f) {
    const lines = Object.entries(cart).map(([id, q]) => `• ${q} × ${ITEMS[id].name} = ${money(ITEMS[id].price * q)}`);
    return [
      `مرحبًا ${CFG.brand} 👋`,
      `طلب جديد من الموقع — رقم #${orderNo}`,
      "",
      ...lines,
      "",
      `الإجمالي: ${money(total())}`,
      `نوع الطلب: ${f.type.value}`,
      `الاسم: ${f.name.value.trim()}`,
      `الموبايل: ${f.phone.value.trim()}`,
      f.address.value.trim() ? `العنوان: ${f.address.value.trim()}` : "",
      f.notes.value.trim() ? `ملاحظات: ${f.notes.value.trim()}` : ""
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
  }
  function validOrder(f) {
    let ok = true;
    [f.name, f.phone].forEach(i => { const bad = !i.value.trim(); i.classList.toggle("invalid", bad); if (bad) ok = false; });
    const needAddr = f.type.value === "توصيل" && !f.address.value.trim();
    f.address.classList.toggle("invalid", needAddr); if (needAddr) ok = false;
    if (!ok) toast("من فضلك أكمل البيانات المطلوبة");
    return ok;
  }
  const of = $("#orderForm");
  of.addEventListener("submit", e => {
    e.preventDefault();
    if (!count() || !validOrder(of)) return;
    window.open(waLink(orderText(of)), "_blank", "noopener");
  });
  $("#orderMail").addEventListener("click", () => {
    if (!count() || !validOrder(of)) return;
    location.href = mailLink(`طلب أونلاين #${orderNo} — ${CFG.brand}`, orderText(of));
  });
  render();

  /* ---------------- mood scanner ---------------- */
  const chips = $("#moodChips"), scanner = $("#scanner"), ticket = $("#moodTicket");
  barDivs($("#scannerBars"), "mood", 52);
  MOODS.forEach(m => chips.insertAdjacentHTML("beforeend", `<button class="chip" data-mood="${m.id}">${m.label}</button>`));
  let currentMood = null, scanTimer;
  chips.addEventListener("click", e => {
    const b = e.target.closest("[data-mood]"); if (!b) return;
    $$(".chip", chips).forEach(c => c.classList.toggle("is-on", c === b));
    const m = MOODS.find(x => x.id === b.dataset.mood); currentMood = m;
    barDivs($("#scannerBars"), m.id + Date.now(), 52);
    scanner.classList.remove("has-result"); scanner.classList.add("is-scanning");
    gsap.to(ticket, { scaleY: 0, opacity: 0, duration: .25, onComplete: () => (ticket.hidden = true) });
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      scanner.classList.remove("is-scanning"); scanner.classList.add("has-result");
      $("#moodCode").textContent = `${m.code}`;
      $("#moodNote").textContent = m.note;
      const grouped = {}; m.items.forEach(id => (grouped[id] = (grouped[id] || 0) + 1));
      $("#moodList").innerHTML = Object.entries(grouped).map(([id, q]) => `<li><span>${q > 1 ? q + " × " : ""}${ITEMS[id].name}</span><b>${fmt(ITEMS[id].price * q)}</b></li>`).join("");
      $("#moodTotal").textContent = money(m.items.reduce((s, id) => s + ITEMS[id].price, 0));
      ticket.hidden = false;
      gsap.fromTo(ticket, { scaleY: 0, opacity: 1 }, { scaleY: 1, duration: .9, ease: "expo.out" });
      gsap.from($$("#moodList li", ticket), { opacity: 0, x: 20, stagger: .08, delay: .3 });
    }, reduce ? 50 : 2200);
  });
  $("#moodAdd").addEventListener("click", () => {
    if (!currentMood) return;
    currentMood.items.forEach(id => add(id, 1, true));
    toast("أُضيفت وصفة المزاج إلى الفاتورة ✓");
    openDrawer();
  });

  /* ---------------- reservation pass ---------------- */
  const rf = $("#reserveForm");
  let guests = 2;
  const today = new Date(); rf.date.min = today.toISOString().slice(0, 10);
  function updatePass() {
    $("#passName").textContent = rf.name.value.trim() || "ضيفنا العزيز";
    const d = rf.date.value ? rf.date.value.split("-") : null;
    $("#passDate").textContent = d ? `${d[2]}/${d[1]}` : "--/--";
    $("#passTime").textContent = rf.time.value || "--:--";
    $("#passPax").textContent = guests;
    $("#guests").textContent = guests;
    const code = `BC-${d ? d[1] + d[2] : "0000"}-${String(hash(rf.name.value + rf.phone.value) % 100).padStart(2, "0")}`;
    $("#passCode").textContent = code;
    $("#passBarcode").innerHTML = barcodeSVG(code + rf.name.value, "var(--brown)", 48);
  }
  rf.addEventListener("input", updatePass);
  $$("[data-step]", rf).forEach(b => b.addEventListener("click", () => { guests = Math.max(1, Math.min(30, guests + +b.dataset.step)); updatePass(); gsap.fromTo("#guests", { scale: 1.4 }, { scale: 1, duration: .4 }); }));
  updatePass();
  function reserveText() {
    return [
      `مرحبًا ${CFG.brand} 👋`, "أريد حجز طاولة:", "",
      `الاسم: ${rf.name.value.trim()}`, `الموبايل: ${rf.phone.value.trim()}`,
      `التاريخ: ${rf.date.value}`, `الوقت: ${rf.time.value}`, `عدد الأشخاص: ${guests}`,
      `المناسبة: ${rf.occasion.value}`, rf.notes.value.trim() ? `ملاحظات: ${rf.notes.value.trim()}` : "",
      "", `كود الحجز: ${$("#passCode").textContent}`
    ].join("\n").replace(/\n{3,}/g, "\n\n");
  }
  function validReserve() {
    let ok = true;
    ["name", "phone", "date", "time"].forEach(n => { const bad = !rf[n].value.trim(); rf[n].classList.toggle("invalid", bad); if (bad) ok = false; });
    if (!ok) toast("ينقصنا بعض البيانات لنحجز لك");
    return ok;
  }
  rf.addEventListener("submit", e => { e.preventDefault(); if (validReserve()) window.open(waLink(reserveText()), "_blank", "noopener"); });
  $("#reserveMail").addEventListener("click", () => { if (validReserve()) location.href = mailLink(`حجز طاولة — ${rf.name.value.trim()}`, reserveText()); });
  gsap.from(".pass", { y: 80, rotate: -2, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".pass", start: "top 85%" } });

  /* ---------------- opening countdown (optional) ---------------- */
  if (CFG.openingDate) {
    const target = new Date(CFG.openingDate).getTime();
    if (!isNaN(target) && target > Date.now()) {
      $("#countdown").hidden = false;
      $("#openingLine").textContent = "العدّ التنازلي بدأ. احجز مقعدك في يوم الافتتاح قبل أن تمتلئ الطاولات.";
      const tick = () => {
        let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
        const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
        $("#cdD").textContent = String(d).padStart(2, "0"); $("#cdH").textContent = String(h).padStart(2, "0");
        $("#cdM").textContent = String(m).padStart(2, "0"); $("#cdS").textContent = String(s).padStart(2, "0");
      };
      tick(); setInterval(tick, 1000);
    }
  }
  gsap.from(".opening__title", { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".opening", start: "top 70%" } });
  gsap.fromTo(".footer__mega img", { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".footer__mega", start: "top bottom", end: "bottom bottom", scrub: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();

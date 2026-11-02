/* =========================================================
   Cookies Café — interactions
   ========================================================= */
(() => {
  "use strict";

  const WA = "201203101104";
  const EMAIL = "info@theplanetco.com";
  const MENU = window.COOKIES_MENU;
  const MOODS = window.COOKIES_MOODS;
  const FRAMES = 79;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = (n) => `${n.toLocaleString("en-US")} ج.م`;
  const ITEMS = {};
  MENU.forEach((c) => c.items.forEach((i) => (ITEMS[i.id] = { ...i, cat: c.id })));

  if (reduced) document.documentElement.classList.add("reduced");
  $("#year").textContent = new Date().getFullYear();

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -10, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    closeMobile();
    if (a.hasAttribute("data-close")) closeDrawer();
    scrollTo(href === "#top" ? document.body : href);
  });

  /* ---------------- toast ---------------- */
  let toastT;
  const toast = (msg) => {
    $("#toastText").textContent = msg;
    $("#toast").classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => $("#toast").classList.remove("on"), 2600);
  };

  /* ---------------- preload (images + frames) ---------------- */
  const frames = [];
  const preload = () => {
    const urls = [
      "assets/img/mascot-wave.webp",
      "assets/img/hero-cookie.jpg",
      "assets/img/cookie-top.jpg",
    ];
    const frameUrls = Array.from({ length: FRAMES }, (_, i) => `assets/frames/f${String(i + 1).padStart(3, "0")}.webp`);
    // critical: images + first 20 frames. rest load in background.
    const critical = [...urls, ...frameUrls.slice(0, 20)];
    let done = 0;
    const pctEl = $("#loaderPct");
    const load = (src, i) =>
      new Promise((res) => {
        const im = new Image();
        im.decoding = "async";
        im.onload = im.onerror = () => res(im);
        im.src = src;
        if (i !== undefined) frames[i] = im;
      });
    frameUrls.forEach((u, i) => { if (i >= 20) load(u, i); });
    return Promise.all(
      critical.map((u) => {
        const fi = frameUrls.indexOf(u);
        return load(u, fi >= 0 ? fi : undefined).then(() => {
          done++;
          pctEl.textContent = Math.round((done / critical.length) * 100);
        });
      })
    );
  };

  const minTime = new Promise((r) => setTimeout(r, reduced ? 0 : 1300));
  const maxTime = new Promise((r) => setTimeout(r, 6000));
  Promise.race([Promise.all([preload(), minTime]), maxTime]).then(intro);

  function intro() {
    $("#loaderPct").textContent = 100;
    const tl = gsap.timeline({
      onComplete: () => {
        $("#loader").remove();
        document.body.classList.remove("is-loading");
        lenis && lenis.start();
        ScrollTrigger.refresh();
      },
    });
    tl.to(".loader__inner", { y: -40, opacity: 0, duration: 0.5, ease: "power2.in" })
      .to("#loader", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.1")
      .from(".hero__word", { yPercent: 60, scale: 0.6, rotate: -6, opacity: 0, duration: 1.1, ease: "elastic.out(1,0.55)" }, "-=0.35")
      .from(".hero__neon", { opacity: 0, x: -30, duration: 0.6, ease: "power2.out" }, "-=0.7")
      .from("#heroMascot", { y: 160, scale: 0.7, rotate: 12, opacity: 0, duration: 1.2, ease: "back.out(1.6)" }, "-=1")
      .from(".stage__ring", { scale: 0.4, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out" }, "<")
      .from("#speech", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2.4)" }, "-=0.4")
      .to(".hero .reveal-up", { opacity: 1, y: 0, duration: 0.8, stagger: 0.09, ease: "power3.out" }, "-=1.1")
      .from(".stage__chip", { scale: 0, duration: 0.5, stagger: 0.08, ease: "back.out(3)" }, "-=0.8")
      .add(ovenAnim, "-=0.5");
  }

  /* ---------------- hero ---------------- */
  function ovenAnim() {
    const notes = [
      [20, "نعجن العجينة… ونعجن معها الأفكار."],
      [45, "نجرّب الكوكيز للمرة المئة. للتأكد فقط."],
      [70, "نلمّع ماكينة الإسبريسو حتى نرى وجوهنا فيها."],
      [87, "تقريبًا جاهزين… بقي أن تأتي أنت."],
    ];
    const o = { v: 0 };
    gsap.to(o, {
      v: 87, duration: 2.6, ease: "power2.out",
      onUpdate() {
        const v = Math.round(o.v);
        $("#ovenPct").textContent = v;
        $("#ovenBar").style.width = v + "%";
        const n = notes.find((x) => v <= x[0]) || notes[notes.length - 1];
        if ($("#ovenNote").textContent !== n[1]) $("#ovenNote").textContent = n[1];
      },
    });
  }

  // mascot float + mouse parallax
  if (!reduced) {
    gsap.to("#heroMascot", { y: -16, rotate: -2, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(".stage__chip", { y: "random(-14,14)", x: "random(-10,10)", rotate: "random(-40,40)", duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.3 });
    if (isFine) {
      const stage = $(".hero__stage");
      const qx = gsap.quickTo(stage, "x", { duration: 0.8, ease: "power3" });
      const qy = gsap.quickTo(stage, "y", { duration: 0.8, ease: "power3" });
      $("#hero").addEventListener("mousemove", (e) => {
        qx((e.clientX / innerWidth - 0.5) * 30);
        qy((e.clientY / innerHeight - 0.5) * 20);
      });
    }
    // hero parallax out
    gsap.to(".hero__grid", { yPercent: 18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  }

  // mascot click: witty lines + crumbs burst
  const quips = [
    "لا تضغط بقوة… أنا هشّ ومقرمش 🍪",
    "التاج حقيقي، والنظارة للبريستيج 😎",
    "ضغطة أخرى وسأعطيك خصمًا… أمزح. أو ربما لا.",
    "هل جرّبت الميلك شيك؟ انزل قليلًا وستفهم.",
    "أنا الكوكيز الوحيد الذي لا يُؤكل. اتفقنا؟",
    "الافتتاح قريب… احجز قبل أن تحجز أمك مكانك!",
  ];
  let qi = 0;
  $("#heroMascot").addEventListener("click", (e) => {
    const sp = $("#speech");
    sp.innerHTML = quips[qi++ % quips.length];
    gsap.fromTo(sp, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    gsap.fromTo("#heroMascot", { rotate: -10, scale: 0.94 }, { rotate: 0, scale: 1, duration: 0.8, ease: "elastic.out(1,.4)" });
    burst(e.clientX, e.clientY);
  });

  /* ---------------- crumbs canvas ---------------- */
  const cv = $("#crumbs");
  const cx = cv.getContext("2d");
  let W, H, DPR, crumbs = [], bursts = [];
  const COLORS = ["#c8762b", "#a85f1f", "#3a1a0a", "#e6a04a", "#5a2e12"];
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  const mk = (x, y, burstMode) => ({
    x: x ?? Math.random() * W,
    y: y ?? Math.random() * H,
    r: burstMode ? 2 + Math.random() * 4 : 1 + Math.random() * 3.2,
    vx: burstMode ? (Math.random() - 0.5) * 9 : (Math.random() - 0.5) * 0.3,
    vy: burstMode ? -Math.random() * 8 - 2 : 0.25 + Math.random() * 0.6,
    rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.05,
    c: COLORS[(Math.random() * COLORS.length) | 0],
    life: burstMode ? 1 : Infinity,
  });
  const drawCrumb = (p) => {
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
    cx.globalAlpha = Math.min(1, p.life) * 0.9;
    cx.fillStyle = p.c;
    cx.beginPath();
    cx.moveTo(-p.r, -p.r * 0.6); cx.lineTo(p.r * 0.8, -p.r); cx.lineTo(p.r, p.r * 0.5); cx.lineTo(-p.r * 0.4, p.r);
    cx.closePath(); cx.fill(); cx.restore();
  };
  let heroVisible = true;
  const tick = () => {
    if (!heroVisible && !bursts.length) return;
    cx.clearRect(0, 0, W, H);
    crumbs.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
      drawCrumb(p);
    });
    bursts = bursts.filter((p) => p.life > 0);
    bursts.forEach((p) => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += 0.2; p.life -= 0.012; drawCrumb(p); });
  };
  function burst(clientX, clientY) {
    const r = cv.getBoundingClientRect();
    for (let i = 0; i < 26; i++) bursts.push(mk(clientX - r.left, clientY - r.top, true));
  }
  if (!reduced) {
    resize();
    crumbs = Array.from({ length: innerWidth < 760 ? 26 : 55 }, () => mk());
    addEventListener("resize", resize);
    gsap.ticker.add(tick);
    ScrollTrigger.create({ trigger: "#hero", start: "top bottom", end: "bottom top", onToggle: (s) => (heroVisible = s.isActive) });
  }

  /* ---------------- custom cursor ---------------- */
  if (isFine && !reduced) {
    const c = $("#cursor");
    const xTo = gsap.quickTo(c, "x", { duration: 0.25, ease: "power3" });
    const yTo = gsap.quickTo(c, "y", { duration: 0.25, ease: "power3" });
    addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener("mouseover", (e) => {
      c.classList.toggle("is-hover", !!e.target.closest("a,button,.world,.item,input,select,textarea,#heroMascot"));
    });
    // magnetic buttons
    $$(".magnetic").forEach((b) => {
      const mx = gsap.quickTo(b, "x", { duration: 0.5, ease: "elastic.out(1,.4)" });
      const my = gsap.quickTo(b, "y", { duration: 0.5, ease: "elastic.out(1,.4)" });
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener("mouseleave", () => { mx(0); my(0); });
    });
  }

  /* ---------------- nav ---------------- */
  const nav = $("#nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (s) => {
      const y = s.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > 600 && y > lastY && !$("#mobileMenu").classList.contains("open"));
      lastY = y;
    },
  });
  ["story", "worlds", "shake", "menu", "visit"].forEach((id) => {
    ScrollTrigger.create({
      trigger: "#" + id, start: "top 50%", end: "bottom 50%",
      onToggle: (s) => s.isActive && $$(".nav__links a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id)),
    });
  });
  const burger = $("#burger"), mm = $("#mobileMenu");
  burger.addEventListener("click", () => {
    const open = !mm.classList.contains("open");
    mm.classList.toggle("open", open); burger.classList.toggle("on", open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) gsap.from("#mobileMenu a", { y: 30, opacity: 0, stagger: 0.05, duration: 0.5, delay: 0.2, ease: "power3.out" });
  });
  function closeMobile() {
    if (!mm.classList.contains("open")) return;
    mm.classList.remove("open"); burger.classList.remove("on");
    lenis && lenis.start();
  }

  /* ---------------- bite: split cookie ---------------- */
  if (!reduced) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".bite", start: "top top", end: "bottom bottom", scrub: 0.8 } });
    tl.fromTo(".bite__half", { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "none" })
      .to(".bite__half--r", { xPercent: 42, rotate: 9, duration: 0.7, ease: "power2.inOut" }, 0.15)
      .to(".bite__half--l", { xPercent: -42, rotate: -9, duration: 0.7, ease: "power2.inOut" }, 0.15)
      .fromTo(".bite__text", { opacity: 0, scale: 0.7, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }, 0.4)
      .to(".bite__half", { opacity: 0.25, duration: 0.3 }, 0.75);
  }

  /* ---------------- story words ---------------- */
  const sw = $("#storyWords");
  sw.innerHTML = sw.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span> `).join("");
  if (!reduced) {
    gsap.to("#storyWords .w", {
      opacity: 1, stagger: 0.05, ease: "none",
      scrollTrigger: { trigger: "#storyWords", start: "top 80%", end: "bottom 45%", scrub: true },
    });
    gsap.from(".story__mascot img", { rotate: -14, y: 80, opacity: 0, ease: "back.out(1.4)", duration: 1.2, scrollTrigger: { trigger: ".story", start: "top 70%" } });
  } else $$("#storyWords .w").forEach((w) => (w.style.opacity = 1));
  $$("[data-count]").forEach((el) => {
    const o = { v: 0 }, to = +el.dataset.count;
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  /* ---------------- worlds (horizontal scroll) ---------------- */
  const track = $("#worldsTrack");
  track.innerHTML =
    MENU.map(
      (c, i) => `
    <article class="world" data-cat="${c.id}">
      <img src="${c.img}" alt="${c.name}" loading="lazy">
      <span class="world__num">${String(i + 1).padStart(2, "0")} / ${String(MENU.length).padStart(2, "0")}</span>
      <span class="world__emoji" aria-hidden="true">${c.emoji}</span>
      <div class="world__body">
        <h3>${c.name}</h3>
        <p>${c.tagline}</p>
        <div class="world__meta"><small>${c.items.length} أصناف · من ${Math.min(...c.items.map((x) => x.price))} ج.م</small>
          <button class="btn btn--gold btn--sm" data-goto="${c.id}">ادخل العالم ←</button></div>
      </div>
    </article>`
    ).join("") +
    `<article class="world world--end"><div>
      <img src="assets/img/mascot-shake.webp" alt="" loading="lazy">
      <h3>ما زلت جائعًا؟<br>طبيعي جدًا.</h3>
      <a href="#menu" class="btn btn--gold btn--sm" data-scroll>المنيو الكامل</a></div></article>`;
  track.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]");
    if (!b) return;
    setCat(b.dataset.goto);
    scrollTo("#menu");
  });
  const mmH = gsap.matchMedia();
  mmH.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, {
      x: () => dist(), // RTL: content overflows to the left, so move right
      ease: "none",
      scrollTrigger: {
        trigger: ".worlds", pin: ".worlds__pin", start: "top top", end: () => "+=" + dist(), scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: (s) => ($("#worldsBar").style.width = s.progress * 100 + "%"),
      },
    });
  });
  mmH.add("(max-width: 760px)", () => {
    // mobile: native horizontal swipe
    const pin = $(".worlds__pin");
    pin.style.overflowX = "auto";
    pin.style.scrollSnapType = "x mandatory";
    $$(".world").forEach((w) => (w.style.scrollSnapAlign = "center"));
    const onS = () => ($("#worldsBar").style.width = (Math.abs(pin.scrollLeft) / (pin.scrollWidth - pin.clientWidth || 1)) * 100 + "%");
    pin.addEventListener("scroll", onS, { passive: true });
    return () => pin.removeEventListener("scroll", onS);
  });

  /* ---------------- milkshake frame scrub ---------------- */
  const canvas = $("#shakeCanvas");
  const ctx = canvas.getContext("2d");
  let curFrame = -1;
  const draw = (i) => {
    i = Math.max(0, Math.min(FRAMES - 1, i));
    let im = frames[i];
    // fall back to nearest loaded frame
    if (!im || !im.complete || !im.naturalWidth) {
      for (let d = 1; d < FRAMES; d++) {
        const a = frames[i - d], b = frames[i + d];
        if (a && a.complete && a.naturalWidth) { im = a; break; }
        if (b && b.complete && b.naturalWidth) { im = b; break; }
      }
    }
    if (!im || !im.naturalWidth) return;
    if (i === curFrame && im === frames[i]) return;
    curFrame = i;
    ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
  };
  const steps = $$("#shakeSteps li");
  const setStep = (p) => {
    const idx = p < 0.3 ? 0 : p < 0.55 ? 1 : p < 0.8 ? 2 : 3;
    steps.forEach((li, k) => li.classList.toggle("is-active", k === idx));
    $("#shakeFinal").classList.toggle("show", p > 0.9);
  };
  const shakeState = { f: 0 };
  ScrollTrigger.create({
    trigger: ".shake", start: "top top", end: "bottom bottom", scrub: true,
    onUpdate: (s) => {
      const p = s.progress;
      gsap.to(shakeState, { f: p * (FRAMES - 1), duration: 0.25, ease: "power1.out", overwrite: true, onUpdate: () => draw(Math.round(shakeState.f)) });
      setStep(p);
      $("#shakeMeter").style.height = p * 100 + "%";
    },
    onEnter: () => draw(Math.round(shakeState.f)),
  });
  if (!reduced) {
    gsap.fromTo(".shake__bgword", { xPercent: -30 }, { xPercent: 10, ease: "none", scrollTrigger: { trigger: ".shake", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".shake__canvas-wrap", { scale: 0.85, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".shake", start: "top 70%" } });
  }
  // draw first frame as soon as it exists
  const waitFirst = setInterval(() => { if (frames[0] && frames[0].naturalWidth) { draw(0); clearInterval(waitFirst); } }, 120);

  /* ---------------- drips ---------------- */
  if (!reduced) {
    gsap.from(".drip-top", { scaleY: 0.2, transformOrigin: "top", ease: "none", scrollTrigger: { trigger: ".menu", start: "top bottom", end: "top 40%", scrub: true } });
  }

  /* ---------------- menu ---------------- */
  const cart = new Map(JSON.parse(localStorage.getItem("cookies-cart") || "[]"));
  let curCat = MENU[0].id;
  const tabs = $("#tabs");
  tabs.innerHTML = MENU.map(
    (c) => `<button class="tab" role="tab" data-cat="${c.id}" aria-selected="${c.id === curCat}"><span aria-hidden="true">${c.emoji}</span>${c.short}<span class="cnt">${c.items.length}</span></button>`
  ).join("");
  tabs.addEventListener("click", (e) => {
    const t = e.target.closest(".tab");
    if (t) setCat(t.dataset.cat, true);
  });

  const qtyHTML = (id) => {
    const n = cart.get(id) || 0;
    return `<div class="qty ${n ? "has" : ""}" data-id="${id}">
      <button class="sub" aria-label="إنقاص">−</button><span class="n">${n}</span><button class="add" aria-label="إضافة">+</button></div>`;
  };

  function renderItems(animate) {
    const c = MENU.find((x) => x.id === curCat);
    $("#items").innerHTML = c.items
      .map(
        (i) => `<li class="item" id="item-${i.id}">
        <div class="item__name">${i.name}</div>
        <p class="item__desc">${i.desc}</p>
        <div class="item__side"><span class="item__price">${i.price}<small>ج.م</small></span>${qtyHTML(i.id)}</div>
      </li>`
      )
      .join("");
    if (animate && !reduced) gsap.from("#items .item", { y: 30, opacity: 0, rotateX: -25, transformOrigin: "top", stagger: 0.05, duration: 0.6, ease: "power3.out" });
  }
  function setCat(id, animate) {
    if (!MENU.find((x) => x.id === id)) return;
    curCat = id;
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.cat === id));
    const c = MENU.find((x) => x.id === id);
    const img = $("#menuImg");
    const swap = () => { img.src = c.img; img.alt = c.name; $("#menuCatName").textContent = c.name; $("#menuCatTag").textContent = c.tagline; };
    if (animate && !reduced) {
      gsap.timeline()
        .to(img, { scale: 1.08, opacity: 0, duration: 0.25, ease: "power2.in", onComplete: swap })
        .to(img, { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" });
    } else swap();
    renderItems(animate);
    const tab = $(`.tab[data-cat="${id}"]`);
    if (tab) {
      const box = tabs.getBoundingClientRect(), r = tab.getBoundingClientRect();
      tabs.scrollBy({ left: r.left + r.width / 2 - (box.left + box.width / 2), behavior: "smooth" });
    }
  }
  setCat(curCat);
  if (!reduced) {
    ScrollTrigger.create({ trigger: "#items", start: "top 85%", once: true, onEnter: () => renderItems(true) });
    gsap.from(".menu__visual", { clipPath: "inset(20% 20% 20% 20% round 28px)", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".menu__body", start: "top 80%" } });
  }

  // qty clicks anywhere
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { changeQty(add.dataset.add, 1, add); return; }
    const q = e.target.closest(".qty");
    if (!q) return;
    if (e.target.closest(".add")) changeQty(q.dataset.id, 1, e.target);
    else if (e.target.closest(".sub")) changeQty(q.dataset.id, -1);
  });

  function changeQty(id, d, srcEl) {
    const n = Math.max(0, (cart.get(id) || 0) + d);
    n ? cart.set(id, n) : cart.delete(id);
    localStorage.setItem("cookies-cart", JSON.stringify([...cart]));
    $$(`.qty[data-id="${id}"]`).forEach((q) => { q.classList.toggle("has", n > 0); q.querySelector(".n").textContent = n; });
    updateCart();
    if (d > 0) {
      nav.classList.remove("is-hidden");
      const btn = $("#cartBtn");
      btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
      if (srcEl && !reduced) flyToCart(srcEl);
      const lines = ["تمت الإضافة! اختيار موفّق 👌", "أضفناه. معدتك تشكرك.", "في السلة! كوكي فخورٌ بك 👑", "تمام! هل نضيف كوكيز بجانبه؟"];
      toast(`${ITEMS[id].name}: ${lines[(Math.random() * lines.length) | 0]}`);
    }
  }
  function flyToCart(el) {
    const a = el.getBoundingClientRect(), b = $("#cartBtn").getBoundingClientRect();
    const dot = document.createElement("span");
    dot.style.cssText = `position:fixed;z-index:130;left:${a.left + a.width / 2 - 14}px;top:${a.top + a.height / 2 - 14}px;width:28px;height:28px;border-radius:50%;background:url(assets/img/cookie-top.jpg) center/180%;box-shadow:0 0 0 2px #ffc21a;pointer-events:none`;
    document.body.appendChild(dot);
    gsap.timeline({ onComplete: () => dot.remove() })
      .to(dot, { x: (b.left - a.left) / 2, y: -80, rotate: 180, duration: 0.35, ease: "power2.out" })
      .to(dot, { x: b.left - a.left - a.width / 2 + 9, y: b.top - a.top - a.height / 2 + 9, scale: 0.4, rotate: 360, duration: 0.45, ease: "power2.in" });
  }

  /* ---------------- roulette ---------------- */
  $("#roulette").addEventListener("click", () => {
    const r = $("#roulette");
    if (r.classList.contains("spinning")) return;
    r.classList.add("spinning");
    const all = Object.values(ITEMS);
    const pick = all[(Math.random() * all.length) | 0];
    toast("الكوكيز تفكّر… 🤔");
    setTimeout(() => {
      r.classList.remove("spinning");
      setCat(pick.cat, true);
      setTimeout(() => {
        const el = $("#item-" + pick.id);
        if (el) {
          (lenis ? lenis.scrollTo(el, { offset: -160 }) : el.scrollIntoView({ block: "center", behavior: "smooth" }));
          el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
        }
        toast(`الكوكيز اختارت لك: ${pick.name} 🎯`);
      }, 450);
    }, 1200);
  });

  /* ---------------- mood picker ---------------- */
  $("#moods").innerHTML = MOODS.map((m) => `<button class="moodc" data-m="${m.id}"><span>${m.icon}</span>${m.label}</button>`).join("");
  let moodPick = null;
  $("#moods").addEventListener("click", (e) => {
    const b = e.target.closest(".moodc");
    if (!b) return;
    $$(".moodc").forEach((x) => x.classList.toggle("on", x === b));
    const m = MOODS.find((x) => x.id === b.dataset.m);
    moodPick = m.pick;
    const it = ITEMS[m.pick];
    $("#moodLine").textContent = m.line;
    $("#moodItem").textContent = it.name;
    $("#moodPrice").textContent = money(it.price);
    const res = $("#moodResult");
    res.hidden = false;
    if (!reduced) {
      gsap.fromTo(".mood__bubble", { scale: 0.7, opacity: 0, rotate: -3 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.6, ease: "back.out(2)" });
      gsap.fromTo(".mood__mascot", { y: 40, rotate: 15 }, { y: 0, rotate: 0, duration: 0.8, ease: "elastic.out(1,.5)" });
    }
  });
  $("#moodAdd").addEventListener("click", (e) => moodPick && changeQty(moodPick, 1, e.currentTarget));
  if (!reduced) gsap.from(".moodc", { y: 40, opacity: 0, stagger: 0.06, duration: 0.7, ease: "back.out(1.6)", scrollTrigger: { trigger: "#moods", start: "top 85%" } });

  /* ---------------- cart drawer ---------------- */
  const drawer = $("#drawer"), scrim = $("#scrim");
  const openDrawer = () => { drawer.classList.add("on"); scrim.classList.add("on"); drawer.setAttribute("aria-hidden", "false"); lenis && lenis.stop(); };
  function closeDrawer() { drawer.classList.remove("on"); scrim.classList.remove("on"); drawer.setAttribute("aria-hidden", "true"); lenis && lenis.start(); }
  $("#cartBtn").addEventListener("click", openDrawer);
  $("#drawerClose").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  addEventListener("keydown", (e) => e.key === "Escape" && (closeDrawer(), closeMobile()));

  function updateCart() {
    let count = 0, total = 0;
    const rows = [];
    cart.forEach((n, id) => {
      const it = ITEMS[id];
      if (!it) return;
      count += n; total += n * it.price;
      rows.push(`<li class="cart-row"><b>${it.name}</b><span class="line">${money(n * it.price)}</span>${qtyHTML(id)}</li>`);
    });
    $("#cartList").innerHTML = rows.join("");
    $("#cartCount").textContent = count;
    $("#cartBtn").classList.toggle("has-items", count > 0);
    $("#cartTotal").textContent = money(total);
    $("#drawerSub").textContent = count ? `${count} ${count === 1 ? "صنف" : count <= 10 ? "أصناف" : "صنفًا"} · لذيذ جدًا` : "لا شيء بعد… والكوكيز حزينة";
    drawer.classList.toggle("empty", count === 0);
    return { count, total };
  }
  updateCart();

  let otype = "استلام من الكافيه";
  $("#otype").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    otype = b.dataset.t;
    $$("#otype button").forEach((x) => x.classList.toggle("on", x === b));
    $("#addrField").hidden = otype !== "توصيل";
  });

  const orderText = () => {
    const lines = [];
    let total = 0;
    cart.forEach((n, id) => { const it = ITEMS[id]; total += n * it.price; lines.push(`• ${n} × ${it.name} — ${n * it.price} ج.م`); });
    const name = $("#cName").value.trim(), phone = $("#cPhone").value.trim(), addr = $("#cAddr").value.trim(), notes = $("#cNotes").value.trim();
    return [
      "مرحبًا كوكيز كافيه 👋🍪",
      "أريد أن أطلب (طلب مسبق):",
      "",
      ...lines,
      "",
      `الإجمالي: ${total} ج.م`,
      `نوع الطلب: ${otype}`,
      name && `الاسم: ${name}`,
      phone && `الموبايل: ${phone}`,
      otype === "توصيل" && addr && `العنوان: ${addr}`,
      notes && `ملاحظات: ${notes}`,
    ].filter((x) => x !== false && x !== undefined && x !== null && x !== 0).join("\n");
  };
  const validName = (inp) => {
    const ok = inp.value.trim().length >= 2;
    inp.classList.toggle("err", !ok);
    if (!ok) { inp.focus(); toast("اكتب اسمك أولًا، حتى نعرف لمن الكوكيز 😄"); }
    return ok;
  };
  $("#sendWa").addEventListener("click", () => {
    if (!cart.size || !validName($("#cName"))) return;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(orderText())}`, "_blank", "noopener");
  });
  $("#sendMail").addEventListener("click", () => {
    if (!cart.size || !validName($("#cName"))) return;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("طلب جديد — كوكيز كافيه")}&body=${encodeURIComponent(orderText())}`;
  });

  /* ---------------- reservation ---------------- */
  let guests = "2";
  $("#guests").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    guests = b.textContent.trim();
    $$("#guests button").forEach((x) => x.classList.toggle("on", x === b));
  });
  const today = new Date();
  $("#rDate").min = today.toISOString().slice(0, 10);
  const resText = () => {
    const f = (id) => $(id).value.trim();
    return [
      "مرحبًا كوكيز كافيه 👋",
      "أريد حجز طاولة:",
      `الاسم: ${f("#rName")}`,
      `الموبايل: ${f("#rPhone")}`,
      f("#rDate") && `التاريخ المفضّل: ${f("#rDate")}`,
      f("#rTime") && `الوقت: ${f("#rTime")}`,
      `عدد الأشخاص: ${guests}`,
      `المناسبة: ${f("#rOcc")}`,
      f("#rNotes") && `ملاحظات: ${f("#rNotes")}`,
    ].filter(Boolean).join("\n");
  };
  const validRes = () => {
    const n = $("#rName"), p = $("#rPhone");
    const okN = n.value.trim().length >= 2;
    const okP = /^[0-9+\s-]{8,}$/.test(p.value.trim());
    n.classList.toggle("err", !okN); p.classList.toggle("err", !okP);
    if (!okN || !okP) { $("#reserveMsg").style.color = "#ff9a7a"; $("#reserveMsg").textContent = "نحتاج الاسم ورقم الموبايل فقط، ونعدك ألا نرسل لك إلا ما يسرّك."; return false; }
    $("#reserveMsg").style.color = ""; $("#reserveMsg").textContent = "";
    return true;
  };
  $("#reserveForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validRes()) return;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(resText())}`, "_blank", "noopener");
    $("#reserveMsg").textContent = "رائع! أكمل الإرسال في واتساب وسنؤكد حجزك قريبًا ✨";
  });
  $("#reserveEmail").addEventListener("click", () => {
    if (!validRes()) return;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("حجز طاولة — كوكيز كافيه")}&body=${encodeURIComponent(resText())}`;
  });
  $("#notifyBtn").addEventListener("click", () => {
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent("مرحبًا كوكيز كافيه 👋\nأرجو تذكيري بموعد الافتتاح، لا أريد أن تفوتني أول كوكيز! 🍪")}`, "_blank", "noopener");
  });

  /* ---------------- visit reveals ---------------- */
  if (!reduced) {
    gsap.to(".visit__media img", { yPercent: -15, ease: "none", scrollTrigger: { trigger: ".visit", start: "top bottom", end: "top top", scrub: true } });
    gsap.from(".visit__stamp", { scale: 0, rotate: -120, duration: 1, ease: "back.out(1.8)", scrollTrigger: { trigger: ".visit", start: "top 70%" } });
    gsap.from(".reserve", { y: 80, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".reserve", start: "top 90%" } });
    gsap.from(".footer__big > *", { yPercent: 100, opacity: 0, stagger: 0.15, duration: 1, ease: "power4.out", scrollTrigger: { trigger: ".footer", start: "top 85%" } });
    $$(".h2").forEach((h) => gsap.from(h, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 88%" } }));
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();

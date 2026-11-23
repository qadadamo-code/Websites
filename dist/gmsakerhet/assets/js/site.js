/* GMS Säkerhet — interactions */
(function () {
  "use strict";
  var d = document, w = window, html = d.documentElement;
  var reduced = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  html.classList.add("js");
  if (reduced) html.classList.add("reduced");
  var hasG = !!w.gsap;
  if (hasG && w.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- clock (Umeå / Stockholm time) ---------- */
  function stockholm() {
    try {
      var p = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { h: +o.hour % 24, m: +o.minute, s: +o.second };
    } catch (e) { var n = new Date(); return { h: n.getHours(), m: n.getMinutes(), s: n.getSeconds() }; }
  }
  var clocks = d.querySelectorAll("[data-clock]");
  var heroHand = d.querySelector(".dial .hand");
  function tick() {
    var t = stockholm(), s = (t.h < 10 ? "0" : "") + t.h + ":" + (t.m < 10 ? "0" : "") + t.m;
    clocks.forEach(function (c) { c.textContent = s; });
    if (heroHand) heroHand.style.transform = "rotate(" + ((t.h + t.m / 60 + t.s / 3600) * 15) + "deg)";
  }
  tick(); setInterval(tick, 1000);

  /* ---------- header ---------- */
  var hdr = d.getElementById("hdr");
  function onScroll() { if (hdr) hdr.classList.toggle("is-s", w.scrollY > 30); }
  w.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var burger = d.querySelector(".burger"), mnav = d.getElementById("mnav");
  if (burger && mnav) burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open); mnav.hidden = !open;
    d.body.style.overflow = open ? "hidden" : "";
    if (open && hasG && !reduced) gsap.from(mnav.querySelectorAll("nav a"), { y: 40, opacity: 0, stagger: .05, duration: .6, ease: "power3.out" });
  });

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (w.Lenis && !reduced) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    if (hasG) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(); }
  }
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = d.querySelector(a.getAttribute("href"));
      if (!t) return; e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -70 }); else t.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- night city canvas ---------- */
  function City(cv) {
    var ctx = cv.getContext("2d"), W, H, dpr, bld = [], snow = [], stars = [], mx = -999, my = -999, tx = -999, ty = -999, t0 = performance.now();
    var hero = cv.parentElement, isHero = hero.classList.contains("hero");
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function build() {
      dpr = Math.min(w.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bld = []; snow = []; stars = [];
      var layers = [{ y: .58, hmin: .12, hmax: .3, c: "#141518", win: .25 }, { y: .7, hmin: .1, hmax: .34, c: "#0f1013", win: .4 }, { y: .84, hmin: .08, hmax: .28, c: "#09090b", win: .55 }];
      layers.forEach(function (L, li) {
        var x = -20;
        while (x < W + 20) {
          var bw = rnd(40, 120) * (1 + li * .25), bh = rnd(L.hmin, L.hmax) * H, top = H * L.y - bh + li * 18;
          var wins = [], cols = Math.max(1, Math.floor(bw / 22)), rows = Math.floor(bh / 26);
          for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) if (Math.random() < L.win * .55) wins.push({ x: x + 8 + c * ((bw - 12) / cols), y: top + 14 + r * 26, on: Math.random() < .55, f: Math.random() });
          bld.push({ x: x, w: bw, top: top, c: L.c, wins: wins, li: li, ant: Math.random() < .12 });
          x += bw + rnd(2, 16);
        }
      });
      var n = Math.min(160, Math.floor(W * H / 9000));
      for (var i = 0; i < n; i++) snow.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(.6, 2.2), s: rnd(.25, .9), o: rnd(.2, .7) });
      for (var j = 0; j < 90; j++) stars.push({ x: rnd(0, W), y: rnd(0, H * .45), r: rnd(.3, 1.2), f: Math.random() * 6 });
    }
    function draw(now) {
      var t = (now - t0) / 1000;
      tx += (mx - tx) * .12; ty += (my - ty) * .12;
      ctx.clearRect(0, 0, W, H);
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#05070b"); g.addColorStop(.55, "#0d1118"); g.addColorStop(1, "#0b0b0c");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // aurora
      ctx.save(); ctx.globalCompositeOperation = "screen";
      for (var a = 0; a < 3; a++) {
        var ag = ctx.createLinearGradient(0, H * .05, 0, H * .5);
        ag.addColorStop(0, "rgba(110,140,190,0)"); ag.addColorStop(.5, "rgba(110,140,190," + (.06 - a * .012) + ")"); ag.addColorStop(1, "rgba(110,140,190,0)");
        ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(0, H * .5);
        for (var x = 0; x <= W; x += 30) ctx.lineTo(x, H * (.18 + a * .06) + Math.sin(x / 220 + t * .25 + a * 2) * 40 + Math.sin(x / 90 + t * .4) * 12);
        ctx.lineTo(W, H * .5); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      stars.forEach(function (s) { ctx.fillStyle = "rgba(230,240,235," + (.25 + .35 * Math.sin(t * 1.5 + s.f)) + ")"; ctx.fillRect(s.x, s.y, s.r, s.r); });
      // buildings
      bld.forEach(function (b) {
        ctx.fillStyle = b.c; ctx.fillRect(b.x, b.top, b.w, H - b.top); ctx.fillStyle = "rgba(255,204,0," + (.05 + b.li * .03) + ")"; ctx.fillRect(b.x, b.top, b.w, 1);
        if (b.ant) { ctx.fillStyle = b.c; ctx.fillRect(b.x + b.w / 2 - 1, b.top - 26, 2, 26); ctx.fillStyle = "rgba(255,80,60," + (Math.sin(t * 3 + b.x) > .3 ? .9 : .15) + ")"; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.top - 27, 2, 0, 7); ctx.fill(); }
        b.wins.forEach(function (wi) {
          var dx = wi.x - tx, dy = wi.y - ty, dist = Math.sqrt(dx * dx + dy * dy), lit = dist < 230 ? 1 - dist / 230 : 0;
          var base = wi.on ? .35 + .25 * Math.sin(t * .3 + wi.f * 9) : .04;
          var o = Math.min(1, base + lit * .9);
          if (o < .05) return;
          ctx.fillStyle = lit > .1 ? "rgba(255,226,168," + o + ")" : (wi.f > .82 ? "rgba(170,200,255," + o * .7 + ")" : "rgba(255,214,150," + o * .75 + ")");
          ctx.fillRect(wi.x, wi.y, 6, 8);
        });
      });
      // snow
      ctx.fillStyle = "#fff";
      snow.forEach(function (s) {
        s.y += s.s; s.x += Math.sin(t + s.y / 50) * .3;
        if (s.y > H) { s.y = -4; s.x = Math.random() * W; }
        var dx = s.x - tx, dy = s.y - ty, near = Math.sqrt(dx * dx + dy * dy) < 220;
        ctx.globalAlpha = near ? Math.min(1, s.o + .4) : s.o * .6;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    var running = true, raf;
    function loop(now) { if (running) draw(now); raf = requestAnimationFrame(loop); }
    build();
    if (reduced) { draw(performance.now()); } else raf = requestAnimationFrame(loop);
    var rz; w.addEventListener("resize", function () { if (Math.abs(cv.clientWidth - W) < 2) return; clearTimeout(rz); rz = setTimeout(build, 200); });
    if ("IntersectionObserver" in w) new IntersectionObserver(function (e) { running = e[0].isIntersecting; }).observe(cv);
    var beam = hero.querySelector(".hero-beam");
    function setP(x, y) {
      var r = cv.getBoundingClientRect(); mx = x - r.left; my = y - r.top;
      if (beam) { beam.style.setProperty("--mx", mx + "px"); beam.style.setProperty("--my", my + "px"); }
    }
    hero.addEventListener("pointermove", function (e) { setP(e.clientX, e.clientY); });
    // idle sweep of the "flashlight" when no pointer (touch devices)
    if (isHero && !reduced) {
      var idle = true; hero.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") idle = false; });
      (function sweep() {
        if (idle) { var tt = performance.now() / 1000, r = cv.getBoundingClientRect(); setP(r.left + W * (.55 + .3 * Math.sin(tt * .5)), r.top + H * (.45 + .12 * Math.sin(tt * .8))); }
        requestAnimationFrame(sweep);
      })();
    } else { mx = tx = W * .7; my = ty = H * .45; }
  }
  d.querySelectorAll(".hero-city").forEach(function (cv) { try { City(cv); } catch (e) { } });

  /* ---------- split words ---------- */
  d.querySelectorAll(".split").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map(function (x) { return '<span class="w" aria-hidden="true"><span>' + x + "</span></span>"; }).join(" ");
  });

  /* ---------- intro ---------- */
  var intro = d.getElementById("intro");
  function heroIn() {
    if (!hasG || reduced) return;
    var tl = gsap.timeline();
    tl.from(".hero-h .ln>span", { yPercent: 110, duration: 1.1, stagger: .12, ease: "power4.out" })
      .from(".hero-k", { opacity: 0, x: -20, duration: .7 }, "-=.8")
      .from(".hero-sub,.hero-cta", { opacity: 0, y: 24, duration: .8, stagger: .1 }, "-=.6")
      .from(".hero-side", { opacity: 0, scale: .9, duration: 1.2, ease: "power3.out" }, "-=1")
      .from(".hdr", { y: -30, opacity: 0, duration: .7 }, "-=1");
  }
  var seen = false; try { seen = sessionStorage.getItem("gms-intro") === "1"; } catch (e) { }
  if (intro && hasG && !reduced && !seen) {
    try { sessionStorage.setItem("gms-intro", "1"); } catch (e) { }
    d.body.style.overflow = "hidden";
    var L = intro.querySelector(".intro-logo");
    var tl = gsap.timeline({ onComplete: function () { intro.remove(); d.body.style.overflow = ""; } });
    gsap.set(".io-outer", { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(".io-inner", { opacity: 0, scale: .6, transformOrigin: "50% 50%" });
    gsap.set(".io-band", { strokeDasharray: 80, strokeDashoffset: 80 });
    gsap.set(".io-gms tspan", { opacity: 0 });
    tl.to(".ir1", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" })
      .from(".intro-ring .tk", { opacity: 0, stagger: .02, duration: .2 }, 0)
      .to(".intro-ring", { rotate: 90, duration: 2.6, ease: "power2.inOut" }, 0)
      .to(".io-outer", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, .2)
      .to(".io-inner", { opacity: 1, scale: 1, duration: .7, ease: "back.out(1.6)" }, 1.0)
      .to(".io-band", { strokeDashoffset: 0, duration: .5, stagger: .12, ease: "power2.out" }, 1.35)
      .from(".io-base", { scaleX: 0, transformOrigin: "50% 50%", duration: .5, ease: "power3.out" }, 1.4)
      .to(".io-gms tspan", { opacity: 1, duration: .05, stagger: .14 }, 1.5)
      .from(".io-sub", { opacity: 0, letterSpacing: 2, duration: .8, ease: "power3.out" }, 1.85)
      .fromTo(".intro-scan", { y: 0 }, { y: "160vh", duration: 1.1, ease: "power2.inOut" }, 1.2)
      .to(".intro-ring", { scale: 1.6, opacity: 0, duration: .8, ease: "power3.in" }, 2.7)
      .to(L, { scale: .6, opacity: 0, y: -30, duration: .6, ease: "power3.in" }, 2.8)
      .to(intro, { clipPath: "inset(0 0 100% 0)", duration: .9, ease: "power4.inOut" }, 3.05)
      .add(heroIn, 3.25);
  } else {
    if (intro) intro.remove();
    heroIn();
  }

  if (!hasG || reduced || !w.ScrollTrigger) return;

  /* ---------- reveals ---------- */
  d.querySelectorAll(".split").forEach(function (el) {
    gsap.from(el.querySelectorAll(".w>span"), { yPercent: 110, duration: 1, stagger: .05, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  gsap.utils.toArray(".lead,.kicker,.svc,.val,.proc-list li,.facts li,.faq-l details,.ccards li,.cform,.srow,.pts li,.ab,.jb-c,.sv-side,.towns li,.jobs-in>*").forEach(function (el) {
    if (el.closest(".hero")) return;
    gsap.from(el, { opacity: 0, y: 34, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  gsap.from(".radar", { opacity: 0, scale: .85, rotate: -20, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: ".radar", start: "top 85%" } });

  /* hero parallax out */
  if (d.querySelector(".hero")) {
    gsap.to(".hero-in", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-side", { rotate: 40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* field gallery drifts sideways with scroll */
  var ft = d.querySelector(".field-track");
  if (ft) gsap.fromTo(ft, { x: function () { return 0; } }, { x: function () { return -(ft.scrollWidth - w.innerWidth); }, ease: "none",
    scrollTrigger: { trigger: ".field", start: "top bottom", end: "bottom top", scrub: .6, invalidateOnRefresh: true } });

  /* ---------- night shift pinned timeline ---------- */
  var shift = d.querySelector(".shift");
  if (shift) {
    var items = gsap.utils.toArray(".sh"), n = items.length, hand = d.querySelector(".sd-hand"), arc = d.querySelector(".sd-arc"), tEl = d.querySelector(".sd-time");
    var hours = items.map(function (el) { var p = el.dataset.t.split(":"); var h = +p[0] + p[1] / 60; return h < 12 ? h + 24 : h; });
    var cur = 0;
    function show(i) {
      if (i === cur) return;
      gsap.to(items[cur], { opacity: 0, y: i > cur ? -24 : 24, duration: .45, ease: "power2.in" });
      gsap.fromTo(items[i], { opacity: 0, y: i > cur ? 24 : -24 }, { opacity: 1, y: 0, duration: .6, ease: "power3.out", delay: .1 });
      cur = i;
    }
    ScrollTrigger.create({
      trigger: shift, start: "top top", end: "+=" + (n * 70) + "%", pin: ".shift-pin", scrub: true,
      onUpdate: function (st) {
        var p = st.progress, f = p * (n - 1), i = Math.min(n - 1, Math.round(f));
        var lo = Math.floor(f), hi = Math.min(n - 1, lo + 1), h = hours[lo] + (hours[hi] - hours[lo]) * (f - lo);
        hand.style.transform = "rotate(" + (h * 15) + "deg)";
        var span = (h - hours[0]) / 24; arc.style.strokeDasharray = span + " 1";
        arc.style.transform = "rotate(" + (hours[0] * 15 - 90) + "deg)";
        var hh = Math.floor(h) % 24, mm = Math.floor((h % 1) * 60);
        tEl.textContent = (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
        show(i);
      }
    });
  }

  /* facts count-up for numeric-only values */
  d.querySelectorAll("[data-count]").forEach(function (el) {
    var txt = el.textContent, m = txt.match(/^(\d+)(.*)$/);
    if (!m || m[2] === "/7") return;
    var o = { v: 0 }, end = +m[1], from = end > 1000 ? end - 30 : 0;
    o.v = from;
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 1.6, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v) + m[2]; } });
    } });
  });

  /* team values highlight */
  gsap.utils.toArray(".team-v li").forEach(function (li) {
    ScrollTrigger.create({ trigger: li, start: "top 65%", end: "bottom 45%", toggleClass: "on" });
  });
})();

/* service-card glow + form (no GSAP needed) */
(function () {
  document.querySelectorAll(".svc").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--x", (e.clientX - r.left) + "px"); c.style.setProperty("--y", (e.clientY - r.top) + "px"); });
  });
  document.querySelectorAll(".cform").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = f.querySelector(".fmsg"), btn = f.querySelector("button[type=submit]");
      btn.disabled = true; msg.className = "fmsg"; msg.textContent = "…";
      fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (!j.ok) throw 0; msg.className = "fmsg ok"; msg.textContent = f.dataset.ok; f.reset(); })
        .catch(function () { msg.className = "fmsg err"; msg.textContent = f.dataset.err; })
        .finally(function () { btn.disabled = false; });
    });
  });
})();

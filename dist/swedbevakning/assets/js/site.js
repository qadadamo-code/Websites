/* Swedbevakning — interactions */
(function () {
  "use strict";
  var d = document, w = window, html = d.documentElement;
  var reduced = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  html.classList.add("js");
  if (reduced) html.classList.add("reduced");
  var hasG = !!w.gsap, hasST = hasG && !!w.ScrollTrigger;
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Stockholm clock ---------- */
  function sthlm() {
    try {
      var p = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return o.hour.replace("24", "00") + ":" + o.minute;
    } catch (e) { var n = new Date(); return ("0" + n.getHours()).slice(-2) + ":" + ("0" + n.getMinutes()).slice(-2); }
  }
  var clocks = d.querySelectorAll("[data-clock]");
  function tick() { var s = sthlm(); clocks.forEach(function (c) { c.textContent = s; }); }
  tick(); setInterval(tick, 15000);

  /* ---------- header ---------- */
  var hdr = d.getElementById("hdr"), darkTop = !!d.querySelector(".hero,.phero");
  if (!darkTop && hdr) hdr.classList.add("on-light");
  function onScroll() { if (hdr) hdr.classList.toggle("is-s", w.scrollY > 40); }
  w.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var burger = d.querySelector(".burger"), mnav = d.getElementById("mnav");
  if (burger && mnav) burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open); mnav.hidden = !open;
    d.body.style.overflow = open ? "hidden" : "";
    hdr.classList.toggle("menu-open", open);
    if (open && hasG && !reduced) gsap.from(mnav.querySelectorAll("nav a"), { y: 40, opacity: 0, stagger: .05, duration: .6, ease: "power3.out" });
  });

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (w.Lenis && !reduced) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    if (hasST) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
  }
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href"); if (id.length < 2) return;
      var t = d.querySelector(id); if (!t) return; e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -70 }); else t.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- hero searchlight ---------- */
  var hero = d.querySelector(".hero");
  if (hero) {
    var mx = .7, my = .45, tx = mx, ty = my, idle = true;
    hero.addEventListener("pointermove", function (e) {
      if (e.pointerType === "mouse") idle = false;
      var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height;
    });
    var run = true;
    if ("IntersectionObserver" in w) new IntersectionObserver(function (e) { run = e[0].isIntersecting; }).observe(hero);
    (function loop(now) {
      if (run) {
        if (idle && !reduced) { var t = now / 1000; tx = .62 + .26 * Math.sin(t * .45); ty = .42 + .14 * Math.sin(t * .7); }
        mx += (tx - mx) * .08; my += (ty - my) * .08;
        hero.style.setProperty("--mx", (mx * 100).toFixed(2) + "%"); hero.style.setProperty("--my", (my * 100).toFixed(2) + "%");
      }
      requestAnimationFrame(loop);
    })(0);
  }

  /* ---------- service tabs ---------- */
  d.querySelectorAll(".svx").forEach(function (box) {
    var tabs = box.querySelectorAll(".svx-tab"), panels = box.querySelectorAll(".svx-p"), timer;
    function act(i) {
      tabs.forEach(function (t, j) { t.classList.toggle("on", i === j); t.setAttribute("aria-selected", i === j); });
      panels.forEach(function (p, j) { p.classList.toggle("on", i === j); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { act(i); });
      t.addEventListener("mouseenter", function () { clearTimeout(timer); timer = setTimeout(function () { act(i); }, 120); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); var n = (i + (e.key === "ArrowDown" ? 1 : -1) + tabs.length) % tabs.length; tabs[n].focus(); act(n); }
      });
    });
  });

  /* ---------- split words ---------- */
  d.querySelectorAll(".split").forEach(function (el) {
    var txt = el.textContent.trim();
    el.setAttribute("aria-label", txt);
    el.innerHTML = txt.split(/\s+/).map(function (x) { return '<span class="w" aria-hidden="true"><span>' + x + "</span></span>"; }).join(" ");
  });

  /* ---------- intro: logo assembles, then the eagle's eye opens the hero ---------- */
  var intro = d.getElementById("intro");
  function heroIn() {
    if (!hasG || reduced || !hero) return;
    gsap.timeline()
      .from(".hero-h .ln>span", { yPercent: 110, duration: 1.15, stagger: .12, ease: "power4.out" })
      .from(".hero-k", { opacity: 0, y: 14, duration: .7 }, "-=.9")
      .from(".hero-sub,.hero-cta,.hero-meta", { opacity: 0, y: 24, duration: .8, stagger: .1 }, "-=.7")
      .from(".hero-mk", { opacity: 0, scale: .92, rotate: -4, duration: 1.6, ease: "power3.out" }, 0)
      .from(".hdr", { y: -24, opacity: 0, duration: .7 }, "-=1.2");
  }
  var seen = false; try { seen = sessionStorage.getItem("sb-intro") === "1"; } catch (e) { }
  if (intro && hasG && !reduced && !seen) {
    try { sessionStorage.setItem("sb-intro", "1"); } catch (e) { }
    d.body.style.overflow = "hidden";
    var letters = intro.querySelectorAll(".il-text tspan");
    gsap.set(".ic-rect", { scaleY: 0 });
    gsap.set(letters, { opacity: 0 });
    gsap.set(".intro-word b,.intro-word span", { opacity: 0, y: 14 });
    var tl = gsap.timeline({ onComplete: function () { intro.remove(); d.body.style.overflow = ""; } });
    tl.to(".il-ring", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0)
      .to(".il-edge", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, .25)
      .to(".ic-rect", { scaleY: 1, duration: .9, ease: "power3.inOut" }, .95)
      .to(".il-edge", { opacity: 0, duration: .4 }, 1.7)
      .to(letters, { opacity: 1, duration: .04, stagger: .045 }, 1.45)
      .fromTo(".il-glint", { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1.4, duration: .25, yoyo: true, repeat: 1, ease: "power2.out" }, 2.05)
      .to(".intro-word b", { opacity: 1, y: 0, duration: .7, ease: "power3.out" }, 1.6)
      .to(".intro-word span", { opacity: 1, y: 0, duration: .7, ease: "power3.out" }, 1.8)
      .fromTo(".intro-line", { y: 0 }, { y: "100vh", duration: 1.4, ease: "power2.inOut" }, .2)
      .to(".intro-word", { opacity: 0, y: 20, duration: .4, ease: "power2.in" }, 2.75)
      /* dive into the eagle's eye */
      .to(".intro-logo", { scale: 14, transformOrigin: "50% 42%", duration: 1, ease: "power3.in" }, 2.85)
      .to(intro, { opacity: 0, duration: .45, ease: "power1.in" }, 3.4)
      .add(heroIn, 3.3);
  } else {
    if (intro) intro.remove();
    heroIn();
  }

  if (!hasST || reduced) return;

  /* ---------- reveals ---------- */
  d.querySelectorAll(".split").forEach(function (el) {
    if (el.closest(".hero")) return;
    gsap.from(el.querySelectorAll(".w>span"), { yPercent: 110, duration: 1, stagger: .045, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 86%" } });
  });
  gsap.utils.toArray(".lead,.kicker,.svx-tabs .svx-tab,.svx-panels,.ind-g li,.faq-l details,.ccards li,.cform,.srow,.pts li,.mini,.acard,.offices li,.also,.jb-c,.sv-side,.vstory .st,.jobs-in>*,.facts li,.area-r,.ab-ph,.citylinks").forEach(function (el) {
    if (el.closest(".hero") || el.closest(".phero")) return;
    gsap.from(el, { opacity: 0, y: 34, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" } });
  });
  gsap.from(".phero-in>*", { opacity: 0, y: 30, duration: 1, stagger: .08, ease: "power3.out", delay: .1 });
  gsap.from(".phero-mk", { opacity: 0, x: 60, rotate: 6, duration: 1.6, ease: "power3.out" });
  gsap.utils.toArray(".phero-bg img").forEach(function (im) {
    gsap.to(im, { yPercent: 12, scale: 1.08, ease: "none", scrollTrigger: { trigger: im.closest(".phero"), start: "top top", end: "bottom top", scrub: true } });
  });

  /* hero parallax out */
  if (hero) {
    gsap.to(".hero-in", { yPercent: -16, opacity: .15, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-mk", { yPercent: 18, rotate: 6, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-bg img", { scale: 1.12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  }

  /* "how we think" words light up */
  d.querySelectorAll(".think-p").forEach(function (p) {
    var ws = p.querySelectorAll(".tw");
    ScrollTrigger.create({ trigger: p, start: "top 80%", end: "bottom 45%", scrub: true, onUpdate: function (st) {
      var n = Math.round(st.progress * ws.length);
      ws.forEach(function (x, i) { x.style.opacity = i < n ? 1 : .18; });
    } });
  });

  /* process line */
  d.querySelectorAll(".proc").forEach(function (pr) {
    var lis = pr.querySelectorAll("li");
    ScrollTrigger.create({ trigger: pr, start: "top 70%", end: "bottom 60%", scrub: true, onUpdate: function (st) {
      pr.style.setProperty("--pp", (st.progress * 100) + "%");
      lis.forEach(function (li, i) { li.classList.toggle("on", st.progress >= i / (lis.length - 1) - .02); });
    } });
  });

  /* story: horizontal pinned scroll on desktop */
  var story = d.querySelector(".story"), track = d.querySelector(".story-track");
  if (story && track) {
    ScrollTrigger.matchMedia({
      "(min-width: 901px)": function () {
        var dist = function () { return Math.max(0, track.scrollWidth - w.innerWidth); };
        gsap.to(track, { x: function () { return -dist(); }, ease: "none",
          scrollTrigger: { trigger: story, start: "top top", end: function () { return "+=" + dist(); }, pin: ".story-pin", scrub: .6, invalidateOnRefresh: true,
            onUpdate: function (st) { story.style.setProperty("--sp", (st.progress * 100) + "%"); } } });
        gsap.utils.toArray(".story .st").forEach(function (s, i) { gsap.from(s, { opacity: 0, y: 60, duration: .8, delay: i * .08, ease: "power3.out", scrollTrigger: { trigger: story, start: "top 70%" } }); });
      },
      "(max-width: 900px)": function () {
        gsap.utils.toArray(".story .st").forEach(function (s) { gsap.from(s, { opacity: 0, y: 40, duration: .8, ease: "power3.out", scrollTrigger: { trigger: s, start: "top 90%" } }); });
      }
    });
  }

  /* facts count-up */
  d.querySelectorAll(".facts b").forEach(function (el) {
    var m = el.textContent.match(/^(\d+)(%?)$/); if (!m || +m[1] > 1000) return;
    var o = { v: 0 }, end = +m[1];
    ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 1.4, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v) + m[2]; } });
    } });
  });

  /* jobs photo drift */
  gsap.utils.toArray(".jobs-ph img").forEach(function (im) {
    gsap.fromTo(im, { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: im.closest(".jobs-band"), start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* map pins pop */
  gsap.utils.toArray(".smap").forEach(function (m) {
    gsap.from(m.querySelectorAll(".pin,.dt"), { opacity: 0, scale: .4, transformOrigin: "center", transformBox: "fill-box", stagger: .06, duration: .6, ease: "back.out(2)", scrollTrigger: { trigger: m, start: "top 80%" } });
  });
})();

/* contact form */
(function () {
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

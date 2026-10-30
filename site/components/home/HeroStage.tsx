"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { getDemos } from "@/content/demos";
import { DemoFrame } from "@/components/demo/DemoFrame";
import { cn } from "@/lib/utils";

/**
 * The hero "stage": a 3D-tilted browser that straightens as you scroll (container-scroll pattern),
 * cycling through the six live template demos, with a phone frame and the Planet render behind.
 */
export function HeroStage({ locale, names }: { locale: string; names: { slug: string; name: string; label: string }[] }) {
  const demos = getDemos(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0.1, 0.45], [24, 0]);
  const scale = useTransform(scrollYProgress, [0.1, 0.45], [0.92, 1]);
  const y = useTransform(scrollYProgress, [0.1, 0.45], [40, 0]);
  const phoneY = useTransform(scrollYProgress, [0.1, 0.6], [120, -40]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotateY = useTransform(sx, (v) => v * 6);
  const tiltX = useTransform(sy, (v) => v * -3);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % demos.length), 5200);
    return () => clearInterval(id);
  }, [paused, demos.length]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const d = demos[i];

  return (
    <div ref={ref} className="relative mx-auto max-w-6xl px-4 sm:px-6" style={{ perspective: 1400 }}>
      <motion.div style={{ rotateX, scale, y, transformStyle: "preserve-3d" }} className="relative origin-top">
        <motion.div style={{ rotateY, rotateX: tiltX, transformStyle: "preserve-3d" }}>
        <div className="absolute -inset-6 rounded-[2.5rem] bg-mint/10 blur-3xl" />
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative hidden md:block">
          <motion.div key={d.slug} initial={{ opacity: 0.2, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.7 }}>
            <DemoFrame d={d} dir={dir} viewH={720} autoScroll={!paused} className="rounded-2xl sm:rounded-3xl" />
          </motion.div>
        </div>

        {/* phone: the main stage on small screens */}
        <div className="relative mx-auto w-[250px] md:hidden">
          <motion.div key={d.slug + "s"} initial={{ opacity: 0.2, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.7 }}>
            <DemoFrame d={d} dir={dir} mobile viewH={780} autoScroll className="border-[6px] border-black" />
          </motion.div>
        </div>

        {/* phone */}
        <motion.div style={{ y: phoneY }} className="absolute -bottom-10 end-2 hidden w-[200px] md:block lg:-end-10 lg:w-[230px]">
          <motion.div key={d.slug + "m"} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <DemoFrame d={d} dir={dir} mobile viewH={780} className="border-[6px] border-black shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]" />
          </motion.div>
        </motion.div>
        </motion.div>
      </motion.div>

      {/* template switcher */}
      <div className="relative mt-16 flex flex-wrap justify-center gap-2">
        {names.map((n, k) => (
          <button
            key={n.slug}
            onClick={() => { setI(k); setPaused(true); }}
            className={cn(
              "relative overflow-hidden rounded-full border px-4 py-2 text-sm transition-colors",
              k === i ? "border-mint/60 text-white" : "border-white/10 text-white/60 hover:text-white"
            )}
          >
            {k === i && !paused && (
              <motion.span key={i} className="absolute inset-y-0 start-0 bg-mint/15" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5.2, ease: "linear" }} />
            )}
            <span className="relative">{n.name} <span className="text-white/40">· {n.label}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

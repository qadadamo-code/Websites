"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

type Sector = { slug: string; icon: string; name: string; title: string; sub: string; features: string[] };

/** Radial orbit: industries circle Planet's mark; pick one to see what its site includes. */
export function OrbitSectors({ sectors, hrefBase, cta }: { sectors: Sector[]; hrefBase: string; cta: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = performance.now();
    const tick = (t: number) => {
      setAngle((a) => a + (t - last) * 0.006);
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const s = sectors[active];

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div
        className="relative mx-auto aspect-square w-full max-w-[520px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        dir="ltr"
      >
        <div className="absolute inset-[12%] rounded-full border border-white/8" />
        <div className="absolute inset-[30%] rounded-full border border-dashed border-mint/20 animate-spin-slow" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative grid size-28 place-items-center rounded-full bg-gradient-to-br from-navy to-space-3 shadow-[0_0_80px_rgba(146,197,180,0.25)] sm:size-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-light.png" alt="" className="w-12 sm:w-16" />
          </div>
        </div>
        {sectors.map((sec, i) => {
          const a = ((angle + (i * 360) / sectors.length) * Math.PI) / 180;
          const r = 38;
          const x = 50 + Math.cos(a) * r;
          const y = 50 + Math.sin(a) * r;
          const isActive = i === active;
          return (
            <button
              key={sec.slug}
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              aria-label={sec.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className={cn(
                  "grid size-14 place-items-center rounded-full border transition-all duration-300 sm:size-16",
                  isActive
                    ? "scale-110 border-mint bg-mint text-space shadow-[0_0_40px_rgba(146,197,180,0.6)]"
                    : "border-white/15 bg-space-2 text-white hover:border-mint/60"
                )}
              >
                <Icon name={sec.icon} className="size-6" />
              </span>
              <span className={cn("mt-2 block whitespace-nowrap text-xs transition-colors", isActive ? "text-mint" : "text-muted")}>{sec.name}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={s.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-3xl p-8"
        >
          <div className="mb-4 flex items-center gap-3 text-mint">
            <Icon name={s.icon} className="size-5" />
            <span className="text-sm">{s.name}</span>
          </div>
          <h3 className="text-2xl font-bold text-white sm:text-3xl">{s.title}</h3>
          <p className="mt-3 text-muted">{s.sub}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {s.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                <Check className="mt-0.5 size-4 shrink-0 text-mint" />
                {f}
              </li>
            ))}
          </ul>
          <Link href={`${hrefBase}${s.slug}/`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-mint hover:underline">
            {cta} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

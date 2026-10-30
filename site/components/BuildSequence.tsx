"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from "motion/react";
import { Check, Lock, CreditCard, QrCode, Wallet, Search, Languages, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Layer = { k: string; label: string };

/**
 * Sticky scroll scene: a browser window assembles itself layer by layer
 * (structure, design, content, motion, payments, SEO, launch) as the visitor scrolls.
 */
export function BuildSequence({ layers, locale }: { layers: Layer[]; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(layers.length, Math.floor(v * (layers.length + 0.6)))));
  const isAr = locale === "ar";

  return (
    <div ref={ref} className="relative" style={{ height: `${(layers.length + 1) * 50}vh` }}>
      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr]">
          <ol className="order-2 space-y-2 lg:order-1">
            {layers.map((l, i) => (
              <li
                key={l.k}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-4 py-3 text-lg transition-all duration-500",
                  i < step ? "text-white" : "text-white/30",
                  i === step - 1 && "glass"
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-sm transition-colors duration-500",
                    i < step ? "border-mint bg-mint text-space" : "border-white/15"
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </span>
                {l.label}
              </li>
            ))}
          </ol>

          <div className="order-1 lg:order-2">
            <BrowserMock step={step} progress={scrollYProgress} isAr={isAr} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowserMock({ step, progress, isAr }: { step: number; progress: MotionValue<number>; isAr: boolean }) {
  const rotate = useTransform(progress, [0, 1], [8, -4]);
  const on = (n: number) => step >= n;
  return (
    <motion.div style={{ rotateX: rotate }} className="relative [perspective:1200px]">
      <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-navy/40 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-space-2 shadow-2xl shadow-black/60">
        {/* chrome */}
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3" dir="ltr">
          <span className="size-3 rounded-full bg-white/15" />
          <span className="size-3 rounded-full bg-white/15" />
          <span className="size-3 rounded-full bg-white/15" />
          <div className="mx-auto flex items-center gap-2 rounded-full bg-white/5 px-4 py-1 text-xs text-muted">
            <Lock className={cn("size-3 transition-colors", on(6) ? "text-mint" : "text-white/20")} />
            {on(6) ? "yourbrand.com" : "localhost"}
          </div>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold transition-all", on(6) ? "bg-mint text-space" : "bg-white/5 text-white/30")}>
            LIVE
          </span>
        </div>

        {/* page */}
        <div className="relative aspect-[16/11] p-5 sm:p-7" dir={isAr ? "rtl" : "ltr"}>
          {/* nav */}
          <div className="mb-6 flex items-center justify-between">
            <div className={cn("h-4 w-20 rounded transition-all duration-700", on(1) ? "bg-[#e7a45b]" : "bg-white/10")} />
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn("h-2.5 w-10 rounded transition-all duration-700", on(2) ? "bg-white/50" : "bg-white/10")} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-3 space-y-3">
              <motion.div
                animate={on(3) ? { opacity: 1, x: 0 } : { opacity: on(1) ? 0.6 : 0.3, x: 0 }}
                className={cn("h-7 w-11/12 rounded-md transition-colors duration-700", on(2) ? "bg-white" : "bg-white/10")}
              />
              <div className={cn("h-7 w-8/12 rounded-md transition-colors duration-700", on(1) ? "bg-[#e7a45b]" : "bg-white/10")} />
              <div className="space-y-2 pt-2">
                {[10, 9, 7].map((x, i) => (
                  <div key={i} className={cn("h-2 rounded transition-colors duration-700", on(2) ? "bg-white/35" : "bg-white/8")} style={{ width: `${x * 10}%` }} />
                ))}
              </div>
              <div className="flex gap-2 pt-3">
                <div className={cn("h-8 w-24 rounded-full transition-all duration-700", on(1) ? "bg-[#e7a45b]" : "bg-white/10", on(3) && "animate-pulse")} />
                <div className={cn("flex h-8 w-24 items-center justify-center gap-1 rounded-full border transition-all duration-700", on(4) ? "border-[#25D366] text-[#25D366]" : "border-white/10 text-transparent")}>
                  <MessageCircle className="size-3.5" />
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <motion.div
                animate={on(3) ? { y: [0, -8, 0] } : { y: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={cn(
                  "aspect-square rounded-2xl transition-all duration-700",
                  on(1) ? "bg-gradient-to-br from-[#e7a45b] to-[#7a3b1a]" : "bg-white/8"
                )}
              />
            </div>
          </div>

          {/* cards */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={false}
                animate={on(3) ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 6 }}
                transition={{ delay: i * 0.08 }}
                className={cn("h-14 rounded-xl border transition-colors duration-700", on(1) ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02]")}
              />
            ))}
          </div>

          {/* floating badges */}
          <Badge show={on(2)} className="-top-3 end-6"><Languages className="size-3.5" /> AR / EN</Badge>
          <Badge show={on(4)} className="bottom-16 -start-4">
            <QrCode className="size-3.5" /> InstaPay <Wallet className="ms-1 size-3.5" /> <CreditCard className="size-3.5" />
          </Badge>
          <Badge show={on(5)} className="bottom-4 end-4"><Search className="size-3.5" /> SEO ready</Badge>
        </div>
      </div>
    </motion.div>
  );
}

function Badge({ show, className, children }: { show: boolean; className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={show ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn("glass absolute z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-lg", className)}
      dir="ltr"
    >
      {children}
    </motion.div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Eye, Monitor, Smartphone, X } from "lucide-react";
import { DemoFrame } from "./demo/DemoFrame";
import { getDemos } from "@/content/demos";
import { href, type Dict, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function TemplatesGallery({ t, sectors, locale, common }: { t: Dict["templates"]; sectors: Dict["sectors"]; locale: Locale; common: Dict["common"] }) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [device, setDevice] = useState<"desk" | "mob">("desk");
  const demos = getDemos(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const items = t.items.filter((i) => filter === "all" || i.sector === filter);
  const current = t.items.find((i) => i.slug === open);
  const currentDemo = demos.find((d) => d.slug === open);

  useEffect(() => {
    if (!open) return;
    if (window.innerWidth < 640) setDevice("mob");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const usedSectors = sectors.filter((s) => t.items.some((i) => i.sector === s.slug));

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {[{ slug: "all", name: t.filterAll }, ...usedSectors].map((s) => (
          <button
            key={s.slug}
            onClick={() => setFilter(s.slug)}
            className={cn("rounded-full border px-4 py-2 text-sm transition-colors", filter === s.slug ? "border-mint bg-mint text-space" : "border-white/10 text-white/75 hover:border-white/30")}
          >
            {s.name}
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {items.map((tp, i) => {
            const d = demos.find((x) => x.slug === tp.slug)!;
            return (
              <motion.article
                layout
                key={tp.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="group"
              >
                <button onClick={() => setOpen(tp.slug)} className="block w-full text-start" aria-label={`${common.preview} ${tp.name}`}>
                  <DemoFrame d={d} dir={dir} viewH={760} className="transition-transform duration-500 group-hover:-translate-y-1.5" />
                </button>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xs text-mint" dir="ltr">CH {String(i + 1).padStart(2, "0")}</span>
                      <h3 className="text-xl font-bold text-white">{tp.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted">{tp.label} · {d.tagline}</p>
                  </div>
                  <button
                    onClick={() => setOpen(tp.slug)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white transition-colors hover:border-mint hover:text-mint"
                  >
                    <Eye className="size-4" /> {common.preview}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {current && currentDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-space/95 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label={current.name}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <div className="truncate font-bold text-white">{current.name} <span className="font-normal text-muted">· {current.label}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="glass hidden rounded-full p-1 sm:flex">
                  {(["desk", "mob"] as const).map((dv) => (
                    <button key={dv} onClick={() => setDevice(dv)} aria-label={dv === "desk" ? "Desktop" : "Mobile"} className={cn("grid size-9 place-items-center rounded-full transition-colors", device === dv ? "bg-mint text-space" : "text-white/70")}>
                      {dv === "desk" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
                    </button>
                  ))}
                </div>
                <Link
                  href={`${href("/start", locale)}?template=${current.slug}`}
                  className="hidden items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-space sm:inline-flex"
                >
                  {common.useTemplate} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                </Link>
                <button onClick={() => setOpen(null)} aria-label={common.back} className="glass grid size-10 place-items-center rounded-full text-white"><X className="size-5" /></button>
              </div>
            </div>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex min-h-0 flex-1 items-start justify-center p-3 sm:p-6">
              <DemoFrame
                key={device}
                d={currentDemo}
                dir={dir}
                mode="scroll"
                mobile={device === "mob"}
                height="calc(100svh - 150px)"
                className={cn("w-full", device === "mob" ? "max-w-[390px]" : "max-w-6xl")}
              />
            </motion.div>
            <div className="border-t border-white/10 p-3 sm:hidden">
              <Link href={`${href("/start", locale)}?template=${current.slug}`} className="flex items-center justify-center gap-2 rounded-full bg-mint py-3 text-sm font-semibold text-space">
                {common.useTemplate}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

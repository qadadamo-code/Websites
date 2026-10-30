"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Monitor, Smartphone, X } from "lucide-react";
import { TemplateMock } from "./TemplateMock";
import { href, type Dict, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function TemplatesGallery({ t, sectors, locale, common }: { t: Dict["templates"]; sectors: Dict["sectors"]; locale: Locale; common: Dict["common"] }) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [device, setDevice] = useState<"desk" | "mob">("desk");
  const items = t.items.filter((i) => filter === "all" || i.sector === filter);
  const current = t.items.find((i) => i.slug === open);
  const rtl = locale === "ar";

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {[{ slug: "all", name: t.filterAll }, ...sectors].map((s) => (
          <button
            key={s.slug}
            onClick={() => setFilter(s.slug)}
            className={cn("rounded-full border px-4 py-2 text-sm transition-colors", filter === s.slug ? "border-mint bg-mint text-space" : "border-white/10 text-white/75 hover:border-white/30")}
          >
            {s.name}
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((tp) => (
            <motion.button
              layout
              key={tp.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setOpen(tp.slug)}
              className="group text-start"
            >
              <TemplateMock t={tp} rtl={rtl} className="transition-transform duration-500 group-hover:-translate-y-2" />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-white">{tp.name}</span>
                <span className="text-sm text-muted">{tp.label}</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-space/90 p-4 backdrop-blur-xl"
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-bold text-white">{current.name}</div>
                  <div className="text-sm text-muted">{current.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="glass flex rounded-full p-1">
                    {(["desk", "mob"] as const).map((d) => (
                      <button key={d} onClick={() => setDevice(d)} aria-label={d} className={cn("grid size-9 place-items-center rounded-full transition-colors", device === d ? "bg-mint text-space" : "text-white/70")}>
                        {d === "desk" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setOpen(null)} aria-label={common.back} className="glass grid size-11 place-items-center rounded-full text-white"><X className="size-5" /></button>
                </div>
              </div>
              <motion.div layout className={cn("mx-auto transition-all duration-500", device === "mob" ? "max-w-[300px]" : "max-w-4xl")}>
                <TemplateMock t={current} rtl={rtl} />
              </motion.div>
              <div className="mt-6 flex justify-center">
                <Link
                  href={`${href("/start", locale)}?template=${current.slug}`}
                  className="rounded-full bg-mint px-6 py-3.5 text-sm font-semibold text-space hover:shadow-[0_0_30px_rgba(146,197,180,0.5)]"
                >
                  {common.useTemplate}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

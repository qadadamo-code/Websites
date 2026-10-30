"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Minus, Plus } from "lucide-react";
import { waLink, type Dict } from "@/lib/i18n";
import { cn, formatPrice } from "@/lib/utils";

type Addon = Dict["pricing"]["addons"][number];

export function PricingCalculator({ t, locale, common }: { t: Dict["pricing"]; locale: string; common: Dict["common"] }) {
  const [sel, setSel] = useState<Record<string, number>>({});
  const toggle = (a: Addon) => setSel((s) => ({ ...s, [a.id]: s[a.id] ? 0 : 1 }));
  const setQty = (id: string, q: number) => setSel((s) => ({ ...s, [id]: Math.max(0, Math.min(20, q)) }));

  const { once, monthly } = useMemo(() => {
    let once = t.package.price, monthly = 0;
    for (const a of t.addons) {
      const q = sel[a.id] || 0;
      if (!q) continue;
      if ("monthly" in a && a.monthly) monthly += a.price * q;
      else once += a.price * q;
    }
    return { once, monthly };
  }, [sel, t]);

  const quote = useMemo(() => {
    const lines = t.addons.filter((a) => sel[a.id]).map((a) => `- ${a.name}${sel[a.id] > 1 ? ` × ${sel[a.id]}` : ""}`);
    return [t.quoteIntro, `- ${t.package.name}`, ...lines, `${t.total}: ${formatPrice(once, locale)} ${common.currency}${monthly ? ` + ${formatPrice(monthly, locale)} ${t.monthly}` : ""}`].join("\n");
  }, [sel, t, once, monthly, locale, common.currency]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="text-2xl font-bold text-white">{t.addonsTitle}</h2>
        <p className="mt-2 text-muted">{t.addonsSub}</p>
        <div className="mt-6 grid gap-3">
          {t.addons.map((a) => {
            const q = sel[a.id] || 0;
            const isQty = "qty" in a && a.qty;
            return (
              <div
                key={a.id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-2xl border p-4 transition-colors",
                  q ? "border-mint/50 bg-mint/[0.06]" : "border-white/8 bg-white/[0.02] hover:border-white/20"
                )}
              >
                <button onClick={() => (isQty ? setQty(a.id, q ? 0 : 1) : toggle(a))} className="flex flex-1 items-center gap-3 text-start">
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-md border transition-colors", q ? "border-mint bg-mint text-space" : "border-white/20")}>
                    {q ? <Check className="size-4" /> : null}
                  </span>
                  <span className="text-white/90">{a.name}</span>
                </button>
                <div className="flex items-center gap-3">
                  {isQty && q > 0 && (
                    <div className="flex items-center gap-2 rounded-full border border-white/10 px-1.5 py-1">
                      <button aria-label="-" onClick={() => setQty(a.id, q - 1)} className="grid size-6 place-items-center rounded-full hover:bg-white/10"><Minus className="size-3" /></button>
                      <span className="w-5 text-center text-sm tabular-nums">{q}</span>
                      <button aria-label="+" onClick={() => setQty(a.id, q + 1)} className="grid size-6 place-items-center rounded-full hover:bg-white/10"><Plus className="size-3" /></button>
                    </div>
                  )}
                  <span className="whitespace-nowrap text-sm text-mint">
                    {formatPrice(a.price, locale)} <span className="text-muted">{common.currency}{"unit" in a && a.unit ? ` / ${a.unit}` : ""}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl border border-mint/30 bg-gradient-to-b from-space-3 to-space p-7">
          <div className="text-sm text-muted">{t.total}</div>
          <motion.div key={once} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-5xl font-black text-white">{formatPrice(once, locale)}</span>
            <span className="text-muted">{common.currency}</span>
          </motion.div>
          {monthly > 0 && (
            <div className="mt-1 text-sm text-mint">+ {formatPrice(monthly, locale)} {common.currency} {t.monthly}</div>
          )}
          <a
            href={waLink(quote)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-[#05210f] transition-shadow hover:shadow-[0_0_30px_rgba(37,211,102,0.4)]"
          >
            {t.sendQuote}
          </a>
          <p className="mt-6 border-t border-white/8 pt-5 text-xs leading-relaxed text-muted">
            <strong className="text-white/80">{t.hostingTitle}: </strong>
            {t.hostingText}
          </p>
        </div>
      </div>
    </div>
  );
}

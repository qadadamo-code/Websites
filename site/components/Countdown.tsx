"use client";
import { useEffect, useState } from "react";

const TOTAL = 72 * 3600;

/** A live 72-hour countdown that loops. Purely visual: it sells the "3 days" promise. */
export function Countdown({ labels, locale }: { labels: { hours: string; minutes: string; seconds: string }; locale: string }) {
  const [left, setLeft] = useState(TOTAL);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const el = Math.floor((Date.now() - start) / 1000) * 37; // runs fast so visitors see it move
      setLeft(TOTAL - (el % TOTAL));
    }, 1000 / 12);
    return () => clearInterval(id);
  }, []);
  const hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60), ss = left % 60;
  const fmt = (n: number) => new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { minimumIntegerDigits: 2 }).format(n);
  const parts = [
    [fmt(hh), labels.hours],
    [fmt(mm), labels.minutes],
    [fmt(ss), labels.seconds],
  ];
  return (
    <div className="flex items-end gap-3" dir="ltr">
      {parts.map(([v, l], i) => (
        <div key={i} className="flex items-end gap-3">
          <div className="text-center">
            <div className="font-display text-3xl font-black tabular-nums text-white sm:text-4xl">{v}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted">{l}</div>
          </div>
          {i < 2 && <span className="pb-6 text-2xl text-mint/60">:</span>}
        </div>
      ))}
    </div>
  );
}

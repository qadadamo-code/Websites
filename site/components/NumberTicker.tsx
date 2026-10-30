"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "motion/react";

export function NumberTicker({ value, locale, suffix = "" }: { value: number; locale: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value]);
  const fmt = new Intl.NumberFormat("en-US");
  return (
    <span ref={ref} className="tabular-nums">
      {fmt.format(n)}
      {suffix}
    </span>
  );
}

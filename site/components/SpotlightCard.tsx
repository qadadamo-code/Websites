"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Card with a soft mint spotlight that follows the cursor. */
export function SpotlightCard({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-mint/30",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "before:bg-[radial-gradient(400px_circle_at_var(--x)_var(--y),rgb(146_197_180/0.14),transparent_45%)]",
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}

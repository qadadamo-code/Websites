"use client";
import { useEffect, useRef, useState } from "react";
import { Lock, RotateCw } from "lucide-react";
import type { Demo } from "@/content/demos";
import { TemplateDemo } from "./TemplateDemo";
import { cn } from "@/lib/utils";

const DOMAIN: Record<string, string> = {
  restaurant: "sofra-eg.com",
  corporate: "mehwar-logistics.com",
  fashion: "noor-eg.com",
  store: "souq-store.com",
  clinic: "shifaa-dental.com",
  realestate: "ofoq-developments.com",
};

/**
 * Scales a TemplateDemo to its container.
 * mode "peek": fixed viewport height, the page scrolls itself on hover (portfolio style).
 * mode "scroll": the visitor scrolls the real page inside the frame.
 */
export function DemoFrame({
  d,
  dir,
  mobile = false,
  mode = "peek",
  viewH,
  chrome = true,
  className,
  autoScroll = false,
  height,
}: {
  d: Demo;
  dir: "rtl" | "ltr";
  mobile?: boolean;
  mode?: "peek" | "scroll";
  viewH?: number;
  chrome?: boolean;
  className?: string;
  autoScroll?: boolean;
  height?: string;
}) {
  const W = mobile ? 390 : 1280;
  const VH = viewH ?? (mobile ? 760 : 800);
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [innerH, setInnerH] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (outer.current) setScale(outer.current.clientWidth / W);
      if (inner.current) setInnerH(inner.current.offsetHeight);
    });
    if (outer.current) ro.observe(outer.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [W]);

  const travel = Math.max(0, innerH - VH);
  const active = hover || autoScroll;

  return (
    <div
      className={cn("overflow-hidden bg-[#0d1226] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10", mobile ? "rounded-[2rem]" : "rounded-2xl", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {chrome && !mobile && (
        <div className="flex items-center gap-3 border-b border-white/10 bg-[#141a33] px-3 py-2" dir="ltr">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex min-w-0 max-w-[60%] flex-1 items-center justify-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/60">
            <Lock className="size-3 shrink-0" /> <span className="truncate">{DOMAIN[d.slug]}</span>
          </div>
          <RotateCw className="size-3 text-white/40" />
        </div>
      )}
      {chrome && mobile && (
        <div className="flex justify-center bg-black py-2">
          <span className="h-5 w-24 rounded-full bg-[#111]" />
        </div>
      )}
      <div
        ref={outer}
        dir="ltr"
        className={cn("relative w-full", mode === "scroll" ? "overflow-y-auto overscroll-contain" : "overflow-hidden")}
        style={mode === "scroll" && height ? { height } : { height: scale ? VH * scale : undefined, aspectRatio: scale ? undefined : `${W} / ${VH}` }}
        data-lenis-prevent
      >
        {mode === "scroll" && <div style={{ height: innerH * scale }} />}
        <div
          className="absolute start-0 top-0 origin-top-left"
          style={{ width: W, transform: `scale(${scale})`, visibility: scale ? "visible" : "hidden" }}
        >
          <div
            ref={inner}
            style={{
              transform: `translateY(${mode === "peek" && active ? -travel : 0}px)`,
              transition: mode === "peek" ? `transform ${active ? Math.max(4, travel / 260) : 0.9}s ${active ? "linear" : "cubic-bezier(.22,1,.36,1)"}` : undefined,
            }}
          >
            <TemplateDemo d={d} mobile={mobile} dir={dir} />
          </div>
        </div>
      </div>
    </div>
  );
}

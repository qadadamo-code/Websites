import { cn } from "@/lib/utils";

type T = { slug: string; name: string; accent: string; bg: string; label: string };

/** A lightweight, code-drawn preview of a template (no screenshots needed). */
export function TemplateMock({ t, className, rtl }: { t: T; className?: string; rtl?: boolean }) {
  const a = t.accent;
  const layouts: Record<string, React.ReactNode> = {
    restaurant: (
      <>
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-2">
            <div className="text-[clamp(14px,2.4vw,26px)] font-black leading-none" style={{ color: a }}>{t.name}</div>
            <div className="h-1.5 w-3/4 rounded bg-white/40" />
            <div className="h-1.5 w-1/2 rounded bg-white/25" />
            <div className="mt-2 h-5 w-16 rounded-full" style={{ background: a }} />
          </div>
          <div className="aspect-square w-2/5 rounded-full" style={{ background: `radial-gradient(circle at 35% 35%, ${a}, #3b1c0a)` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md bg-white/5 p-1.5">
              <div className="aspect-[4/3] rounded" style={{ background: `${a}${["55", "33", "77"][i]}` }} />
              <div className="mt-1 h-1 w-2/3 rounded bg-white/30" />
            </div>
          ))}
        </div>
      </>
    ),
    corporate: (
      <>
        <div className="space-y-2">
          <div className="h-3 w-4/5 rounded bg-white/80" />
          <div className="h-3 w-3/5 rounded" style={{ background: a }} />
          <div className="h-1.5 w-2/3 rounded bg-white/25" />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-md border border-white/10 p-1.5">
              <div className="size-3 rounded" style={{ background: a }} />
              <div className="mt-1.5 h-1 rounded bg-white/30" />
              <div className="mt-1 h-1 w-1/2 rounded bg-white/20" />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-3">
          {["370+", "12", "98%"].map((n) => (
            <div key={n} className="text-[10px] font-bold" style={{ color: a }}>{n}</div>
          ))}
        </div>
      </>
    ),
    fashion: (
      <div className="grid h-full grid-cols-3 gap-1.5">
        <div className="col-span-2 rounded-lg" style={{ background: `linear-gradient(160deg, ${a}, #3a2a2c)` }}>
          <div className="p-2 text-[clamp(12px,2vw,22px)] font-black italic text-white/90">{t.name}</div>
        </div>
        <div className="grid gap-1.5">
          <div className="rounded-lg bg-white/10" />
          <div className="rounded-lg" style={{ background: `${a}66` }} />
        </div>
      </div>
    ),
    store: (
      <>
        <div className="flex items-center justify-between">
          <div className="h-2 w-1/3 rounded bg-white/70" />
          <div className="h-4 w-4 rounded-full" style={{ background: a }} />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="rounded-md bg-white/5 p-1">
              <div className="aspect-square rounded" style={{ background: i % 3 === 0 ? a : `${a}${i % 2 ? "44" : "22"}` }} />
              <div className="mt-1 h-1 rounded bg-white/30" />
            </div>
          ))}
        </div>
      </>
    ),
    clinic: (
      <>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-full rounded bg-white/80" />
            <div className="h-1.5 w-3/4 rounded bg-white/30" />
            <div className="mt-2 rounded-lg border border-white/10 p-1.5">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-sm" style={{ background: i === 6 ? a : "rgba(255,255,255,.08)" }} />
                ))}
              </div>
            </div>
          </div>
          <div className="w-2/5 rounded-xl" style={{ background: `linear-gradient(180deg, ${a}88, transparent)` }} />
        </div>
      </>
    ),
    realestate: (
      <>
        <div className="aspect-[16/7] rounded-lg" style={{ background: `linear-gradient(180deg, #2b2416 0%, ${a} 140%)` }}>
          <div className="flex h-full items-end gap-1 p-2">
            {[40, 70, 55, 90, 60].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-black/40" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="mt-2 flex gap-1.5">
          {["", "", ""].map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded-full border border-white/15" />
          ))}
          <div className="h-4 w-10 rounded-full" style={{ background: a }} />
        </div>
      </>
    ),
  };
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/10 shadow-2xl", className)} style={{ background: t.bg }}>
      <div className="flex items-center gap-1.5 border-b border-white/8 px-3 py-2" dir="ltr">
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="mx-auto h-2 w-24 rounded-full bg-white/8" />
      </div>
      <div className="aspect-[4/3] p-3 sm:p-4" dir={rtl ? "rtl" : "ltr"}>
        <div className="mb-3 flex items-center justify-between">
          <div className="h-2 w-10 rounded" style={{ background: a }} />
          <div className="flex gap-1.5">{[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-5 rounded bg-white/30" />)}</div>
        </div>
        {layouts[t.slug]}
      </div>
    </div>
  );
}

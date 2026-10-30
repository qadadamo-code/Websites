import {
  ArrowUpRight, BedDouble, CalendarCheck, Check, Clock, Heart, MapPin, Menu, Phone, Search, ShoppingBag, Star, Maximize2,
} from "lucide-react";
import type { Demo, DemoItem } from "@/content/demos";

const FONT: Record<Demo["font"], string> = {
  kufi: "var(--font-kufi), var(--font-alexandria), sans-serif",
  messiri: "var(--font-messiri), var(--font-alexandria), serif",
  sans: "var(--font-alexandria), var(--font-montserrat), sans-serif",
};

const OVERLAY = new Set(["restaurant", "corporate", "realestate"]);

/**
 * A full, realistic website for one template. Rendered at a fixed design width
 * (1280 desktop or 390 mobile) and scaled by DemoFrame, so layout never depends on the viewport.
 */
export function TemplateDemo({ d, mobile = false, dir }: { d: Demo; mobile?: boolean; dir: "rtl" | "ltr" }) {
  const t = d.theme;
  const m = mobile;
  const px = m ? 20 : 64;
  const overlay = OVERLAY.has(d.slug);
  const display = { fontFamily: FONT[d.font] };
  const ar = dir === "rtl";

  return (
    <div dir={dir} style={{ background: t.bg, color: t.fg, width: m ? 390 : 1280, fontFamily: "var(--font-alexandria), var(--font-montserrat), sans-serif" }} className="relative select-none">
      {/* announcement */}
      <div style={{ background: t.accent, color: t.onAccent }} className="py-2 text-center text-[12px] font-medium">
        {d.hero.chips?.join("  ·  ")}
      </div>

      {/* nav */}
      <header style={{ paddingInline: px, borderColor: t.line }} className={`flex items-center justify-between border-b ${m ? "h-16" : "h-20"} ${overlay ? "absolute inset-x-0 z-10 border-transparent" : ""}`}>
        <div className="flex items-baseline gap-2" style={{ color: overlay ? "#fff" : t.fg }}>
          <span style={display} className={`${m ? "text-2xl" : "text-3xl"} font-bold leading-none`}>{d.brand}</span>
          {!m && <span className="text-[11px] opacity-70">{d.tagline}</span>}
        </div>
        {!m && (
          <nav className="flex items-center gap-8 text-[14px]" style={{ color: overlay ? "rgba(255,255,255,.85)" : t.muted }}>
            {d.nav.map((n) => <span key={n}>{n}</span>)}
          </nav>
        )}
        <div className="flex items-center gap-3">
          {!m && <Search className="size-[18px]" style={{ color: overlay ? "#fff" : t.fg }} />}
          <span style={{ background: t.accent, color: t.onAccent }} className={`rounded-full font-semibold ${m ? "px-3.5 py-2 text-[12px]" : "px-5 py-2.5 text-[13px]"}`}>{d.navCta}</span>
          {m && <Menu className="size-6" style={{ color: overlay ? "#fff" : t.fg }} />}
        </div>
      </header>

      {/* hero */}
      {overlay ? (
        <section className="relative" style={{ height: m ? 640 : 720 }}>
          <img src={d.hero.img} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(${ar ? "270deg" : "90deg"}, rgba(0,0,0,.78) 0%, rgba(0,0,0,.35) 55%, rgba(0,0,0,.1) 100%), linear-gradient(0deg, ${t.bg} 0%, transparent 35%)` }} />
          <div className="relative flex h-full flex-col justify-end" style={{ paddingInline: px, paddingBottom: m ? 48 : 96 }}>
            <span className="mb-4 inline-flex w-max items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12px] text-white backdrop-blur">
              <MapPin className="size-3.5" /> {d.hero.kicker}
            </span>
            <h1 style={display} className={`max-w-[760px] font-bold leading-[1.1] text-white ${m ? "text-[38px]" : "text-[72px]"}`}>{d.hero.title}</h1>
            <p className={`mt-5 max-w-[560px] leading-relaxed text-white/80 ${m ? "text-[14px]" : "text-[18px]"}`}>{d.hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span style={{ background: t.accent, color: t.onAccent }} className={`rounded-full font-semibold ${m ? "px-5 py-3 text-[13px]" : "px-7 py-4 text-[15px]"}`}>{d.hero.cta1}</span>
              <span className={`rounded-full border border-white/40 font-semibold text-white ${m ? "px-5 py-3 text-[13px]" : "px-7 py-4 text-[15px]"}`}>{d.hero.cta2}</span>
            </div>
            {d.slug === "realestate" && (
              <div className={`mt-10 grid gap-px overflow-hidden rounded-2xl ${m ? "grid-cols-1" : "grid-cols-4"}`} style={{ background: t.line }}>
                {(ar ? ["الموقع: غرب القاهرة", "النوع: فيلا", "الميزانية: حتى 30 مليون"] : ["Location: West Cairo", "Type: Villa", "Budget: up to EGP 30M"]).map((x) => (
                  <div key={x} style={{ background: "rgba(15,13,9,.85)" }} className="px-5 py-4 text-[13px] text-white/85 backdrop-blur">{x}</div>
                ))}
                <div style={{ background: t.accent, color: t.onAccent }} className="flex items-center justify-center gap-2 px-5 py-4 text-[14px] font-semibold">
                  <Search className="size-4" /> {ar ? "ابحث" : "Search"}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section style={{ paddingInline: px }} className={m ? "pt-6" : "pt-10"}>
          <div className={`grid items-center gap-8 ${m ? "" : "grid-cols-[1fr_1.15fr]"}`}>
            <div className={m ? "order-2" : ""}>
              <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: t.accent }}>{d.hero.kicker}</span>
              <h1 style={display} className={`mt-4 font-bold leading-[1.12] ${m ? "text-[36px]" : "text-[64px]"}`}>{d.hero.title}</h1>
              <p className={`mt-5 leading-relaxed ${m ? "text-[14px]" : "text-[17px]"}`} style={{ color: t.muted }}>{d.hero.sub}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span style={{ background: t.accent, color: t.onAccent }} className={`inline-flex items-center gap-2 rounded-full font-semibold ${m ? "px-5 py-3 text-[13px]" : "px-7 py-4 text-[15px]"}`}>
                  {d.slug === "clinic" ? <CalendarCheck className="size-4" /> : <ShoppingBag className="size-4" />} {d.hero.cta1}
                </span>
                <span style={{ borderColor: t.line, color: t.fg }} className={`rounded-full border font-semibold ${m ? "px-5 py-3 text-[13px]" : "px-7 py-4 text-[15px]"}`}>{d.hero.cta2}</span>
              </div>
              <div className="mt-8 flex items-center gap-3 text-[13px]" style={{ color: t.muted }}>
                <span className="flex" style={{ color: "#f5b301" }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-4 fill-current" />)}</span>
                {d.stats[2].v} · {d.stats[2].l}
              </div>
            </div>
            <div className={`relative overflow-hidden ${m ? "order-1 h-[300px] rounded-3xl" : "h-[600px] rounded-[36px]"}`}>
              <img src={d.hero.img} alt="" className="size-full object-cover" loading="lazy" />
              <div className="absolute bottom-5 start-5 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl backdrop-blur" style={{ background: "rgba(255,255,255,.88)", color: "#111" }}>
                <span className="grid size-9 place-items-center rounded-full" style={{ background: t.accent, color: t.onAccent }}>
                  {d.slug === "clinic" ? <CalendarCheck className="size-4" /> : <Heart className="size-4" />}
                </span>
                <div className="text-[12px] leading-tight">
                  <div className="font-bold">{d.hero.chips?.[0]}</div>
                  <div className="opacity-60">{d.hero.chips?.[1]}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* stats */}
      <section style={{ paddingInline: px }} className={m ? "py-10" : "py-16"}>
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border" style={{ borderColor: t.line, background: t.surface }}>
          {d.stats.map((s, i) => (
            <div key={s.l} className={`text-center ${m ? "px-2 py-5" : "py-8"} ${i ? "border-s" : ""}`} style={{ borderColor: t.line }}>
              <div style={{ ...display, color: t.accent }} className={`font-bold ${m ? "text-[26px]" : "text-[44px]"}`} dir="ltr">{s.v}</div>
              <div className={`mt-1 ${m ? "text-[11px]" : "text-[14px]"}`} style={{ color: t.muted }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* main collection */}
      <section style={{ paddingInline: px }} className={m ? "pb-12" : "pb-24"}>
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <span className="text-[13px] font-semibold" style={{ color: t.accent }}>{d.main.kicker}</span>
            <h2 style={display} className={`mt-2 font-bold ${m ? "text-[28px]" : "text-[44px]"}`}>{d.main.title}</h2>
            <p className="mt-2 text-[14px]" style={{ color: t.muted }}>{d.main.sub}</p>
          </div>
          {!m && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold" style={{ color: t.accent }}>
              {ar ? "عرض الكل" : "View all"} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </span>
          )}
        </div>
        <div className={`grid gap-5 ${m ? "grid-cols-1" : "grid-cols-3"}`}>
          {d.main.items.map((it) => <Card key={it.title} it={it} d={d} m={m} ar={ar} />)}
        </div>

        {d.main.more && (
          <div className={`mt-10 rounded-3xl border ${m ? "p-5" : "p-10"}`} style={{ borderColor: t.line, background: t.surface }}>
            <h3 style={display} className={`mb-6 font-bold ${m ? "text-[20px]" : "text-[26px]"}`}>{d.main.moreTitle}</h3>
            <div className={`grid gap-x-12 gap-y-4 ${m ? "" : "grid-cols-2"}`}>
              {d.main.more.map((x) => (
                <div key={x.title} className="flex items-baseline gap-3 text-[15px]">
                  <span>{x.title}</span>
                  <span className="mb-1 flex-1 border-b border-dashed" style={{ borderColor: t.line }} />
                  <span className="font-semibold" style={{ color: t.accent }}>{x.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* band */}
      <section style={{ paddingInline: px }} className={m ? "pb-12" : "pb-24"}>
        <div className={`grid overflow-hidden rounded-[32px] ${m ? "" : "grid-cols-2"}`} style={{ background: t.surface, border: `1px solid ${t.line}` }}>
          <div className={m ? "h-[220px]" : "min-h-[440px]"}>
            <img src={d.band.img} alt="" className="size-full object-cover" loading="lazy" />
          </div>
          <div className={`flex flex-col justify-center ${m ? "p-6" : "p-14"}`}>
            <span className="text-[13px] font-semibold" style={{ color: t.accent }}>{d.band.kicker}</span>
            <h2 style={display} className={`mt-3 font-bold leading-tight ${m ? "text-[26px]" : "text-[40px]"}`}>{d.band.title}</h2>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: t.muted }}>{d.band.text}</p>
            {d.slug === "clinic" ? (
              <div className="mt-6 grid grid-cols-4 gap-2">
                {d.band.points.map((p, i) => (
                  <span key={p} dir="ltr" className="rounded-xl border py-3 text-center text-[13px] font-semibold" style={i === 1 ? { background: t.accent, color: t.onAccent, borderColor: t.accent } : { borderColor: t.line }}>{p}</span>
                ))}
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {d.band.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px]">
                    <span className="grid size-6 place-items-center rounded-full" style={{ background: t.accent, color: t.onAccent }}><Check className="size-3.5" /></span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            <span style={{ background: t.accent, color: t.onAccent }} className="mt-8 w-max rounded-full px-6 py-3.5 text-[14px] font-semibold">{d.band.cta}</span>
          </div>
        </div>
      </section>

      {/* quote */}
      <section style={{ paddingInline: px }} className={`text-center ${m ? "pb-12" : "pb-24"}`}>
        <div className="mx-auto max-w-[820px]">
          <div className="mb-5 flex justify-center" style={{ color: "#f5b301" }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-5 fill-current" />)}</div>
          <p style={display} className={`font-bold leading-snug ${m ? "text-[22px]" : "text-[34px]"}`}>“{d.quote.text}”</p>
          <p className="mt-5 text-[14px]" style={{ color: t.muted }}>{d.quote.who}</p>
        </div>
      </section>

      {/* footer */}
      <footer style={{ paddingInline: px, borderColor: t.line, background: t.surface }} className={`border-t ${m ? "py-10" : "py-14"}`}>
        <div className={`grid gap-8 ${m ? "" : "grid-cols-[1.4fr_1fr_1fr_1fr]"}`}>
          <div>
            <div style={display} className="text-[28px] font-bold">{d.brand}</div>
            <p className="mt-2 text-[13px]" style={{ color: t.muted }}>{d.footer.about}</p>
          </div>
          {[
            { I: MapPin, v: d.footer.address },
            { I: Phone, v: d.footer.phone },
            { I: Clock, v: d.footer.hours },
          ].map(({ I, v }) => (
            <div key={v} className="flex items-start gap-2 text-[13px]" style={{ color: t.muted }}>
              <I className="mt-0.5 size-4 shrink-0" style={{ color: t.accent }} /> <span dir="auto">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-between border-t pt-6 text-[12px]" style={{ borderColor: t.line, color: t.muted }}>
          <span dir="ltr">© 2026 {d.brand}</span>
          <span>{ar ? "صمم بواسطة بلانيت" : "Built by Planet"}</span>
        </div>
      </footer>
    </div>
  );
}

function Card({ it, d, m, ar }: { it: DemoItem; d: Demo; m: boolean; ar: boolean }) {
  const t = d.theme;
  const display = { fontFamily: FONT[d.font] };
  const kind = d.slug;
  const tall = kind === "fashion" || kind === "clinic";
  return (
    <div className="group overflow-hidden rounded-3xl border" style={{ borderColor: t.line, background: t.surface }}>
      <div className={`relative overflow-hidden ${tall ? (m ? "h-[380px]" : "h-[440px]") : m ? "h-[240px]" : "h-[300px]"}`}>
        {it.img && <img src={it.img} alt="" className="size-full object-cover" loading="lazy" />}
        {it.tag && (
          <span className="absolute top-4 start-4 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: t.accent, color: t.onAccent }}>{it.tag}</span>
        )}
        {(kind === "fashion" || kind === "store") && (
          <span className="absolute top-4 end-4 grid size-9 place-items-center rounded-full bg-white/90 text-neutral-800"><Heart className="size-4" /></span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 style={display} className="text-[20px] font-bold leading-tight">{it.title}</h3>
          {it.price && kind !== "realestate" && (
            <div className="shrink-0 text-end">
              <div className="text-[16px] font-bold" style={{ color: t.accent }}>{it.price}</div>
              {it.old && <div className="text-[12px] line-through" style={{ color: t.muted }}>{it.old}</div>}
            </div>
          )}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[13px]" style={{ color: t.muted }}>
          {kind === "realestate" && <BedDouble className="size-4" />}
          {kind === "realestate" && <Maximize2 className="size-3.5" />}
          {it.meta}
        </p>
        {kind === "realestate" && it.price && (
          <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: t.line }}>
            <span className="text-[18px] font-bold" style={{ color: t.accent }}>{it.price}</span>
            <span className="text-[12px]" style={{ color: t.muted }}>{ar ? "مقدم 10%" : "10% down"}</span>
          </div>
        )}
        {(kind === "store" || kind === "fashion" || kind === "restaurant") && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold" style={{ background: t.accent, color: t.onAccent }}>
            <ShoppingBag className="size-4" /> {ar ? (kind === "restaurant" ? "أضف للطلب" : "أضف للسلة") : kind === "restaurant" ? "Add to order" : "Add to bag"}
          </div>
        )}
        {kind === "clinic" && it.tag && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-full border py-2.5 text-[13px] font-semibold" style={{ borderColor: t.accent, color: t.accent }}>
            <CalendarCheck className="size-4" /> {ar ? "احجز مع الدكتور" : "Book with doctor"}
          </div>
        )}
        {kind === "corporate" && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: t.accent }}>
            {ar ? "تفاصيل الخدمة" : "Service details"} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </div>
        )}
      </div>
    </div>
  );
}

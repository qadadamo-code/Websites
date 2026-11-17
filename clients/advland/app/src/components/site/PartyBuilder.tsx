import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Crown, Minus, Plus, Users, Clock } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useContent } from "@/lib/content"
import { fmt, cn } from "@/lib/utils"
import { iconFor } from "./bits"
import { BookingForm } from "./booking"

function useCount(target: number) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const a = from.current, start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 600), e = 1 - Math.pow(1 - k, 3)
      setV(Math.round(a + (target - a) * e))
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); from.current = target }
  }, [target])
  return v
}

/** Step-by-step party configurator with a live estimate (same formula as the server). */
export default function PartyBuilder() {
  const { t, L, lang } = useI18n()
  const c = useContent()
  const cur = L(c.settings.currency)
  const initial = c.packages.find((p) => p.featured)?.id ?? c.packages[0]?.id
  const [pkgId, setPkg] = useState(initial)
  const pkg = c.packages.find((p) => p.id === pkgId) ?? c.packages[0]
  const [kids, setKids] = useState(pkg?.kids ?? 10)
  const [addons, setAddons] = useState<string[]>([])
  useEffect(() => { if (pkg) setKids((k) => Math.max(k, Math.min(pkg.kids, 200))) }, [pkgId])

  const perExtra = pkg ? Math.round((pkg.price / Math.max(1, pkg.kids)) * 0.6) : 0
  const extraKids = pkg ? Math.max(0, kids - pkg.kids) : 0
  const addonSum = addons.reduce((s, id) => s + (c.addons.find((a) => a.id === id)?.price ?? 0), 0)
  const total = (pkg?.price ?? 0) + extraKids * perExtra + addonSum
  const shown = useCount(total)

  const summary = useMemo(() => [
    t("طلب حفلة 🎂", "Party request 🎂"),
    t("الباقة: ", "Package: ") + L(pkg?.name) + ` (${fmt(pkg?.price ?? 0)} ${cur})`,
    t("عدد الأطفال: ", "Kids: ") + kids,
    addons.length ? t("الإضافات: ", "Add-ons: ") + addons.map((id) => L(c.addons.find((a) => a.id === id)?.name)).join("، ") : "",
    t("التقدير: ", "Estimate: ") + fmt(total) + " " + cur,
  ].filter(Boolean).join("\n"), [pkg, kids, addons, total, t, L, cur, c.addons])

  if (!pkg) return null
  const step = (n: number, title: string) => (
    <div className="flex items-center gap-3 mb-5"><span className="w-9 h-9 rounded-full grid place-items-center bg-orange text-white font-bold font-[family-name:var(--font-display)]">{n}</span><h3 className="text-xl md:text-2xl">{title}</h3></div>
  )

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
      <div className="grid gap-12">
        <section>
          {step(1, t("اختر الباقة", "Pick a package"))}
          <div className="grid md:grid-cols-3 gap-4">
            {c.packages.map((p) => {
              const on = p.id === pkgId
              return (
                <button key={p.id} type="button" onClick={() => setPkg(p.id)} aria-pressed={on}
                  className={cn("relative text-start card p-5 pt-6 flex flex-col gap-3 transition-all duration-300 border-2", on ? "!border-orange -translate-y-1 shadow-[0_24px_50px_-24px_#f26a1b]" : "hover:-translate-y-0.5")}>
                  {p.featured && <span className="absolute -top-3 start-4 chip !bg-sun !text-navy !text-[11px] !font-bold"><Crown size={13} />{t("الأكثر طلباً", "Most loved")}</span>}
                  <div className="flex items-center justify-between">
                    <b className="font-[family-name:var(--font-display)] text-lg">{L(p.name)}</b>
                    <span className={cn("w-6 h-6 rounded-full grid place-items-center border-2 transition-colors", on ? "bg-orange border-orange text-white" : "border-border")}>{on && <Check size={14} strokeWidth={3} />}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5"><b className="text-3xl font-[family-name:var(--font-display)] text-orange">{fmt(p.price)}</b><span className="text-sm text-muted-foreground">{cur}</span></div>
                  <div className="flex gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Users size={15} />{p.kids} {t("طفل", "kids")}</span><span className="flex items-center gap-1"><Clock size={15} />{L(p.duration)}</span></div>
                  <ul className="list-none p-0 m-0 grid gap-1.5 text-sm">
                    {(p.includes[lang] ?? p.includes.ar).map((x, k) => <li key={k} className="flex gap-2"><Check size={16} className="text-[#1fa855] shrink-0 mt-0.5" strokeWidth={3} />{x}</li>)}
                  </ul>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          {step(2, t("كم طفل بيحتفل معك؟", "How many kids are coming?"))}
          <div className="card p-6 grid gap-5">
            <div className="flex items-center justify-between gap-4">
              <button type="button" className="btn btn-g !p-3" onClick={() => setKids((k) => Math.max(5, k - 1))} aria-label="-"><Minus size={18} /></button>
              <div className="text-center"><b className="block text-5xl font-[family-name:var(--font-display)]">{kids}</b><span className="text-muted-foreground text-sm">{t("طفل", "kids")}</span></div>
              <button type="button" className="btn btn-g !p-3" onClick={() => setKids((k) => Math.min(80, k + 1))} aria-label="+"><Plus size={18} /></button>
            </div>
            <input type="range" min={5} max={80} value={kids} onChange={(e) => setKids(+e.target.value)} className="w-full accent-[var(--color-orange)]" aria-label={t("عدد الأطفال", "Kids")} />
            <p className="m-0 text-sm text-muted-foreground text-center">
              {extraKids > 0
                ? t(`الباقة تشمل ${pkg.kids} طفل، وكل طفل إضافي ${fmt(perExtra)} ${cur}`, `Package covers ${pkg.kids} kids, each extra kid is ${fmt(perExtra)} ${cur}`)
                : t(`مشمول في الباقة حتى ${pkg.kids} طفل`, `Included in the package up to ${pkg.kids} kids`)}
            </p>
          </div>
        </section>

        <section>
          {step(3, t("زيّن الحفلة بالإضافات", "Add some extra magic"))}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {c.addons.map((a) => {
              const on = addons.includes(a.id), Icon = iconFor(a.icon)
              return (
                <button key={a.id} type="button" aria-pressed={on} onClick={() => setAddons((s) => (on ? s.filter((x) => x !== a.id) : [...s, a.id]))}
                  className={cn("card p-4 flex flex-col items-start gap-3 text-start transition-all border-2", on ? "!border-orange !bg-orange/8" : "hover:border-orange/50")}>
                  <span className={cn("w-11 h-11 rounded-2xl grid place-items-center transition-colors", on ? "bg-orange text-white" : "bg-muted text-orange")}><Icon size={22} /></span>
                  <b className="text-[15px] leading-snug">{L(a.name)}</b>
                  <span className="text-sm text-muted-foreground">+{fmt(a.price)} {cur}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 card p-6 md:p-7 overflow-hidden relative" id="build-form">
        <div className="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-orange/15 blur-2xl" />
        {step(4, t("ثبّت الموعد", "Lock the date"))}
        <div className="rounded-3xl bg-navy text-white p-5 mb-5 relative overflow-hidden dark:bg-[#1a2470]">
          <div className="dots absolute inset-0 opacity-20" />
          <small className="text-white/70 relative">{t("التكلفة التقديرية", "Estimated total")}</small>
          <div className="flex items-baseline gap-2 relative"><b className="text-4xl font-[family-name:var(--font-display)] text-sun">{fmt(shown)}</b><span className="text-white/80">{cur}</span></div>
          <AnimatePresence initial={false}>
            <motion.ul key={pkgId + addons.join()} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="list-none p-0 m-0 mt-3 grid gap-1 text-sm text-white/80 relative">
              <li className="flex justify-between"><span>{L(pkg.name)}</span><span>{fmt(pkg.price)}</span></li>
              {extraKids > 0 && <li className="flex justify-between"><span>{t("أطفال إضافيين", "Extra kids")} × {extraKids}</span><span>{fmt(extraKids * perExtra)}</span></li>}
              {addons.map((id) => { const a = c.addons.find((x) => x.id === id); return a && <li key={id} className="flex justify-between"><span>{L(a.name)}</span><span>{fmt(a.price)}</span></li> })}
            </motion.ul>
          </AnimatePresence>
        </div>
        <BookingForm type="party" extra={{ package: pkg.id, kids, addons }} fields={{ branch: true, date: true, time: true, notes: true }} summary={summary} estimate={total}
          submitLabel={t("احجز الحفلة", "Book the party")} />
      </aside>
    </div>
  )
}

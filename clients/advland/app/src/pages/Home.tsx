import { lazy, Suspense, useEffect, useRef } from "react"
import { ArrowUpRight, PartyPopper, Sparkles, MapPin, Clock, Crown, Users, Truck, ShieldCheck } from "lucide-react"
import CardDeckCarousel from "@/components/ui/card-deck-carousel"
import TestimonialsMarquee from "@/components/ui/testimonials-marquee"
import AdventureMap from "@/components/site/AdventureMap"
import { Layout, OpenPill } from "@/components/site/Layout"
import { Reveal, SectionHead, Eyebrow, useDark, branchColor, waLink, WhatsAppIcon, InstagramIcon } from "@/components/site/bits"
import { useI18n } from "@/lib/i18n"
import { useContent } from "@/lib/content"
import { openState, todayHours } from "@/lib/hours"
import { img, fmt, cn } from "@/lib/utils"

const BallPit = lazy(() => import("@/components/ui/ball-pit-hero"))

function Hero() {
  const { t } = useI18n()
  const { branches } = useContent()
  const dark = useDark()
  const fly = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const el = fly.current
    if (!el || matchMedia("(pointer: coarse)").matches) return
    const on = (e: PointerEvent) => {
      const x = (e.clientX / innerWidth - 0.5) * 30, y = (e.clientY / innerHeight - 0.5) * 24
      el.style.translate = `${x}px ${y}px`
    }
    addEventListener("pointermove", on, { passive: true })
    return () => removeEventListener("pointermove", on)
  }, [])
  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden -mt-[76px] pt-[76px] pb-[14vh]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#ffd60a33,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,#2b49d655,transparent_60%)]" />
      <div className="dots absolute inset-0 opacity-40 [mask-image:linear-gradient(#000,transparent_70%)]" />
      <Suspense fallback={null}><BallPit count={30} dark={dark} /></Suspense>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="wrap relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6 items-start pt-8 md:pt-14 pointer-events-none">
        <div className="flex flex-col items-start gap-6 pointer-events-auto">
          <Eyebrow>{t("مدينة ألعاب داخلية في العين · 3 فروع", "Indoor play city in Al Ain · 3 branches")}</Eyebrow>
          <h1 className="leading-[1.02] text-[clamp(3rem,9vw,6.2rem)]">
            <span className="mask-line"><span className="block hero-in text-red">{t("أرض", "Adventure")}</span></span>{" "}
            <span className="mask-line"><span className="block hero-in [animation-delay:.12s] text-navy dark:text-white">{t("المغامرات", "Land")}</span></span>
            <span className="block text-[.42em] mt-3 hero-in [animation-delay:.25s]">
              <span className="relative inline-block px-4 py-1 -rotate-2 bg-sun text-navy rounded-2xl shadow-[0_6px_0_#d9a800]">{t("بانتظارك!", "is waiting for you!")}</span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground m-0 max-w-xl hero-in [animation-delay:.35s]">
            {t("ترامبولين، تسلق، زحاليق عملاقة، رسم على الوجوه وحفلات أعياد ميلاد ما تنتسى. كل زيارة مغامرة جديدة لأطفالك.", "Trampolines, climbing, giant slides, face painting and unforgettable birthday parties. Every visit is a brand-new adventure.")}
          </p>
          <div className="flex flex-wrap gap-3 hero-in [animation-delay:.45s]">
            <a href="parties.html#build" className="btn btn-o text-lg"><PartyPopper size={20} />{t("احجز حفلة", "Book a party")}</a>
            <a href="zones.html" className="btn btn-n text-lg">{t("اكتشف الألعاب", "Explore zones")}<ArrowUpRight size={18} className="rtl:-scale-x-100" /></a>
          </div>
          <div className="flex flex-wrap gap-2 hero-in [animation-delay:.55s]">{branches.map((b) => <OpenPill key={b.id} id={b.id} />)}</div>
        </div>
        <div className="relative hidden lg:block h-full">
          <img ref={fly} src="img/m1-fly.webp" alt={t("أدفي، روبوت أرض المغامرات", "Advy, the Adventure Land robot")} className="absolute top-0 end-0 w-[92%] max-w-[520px] animate-float drop-shadow-[0_40px_40px_rgba(17,26,74,.35)] transition-[translate] duration-300 ease-out" />
        </div>
      </div>
      <div className="relative z-10 lg:hidden pointer-events-none -mt-6 mb-[18vh] flex justify-end wrap">
        <img src="img/m1-fly.webp" alt="" className="w-52 animate-float drop-shadow-xl" />
      </div>
    </section>
  )
}

function Band() {
  const { t } = useI18n()
  const words = [t("ترامبولين", "Trampolines"), t("جدار تسلق", "Climbing wall"), t("زحاليق عملاقة", "Giant slides"), t("حفلات أعياد ميلاد", "Birthday parties"), t("رسم على الوجوه", "Face painting"), t("بالونات", "Balloon art"), t("نينجا", "Ninja course"), t("تأجير منزلي", "Home rentals"), t("مهرج", "Clowns")]
  const Row = ({ cls, rev }: { cls: string; rev?: boolean }) => (
    <div className={cn("flex overflow-hidden [--gap:2.5rem] gap-[var(--gap)] py-4 select-none", cls)} dir="ltr">
      {[0, 1].map((k) => (
        <div key={k} className={cn("flex shrink-0 gap-[var(--gap)] items-center animate-marquee", rev && "[animation-direction:reverse]")} aria-hidden={k === 1}>
          {words.map((w, i) => <span key={i} className="flex items-center gap-[var(--gap)] whitespace-nowrap text-xl md:text-3xl font-bold font-[family-name:var(--font-display)]">{w}<span className="text-[.8em]">✦</span></span>)}
        </div>
      ))}
    </div>
  )
  return (
    <div className="relative py-10 overflow-hidden">
      <Row cls="bg-navy text-sun -rotate-2 scale-105 dark:bg-[#1a2470]" />
      <Row cls="stripe text-white rotate-1 scale-105 -mt-3" rev />
    </div>
  )
}

function Stats() {
  const { t } = useI18n()
  const items = [
    { n: "+20K", l: t("عائلة تتابعنا على إنستغرام", "families follow us on Instagram"), c: "bg-orange text-white", icon: InstagramIcon },
    { n: "3", l: t("فروع في مولات العين", "branches in Al Ain malls"), c: "bg-navy text-white dark:bg-[#1a2470]", icon: MapPin },
    { n: "6", l: t("مناطق لعب مختلفة", "different play zones"), c: "bg-sun text-navy", icon: Sparkles },
    { n: "1-12", l: t("سنة: لكل عمر مغامرته", "years: an adventure for every age"), c: "bg-surface border border-border", icon: Users },
  ]
  return (
    <section className="wrap grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 -mt-4">
      {items.map((s, i) => (
        <Reveal key={i} delay={i * 80} className={cn("rounded-[28px] p-5 md:p-7 flex flex-col gap-2 relative overflow-hidden", s.c)}>
          <s.icon size={26} />
          <b className="text-[clamp(2rem,5vw,3.4rem)] leading-none font-[family-name:var(--font-display)] mt-2" dir="ltr">{s.n}</b>
          <span className="text-sm md:text-base opacity-85 font-semibold">{s.l}</span>
        </Reveal>
      ))}
    </section>
  )
}

function PartiesTeaser() {
  const { t, L } = useI18n()
  const c = useContent()
  return (
    <section className="wrap mt-28">
      <div className="relative rounded-[32px] md:rounded-[40px] bg-navy-deep text-white overflow-hidden p-5 md:p-12 lg:p-16">
        <div className="dots absolute inset-0 opacity-[.12]" />
        <div className="absolute -top-24 end-[-10%] w-[480px] h-[480px] rounded-full bg-orange/40 blur-3xl" />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <div className="flex flex-col gap-5 items-start relative">
            <img src="img/m3-party.webp" alt="" loading="lazy" className="absolute bottom-[-30px] end-[-10px] w-32 md:w-44 animate-wiggle hidden sm:block pointer-events-none" />
            <Eyebrow className="!bg-white/10 !text-sun">{t("حفلات أعياد الميلاد", "Birthday parties")}</Eyebrow>
            <h2 className="text-[clamp(2rem,4.6vw,3.6rem)]">{t("حفلة عيد ميلاد", "A birthday party")} <span className="text-orange glow-o">{t("بدون أي تعب", "with zero stress")}</span></h2>
            <p className="text-white/75 text-lg m-0">{t("ديكور بالونات، رسم على الوجوه، مهرج، بوب كورن وروبوتنا أدفي بنفسه. اختر باقتك، احسب التكلفة فوراً واحجز أونلاين خلال دقيقة.", "Balloon decor, face painting, a clown, popcorn and Advy the robot himself. Pick a package, see the price instantly and book online in a minute.")}</p>
            <a href="parties.html#build" className="btn btn-o text-lg"><PartyPopper size={20} />{t("صمّم حفلتك", "Build your party")}</a>
          </div>
          <div className="relative">
            <div className="grid gap-3">
              {c.packages.map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <a href="parties.html#build" className={cn("flex items-center gap-3 sm:gap-4 rounded-3xl p-3.5 sm:p-4 md:p-5 transition-all hover:-translate-y-1", p.featured ? "bg-orange shadow-[0_20px_40px_-18px_#f26a1b]" : "bg-white/8 hover:bg-white/12 border border-white/10")}>
                    <span className={cn("w-14 h-14 rounded-2xl hidden sm:grid place-items-center shrink-0", p.featured ? "bg-white text-orange" : "bg-white/10 text-sun")}>{p.featured ? <Crown /> : <PartyPopper />}</span>
                    <div className="flex-1 min-w-0"><b className="block text-base sm:text-lg leading-snug font-[family-name:var(--font-display)]">{L(p.name)}</b><small className="text-white/75">{p.kids} {t("طفل", "kids")} · {L(p.duration)}</small></div>
                    <div className="text-end shrink-0"><b className="text-xl sm:text-2xl font-[family-name:var(--font-display)]">{fmt(p.price)}</b><small className="block text-white/75">{L(c.settings.currency)}</small></div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RentalsRail() {
  const { t, L } = useI18n()
  const c = useContent()
  return (
    <section className="mt-28">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <SectionHead eyebrow={t("تأجير منزلي في العين", "Home rentals in Al Ain")} title={t("نجيب المغامرة لباب بيتك", "We bring the adventure to your door")} sub={t("ملعب صابوني، زحليقة مائية، قلعة نطاطة وعربة بوب كورن. نوصّل ونركّب ونرجع ناخذها.", "Soap football, water slides, bouncy castles and popcorn carts. We deliver, set up and collect.")} />
        <a href="rentals.html" className="btn btn-g">{t("كل ألعاب التأجير", "All rentals")}<ArrowUpRight size={18} className="rtl:-scale-x-100" /></a>
      </div>
      <div className="mt-10 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-[max(16px,calc((100%-1200px)/2))] pb-6">
        {c.rentals.map((r, i) => (
          <a key={r.id} href={`rentals.html#${r.id}`} className="snap-start shrink-0 w-[78%] sm:w-[340px] card overflow-hidden group" style={{ rotate: `${i % 2 ? 1 : -1}deg` }}>
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {r.img ? <img src={img(r.img)} alt={L(r.name)} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full grid place-items-center"><Truck size={48} className="text-orange" /></div>}
              <span className="absolute bottom-3 start-3 chip !bg-white/95 !text-navy !font-bold">{fmt(r.price)} {L(c.settings.currency)} / {t("يوم", "day")}</span>
            </div>
            <div className="p-5"><h3 className="text-xl">{L(r.name)}</h3><p className="m-0 mt-1 text-sm text-muted-foreground line-clamp-2">{L(r.desc)}</p></div>
          </a>
        ))}
      </div>
    </section>
  )
}

function Gallery() {
  const { t } = useI18n()
  const slides = [
    { image: "img/park-wide.webp", title: t("المدينة كلها لك", "The whole city is yours"), caption: t("مساحات واسعة ومبطنة بالكامل", "Wide, fully padded play spaces") },
    { image: "img/p-balloons.webp", title: t("ديكور بالونات", "Balloon decor"), caption: t("بألوان حفلتك", "In your party colours") },
    { image: "img/z-trampoline.webp", title: t("قفز بلا حدود", "Bounce sky-high"), caption: t("ترامبولين آمن مع مشرفين", "Safe trampolines with supervisors") },
    { image: "img/p-face.webp", title: t("رسم على الوجوه", "Face painting"), caption: t("فنانين محترفين بألوان آمنة", "Pro artists, skin-safe colours") },
    { image: "img/z-slides.webp", title: t("زحاليق عملاقة", "Giant slides"), caption: t("ضحك من فوق لتحت", "Laughs all the way down") },
    { image: "img/f-snacks.webp", title: t("بوب كورن وعصائر", "Popcorn & drinks"), caption: t("استراحة المغامرين", "The adventurers' pit stop") },
    { image: "img/z-climb.webp", title: t("جدار التسلق", "Climbing wall"), caption: t("للأبطال الصغار", "For little heroes") },
  ]
  return (
    <section className="mt-28 wrap grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
      <SectionHead eyebrow={t("لحظات من أرض المغامرات", "Moments at Adventure Land")} title={t("اسحب الصور وشوف الجو بنفسك", "Swipe through and feel the vibe")} sub={t("كل يوم عندنا لحظات حلوة. تابعنا على إنستغرام لتشوف الجديد أول بأول.", "Every day brings new moments. Follow us on Instagram for the latest.")} />
      <Reveal><CardDeckCarousel slides={slides} height={720} autoplay={4200} labels={{ prev: t("السابق", "Previous"), next: t("التالي", "Next") }} /></Reveal>
    </section>
  )
}

function Reviews() {
  const { t, L } = useI18n()
  const { reviews } = useContent()
  return (
    <section className="mt-28">
      <SectionHead center eyebrow={t("آراء الأهالي", "What parents say")} title={t("ضحكات أطفالهم تحكي", "Their kids' laughs say it all")} className="wrap" />
      <TestimonialsMarquee className="mt-10" items={reviews.map((r) => ({ name: L(r.name), text: L(r.text), stars: r.stars }))} />
    </section>
  )
}

function Branches() {
  const { t, L } = useI18n()
  const { branches } = useContent()
  return (
    <section className="wrap mt-28">
      <SectionHead eyebrow={t("فروعنا", "Our branches")} title={t("أقرب مغامرة لبيتك", "The nearest adventure to you")} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {branches.map((b, i) => {
          const o = openState(b), h = todayHours(b), col = branchColor(b.color)
          return (
            <Reveal key={b.id} delay={i * 90}>
              <div className="card p-6 h-full flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full opacity-20" style={{ background: col }} />
                <span className="w-12 h-12 rounded-2xl grid place-items-center text-white" style={{ background: col }}><MapPin /></span>
                <div><h3 className="text-2xl">{L(b.name)}</h3><p className="m-0 text-muted-foreground">{L(b.floor)} · {L(b.city)}</p></div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: o.isOpen ? "#1fbf63" : "#e5484d" }} />
                  {o.isOpen ? t("مفتوح الآن", "Open now") : t("مغلق الآن", "Closed now")}
                  <span className="text-muted-foreground font-medium flex items-center gap-1"><Clock size={14} />{h[0]} - {o.closes}</span>
                </div>
                <a href={b.map} target="_blank" rel="noopener" className="btn btn-g mt-auto">{t("الاتجاهات", "Directions")}<ArrowUpRight size={16} className="rtl:-scale-x-100" /></a>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

export function FinalCta() {
  const { t } = useI18n()
  const { settings } = useContent()
  return (
    <section className="wrap mt-28">
      <div className="relative rounded-[40px] stripe overflow-hidden px-6 py-14 md:p-16 text-white">
        <div className="absolute inset-0 bg-gradient-to-l from-orange-deep/70 to-transparent rtl:bg-gradient-to-r" />
        <div className="relative max-w-2xl flex flex-col gap-5 items-start">
          <h2 className="text-[clamp(2rem,5vw,3.8rem)]">{t("جاهزين للمغامرة الجاية؟", "Ready for the next adventure?")}</h2>
          <p className="text-white/90 text-lg m-0">{t("احجز حفلة، اطلب لعبة لبيتك، أو بس تعال العب. إحنا بانتظارك!", "Book a party, rent a game for home, or just come and play. We're waiting for you!")}</p>
          <div className="flex flex-wrap gap-3">
            <a href="parties.html#build" className="btn btn-n">{t("احجز حفلة", "Book a party")}</a>
            <a href={waLink(settings.whatsapp, t("مرحباً أرض المغامرات 👋", "Hi Adventure Land 👋"))} target="_blank" rel="noopener" className="btn btn-wa"><WhatsAppIcon />{t("واتساب", "WhatsApp")}</a>
          </div>
        </div>
        <img src="img/m2-jump.webp" alt="" loading="lazy" className="absolute end-[-10px] md:end-10 bottom-[-20px] w-40 md:w-72 animate-float pointer-events-none" />
      </div>
    </section>
  )
}

export default function Home() {
  const { t } = useI18n()
  return (
    <Layout page="home">
      <Hero />
      <Band />
      <Stats />
      <section className="wrap mt-28">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <SectionHead eyebrow={t("خريطة المغامرة", "The adventure map")} title={<>{t("6 محطات، ", "6 stops, ")}<span className="text-orange">{t("ومغامرة وحدة", "one big adventure")}</span></>} sub={t("انزل مع أدفي على الطريق واكتشف كل منطقة لعب في أرض المغامرات.", "Scroll down the trail with Advy and discover every play zone.")} />
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ShieldCheck size={18} className="text-[#1fa855]" />{t("مشرفين في كل منطقة", "Supervisors in every zone")}</div>
        </div>
        <AdventureMap />
      </section>
      <PartiesTeaser />
      <RentalsRail />
      <Gallery />
      <Reviews />
      <Branches />
      <FinalCta />
    </Layout>
  )
}

import { useState } from "react"
import { ChevronDown, ShieldCheck, Footprints, SprayCan, HeartHandshake, Baby, Check, Truck, CalendarCheck, PartyPopper, MapPin, Clock, ArrowUpRight, Phone, Mail, Navigation } from "lucide-react"
import TiltStackScroll from "@/components/ui/tilt-stack-scroll"
import CardDeckCarousel from "@/components/ui/card-deck-carousel"
import PageHero from "@/components/site/PageHero"
import PartyBuilder from "@/components/site/PartyBuilder"
import { Layout } from "@/components/site/Layout"
import { BookingForm, TrackBooking } from "@/components/site/booking"
import { Reveal, SectionHead, InstagramIcon, WhatsAppIcon, branchColor, waLink } from "@/components/site/bits"
import { FinalCta } from "./Home"
import { useI18n } from "@/lib/i18n"
import { useContent } from "@/lib/content"
import { openState, isWeekend, uaeNow } from "@/lib/hours"
import { img, fmt, cn } from "@/lib/utils"

const ACC = ["#f26a1b", "#2b49d6", "#c8161d", "#1fa855", "#e0a800", "#2aa8de"]

export function Faq({ className }: { className?: string }) {
  const { t, L } = useI18n()
  const { faq } = useContent()
  const [open, setOpen] = useState(0)
  return (
    <section className={cn("wrap mt-28 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10", className)}>
      <SectionHead eyebrow={t("أسئلة شائعة", "FAQ")} title={t("عندك سؤال؟", "Got a question?")} sub={t("هذه أكثر الأسئلة اللي توصلنا. ما لقيت جوابك؟ راسلنا على واتساب.", "These are the questions we hear most. Didn't find yours? Message us on WhatsApp.")} />
      <div className="grid gap-3">
        {faq.map((f, i) => (
          <Reveal key={i} delay={i * 60} className="card overflow-hidden">
            <button className="w-full flex items-center justify-between gap-4 p-5 text-start font-bold text-lg font-[family-name:var(--font-display)]" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              {L(f.q)}<ChevronDown className={cn("shrink-0 transition-transform duration-300 text-orange", open === i && "rotate-180")} />
            </button>
            <div className={cn("grid transition-[grid-template-rows] duration-500", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden"><p className="m-0 px-5 pb-5 text-muted-foreground">{L(f.a)}</p></div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Zones ---------------- */
export function Zones() {
  const { t, L } = useI18n()
  const { zones } = useContent()
  const cards = zones.map((z, i) => ({
    title: L(z.title), kicker: `${String(i + 1).padStart(2, "0")} · ${L(z.tag)}`, description: L(z.desc), image: img(z.img), alt: L(z.title),
    tags: [L(z.age), t("مشرفين", "Supervised"), t("مبطن بالكامل", "Fully padded")], cta: t("احجز زيارة", "Plan a visit"), href: "contact.html", accent: ACC[i % 6],
  }))
  const safety = [
    { i: ShieldCheck, h: t("مشرفين مدربين", "Trained supervisors"), p: t("في كل منطقة لعب طوال ساعات العمل.", "In every zone during all opening hours.") },
    { i: Footprints, h: t("جوارب مانعة للانزلاق", "Grip socks"), p: t("إلزامية داخل مناطق القفز والتسلق.", "Required in jumping and climbing zones.") },
    { i: SprayCan, h: t("تعقيم يومي", "Cleaned daily"), p: t("تعقيم الألعاب والأسطح أكثر من مرة يومياً.", "Toys and surfaces sanitised several times a day.") },
    { i: Baby, h: t("مناطق حسب العمر", "Age-based zones"), p: t("منطقة خاصة للصغار بعيداً عن الأكبر سناً.", "A dedicated toddler area away from older kids.") },
  ]
  return (
    <Layout page="zones">
      <PageHero eyebrow={t("مناطق اللعب", "Play zones")} title={<>{t("6 عوالم ", "6 worlds ")}<span className="text-orange">{t("تحت سقف واحد", "under one roof")}</span></>}
        sub={t("من أول قفزة على الترامبولين لآخر زحليقة: كل منطقة مصممة عشان أطفالك يلعبوا بأمان ويضحكوا من قلب.", "From the first bounce to the last slide: every zone is built so your kids play safely and laugh out loud.")}
        image="img/park-wide.webp" mascot="img/m4-guide.webp">
        <div className="flex flex-wrap gap-2">{zones.map((z) => <a key={z.id} href={`#${z.id}`} className="chip hover:!bg-orange hover:!text-white transition-colors">{L(z.title)}</a>)}</div>
      </PageHero>
      {zones.map((z) => <span key={z.id} id={z.id} className="block relative -top-24" />)}
      <TiltStackScroll cards={cards} eyebrow={t("جولة في المناطق", "Zone tour")} heading={t("انزل واكتشف كل عالم", "Scroll to explore every world")} />
      <section className="wrap mt-24">
        <SectionHead center eyebrow={t("الأمان أولاً", "Safety first")} title={t("أنت ارتاح، وهم يلعبوا", "You relax, they play")} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {safety.map((s, i) => (
            <Reveal key={i} delay={i * 80} className="card p-6 flex flex-col gap-3">
              <span className="w-12 h-12 rounded-2xl grid place-items-center text-white" style={{ background: ACC[i] }}><s.i /></span>
              <h3 className="text-lg">{s.h}</h3><p className="m-0 text-muted-foreground text-[15px]">{s.p}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <Faq />
      <FinalCta />
    </Layout>
  )
}

/* ---------------- Parties ---------------- */
export function Parties() {
  const { t } = useI18n()
  const steps = [
    { h: t("اختر الباقة والإضافات", "Pick package & extras"), p: t("وشوف السعر التقديري فوراً.", "And see the estimate instantly.") },
    { h: t("أرسل الطلب", "Send the request"), p: t("بالتاريخ والفرع اللي يناسبك.", "With the date and branch you prefer.") },
    { h: t("نأكد معك", "We confirm"), p: t("على واتساب خلال ساعات العمل.", "On WhatsApp during opening hours.") },
    { h: t("احتفلوا!", "Celebrate!"), p: t("وخلي الترتيب والتنظيف علينا.", "We handle setup and cleanup.") },
  ]
  return (
    <Layout page="parties">
      <PageHero eyebrow={t("حفلات أعياد الميلاد", "Birthday parties")} title={<>{t("حفلة ", "A party ")}<span className="text-orange">{t("يتذكرها", "they'll remember")}</span> {t("طول العمر", "forever")}</>}
        sub={t("ديكور بالونات، رسم على الوجوه، مهرج، بوب كورن وظهور خاص للروبوت أدفي. صمّم حفلتك هنا واحجزها بدقيقة.", "Balloon decor, face painting, a clown, popcorn and a special appearance by Advy the robot. Build your party here and book it in a minute.")}
        image="img/p-balloons.webp" mascot="img/m3-party.webp">
        <a href="#build" className="btn btn-o text-lg"><PartyPopper size={20} />{t("ابدأ التصميم", "Start building")}</a>
      </PageHero>
      <section className="wrap">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 80} className="rounded-[28px] bg-muted p-5 flex flex-col gap-2">
              <b className="text-4xl font-[family-name:var(--font-display)] text-orange">{i + 1}</b>
              <h3 className="text-lg">{s.h}</h3><p className="m-0 text-sm text-muted-foreground">{s.p}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="build" className="wrap mt-24 scroll-mt-24">
        <SectionHead eyebrow={t("صمّم حفلتك", "Party builder")} title={t("4 خطوات وحفلتك جاهزة", "4 steps to your perfect party")} className="mb-10" />
        <PartyBuilder />
      </section>
      <section className="wrap mt-28 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <Reveal><CardDeckCarousel height={700} autoplay={3800} labels={{ prev: t("السابق", "Previous"), next: t("التالي", "Next") }} slides={[
          { image: "img/p-balloons.webp", title: t("ديكور بالونات", "Balloon decor") },
          { image: "img/p-face.webp", title: t("رسم على الوجوه", "Face painting") },
          { image: "img/f-snacks.webp", title: t("بوب كورن وعصائر", "Popcorn & drinks") },
          { image: "img/park-wide.webp", title: t("كل المناطق لضيوفك", "All zones for your guests") },
        ]} /></Reveal>
        <SectionHead eyebrow={t("ليش أرض المغامرات؟", "Why Adventure Land?")} title={t("إنت جيب الكيكة، والباقي علينا", "You bring the cake, we do the rest")}
          sub={<span className="grid gap-2 mt-2">{[t("قاعة حفلات مزينة بألوانك", "A party room in your colours"), t("منظم حفلة مخصص من البداية للنهاية", "A dedicated party host start to finish"), t("ألعاب وأنشطة لكل الأعمار", "Games and activities for every age"), t("تصوير احترافي (إضافة)", "Pro photography (add-on)")].map((x, i) => <span key={i} className="flex gap-2 items-start"><Check className="text-[#1fa855] shrink-0 mt-1" size={18} strokeWidth={3} />{x}</span>)}</span>} />
      </section>
      <Faq />
    </Layout>
  )
}

/* ---------------- Rentals ---------------- */
export function Rentals() {
  const { t, L } = useI18n()
  const c = useContent()
  const cur = L(c.settings.currency)
  const [sel, setSel] = useState<string[]>([])
  const total = sel.reduce((s, id) => s + (c.rentals.find((r) => r.id === id)?.price ?? 0), 0)
  const summary = [t("طلب تأجير منزلي 🏠", "Home rental request 🏠"), ...sel.map((id) => { const r = c.rentals.find((x) => x.id === id); return r ? `• ${L(r.name)} (${fmt(r.price)} ${cur})` : "" }), t("التقدير: ", "Estimate: ") + fmt(total) + " " + cur].join("\n")
  const how = [
    { i: Check, h: t("اختر الألعاب", "Pick the games") }, { i: CalendarCheck, h: t("حدد اليوم والعنوان", "Set the day & address") },
    { i: Truck, h: t("نوصّل ونركّب", "We deliver & set up") }, { i: HeartHandshake, h: t("نرجع ناخذها", "We collect afterwards") },
  ]
  return (
    <Layout page="rentals">
      <PageHero eyebrow={t("تأجير ألعاب منزلي · العين", "Home game rentals · Al Ain")} title={<>{t("حوّل بيتك إلى ", "Turn your home into ")}<span className="text-orange">{t("أرض مغامرات", "Adventure Land")}</span></>}
        sub={t("ملعب صابوني، زحليقة مائية، قلعة نطاطة وأكثر. توصيل وتركيب داخل مدينة العين.", "Soap football, water slides, bouncy castles and more. Delivery and setup across Al Ain.")}
        image="img/r-football.webp" mascot="img/m2-jump.webp">
        <a href="#pick" className="btn btn-o text-lg"><Truck size={20} />{t("اختر ألعابك", "Pick your games")}</a>
      </PageHero>
      <section className="wrap">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {how.map((s, i) => (
            <Reveal key={i} delay={i * 70} className="flex items-center gap-3 rounded-3xl bg-muted p-4">
              <span className="w-11 h-11 rounded-2xl grid place-items-center bg-surface text-orange shrink-0"><s.i size={20} /></span><b className="text-[15px] leading-snug">{s.h}</b>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="pick" className="wrap mt-24 scroll-mt-24 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div>
          <SectionHead eyebrow={t("الكتالوج", "Catalogue")} title={t("اختر لعبة أو أكثر", "Choose one or more")} className="mb-8" />
          <div className="grid sm:grid-cols-2 gap-4">
            {c.rentals.map((r) => {
              const on = sel.includes(r.id)
              return (
                <button key={r.id} id={r.id} type="button" aria-pressed={on} onClick={() => setSel((s) => (on ? s.filter((x) => x !== r.id) : [...s, r.id]))}
                  className={cn("card overflow-hidden text-start group border-2 transition-all scroll-mt-28", on ? "!border-orange -translate-y-1 shadow-[0_24px_50px_-24px_#f26a1b]" : "hover:-translate-y-0.5")}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {r.img ? <img src={img(r.img)} alt={L(r.name)} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full grid place-items-center bg-gradient-to-br from-sun/40 to-orange/30"><PartyPopper size={56} className="text-orange" /></div>}
                    <span className={cn("absolute top-3 end-3 w-9 h-9 rounded-full grid place-items-center border-2 transition-colors", on ? "bg-orange border-orange text-white" : "bg-white/90 border-white text-transparent")}><Check size={18} strokeWidth={3} /></span>
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between gap-3 items-start"><h3 className="text-xl">{L(r.name)}</h3><b className="text-orange whitespace-nowrap font-[family-name:var(--font-display)]">{fmt(r.price)} <small className="text-muted-foreground font-medium">{cur}</small></b></div>
                    <p className="m-0 text-sm text-muted-foreground">{L(r.desc)}</p>
                    {r.size && <span className="chip self-start" dir="ltr">{r.size}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 card p-6 md:p-7">
          <h3 className="text-2xl mb-1">{t("طلب التأجير", "Rental request")}</h3>
          <p className="text-muted-foreground text-sm mt-0">{sel.length ? t(`${sel.length} لعبة مختارة`, `${sel.length} selected`) : t("اختر لعبة واحدة على الأقل", "Pick at least one game")}</p>
          <div className="rounded-3xl bg-navy text-white p-5 mb-5 dark:bg-[#1a2470]">
            <small className="text-white/70">{t("التكلفة لليوم الواحد", "Price per day")}</small>
            <div className="flex items-baseline gap-2"><b className="text-4xl font-[family-name:var(--font-display)] text-sun">{fmt(total)}</b><span className="text-white/80">{cur}</span></div>
          </div>
          <BookingForm type="rental" extra={{ items: sel }} fields={{ date: true, address: true, notes: true }} summary={summary} estimate={total}
            disabled={!sel.length} disabledHint={t("اختر لعبة من الكتالوج أولاً", "Choose a game from the catalogue first")} submitLabel={t("اطلب التأجير", "Request rental")} />
        </aside>
      </section>
      <FinalCta />
    </Layout>
  )
}

/* ---------------- Branches ---------------- */
export function Branches() {
  const { t, L } = useI18n()
  const { branches } = useContent()
  const wk = isWeekend(uaeNow().getDay())
  return (
    <Layout page="branches">
      <PageHero eyebrow={t("الفروع وأوقات العمل", "Branches & hours")} title={<>{t("3 فروع في ", "3 branches in ")}<span className="text-orange">{t("قلب العين", "the heart of Al Ain")}</span></>}
        sub={t("الجيمي مول، مول العين وعالية مول. شوف مين مفتوح الآن وخذ الاتجاهات بضغطة.", "Al Jimi Mall, Al Ain Mall and Aliah Mall. See who's open right now and get directions in one tap.")}
        image="img/z-slides.webp" mascot="img/m4-guide.webp" />
      <section className="wrap grid grid-cols-1 lg:grid-cols-3 gap-5">
        {branches.map((b, i) => {
          const o = openState(b), col = branchColor(b.color)
          return (
            <Reveal key={b.id} delay={i * 90} className="card overflow-hidden flex flex-col">
              <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${col}, ${col}aa)` }}>
                <div className="dots absolute inset-0 opacity-30" />
                <MapPin className="absolute top-6 start-6 text-white" size={40} />
                <span className="absolute bottom-4 start-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold" style={{ color: o.isOpen ? "#138040" : "#c8161d" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: o.isOpen ? "#1fbf63" : "#e5484d" }} />
                  {o.isOpen ? t(`مفتوح · يغلق ${o.closes}`, `Open · closes ${o.closes}`) : t(`مغلق · يفتح ${o.opens}`, `Closed · opens ${o.opens}`)}
                </span>
                <b className="absolute top-5 end-6 text-white/25 text-7xl font-[family-name:var(--font-display)]">0{i + 1}</b>
              </div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div><h3 className="text-2xl">{L(b.name)}</h3><p className="m-0 text-muted-foreground">{L(b.floor)} · {L(b.city)}</p></div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className={cn(!wk && "font-bold text-orange")}><td className="py-1.5">{t("الأحد إلى الأربعاء", "Sun to Wed")}</td><td className="text-end" dir="ltr">{b.hours.weekday[0]} - {b.hours.weekday[1]}</td></tr>
                    <tr className={cn(wk && "font-bold text-orange")}><td className="py-1.5">{t("الخميس إلى السبت", "Thu to Sat")}</td><td className="text-end" dir="ltr">{b.hours.weekend[0]} - {b.hours.weekend[1]}</td></tr>
                  </tbody>
                </table>
                <a href={b.map} target="_blank" rel="noopener" className="btn btn-o mt-auto"><Navigation size={18} />{t("افتح في الخرائط", "Open in Maps")}</a>
              </div>
            </Reveal>
          )
        })}
      </section>
      <section className="wrap mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <SectionHead eyebrow={t("حجزت عندنا؟", "Booked with us?")} title={t("تابع حالة طلبك لحظة بلحظة", "Follow your request in real time")} sub={t("اكتب رقم الطلب اللي وصلك بعد الحجز مع رقم جوالك.", "Enter the request number you received with your mobile number.")} />
        <TrackBooking />
      </section>
      <FinalCta />
    </Layout>
  )
}

/* ---------------- Contact ---------------- */
export function Contact() {
  const { t } = useI18n()
  const { settings: s } = useContent()
  const ways = [
    { i: WhatsAppIcon, h: t("واتساب", "WhatsApp"), v: s.phone, href: waLink(s.whatsapp, t("مرحباً أرض المغامرات 👋", "Hi Adventure Land 👋")), c: "#1fa855" },
    { i: Phone, h: t("اتصل بنا", "Call us"), v: s.landline, href: `tel:${s.landline.replace(/\s/g, "")}`, c: "#f26a1b" },
    { i: Mail, h: t("البريد", "Email"), v: s.email, href: `mailto:${s.email}`, c: "#2b49d6" },
    { i: InstagramIcon, h: t("إنستغرام", "Instagram"), v: "@" + s.instagram, href: `https://instagram.com/${s.instagram}`, c: "#c8161d" },
  ]
  return (
    <Layout page="contact">
      <PageHero eyebrow={t("تواصل معنا", "Contact us")} title={<>{t("قول ", "Say ")}<span className="text-orange">{t("مرحبا!", "hello!")}</span></>}
        sub={t("استفسار، حجز زيارة مدرسية، أو فكرة حفلة؟ اكتب لنا وبنرد عليك بأسرع وقت.", "A question, a school trip, or a party idea? Drop us a line and we'll get back to you fast.")}
        image="img/z-toddler.webp" mascot="img/m1-fly.webp" />
      <section className="wrap grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ways.map((w, i) => (
          <Reveal key={i} delay={i * 70}>
            <a href={w.href} target={w.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="card p-6 flex flex-col gap-3 h-full hover:-translate-y-1.5 transition-transform group">
              <span className="w-12 h-12 rounded-2xl grid place-items-center text-white group-hover:rotate-[-8deg] transition-transform" style={{ background: w.c }}><w.i size={22} /></span>
              <small className="text-muted-foreground font-semibold">{w.h}</small>
              <b className="text-lg break-all font-[family-name:var(--font-display)]" dir="ltr" style={{ textAlign: "start" }}><bdi>{w.v}</bdi></b>
              <ArrowUpRight size={18} className="text-orange rtl:-scale-x-100 mt-auto" />
            </a>
          </Reveal>
        ))}
      </section>
      <section className="wrap mt-20 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <div className="card p-6 md:p-8">
          <h2 className="text-3xl mb-2">{t("أرسل لنا رسالة", "Send us a message")}</h2>
          <p className="text-muted-foreground mt-0 mb-6">{t("بتوصل مباشرة لفريق أرض المغامرات.", "It goes straight to the Adventure Land team.")}</p>
          <BookingForm type="contact" fields={{ branch: true, notes: true }} summary={t("رسالة من الموقع ✉️", "Website message ✉️")} submitLabel={t("أرسل الرسالة", "Send message")} />
        </div>
        <div className="grid gap-6">
          <TrackBooking />
          <div className="card p-6 flex items-center gap-4">
            <Clock className="text-orange shrink-0" size={30} />
            <p className="m-0 text-[15px]">{t("أسرع رد يكون على واتساب خلال ساعات العمل. ", "The fastest reply is on WhatsApp during opening hours. ")}<a href="branches.html" className="text-orange font-bold">{t("شوف الأوقات", "See hours")}</a></p>
          </div>
        </div>
      </section>
      <Faq />
    </Layout>
  )
}

import { useEffect, useState, type ReactNode } from "react"
import { House, Sparkles, PartyPopper, Truck, MapPin, MessageCircle, Phone, Mail, X } from "lucide-react"
import { NavBar, type NavItem } from "@/components/ui/tubelight-navbar"
import { SunMoonThemeToggle } from "@/components/ui/sun-moon-theme-toggle"
import { useI18n } from "@/lib/i18n"
import { useContent } from "@/lib/content"
import { openState } from "@/lib/hours"
import { cn } from "@/lib/utils"
import { InstagramIcon, WhatsAppIcon, branchColor, waLink } from "./bits"

export type PageId = "home" | "zones" | "parties" | "rentals" | "branches" | "contact"

export function useNav(): NavItem[] {
  const { t } = useI18n()
  return [
    { id: "home", name: t("الرئيسية", "Home"), url: "./", icon: House },
    { id: "zones", name: t("الألعاب", "Zones"), url: "zones.html", icon: Sparkles },
    { id: "parties", name: t("الحفلات", "Parties"), url: "parties.html", icon: PartyPopper },
    { id: "rentals", name: t("التأجير", "Rentals"), url: "rentals.html", icon: Truck },
    { id: "branches", name: t("الفروع", "Branches"), url: "branches.html", icon: MapPin },
    { id: "contact", name: t("تواصل", "Contact"), url: "contact.html", icon: MessageCircle },
  ]
}

function LangSwitch() {
  const { lang, setLang } = useI18n()
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="h-10 min-w-10 px-3 rounded-full border border-border bg-surface/70 backdrop-blur font-bold text-sm hover:border-orange hover:text-orange transition-colors"
      aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      style={{ fontFamily: lang === "ar" ? "Manrope, sans-serif" : "'IBM Plex Sans Arabic', sans-serif" }}
    >
      {lang === "ar" ? "EN" : "عربي"}
    </button>
  )
}

function Announcement() {
  const { settings } = useContent()
  const { L } = useI18n()
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem("adv-ann") === "0" } catch { return false } })
  if (!settings.announcement?.on || hidden || !L(settings.announcement)) return null
  return (
    <div className="stripe text-white text-[13px] sm:text-sm font-semibold relative z-[60]">
      <div className="wrap flex items-center justify-center gap-3 py-2 text-center">
        <PartyPopper size={16} className="shrink-0" />
        <a href="parties.html" className="hover:underline underline-offset-4">{L(settings.announcement)}</a>
        <button aria-label="close" className="absolute end-3 opacity-80 hover:opacity-100" onClick={() => { setHidden(true); try { sessionStorage.setItem("adv-ann", "0") } catch {} }}><X size={16} /></button>
      </div>
    </div>
  )
}

function Header({ page }: { page: PageId }) {
  const { t } = useI18n()
  const nav = useNav()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(scrollY > 30)
    on(); addEventListener("scroll", on, { passive: true })
    return () => removeEventListener("scroll", on)
  }, [])
  return (
    <>
      <header className={cn("sticky top-0 z-50 transition-all duration-500", scrolled ? "py-2" : "py-3 md:py-4")}>
        <div className={cn("absolute inset-0 -z-10 transition-opacity duration-500 border-b border-border bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] backdrop-blur-xl", scrolled ? "opacity-100" : "opacity-0")} />
        <div className="wrap flex items-center gap-3">
          <a href="./" className="flex items-center gap-2.5 shrink-0 group" aria-label="Adventure Land">
            <img src="img/logo-512.webp" alt="" width={48} height={48} className={cn("rounded-full transition-all duration-500 group-hover:rotate-[-12deg]", scrolled ? "w-10 h-10" : "w-12 h-12")} />
            <span className="leading-none hidden sm:flex flex-col">
              <b className="font-[family-name:var(--font-display)] text-[17px]"><span className="text-red">{t("أرض", "ADVENTURE")}</span> <span className="text-navy dark:text-white">{t("المغامرات", "LAND")}</span></b>
              <small className="text-[11px] text-muted-foreground font-semibold mt-1 tracking-wide">{t("Adventure Land · العين", "أرض المغامرات · Al Ain")}</small>
            </span>
          </a>
          <div className="flex-1 flex justify-center">
            <NavBar items={nav} active={page} className="hidden lg:block lg:static lg:left-auto lg:translate-x-0 lg:pt-0 lg:mb-0" />
          </div>
          <div className="flex items-center gap-2">
            <LangSwitch />
            <SunMoonThemeToggle size={40} aria-label={t("الوضع الليلي", "Dark mode")} />
            <a href="parties.html#build" className="btn btn-o !py-2.5 !px-4 text-sm hidden lg:inline-flex">{t("احجز حفلة", "Book a party")}</a>
          </div>
        </div>
      </header>
      <NavBar items={nav} active={page} className="lg:hidden" />
    </>
  )
}

function Footer() {
  const { t, L } = useI18n()
  const c = useContent()
  const s = c.settings
  const nav = useNav()
  return (
    <footer className="relative mt-24 bg-navy-deep text-white overflow-hidden pb-28 lg:pb-10">
      <svg className="block w-full h-10 md:h-16 text-background" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 0h1440v20c-120 30-240 44-360 30S840 0 720 8 480 60 360 56 120 20 0 30z" />
      </svg>
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] pt-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="img/logo-512.webp" alt="" className="w-16 h-16 rounded-full" loading="lazy" />
            <b className="font-[family-name:var(--font-display)] text-xl leading-tight">{t("أرض المغامرات", "Adventure Land")}<br /><small className="text-white/60 text-sm font-medium">{t("Adventure Land", "أرض المغامرات")}</small></b>
          </div>
          <p className="text-white/70 m-0 max-w-xs">{t("مدينة ألعاب في مدينة العين: أنشطة ترفيهية، رسم على الوجوه، مهرج، تشكيل بالونات، حفلات وألعاب كثيرة.", "An indoor play city in Al Ain: fun activities, face painting, clowns, balloon art, parties and lots of games.")}</p>
          <div className="flex gap-2">
            <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noopener" className="w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-orange transition-colors" aria-label="Instagram"><InstagramIcon /></a>
            <a href={waLink(s.whatsapp, "")} target="_blank" rel="noopener" className="w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-[#1fa855] transition-colors" aria-label="WhatsApp"><WhatsAppIcon /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sun text-sm mb-4">{t("استكشف", "Explore")}</h4>
          <ul className="list-none p-0 m-0 grid gap-2.5">{nav.map((n) => <li key={n.id}><a href={n.url} className="text-white/75 hover:text-white">{n.name}</a></li>)}</ul>
        </div>
        <div>
          <h4 className="text-sun text-sm mb-4">{t("فروعنا", "Our branches")}</h4>
          <ul className="list-none p-0 m-0 grid gap-3">
            {c.branches.map((b) => { const o = openState(b); return (
              <li key={b.id}><a href={b.map} target="_blank" rel="noopener" className="flex items-start gap-2 text-white/80 hover:text-white">
                <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ background: o.isOpen ? "#2ee07a" : "#ff5a5a" }} />
                <span>{L(b.name)}<small className="block text-white/50">{L(b.floor)} · {L(b.city)}</small></span>
              </a></li>) })}
          </ul>
        </div>
        <div>
          <h4 className="text-sun text-sm mb-4">{t("تواصل معنا", "Get in touch")}</h4>
          <ul className="list-none p-0 m-0 grid gap-3 text-white/80">
            <li><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white"><Phone size={16} /><bdi dir="ltr">{s.phone}</bdi></a></li>
            <li><a href={`tel:${s.landline.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white"><Phone size={16} /><bdi dir="ltr">{s.landline}</bdi></a></li>
            <li><a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={16} /><bdi dir="ltr">{s.email}</bdi></a></li>
          </ul>
        </div>
      </div>
      <div className="wrap mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-3 justify-between text-sm text-white/50">
        <span>© {new Date().getFullYear()} {t("أرض المغامرات. جميع الحقوق محفوظة.", "Adventure Land. All rights reserved.")}</span>
        <span>{t("صُمم بواسطة", "Crafted by")} <a href="https://web.theplanetco.com" className="text-white/80 hover:text-orange">Planet</a></span>
      </div>
    </footer>
  )
}

function WaFab() {
  const { settings } = useContent()
  const { t } = useI18n()
  return (
    <a href={waLink(settings.whatsapp, t("مرحباً أرض المغامرات 👋", "Hi Adventure Land 👋"))} target="_blank" rel="noopener"
      className="fixed z-40 bottom-24 lg:bottom-6 end-4 lg:end-6 w-14 h-14 rounded-full grid place-items-center bg-[#1fa855] text-white shadow-[0_10px_30px_-8px_#1fa855] hover:scale-110 transition-transform"
      aria-label="WhatsApp">
      <span className="absolute inset-0 rounded-full bg-[#1fa855] animate-ping opacity-30" />
      <WhatsAppIcon size={28} />
    </a>
  )
}

export function OpenPill({ id, className }: { id: string; className?: string }) {
  const { branches } = useContent()
  const { t, L } = useI18n()
  const b = branches.find((x) => x.id === id)
  const [, tick] = useState(0)
  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(i) }, [])
  if (!b) return null
  const o = openState(b)
  return (
    <a href="branches.html" className={cn("inline-flex items-center gap-2 rounded-full bg-surface/85 backdrop-blur border border-border px-3 py-1.5 text-[13px] font-semibold hover:border-orange transition-colors", className)}>
      <span className="relative flex w-2.5 h-2.5">
        {o.isOpen && <span className="absolute inset-0 rounded-full bg-[#2ee07a] animate-ping opacity-70" />}
        <span className="relative w-2.5 h-2.5 rounded-full" style={{ background: o.isOpen ? "#1fbf63" : "#e5484d" }} />
      </span>
      <span style={{ color: branchColor(b.color) }} className="dark:brightness-125">{L(b.name)}</span>
      <span className="text-muted-foreground">{o.isOpen ? t(`مفتوح حتى ${o.closes}`, `Open till ${o.closes}`) : t(`يفتح ${o.opens}`, `Opens ${o.opens}`)}</span>
    </a>
  )
}

export function Layout({ page, children }: { page: PageId; children: ReactNode }) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal")
    if (!("IntersectionObserver" in window)) els.forEach((e) => e.classList.add("in"))
  }, [])
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">Skip</a>
      <Announcement />
      <Header page={page} />
      <main id="main">{children}</main>
      <Footer />
      <WaFab />
    </>
  )
}

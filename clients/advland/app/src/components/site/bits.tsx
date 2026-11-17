import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react"
import { Palette, Sparkles, PartyPopper, Rainbow, Popcorn, Camera, Gift, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export const ICONS: Record<string, LucideIcon> = { palette: Palette, sparkles: Sparkles, party: PartyPopper, rainbow: Rainbow, popcorn: Popcorn, camera: Camera }
export const iconFor = (k: string) => ICONS[k] ?? Gift

export const BRANCH_COLORS: Record<string, string> = { orange: "#f26a1b", navy: "#3550c8", red: "#c8161d", sun: "#e0b400", sky: "#2aa8de", green: "#1fa855" }
export const branchColor = (c: string) => BRANCH_COLORS[c] ?? (c?.startsWith("#") ? c : "#f26a1b")

/** Tracks the `.dark` class on <html> (set by the Sun/Moon toggle). */
export function useDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))
  useEffect(() => {
    const d = document.documentElement
    const mo = new MutationObserver(() => setDark(d.classList.contains("dark")))
    mo.observe(d, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
  }, [])
  return dark
}

export function Reveal({ children, className, delay = 0, as: Tag = "div", style }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" | "article"; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect() } }, { rootMargin: "0px 0px -8% 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const T = Tag as "div"
  return <T ref={ref} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</T>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full bg-orange/12 text-orange px-3.5 py-1.5 text-[13px] font-bold font-[family-name:var(--font-display)]", className)}>
      <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />{children}
    </span>
  )
}

export function SectionHead({ eyebrow, title, sub, center, className }: { eyebrow?: string; title: ReactNode; sub?: ReactNode; center?: boolean; className?: string }) {
  return (
    <Reveal className={cn("flex flex-col gap-4 max-w-2xl", center && "mx-auto items-center text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[clamp(1.9rem,4.4vw,3.2rem)]">{title}</h2>
      {sub && <p className="text-muted-foreground text-lg m-0">{sub}</p>}
    </Reveal>
  )
}

export function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}
export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  )
}

/** Small burst of brand-coloured confetti from the centre of the screen. */
export function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const colors = ["#f26a1b", "#172a7a", "#c8161d", "#ffd60a", "#9bdcf7", "#1fa855"]
  const box = document.createElement("div")
  box.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:200;overflow:hidden"
  document.body.appendChild(box)
  for (let i = 0; i < 90; i++) {
    const p = document.createElement("i")
    const s = 6 + Math.random() * 8
    p.style.cssText = `position:absolute;left:50%;top:45%;width:${s}px;height:${s * (Math.random() > .5 ? 1 : .45)}px;background:${colors[i % colors.length]};border-radius:${Math.random() > .6 ? "50%" : "2px"}`
    box.appendChild(p)
    const a = Math.random() * Math.PI * 2, v = 180 + Math.random() * 380
    p.animate([
      { transform: "translate(-50%,-50%) rotate(0)", opacity: 1 },
      { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v - 120}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: .55 },
      { transform: `translate(${Math.cos(a) * v * 1.2}px,${Math.sin(a) * v + 380}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 },
    ], { duration: 1800 + Math.random() * 900, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" })
  }
  setTimeout(() => box.remove(), 3000)
}

export const waLink = (num: string, text: string) => `https://wa.me/${num.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`

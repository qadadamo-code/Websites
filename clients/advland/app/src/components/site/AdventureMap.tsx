import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useContent } from "@/lib/content"
import { img, cn } from "@/lib/utils"

const ACCENTS = ["#f26a1b", "#2b49d6", "#c8161d", "#1fa855", "#e0a800", "#2aa8de"]

/** "Adventure map": a winding trail through every zone; Advy walks it as you scroll. */
export default function AdventureMap() {
  const { L, t, lang } = useI18n()
  const { zones } = useContent()
  const box = useRef<HTMLDivElement>(null)
  const rows = useRef<(HTMLDivElement | null)[]>([])
  const trail = useRef<SVGPathElement>(null)
  const guide = useRef<HTMLImageElement>(null)
  const [geo, setGeo] = useState({ w: 0, h: 0, d: "", pts: [] as [number, number][] })

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight
      const mobile = w < 768
      const rtl = document.documentElement.dir === "rtl"
      const pts: [number, number][] = rows.current.filter(Boolean).map((r, i) => {
        const y = r!.offsetTop + r!.offsetHeight / 2
        const x = mobile ? (rtl ? w - 22 : 22) : w / 2 + (i % 2 ? 70 : -70) * (rtl ? -1 : 1)
        return [x, y]
      })
      if (!pts.length) return
      const all: [number, number][] = [[pts[0][0], 0], ...pts, [pts[pts.length - 1][0], h]]
      let d = `M${all[0][0]},${all[0][1]}`
      for (let i = 1; i < all.length; i++) {
        const [x0, y0] = all[i - 1], [x1, y1] = all[i], my = (y0 + y1) / 2
        d += ` C${x0},${my} ${x1},${my} ${x1},${y1}`
      }
      setGeo({ w, h, d, pts })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [zones.length, lang])

  useEffect(() => {
    const path = trail.current, el = box.current, g = guide.current
    if (!path || !el || !g || !geo.d) return
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.55 - r.top) / r.height))
      path.style.strokeDashoffset = `${len * (1 - p)}`
      const pt = path.getPointAtLength(len * p)
      const ahead = path.getPointAtLength(Math.min(len, len * p + 4))
      const flip = ahead.x < pt.x ? -1 : 1
      g.style.transform = `translate(${pt.x - 42}px, ${pt.y - 60}px) scaleX(${flip})`
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    addEventListener("scroll", on, { passive: true })
    return () => { removeEventListener("scroll", on); cancelAnimationFrame(raf) }
  }, [geo.d])

  return (
    <div ref={box} className="relative">
      <svg className="absolute inset-0 pointer-events-none" width={geo.w} height={geo.h} aria-hidden="true">
        <path d={geo.d} fill="none" stroke="var(--line)" strokeWidth="10" strokeLinecap="round" strokeDasharray="2 22" />
        <path ref={trail} d={geo.d} fill="none" stroke="url(#trailGrad)" strokeWidth="8" strokeLinecap="round" />
        <defs>
          <linearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd60a" /><stop offset=".5" stopColor="#f26a1b" /><stop offset="1" stopColor="#c8161d" /></linearGradient>
        </defs>
        {geo.pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="17" fill="var(--surface)" stroke={ACCENTS[i % 6]} strokeWidth="4" />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={ACCENTS[i % 6]} fontFamily="Unbounded, sans-serif">{i + 1}</text>
          </g>
        ))}
      </svg>
      <img ref={guide} src="img/m4-guide.webp" alt="" className="absolute top-0 left-0 w-[84px] z-10 pointer-events-none drop-shadow-[0_12px_14px_rgba(0,0,0,.25)] will-change-transform hidden md:block" />

      <div className="relative grid gap-10 md:gap-6 ps-12 md:ps-0">
        {zones.map((z, i) => (
          <div key={z.id} ref={(n) => { rows.current[i] = n }} className={cn("md:grid md:grid-cols-2 md:gap-40 items-center", i % 2 && "md:[&>*]:col-start-2")}>
            <a href={`zones.html#${z.id}`} className="reveal group card overflow-hidden flex flex-col sm:flex-row md:flex-col lg:flex-row hover:-translate-y-1.5 transition-transform duration-500"
              ref={(n) => { if (n) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { n.classList.add("in"); o.disconnect() } }, { rootMargin: "0px 0px -10% 0px" }).observe(n) }}>
              <div className="relative sm:w-[44%] md:w-full lg:w-[46%] aspect-[4/3] sm:aspect-auto md:aspect-[16/10] lg:aspect-auto overflow-hidden shrink-0">
                <img src={img(z.img)} alt={L(z.title)} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-3 start-3 chip !bg-white/90 !text-navy">{L(z.age)}</span>
              </div>
              <div className="p-5 md:p-6 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: ACCENTS[i % 6] }}>{t("المحطة", "Stop")} {i + 1} · {L(z.tag)}</span>
                <h3 className="text-xl md:text-2xl">{L(z.title)}</h3>
                <p className="m-0 text-muted-foreground text-[15px]">{L(z.desc)}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-orange">{t("اكتشف المنطقة", "Explore zone")}<ArrowUpRight size={16} className="rtl:-scale-x-100 group-hover:translate-x-0.5 transition-transform" /></span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

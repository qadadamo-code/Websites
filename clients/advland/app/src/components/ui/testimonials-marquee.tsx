// 21st.dev · Testimonials with Marquee — adapted: two opposing rows, sticker cards, RTL-safe.
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export type Testimonial = { name: string; text: string; stars: number }

function Card({ t, i }: { t: Testimonial; i: number }) {
  const tint = ["#f26a1b", "#172a7a", "#c8161d", "#1fa855", "#ffd60a"][i % 5]
  return (
    <figure className="card relative w-[300px] sm:w-[340px] shrink-0 p-6 flex flex-col gap-4" style={{ rotate: `${(i % 3) - 1}deg` }}>
      <span className="absolute top-3 end-5 text-6xl leading-none font-serif text-orange/20 select-none" aria-hidden="true">”</span>
      <div className="flex gap-0.5 text-sun">
        {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} fill={k < t.stars ? "currentColor" : "none"} strokeWidth={2} />)}
      </div>
      <blockquote className="m-0 text-[15px] leading-relaxed text-foreground/85">{t.text}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-full text-white font-bold font-[family-name:var(--font-display)]" style={{ background: tint }}>{t.name.trim().charAt(0)}</span>
        <span className="font-semibold">{t.name}</span>
      </figcaption>
    </figure>
  )
}

export default function TestimonialsMarquee({ items, className }: { items: Testimonial[]; className?: string }) {
  const half = Math.ceil(items.length / 2)
  const rows = [items, [...items.slice(half), ...items.slice(0, half)]]
  return (
    <div className={cn("relative flex flex-col gap-6 overflow-hidden py-4", className)} dir="ltr"
      style={{ maskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)" }}>
      {rows.map((row, r) => (
        <div key={r} className="group flex overflow-hidden [--gap:1.5rem] gap-[var(--gap)]" style={{ ["--duration" as string]: `${48 + r * 10}s` }}>
          {[0, 1].map((c) => (
            <div key={c} className={cn("flex shrink-0 gap-[var(--gap)] animate-marquee group-hover:[animation-play-state:paused]", r === 1 && "[animation-direction:reverse]")} aria-hidden={c === 1}>
              {row.map((t, i) => <div key={i} dir="auto"><Card t={t} i={i + r} /></div>)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

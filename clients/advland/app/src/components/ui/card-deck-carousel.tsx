// 21st.dev · Stacked Card Image Carousel (kedhareswer) — adapted: brand fonts, RTL arrows, captions slot.
import * as React from "react"

export type Slide = { image: string; title?: string; caption?: string; alt?: string }

export type CardDeckCarouselProps = {
  slides: Slide[]
  height?: number | string
  cardWidth?: string
  aspect?: string
  scatter?: number
  autoplay?: number
  background?: string
  ink?: string
  className?: string
  ariaLabel?: string
  labels?: { prev: string; next: string }
}

export function wrap(i: number, n: number): number { return n ? ((i % n) + n) % n : 0 }
export function deckPose(depth: number, tilt: number, reduce = false) {
  const d = Math.min(depth, 3)
  return { y: d ? -d * 16 : 0, scale: 1 - d * 0.055, rot: depth === 0 || reduce ? 0 : tilt, opacity: depth > 3 ? 0 : 1, shade: 1 - d * 0.07 }
}
export function tiltFor(i: number, max: number): number { const u = (((i + 1) * 2654435761) >>> 0) / 4294967296; return (u * 2 - 1) * max }
export function isThrow(dx: number, vx: number, w: number): boolean { return Math.abs(dx) > w * 0.28 || (Math.abs(vx) > 0.55 && Math.abs(dx) > 24) }
export function pad2(n: number): string { return n < 10 ? "0" + n : String(n) }

const CD_CSS = [
  ".cd-root{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(28px,5vh,52px);overflow:hidden;background:var(--cd-bg);color:var(--cd-ink);outline:none;padding:24px 16px;box-sizing:border-box}",
  ".cd-root:focus-visible{box-shadow:inset 0 0 0 2px var(--cd-ink)}",
  ".cd-deck{position:relative;width:var(--cd-w);aspect-ratio:var(--cd-aspect);max-height:calc(var(--cd-h) * .66);max-width:calc(var(--cd-h) * .66 * var(--cd-ar));touch-action:pan-y}",
  ".cd-card{position:absolute;inset:0;border-radius:26px;overflow:hidden;background:#d9d5cc;border:6px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,.08),0 30px 60px -30px rgba(0,0,0,.45);transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s ease,filter .4s ease;will-change:transform}",
  ".cd-card[data-top='1']{cursor:grab}",
  ".cd-card[data-drag='1']{cursor:grabbing;transition:none}",
  ".cd-card[data-fly='1']{transition:transform .45s cubic-bezier(.3,.5,.3,1),opacity .45s ease}",
  ".cd-card[data-snap='1']{transition:none}",
  ".cd-card img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none;user-select:none}",
  ".cd-meta{display:flex;align-items:center;gap:clamp(16px,3vw,32px);width:min(var(--cd-w),100%);max-width:560px}",
  ".cd-cap{flex:1;min-width:0;overflow:hidden;padding-bottom:.3em}",
  ".cd-cap>*{display:block;animation:cd-in .6s cubic-bezier(.2,.8,.2,1) both}",
  ".cd-title{font:700 clamp(18px,2.2vw,24px)/1.3 var(--font-display);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  ".cd-sub{margin-top:2px;font:500 14px/1.5 var(--font-body);color:var(--cd-muted);animation-delay:.05s}",
  ".cd-count{font:700 13px/1 var(--font-display);color:var(--cd-muted)}",
  ".cd-count b{color:var(--color-orange);font-weight:700}",
  ".cd-btn{appearance:none;border:2px solid var(--cd-line);background:transparent;color:inherit;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;cursor:pointer;flex:none;transition:background .2s ease,color .2s ease,transform .3s}",
  ".cd-btn:hover{background:var(--color-orange);border-color:var(--color-orange);color:#fff;transform:scale(1.06)}",
  ".cd-btn:focus-visible{outline:2px solid var(--cd-ink);outline-offset:2px}",
  "[dir=rtl] .cd-btn svg{transform:scaleX(-1)}",
  ".cd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
  "@keyframes cd-in{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}",
  "@media (prefers-reduced-motion:reduce){.cd-card,.cd-card[data-fly='1']{transition:opacity .3s ease}.cd-cap>*{animation:none}}",
].join("\n")

type Override = { i: number; x: number; y: number; r: number; mode: "drag" | "fly" | "snap" }

export default function CardDeckCarousel({
  slides,
  height = "100svh",
  cardWidth = "min(78vw, 440px)",
  aspect = "4 / 5",
  scatter = 6,
  autoplay = 4200,
  background = "transparent",
  ink = "var(--color-foreground)",
  className,
  ariaLabel = "Image carousel",
  labels = { prev: "Previous", next: "Next" },
}: CardDeckCarouselProps) {
  const n = slides.length
  const [top, setTop] = React.useState(0)
  const [over, setOver] = React.useState(null as Override | null)
  const rootRef = React.useRef(null as HTMLDivElement | null)
  const deckRef = React.useRef(null as HTMLDivElement | null)
  const busy = React.useRef(false)
  const lastTouch = React.useRef(0)
  const topRef = React.useRef(0)
  topRef.current = top
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const later = (fn: () => void, ms: number) => window.setTimeout(fn, ms)

  const throwTop = React.useCallback(
    (dirX: number, fromX = 0, fromY = 0, dirY = 0) => {
      const w = deckRef.current?.offsetWidth || 400
      if (busy.current || n < 2) return
      busy.current = true
      const i = topRef.current
      const sx = dirX >= 0 ? 1 : -1
      setOver({ i, x: fromX + sx * w * 1.25, y: fromY + dirY * 0.4 - 40, r: sx * 16, mode: "fly" })
      later(() => { setOver(null); setTop((t) => wrap(t + 1, n)); busy.current = false }, reduce ? 200 : 430)
    },
    [n, reduce],
  )

  const pullBack = React.useCallback(() => {
    const w = deckRef.current?.offsetWidth || 400
    if (busy.current || n < 2) return
    busy.current = true
    const i = wrap(topRef.current - 1, n)
    setOver({ i, x: -w * 1.25, y: -40, r: -16, mode: "snap" })
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setOver({ i, x: 0, y: 0, r: 0, mode: "fly" })
        later(() => { setOver(null); setTop(i); busy.current = false }, reduce ? 200 : 450)
      }),
    )
  }, [n, reduce])

  React.useEffect(() => {
    if (!autoplay || n < 2) return
    const root = rootRef.current
    let seen = true
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting))
    if (root) io.observe(root)
    const t = window.setInterval(() => {
      if (!seen || document.hidden || performance.now() - lastTouch.current < autoplay) return
      throwTop(1)
    }, autoplay)
    return () => { window.clearInterval(t); io.disconnect() }
  }, [autoplay, n, throwTop])

  const drag = React.useRef(null as null | { x: number; y: number; lx: number; lt: number; vx: number })
  const onDown = (e: React.PointerEvent) => {
    lastTouch.current = performance.now()
    if (busy.current || (e.pointerType === "mouse" && e.button !== 0)) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, lx: e.clientX, lt: e.timeStamp, vx: 0 }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dt = Math.max(1, e.timeStamp - d.lt)
    d.vx = 0.8 * ((e.clientX - d.lx) / dt) + 0.2 * d.vx
    d.lx = e.clientX
    d.lt = e.timeStamp
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    setOver({ i: topRef.current, x: dx, y: dy, r: reduce ? 0 : dx * 0.05, mode: "drag" })
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    lastTouch.current = performance.now()
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    const w = deckRef.current?.offsetWidth || 400
    if (isThrow(dx, d.vx, w)) throwTop(dx, dx, dy, dy)
    else setOver(null)
  }
  const onKey = (e: React.KeyboardEvent) => {
    lastTouch.current = performance.now()
    const rtl = document.documentElement.dir === "rtl"
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) throwTop(1)
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) pullBack()
    else return
    e.preventDefault()
  }

  const s = slides[top] || ({} as Slide)

  return (
    <div
      ref={rootRef}
      className={["cd-root", className].filter(Boolean).join(" ")}
      style={{
        height,
        ["--cd-h" as string]: typeof height === "number" ? height + "px" : height,
        ["--cd-w" as string]: cardWidth,
        ["--cd-aspect" as string]: aspect,
        ["--cd-ar" as string]: aspect,
        ["--cd-bg" as string]: background,
        ["--cd-ink" as string]: ink,
        ["--cd-muted" as string]: "color-mix(in srgb, var(--cd-ink) 60%, transparent)",
        ["--cd-line" as string]: "color-mix(in srgb, var(--cd-ink) 18%, transparent)",
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
    >
      <style>{CD_CSS}</style>
      <div ref={deckRef} className="cd-deck">
        {slides.map((sl, i) => {
          const depth = wrap(i - top, n)
          const p = deckPose(depth, tiltFor(i, scatter), reduce)
          const o = over && over.i === i ? over : null
          const isTop = depth === 0
          const transform = o
            ? "translate(" + o.x + "px," + o.y + "px) rotate(" + o.r + "deg)"
            : "translateY(" + p.y + "px) scale(" + p.scale + ") rotate(" + p.rot.toFixed(2) + "deg)"
          return (
            <div
              key={i}
              className="cd-card"
              data-top={isTop ? "1" : "0"}
              data-drag={o?.mode === "drag" ? "1" : "0"}
              data-fly={o?.mode === "fly" ? "1" : "0"}
              data-snap={o?.mode === "snap" ? "1" : "0"}
              style={{ transform, zIndex: o ? n + 1 : n - depth, opacity: o ? 1 : p.opacity, filter: o || isTop ? "none" : "brightness(" + p.shade + ")" }}
              aria-hidden={isTop ? undefined : true}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerCancel={isTop ? onUp : undefined}
            >
              <img src={sl.image} alt={isTop ? sl.alt || sl.title || "" : ""} draggable={false} loading="lazy" />
            </div>
          )
        })}
      </div>
      <div className="cd-meta">
        <button type="button" className="cd-btn" aria-label={labels.prev} onClick={() => ((lastTouch.current = performance.now()), pullBack())}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
        <div className="cd-cap" key={top} aria-hidden="true">
          {s.title ? <span className="cd-title">{s.title}</span> : null}
          {s.caption ? <span className="cd-sub">{s.caption}</span> : null}
        </div>
        <span className="cd-count" aria-hidden="true"><b>{pad2(top + 1)}</b> / {pad2(n)}</span>
        <button type="button" className="cd-btn" aria-label={labels.next} onClick={() => ((lastTouch.current = performance.now()), throwTop(1))}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
      </div>
      <div className="cd-sr" aria-live="polite">{top + 1 + " / " + n + (s.title ? ": " + s.title : "")}</div>
    </div>
  )
}

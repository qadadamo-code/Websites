import type { ReactNode } from "react"
import { Eyebrow } from "./bits"

/** Inner-page hero: big sticker headline, scene photo in a blob frame, mascot peeking out. */
export default function PageHero({ eyebrow, title, sub, image, mascot, children }: { eyebrow: string; title: ReactNode; sub: ReactNode; image: string; mascot?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden pt-6 md:pt-10 pb-16">
      <div className="dots absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,#000,transparent_70%)]" />
      <div className="absolute -top-40 start-[-10%] w-[520px] h-[520px] rounded-full bg-orange/20 blur-3xl dark:bg-orange/25" />
      <div className="absolute top-20 end-[-12%] w-[420px] h-[420px] rounded-full bg-sky/30 blur-3xl dark:bg-[#2b49d6]/30" />
      <div className="wrap relative grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <div className="flex flex-col gap-5 items-start">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-[clamp(2.3rem,6vw,4.4rem)] glow-o">{title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground m-0 max-w-xl">{sub}</p>
          {children}
        </div>
        <div className="relative">
          <div className="relative aspect-[5/4] rounded-[42%_58%_46%_54%/52%_44%_56%_48%] overflow-hidden border-[6px] border-surface shadow-[0_40px_80px_-40px_#111a4a99] rotate-2">
            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          {mascot && <img src={mascot} alt="" className="absolute -bottom-10 start-[-6%] w-[42%] max-w-[220px] animate-float drop-shadow-[0_20px_20px_rgba(0,0,0,.25)]" />}
          <div className="absolute -top-4 end-6 w-16 h-16 rounded-full bg-sun grid place-items-center text-2xl animate-spin-slow shadow-lg">★</div>
        </div>
      </div>
    </section>
  )
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/** "01 ── label" section marker, used across the home page like a chapter index. */
export function Index({ n, label, className }: { n: string; label: string; className?: string }) {
  return (
    <Reveal className={cn("mb-8 flex items-center gap-4 text-sm", className)}>
      <span className="font-display font-bold text-mint" dir="ltr">{n}</span>
      <span className="h-px w-12 bg-gradient-to-r from-mint/70 to-transparent rtl:bg-gradient-to-l" />
      <span className="text-white/70">{label}</span>
    </Reveal>
  );
}

type Tile = { slug: string; name: string; label: string; img: string };

/** Two rows of template screens drifting in opposite directions. */
export function TemplateMarquee({ tiles, hrefTo }: { tiles: Tile[]; hrefTo: string }) {
  const row = (items: Tile[], reverse = false) => (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" dir="ltr">
      <div
        className={cn("flex shrink-0 animate-marquee gap-5 pe-5 group-hover:[animation-play-state:paused]", reverse && "[animation-direction:reverse]")}
        style={{ ["--marquee-duration" as string]: "60s", ["--marquee-gap" as string]: "1.25rem" }}
      >
        {[...items, ...items].map((t, i) => (
          <Link key={i} href={hrefTo} className="relative block w-[320px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-space-2 sm:w-[420px]" tabIndex={i >= items.length ? -1 : 0}>
            <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
              <span className="size-2 rounded-full bg-white/20" />
              <span className="size-2 rounded-full bg-white/20" />
              <span className="size-2 rounded-full bg-white/20" />
            </div>
            <div className="relative aspect-[16/10]">
              <img src={t.img} alt={t.name} loading="lazy" className="size-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between text-white" dir="auto">
                <span className="text-xl font-bold">{t.name}</span>
                <span className="text-xs text-white/70">{t.label}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-5">
      {row(tiles)}
      {row([...tiles].reverse(), true)}
    </div>
  );
}

/** Numbered rows (services-list style) with hover highlight. */
export function NumberedRows({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="border-t border-white/10">
      {items.map((it, i) => (
        <Reveal key={it.title} delay={(i % 4) * 0.04}>
          <div className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-4 border-b border-white/10 py-6 transition-colors hover:bg-white/[0.025] sm:grid-cols-[5rem_1fr_1.3fr] sm:px-4">
            <span className="font-display text-sm text-white/35 transition-colors group-hover:text-mint" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-xl font-bold text-white transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 sm:text-2xl">{it.title}</h3>
            <p className="col-start-2 mt-2 leading-relaxed text-muted sm:col-start-3 sm:mt-0">{it.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Chapter index of templates: thumbnail, number, name, enter. */
export function ChapterIndex({ items, enter }: { items: (Tile & { href: string; tagline: string })[]; enter: string }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((t, i) => (
        <Reveal key={t.slug} delay={i * 0.05}>
          <Link href={t.href} className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-3 transition-all hover:border-mint/40 hover:bg-white/[0.05] sm:gap-6 sm:p-4">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-36">
              <img src={t.img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <span className="hidden font-display text-xs text-mint sm:block" dir="ltr">CH {String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold text-white sm:text-2xl">{t.name}</div>
              <div className="truncate text-sm text-muted">{t.label} · {t.tagline}</div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors group-hover:border-mint group-hover:bg-mint group-hover:text-space sm:px-4 sm:text-sm">
              {enter} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

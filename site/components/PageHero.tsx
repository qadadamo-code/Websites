import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { href, type Locale } from "@/lib/i18n";

export function PageHero({ title, sub, locale, homeLabel, children }: { title: string; sub?: string; locale: Locale; homeLabel: string; children?: React.ReactNode }) {
  const Chevron = locale === "ar" ? ChevronLeft : ChevronRight;
  return (
    <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 start-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-navy/50 blur-3xl rtl:translate-x-1/2" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <nav className="mb-6 flex items-center gap-1 text-sm text-muted" aria-label="breadcrumb">
            <Link href={href("/", locale)} className="hover:text-mint">{homeLabel}</Link>
            <Chevron className="size-4" />
            <span className="text-white/80">{title}</span>
          </nav>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">{title}</h1>
          {sub && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{sub}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

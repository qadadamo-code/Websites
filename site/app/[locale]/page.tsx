import Link from "next/link";
import { ArrowUpRight, Check, X } from "lucide-react";
import { PlanetCanvas } from "@/components/PlanetCanvas";
import { SplitWords, Reveal } from "@/components/Reveal";
import { Countdown } from "@/components/Countdown";
import { NumberTicker } from "@/components/NumberTicker";
import { Marquee } from "@/components/Marquee";
import { BuildSequence } from "@/components/BuildSequence";
import { OrbitSectors } from "@/components/OrbitSectors";
import { SpotlightCard } from "@/components/SpotlightCard";
import { TemplateMock } from "@/components/TemplateMock";
import { Faq } from "@/components/Faq";
import { CtaSection } from "@/components/CtaSection";
import { Section, SectionHead } from "@/components/Section";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { getDict, href, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

// Planet clients as listed on theplanetco.com
const CLIENTS = ["Uber", "Alashi", "Al Jamalla", "Mo Adel", "Belal Hanif", "Jagal", "Lorya", "Tadawa", "Value", "Westeros", "Best One", "SehaPracto", "Implant Gate", "Bossco"];

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const h = t.home;
  const p = t.pricing.package;

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden pt-28">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,54,89,0.6),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-2">
          <div className="relative z-10 py-10">
            <Reveal>
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-white/85">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-mint" />
                </span>
                {h.hero.eyebrow}
              </span>
            </Reveal>
            <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-7xl">
              <SplitWords text={h.hero.title1} delay={0.1} />
              <br />
              <SplitWords text={h.hero.title2} className="text-gradient" delay={0.35} />
            </h1>
            <Reveal delay={0.5}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">{h.hero.sub}</p>
            </Reveal>
            <Reveal delay={0.65} className="mt-9 flex flex-wrap items-center gap-3">
              <Button href={href("/start", locale)}>
                {h.hero.ctaPrimary}
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 rtl:-scale-x-100" />
              </Button>
              <Button href={href("/templates", locale)} variant="ghost">{h.hero.ctaSecondary}</Button>
              <span className="text-sm text-mint">{h.hero.priceTag}</span>
            </Reveal>
          </div>

          <div className="relative h-[46vh] min-h-[340px] lg:h-[78vh]">
            <PlanetCanvas className="absolute inset-0 size-full" />
            <Reveal delay={0.9} className="glass absolute bottom-4 start-1/2 w-max -translate-x-1/2 rounded-3xl px-6 py-4 rtl:translate-x-1/2 lg:bottom-16">
              <div className="mb-2 text-xs text-muted">{h.hero.countdownLabel}</div>
              <Countdown labels={t.common} locale={locale} />
            </Reveal>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/8 md:grid-cols-4">
            {h.hero.stats.map((s) => (
              <div key={s.label} className="bg-space p-6">
                <div className="font-display text-4xl font-black text-white">
                  <NumberTicker value={s.value} suffix={s.suffix} locale={locale} />
                </div>
                <div className="mt-1 text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS */}
      <section className="border-y border-white/8 py-10">
        <p className="mb-6 text-center text-sm text-muted">{h.clients.title}</p>
        <Marquee duration={45}>
          {CLIENTS.map((c) => (
            <span key={c} className="font-display whitespace-nowrap text-2xl font-bold text-white/30 transition-colors hover:text-white/80">
              {c}
            </span>
          ))}
        </Marquee>
      </section>

      {/* BUILD SEQUENCE */}
      <div className="pt-24 md:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow={h.build.eyebrow} title={h.build.title} sub={h.build.sub} />
        </div>
        <BuildSequence layers={h.build.layers} locale={locale} />
      </div>

      {/* NOT A LANDING PAGE */}
      <Section>
        <SectionHead eyebrow={h.notLanding.eyebrow} title={h.notLanding.title} sub={h.notLanding.sub} center />
        <Reveal className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/8">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-white/8 bg-white/[0.03] px-5 py-4 text-sm sm:gap-x-10 sm:px-8">
            <span />
            <span className="w-20 text-center text-muted sm:w-28">{h.notLanding.landing}</span>
            <span className="w-20 text-center font-semibold text-mint sm:w-28">{h.notLanding.planet}</span>
          </div>
          {h.notLanding.rows.map((r) => (
            <div key={r} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-white/5 px-5 py-4 last:border-0 sm:gap-x-10 sm:px-8">
              <span className="text-white/85">{r}</span>
              <span className="grid w-20 place-items-center sm:w-28"><X className="size-5 text-white/25" /></span>
              <span className="grid w-20 place-items-center sm:w-28">
                <span className="grid size-7 place-items-center rounded-full bg-mint/15"><Check className="size-4 text-mint" /></span>
              </span>
            </div>
          ))}
        </Reveal>
      </Section>

      {/* SECTORS ORBIT */}
      <Section>
        <SectionHead eyebrow={h.sectors.eyebrow} title={h.sectors.title} sub={h.sectors.sub} />
        <OrbitSectors sectors={t.sectors} hrefBase={href("/solutions", locale)} cta={t.common.learnMore} />
      </Section>

      {/* FEATURES */}
      <Section>
        <SectionHead eyebrow={h.features.eyebrow} title={h.features.title} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {h.features.items.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <SpotlightCard className="h-full">
                <span className="grid size-12 place-items-center rounded-2xl bg-mint/10 text-mint">
                  <Icon name={f.icon} className="size-6" />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-white">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{f.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PRICING TEASER */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHead eyebrow={h.pricing.eyebrow} title={h.pricing.title} sub={h.pricing.sub} />
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-mint/30 bg-gradient-to-b from-space-3 to-space p-8 shadow-[0_0_120px_-30px_rgba(146,197,180,0.5)]">
              <div className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-mint/20 blur-3xl" />
              <div className="text-sm text-mint">{p.name} · {p.tagline}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-sm text-muted">{t.common.from}</span>
                <span className="font-display text-6xl font-black text-white">{formatPrice(p.price, locale)}</span>
                <span className="text-lg text-muted">{t.common.currency}</span>
              </div>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {p.includes.slice(0, 8).map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm text-white/85">
                    <Check className="mt-0.5 size-4 shrink-0 text-mint" />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-muted">{p.note}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={href("/start", locale)}>{p.cta}</Button>
                <Button href={href("/pricing", locale)} variant="ghost">{h.pricing.cta}</Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* TEMPLATES */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={t.templates.title} title={t.templates.sub} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.templates.items.slice(0, 3).map((tp, i) => (
            <Reveal key={tp.slug} delay={i * 0.1}>
              <Link href={href("/templates", locale)} className="group block">
                <TemplateMock t={tp} rtl={locale === "ar"} className="transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[-0.5deg]" />
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-white">{tp.name}</span>
                  <span className="text-sm text-muted">{tp.label}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-10">
          <Button href={href("/templates", locale)} variant="ghost">{h.hero.ctaSecondary}</Button>
        </div>
      </Section>

      {/* PAYMENTS */}
      <Section>
        <SectionHead eyebrow={h.payments.eyebrow} title={h.payments.title} sub={h.payments.sub} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {t.paymentsPage.methods.map((m, i) => (
            <Reveal key={m.name} delay={(i % 4) * 0.06}>
              <div className="flex h-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <Icon name={m.icon} className="size-5 shrink-0 text-mint" />
                <span className="text-sm font-medium text-white">{m.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Link href={href("/payments", locale)} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-mint hover:underline">
          {t.common.learnMore} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </Link>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <SectionHead title={t.faq.title} sub={t.faq.sub} />
          <Faq items={t.faq.items.slice(0, 5)} />
        </div>
      </Section>

      <CtaSection t={t} locale={locale} />
    </>
  );
}

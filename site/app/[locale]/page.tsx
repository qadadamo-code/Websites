import Link from "next/link";
import { ArrowUpRight, Check, X } from "lucide-react";
import { SplitWords, Reveal } from "@/components/Reveal";
import { Countdown } from "@/components/Countdown";
import { Marquee } from "@/components/Marquee";
import { OrbitSectors } from "@/components/OrbitSectors";
import { Faq } from "@/components/Faq";
import { CtaSection } from "@/components/CtaSection";
import { Section, SectionHead } from "@/components/Section";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { HeroStage } from "@/components/home/HeroStage";
import { ChapterIndex, Index, NumberedRows, TemplateMarquee } from "@/components/home/Bits";
import { getDemos } from "@/content/demos";
import { getDict, href, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

// Planet clients as listed on theplanetco.com
const CLIENTS = ["Uber", "Alashi", "Al Jamalla", "Mo Adel", "Belal Hanif", "Jagal", "Lorya", "Tadawa", "Value", "Westeros", "Best One", "SehaPracto", "Implant Gate", "Bossco"];

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const h = t.home;
  const p = t.pricing.package;
  const demos = getDemos(locale);
  const tiles = t.templates.items.map((tp) => ({ slug: tp.slug, name: tp.name, label: tp.label, img: demos.find((d) => d.slug === tp.slug)!.hero.img }));
  const chapters = tiles.map((tl) => ({ ...tl, href: href("/templates", locale), tagline: demos.find((d) => d.slug === tl.slug)!.tagline }));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-32 sm:pt-40">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,54,89,0.7),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" aria-hidden>
          <img src="/img/art/planet-3d.webp" alt="" className="animate-float w-[min(1100px,170vw)] max-w-none opacity-45 mix-blend-screen [mask-image:radial-gradient(circle,black_35%,transparent_65%)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-white/85">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-mint" />
              </span>
              {h.hero.eyebrow}
            </span>
          </Reveal>
          <h1 className="mt-8 text-[2.75rem] font-black leading-[1.12] tracking-tight text-white sm:text-7xl lg:text-8xl">
            <SplitWords text={h.hero.title1} delay={0.1} />
            <br />
            <SplitWords text={h.hero.title2} className="text-gradient" delay={0.35} />
          </h1>
          <Reveal delay={0.5}>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{h.hero.sub}</p>
          </Reveal>
          <Reveal delay={0.65} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href={href("/start", locale)}>
              {h.hero.ctaPrimary}
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 rtl:-scale-x-100" />
            </Button>
            <Button href={href("/templates", locale)} variant="ghost">{h.hero.ctaSecondary}</Button>
          </Reveal>
          <Reveal delay={0.8} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted">
            <span className="text-mint">{h.hero.priceTag}</span>
            <span className="hidden h-4 w-px bg-white/15 sm:block" />
            <span className="flex items-center gap-3">
              {h.hero.countdownLabel}
              <span className="glass rounded-full px-3 py-1"><Countdown labels={t.common} locale={locale} compact /></span>
            </span>
          </Reveal>
        </div>

        <div className="relative mt-20 pb-24 sm:mt-24">
          <HeroStage locale={locale} names={t.templates.items.map((x) => ({ slug: x.slug, name: x.name, label: x.label }))} />
        </div>
      </section>

      {/* CLIENTS */}
      <section className="border-y border-white/8 py-10">
        <p className="mb-6 text-center text-sm text-muted">{h.clients.title}</p>
        <Marquee duration={45}>
          {CLIENTS.map((c) => (
            <span key={c} className="font-display whitespace-nowrap text-2xl font-bold text-white/30 transition-colors hover:text-white/80">{c}</span>
          ))}
        </Marquee>
      </section>

      {/* 01 WHY */}
      <Section>
        <Index n="01" label={h.why.label} />
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-5xl">{h.why.title}</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">{h.why.text}</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10">
            {h.why.stats.map((s, i) => (
              <Reveal key={s.l} delay={i * 0.06} className="bg-space p-6 sm:p-8">
                <div className="flex items-baseline gap-2" dir="ltr">
                  <span className="font-display text-4xl font-black text-white sm:text-5xl">{s.v}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-mint">{s.u}</div>
                <div className="mt-3 text-sm leading-relaxed text-muted">{s.l}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* SHOWCASE */}
      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow={h.showcase.eyebrow} title={h.showcase.title} sub={h.showcase.sub} />
        </div>
        <TemplateMarquee tiles={tiles} hrefTo={href("/templates", locale)} />
      </section>

      {/* 02 INCLUDED */}
      <Section>
        <Index n="02" label={h.included.label} />
        <Reveal><h2 className="mb-12 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">{h.included.title}</h2></Reveal>
        <NumberedRows items={h.features.items} />
      </Section>

      {/* NOT A LANDING PAGE */}
      <Section className="pt-0 md:pt-0">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHead eyebrow={h.notLanding.eyebrow} title={h.notLanding.title} sub={h.notLanding.sub} />
          <Reveal className="overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02]">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-white/8 bg-white/[0.03] px-5 py-4 text-sm sm:gap-x-8 sm:px-8">
              <span />
              <span className="w-20 text-center text-muted sm:w-24">{h.notLanding.landing}</span>
              <span className="w-20 text-center font-semibold text-mint sm:w-24">{h.notLanding.planet}</span>
            </div>
            {h.notLanding.rows.map((r) => (
              <div key={r} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-white/5 px-5 py-4 last:border-0 sm:gap-x-8 sm:px-8">
                <span className="text-white/85">{r}</span>
                <span className="grid w-20 place-items-center sm:w-24"><X className="size-5 text-white/25" /></span>
                <span className="grid w-20 place-items-center sm:w-24">
                  <span className="grid size-7 place-items-center rounded-full bg-mint/15"><Check className="size-4 text-mint" /></span>
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </Section>

      {/* 03 TEMPLATES INDEX */}
      <Section>
        <Index n="03" label={h.chapters.label} />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-5xl">{h.chapters.title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">{h.chapters.sub}</p>
              <div className="mt-8"><Button href={href("/templates", locale)} variant="ghost">{h.hero.ctaSecondary}</Button></div>
            </Reveal>
          </div>
          <ChapterIndex items={chapters} enter={h.chapters.enter} />
        </div>
      </Section>

      {/* 04 SECTORS */}
      <Section>
        <Index n="04" label={h.sectors.eyebrow} />
        <SectionHead title={h.sectors.title} sub={h.sectors.sub} />
        <OrbitSectors sectors={t.sectors} hrefBase={href("/solutions", locale)} cta={t.common.learnMore} />
      </Section>

      {/* 05 PRICING */}
      <Section>
        <Index n="05" label={h.pricing.eyebrow} />
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-space-2">
          <img src="/img/art/glass-ui.webp" alt="" aria-hidden className="absolute inset-0 size-full object-cover opacity-50 [mask-image:linear-gradient(to_left,black,transparent_75%)] rtl:[mask-image:linear-gradient(to_right,black,transparent_75%)]" />
          <div className="relative grid gap-10 p-6 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:p-16">
            <Reveal>
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-5xl">{h.pricing.title}</h2>
              <p className="mt-5 text-lg text-muted">{h.pricing.sub}</p>
              <div className="mt-10 flex flex-wrap items-baseline gap-3">
                <span className="text-sm text-muted">{t.common.from}</span>
                <span className="font-display text-6xl font-black text-white sm:text-7xl" dir="ltr">{formatPrice(p.price, locale)}</span>
                <span className="text-lg text-mint">{t.common.currency}</span>
              </div>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-muted">{p.note}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={href("/start", locale)}>{p.cta}</Button>
                <Button href={href("/pricing", locale)} variant="ghost">{h.pricing.cta}</Button>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="glass rounded-3xl p-6 sm:p-8">
              <div className="mb-5 text-sm font-semibold text-mint">{p.name} · {p.tagline}</div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {p.includes.map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-sm text-white/85">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint/15"><Check className="size-3 text-mint" /></span>
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* 06 PAYMENTS */}
      <Section>
        <Index n="06" label={h.payments.eyebrow} />
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <SectionHead title={h.payments.title} sub={h.payments.sub} />
          <div className="grid grid-cols-2 gap-3 pb-14">
            {t.paymentsPage.methods.map((m, i) => (
              <Reveal key={m.name} delay={(i % 4) * 0.05}>
                <div className="flex h-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-mint/30">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint/10 text-mint"><Icon name={m.icon} className="size-5" /></span>
                  <span className="text-sm font-medium text-white">{m.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Link href={href("/payments", locale)} className="inline-flex items-center gap-2 text-sm font-semibold text-mint hover:underline">
          {t.common.learnMore} <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </Link>
      </Section>

      {/* 07 FAQ */}
      <Section>
        <Index n="07" label={t.faq.title} />
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <SectionHead title={t.faq.title} sub={t.faq.sub} />
          <Faq items={t.faq.items.slice(0, 6)} />
        </div>
      </Section>

      {/* CLOSING */}
      <section className="relative overflow-hidden px-4 pt-16 text-center sm:px-6">
        <Reveal>
          <p className="text-[clamp(2.5rem,9vw,8rem)] font-black leading-[1.05] tracking-tight text-white">{h.closing.line1}</p>
          <p className="text-gradient text-[clamp(2.5rem,9vw,8rem)] font-black leading-[1.15] tracking-tight">{h.closing.line2}</p>
        </Reveal>
      </section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

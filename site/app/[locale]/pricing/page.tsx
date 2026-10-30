import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Check } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { PricingCalculator } from "@/components/PricingCalculator";
import { CtaSection } from "@/components/CtaSection";
import { JsonLd } from "@/components/JsonLd";
import { href, SITE_URL } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/pricing", t.pricing.title, t.pricing.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const p = t.pricing.package;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: p.name, provider: { "@type": "Organization", name: "Planet" }, areaServed: "EG", offers: { "@type": "Offer", price: p.price, priceCurrency: "EGP", url: `${SITE_URL}/${locale}/pricing/` } }} />
      <PageHero title={t.pricing.title} sub={t.pricing.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <Reveal>
          <div className="relative grid gap-10 overflow-hidden rounded-[2.5rem] border border-mint/30 bg-gradient-to-br from-space-3 via-space-2 to-space p-8 shadow-[0_0_140px_-40px_rgba(146,197,180,0.55)] sm:p-12 lg:grid-cols-[1fr_1.4fr]">
            <div className="pointer-events-none absolute -start-20 -top-20 size-72 rounded-full bg-mint/15 blur-3xl" />
            <div className="relative">
              <div className="text-mint">{p.name}</div>
              <div className="mt-1 text-2xl font-bold text-white">{p.tagline}</div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-muted">{t.common.from}</span>
                <span className="font-display text-7xl font-black text-white">{formatPrice(p.price, locale)}</span>
                <span className="text-xl text-muted">{t.common.currency}</span>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted">{p.note}</p>
              <div className="mt-8"><Button href={href("/start", locale)}>{p.cta}</Button></div>
            </div>
            <ul className="relative grid content-start gap-3 sm:grid-cols-2">
              {p.includes.map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-white/85">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint/15"><Check className="size-3.5 text-mint" /></span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>
      <Section className="pt-0 md:pt-0">
        <PricingCalculator t={t.pricing} locale={locale} common={t.common} />
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

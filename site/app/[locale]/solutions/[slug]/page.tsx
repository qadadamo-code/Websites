import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getDict, href, locales, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHead } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { TemplateMock } from "@/components/TemplateMock";
import { Icon } from "@/components/Icon";
import { CtaSection } from "@/components/CtaSection";

export function generateStaticParams() {
  return locales.flatMap((locale) => getDict(locale).sectors.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const s = getDict(locale).sectors.find((x) => x.slug === slug);
  return s ? pageMeta(locale, `/solutions/${slug}`, `${s.name}: ${s.title}`, s.sub) : {};
}

export default async function Page({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const s = t.sectors.find((x) => x.slug === slug);
  if (!s) notFound();
  const tp = t.templates.items.find((x) => x.sector === slug);
  return (
    <>
      <PageHero title={s.title} sub={s.sub} locale={locale} homeLabel={t.common.breadcrumbHome}>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-mint/10 px-4 py-2 text-sm text-mint">
          <Icon name={s.icon} className="size-4" /> {s.name}
        </div>
      </PageHero>
      <Section className="pt-0 md:pt-0">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHead title={t.solutionsPage.featuresTitle} />
            <ul className="grid gap-4">
              {s.features.map((f, i) => (
                <Reveal key={f} delay={i * 0.06}>
                  <li className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-white/90">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-mint/15"><Check className="size-4 text-mint" /></span>
                    {f}
                  </li>
                </Reveal>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`${href("/start", locale)}${tp ? `?template=${tp.slug}` : ""}`}>{t.nav.cta}</Button>
              <Button href={href("/pricing", locale)} variant="ghost">{t.home.pricing.cta}</Button>
            </div>
          </div>
          {tp && (
            <Reveal className="animate-float">
              <TemplateMock t={tp} rtl={locale === "ar"} />
            </Reveal>
          )}
        </div>
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

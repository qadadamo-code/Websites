import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/CtaSection";
import { Check } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/features", t.featuresPage.title, t.featuresPage.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageHero title={t.featuresPage.title} sub={t.featuresPage.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.features.items.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <SpotlightCard className="h-full">
                <span className="grid size-12 place-items-center rounded-2xl bg-mint/10 text-mint"><Icon name={f.icon} className="size-6" /></span>
                <h2 className="mt-6 text-xl font-semibold text-white">{f.title}</h2>
                <p className="mt-2 leading-relaxed text-muted">{f.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section className="pt-0 md:pt-0">
        <Reveal className="rounded-3xl border border-white/8 bg-white/[0.02] p-8">
          <h2 className="text-2xl font-bold text-white">{t.pricing.package.name}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {t.pricing.package.includes.map((x) => (
              <li key={x} className="flex items-start gap-2 text-white/85"><Check className="mt-0.5 size-4 shrink-0 text-mint" />{x}</li>
            ))}
          </ul>
        </Reveal>
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

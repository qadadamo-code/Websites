import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { OrbitSectors } from "@/components/OrbitSectors";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/CtaSection";
import Link from "next/link";
import { href } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/solutions", t.solutionsPage.title, t.solutionsPage.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageHero title={t.solutionsPage.title} sub={t.solutionsPage.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <OrbitSectors sectors={t.sectors} hrefBase={href("/solutions", locale)} cta={t.common.learnMore} />
      </Section>
      <Section className="pt-0 md:pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.sectors.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.08}>
              <Link href={href(`/solutions/${s.slug}`, locale)} className="block h-full">
                <SpotlightCard className="h-full">
                  <Icon name={s.icon} className="size-7 text-mint" />
                  <h2 className="mt-5 text-xl font-semibold text-white">{s.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.sub}</p>
                </SpotlightCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

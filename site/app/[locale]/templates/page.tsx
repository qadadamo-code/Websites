import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { TemplatesGallery } from "@/components/TemplatesGallery";
import { CtaSection } from "@/components/CtaSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/templates", t.templates.title, t.templates.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageHero title={t.templates.title} sub={t.templates.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <TemplatesGallery t={t.templates} sectors={t.sectors} locale={locale} common={t.common} />
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

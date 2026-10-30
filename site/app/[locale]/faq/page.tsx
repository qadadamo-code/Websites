import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { CtaSection } from "@/components/CtaSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/faq", t.faq.title, t.faq.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })) }} />
      <PageHero title={t.faq.title} sub={t.faq.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="max-w-4xl pt-0 md:pt-0">
        <Faq items={t.faq.items} />
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

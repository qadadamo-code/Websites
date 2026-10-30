import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { PayBox } from "@/components/PayBox";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/pay", t.pay.title, t.pay.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageHero title={t.pay.title} sub={t.pay.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0"><PayBox t={t} locale={locale} /></Section>
    </>
  );
}

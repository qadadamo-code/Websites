import { getDict, href, waLink, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { Button } from "@/components/Button";
import { Centered } from "@/components/Centered";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return { ...pageMeta(locale, "/thanks", getDict(locale).thanks.title), robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return <Centered title={t.thanks.title} sub={t.thanks.sub} actions={<><Button href={href("/", locale)}>{t.thanks.home}</Button><Button href={waLink(t.common.waGreeting)} variant="whatsapp" external>{t.common.whatsapp}</Button></>} />;
}


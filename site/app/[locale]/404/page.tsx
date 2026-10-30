import { getDict, href, type Locale } from "@/lib/i18n";
import { Button } from "@/components/Button";
import { Centered } from "@/components/Centered";

export const metadata = { robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return <Centered title={t.notFound.title} sub={t.notFound.sub} actions={<Button href={href("/", locale)}>{t.notFound.home}</Button>} />;
}

import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/terms", t.legal.terms.title, undefined);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const d = t.legal.terms;
  return (
    <>
      <PageHero title={d.title} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="max-w-3xl pt-0 md:pt-0">
        <div className="space-y-5 text-lg leading-relaxed text-white/80">
          {d.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Section>
    </>
  );
}

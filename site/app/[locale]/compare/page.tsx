import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/CtaSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/compare", t.compare.title, t.compare.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const c = t.compare;
  return (
    <>
      <PageHero title={c.title} sub={c.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <Reveal className="overflow-x-auto rounded-3xl border border-white/8">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                <th className="p-5" />
                {c.cols.map((col, i) => (
                  <th key={col} className={i === c.cols.length - 1 ? "p-5 text-start font-bold text-mint" : "p-5 text-start font-medium text-muted"}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r) => (
                <tr key={r.label} className="border-b border-white/5 last:border-0">
                  <th className="p-5 text-start font-medium text-white">{r.label}</th>
                  {r.values.map((v, i) => (
                    <td key={i} className={i === r.values.length - 1 ? "bg-mint/[0.06] p-5 font-semibold text-white" : "p-5 text-white/60"}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

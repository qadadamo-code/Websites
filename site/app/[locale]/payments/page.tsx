import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHead } from "@/components/Section";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/CtaSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/payments", t.paymentsPage.title, t.paymentsPage.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const p = t.paymentsPage;
  return (
    <>
      <PageHero title={p.title} sub={p.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.methods.map((m, i) => (
            <Reveal key={m.name} delay={(i % 4) * 0.06}>
              <SpotlightCard className="h-full">
                <span className="grid size-12 place-items-center rounded-2xl bg-mint/10 text-mint"><Icon name={m.icon} className="size-6" /></span>
                <h2 className="mt-5 text-lg font-semibold text-white">{m.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{m.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section className="pt-0 md:pt-0">
        <SectionHead title={p.levelsTitle} />
        <div className="grid gap-4 md:grid-cols-2">
          {p.levels.map((l, i) => (
            <Reveal key={l.title} delay={i * 0.1}>
              <div className={i ? "h-full rounded-3xl border border-mint/30 bg-mint/[0.05] p-8" : "h-full rounded-3xl border border-white/10 bg-white/[0.03] p-8"}>
                <h3 className="text-xl font-semibold text-white">{l.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{l.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{p.note}</p>
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

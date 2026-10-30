import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { MapPin, PhoneCall } from "lucide-react";
import { Section } from "@/components/Section";
import { BriefForm } from "@/components/BriefForm";
import { contact, waLink } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/start", t.start.title, t.start.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const o = t.home.cta.options;
  return (
    <>
      <PageHero title={t.start.title} sub={t.start.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <BriefForm t={t} locale={locale} />
          <div className="grid content-start gap-4">
            <a href={contact.mapsQuery} target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-mint/40">
              <MapPin className="size-6 text-mint" />
              <h2 className="mt-4 text-lg font-semibold text-white">{o[0].title}</h2>
              <p className="mt-1 text-sm text-muted">{o[0].text}</p>
            </a>
            <a href={`tel:${contact.phoneRaw}`} className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-mint/40">
              <PhoneCall className="size-6 text-mint" />
              <h2 className="mt-4 text-lg font-semibold text-white">{o[1].title}</h2>
              <p className="mt-1 text-sm text-muted">{o[1].text}</p>
              <p className="mt-3 text-sm text-white" dir="ltr">{contact.phone}</p>
            </a>
            <a href={waLink(t.common.waGreeting)} target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-[#25D366] p-6 text-center font-semibold text-[#05210f]">{t.common.whatsapp}</a>
          </div>
        </div>
      </Section>
    </>
  );
}

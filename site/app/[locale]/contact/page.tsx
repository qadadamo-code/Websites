import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CtaSection } from "@/components/CtaSection";
import { contact } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/contact", t.contact.title, t.contact.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const c = t.contact;
  const items = [
    { I: Phone, label: t.common.call, value: contact.phone, href: `tel:${contact.phoneRaw}`, ltr: true },
    { I: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}`, ltr: true },
    { I: MapPin, label: c.addressLabel, value: c.address, href: contact.mapsQuery },
    { I: Clock, label: c.hoursLabel, value: c.hours },
  ];
  return (
    <>
      <PageHero title={c.title} sub={c.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ I, label, value, href, ltr }, i) => (
            <Reveal key={label} delay={i * 0.06}>
              <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block h-full rounded-3xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-mint/40">
                <I className="size-6 text-mint" />
                <div className="mt-4 text-sm text-muted">{label}</div>
                <div className="mt-1 font-semibold text-white" dir={ltr ? "ltr" : undefined}>{value}</div>
              </a>
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

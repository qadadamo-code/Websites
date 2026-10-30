import { notFound } from "next/navigation";
import { getDict, locales, SITE_URL, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { CtaSection } from "@/components/CtaSection";

export function generateStaticParams() {
  return locales.flatMap((locale) => getDict(locale).blog.posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const p = getDict(locale).blog.posts.find((x) => x.slug === slug);
  return p ? pageMeta(locale, `/blog/${slug}`, p.title, p.excerpt) : {};
}

export default async function Page({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const p = t.blog.posts.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: p.title, datePublished: p.date, inLanguage: locale, publisher: { "@type": "Organization", name: "Planet" }, mainEntityOfPage: `${SITE_URL}/${locale}/blog/${slug}/` }} />
      <PageHero title={p.title} sub={p.excerpt} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="max-w-3xl pt-0 md:pt-0">
        <article className="space-y-6 text-lg leading-loose text-white/85">
          {p.body.map((x, i) => <p key={i}>{x}</p>)}
        </article>
      </Section>
      <CtaSection t={t} locale={locale} />
    </>
  );
}

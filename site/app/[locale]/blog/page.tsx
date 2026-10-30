import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { href } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "/blog", t.blog.title, t.blog.sub);
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageHero title={t.blog.title} sub={t.blog.sub} locale={locale} homeLabel={t.common.breadcrumbHome} />
      <Section className="pt-0 md:pt-0">
        <div className="grid gap-4 md:grid-cols-3">
          {t.blog.posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <Link href={href(`/blog/${p.slug}`, locale)} className="group flex h-full flex-col rounded-3xl border border-white/8 bg-white/[0.03] p-7 transition-colors hover:border-mint/40">
                <time className="text-xs text-muted">{p.date}</time>
                <h2 className="mt-3 text-xl font-semibold leading-snug text-white">{p.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{p.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-mint">{t.common.readMore} <ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

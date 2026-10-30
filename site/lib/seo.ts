import type { Metadata } from "next";
import { SITE_URL, getDict, type Locale } from "./i18n";

/** Per-page metadata with canonical + hreflang alternates. path like "/pricing" or "/". */
export function pageMeta(locale: Locale, path: string, title?: string, description?: string): Metadata {
  const t = getDict(locale);
  const clean = path === "/" ? "" : path.replace(/^\/|\/$/g, "") + "/";
  const url = (l: string) => `${SITE_URL}/${l}/${clean}`;
  const fullTitle = title ? `${title} | ${t.meta.siteName}` : t.meta.title;
  const desc = description ?? t.meta.description;
  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: url(locale),
      languages: { "ar-EG": url("ar"), en: url("en"), "x-default": url("ar") },
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url: url(locale),
      siteName: t.meta.siteName,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc },
  };
}

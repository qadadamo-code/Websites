import type { MetadataRoute } from "next";
import { SITE_URL, getDict } from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const t = getDict("ar");
  const paths = [
    "", "pricing", "templates", "solutions", "payments", "features", "compare", "faq", "start", "contact", "blog", "pay",
    "privacy", "terms", "refund",
    ...t.sectors.map((s) => `solutions/${s.slug}`),
    ...t.blog.posts.map((p) => `blog/${p.slug}`),
  ];
  return paths.map((p) => {
    const path = p ? `${p}/` : "";
    return {
      url: `${SITE_URL}/ar/${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: p === "" ? 1 : 0.7,
      alternates: { languages: { "ar-EG": `${SITE_URL}/ar/${path}`, en: `${SITE_URL}/en/${path}` } },
    };
  });
}

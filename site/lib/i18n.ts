import { ar } from "@/content/ar";
import { en } from "@/content/en";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export type Dict = typeof ar;

const dicts: Record<Locale, Dict> = { ar, en };

export function getDict(locale: string): Dict {
  return dicts[(locales as readonly string[]).includes(locale) ? (locale as Locale) : defaultLocale];
}

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");

/** Build a localized path: href("/pricing", "en") -> "/en/pricing/" */
export function href(path: string, locale: Locale) {
  const clean = path === "/" ? "" : path.replace(/^\/|\/$/g, "");
  return `/${locale}/${clean ? clean + "/" : ""}`;
}

export const SITE_URL = "https://web.theplanetco.com";

export const contact = {
  phone: "+20 120 310 1104",
  phoneRaw: "+201203101104",
  whatsapp: "201203101104",
  email: "info@theplanetco.com",
  instagram: "https://www.instagram.com/planet4cm",
  facebook: "https://www.facebook.com/planet4cm",
  linkedin: "https://www.linkedin.com/company/planet4cm",
  youtube: "https://www.youtube.com/@planet4cm",
  main: "https://theplanetco.com",
  mapsQuery: "https://maps.google.com/?q=30.0131,31.4969",
};

export function waLink(text: string) {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

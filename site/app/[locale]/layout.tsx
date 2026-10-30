import type { Metadata, Viewport } from "next";
import { Alexandria, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import { SITE_URL, contact, dirOf, getDict, isLocale, locales } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

const alexandria = Alexandria({ subsets: ["arabic", "latin"], variable: "--font-alexandria", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap", weight: ["400", "500", "700", "900"] });

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    metadataBase: new URL(SITE_URL),
    ...pageMeta(locale, "/"),
    icons: { icon: "/icon.png", apple: "/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = { themeColor: "#06091A", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  return (
    <html lang={locale === "ar" ? "ar-EG" : "en"} dir={dirOf(locale)} className={`${alexandria.variable} ${montserrat.variable}`}>
      <body className="font-sans">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: t.meta.siteName,
            url: `${SITE_URL}/${locale}/`,
            parentOrganization: { "@type": "Organization", name: "Planet Creative Marketing", url: contact.main },
            telephone: contact.phoneRaw,
            email: contact.email,
            address: { "@type": "PostalAddress", addressLocality: "New Cairo", addressCountry: "EG" },
            areaServed: ["EG", "SA", "AE"],
            priceRange: "EGP 11,999+",
            sameAs: [contact.instagram, contact.facebook, contact.linkedin, contact.youtube],
          }}
        />
        <SmoothScroll />
        <Header locale={locale} t={t.nav} />
        <main>{children}</main>
        <Footer locale={locale} t={t} />
        <WhatsAppFab text={t.common.waGreeting} label={t.common.whatsapp} />
        <Analytics />
      </body>
    </html>
  );
}

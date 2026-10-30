import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Instagram, Facebook, Linkedin, Youtube } from "./SocialIcons";
import { contact, href, type Dict, type Locale } from "@/lib/i18n";

export function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  const f = t.footer;
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/8">
      <div className="pointer-events-none absolute inset-x-0 -bottom-[40%] mx-auto h-[500px] max-w-5xl rounded-full bg-navy/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/lockup-light.png" alt="Planet Creative Marketing" className="h-20 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{f.about}</p>
            <div className="mt-6 flex gap-2">
              {[
                [contact.instagram, Instagram, "Instagram"],
                [contact.facebook, Facebook, "Facebook"],
                [contact.linkedin, Linkedin, "LinkedIn"],
                [contact.youtube, Youtube, "YouTube"],
              ].map(([u, I, l]) => {
                const C = I as typeof Instagram;
                return (
                  <a key={l as string} href={u as string} target="_blank" rel="noopener noreferrer" aria-label={l as string} className="grid size-10 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-mint hover:text-mint">
                    <C className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>
          <FooterCol title={f.cols.site} links={f.links.site} locale={locale} />
          <FooterCol title={f.cols.solutions} links={t.sectors.map((s) => ({ href: `/solutions/${s.slug}`, label: s.name }))} locale={locale} />
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">{f.cols.contact}</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li><a href={`tel:${contact.phoneRaw}`} className="flex items-center gap-2 hover:text-mint" dir="ltr"><Phone className="size-4" />{contact.phone}</a></li>
              <li><a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-mint"><Mail className="size-4" />{contact.email}</a></li>
              <li className="flex items-center gap-2"><MapPin className="size-4" />{t.contact.address}</li>
            </ul>
            <h3 className="mb-3 mt-8 text-sm font-semibold text-white">{f.cols.legal}</h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
              {f.links.legal.map((l) => (
                <li key={l.href}><Link href={href(l.href, locale)} className="hover:text-mint">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 text-xs text-muted sm:flex-row">
          <span>© {year} {f.rights}</span>
          <a href={contact.main} className="hover:text-mint" target="_blank" rel="noopener">{f.mainSite}</a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, locale }: { title: string; links: { href: string; label: string }[]; locale: Locale }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-3 text-sm text-muted">
        {links.map((l) => (
          <li key={l.href}><Link href={href(l.href, locale)} className="transition-colors hover:text-mint">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

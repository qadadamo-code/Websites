import { MapPin, PhoneCall, FileText, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { Button } from "./Button";
import { contact, href, waLink, type Dict, type Locale } from "@/lib/i18n";

const icons = { visit: MapPin, call: PhoneCall, brief: FileText };

export function CtaSection({ t, locale }: { t: Dict; locale: Locale }) {
  const c = t.home.cta;
  const links: Record<string, string> = {
    visit: contact.mapsQuery,
    call: `tel:${contact.phoneRaw}`,
    brief: href("/start", locale),
  };
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="noise relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-navy via-space-2 to-space p-8 sm:p-14">
        <div className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-mint/20 blur-3xl" />
        <Reveal className="relative max-w-2xl">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">{c.title}</h2>
          <p className="mt-5 text-lg text-white/75">{c.sub}</p>
        </Reveal>
        <div className="relative mt-10 grid gap-4 md:grid-cols-3">
          {c.options.map((o, i) => {
            const I = icons[o.k as keyof typeof icons];
            const ext = o.k !== "brief";
            return (
              <Reveal key={o.k} delay={i * 0.1}>
                <a
                  href={links[o.k]}
                  {...(ext && o.k === "visit" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-mint/40 hover:bg-white/8"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-mint/15 text-mint"><I className="size-5" /></span>
                    <ArrowUpRight className="size-5 text-white/40 transition-all group-hover:text-mint rtl:-scale-x-100" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{o.title}</h3>
                  <p className="mt-2 text-sm text-white/65">{o.text}</p>
                </a>
              </Reveal>
            );
          })}
        </div>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Button href={waLink(t.common.waGreeting)} variant="whatsapp" external>{t.common.whatsapp}</Button>
          <Button href={href("/start", locale)}>{t.nav.cta}</Button>
        </div>
      </div>
    </section>
  );
}

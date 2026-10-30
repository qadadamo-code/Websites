"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Globe } from "lucide-react";
import { href, type Locale, type Dict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header({ locale, t }: { locale: Locale; t: Dict["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || `/${locale}/`;
  const other: Locale = locale === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${other}`);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5",
          scrolled ? "glass shadow-xl shadow-black/30" : "bg-transparent"
        )}
      >
        <Link href={href("/", locale)} className="flex items-center gap-2.5" aria-label="Planet Web">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark-light.png" alt="" className="h-7 w-auto" />
          <span className="font-display text-lg font-black tracking-tight text-white" dir="ltr">
            PLANET <span className="font-medium text-mint">Web</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {t.links.map((l) => {
            const h = href(l.href, locale);
            const active = pathname.startsWith(h);
            return (
              <Link
                key={l.href}
                href={h}
                className={cn("rounded-full px-3.5 py-2 text-sm transition-colors", active ? "text-mint" : "text-white/75 hover:text-white")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={switchHref} hrefLang={other} className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/75 hover:text-white sm:flex">
            <Globe className="size-4" />
            {t.switchTo}
          </Link>
          <Link
            href={href("/start", locale)}
            className="hidden rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-space transition-shadow hover:shadow-[0_0_30px_rgba(146,197,180,0.5)] sm:inline-flex"
          >
            {t.cta}
          </Link>
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full text-white lg:hidden" aria-label={t.menu}>
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-space/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display text-lg font-black text-white" dir="ltr">PLANET <span className="text-mint">Web</span></span>
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full text-white" aria-label={t.close}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-6 pt-6">
              {t.links.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link href={href(l.href, locale)} className="block border-b border-white/8 py-4 text-2xl font-semibold text-white">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 flex flex-col gap-3">
                <Link href={href("/start", locale)} className="rounded-full bg-mint py-4 text-center font-semibold text-space">{t.cta}</Link>
                <Link href={switchHref} className="rounded-full border border-white/15 py-4 text-center text-white">{t.switchTo}</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

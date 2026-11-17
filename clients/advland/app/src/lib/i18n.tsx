import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Lang = "ar" | "en"
export type Bi = { ar: string; en: string }
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (ar: string, en: string) => string; L: (b?: Partial<Bi> | null) => string }

const I18n = createContext<Ctx>(null as unknown as Ctx)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (document.documentElement.lang === "en" ? "en" : "ar"))
  useEffect(() => {
    const d = document.documentElement
    d.lang = lang
    d.dir = lang === "ar" ? "rtl" : "ltr"
    try { localStorage.setItem("adv-lang", lang) } catch {}
    const u = new URL(location.href)
    if (u.searchParams.has("lang")) { u.searchParams.delete("lang"); history.replaceState(null, "", u) }
  }, [lang])
  const value: Ctx = {
    lang,
    setLang: setLangState,
    t: (ar, en) => (lang === "ar" ? ar : en),
    L: (b) => (b ? (b[lang] ?? b.ar ?? "") : ""),
  }
  return <I18n.Provider value={value}>{children}</I18n.Provider>
}
export const useI18n = () => useContext(I18n)

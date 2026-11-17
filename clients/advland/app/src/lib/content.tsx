import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import seed from "@seed"
import type { Bi } from "./i18n"

export type Branch = { id: string; name: Bi; floor: Bi; city: Bi; map: string; hours: { weekday: string[]; weekend: string[] }; color: string }
export type Zone = { id: string; img: string; title: Bi; desc: Bi; age: Bi; tag: Bi }
export type Pkg = { id: string; name: Bi; price: number; kids: number; duration: Bi; includes: { ar: string[]; en: string[] }; featured: boolean }
export type Addon = { id: string; name: Bi; price: number; icon: string }
export type Rental = { id: string; img: string; name: Bi; desc: Bi; size: string; price: number }
export type Review = { name: Bi; text: Bi; stars: number }
export type Faq = { q: Bi; a: Bi }
export type Content = {
  settings: { whatsapp: string; phone: string; landline: string; email: string; instagram: string; currency: Bi; announcement: Bi & { on: boolean } }
  branches: Branch[]; zones: Zone[]; packages: Pkg[]; addons: Addon[]; rentals: Rental[]; reviews: Review[]; faq: Faq[]
}

const Ctx = createContext<Content>(seed as Content)

/** Starts with the bundled seed (instant render), then swaps in the live content from the PHP API. */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [c, setC] = useState<Content>(seed as Content)
  useEffect(() => {
    fetch("api/content.php", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j?.ok && j.content?.settings) setC({ ...(seed as Content), ...j.content }) })
      .catch(() => {})
  }, [])
  return <Ctx.Provider value={c}>{children}</Ctx.Provider>
}
export const useContent = () => useContext(Ctx)

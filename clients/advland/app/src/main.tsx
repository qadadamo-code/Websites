import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles.css"
import { LangProvider } from "@/lib/i18n"
import { ContentProvider } from "@/lib/content"
import Home from "@/pages/Home"
import { Zones, Parties, Rentals, Branches, Contact } from "@/pages/Inner"

const pages = { home: Home, zones: Zones, parties: Parties, rentals: Rentals, branches: Branches, contact: Contact }
const root = document.getElementById("root")!
const Page = pages[(root.dataset.page ?? "home") as keyof typeof pages] ?? Home

createRoot(root).render(
  <StrictMode>
    <LangProvider>
      <ContentProvider>
        <Page />
      </ContentProvider>
    </LangProvider>
  </StrictMode>,
)

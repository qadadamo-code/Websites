// 21st.dev · Tubelight Navbar (ayushmxxn) — adapted: plain <a> links, active page from props, RTL-friendly.
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem { name: string; url: string; icon: LucideIcon; id: string }
interface NavBarProps { items: NavItem[]; active: string; className?: string }

export function NavBar({ items, active, className }: NavBarProps) {
  return (
    <div className={cn("fixed bottom-0 lg:bottom-auto lg:top-0 left-1/2 -translate-x-1/2 z-50 mb-4 lg:mb-0 lg:pt-5", className)}>
      <div className="flex items-center gap-1 lg:gap-2 bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] border border-border backdrop-blur-xl py-1 px-1 rounded-full shadow-[0_14px_40px_-18px_#111a4a66]">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <a
              key={item.id}
              href={item.url}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-2 sm:px-3.5 lg:px-5 py-2 rounded-full transition-colors font-[family-name:var(--font-display)]",
                "text-foreground/75 hover:text-primary",
                isActive && "text-primary",
              )}
            >
              <span className="hidden lg:inline whitespace-nowrap">{item.name}</span>
              <span className="lg:hidden flex flex-col items-center gap-0.5">
                <Icon size={19} strokeWidth={2.4} />
                <span className="text-[10px] leading-none">{item.name}</span>
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full max-lg:top-auto max-lg:-bottom-2 max-lg:rounded-t-none max-lg:rounded-b-full">
                    <div className="absolute w-12 h-6 bg-primary/25 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/25 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/25 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}

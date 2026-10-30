import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 md:py-32", className)}>
      {children}
    </section>
  );
}

export function SectionHead({ eyebrow, title, sub, center = false }: { eyebrow?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <Reveal className={cn("mb-14 max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <span className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-mint">
          <span className="size-1.5 rounded-full bg-mint" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">{title}</h2>
      {sub && <p className="mt-5 text-lg leading-relaxed text-muted">{sub}</p>}
    </Reveal>
  );
}

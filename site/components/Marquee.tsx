import { cn } from "@/lib/utils";

export function Marquee({ children, className, duration = 40 }: { children: React.ReactNode; className?: string; duration?: number }) {
  return (
    <div
      className={cn("group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]", className)}
      style={{ ["--marquee-duration" as string]: `${duration}s`, ["--marquee-gap" as string]: "3rem" }}
      dir="ltr"
    >
      <div className="marquee-track flex shrink-0 animate-marquee items-center gap-12 pe-12 group-hover:[animation-play-state:paused]">
        {children}
        {children}
      </div>
    </div>
  );
}

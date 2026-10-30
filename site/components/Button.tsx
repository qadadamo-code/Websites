import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = { href: string; variant?: "primary" | "ghost" | "whatsapp"; className?: string; children: React.ReactNode; external?: boolean };

export function Button({ href, variant = "primary", className, children, external }: Props) {
  const cls = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300",
    variant === "primary" && "bg-mint text-space hover:bg-mint-2 hover:shadow-[0_0_40px_rgba(146,197,180,0.45)]",
    variant === "ghost" && "border border-white/15 text-white hover:border-mint/50 hover:bg-white/5",
    variant === "whatsapp" && "bg-[#25D366] text-[#05210f] hover:shadow-[0_0_40px_rgba(37,211,102,0.4)]",
    className
  );
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

import {
  Palette, Languages, Sparkles, Smartphone, Search, CreditCard, MessageCircle, LayoutDashboard,
  ShieldCheck, UtensilsCrossed, Building2, Shirt, ShoppingBag, Stethoscope, Building, QrCode,
  Wallet, Store, Landmark, CalendarClock, Banknote, Globe, type LucideProps,
} from "lucide-react";

const map = {
  Palette, Languages, Sparkles, Smartphone, Search, CreditCard, MessageCircle, LayoutDashboard,
  ShieldCheck, UtensilsCrossed, Building2, Shirt, ShoppingBag, Stethoscope, Building, QrCode,
  Wallet, Store, Landmark, CalendarClock, Banknote, Globe,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = map[name as keyof typeof map] ?? Sparkles;
  return <C {...props} />;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
/** Image path from content: bundled images live in img/, admin uploads in uploads/. */
export const img = (p?: string) => (!p ? "" : p.startsWith("uploads/") || p.startsWith("http") ? p : "img/" + p)
export const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n)

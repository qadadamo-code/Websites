export type BookingPayload = {
  type: "party" | "rental" | "visit" | "contact"
  name: string; phone: string; branch?: string; date?: string; time?: string; kids?: number
  package?: string; addons?: string[]; items?: string[]; address?: string; notes?: string; lang: string; website?: string
}
export async function submitBooking(p: BookingPayload): Promise<{ ok: boolean; ref?: string; estimate?: number; error?: string }> {
  try {
    const r = await fetch("api/book.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })
    const j = await r.json().catch(() => null)
    return j ?? { ok: false, error: "network" }
  } catch { return { ok: false, error: "network" } }
}
export async function trackBooking(ref: string, phone: string) {
  try {
    const r = await fetch("api/track.php?ref=" + encodeURIComponent(ref) + "&phone=" + encodeURIComponent(phone))
    return await r.json()
  } catch { return { ok: false, error: "network" } }
}

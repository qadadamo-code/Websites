import type { Branch } from "./content"

const mins = (s: string) => { const [h, m] = (s || "0:0").split(":").map(Number); return h * 60 + m + (s === "23:59" ? 1 : 0) }
/** Now in the UAE (UTC+4), whatever the visitor's timezone. */
export const uaeNow = () => { const d = new Date(Date.now() + (d0() + 240) * 60000); return d }
const d0 = () => new Date().getTimezoneOffset()
/** Thursday to Saturday use the late "weekend" hours. */
export const isWeekend = (day: number) => day === 4 || day === 5 || day === 6
export function todayHours(b: Branch, now = uaeNow()) { return isWeekend(now.getDay()) ? b.hours.weekend : b.hours.weekday }
export function openState(b: Branch, now = uaeNow()) {
  const [o, c] = todayHours(b, now)
  const t = now.getHours() * 60 + now.getMinutes()
  const open = mins(o), close = mins(c)
  const isOpen = t >= open && t < close
  return { isOpen, opens: o, closes: c === "23:59" || c === "24:00" ? "00:00" : c, minsLeft: isOpen ? close - t : 0 }
}

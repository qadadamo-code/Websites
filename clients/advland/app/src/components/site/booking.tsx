import { useState, type ReactNode, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Copy, Search, Send, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useContent } from "@/lib/content"
import { submitBooking, trackBooking, type BookingPayload } from "@/lib/api"
import { fmt, cn } from "@/lib/utils"
import { WhatsAppIcon, confetti, waLink } from "./bits"

const today = () => { const d = new Date(Date.now() + (new Date().getTimezoneOffset() + 240) * 60000); return d.toISOString().slice(0, 10) }

type Fields = { branch?: boolean; date?: boolean; time?: boolean; address?: boolean; notes?: boolean }
type Props = {
  type: BookingPayload["type"]
  extra?: Partial<BookingPayload>
  fields?: Fields
  summary?: string
  estimate?: number
  submitLabel?: string
  disabled?: boolean
  disabledHint?: string
  children?: ReactNode
  className?: string
}

/** Shared request form: posts to the PHP API, falls back to WhatsApp when offline. */
export function BookingForm({ type, extra = {}, fields = {}, summary = "", estimate, submitLabel, disabled, disabledHint, children, className }: Props) {
  const { t, L, lang } = useI18n()
  const c = useContent()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [done, setDone] = useState<{ ref: string; estimate: number; wa: string } | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (disabled) return
    const f = new FormData(e.currentTarget)
    const g = (k: string) => String(f.get(k) ?? "").trim()
    const p: BookingPayload = {
      type, lang, name: g("name"), phone: g("phone"), branch: g("branch") || undefined, date: g("date") || undefined,
      time: g("time") || undefined, address: g("address") || undefined, notes: g("notes") || undefined, website: g("website"), ...extra,
    }
    if (p.name.length < 2) return setErr(t("اكتب اسمك من فضلك", "Please enter your name"))
    if (p.phone.replace(/\D/g, "").length < 8) return setErr(t("رقم الجوال غير صحيح", "Please enter a valid mobile number"))
    setErr(""); setBusy(true)
    const r = await submitBooking(p)
    setBusy(false)
    const branch = c.branches.find((b) => b.id === p.branch)
    const lines = [
      t("مرحباً أرض المغامرات 👋", "Hi Adventure Land 👋"),
      summary,
      branch ? t("الفرع: ", "Branch: ") + L(branch.name) : "",
      p.date ? t("التاريخ: ", "Date: ") + p.date + (p.time ? " · " + p.time : "") : "",
      p.address ? t("العنوان: ", "Address: ") + p.address : "",
      t("الاسم: ", "Name: ") + p.name + " · " + p.phone,
      p.notes ? t("ملاحظات: ", "Notes: ") + p.notes : "",
    ]
    if (r.ok && r.ref) {
      lines.splice(1, 0, t("رقم الطلب: ", "Request no: ") + r.ref)
      setDone({ ref: r.ref, estimate: r.estimate ?? estimate ?? 0, wa: waLink(c.settings.whatsapp, lines.filter(Boolean).join("\n")) })
      confetti()
      ;(e.target as HTMLFormElement).reset()
    } else if (r.error === "rate") {
      setErr(t("أرسلت طلبات كثيرة، تواصل معنا على واتساب", "Too many requests, please message us on WhatsApp"))
    } else if (r.error === "network" || !r.error || r.error === "bad_json") {
      window.open(waLink(c.settings.whatsapp, lines.filter(Boolean).join("\n")), "_blank")
    } else {
      setErr(t("تأكد من الاسم ورقم الجوال", "Please check your name and number"))
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className={cn("grid gap-4", className)} noValidate>
        {children}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="field">{t("الاسم", "Your name")}<input name="name" autoComplete="name" required placeholder={t("اسم ولي الأمر", "Parent's name")} /></label>
          <label className="field">{t("رقم الجوال / واتساب", "Mobile / WhatsApp")}<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="05X XXX XXXX" dir="ltr" /></label>
          {fields.branch && (
            <label className="field">{t("الفرع", "Branch")}
              <select name="branch" defaultValue={c.branches[0]?.id}>{c.branches.map((b) => <option key={b.id} value={b.id}>{L(b.name)} · {L(b.city)}</option>)}</select>
            </label>
          )}
          {fields.date && <label className="field">{t("التاريخ", "Date")}<input name="date" type="date" min={today()} required /></label>}
          {fields.time && <label className="field">{t("الوقت المفضل", "Preferred time")}<input name="time" type="time" defaultValue="16:00" step={1800} /></label>}
          {fields.address && <label className="field sm:col-span-2">{t("العنوان في العين", "Address in Al Ain")}<input name="address" autoComplete="street-address" placeholder={t("المنطقة، الشارع، رقم الفيلا", "Area, street, villa no.")} /></label>}
          {fields.notes && <label className="field sm:col-span-2">{t("ملاحظات (اختياري)", "Notes (optional)")}<textarea name="notes" rows={3} placeholder={t("عمر الطفل، اسم المحتفل، أي طلب خاص…", "Child's age, birthday name, any special request…")} /></label>}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        </div>
        {err && <p className="m-0 text-red font-semibold text-sm">{err}</p>}
        <button className="btn btn-o w-full !py-4 text-lg disabled:opacity-60" disabled={busy || disabled}>
          {busy ? <span className="w-5 h-5 border-[3px] border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={19} className="rtl:-scale-x-100" />}
          {submitLabel ?? t("أرسل الطلب", "Send request")}
        </button>
        {disabled && disabledHint && <p className="m-0 -mt-2 text-center text-sm text-muted-foreground">{disabledHint}</p>}
        <p className="m-0 text-center text-xs text-muted-foreground">{t("نرد عليك خلال ساعات العمل لتأكيد التفاصيل. لا يلزم أي دفع الآن.", "We'll reply during opening hours to confirm. No payment needed now.")}</p>
      </form>
      <SuccessModal done={done} onClose={() => setDone(null)} />
    </>
  )
}

function SuccessModal({ done, onClose }: { done: { ref: string; estimate: number; wa: string } | null; onClose: () => void }) {
  const { t, L } = useI18n()
  const { settings } = useContent()
  const [copied, setCopied] = useState(false)
  return createPortal(
    <AnimatePresence>
      {done && (
        <motion.div className="fixed inset-0 z-[150] grid place-items-center p-4 bg-night/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" className="card relative w-full max-w-md p-7 pt-20 text-center overflow-visible"
            initial={{ y: 40, scale: .9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: "spring", damping: 18 }}
            onClick={(e) => e.stopPropagation()}>
            <img src="img/m3-party.webp" alt="" className="absolute -top-20 left-1/2 -translate-x-1/2 w-36 animate-wiggle" />
            <button onClick={onClose} className="absolute top-4 end-4 w-9 h-9 grid place-items-center rounded-full hover:bg-muted" aria-label="close"><X size={18} /></button>
            <h3 className="text-2xl">{t("وصل طلبك! 🎉", "Request received! 🎉")}</h3>
            <p className="text-muted-foreground mt-2 mb-5">{t("فريق أرض المغامرات بيتواصل معك قريباً لتأكيد كل التفاصيل.", "The Adventure Land team will contact you shortly to confirm everything.")}</p>
            <div className="rounded-2xl bg-muted p-4 flex items-center justify-between gap-3">
              <div className="text-start"><small className="text-muted-foreground block">{t("رقم الطلب", "Request number")}</small><b className="text-2xl font-[family-name:var(--font-display)] tracking-wider" dir="ltr">{done.ref}</b></div>
              <button className="btn btn-g !p-2.5" onClick={() => { navigator.clipboard?.writeText(done.ref); setCopied(true); setTimeout(() => setCopied(false), 1500) }} aria-label="copy">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
            </div>
            {done.estimate > 0 && <p className="mt-4 mb-0 text-sm">{t("التكلفة التقديرية", "Estimated total")}: <b className="text-orange text-lg">{fmt(done.estimate)} {L(settings.currency)}</b></p>}
            <a href={done.wa} target="_blank" rel="noopener" className="btn btn-wa w-full mt-6"><WhatsAppIcon />{t("أكمل على واتساب (أسرع)", "Continue on WhatsApp (faster)")}</a>
            <p className="text-xs text-muted-foreground mt-3 mb-0">{t("احتفظ برقم الطلب لمتابعته من صفحة الفروع", "Keep this number to track it from the Branches page")}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

const STATUS: Record<string, [string, string, string]> = {
  new: ["قيد المراجعة", "In review", "#f2a31b"], contacted: ["تم التواصل", "Contacted", "#3b82f6"],
  confirmed: ["مؤكد ✓", "Confirmed ✓", "#1fa855"], done: ["مكتمل", "Completed", "#6b7280"], cancelled: ["ملغي", "Cancelled", "#e5484d"],
}

export function TrackBooking({ className }: { className?: string }) {
  const { t } = useI18n()
  const [res, setRes] = useState<null | { ok: boolean; status?: string; date?: string; type?: string; error?: string }>(null)
  const [busy, setBusy] = useState(false)
  const go = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    const r = await trackBooking(String(f.get("ref") || "").trim().toUpperCase(), String(f.get("phone") || ""))
    setRes(r?.ok && r.booking ? { ok: true, ...r.booking } : { ok: false })
    setBusy(false)
  }
  const st = res?.ok && res.status ? STATUS[res.status] : null
  return (
    <form onSubmit={go} className={cn("card p-6 md:p-8 grid gap-4", className)}>
      <div className="flex items-center gap-3"><span className="w-11 h-11 rounded-2xl grid place-items-center bg-navy text-white dark:bg-white dark:text-navy"><Search size={20} /></span>
        <div><h3 className="text-xl">{t("تابع طلبك", "Track your request")}</h3><p className="m-0 text-sm text-muted-foreground">{t("برقم الطلب ورقم الجوال", "With your request no. and mobile")}</p></div></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="field">{t("رقم الطلب", "Request no.")}<input name="ref" placeholder="AL-XXXX" dir="ltr" required /></label>
        <label className="field">{t("رقم الجوال", "Mobile")}<input name="phone" type="tel" dir="ltr" required /></label>
      </div>
      <button className="btn btn-n" disabled={busy}>{busy ? "…" : t("اعرض الحالة", "Check status")}</button>
      {res && (st
        ? <div className="rounded-2xl p-4 flex items-center justify-between font-semibold" style={{ background: st[2] + "1f", color: st[2] }}><span>{t(st[0], st[1])}</span>{res.date && <span dir="ltr">{res.date}</span>}</div>
        : <p className="m-0 text-sm text-red font-semibold">{t("لم نجد طلباً بهذه البيانات", "No request found with these details")}</p>)}
    </form>
  )
}

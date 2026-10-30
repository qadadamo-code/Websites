"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Paperclip } from "lucide-react";
import { href, waLink, type Dict, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const input =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-mint/60 focus:bg-white/[0.05]";

export function BriefForm({ t, locale }: { t: Dict; locale: Locale }) {
  const s = t.start;
  const f = s.fields;
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [data, setData] = useState<Record<string, string>>({});
  const [sector, setSector] = useState("");
  const [addons, setAddons] = useState<string[]>([]);
  const [way, setWay] = useState(f.contactWays[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [template, setTemplate] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const tp = new URLSearchParams(window.location.search).get("template");
    if (tp) setTemplate(tp);
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setData((d) => ({ ...d, [k]: e.target.value }));
  const canNext = step !== 0 || (data.name?.trim() && data.phone?.trim());
  const Next = locale === "ar" ? ArrowLeft : ArrowRight;
  const Prev = locale === "ar" ? ArrowRight : ArrowLeft;

  const summary = () =>
    [
      t.common.waGreeting,
      `${f.name}: ${data.name || ""}`,
      `${f.company}: ${data.company || ""}`,
      `${f.phone}: ${data.phone || ""}`,
      `${f.sector}: ${sector}`,
      template && `Template: ${template}`,
      `${f.goal}: ${data.goal || ""}`,
      addons.length ? `${f.addons}: ${addons.join("، ")}` : "",
      `${f.contactWay}: ${way}`,
    ]
      .filter(Boolean)
      .join("\n");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < s.steps.length - 1) return setStep(step + 1);
    setStatus("sending");
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    fd.append("sector", sector);
    fd.append("addons", addons.join(", "));
    fd.append("contact_way", way);
    fd.append("template", template);
    fd.append("locale", locale);
    fd.append("website", ""); // honeypot
    files.slice(0, 5).forEach((file) => fd.append("files[]", file));
    try {
      const res = await fetch("/api/lead.php", { method: "POST", body: fd });
      if (!res.ok) throw new Error(String(res.status));
      window.location.href = href("/thanks", locale);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="glass rounded-[2rem] p-6 sm:p-10">
      {/* steps */}
      <ol className="mb-10 flex items-center gap-2">
        {s.steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border text-sm transition-colors", i < step ? "border-mint bg-mint text-space" : i === step ? "border-mint text-mint" : "border-white/15 text-white/40")}>
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={cn("hidden text-sm sm:block", i === step ? "text-white" : "text-white/40")}>{label}</span>
            {i < s.steps.length - 1 && <span className={cn("h-px flex-1 transition-colors", i < step ? "bg-mint" : "bg-white/10")} />}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid gap-5">
          {step === 0 && (
            <>
              <Field label={`${f.name} *`}><input className={input} required value={data.name || ""} onChange={set("name")} autoComplete="name" /></Field>
              <Field label={f.company}><input className={input} value={data.company || ""} onChange={set("company")} autoComplete="organization" /></Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={`${f.phone} *`}><input className={input} required type="tel" dir="ltr" value={data.phone || ""} onChange={set("phone")} autoComplete="tel" /></Field>
                <Field label={f.email}><input className={input} type="email" dir="ltr" value={data.email || ""} onChange={set("email")} autoComplete="email" /></Field>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <Field label={f.sector}>
                <Chips options={[...t.sectors.map((x) => x.name), f.sectorOther]} value={[sector]} onToggle={(v) => setSector(v)} />
              </Field>
              <Field label={f.currentSite}><input className={input} dir="ltr" value={data.current_site || ""} onChange={set("current_site")} placeholder="https://" /></Field>
              <Field label={f.goal}><textarea className={cn(input, "min-h-28")} value={data.goal || ""} onChange={set("goal")} placeholder={f.goalPlaceholder} /></Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label={f.addons}>
                <Chips options={t.pricing.addons.map((a) => a.name)} value={addons} onToggle={(v) => setAddons((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]))} />
              </Field>
              <Field label={f.references}><textarea className={cn(input, "min-h-24")} dir="ltr" value={data.references || ""} onChange={set("references")} /></Field>
              <Field label={f.files}>
                <label className={cn(input, "flex cursor-pointer items-center gap-3 text-white/60")}>
                  <Paperclip className="size-4 text-mint" />
                  <span className="truncate">{files.length ? files.map((x) => x.name).join(", ") : "PNG, JPG, PDF, AI"}</span>
                  <input type="file" multiple accept="image/*,.pdf,.ai,.svg,.zip" className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                </label>
              </Field>
            </>
          )}
          {step === 3 && (
            <>
              <Field label={f.contactWay}>
                <Chips options={f.contactWays} value={[way]} onToggle={(v) => setWay(v)} />
              </Field>
              <Field label={f.notes}><textarea className={cn(input, "min-h-28")} value={data.notes || ""} onChange={set("notes")} /></Field>
              <p className="text-xs text-muted">{s.privacy}</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {status === "error" && (
        <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          {t.common.error}{" "}
          <a href={waLink(summary())} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{t.common.whatsapp}</a>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-white/70 hover:text-white">
            <Prev className="size-4" /> {s.prev}
          </button>
        ) : (
          <a href={waLink(t.common.waGreeting)} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-mint">{s.orWhatsapp}</a>
        )}
        <button
          type="submit"
          disabled={!canNext || status === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 text-sm font-semibold text-space transition-all hover:shadow-[0_0_30px_rgba(146,197,180,0.5)] disabled:opacity-40"
        >
          {status === "sending" ? t.common.sending : step === s.steps.length - 1 ? s.submit : s.next}
          {step < s.steps.length - 1 && <Next className="size-4" />}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm text-white/80">{label}</span>
      {children}
    </div>
  );
}

function Chips({ options, value, onToggle }: { options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => onToggle(o)}
            aria-pressed={on}
            className={cn("rounded-full border px-4 py-2 text-sm transition-colors", on ? "border-mint bg-mint/15 text-mint" : "border-white/10 text-white/70 hover:border-white/30")}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

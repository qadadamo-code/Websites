"use client";
import { useState } from "react";
import { Copy, Check, Paperclip } from "lucide-react";
import { Icon } from "./Icon";
import { href, waLink, type Dict, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const input =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-mint/60";

/** Planet's own payment details + receipt upload. Details live in content (pay.methods[].detail). */
export function PayBox({ t, locale }: { t: Dict; locale: Locale }) {
  const p = t.pay;
  const [copied, setCopied] = useState("");
  const [method, setMethod] = useState(p.methods[0].name);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    fd.set("method", method);
    fd.set("locale", locale);
    if (file) fd.set("receipt", file);
    try {
      const r = await fetch("/api/receipt.php", { method: "POST", body: fd });
      if (!r.ok) throw new Error();
      window.location.href = href("/thanks", locale);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="grid gap-4 sm:grid-cols-2">
        {p.methods.map((m) => (
          <div key={m.id} className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-mint/10 text-mint"><Icon name={m.icon} className="size-5" /></span>
              <span className="font-semibold text-white">{m.name}</span>
            </div>
            {m.id === "instapay" && m.detail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/pay/instapay-qr.png" alt="InstaPay QR" className="mt-5 w-36 rounded-xl bg-white p-2" />
            )}
            {m.detail ? (
              <button
                onClick={() => { navigator.clipboard.writeText(m.detail); setCopied(m.id); setTimeout(() => setCopied(""), 1500); }}
                className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white"
                dir="ltr"
              >
                <span className="truncate">{m.detail}</span>
                {copied === m.id ? <Check className="size-4 text-mint" /> : <Copy className="size-4 text-muted" />}
              </button>
            ) : (
              <a href={waLink(`${t.common.waGreeting} - ${m.name}`)} target="_blank" rel="noopener noreferrer" className="mt-4 block text-sm text-mint hover:underline">{p.pending}</a>
            )}
            {m.hint && <p className="mt-3 text-xs text-muted">{m.hint}</p>}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="glass grid gap-4 rounded-[2rem] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">{p.uploadTitle}</h2>
        <input name="name" required placeholder={p.fields.name} className={input} />
        <input name="phone" required type="tel" dir="ltr" placeholder={p.fields.phone} className={input} />
        <input name="amount" required inputMode="numeric" placeholder={p.fields.amount} className={input} />
        <div className="flex flex-wrap gap-2">
          {p.methods.map((m) => (
            <button type="button" key={m.id} onClick={() => setMethod(m.name)} className={cn("rounded-full border px-4 py-2 text-sm", method === m.name ? "border-mint bg-mint/15 text-mint" : "border-white/10 text-white/70")}>
              {m.name}
            </button>
          ))}
        </div>
        <label className={cn(input, "flex cursor-pointer items-center gap-3 text-white/60")}>
          <Paperclip className="size-4 text-mint" />
          <span className="truncate">{file ? file.name : p.fields.receipt}</span>
          <input type="file" accept="image/*,.pdf" required className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
        {status === "error" && <p className="text-sm text-red-300">{t.common.error}</p>}
        <button disabled={status === "sending"} className="rounded-full bg-mint py-3.5 text-sm font-semibold text-space disabled:opacity-50">
          {status === "sending" ? t.common.sending : p.submit}
        </button>
      </form>
    </div>
  );
}

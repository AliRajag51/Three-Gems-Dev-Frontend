"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/context/auth.context";
import { createSupportTicketService, type SupportTicketType } from "@/lib/services/support.service";

const TYPES: { value: SupportTicketType; label: string }[] = [
  { value: "PAYMENT", label: "Payment problem" },
  { value: "PLUGIN", label: "Plugin problem" },
  { value: "LICENSE", label: "License problem" },
  { value: "ACCOUNT", label: "Account problem" },
  { value: "OTHER", label: "Something else" },
];

export function SupportForm() {
  const { user } = useAuth();
  const [licenseKey, setLicenseKey] = useState("");
  const [type, setType] = useState<SupportTicketType>("PLUGIN");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    setLoading(true);
    setResult(null);
    try {
      await createSupportTicketService({
        email: user.email,
        licenseKey: licenseKey.trim() || undefined,
        type,
        message: message.trim(),
      });
      setResult({ ok: true, msg: "Thanks! Your request was submitted — we'll reply by email." });
      setMessage("");
      setLicenseKey("");
    } catch (err: any) {
      setResult({ ok: false, msg: err.response?.data?.message ?? "Could not submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card-surface p-6 text-sm text-muted-foreground">
        Please{" "}
        <Link href="/account/login" className="text-primary font-semibold">sign in</Link>{" "}
        with the email on your license to submit a support request.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold">Your email</label>
        <div className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground">
          {user.email}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">What&apos;s it about?</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as SupportTicketType)}
          className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold">
          License key <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="TG-XXXX-XXXX-XXXX"
          className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Message</label>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What can we help with?"
          className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !message.trim()}
        className="btn-ruby flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Send message
      </button>

      {result && (
        <div className={`flex items-start gap-2 text-sm px-3 py-2.5 rounded-xl ${result.ok ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}>
          {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>{result.msg}</span>
        </div>
      )}
    </form>
  );
}

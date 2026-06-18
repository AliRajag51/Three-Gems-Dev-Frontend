"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createContactService, type ContactSubject } from "@/lib/services/contact.service";

const SUBJECTS: { value: ContactSubject; label: string }[] = [
  { value: "SALES", label: "Sales inquiry" },
  { value: "AGENCY", label: "Agency / bundle pricing" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "OTHER", label: "Other" },
];

const inputCls =
  "mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState<ContactSubject>("SALES");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — kept empty by real users
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      await createContactService({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        subject,
        message: message.trim(),
        website,
      });
      setResult({ ok: true, msg: "Thanks! Your message was sent — we'll reply by email within 1 business day." });
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setSubject("SALES");
    } catch (err: any) {
      setResult({ ok: false, msg: err.response?.data?.message ?? "Could not send. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
      <div>
        <label className="text-sm font-semibold">Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-semibold">Email</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </div>

      <div className="sm:col-span-2">
        <label className="text-sm font-semibold">
          Company <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
      </div>

      <div className="sm:col-span-2">
        <label className="text-sm font-semibold">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value as ContactSubject)}
          className={inputCls}
        >
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="text-sm font-semibold">Message</label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Honeypot: hidden from real users; bots tend to fill every field. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-ruby sm:col-span-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Send message
      </button>

      {result && (
        <div
          className={`sm:col-span-2 flex items-start gap-2 text-sm px-3 py-2.5 rounded-xl ${
            result.ok ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{result.msg}</span>
        </div>
      )}
    </form>
  );
}

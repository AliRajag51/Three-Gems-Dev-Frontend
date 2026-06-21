"use client";

import { useRef, useState } from "react";
import { Upload, Image, Loader2, Play, Bold } from "lucide-react";
import { renderRichText } from "@/lib/rich-text";
import * as adminService from "@/lib/services/admin.service";
import { EmailPicker } from "@/components/admin/email-picker";
import { youtubeId } from "@/lib/youtube";

export type DetailsForm = {
  name: string;
  slug: string;
  description: string;
  videoUrl: string;
  version: string;
  isActive: boolean;
  iconUrl: string | null;
  isPublic: boolean;
  allowedEmails: string[];
};

export function DetailsTab({ form, onChange }: { form: DetailsForm; onChange: (f: DetailsForm) => void }) {
  const [iconUploading, setIconUploading] = useState(false);
  const [iconError, setIconError] = useState<string | null>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Wrap the current description selection in **…** (markdown bold). The storefront renders it bold.
  const wrapDescriptionBold = () => {
    const el = descRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    if (s === e) return; // nothing selected → no-op
    const next = value.slice(0, s) + "**" + value.slice(s, e) + "**" + value.slice(e);
    onChange({ ...form, description: next });
    // Re-select the same text (now shifted by the leading "**") after the value updates.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + 2, e + 2);
    });
  };

  // Parsed once per render so we can preview the video link as the admin types/pastes it.
  const videoId = youtubeId(form.videoUrl);

  const uploadIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconUploading(true); setIconError(null);
    try {
      const url = await adminService.uploadFile(file, { contentType: file.type, slug: form.slug, kind: "icon" });
      onChange({ ...form, iconUrl: url });
    } catch (err) {
      setIconError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIconUploading(false);
      if (iconRef.current) iconRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div>
        <label className="text-sm font-semibold">Plugin Icon</label>
        <div className="mt-1.5 flex items-center gap-4">
          {form.iconUrl ? (
            <img src={form.iconUrl} alt="Plugin icon" className="w-16 h-16 rounded-xl object-cover border border-border shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl border border-dashed border-border bg-muted flex items-center justify-center shrink-0">
              <Image className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input ref={iconRef} type="file" accept="image/*" onChange={uploadIcon} className="hidden" />
            <button
              onClick={() => iconRef.current?.click()}
              disabled={iconUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-soft border border-primary/30 text-primary font-semibold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-60"
            >
              {iconUploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />{form.iconUrl ? "Replace Icon" : "Upload Icon"}</>}
            </button>
            {form.iconUrl && (
              <button onClick={() => onChange({ ...form, iconUrl: null })} className="text-xs text-destructive hover:underline text-left">Remove icon</button>
            )}
          </div>
        </div>
        {iconError && <p className="mt-1 text-xs text-destructive">{iconError}</p>}
      </div>

      <div>
        <label className="text-sm font-semibold">Plugin Name <span className="text-destructive">*</span></label>
        <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <label className="text-sm font-semibold">Slug <span className="text-destructive">*</span></label>
        <input value={form.slug} onChange={(e) => onChange({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:border-primary" />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Keep the slug the same as the plugin&apos;s zip file ID, so the plugin and its uploaded file are easy to match.
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Description</label>
          <button
            type="button"
            onClick={wrapDescriptionBold}
            title="Select some text, then click to make it bold"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Bold className="w-3.5 h-3.5" /> Bold
          </button>
        </div>
        <textarea
          ref={descRef}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          rows={8}
          className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-y"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Tip: select text and click <strong>Bold</strong> (or wrap it in **double asterisks**). Line breaks are kept.
        </p>
        {form.description.trim() && (
          <div className="mt-2 rounded-xl border border-border bg-muted/30 p-3">
            <p className="mb-1 text-[11px] font-semibold text-muted-foreground">Preview</p>
            <div className="text-sm text-foreground/90">{renderRichText(form.description)}</div>
          </div>
        )}
      </div>
      <div>
        <label className="text-sm font-semibold">YouTube video URL</label>
        <input value={form.videoUrl} onChange={(e) => onChange({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
        <p className="mt-1.5 text-xs text-muted-foreground">Optional. Shown as an embedded video on the plugin page (paste a normal YouTube link).</p>

        {/* Live preview so the admin can confirm the link resolves to the right video. */}
        {videoId ? (
          <a
            href={form.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 block w-full max-w-xs"
            title="Open video in a new tab"
          >
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Preview</p>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt="Video thumbnail"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white transition-colors group-hover:bg-primary">
                  <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
                </span>
              </span>
            </div>
          </a>
        ) : form.videoUrl.trim() ? (
          <p className="mt-2 text-xs font-medium text-amber-600">
            That doesn&apos;t look like a valid YouTube link — preview unavailable.
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-semibold">Version</label>
        <input value={form.version} onChange={(e) => onChange({ ...form, version: e.target.value })} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:border-primary" />
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => onChange({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary" />
        <span className="text-sm font-medium">Active (visible on store)</span>
      </label>

      {/* Visibility: public (default) or private (specific users only) */}
      <div className="pt-2 border-t border-border">
        <label className="text-sm font-semibold">Visibility</label>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...form, isPublic: true })}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              form.isPublic ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...form, isPublic: false })}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              !form.isPublic ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Private
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {form.isPublic
            ? "Anyone can find and view this plugin."
            : "Only the users you list below can see and buy this plugin (and all its plans)."}
        </p>

        {!form.isPublic && (
          <div className="mt-3">
            <label className="text-sm font-semibold">Allowed users</label>
            <div className="mt-1.5">
              <EmailPicker
                value={form.allowedEmails}
                onChange={(emails) => onChange({ ...form, allowedEmails: emails })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

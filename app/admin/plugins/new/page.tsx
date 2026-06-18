"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useCreatePlugin } from "@/lib/hooks/admin.hooks";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewPluginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", slug: "", description: "", version: "1.0.0", isActive: false, slugEdited: false });
  const [error, setError] = useState<string | null>(null);
  const createPlugin = useCreatePlugin();

  const handleName = (name: string) =>
    setForm((p) => ({ ...p, name, slug: p.slugEdited ? p.slug : toSlug(name) }));

  const handleSlug = (slug: string) =>
    setForm((p) => ({ ...p, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""), slugEdited: true }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setError(null);
    createPlugin.mutate(
      {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        version: form.version.trim() || "1.0.0",
        isActive: form.isActive,
      },
      {
        onSuccess: (plugin) => router.push(`/admin/plugins/${plugin.id}`),
        onError: (err: any) => setError(err?.response?.data?.message || "Failed to create plugin"),
      },
    );
  };

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/admin/plugins" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" />
        All Plugins
      </Link>

      <h1 className="font-display text-2xl font-bold mb-1">Add New Plugin</h1>
      <p className="text-sm text-muted-foreground mb-8">Create a plugin entry. Add plans, features, and files from the plugin edit page.</p>

      <div className="card-surface p-6 flex flex-col gap-5">
        <div>
          <label className="text-sm font-semibold">Plugin Name <span className="text-destructive">*</span></label>
          <input
            value={form.name}
            onChange={(e) => handleName(e.target.value)}
            placeholder="e.g. WC Smart Checkout"
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">
            Slug <span className="text-destructive">*</span>
            <span className="ml-2 text-xs font-normal text-muted-foreground">auto-generated · edit to override</span>
          </label>
          <div className="mt-1.5 flex items-center">
            <span className="px-3 py-2.5 text-sm text-muted-foreground border border-border border-r-0 rounded-l-xl bg-muted">threegems.com/plugins/</span>
            <input
              value={form.slug}
              onChange={(e) => handleSlug(e.target.value)}
              placeholder="wc-smart-checkout"
              className="flex-1 px-4 py-2.5 rounded-r-xl border border-border bg-surface text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Short description of what this plugin does..."
            rows={4}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Initial Version</label>
          <input
            value={form.version}
            onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))}
            placeholder="1.0.0"
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-medium">Publish immediately (set as active)</span>
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.slug.trim() || createPlugin.isPending}
            className="btn-ruby px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createPlugin.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Plugin
          </button>
          <Link href="/admin/plugins" className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

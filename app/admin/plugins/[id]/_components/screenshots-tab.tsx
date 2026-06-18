"use client";

import { useRef, useState } from "react";
import { Trash2, Pencil, Check, Loader2, ArrowUp, ArrowDown, Image } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "@/lib/services/admin.service";
import type { AdminPlugin, Screenshot } from "@/lib/types/admin";

export function ScreenshotsTab({ plugin, pluginId }: { plugin: AdminPlugin; pluginId: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-plugin", pluginId] });

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const updateScreenshot = useMutation({
    mutationFn: ({ screenshotId, data }: { screenshotId: string; data: { caption?: string; sortOrder?: number } }) => adminService.updateScreenshot(screenshotId, data),
    onSuccess: () => { invalidate(); setEditId(null); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to update"),
  });

  const deleteScreenshot = useMutation({
    mutationFn: adminService.deleteScreenshot,
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to delete"),
  });

  const sorted = [...plugin.screenshots].sort((a, b) => a.sortOrder - b.sortOrder);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setApiError(null);
    try {
      const url = await adminService.uploadFile(file, { contentType: file.type, slug: plugin.slug, kind: "screenshot" });
      const nextOrder = (sorted[sorted.length - 1]?.sortOrder ?? -1) + 1;
      await adminService.addScreenshot(pluginId, { r2FilePath: url, caption: file.name.replace(/\.[^.]+$/, ""), sortOrder: nextOrder });
      invalidate();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleMove = async (screenshot: Screenshot, dir: -1 | 1) => {
    const idx = sorted.findIndex((s) => s.id === screenshot.id);
    const neighbor = sorted[idx + dir];
    if (!neighbor) return;
    setMoving(true);
    try {
      await Promise.all([
        adminService.updateScreenshot(screenshot.id, { sortOrder: neighbor.sortOrder }),
        adminService.updateScreenshot(neighbor.id, { sortOrder: screenshot.sortOrder }),
      ]);
      invalidate();
    } catch {
      setApiError("Failed to reorder");
    } finally {
      setMoving(false);
    }
  };

  const busy = updateScreenshot.isPending || deleteScreenshot.isPending || uploading || moving;

  return (
    <div>
      {apiError && <p className="mb-3 text-xs text-destructive">{apiError}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
      <button onClick={() => fileRef.current?.click()} disabled={busy} className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-soft border border-primary/30 text-primary font-semibold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-60">
        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Image className="w-4 h-4" />Upload Screenshot</>}
      </button>

      {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No screenshots yet.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sorted.map((s, i) => (
          <div key={s.id} className="group relative rounded-xl border border-border overflow-hidden bg-surface">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <img src={s.r2FilePath} alt={s.caption ?? ""} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            {editId === s.id ? (
              <div className="p-2 flex gap-1">
                <input autoFocus value={caption} onChange={(e) => setCaption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") updateScreenshot.mutate({ screenshotId: s.id, data: { caption } });
                    if (e.key === "Escape") setEditId(null);
                  }}
                  className="flex-1 px-2 py-1 rounded-lg border border-primary text-xs focus:outline-none" />
                <button onClick={() => updateScreenshot.mutate({ screenshotId: s.id, data: { caption } })} className="p-1 text-primary"><Check className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="p-2.5 flex items-center justify-between gap-1">
                <p className="text-xs text-muted-foreground truncate">{s.caption || "No caption"}</p>
                <div className="flex gap-0.5 shrink-0">
                  <button onClick={() => handleMove(s, -1)} disabled={i === 0 || busy} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => handleMove(s, 1)} disabled={i === sorted.length - 1 || busy} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                  <button onClick={() => { setEditId(s.id); setCaption(s.caption ?? ""); }} disabled={busy} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => deleteScreenshot.mutate(s.id)} disabled={busy} className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-50"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

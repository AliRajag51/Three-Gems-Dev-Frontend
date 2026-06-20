"use client";

import { useRef, useState } from "react";
import { Trash2, Pencil, Check, Loader2, ArrowUp, ArrowDown, UploadCloud, GripVertical } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "@/lib/services/admin.service";
import type { AdminPlugin, Screenshot } from "@/lib/types/admin";

export function ScreenshotsTab({ plugin, pluginId }: { plugin: AdminPlugin; pluginId: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-plugin", pluginId] });

  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [moving, setMoving] = useState(false);
  const [dragOver, setDragOver] = useState(false);   // file drop zone highlight
  const [dragId, setDragId] = useState<string | null>(null);   // screenshot being reordered
  const [overId, setOverId] = useState<string | null>(null);   // reorder drop target
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
  const uploading = progress !== null;
  const busy = updateScreenshot.isPending || deleteScreenshot.isPending || uploading || moving;

  // ── Upload (multiple, via click OR drag-and-drop) ──────────────────────────────
  const uploadFiles = async (fileList: File[]) => {
    const images = fileList.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      if (fileList.length > 0) setApiError("Only image files can be uploaded.");
      return;
    }
    setApiError(null);
    setProgress({ done: 0, total: images.length });
    // New screenshots go after the current last one; keep batch order via base + index.
    const base = (sorted[sorted.length - 1]?.sortOrder ?? -1) + 1;
    try {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const url = await adminService.uploadFile(file, { contentType: file.type, slug: plugin.slug, kind: "screenshot" });
        await adminService.addScreenshot(pluginId, {
          r2FilePath: url,
          caption: file.name.replace(/\.[^.]+$/, ""),
          sortOrder: base + i,
        });
        setProgress({ done: i + 1, total: images.length });
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      invalidate();
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => uploadFiles(Array.from(e.target.files ?? []));

  const onZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files ?? []));
  };

  // ── Reorder by arrows ──────────────────────────────────────────────────────────
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

  // ── Reorder by dragging a card onto another ────────────────────────────────────
  const handleReorderDrop = async (targetId: string) => {
    const fromId = dragId;
    setDragId(null);
    setOverId(null);
    if (!fromId || fromId === targetId) return;

    const from = sorted.findIndex((s) => s.id === fromId);
    const to = sorted.findIndex((s) => s.id === targetId);
    if (from === -1 || to === -1) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    // Persist only the cards whose position (index) actually changed → sortOrder = index.
    const changed = reordered
      .map((s, idx) => ({ s, idx }))
      .filter(({ s, idx }) => s.sortOrder !== idx);
    if (changed.length === 0) return;

    setMoving(true);
    try {
      await Promise.all(changed.map(({ s, idx }) => adminService.updateScreenshot(s.id, { sortOrder: idx })));
      invalidate();
    } catch {
      setApiError("Failed to reorder");
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      {apiError && <p className="mb-3 text-xs text-destructive">{apiError}</p>}

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={onInputChange} className="hidden" />

      {/* Drop zone — click to browse, or drag & drop one or many images */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!busy) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onZoneDrop}
        disabled={busy}
        className={`mb-6 w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors disabled:opacity-60 ${
          dragOver ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50 hover:bg-muted/40"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm font-semibold text-primary">Uploading {progress?.done}/{progress?.total}…</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold">Drag &amp; drop images here, or click to browse</span>
            <span className="text-xs text-muted-foreground">You can select multiple at once. Drag a tile below to reorder — the first is shown on top.</span>
          </>
        )}
      </button>

      {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No screenshots yet.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sorted.map((s, i) => (
          <div
            key={s.id}
            draggable={!busy && editId !== s.id}
            onDragStart={() => setDragId(s.id)}
            onDragEnd={() => { setDragId(null); setOverId(null); }}
            onDragOver={(e) => { if (dragId && dragId !== s.id) { e.preventDefault(); setOverId(s.id); } }}
            onDragLeave={() => setOverId((cur) => (cur === s.id ? null : cur))}
            onDrop={(e) => { e.preventDefault(); handleReorderDrop(s.id); }}
            className={`group relative rounded-xl border overflow-hidden bg-surface transition-all ${
              overId === s.id ? "border-primary ring-2 ring-primary/40" : "border-border"
            } ${dragId === s.id ? "opacity-50" : ""}`}
          >
            {/* Position badge + drag handle */}
            <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              <GripVertical className="w-3 h-3 cursor-grab" />
              {i + 1}
            </div>

            <div className="aspect-video bg-muted flex items-center justify-center">
              <img src={s.r2FilePath} alt={s.caption ?? ""} className="w-full h-full object-cover pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
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
                  <button onClick={() => handleMove(s, -1)} disabled={i === 0 || busy} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move up"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => handleMove(s, 1)} disabled={i === sorted.length - 1 || busy} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move down"><ArrowDown className="w-3 h-3" /></button>
                  <button onClick={() => { setEditId(s.id); setCaption(s.caption ?? ""); }} disabled={busy} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50" title="Edit caption"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => deleteScreenshot.mutate(s.id)} disabled={busy} className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-50" title="Delete"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

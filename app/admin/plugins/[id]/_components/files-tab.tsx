"use client";

import { useRef, useState } from "react";
import { FileArchive, Trash2, Upload, Loader2, ExternalLink } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "@/lib/services/admin.service";
import type { AdminPlugin } from "@/lib/types/admin";

export function FilesTab({ plugin, pluginId }: { plugin: AdminPlugin; pluginId: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-plugin", pluginId] });

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [version, setVersion] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const setLatest = useMutation({
    mutationFn: (fileId: string) => adminService.updateFile(fileId, { isLatest: true }),
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to update"),
  });

  const deleteFile = useMutation({
    mutationFn: adminService.deleteFile,
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to delete"),
  });

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !version.trim()) { setApiError("Enter a version number first"); return; }
    const isZip = file.name.toLowerCase().endsWith(".zip") ||
      ["application/zip", "application/x-zip-compressed"].includes(file.type);
    if (!isZip) {
      setApiError("Only .zip files are allowed");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true); setApiError(null);
    try {
      const url = await adminService.uploadFile(file, { contentType: "application/zip", slug: plugin.slug, kind: "file", version: version.trim() });
      await adminService.addFile(pluginId, { r2FilePath: url, version: version.trim(), fileSize: file.size, isLatest: true });
      invalidate();
      setVersion("");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const sorted = [...plugin.files].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const busy = setLatest.isPending || deleteFile.isPending || uploading;

  return (
    <div className="max-w-2xl">
      <div className="card-surface p-5 mb-6">
        <p className="text-sm font-semibold mb-3">Upload New Release</p>
        <div className="flex gap-3 mb-3">
          <div className="flex-1 max-w-[160px]">
            <label className="text-xs text-muted-foreground">Version</label>
            <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2.5.0" className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:border-primary" />
          </div>
          <div className="flex-1 flex items-end">
            <input ref={fileRef} type="file" accept=".zip,application/zip,application/x-zip-compressed" onChange={upload} className="hidden" />
            <button
              onClick={() => { if (!version.trim()) { setApiError("Enter a version number first"); return; } fileRef.current?.click(); }}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-soft border border-primary/30 text-primary font-semibold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-60"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />Choose .zip</>}
            </button>
          </div>
        </div>
        {apiError && <p className="text-xs text-destructive">{apiError}</p>}
      </div>

      {sorted.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No files uploaded yet.</p>}

      <div className="flex flex-col gap-3">
        {sorted.map((file) => (
          <div key={file.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface">
            <FileArchive className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold font-mono">v{file.version}</span>
                {file.isLatest && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Latest</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(file.createdAt).toLocaleDateString()} · {file.fileSize ? `${(Number(file.fileSize) / 1024).toFixed(0)} KB` : "—"}
              </p>
            </div>
            <a href={file.r2FilePath} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Download"><ExternalLink className="w-4 h-4" /></a>
            {!file.isLatest && (
              <button onClick={() => setLatest.mutate(file.id)} disabled={busy} className="text-xs text-primary hover:underline whitespace-nowrap disabled:opacity-50">Set latest</button>
            )}
            <button onClick={() => deleteFile.mutate(file.id)} disabled={busy} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

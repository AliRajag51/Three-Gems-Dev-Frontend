"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "@/lib/services/admin.service";
import type { AdminPlugin, Feature } from "@/lib/types/admin";

export function FeaturesTab({ plugin, pluginId }: { plugin: AdminPlugin; pluginId: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-plugin", pluginId] });

  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [moving, setMoving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const addFeature = useMutation({
    mutationFn: ({ text, sortOrder }: { text: string; sortOrder: number }) => adminService.addFeature(pluginId, { text, sortOrder }),
    onSuccess: () => { invalidate(); setNewText(""); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to add feature"),
  });

  const updateFeature = useMutation({
    mutationFn: ({ featureId, data }: { featureId: string; data: { text?: string; sortOrder?: number } }) => adminService.updateFeature(featureId, data),
    onSuccess: () => { invalidate(); setEditId(null); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to update feature"),
  });

  const deleteFeature = useMutation({
    mutationFn: adminService.deleteFeature,
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to delete feature"),
  });

  const handleAdd = () => {
    if (!newText.trim()) return;
    const sorted = [...plugin.features].sort((a, b) => a.sortOrder - b.sortOrder);
    const nextOrder = (sorted[sorted.length - 1]?.sortOrder ?? -1) + 1;
    addFeature.mutate({ text: newText.trim(), sortOrder: nextOrder });
  };

  const handleMove = async (feature: Feature, dir: -1 | 1) => {
    const sorted = [...plugin.features].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((f) => f.id === feature.id);
    const neighbor = sorted[idx + dir];
    if (!neighbor) return;
    setMoving(true);
    try {
      await Promise.all([
        adminService.updateFeature(feature.id, { sortOrder: neighbor.sortOrder }),
        adminService.updateFeature(neighbor.id, { sortOrder: feature.sortOrder }),
      ]);
      invalidate();
    } catch {
      setApiError("Failed to reorder");
    } finally {
      setMoving(false);
    }
  };

  const sorted = [...plugin.features].sort((a, b) => a.sortOrder - b.sortOrder);
  const busy = addFeature.isPending || updateFeature.isPending || deleteFeature.isPending || moving;

  return (
    <div className="max-w-xl">
      {apiError && <p className="mb-3 text-xs text-destructive">{apiError}</p>}
      <div className="flex gap-2 mb-5">
        <input value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="e.g. Rule-based automated payouts" className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
        <button onClick={handleAdd} disabled={!newText.trim() || busy} className="btn-ruby px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
          {addFeature.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Add
        </button>
      </div>

      {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No features yet. Add bullet points above.</p>}

      <div className="flex flex-col gap-2">
        {sorted.map((feature, i) => (
          <div key={feature.id} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface group">
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => handleMove(feature, -1)} disabled={i === 0 || busy} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
              <button onClick={() => handleMove(feature, 1)} disabled={i === sorted.length - 1 || busy} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
            </div>
            <Check className="w-4 h-4 text-primary shrink-0" />
            {editId === feature.id ? (
              <input autoFocus value={editText} onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateFeature.mutate({ featureId: feature.id, data: { text: editText.trim() || feature.text } });
                  if (e.key === "Escape") setEditId(null);
                }}
                className="flex-1 px-2 py-1 rounded-lg border border-primary bg-background text-sm focus:outline-none" />
            ) : (
              <span className="flex-1 text-sm">{feature.text}</span>
            )}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => { setEditId(feature.id); setEditText(feature.text); }} disabled={busy} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteFeature.mutate(feature.id)} disabled={busy} className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "@/lib/services/admin.service";
import type { AdminPlugin } from "@/lib/types/admin";

export function CompatibilityTab({ plugin, pluginId }: { plugin: AdminPlugin; pluginId: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-plugin", pluginId] });

  const [addForm, setAddForm] = useState<{ software: string; versionInfo: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ software: "", versionInfo: "" });
  const [apiError, setApiError] = useState<string | null>(null);

  const addCompat = useMutation({
    mutationFn: (d: { software: string; versionInfo: string }) => adminService.addCompatibility(pluginId, { software: d.software.trim(), versionInfo: d.versionInfo.trim(), sortOrder: plugin.compatibility.length }),
    onSuccess: () => { invalidate(); setAddForm(null); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to add"),
  });

  const updateCompat = useMutation({
    mutationFn: ({ compatId, data }: { compatId: string; data: { software: string; versionInfo: string } }) => adminService.updateCompatibility(compatId, data),
    onSuccess: () => { invalidate(); setEditId(null); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to update"),
  });

  const deleteCompat = useMutation({
    mutationFn: adminService.deleteCompatibility,
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to delete"),
  });

  const sorted = [...plugin.compatibility].sort((a, b) => a.sortOrder - b.sortOrder);
  const inp = "px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary";
  const busy = addCompat.isPending || updateCompat.isPending || deleteCompat.isPending;

  return (
    <div className="max-w-lg">
      {apiError && <p className="mb-3 text-xs text-destructive">{apiError}</p>}
      {!addForm && (
        <button onClick={() => { setAddForm({ software: "", versionInfo: "" }); setApiError(null); }} className="mb-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary-soft transition-colors">
          <Plus className="w-3.5 h-3.5" />Add Row
        </button>
      )}

      {addForm && (
        <div className="mb-5 p-4 rounded-xl border border-primary/20 bg-primary-soft/20 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Software</label><input value={addForm.software} onChange={(e) => setAddForm({ ...addForm, software: e.target.value })} placeholder="WordPress" className={`mt-1 w-full ${inp}`} /></div>
            <div><label className="text-xs text-muted-foreground">Version Info</label><input value={addForm.versionInfo} onChange={(e) => setAddForm({ ...addForm, versionInfo: e.target.value })} placeholder="6.0 – latest" className={`mt-1 w-full ${inp}`} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => addCompat.mutate(addForm)} disabled={!addForm.software.trim() || busy} className="btn-ruby px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5">
              {addCompat.isPending && <Loader2 className="w-3 h-3 animate-spin" />}Add
            </button>
            <button onClick={() => setAddForm(null)} className="px-4 py-1.5 rounded-lg text-xs border border-border hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !addForm && <p className="text-sm text-muted-foreground py-8 text-center">No compatibility info yet.</p>}

      {sorted.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          {sorted.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${i < sorted.length - 1 ? "border-b border-border" : ""} hover:bg-muted/20 group`}>
              {editId === c.id ? (
                <>
                  <input value={editForm.software} onChange={(e) => setEditForm({ ...editForm, software: e.target.value })} className={`flex-1 ${inp}`} />
                  <input value={editForm.versionInfo} onChange={(e) => setEditForm({ ...editForm, versionInfo: e.target.value })} className={`flex-1 ${inp}`} />
                  <button onClick={() => updateCompat.mutate({ compatId: c.id, data: editForm })} disabled={busy} className="btn-ruby px-2.5 py-1 rounded-md text-xs font-semibold disabled:opacity-50 flex items-center gap-1">
                    {updateCompat.isPending && <Loader2 className="w-3 h-3 animate-spin" />}Save
                  </button>
                  <button onClick={() => setEditId(null)} className="px-2.5 py-1 rounded-md text-xs border border-border hover:bg-muted">✕</button>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold w-32 shrink-0">{c.software}</span>
                  <span className="flex-1 text-sm text-muted-foreground">{c.versionInfo}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                    <button onClick={() => { setEditId(c.id); setEditForm({ software: c.software, versionInfo: c.versionInfo }); setApiError(null); }} disabled={busy} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteCompat.mutate(c.id)} disabled={busy} className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

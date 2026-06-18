"use client";

import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "@/lib/services/admin.service";
import type { AdminPlugin } from "@/lib/types/admin";

export function ChangelogTab({ plugin, pluginId }: { plugin: AdminPlugin; pluginId: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-plugin", pluginId] });

  const [addVersion, setAddVersion] = useState(false);
  const [vForm, setVForm] = useState({ version: "", releaseDate: "" });
  const [newNote, setNewNote] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const addChangelog = useMutation({
    mutationFn: (d: { version: string; releaseDate: string }) => adminService.addChangelog(pluginId, d),
    onSuccess: () => { invalidate(); setVForm({ version: "", releaseDate: "" }); setAddVersion(false); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to add"),
  });

  const deleteChangelog = useMutation({
    mutationFn: adminService.deleteChangelog,
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to delete"),
  });

  const addItem = useMutation({
    mutationFn: ({ changelogId, note, sortOrder }: { changelogId: string; note: string; sortOrder: number }) =>
      adminService.addChangelogItem(changelogId, { note, sortOrder }),
    onSuccess: (_, vars) => { invalidate(); setNewNote((p) => ({ ...p, [vars.changelogId]: "" })); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to add item"),
  });

  const deleteItem = useMutation({
    mutationFn: adminService.deleteChangelogItem,
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to delete item"),
  });

  const sorted = [...plugin.changelogs].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  return (
    <div className="max-w-2xl">
      {apiError && <p className="mb-3 text-xs text-destructive">{apiError}</p>}
      {!addVersion && (
        <button onClick={() => { setAddVersion(true); setApiError(null); }} className="mb-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary-soft transition-colors">
          <Plus className="w-3.5 h-3.5" />New Release
        </button>
      )}

      {addVersion && (
        <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary-soft/20">
          <p className="text-sm font-semibold mb-3">New Release</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-muted-foreground">Version</label><input value={vForm.version} onChange={(e) => setVForm({ ...vForm, version: e.target.value })} placeholder="2.5.0" className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:border-primary" /></div>
            <div><label className="text-xs text-muted-foreground">Release Date</label><input type="date" value={vForm.releaseDate} onChange={(e) => setVForm({ ...vForm, releaseDate: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => addChangelog.mutate(vForm)} disabled={!vForm.version.trim() || !vForm.releaseDate || addChangelog.isPending} className="btn-ruby px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5">
              {addChangelog.isPending && <Loader2 className="w-3 h-3 animate-spin" />}Create
            </button>
            <button onClick={() => setAddVersion(false)} className="px-4 py-1.5 rounded-lg text-xs border border-border hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !addVersion && <p className="text-sm text-muted-foreground py-8 text-center">No changelog entries yet.</p>}

      <div className="flex flex-col gap-4">
        {sorted.map((cl) => (
          <div key={cl.id} className="card-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-display text-base font-bold">v{cl.version}</span>
                <span className="ml-3 text-xs text-muted-foreground">{new Date(cl.releaseDate).toLocaleDateString()}</span>
              </div>
              <button onClick={() => deleteChangelog.mutate(cl.id)} disabled={deleteChangelog.isPending} className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-col gap-1.5 mb-3">
              {[...cl.items].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm group">
                  <span className="text-primary">•</span>
                  <span className="flex-1">{item.note}</span>
                  <button onClick={() => deleteItem.mutate(item.id)} disabled={deleteItem.isPending} className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 disabled:opacity-50"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newNote[cl.id] ?? ""}
                onChange={(e) => setNewNote((p) => ({ ...p, [cl.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const note = newNote[cl.id]?.trim();
                    if (note) addItem.mutate({ changelogId: cl.id, note, sortOrder: cl.items.length });
                  }
                }}
                placeholder="Add changelog bullet…"
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  const note = newNote[cl.id]?.trim();
                  if (note) addItem.mutate({ changelogId: cl.id, note, sortOrder: cl.items.length });
                }}
                disabled={addItem.isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary-soft transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

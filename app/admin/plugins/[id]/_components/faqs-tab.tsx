"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "@/lib/services/admin.service";
import type { AdminPlugin } from "@/lib/types/admin";

export function FaqsTab({ plugin, pluginId }: { plugin: AdminPlugin; pluginId: string }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-plugin", pluginId] });

  const [addForm, setAddForm] = useState<{ question: string; answer: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [apiError, setApiError] = useState<string | null>(null);

  const addFaq = useMutation({
    mutationFn: (d: { question: string; answer: string }) => adminService.addFaq(pluginId, { question: d.question.trim(), answer: d.answer.trim(), sortOrder: plugin.faqs.length }),
    onSuccess: () => { invalidate(); setAddForm(null); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to add FAQ"),
  });

  const updateFaq = useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: { question: string; answer: string } }) => adminService.updateFaq(faqId, data),
    onSuccess: () => { invalidate(); setEditId(null); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to update FAQ"),
  });

  const deleteFaq = useMutation({
    mutationFn: adminService.deleteFaq,
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to delete FAQ"),
  });

  const sorted = [...plugin.faqs].sort((a, b) => a.sortOrder - b.sortOrder);
  const ta = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none";
  const busy = addFaq.isPending || updateFaq.isPending || deleteFaq.isPending;

  return (
    <div className="max-w-2xl">
      {apiError && <p className="mb-3 text-xs text-destructive">{apiError}</p>}
      {!addForm && (
        <button onClick={() => { setAddForm({ question: "", answer: "" }); setApiError(null); }} className="mb-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary-soft transition-colors">
          <Plus className="w-3.5 h-3.5" />Add FAQ
        </button>
      )}

      {addForm && (
        <div className="mb-5 p-4 rounded-xl border border-primary/20 bg-primary-soft/20 flex flex-col gap-3">
          <div><label className="text-xs text-muted-foreground">Question</label><input value={addForm.question} onChange={(e) => setAddForm({ ...addForm, question: e.target.value })} placeholder="Does this work with…?" className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary" /></div>
          <div><label className="text-xs text-muted-foreground">Answer</label><textarea value={addForm.answer} onChange={(e) => setAddForm({ ...addForm, answer: e.target.value })} rows={3} className={`mt-1 ${ta}`} /></div>
          <div className="flex gap-2">
            <button onClick={() => addFaq.mutate(addForm)} disabled={!addForm.question.trim() || busy} className="btn-ruby px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5">
              {addFaq.isPending && <Loader2 className="w-3 h-3 animate-spin" />}Add
            </button>
            <button onClick={() => setAddForm(null)} className="px-4 py-1.5 rounded-lg text-xs border border-border hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !addForm && <p className="text-sm text-muted-foreground py-8 text-center">No FAQs yet.</p>}

      <div className="flex flex-col gap-3">
        {sorted.map((faq) => (
          <div key={faq.id} className="card-surface p-5">
            {editId === faq.id ? (
              <div className="flex flex-col gap-3">
                <input value={editForm.question} onChange={(e) => setEditForm({ ...editForm, question: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary" />
                <textarea value={editForm.answer} onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })} rows={3} className={ta} />
                <div className="flex gap-2">
                  <button onClick={() => updateFaq.mutate({ faqId: faq.id, data: editForm })} disabled={busy} className="btn-ruby px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5">
                    {updateFaq.isPending && <Loader2 className="w-3 h-3 animate-spin" />}Save
                  </button>
                  <button onClick={() => setEditId(null)} className="px-4 py-1.5 rounded-lg text-xs border border-border hover:bg-muted">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">{faq.question}</p>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditId(faq.id); setEditForm({ question: faq.question, answer: faq.answer }); setApiError(null); }} disabled={busy} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteFaq.mutate(faq.id)} disabled={busy} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

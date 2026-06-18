"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Package, Loader2 } from "lucide-react";
import { useAdminPlugins, useDeletePlugin, useTogglePluginStatus } from "@/lib/hooks/admin.hooks";
import type { AdminPluginListItem } from "@/lib/types/admin";

export default function PluginsListPage() {
  const [q, setQ] = useState("");
  const { data: plugins = [], isLoading, error } = useAdminPlugins();
  const deleteMutation = useDeletePlugin();
  const toggleMutation = useTogglePluginStatus();

  const filtered = plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.slug.toLowerCase().includes(q.toLowerCase()),
  );

  const handleToggle = (plugin: AdminPluginListItem) => {
    toggleMutation.mutate({ id: plugin.id, isActive: !plugin.isActive });
  };

  const handleDelete = (plugin: AdminPluginListItem) => {
    if (confirm(`Delete "${plugin.name}"? This cannot be undone.`))
      deleteMutation.mutate(plugin.id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Plugins</h1>
          <p className="text-sm text-muted-foreground mt-1">{plugins.length} plugins total</p>
        </div>
        <Link href="/admin/plugins/new" className="btn-ruby flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0">
          <Plus className="w-4 h-4" />
          Add New Plugin
        </Link>
      </div>

      <div className="relative mb-5 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search plugins..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="card-surface p-8 text-center text-sm text-destructive">
          Failed to load plugins. Please refresh the page.
        </div>
      )}

      {/* Mobile card list */}
      {!isLoading && !error && (
        <div className="sm:hidden space-y-3">
          {filtered.length === 0 && (
            <div className="card-surface p-10 text-center text-sm text-muted-foreground">
              {q ? "No plugins match your search." : "No plugins yet. Add your first one!"}
            </div>
          )}
          {filtered.map((plugin) => (
            <div key={plugin.id} className="card-surface p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-soft grid place-items-center shrink-0 overflow-hidden">
                  {plugin.iconUrl ? (
                    <img src={plugin.iconUrl} alt={plugin.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/plugins/${plugin.id}`} className="font-semibold truncate hover:text-primary transition-colors">
                      {plugin.name}
                    </Link>
                    <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${plugin.isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {plugin.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {plugin.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{plugin.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{plugin.slug}</span>
                    <span>v{plugin.version}</span>
                    <span>· {plugin.planCount} {plugin.planCount === 1 ? "plan" : "plans"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-end gap-1">
                <button
                  onClick={() => handleToggle(plugin)}
                  disabled={toggleMutation.isPending}
                  title="Toggle active"
                  className="text-primary p-1.5 disabled:opacity-50"
                >
                  {plugin.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </button>
                <Link href={`/admin/plugins/${plugin.id}`} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Edit">
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(plugin)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop table */}
      {!isLoading && !error && (
        <div className="card-surface overflow-hidden hidden sm:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Plugin</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Slug</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Version</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Plans</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                      {q ? "No plugins match your search." : "No plugins yet. Add your first one!"}
                    </td>
                  </tr>
                )}
                {filtered.map((plugin, i) => (
                  <tr
                    key={plugin.id}
                    className={`${i !== filtered.length - 1 ? "border-b border-border" : ""} hover:bg-muted/20 transition-colors`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-soft grid place-items-center shrink-0 overflow-hidden">
                          {plugin.iconUrl ? (
                            <img src={plugin.iconUrl} alt={plugin.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/plugins/${plugin.id}`} className="font-semibold hover:text-primary transition-colors">
                            {plugin.name}
                          </Link>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{plugin.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md">{plugin.slug}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">v{plugin.version}</td>
                    <td className="px-5 py-4 text-muted-foreground">{plugin.planCount}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plugin.isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                        {plugin.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggle(plugin)}
                          disabled={toggleMutation.isPending}
                          title="Toggle active"
                          className="text-primary hover:text-primary-deep transition-colors p-1 disabled:opacity-50"
                        >
                          {plugin.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                        </button>
                        <Link href={`/admin/plugins/${plugin.id}`} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(plugin)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

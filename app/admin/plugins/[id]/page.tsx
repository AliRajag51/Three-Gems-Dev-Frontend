"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminPlugin } from "@/lib/hooks/admin.hooks";
import * as adminService from "@/lib/services/admin.service";
import { DetailsTab, type DetailsForm } from "./_components/details-tab";
import { PlansTab } from "./_components/plans-tab";
import { FeaturesTab } from "./_components/features-tab";
import { ScreenshotsTab } from "./_components/screenshots-tab";
import { CompatibilityTab } from "./_components/compatibility-tab";
import { ChangelogTab } from "./_components/changelog-tab";
import { FaqsTab } from "./_components/faqs-tab";
import { FilesTab } from "./_components/files-tab";

const TABS = ["Details", "Plans", "Features", "Screenshots", "Compatibility", "Changelog", "FAQs", "Files"] as const;
type Tab = typeof TABS[number];

export default function PluginDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();

  const { data: plugin, isLoading, error } = useAdminPlugin(id);

  const [activeTab, setActiveTab] = useState<Tab>("Details");
  const [detailsForm, setDetailsForm] = useState<DetailsForm | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (plugin && !detailsForm) {
      setDetailsForm({
        name: plugin.name,
        slug: plugin.slug,
        description: plugin.description || "",
        videoUrl: plugin.videoUrl ?? "",
        version: plugin.version,
        isActive: plugin.isActive,
        iconUrl: plugin.iconUrl,
        isPublic: plugin.isPublic ?? true,
        allowedEmails: plugin.allowedEmails ?? [],
      });
    }
  }, [plugin]);

  const saveDetails = useMutation({
    mutationFn: () => adminService.updatePlugin(id, detailsForm!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plugin", id] });
      qc.invalidateQueries({ queryKey: ["admin-plugins"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err: any) => {
      setSaveError(err?.response?.data?.message || "Save failed");
      setTimeout(() => setSaveError(null), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !plugin) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Plugin not found or failed to load.{" "}
        <Link href="/admin/plugins" className="underline">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/admin/plugins" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Plugins</span>
          </Link>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <h1 className="font-display text-base font-bold truncate">{plugin.name}</h1>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${plugin.isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
            {plugin.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {saveError && <p className="text-xs text-destructive">{saveError}</p>}
          {activeTab === "Details" && detailsForm && (
            <button
              onClick={() => saveDetails.mutate()}
              disabled={saveDetails.isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-all disabled:opacity-60 ${saved ? "bg-green-500 text-white" : "btn-ruby"}`}
            >
              {saveDetails.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : saved ? <><Check className="w-4 h-4" />Saved</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-4 sm:px-8">
        <div className="flex gap-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 sm:px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {activeTab === "Details" && detailsForm && <DetailsTab form={detailsForm} onChange={setDetailsForm} />}
        {activeTab === "Plans" && <PlansTab plugin={plugin} pluginId={id} />}
        {activeTab === "Features" && <FeaturesTab plugin={plugin} pluginId={id} />}
        {activeTab === "Screenshots" && <ScreenshotsTab plugin={plugin} pluginId={id} />}
        {activeTab === "Compatibility" && <CompatibilityTab plugin={plugin} pluginId={id} />}
        {activeTab === "Changelog" && <ChangelogTab plugin={plugin} pluginId={id} />}
        {activeTab === "FAQs" && <FaqsTab plugin={plugin} pluginId={id} />}
        {activeTab === "Files" && <FilesTab plugin={plugin} pluginId={id} />}
      </div>
    </div>
  );
}

import api from "@/lib/services";
import type {
  AdminPlugin, AdminPluginListItem,
  Plan, Feature, Screenshot, Compatibility,
  Changelog, ChangelogItem, Faq, PluginFile,
} from "@/lib/types/admin";

// ── Stats ──────────────────────────────────────────────────────────────────────

export const getCustomerCount = async (): Promise<number> => {
  const res = await api.get("/admin/customers/count");
  return res.data.data.count;
};

export type AdminUserLite = { id: string; name: string; email: string };

// Typeahead search for granting private access (debounce on the client).
export const searchUsers = async (q: string): Promise<AdminUserLite[]> => {
  const res = await api.get("/admin/users/search", { params: { q } });
  return res.data.data;
};

export type AdminNotificationCount = {
  supportOpen: number;       // support tickets still OPEN (unsolved)
  contactUnreplied: number;  // contact messages not yet REPLIED
  total: number;             // supportOpen + contactUnreplied
};

// Combined "needs attention" counts for the admin header bell.
export const getAdminNotificationCount = async (): Promise<AdminNotificationCount> => {
  const res = await api.get("/admin/notifications/count");
  return res.data.data;
};

// ── Country analytics ────────────────────────────────────────────────────────────

export type CountryStat = {
  country: string | null;        // ISO-2 code, or null = "Unknown"
  activeSubscriptions: number;
  completedOrders: number;
  total: number;
};

// Store-wide buyers grouped by country (active subscriptions + completed orders).
export const getCountryAnalytics = async (): Promise<CountryStat[]> => {
  const res = await api.get("/admin/analytics/countries");
  return res.data.data.countries;
};

export type PlanCountryAnalytics = {
  planId: string;
  planName: string;
  billingType: "ONCE" | "RECURRING";
  totals: { active: number; total: number };
  countries: { country: string | null; active: number; total: number }[];
};

// Per-plan country breakdown for one plugin (currently active + all-time total).
export const getPluginCountryAnalytics = async (pluginId: string): Promise<PlanCountryAnalytics[]> => {
  const res = await api.get(`/admin/plugins/${pluginId}/country-analytics`);
  return res.data.data.plans;
};

// ── Uploads ────────────────────────────────────────────────────────────────────

export const uploadFile = async (
  file: File,
  opts: { contentType?: string; slug?: string; kind?: "icon" | "screenshot" | "file"; version?: string } = {},
): Promise<string> => {
  const form = new FormData();
  form.append("file", file);
  form.append("contentType", opts.contentType || file.type || "application/octet-stream");
  if (opts.slug) form.append("slug", opts.slug);
  if (opts.kind) form.append("kind", opts.kind);
  if (opts.version) form.append("version", opts.version);
  const res = await api.post("/uploads/upload", form);
  return res.data.data.publicUrl as string;
};

// ── Plugins ────────────────────────────────────────────────────────────────────

export const getAdminPlugins = async (): Promise<AdminPluginListItem[]> => {
  const res = await api.get("/admin/plugins");
  return res.data.data.plugins;
};

export const createPlugin = async (data: {
  name: string;
  slug: string;
  description?: string;
  version: string;
  isActive?: boolean;
}): Promise<AdminPlugin> => {
  const res = await api.post("/admin/plugins", data);
  return res.data.data.plugin;
};

export const getAdminPlugin = async (id: string): Promise<AdminPlugin> => {
  const res = await api.get(`/admin/plugins/${id}`);
  return res.data.data.plugin;
};

export const updatePlugin = async (
  id: string,
  data: Partial<{ name: string; slug: string; description: string | null; version: string; isActive: boolean; iconUrl: string | null; videoUrl: string | null; isPublic: boolean; allowedEmails: string[] }>,
): Promise<AdminPlugin> => {
  const res = await api.patch(`/admin/plugins/${id}`, data);
  return res.data.data.plugin;
};

export const deletePlugin = async (id: string): Promise<void> => {
  await api.delete(`/admin/plugins/${id}`);
};

// ── Plans ──────────────────────────────────────────────────────────────────────

export const addPlan = async (
  pluginId: string,
  data: {
    name: string; siteLimit?: number; durationDays?: number; priceUsd: number;
    discountPercent?: number; discountDurationDays?: number; isActive?: boolean;
    billingType?: string; billingIntervalUnit?: string; billingIntervalCount?: number;
    isPublic?: boolean; allowedEmails?: string[];
  },
): Promise<Plan> => {
  const res = await api.post(`/admin/plugins/${pluginId}/plans`, data);
  return res.data.data.plan;
};

export const updatePlan = async (
  planId: string,
  data: Partial<{ name: string; siteLimit: number; durationDays: number; priceUsd: number; discountPercent: number; discountDurationDays: number; isActive: boolean; isPublic: boolean; allowedEmails: string[] }>,
): Promise<Plan> => {
  const res = await api.patch(`/admin/plans/${planId}`, data);
  return res.data.data.plan;
};

export const deletePlan = async (planId: string): Promise<void> => {
  await api.delete(`/admin/plans/${planId}`);
};

// How many users are currently subscribed (ACTIVE) to a plan.
export const getPlanSubscriptionCount = async (planId: string): Promise<number> => {
  const res = await api.get(`/admin/plans/${planId}/subscription-count`);
  return res.data.data.count;
};

// Cancel every active/pending subscription on a plan (does NOT deactivate the plan).
export const cancelPlanSubscriptions = async (
  planId: string,
): Promise<{ cancelled: number }> => {
  const res = await api.post(`/admin/plans/${planId}/cancel-subscriptions`);
  return res.data.data;
};

// ── Features ───────────────────────────────────────────────────────────────────

export const addFeature = async (
  pluginId: string,
  data: { text: string; sortOrder?: number },
): Promise<Feature> => {
  const res = await api.post(`/admin/plugins/${pluginId}/features`, data);
  return res.data.data.feature;
};

export const updateFeature = async (
  featureId: string,
  data: Partial<{ text: string; sortOrder: number }>,
): Promise<Feature> => {
  const res = await api.patch(`/admin/features/${featureId}`, data);
  return res.data.data.feature;
};

export const deleteFeature = async (featureId: string): Promise<void> => {
  await api.delete(`/admin/features/${featureId}`);
};

// ── Screenshots ────────────────────────────────────────────────────────────────

export const addScreenshot = async (
  pluginId: string,
  data: { r2FilePath: string; caption?: string; sortOrder?: number },
): Promise<Screenshot> => {
  const res = await api.post(`/admin/plugins/${pluginId}/screenshots`, data);
  return res.data.data.screenshot;
};

export const updateScreenshot = async (
  screenshotId: string,
  data: Partial<{ caption: string; sortOrder: number }>,
): Promise<Screenshot> => {
  const res = await api.patch(`/admin/screenshots/${screenshotId}`, data);
  return res.data.data.screenshot;
};

export const deleteScreenshot = async (screenshotId: string): Promise<void> => {
  await api.delete(`/admin/screenshots/${screenshotId}`);
};

// ── Compatibility ──────────────────────────────────────────────────────────────

export const addCompatibility = async (
  pluginId: string,
  data: { software: string; versionInfo?: string; sortOrder?: number },
): Promise<Compatibility> => {
  const res = await api.post(`/admin/plugins/${pluginId}/compatibility`, data);
  return res.data.data.item;
};

export const updateCompatibility = async (
  compatId: string,
  data: Partial<{ software: string; versionInfo: string; sortOrder: number }>,
): Promise<Compatibility> => {
  const res = await api.patch(`/admin/compatibility/${compatId}`, data);
  return res.data.data.item;
};

export const deleteCompatibility = async (compatId: string): Promise<void> => {
  await api.delete(`/admin/compatibility/${compatId}`);
};

// ── Changelog ──────────────────────────────────────────────────────────────────

export const addChangelog = async (
  pluginId: string,
  data: { version: string; releaseDate: string },
): Promise<Changelog> => {
  const res = await api.post(`/admin/plugins/${pluginId}/changelogs`, data);
  return res.data.data.changelog;
};

export const deleteChangelog = async (changelogId: string): Promise<void> => {
  await api.delete(`/admin/changelogs/${changelogId}`);
};

export const addChangelogItem = async (
  changelogId: string,
  data: { note: string; sortOrder?: number },
): Promise<ChangelogItem> => {
  const res = await api.post(`/admin/changelogs/${changelogId}/items`, data);
  return res.data.data.item;
};

export const deleteChangelogItem = async (itemId: string): Promise<void> => {
  await api.delete(`/admin/changelog-items/${itemId}`);
};

// ── FAQs ───────────────────────────────────────────────────────────────────────

export const addFaq = async (
  pluginId: string,
  data: { question: string; answer?: string; sortOrder?: number },
): Promise<Faq> => {
  const res = await api.post(`/admin/plugins/${pluginId}/faqs`, data);
  return res.data.data.faq;
};

export const updateFaq = async (
  faqId: string,
  data: Partial<{ question: string; answer: string }>,
): Promise<Faq> => {
  const res = await api.patch(`/admin/faqs/${faqId}`, data);
  return res.data.data.faq;
};

export const deleteFaq = async (faqId: string): Promise<void> => {
  await api.delete(`/admin/faqs/${faqId}`);
};

// ── Files ──────────────────────────────────────────────────────────────────────

export const addFile = async (
  pluginId: string,
  data: { r2FilePath: string; version: string; fileSize?: number; isLatest?: boolean },
): Promise<PluginFile> => {
  const res = await api.post(`/admin/plugins/${pluginId}/files`, data);
  return res.data.data.file;
};

export const updateFile = async (
  fileId: string,
  data: Partial<{ isLatest: boolean; version: string }>,
): Promise<PluginFile> => {
  const res = await api.patch(`/admin/files/${fileId}`, data);
  return res.data.data.file;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  await api.delete(`/admin/files/${fileId}`);
};

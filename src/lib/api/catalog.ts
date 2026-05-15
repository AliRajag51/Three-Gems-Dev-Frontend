/**
 * Catalog API surface — public, no auth required.
 * Backend: src/modules/catalog/catalog.controller.ts
 */
import { api } from "./client";
import type { ChangelogResponse, ListPluginsResponse, PluginDetail } from "./types";

export const catalogApi = {
  listPlugins(options: { limit?: number; cursor?: string } = {}) {
    return api.get<ListPluginsResponse>("/api/v1/plugins", { searchParams: options });
  },
  getPlugin(slug: string) {
    return api.get<PluginDetail>(`/api/v1/plugins/${encodeURIComponent(slug)}`);
  },
  getChangelog(slug: string) {
    return api.get<ChangelogResponse>(`/api/v1/plugins/${encodeURIComponent(slug)}/changelog`);
  },
};

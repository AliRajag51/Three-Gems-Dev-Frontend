import api from "@/lib/services";
import type { PluginListItem, PluginFull } from "@/lib/types/plugin";

export const getPluginsService = async (): Promise<PluginListItem[]> => {
  const res = await api.get("/plugins");
  return res.data.data.plugins;
};

export const getPluginBySlugService = async (slug: string): Promise<PluginFull> => {
  const res = await api.get(`/plugins/${slug}`);
  return res.data.data.plugin;
};

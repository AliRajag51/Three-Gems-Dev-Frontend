import type { Metadata } from "next";
import { PluginDetail } from "./plugin-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/api/v1/plugins/${slug}`,
      // Cache for 5 min so the title metadata doesn't trigger a blocking remote
      // refetch on every navigation. Plugin name/description rarely change.
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return { title: "Plugin not found — Three Gems" };
    const data = await res.json();
    const plugin = data.data.plugin;
    return {
      title: `${plugin.name} — Three Gems`,
      description: plugin.description ?? undefined,
    };
  } catch {
    return { title: "Three Gems" };
  }
}

export default async function PluginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PluginDetail slug={slug} />;
}

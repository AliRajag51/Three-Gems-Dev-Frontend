import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PluginCard } from "@/components/plugin-card";
import { catalogApi } from "@/lib/api/catalog";

const pluginsQueryOptions = {
  queryKey: ["plugins", "list"] as const,
  queryFn: () => catalogApi.listPlugins({ limit: 50 }),
};

export const Route = createFileRoute("/plugins/")({
  head: () => ({
    meta: [
      { title: "All Plugins — Three Gems" },
      {
        name: "description",
        content: "Browse the complete catalog of Three Gems WooCommerce and WordPress plugins.",
      },
    ],
  }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(pluginsQueryOptions),
  pendingComponent: PluginsPending,
  errorComponent: PluginsError,
  component: PluginsPage,
});

function PluginsPage() {
  const { data } = useSuspenseQuery(pluginsQueryOptions);

  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-20">
          <span className="chip">Plugin Catalog</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            All Plugins
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Premium WordPress & WooCommerce plugins, crafted with care by Three Gems.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        {data.items.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <h2 className="font-display text-2xl font-bold">No plugins published yet</h2>
            <p className="mt-3 text-muted-foreground">Check back soon — we're shipping fast.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => (
              <PluginCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PluginsPending() {
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-surface p-6 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-primary-soft" />
            <div className="mt-5 h-5 w-2/3 rounded bg-border" />
            <div className="mt-3 h-4 w-full rounded bg-border" />
            <div className="mt-2 h-4 w-5/6 rounded bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PluginsError({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Couldn't load plugins</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
    </div>
  );
}

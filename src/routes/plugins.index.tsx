import { createFileRoute } from "@tanstack/react-router";
import { plugins } from "@/data/plugins";
import { PluginCard } from "@/components/plugin-card";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/plugins/")({
  head: () => ({
    meta: [
      { title: "All Plugins — Three Gems" },
      { name: "description", content: "Browse the complete catalog of Three Gems WooCommerce and WordPress plugins." },
    ],
  }),
  component: PluginsPage,
});

function PluginsPage() {
  const cats = useMemo(() => ["All", ...Array.from(new Set(plugins.map((p) => p.category)))], []);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const filtered = plugins.filter(
    (p) => (cat === "All" || p.category === cat) && (q === "" || p.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-20">
          <span className="chip">Plugin Catalog</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">All Plugins</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">Premium WordPress & WooCommerce plugins, crafted with care by Three Gems.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search plugins..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PluginCard key={p.slug} p={p} />)}
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-20 text-muted-foreground">No plugins match your search.</p>
        )}
      </section>
    </div>
  );
}

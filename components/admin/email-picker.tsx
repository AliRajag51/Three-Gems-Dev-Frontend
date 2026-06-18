"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Plus, Loader2 } from "lucide-react";
import { searchUsers } from "@/lib/services/admin.service";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/**
 * Multi-select email picker for granting private access.
 * - Type to search registered users (debounced 300ms, cached by React Query → no flood).
 * - Click a result, or press Enter / "Add …" to grant a not-yet-registered email.
 * - Selected emails show as removable chips. Value is a lowercase string[].
 */
export function EmailPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (emails: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounce the search term so each keystroke doesn't hit the backend.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["admin-user-search", debounced],
    queryFn: () => searchUsers(debounced),
    enabled: debounced.length >= 1,
    staleTime: 60_000, // re-typing the same term reuses the cached result
  });

  // Close the dropdown on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const add = (email: string) => {
    const e = email.trim().toLowerCase();
    if (!e || value.includes(e)) return;
    onChange([...value, e]);
    setQuery("");
    setDebounced("");
  };
  const remove = (email: string) => onChange(value.filter((v) => v !== email));

  const q = debounced.toLowerCase();
  // Drop already-selected, and surface prefix matches first (best match on top).
  const suggestions = results
    .filter((u) => !value.includes(u.email.toLowerCase()))
    .sort((a, b) => Number(!a.email.toLowerCase().startsWith(q)) - Number(!b.email.toLowerCase().startsWith(q)));

  const typed = query.trim().toLowerCase();
  const canAddTyped =
    isEmail(typed) &&
    !value.includes(typed) &&
    !suggestions.some((u) => u.email.toLowerCase() === typed);

  return (
    <div ref={boxRef} className="relative">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-soft text-primary-deep text-xs font-medium"
            >
              {email}
              <button type="button" onClick={() => remove(email)} className="hover:text-destructive" title="Remove">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canAddTyped) { e.preventDefault(); add(typed); }
          }}
          placeholder="Search users by name or email…"
          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
        />
        {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}

        {/* Dropdown — opens upward (above the input) */}
        {open && (debounced.length >= 1 || canAddTyped) && (
          <div className="absolute z-30 bottom-full mb-1 left-0 w-full max-h-56 overflow-auto rounded-xl border border-border bg-surface shadow-lg">
            {!isFetching && suggestions.length === 0 && !canAddTyped && (
              <div className="px-3 py-2 text-xs text-muted-foreground">No matching users.</div>
            )}
            {suggestions.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => add(u.email)}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
              >
                <p className="text-sm font-medium truncate">{u.email}</p>
                <p className="text-xs text-muted-foreground truncate">{u.name}</p>
              </button>
            ))}
            {canAddTyped && (
              <button
                type="button"
                onClick={() => add(typed)}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2 text-primary border-t border-border"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" /> Add &ldquo;{typed}&rdquo;
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {value.length} selected · type to search registered users, or enter an email to pre-grant access.
      </p>
    </div>
  );
}

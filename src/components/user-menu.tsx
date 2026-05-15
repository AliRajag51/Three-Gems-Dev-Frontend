/**
 * Authenticated-user dropdown for the site header.
 *
 * Extracted from `SiteHeader` so the header file stays focused on layout.
 * Uses the shadcn DropdownMenu (Radix under the hood) so we get keyboard
 * navigation + focus management for free.
 *
 * Sign-out flow: call the backend (clears the server-side session cookie),
 * invalidate the cached session query (every `useSession` consumer re-renders
 * as anonymous), then navigate home. We swallow API errors from sign-out
 * because there's nothing actionable for the user — if the cookie is gone
 * we still want them to land in the anonymous state.
 */
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, KeyRound, Loader2, LogOut, User } from "lucide-react";

import { authApi } from "@/lib/api/auth";
import { useSetSessionUser } from "@/hooks/use-session";
import type { MePublic } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: MePublic;
}

export function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate();
  const setSessionUser = useSetSessionUser();

  const signOut = useMutation({
    mutationFn: () => authApi.signOut(),
    onSettled: () => {
      // Flip the cache to anonymous immediately — no network round-trip.
      // We use `onSettled` (not `onSuccess`) so even if the backend call
      // errors we still treat the client as signed out; the server-side
      // session cookie is best-effort cleared either way.
      setSessionUser(null);
      navigate({ to: "/" });
    },
  });

  const initials = getInitials(user.name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-2 rounded-xl hover:bg-muted"
          aria-label="Open account menu"
        >
          <span className="grid place-items-center w-7 h-7 rounded-full bg-primary-soft text-primary-deep text-xs font-semibold">
            {initials}
          </span>
          <span className="hidden xl:inline text-sm font-medium text-foreground max-w-[8rem] truncate">
            {user.name || user.email}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold truncate">{user.name || "Account"}</span>
          <span className="text-xs font-normal text-muted-foreground truncate">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          {/* /me/licenses route is not implemented yet (Wave C Stage 6) — use a plain anchor so the typed router doesn't reject it. */}
          <a href="/me/licenses" className="cursor-pointer">
            <KeyRound className="w-4 h-4" />
            My Licenses
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account" className="cursor-pointer">
            <User className="w-4 h-4" />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            if (!signOut.isPending) signOut.mutate();
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={signOut.isPending}
        >
          {signOut.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(name: string, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

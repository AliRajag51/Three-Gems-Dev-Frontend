/**
 * Tiny status badge for license rows + the detail header.
 *
 * Wraps shadcn's `Badge` so the colour mapping for each `LicenseStatus` value
 * lives in exactly one place (the list view, the detail view, and any future
 * surface — e.g. an admin table — all stay consistent).
 *
 * We accept `status: string` (not the literal union) because the backend
 * projects the enum as a string; this lets us render unknown future statuses
 * gracefully instead of crashing.
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LicenseStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  EXPIRED: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50",
  PAST_DUE: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50",
  REVOKED: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  PAST_DUE: "Past due",
  REVOKED: "Revoked",
};

export function LicenseStatusBadge({ status, className }: LicenseStatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border";
  const label = STATUS_LABEL[status] ?? status;
  return (
    <Badge variant="outline" className={cn("font-semibold", styles, className)}>
      {label}
    </Badge>
  );
}

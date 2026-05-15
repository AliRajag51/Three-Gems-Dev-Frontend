/**
 * Shapes returned by the Three Gems backend.
 *
 * These are hand-mirrored from the backend's Zod DTOs (see
 * D:\Full Stack Application\src\modules\*\dto\*.dto.ts). Keeping them as
 * TypeScript types (not full Zod schemas) makes the frontend tree-shake
 * better and avoids dragging an extra parser into every request — we trust
 * the backend's validation and only Zod-validate user *input* (form fields)
 * on the frontend.
 *
 * If a shape ever drifts at runtime, the network call surfaces the mismatch
 * naturally; we don't need defensive double-parsing.
 */

// ---------- Catalog ----------

export interface PluginSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  iconUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentType = "ONE_TIME" | "SUBSCRIPTION";
export type BillingInterval = "MONTH" | "YEAR";

export interface PluginPricingOptionPublic {
  id: string;
  label: string;
  paymentType: PaymentType;
  billingInterval: BillingInterval | null;
  maxActivations: number | null;
  priceCents: number;
  introPriceCents: number | null;
  currency: string;
  updateWindowDays: number;
  displayOrder: number;
}

export interface PluginLatestVersionPublic {
  id: string;
  version: string;
  releasedAt: string;
  minWpVersion: string | null;
  minPhpVersion: string | null;
}

export interface PluginDetail extends PluginSummary {
  description: string;
  pricingOptions: PluginPricingOptionPublic[];
  latestVersion: PluginLatestVersionPublic | null;
}

export interface ListPluginsResponse {
  items: PluginSummary[];
  nextCursor: string | null;
}

export interface ChangelogEntry {
  version: string;
  releasedAt: string;
  changelog: string;
}

export interface ChangelogResponse {
  items: ChangelogEntry[];
}

// ---------- Auth ----------

export type UserRole = "CUSTOMER" | "ADMIN" | "AUTHOR";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface MePublic {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole | string;
  status: UserStatus | string;
  createdAt: string;
  updatedAt: string;
}

/** Better-Auth's sign-in/sign-up response. */
export interface AuthResponse {
  token: string | null;
  user: MePublic;
  redirect?: false;
}

// ---------- Billing ----------

export type OrderStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED" | string;

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  paymentProvider: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

export interface ListOrdersResponse {
  items: OrderSummary[];
  nextCursor: string | null;
}

export interface SubscriptionSummary {
  id: string;
  pluginId: string;
  pricingOptionId: string;
  status: string;
  interval: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
}

export interface ListSubscriptionsResponse {
  items: SubscriptionSummary[];
  nextCursor: string | null;
}

export interface CreateCheckoutSessionInput {
  pricingOptionId: string;
  provider?: "stripe" | "paypal";
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  externalSessionId: string;
}

// ---------- Licenses ----------

export type LicenseStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "PAST_DUE";

export interface LicenseActivationPublic {
  id: string;
  siteUrl: string;
  activatedAt: string;
  lastSeenAt: string;
  deactivatedAt: string | null;
}

export interface LicensePublic {
  id: string;
  pluginId: string;
  pricingOptionId: string;
  keyPrefix: string;
  status: LicenseStatus | string;
  maxActivations: number | null;
  updatesExpireAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  activations?: LicenseActivationPublic[];
}

export interface ListLicensesResponse {
  items: LicensePublic[];
  nextCursor: string | null;
}

export interface RenewLicenseResponse {
  url: string;
}

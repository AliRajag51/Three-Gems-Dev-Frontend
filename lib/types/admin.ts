export type AdminPluginListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  version: string;
  isActive: boolean;
  isPublic: boolean;
  planCount: number;
  minPrice: number | null;
  createdAt: string;
};

export type Plan = {
  id: string;
  name: string;
  siteLimit: number;
  durationDays: number;
  priceUsd: string;
  discountPercent: number;
  discountDurationDays: number | null; // null/0 = discount never expires
  discountStartedAt: string | null;    // ISO timestamp the countdown began
  isActive: boolean;
  billingType: "ONCE" | "RECURRING";
  billingIntervalUnit: "DAY" | "WEEK" | "MONTH" | "YEAR" | null;
  billingIntervalCount: number | null;
  paypalPlanId: string | null;
  activeSubscriptions?: number; // count of currently-subscribed users (from getAdminPlugin)
  isPublic: boolean;            // false = private plan, only allowedEmails can see/buy
  allowedEmails: string[];      // lowercase emails granted access when private
};

export type Feature = {
  id: string;
  text: string;
  sortOrder: number;
};

export type Screenshot = {
  id: string;
  r2FilePath: string;
  caption: string | null;
  sortOrder: number;
};

export type Compatibility = {
  id: string;
  software: string;
  versionInfo: string;
  sortOrder: number;
};

export type ChangelogItem = {
  id: string;
  note: string;
  sortOrder: number;
};

export type Changelog = {
  id: string;
  version: string;
  releaseDate: string;
  items: ChangelogItem[];
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type PluginFile = {
  id: string;
  version: string;
  r2FilePath: string;
  fileSize: number | null;
  isLatest: boolean;
  createdAt: string;
};

export type AdminPlugin = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  videoUrl: string | null;
  version: string;
  isActive: boolean;
  isPublic: boolean;
  allowedEmails: string[];
  plans: Plan[];
  features: Feature[];
  screenshots: Screenshot[];
  compatibility: Compatibility[];
  changelogs: Changelog[];
  faqs: Faq[];
  files: PluginFile[];
};

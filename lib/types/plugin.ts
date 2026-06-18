export type PluginListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  version: string;
  createdAt: string;
  sales: number;
  planCount: number;
  plans: {
    priceUsd: string;
    discountPercent: number;
    discountDurationDays?: number | null;
    discountStartedAt?: string | null;
  }[];
  discountSettings: DiscountSettings;
};

export type Plan = {
  id: string;
  name: string;
  siteLimit: number;
  durationDays: number;
  priceUsd: string;
  discountPercent: number;
  discountDurationDays?: number | null; // null/0 = discount never expires
  discountStartedAt?: string | null;    // ISO timestamp the countdown began
  isActive: boolean;
  billingType: "ONCE" | "RECURRING";
  billingIntervalUnit: "DAY" | "WEEK" | "MONTH" | "YEAR" | null;
  billingIntervalCount: number | null;
};

export type DiscountSettings = {
  globalPercent: number;
  globalEndsAt: string | null;
  newUserPercent: number;
  newUserDays: number;
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

export type CompatibilityItem = {
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

export type PluginFull = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  videoUrl: string | null;
  version: string;
  plans: Plan[];
  features: Feature[];
  screenshots: Screenshot[];
  compatibility: CompatibilityItem[];
  changelogs: Changelog[];
  faqs: Faq[];
  files: { r2FilePath: string; version: string }[];
  discountSettings: DiscountSettings;
};

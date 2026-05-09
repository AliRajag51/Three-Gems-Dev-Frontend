export type Plugin = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  version: string;
  category: string;
  iconColor: string;
  emoji: string;
  features: string[];
};

export const plugins: Plugin[] = [
  {
    slug: "woocommerce-payment-automation",
    name: "WooCommerce Payment Automation",
    tagline: "Automate payouts, refunds & reconciliation",
    description: "Save hours every week with rule-based payment automations, smart retries, and reconciliation reports built for WooCommerce stores.",
    price: 79,
    rating: 4.9,
    reviews: 248,
    version: "2.4.1",
    category: "Payments",
    iconColor: "from-rose-500 to-rose-700",
    emoji: "💳",
    features: [
      "Rule-based automated payouts",
      "Smart retry for failed payments",
      "Daily reconciliation reports",
      "Stripe, PayPal & Mollie support",
      "Slack & email alerts",
    ],
  },
  {
    slug: "woocommerce-affiliate-manager",
    name: "WooCommerce Affiliate Manager",
    tagline: "Run a powerful affiliate program",
    description: "Recruit, track, and pay affiliates without leaving your WordPress admin. Beautiful affiliate dashboard included.",
    price: 99,
    rating: 4.8,
    reviews: 192,
    version: "1.9.0",
    category: "Marketing",
    iconColor: "from-amber-500 to-rose-600",
    emoji: "🎯",
    features: [
      "Custom commission tiers",
      "Affiliate dashboard & links",
      "MLM / 2-tier support",
      "Auto payouts via Stripe",
      "Coupon attribution",
    ],
  },
  {
    slug: "woocommerce-checkout-enhancer",
    name: "WooCommerce Checkout Enhancer",
    tagline: "Convert more carts into orders",
    description: "Modern, fast, mobile-first checkout with field validation, address autocomplete, and one-click upsells.",
    price: 69,
    rating: 4.9,
    reviews: 412,
    version: "3.1.2",
    category: "Conversion",
    iconColor: "from-rose-400 to-rose-700",
    emoji: "🛒",
    features: [
      "One-page checkout",
      "Address autocomplete",
      "One-click upsells",
      "Trust badges & guarantees",
      "Custom field builder",
    ],
  },
  {
    slug: "order-status-automation",
    name: "Order Status Automation",
    tagline: "Triggers, actions, workflows",
    description: "A visual workflow builder that fires actions when order statuses change — emails, webhooks, stock, tags, and more.",
    price: 59,
    rating: 4.7,
    reviews: 156,
    version: "2.0.4",
    category: "Workflow",
    iconColor: "from-pink-500 to-rose-700",
    emoji: "⚡",
    features: [
      "Visual workflow builder",
      "Webhook & API actions",
      "Custom email templates",
      "Conditional logic",
      "Activity log & retries",
    ],
  },
  {
    slug: "smart-shipping-rules",
    name: "Smart Shipping Rules",
    tagline: "Conditional shipping that just works",
    description: "Build complex shipping rules with conditions for weight, zone, product, customer role and more — without writing code.",
    price: 49,
    rating: 4.8,
    reviews: 287,
    version: "1.6.3",
    category: "Shipping",
    iconColor: "from-rose-500 to-pink-700",
    emoji: "📦",
    features: [
      "Conditional shipping rules",
      "Per-product & category rates",
      "Zone-based pricing",
      "Free shipping triggers",
      "Carrier API integration",
    ],
  },
  {
    slug: "license-manager-pro",
    name: "License Manager Pro",
    tagline: "Sell licensed products with confidence",
    description: "Generate, deliver, and manage software licenses for digital products. Built-in API for activation and validation.",
    price: 119,
    rating: 4.9,
    reviews: 134,
    version: "2.2.0",
    category: "Digital",
    iconColor: "from-rose-600 to-rose-900",
    emoji: "🔑",
    features: [
      "Auto license generation",
      "Activation & validation API",
      "Site-limit enforcement",
      "Expiry & renewals",
      "Customer license dashboard",
    ],
  },
];

export const tiers = [
  {
    name: "Single Site License",
    price: 79,
    description: "Perfect for store owners running one WooCommerce site.",
    sites: "1 site",
    duration: "1 year of updates",
    support: "Email support",
    highlight: false,
    features: [
      "Use on 1 production site",
      "1 year of plugin updates",
      "1 year of email support",
      "Detailed documentation",
      "30-day money-back guarantee",
    ],
  },
  {
    name: "5 Site License",
    price: 199,
    description: "For freelancers and small agencies serving multiple clients.",
    sites: "Up to 5 sites",
    duration: "1 year of updates",
    support: "Priority email support",
    highlight: true,
    features: [
      "Use on up to 5 production sites",
      "1 year of plugin updates",
      "Priority email support",
      "Onboarding call",
      "30-day money-back guarantee",
    ],
  },
  {
    name: "Unlimited License",
    price: 499,
    description: "For agencies and developers shipping at scale.",
    sites: "Unlimited sites",
    duration: "Lifetime updates",
    support: "Priority support + Slack",
    highlight: false,
    features: [
      "Unlimited production sites",
      "Lifetime plugin updates",
      "Priority support + Slack channel",
      "Early access to new plugins",
      "White-glove onboarding",
    ],
  },
];

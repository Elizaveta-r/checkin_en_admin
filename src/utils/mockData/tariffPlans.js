export const TARIFF_PLANS = [
  {
    id: 1,
    name: "Starter",
    price: 0,
    period: "month",
    description: "Perfect for getting started with the platform",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "Up to 100 requests per day", included: true },
      { text: "Basic analytics", included: true },
      { text: "1 integration", included: true },
      { text: "Email support", included: true },
      { text: "Priority support", included: false },
      { text: "API access", included: false },
      { text: "Custom integrations", included: false },
    ],
    color: "#6b7280",
  },
  {
    id: 2,
    name: "Basic",
    price: 1990,
    period: "month",
    description: "For small businesses and startups",
    isPopular: true,
    isCurrent: true,
    features: [
      { text: "Up to 1,000 requests per day", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Up to 5 integrations", included: true },
      { text: "Email and chat support", included: true },
      { text: "API access", included: true },
      { text: "Priority support", included: false },
      { text: "Custom integrations", included: false },
    ],
    color: "#22c55e",
  },
  {
    id: 3,
    name: "Professional",
    price: 4990,
    period: "month",
    description: "For growing companies",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "Up to 5,000 requests per day", included: true },
      { text: "Premium analytics", included: true },
      { text: "Up to 15 integrations", included: true },
      { text: "24/7 priority support", included: true },
      { text: "API access", included: true },
      { text: "Webhooks", included: true },
      { text: "White-label", included: false },
    ],
    color: "#3b82f6",
  },
  {
    id: 4,
    name: "Enterprise",
    price: null, // null означает "по запросу"
    period: "month",
    description: "Custom solutions for large businesses",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "Unlimited requests", included: true },
      { text: "Full analytics and reporting", included: true },
      { text: "Unlimited integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantees", included: true },
      { text: "Custom integrations", included: true },
      { text: "White-label", included: true },
    ],
    color: "#8b5cf6",
  },
];

// Дополнительные опции (Add-ons)
export const ADDON_OPTIONS = [
  {
    id: "addon-1",
    name: "Additional requests",
    description: "+1,000 requests per day",
    price: 500,
    period: "month",
  },
  {
    id: "addon-2",
    name: "Additional integrations",
    description: "+5 integrations",
    price: 300,
    period: "month",
  },
  {
    id: "addon-3",
    name: "Extended support",
    description: "24/7 priority support",
    price: 1000,
    period: "month",
  },
];

// Часто задаваемые вопросы о тарифах
export const TARIFF_FAQ = [
  {
    question: "Can I change my plan at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. When upgrading, the additional charge is calculated proportionally.",
  },
  {
    question: "What happens if I exceed the request limit?",
    answer:
      "If you exceed the limit, requests will be temporarily paused. You can purchase an additional request package or upgrade your plan.",
  },
  {
    question: "Are there discounts for annual billing?",
    answer: "Yes, you get a 20% discount on any plan when paying annually.",
  },
  {
    question: "Can I get a refund?",
    answer: "Yes, we offer refunds within 14 days of payment.",
  },
];

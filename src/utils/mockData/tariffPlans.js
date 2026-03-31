export const TARIFF_PLANS = [
  {
    id: 1,
    name: "Стартовый",
    price: 0,
    period: "месяц",
    description: "Идеально для знакомства с платформой",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "До 100 запросов в день", included: true },
      { text: "Базовая аналитика", included: true },
      { text: "1 интеграция", included: true },
      { text: "Email поддержка", included: true },
      { text: "Приоритетная поддержка", included: false },
      { text: "API доступ", included: false },
      { text: "Кастомные интеграции", included: false },
    ],
    color: "#6b7280",
  },
  {
    id: 2,
    name: "Базовый",
    price: 1990,
    period: "месяц",
    description: "Для малого бизнеса и стартапов",
    isPopular: true,
    isCurrent: true,
    features: [
      { text: "До 1000 запросов в день", included: true },
      { text: "Расширенная аналитика", included: true },
      { text: "До 5 интеграций", included: true },
      { text: "Email и чат поддержка", included: true },
      { text: "API доступ", included: true },
      { text: "Приоритетная поддержка", included: false },
      { text: "Кастомные интеграции", included: false },
    ],
    color: "#22c55e",
  },
  {
    id: 3,
    name: "Профессиональный",
    price: 4990,
    period: "месяц",
    description: "Для растущих компаний",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "До 5000 запросов в день", included: true },
      { text: "Продвинутая аналитика", included: true },
      { text: "До 15 интеграций", included: true },
      { text: "Приоритетная поддержка 24/7", included: true },
      { text: "API доступ", included: true },
      { text: "Webhooks", included: true },
      { text: "Белый лейбл", included: false },
    ],
    color: "#3b82f6",
  },
  {
    id: 4,
    name: "Корпоративный",
    price: null, // null означает "по запросу"
    period: "месяц",
    description: "Индивидуальные решения для крупного бизнеса",
    isPopular: false,
    isCurrent: false,
    features: [
      { text: "Неограниченные запросы", included: true },
      { text: "Полная аналитика и отчеты", included: true },
      { text: "Неограниченное количество интеграций", included: true },
      { text: "Выделенный менеджер", included: true },
      { text: "SLA гарантии", included: true },
      { text: "Кастомные интеграции", included: true },
      { text: "Белый лейбл", included: true },
    ],
    color: "#8b5cf6",
  },
];

// Дополнительные опции (Add-ons)
export const ADDON_OPTIONS = [
  {
    id: "addon-1",
    name: "Дополнительные запросы",
    description: "+1000 запросов в день",
    price: 500,
    period: "месяц",
  },
  {
    id: "addon-2",
    name: "Дополнительные интеграции",
    description: "+5 интеграций",
    price: 300,
    period: "месяц",
  },
  {
    id: "addon-3",
    name: "Расширенная поддержка",
    description: "Приоритетная поддержка 24/7",
    price: 1000,
    period: "месяц",
  },
];

// Часто задаваемые вопросы о тарифах
export const TARIFF_FAQ = [
  {
    question: "Можно ли сменить тариф в любое время?",
    answer:
      "Да, вы можете повысить или понизить тариф в любое время. При повышении тарифа доплата рассчитывается пропорционально.",
  },
  {
    question: "Что произойдет, если я превышу лимит запросов?",
    answer:
      "При превышении лимита запросы будут временно приостановлены. Вы можете приобрести дополнительный пакет запросов или повысить тариф.",
  },
  {
    question: "Есть ли скидки при годовой оплате?",
    answer: "Да, при оплате за год вы получаете скидку 20% на любой тариф.",
  },
  {
    question: "Можно ли получить возврат средств?",
    answer:
      "Да, мы предоставляем возврат средств в течение 14 дней с момента оплаты.",
  },
];

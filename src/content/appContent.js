export const initialSettings = {
  name: "LP Finance",
  email: "",
  weeklySummary: true,
  transactionAlerts: true,
};

export const initialConfiguration = {
  pipelines: ["Cash", "Lite", "Habesha", "Best", "Speed", "Santim", "Dash", "Dama"],
  currencies: ["ETB", "USD", "USDT"],
};

export const createInitialTransactionForm = () => ({
  date: new Date().toISOString().split("T")[0],
  amount: "",
  category: "Expense",
  from: "Cash",
  inChargeOfWithdrawal: "",
  to: "",
  currency: "USDT",
  rate: "1",
  status: "Completed",
  notes: "",
});

export const transactionTypes = {
  Expense: { icon: "↓", color: "pink" },
  Conversion: { icon: "⇄", color: "blue" },
};

export const navItems = [
  { id: "overview", label: "Overview", icon: "⌂", color: "lime" },
  { id: "transactions", label: "Transactions", icon: "↔", color: "blue" },
  { id: "operators", label: "Operators", icon: "◆", color: "orange" },
  { id: "reports", label: "Reports", icon: "◔", color: "purple" },
  { id: "settings", label: "Settings", icon: "⚙", color: "pink" },
];

export const operatorIcons = {
  Cash: "💵",
  Lite: "✦",
  Habesha: "◉",
  Best: "★",
  Speed: "⚡",
  Santim: "¢",
  Dash: "➜",
  Dama: "♦",
};

export const csvColumns = [
  "date",
  "category",
  "from",
  "inChargeOfWithdrawal",
  "to",
  "amount",
  "currency",
  "rate",
  "status",
  "notes",
];

export const sectionCopy = {
  overview: ["Dashboard", "Your money at a glance."],
  transactions: ["Transactions", "Review and manage all account activity."],
  operators: ["Operators", "Track conversions and expenses by operator."],
  reports: ["Reports", "Operator conversion and expense breakdowns."],
  settings: ["Settings", "Manage your preferences and account security."],
};

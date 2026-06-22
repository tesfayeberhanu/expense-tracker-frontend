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
  {
    id: "transactions",
    label: "Transactions",
    icon: "↔",
    color: "blue",
    permissions: ["transactions:read", "reports:view", "transactions:create"],
  },
  {
    id: "operators",
    label: "Operators",
    icon: "◆",
    color: "orange",
    permissions: ["operators:manage", "reports:view"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: "◔",
    color: "purple",
    permissions: ["reports:view"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙",
    color: "pink",
    permissions: ["settings:read", "settings:update"],
  },
];

export const permissionLabels = {
  "operators:manage": "Manage operators",
  "transactions:create": "Create transactions",
  "transactions:read": "View own transactions",
  "transactions:read_all": "View all transactions",
  "transactions:update": "Update transactions",
  "transactions:delete": "Delete transactions",
  "reports:view": "View own reports",
  "reports:view_all": "View all reports",
  "settings:read": "Read settings",
  "settings:update": "Update settings",
  "configuration:read": "Read configuration",
};

export const defaultOperatorPermissions = [
  "transactions:create",
  "transactions:read",
  "reports:view",
  "settings:read",
  "configuration:read",
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
  operators: ["Operators", "Manage access and track operator activity."],
  reports: ["Reports", "Operator conversion and expense breakdowns."],
  settings: ["Settings", "Manage your preferences and account security."],
};

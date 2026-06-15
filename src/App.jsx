/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import lpLogo from "./assets/lp-logo.png";

const API_URL = "/api/transactions";
const SETTINGS_URL = "/api/settings";
const CONFIGURATION_URL = "/api/configuration";
const initialSettings = {
  name: "LP Finance",
  email: "",
  weeklySummary: true,
  transactionAlerts: true,
};

const initialConfiguration = {
  pipelines: ["Cash", "Lite", "Habesha", "Best", "Speed", "Santim", "Dash", "Dama"],
  currencies: ["ETB", "USD", "USDT"],
};

const initialTransactionForm = {
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
};

const transactionTypes = {
  Expense: { icon: "↓", color: "pink" },
  Conversion: { icon: "⇄", color: "blue" },
};

const navItems = [
  { id: "overview", label: "Overview", icon: "⌂", color: "lime" },
  { id: "transactions", label: "Transactions", icon: "↔", color: "blue" },
  { id: "operators", label: "Operators", icon: "◆", color: "orange" },
  { id: "reports", label: "Reports", icon: "◔", color: "purple" },
  { id: "settings", label: "Settings", icon: "⚙", color: "pink" },
];

const operatorIcons = {
  Cash: "💵",
  Lite: "✦",
  Habesha: "◉",
  Best: "★",
  Speed: "⚡",
  Santim: "¢",
  Dash: "➜",
  Dama: "♦",
};

const formatCurrency = (value, currency = "USD") => {
  const amount = Number(value) || 0;

  if (currency === "USDT") {
    return `${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(amount)} USDT`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatTransactionDate = (transaction) => {
  const dateValue = transaction.date || transaction.createdAt;
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const toDateInputValue = (date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().split("T")[0];
};

const getTransactionDate = (transaction) => {
  const value = transaction.date || transaction.createdAt;
  if (!value) return null;

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  return Number.isNaN(date.getTime()) ? null : date;
};

const csvColumns = [
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

const escapeCsvValue = (value) => {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
};

const sectionCopy = {
  overview: ["Dashboard", "Your money at a glance."],
  transactions: ["Transactions", "Review and manage all account activity."],
  operators: ["Operators", "Track conversions and expenses by operator."],
  reports: ["Reports", "Operator conversion and expense breakdowns."],
  settings: ["Settings", "Manage your preferences and account security."],
};

function TransactionList({ transactions, isLoading }) {
  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">↔</div>
        <h3>No transactions yet</h3>
        <p>Add your first transaction to start tracking.</p>
      </div>
    );
  }

  return transactions.map((transaction) => {
    const typeData = transactionTypes[transaction.category] ?? {
      icon: "•",
      color: "blue",
    };
    const isExpense = transaction.category === "Expense";

    return (
      <article className="transaction-row" key={transaction._id}>
        <div className={`category-icon ${typeData.color}`}>
          {typeData.icon}
        </div>
        <div className="transaction-detail">
          <strong>{transaction.description || transaction.to}</strong>
          <span>
            {transaction.category} · Operator: {transaction.from || "Unknown"}
          </span>
        </div>
        <div className="transaction-stamp">
          <time dateTime={transaction.date || transaction.createdAt}>
            {formatTransactionDate(transaction)}
          </time>
          <strong className={isExpense ? "amount expense" : "amount income"}>
            {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
          </strong>
        </div>
      </article>
    );
  });
}

function TransactionTypeSummaryCards({ summary, reportTotals, currencies }) {
  const cards = [
    {
      type: "Expense",
      totalKey: "expenses",
      countKey: "expenseCount",
      className: "expense-summary-card",
    },
    {
      type: "Conversion",
      totalKey: "conversions",
      countKey: "conversionCount",
      className: "conversion-summary-card",
    },
  ];

  return (
    <section
      className="summary-grid type-summary-grid"
      aria-label="Transaction summary"
    >
      {cards.map((card) => {
        const totalCount = currencies.reduce(
          (total, currency) => total + summary[currency][card.countKey],
          0,
        );

        return (
          <article
            className={`summary-card type-summary-card ${card.className}`}
            key={card.type}
          >
            <div className="type-summary-heading">
              <div className="type-summary-label">
                <span>Total {card.type}</span>
              </div>
              <div>
                <strong>{totalCount}</strong>
                <small>transactions</small>
              </div>
            </div>
            <div className="currency-table-wrap">
              <table className="currency-table">
                <thead>
                  <tr>
                    <th>{reportTotals ? "Summary" : "Currency"}</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportTotals
                    ? [
                        ["ETB", reportTotals[card.type].etb, "ETB"],
                        ["USD", reportTotals[card.type].usd, "USD"],
                      ].map(([label, value, currency]) => (
                        <tr key={label}>
                          <th scope="row">{label}</th>
                          <td>{formatCurrency(value, currency)}</td>
                        </tr>
                      ))
                    : currencies.map((currency) => (
                        <tr key={currency}>
                          <th scope="row">{currency}</th>
                          <td>
                            {formatCurrency(
                              summary[currency][card.totalKey],
                              currency,
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionForm, setTransactionForm] = useState(
    initialTransactionForm,
  );
  const [dateFilter, setDateFilter] = useState({
    mode: "all",
    date: toDateInputValue(new Date()),
    from: "",
    to: "",
  });
  const [activeSection, setActiveSection] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const profileRef = useRef(null);
  const importInputRef = useRef(null);
  const { pipelines, currencies } = configuration;

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch("/api/session");
        setIsSignedIn(response.ok);
      } catch {
        setIsSignedIn(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;

    const loadTransactions = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Could not load your transactions.");
        setTransactions(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    const loadSettings = async () => {
      try {
        const response = await fetch(SETTINGS_URL);
        if (!response.ok) throw new Error("Could not load your settings.");
        const savedSettings = await response.json();
        setSettings(savedSettings);
      } catch (err) {
        setError(err.message);
      }
    };

    loadSettings();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    const loadConfiguration = async () => {
      try {
        const response = await fetch(CONFIGURATION_URL);
        if (!response.ok) throw new Error("Could not load configuration.");
        const savedConfiguration = await response.json();
        setConfiguration(savedConfiguration);
        setTransactionForm((current) => ({
          ...current,
          from: savedConfiguration.pipelines.includes(current.from)
            ? current.from
            : savedConfiguration.pipelines[0],
          currency: savedConfiguration.currencies.includes(current.currency)
            ? current.currency
            : savedConfiguration.currencies[0],
        }));
      } catch (err) {
        setError(err.message);
      }
    };

    loadConfiguration();
  }, [isSignedIn]);

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (dateFilter.mode === "all") return transactions;
    if (dateFilter.mode !== "range" && !dateFilter.date) return transactions;

    let start;
    let end;

    if (dateFilter.mode === "range") {
      start = dateFilter.from ? new Date(`${dateFilter.from}T00:00:00`) : null;
      end = dateFilter.to ? new Date(`${dateFilter.to}T23:59:59.999`) : null;
    } else {
      const selectedDate = new Date(`${dateFilter.date}T00:00:00`);
      if (dateFilter.mode === "date") {
        start = selectedDate;
        end = new Date(selectedDate);
      } else if (dateFilter.mode === "week") {
        const dayFromMonday = (selectedDate.getDay() + 6) % 7;
        start = new Date(selectedDate);
        start.setDate(selectedDate.getDate() - dayFromMonday);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
      } else {
        start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        end = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0,
        );
      }
      end.setHours(23, 59, 59, 999);
    }

    return transactions.filter((transaction) => {
      const transactionDate = getTransactionDate(transaction);
      if (!transactionDate) return false;
      return (
        (!start || transactionDate >= start) &&
        (!end || transactionDate <= end)
      );
    });
  }, [dateFilter, transactions]);

  const currencySummary = useMemo(
    () =>
      currencies.reduce((summary, currency) => {
        const items = filteredTransactions.filter(
          (transaction) => (transaction.currency || "USD") === currency,
        );
        const totalFor = (type) =>
          items
            .filter((transaction) => transaction.category === type)
            .reduce(
              (total, transaction) => total + Math.abs(transaction.amount),
              0,
            );

        summary[currency] = {
          conversions: totalFor("Conversion"),
          expenses: totalFor("Expense"),
          conversionCount: items.filter(
            (transaction) => transaction.category === "Conversion",
          ).length,
          expenseCount: items.filter(
            (transaction) => transaction.category === "Expense",
          ).length,
          total: items.reduce(
            (total, transaction) => total + Math.abs(transaction.amount),
            0,
          ),
        };
        return summary;
      }, {}),
    [currencies, filteredTransactions],
  );

  const operatorSummary = useMemo(() => {
    const operatorNames = [
      ...new Set([
        ...pipelines,
        ...filteredTransactions
          .map((transaction) => transaction.from)
          .filter(Boolean),
      ]),
    ];

    return operatorNames.map((name, index) => {
      const items = filteredTransactions.filter(
        (transaction) => transaction.from === name,
      );
      const latestRateTransaction = items.reduce((latest, transaction) => {
        const transactionDate = getTransactionDate(transaction)?.getTime() || 0;
        const latestDate = latest
          ? getTransactionDate(latest)?.getTime() || 0
          : 0;
        return transactionDate >= latestDate ? transaction : latest;
      }, null);
      const totalsFor = (type) =>
        currencies.reduce((totals, currency) => {
          totals[currency] = items
            .filter(
              (transaction) =>
                transaction.category === type &&
                (transaction.currency || "USD") === currency,
            )
            .reduce(
              (total, transaction) => total + Math.abs(transaction.amount),
              0,
            );
          return totals;
        }, {});
      return {
        name,
        icon: operatorIcons[name] || name[0]?.toUpperCase() || "O",
        color: ["orange", "purple", "blue", "pink", "green"][index % 5],
        count: items.length,
        rate: Number(latestRateTransaction?.rate || 1),
        conversions: totalsFor("Conversion"),
        expenses: totalsFor("Expense"),
      };
    });
  }, [currencies, filteredTransactions, pipelines]);

  const dailySummary = useMemo(() => {
    const summaries = filteredTransactions.reduce((byDate, transaction) => {
      if ((transaction.currency || "USD") !== "ETB") return byDate;

      const transactionDate = getTransactionDate(transaction);
      if (!transactionDate) return byDate;

      const date = toDateInputValue(transactionDate);
      const amount = Math.abs(Number(transaction.amount) || 0);
      const transactionRate = Number(transaction.rate);
      const rate =
        Number.isFinite(transactionRate) && transactionRate > 0
          ? transactionRate
          : 1;
      const summary = byDate.get(date) || {
        date,
        conversions: 0,
        expenses: 0,
        total: 0,
      };

      if (transaction.category === "Conversion") {
        summary.conversions += amount;
      } else if (transaction.category === "Expense") {
        summary.expenses += amount;
      }
      summary.total += amount / rate;
      byDate.set(date, summary);
      return byDate;
    }, new Map());

    return [...summaries.values()].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [filteredTransactions]);

  const reportCardTotals = useMemo(() => {
    const totals = {
      Expense: { etb: 0, usd: 0 },
      Conversion: { etb: 0, usd: 0 },
    };

    filteredTransactions.forEach((transaction) => {
      const categoryTotals = totals[transaction.category];
      if (!categoryTotals) return;

      const currency = transaction.currency || "USD";
      const amount = Math.abs(Number(transaction.amount) || 0);
      if (currency === "ETB") {
        categoryTotals.etb += amount;
      } else if (currency === "USD") {
        categoryTotals.usd += amount;
      }
    });

    return totals;
  }, [filteredTransactions]);

  const monthlyIncomeLeaders = useMemo(() => {
    const monthlyOperators = new Map();

    filteredTransactions
      .filter((transaction) => transaction.category === "Conversion")
      .forEach((transaction) => {
        const transactionDate = getTransactionDate(transaction);
        if (!transactionDate) return;

        const month = toDateInputValue(transactionDate).slice(0, 7);
        const operator = transaction.from || "Unknown";
        const currency = transaction.currency || "USD";
        const amount = Math.abs(Number(transaction.amount) || 0);
        const transactionRate = Number(transaction.rate);
        const rate =
          Number.isFinite(transactionRate) && transactionRate > 0
            ? transactionRate
            : 1;
        const income = currency === "ETB" ? amount / rate : amount;
        const operators = monthlyOperators.get(month) || new Map();
        const operatorTotal = operators.get(operator) || {
          operator,
          income: 0,
          count: 0,
        };

        operatorTotal.income += income;
        operatorTotal.count += 1;
        operators.set(operator, operatorTotal);
        monthlyOperators.set(month, operators);
      });

    return [...monthlyOperators.entries()]
      .map(([month, operators]) => ({
        month,
        leader: [...operators.values()].sort(
          (a, b) => b.income - a.income,
        )[0],
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [filteredTransactions]);

  const activeOperators = operatorSummary.filter((operator) => operator.count);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (
      !transactionForm.amount ||
      Number(transactionForm.amount) <= 0 ||
      !transactionForm.to.trim()
    ) {
      setError("Add a receiver and an amount greater than zero.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...transactionForm,
          amount: Number(transactionForm.amount),
          rate: Number(transactionForm.rate || 1),
          to: transactionForm.to.trim(),
          notes: transactionForm.notes.trim(),
        }),
      });
      if (!response.ok) throw new Error("Could not save that transaction.");
      const savedTransaction = await response.json();
      setTransactions((current) => [savedTransaction, ...current]);
      setTransactionForm((current) => ({
        ...initialTransactionForm,
        date: current.date,
        from: current.from,
        currency: current.currency,
      }));
      setNotice("Transaction added successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const openNewTransaction = () => {
    setActiveSection("transactions");
    window.setTimeout(() => document.querySelector("#amount")?.focus(), 0);
  };

  const updateTransactionForm = (event) => {
    const { name, value } = event.target;
    setTransactionForm((current) => ({ ...current, [name]: value }));
  };

  const downloadTransactions = () => {
    const rows = filteredTransactions.map((transaction) =>
      csvColumns
        .map((column) => {
          if (column === "date") {
            return escapeCsvValue(
              transaction.date
                ? new Date(transaction.date).toISOString().split("T")[0]
                : "",
            );
          }
          return escapeCsvValue(transaction[column]);
        })
        .join(","),
    );
    const csv = [csvColumns.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTransactions = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setNotice("");
    setIsImporting(true);

    try {
      const rows = parseCsv(await file.text());
      const headers = rows.shift()?.map((header) => header.trim());
      if (!headers || !csvColumns.every((column) => headers.includes(column))) {
        throw new Error("CSV columns do not match the transaction export format.");
      }

      const importedTransactions = rows.map((row, index) => {
        const item = Object.fromEntries(
          headers.map((header, columnIndex) => [
            header,
            row[columnIndex]?.trim() ?? "",
          ]),
        );
        const amount = Number(item.amount);
        const rate = Number(item.rate || 1);

        if (
          !item.date ||
          !["Expense", "Conversion"].includes(item.category) ||
          !pipelines.includes(item.from) ||
          !item.inChargeOfWithdrawal ||
          !item.to ||
          !Number.isFinite(amount) ||
          amount <= 0 ||
          !currencies.includes(item.currency) ||
          !Number.isFinite(rate) ||
          rate <= 0
        ) {
          throw new Error(`Invalid transaction data on CSV row ${index + 2}.`);
        }

        return {
          ...item,
          amount,
          rate,
          status: item.status === "Pending" ? "Pending" : "Completed",
        };
      });

      if (!importedTransactions.length) {
        throw new Error("The selected CSV file has no transactions.");
      }

      const savedTransactions = [];
      for (const transaction of importedTransactions) {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        });
        if (!response.ok) throw new Error("Could not save an imported transaction.");
        savedTransactions.push(await response.json());
      }

      setTransactions((current) => [...savedTransactions.reverse(), ...current]);
      setNotice(`${savedTransactions.length} transactions imported successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Could not sign in.");
      }

      setLoginForm({ username: "", password: "" });
      setIsSignedIn(true);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    setLoginForm({ username: "", password: "" });
    setNotice("");
    setTransactions([]);
    setSettings(initialSettings);
    setConfiguration(initialConfiguration);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsSignedIn(false);
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsPasswordSaving(true);
    try {
      const response = await fetch("/api/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Could not update password.");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setResetOpen(false);
      setNotice("Password updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const persistSettings = async (nextSettings, message = "Settings saved.") => {
    const response = await fetch(SETTINGS_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSettings),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const details = Array.isArray(result.details)
        ? ` ${result.details.join(" ")}`
        : "";
      throw new Error(`${result.error || "Could not save settings."}${details}`);
    }

    setSettings(result);
    setNotice(message);
    return result;
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      await persistSettings({
        ...settings,
        name: settings.name.trim(),
        email: settings.email.trim(),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const savePreference = async (field, value) => {
    const previousSettings = settings;
    const nextSettings = { ...settings, [field]: value };
    setSettings(nextSettings);
    setError("");
    setNotice("");

    try {
      await persistSettings(nextSettings, "Preferences saved.");
    } catch (err) {
      setSettings(previousSettings);
      setError(err.message);
    }
  };

  if (isCheckingSession) {
    return (
      <main className="login-page">
        <section className="login-card">
          <p className="subtitle">Checking your session...</p>
        </section>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand login-brand">
            <img className="brand-mark" src={lpLogo} alt="" />
            <span>LP Finance</span>
          </div>
          <p className="eyebrow">Operator access</p>
          <h1>Sign in</h1>
          <p className="subtitle">Enter your account credentials to continue.</p>
          {loginError && (
            <div className="alert login-alert" role="alert">
              <span>!</span>
              {loginError}
            </div>
          )}
          <form className="login-form" onSubmit={handleSignIn}>
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              required
              value={loginForm.username}
              onChange={(event) =>
                setLoginForm({ ...loginForm, username: event.target.value })
              }
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm({ ...loginForm, password: event.target.value })
              }
            />
            <button className="submit-button" type="submit">
              Sign in <span>→</span>
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          type="button"
          onClick={() => setActiveSection("overview")}
        >
          <img className="brand-mark" src={lpLogo} alt="" />
          <span>LP Finance</span>
        </button>

        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              type="button"
              key={item.id}
              onClick={() => setActiveSection(item.id)}
            >
              <span className={`nav-icon ${item.color}`}>{item.icon}</span>{" "}
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="sidebar-footer"
          type="button"
          onClick={() => setActiveSection("settings")}
        >
          <img className="profile-avatar" src={lpLogo} alt="" />
          <div>
            <strong>{settings.name}</strong>
            <span>Business account</span>
          </div>
          <span className="footer-arrow">›</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Personal finance</p>
            <h1>{sectionCopy[activeSection][0]}</h1>
            <p className="subtitle">{sectionCopy[activeSection][1]}</p>
          </div>
          <div className="topbar-actions">
            {activeSection === "transactions" && (
              <button
                className="header-action"
                type="button"
                onClick={openNewTransaction}
              >
                <span>+</span> Add transaction
              </button>
            )}
            <div className="profile-menu-wrap" ref={profileRef}>
              <button
                className="top-profile"
                type="button"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((current) => !current)}
              >
                <img src={lpLogo} alt="" />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <strong>{settings.name}</strong>
                    <span>{settings.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("settings");
                      setProfileOpen(false);
                    }}
                  >
                    ⚙ Account settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetOpen(true);
                      setProfileOpen(false);
                    }}
                  >
                    ● Change password
                  </button>
                  <button
                    className="signout"
                    type="button"
                    onClick={handleSignOut}
                  >
                    ↪ Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="alert" role="alert">
            <span>!</span>
            {error}
            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}
        {notice && (
          <div className="alert success-alert" role="status">
            <span>✓</span>
            {notice}
            <button type="button" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}

        {activeSection !== "settings" && (
          <section className="date-filter" aria-label="Filter data by date">
            <div className="date-filter-modes">
              {[
                ["all", "All"],
                ["date", "Date"],
                ["week", "Weekly"],
                ["month", "Monthly"],
                ["range", "Range"],
              ].map(([mode, label]) => (
                <button
                  className={dateFilter.mode === mode ? "active" : ""}
                  type="button"
                  key={mode}
                  aria-pressed={dateFilter.mode === mode}
                  onClick={() =>
                    setDateFilter((current) => ({ ...current, mode }))
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {["date", "week", "month"].includes(dateFilter.mode) && (
              <label>
                Based on
                <input
                  type="date"
                  value={dateFilter.date}
                  onChange={(event) =>
                    setDateFilter((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                />
              </label>
            )}
            {dateFilter.mode === "range" && (
              <div className="date-range-fields">
                <label>
                  From
                  <input
                    type="date"
                    value={dateFilter.from}
                    max={dateFilter.to || undefined}
                    onChange={(event) =>
                      setDateFilter((current) => ({
                        ...current,
                        from: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={dateFilter.to}
                    min={dateFilter.from || undefined}
                    onChange={(event) =>
                      setDateFilter((current) => ({
                        ...current,
                        to: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            )}
            <span className="date-filter-count">
              {filteredTransactions.length} of {transactions.length} transactions
            </span>
          </section>
        )}

        {activeSection === "overview" && (
          <>
            <TransactionTypeSummaryCards
              summary={currencySummary}
              currencies={currencies}
            />
            <div className="content-grid">
              <section className="panel transaction-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Activity</p>
                    <h2>Recent transactions</h2>
                  </div>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setActiveSection("transactions")}
                  >
                    View all →
                  </button>
                </div>
                <div className="transaction-list">
                  <TransactionList
                    transactions={filteredTransactions.slice(0, 5)}
                    isLoading={isLoading}
                  />
                </div>
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Operators</p>
                    <h2>Operator activity</h2>
                  </div>
                </div>
                <div className="compact-categories">
                  {activeOperators
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 4)
                    .map((item) => (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setActiveSection("operators")}
                      >
                        <span className={`category-icon ${item.color}`}>
                          {item.icon}
                        </span>
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.count} transactions</small>
                        </span>
                        <strong>{item.count}</strong>
                      </button>
                    ))}
                </div>
              </section>
            </div>
          </>
        )}

        {activeSection === "transactions" && (
          <div className="content-grid">
            <section className="panel transaction-panel">
              <div className="panel-heading form-heading">
                <div>
                  <p className="eyebrow">All activity</p>
                  <h2>Transactions</h2>
                </div>
                <div className="transaction-tools">
                  <span className="transaction-count">
                    {filteredTransactions.length} shown
                  </span>
                  <button
                    className="data-button"
                    type="button"
                    onClick={downloadTransactions}
                    disabled={!filteredTransactions.length}
                  >
                    Download CSV
                  </button>
                  <button
                    className="data-button"
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    {isImporting ? "Importing..." : "Import CSV"}
                  </button>
                  <input
                    className="visually-hidden"
                    ref={importInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={importTransactions}
                  />
                </div>
              </div>
              <div className="transaction-list">
                <TransactionList
                  transactions={filteredTransactions}
                  isLoading={isLoading}
                />
              </div>
            </section>
            <section className="panel form-panel">
              <div className="panel-heading form-heading">
                <div>
                  <p className="eyebrow">Quick entry</p>
                  <h2>New transaction</h2>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={transactionForm.date}
                  onChange={updateTransactionForm}
                />
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 1000"
                  required
                  value={transactionForm.amount}
                  onChange={updateTransactionForm}
                />
                <label htmlFor="category">Transaction Type</label>
                <select
                  id="category"
                  name="category"
                  value={transactionForm.category}
                  onChange={updateTransactionForm}
                >
                  <option value="Expense">Expense</option>
                  <option value="Conversion">Conversion</option>
                </select>
                <label htmlFor="from">Operator</label>
                <select
                  id="from"
                  name="from"
                  value={transactionForm.from}
                  onChange={updateTransactionForm}
                >
                  {pipelines.map((operator) => (
                    <option value={operator} key={operator}>
                      {operator}
                    </option>
                  ))}
                </select>
                <label htmlFor="inChargeOfWithdrawal">
                  Ordered By
                </label>
                <input
                  id="inChargeOfWithdrawal"
                  name="inChargeOfWithdrawal"
                  type="text"
                  placeholder="e.g. Operator name"
                  required
                  value={transactionForm.inChargeOfWithdrawal}
                  onChange={updateTransactionForm}
                />
                <label htmlFor="to">To (Receiver)</label>
                <input
                  id="to"
                  name="to"
                  type="text"
                  placeholder="e.g. Company"
                  required
                  value={transactionForm.to}
                  onChange={updateTransactionForm}
                />
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={transactionForm.currency}
                  onChange={updateTransactionForm}
                >
                  {currencies.map((currency) => (
                    <option value={currency} key={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                <label htmlFor="rate">Exchange Rate</label>
                <input
                  id="rate"
                  name="rate"
                  type="number"
                  min="0.000001"
                  step="0.01"
                  value={transactionForm.rate}
                  onChange={updateTransactionForm}
                />
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={transactionForm.status}
                  onChange={updateTransactionForm}
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
                <label htmlFor="notes">Notes</label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  placeholder="Additional details..."
                  value={transactionForm.notes}
                  onChange={updateTransactionForm}
                />
                <button
                  className="submit-button"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Add transaction"}
                  <span>→</span>
                </button>
              </form>
            </section>
          </div>
        )}

        {activeSection === "operators" && (
          <section className="category-grid">
            {operatorSummary.map((item) => (
              <article className="panel category-card" key={item.name}>
                <div className={`category-icon ${item.color}`}>{item.icon}</div>
                <div className="category-card-heading">
                  <div>
                    <h2>{item.name}</h2>
                    <span>{item.count} transactions</span>
                  </div>
                  <strong>{item.count} total</strong>
                </div>
                <div className="operator-totals">
                  {currencies.map((currency) => (
                    <div key={currency}>
                      <span>{currency}</span>
                      <strong>
                        {formatCurrency(item.conversions[currency], currency)}
                      </strong>
                      <small>Conversions</small>
                      <strong>
                        {formatCurrency(item.expenses[currency], currency)}
                      </strong>
                      <small>Expenses</small>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {activeSection === "reports" && (
          <>
            <TransactionTypeSummaryCards
              summary={currencySummary}
              reportTotals={reportCardTotals}
              currencies={currencies}
            />
            <section className="panel monthly-leaders-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Monthly performance</p>
                  <h2>Income leaders</h2>
                </div>
              </div>
              {monthlyIncomeLeaders.length > 0 ? (
                <div className="monthly-leaders-grid">
                  {monthlyIncomeLeaders.map(({ month, leader }) => (
                    <article className="monthly-leader-card" key={month}>
                      <time dateTime={month}>
                        {new Intl.DateTimeFormat("en-US", {
                          month: "long",
                          year: "numeric",
                          timeZone: "UTC",
                        }).format(new Date(`${month}-01T00:00:00Z`))}
                      </time>
                      <strong>{leader.operator}</strong>
                      <span>{formatCurrency(leader.income, "USD")}</span>
                      <small>{leader.count} conversions</small>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="monthly-leaders-empty">
                  No conversion income for the selected dates.
                </p>
              )}
            </section>
            <section className="panel report-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">By operator</p>
                  <h2>Operator conversions and expenses</h2>
                </div>
              </div>
              <div className="operator-table-wrap">
                <table className="operator-table">
                  <thead>
                    <tr>
                      <th>Operator</th>
                      <th>Rate</th>
                      <th>Conversions</th>
                      <th>Expenses</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorSummary.map((item) => (
                      <tr key={item.name}>
                        <th>
                          <span className={`category-icon ${item.color}`}>
                            {item.icon}
                          </span>
                          <span>{item.name}</span>
                        </th>
                        <td>
                          <span className="rate-badge">
                            {item.rate.toLocaleString("en-US", {
                              maximumFractionDigits: 4,
                            })}
                          </span>
                        </td>
                        <td>{formatCurrency(item.conversions.ETB, "ETB")}</td>
                        <td>{formatCurrency(item.expenses.ETB, "ETB")}</td>
                        <td className="operator-total">
                          <strong>
                            {formatCurrency(
                              item.conversions.ETB / item.rate +
                                item.expenses.ETB / item.rate,
                              "USD",
                            )}
                          </strong>
                        </td>
                      </tr>
                    ))}
                    {dailySummary.length > 0 && (
                      <tr className="daily-summary-heading">
                        <th colSpan="5">Daily totals</th>
                      </tr>
                    )}
                    {dailySummary.map((item) => (
                      <tr className="daily-summary-row" key={item.date}>
                        <th>{formatTransactionDate({ date: item.date })}</th>
                        <td aria-label="Rate not totaled">—</td>
                        <td>{formatCurrency(item.conversions, "ETB")}</td>
                        <td>{formatCurrency(item.expenses, "ETB")}</td>
                        <td className="operator-total">
                          <strong>{formatCurrency(item.total, "USD")}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeSection === "settings" && (
          <div className="settings-grid">
            <form className="panel settings-panel" onSubmit={saveSettings}>
              <div className="panel-heading form-heading">
                <div>
                  <p className="eyebrow">Profile</p>
                  <h2>Personal information</h2>
                </div>
              </div>
              <div className="settings-body">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  value={settings.name}
                  onChange={(event) =>
                    setSettings({ ...settings, name: event.target.value })
                  }
                />
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(event) =>
                    setSettings({ ...settings, email: event.target.value })
                  }
                />
                <button className="submit-button" type="submit">
                  Save changes <span>→</span>
                </button>
              </div>
            </form>
            <div className="panel settings-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Preferences</p>
                  <h2>Notifications & security</h2>
                </div>
              </div>
              <div className="settings-body">
                <label className="toggle-row">
                  <span>
                    <strong>Weekly summary</strong>
                    <small>Receive your spending recap by email.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.weeklySummary}
                    onChange={(event) =>
                      savePreference("weeklySummary", event.target.checked)
                    }
                  />
                </label>
                <label className="toggle-row">
                  <span>
                    <strong>Transaction alerts</strong>
                    <small>Get notified about new activity.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.transactionAlerts}
                    onChange={(event) =>
                      savePreference("transactionAlerts", event.target.checked)
                    }
                  />
                </label>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setResetOpen(true);
                  }}
                >
                  Change password
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {resetOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setResetOpen(false)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setResetOpen(false)}
            >
              ×
            </button>
            <div className="modal-icon">●</div>
            <h2 id="reset-title">Change your password</h2>
            <p>Your new password must contain between 12 and 256 characters.</p>
            <form onSubmit={handlePasswordChange}>
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                required
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: event.target.value,
                  })
                }
              />
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength="12"
                maxLength="256"
                required
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: event.target.value,
                  })
                }
              />
              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength="12"
                maxLength="256"
                required
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: event.target.value,
                  })
                }
              />
              <button
                className="submit-button"
                type="submit"
                disabled={isPasswordSaving}
              >
                {isPasswordSaving ? "Updating..." : "Update password"}{" "}
                <span>→</span>
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;

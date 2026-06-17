import { useEffect, useMemo, useRef, useState } from "react";
import {
  createInitialTransactionForm,
  csvColumns,
  initialConfiguration,
  initialSettings,
} from "../content";
import {
  authService,
  configurationService,
  settingsService,
  transactionsService,
} from "../services";
import {
  createCurrencySummary,
  createDailySummary,
  createMonthlyIncomeLeaders,
  createOperatorSummary,
  createReportCardTotals,
  escapeCsvValue,
  filterTransactionsByDate,
  parseCsv,
  toDateInputValue,
} from "../util";
import { FinanceContext } from "./financeContext";

const createInitialDateFilter = () => ({
  mode: "all",
  date: toDateInputValue(new Date()),
  from: "",
  to: "",
});

const getErrorMessage = (err, fallback) => {
  const details = Array.isArray(err?.details) ? ` ${err.details.join(" ")}` : "";
  return `${err?.message || fallback}${details}`;
};

export function FinanceProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionForm, setTransactionForm] = useState(() =>
    createInitialTransactionForm(),
  );
  const [dateFilter, setDateFilter] = useState(() => createInitialDateFilter());
  const [activeSection, setActiveSection] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const importInputRef = useRef(null);
  const { pipelines, currencies } = configuration;

  useEffect(() => {
    const restoreSession = async () => {
      try {
        setIsSignedIn(await authService.checkSession());
      } catch {
        setIsSignedIn(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    let isCurrent = true;

    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const loadedTransactions = await transactionsService.getTransactions();
        if (isCurrent) setTransactions(loadedTransactions);
      } catch (err) {
        if (isCurrent) {
          setError(getErrorMessage(err, "Could not load your transactions."));
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadTransactions();
    return () => {
      isCurrent = false;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    let isCurrent = true;

    const loadSettings = async () => {
      try {
        const savedSettings = await settingsService.getSettings();
        if (isCurrent) setSettings(savedSettings);
      } catch (err) {
        if (isCurrent) {
          setError(getErrorMessage(err, "Could not load your settings."));
        }
      }
    };

    loadSettings();
    return () => {
      isCurrent = false;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    let isCurrent = true;

    const loadConfiguration = async () => {
      try {
        const savedConfiguration = await configurationService.getConfiguration();
        if (!isCurrent) return;

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
        if (isCurrent) {
          setError(getErrorMessage(err, "Could not load configuration."));
        }
      }
    };

    loadConfiguration();
    return () => {
      isCurrent = false;
    };
  }, [isSignedIn]);

  const filteredTransactions = useMemo(
    () => filterTransactionsByDate(transactions, dateFilter),
    [dateFilter, transactions],
  );

  const currencySummary = useMemo(
    () => createCurrencySummary(filteredTransactions, currencies),
    [currencies, filteredTransactions],
  );

  const operatorSummary = useMemo(
    () => createOperatorSummary(filteredTransactions, pipelines, currencies),
    [currencies, filteredTransactions, pipelines],
  );

  const dailySummary = useMemo(
    () => createDailySummary(filteredTransactions),
    [filteredTransactions],
  );

  const reportCardTotals = useMemo(
    () => createReportCardTotals(filteredTransactions),
    [filteredTransactions],
  );

  const monthlyIncomeLeaders = useMemo(
    () => createMonthlyIncomeLeaders(filteredTransactions),
    [filteredTransactions],
  );

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
      const savedTransaction = await transactionsService.createTransaction({
        ...transactionForm,
        amount: Number(transactionForm.amount),
        rate: Number(transactionForm.rate || 1),
        to: transactionForm.to.trim(),
        notes: transactionForm.notes.trim(),
      });
      setTransactions((current) => [savedTransaction, ...current]);
      setTransactionForm((current) => ({
        ...createInitialTransactionForm(),
        date: current.date,
        from: current.from,
        currency: current.currency,
      }));
      setNotice("Transaction added successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save that transaction."));
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

      const savedTransactions =
        await transactionsService.createTransactions(importedTransactions);
      setTransactions((current) => [...savedTransactions.reverse(), ...current]);
      setNotice(`${savedTransactions.length} transactions imported successfully.`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not import transactions."));
    } finally {
      setIsImporting(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      await authService.signIn(loginForm);
      setLoginForm({ username: "", password: "" });
      setIsSignedIn(true);
    } catch (err) {
      setLoginError(getErrorMessage(err, "Could not sign in."));
    }
  };

  const handleSignOut = async () => {
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
    await authService.signOut().catch(() => {});
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
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setResetOpen(false);
      setNotice("Password updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update password."));
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const persistSettings = async (nextSettings, message = "Settings saved.") => {
    const savedSettings = await settingsService.updateSettings(nextSettings);
    setSettings(savedSettings);
    setNotice(message);
    return savedSettings;
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
      setError(getErrorMessage(err, "Could not save settings."));
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
      setError(getErrorMessage(err, "Could not save settings."));
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        activeOperators,
        activeSection,
        currencies,
        currencySummary,
        dailySummary,
        dateFilter,
        downloadTransactions,
        error,
        filteredTransactions,
        handlePasswordChange,
        handleSignIn,
        handleSignOut,
        handleSubmit,
        importInputRef,
        importTransactions,
        isCheckingSession,
        isImporting,
        isLoading,
        isPasswordSaving,
        isSaving,
        isSignedIn,
        loginError,
        loginForm,
        monthlyIncomeLeaders,
        notice,
        openNewTransaction,
        operatorSummary,
        passwordForm,
        pipelines,
        reportCardTotals,
        resetOpen,
        savePreference,
        saveSettings,
        setActiveSection,
        setDateFilter,
        setError,
        setLoginForm,
        setNotice,
        setPasswordForm,
        setResetOpen,
        setSettings,
        settings,
        transactionForm,
        transactions,
        updateTransactionForm,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

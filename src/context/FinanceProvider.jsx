import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createInitialTransactionForm,
  csvColumns,
  defaultOperatorPermissions,
  initialConfiguration,
  initialSettings,
  navItems,
} from "../content";
import {
  authService,
  configurationService,
  operatorsService,
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

const createInitialOperatorForm = (permissions = []) => ({
  username: "",
  password: "",
  active: true,
  permissions: defaultOperatorPermissions.filter((permission) =>
    permissions.includes(permission),
  ),
});

const sortOperators = (operators) =>
  [...operators].sort((a, b) => a.username.localeCompare(b.username));

const getErrorMessage = (err, fallback) => {
  const details = Array.isArray(err?.details) ? ` ${err.details.join(" ")}` : "";
  return `${err?.message || fallback}${details}`;
};

export function FinanceProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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
  const [isOperatorsLoading, setIsOperatorsLoading] = useState(false);
  const [isOperatorSaving, setIsOperatorSaving] = useState(false);
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
  const [operatorPermissions, setOperatorPermissions] = useState([]);
  const [operators, setOperators] = useState([]);
  const [operatorForm, setOperatorForm] = useState(() =>
    createInitialOperatorForm(),
  );
  const [editingOperatorId, setEditingOperatorId] = useState("");
  const importInputRef = useRef(null);
  const { pipelines, currencies } = configuration;

  const hasPermission = useCallback(
    (permission) =>
      currentUser?.role === "admin" ||
      Boolean(currentUser?.permissions?.includes(permission)),
    [currentUser],
  );

  const hasAnyPermission = useCallback(
    (permissions = []) =>
      !permissions.length || permissions.some((permission) => hasPermission(permission)),
    [hasPermission],
  );

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => hasAnyPermission(item.permissions || [])),
    [hasAnyPermission],
  );

  const canCreateTransactions = hasPermission("transactions:create");
  const canManageOperators = hasPermission("operators:manage");
  const canReadConfiguration = hasPermission("configuration:read");
  const canReadSettings = hasPermission("settings:read");
  const canUpdateSettings = hasPermission("settings:update");
  const canViewReports = hasPermission("reports:view");
  const canViewTransactions = hasAnyPermission([
    "transactions:read",
    "reports:view",
  ]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await authService.checkSession();
        setCurrentUser(session?.user || null);
        setIsSignedIn(Boolean(session?.authenticated));
      } catch {
        setCurrentUser(null);
        setIsSignedIn(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    if (visibleNavItems.some((item) => item.id === activeSection)) return;

    setActiveSection(visibleNavItems[0]?.id || "overview");
  }, [activeSection, isSignedIn, visibleNavItems]);

  useEffect(() => {
    if (!isSignedIn || !canViewTransactions) {
      setTransactions([]);
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
  }, [canViewTransactions, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn || !canReadSettings) {
      setSettings(initialSettings);
      return;
    }

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
  }, [canReadSettings, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn || !canReadConfiguration) {
      setConfiguration(initialConfiguration);
      return;
    }

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
  }, [canReadConfiguration, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn || !canManageOperators) {
      setOperators([]);
      setOperatorPermissions([]);
      setOperatorForm(createInitialOperatorForm());
      setEditingOperatorId("");
      setIsOperatorsLoading(false);
      return;
    }

    let isCurrent = true;

    const loadOperators = async () => {
      setIsOperatorsLoading(true);
      try {
        const data = await operatorsService.getOperators();
        if (!isCurrent) return;

        const permissions = data.permissions || [];
        setOperatorPermissions(permissions);
        setOperators(sortOperators(data.operators || []));
        setOperatorForm((current) => ({
          ...current,
          permissions: current.permissions.length
            ? current.permissions.filter((permission) =>
                permissions.includes(permission),
              )
            : createInitialOperatorForm(permissions).permissions,
        }));
      } catch (err) {
        if (isCurrent) {
          setError(getErrorMessage(err, "Could not load operators."));
        }
      } finally {
        if (isCurrent) setIsOperatorsLoading(false);
      }
    };

    loadOperators();
    return () => {
      isCurrent = false;
    };
  }, [canManageOperators, isSignedIn]);

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
    if (!canCreateTransactions) {
      setError("You do not have permission to create transactions.");
      return;
    }

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
      if (canViewTransactions) {
        setTransactions((current) => [savedTransaction, ...current]);
      }
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
    if (!canCreateTransactions) return;

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
    if (!canCreateTransactions) {
      setError("You do not have permission to import transactions.");
      return;
    }

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
      if (canViewTransactions) {
        setTransactions((current) => [...savedTransactions.reverse(), ...current]);
      }
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
      const session = await authService.signIn(loginForm);
      setLoginForm({ username: "", password: "" });
      setCurrentUser(session?.user || null);
      setIsSignedIn(Boolean(session?.authenticated));
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
    setCurrentUser(null);
    setOperators([]);
    setOperatorPermissions([]);
    setOperatorForm(createInitialOperatorForm());
    setEditingOperatorId("");
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
    if (!canUpdateSettings) {
      throw new Error("You do not have permission to update settings.");
    }

    const savedSettings = await settingsService.updateSettings(nextSettings);
    setSettings(savedSettings);
    setNotice(message);
    return savedSettings;
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!canUpdateSettings) {
      setError("You do not have permission to update settings.");
      return;
    }

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
    if (!canUpdateSettings) {
      setError("You do not have permission to update settings.");
      return;
    }

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

  const resetOperatorForm = () => {
    setEditingOperatorId("");
    setOperatorForm(createInitialOperatorForm(operatorPermissions));
  };

  const startEditingOperator = (operator) => {
    setEditingOperatorId(operator.id);
    setOperatorForm({
      username: operator.username,
      password: "",
      active: operator.active,
      permissions: operator.permissions || [],
    });
  };

  const toggleOperatorPermission = (permission, checked) => {
    setOperatorForm((current) => ({
      ...current,
      permissions: checked
        ? [...new Set([...current.permissions, permission])]
        : current.permissions.filter((item) => item !== permission),
    }));
  };

  const saveOperator = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!canManageOperators) {
      setError("You do not have permission to manage operators.");
      return;
    }

    if (!operatorForm.username.trim()) {
      setError("Operator username is required.");
      return;
    }

    if (!editingOperatorId && !operatorForm.password) {
      setError("Operator password is required.");
      return;
    }

    setIsOperatorSaving(true);
    try {
      const payload = {
        username: operatorForm.username.trim(),
        active: operatorForm.active,
        permissions: operatorForm.permissions,
      };

      if (operatorForm.password) payload.password = operatorForm.password;

      const savedOperator = editingOperatorId
        ? await operatorsService.updateOperator(editingOperatorId, payload)
        : await operatorsService.createOperator(payload);

      setOperators((current) =>
        sortOperators(
          editingOperatorId
            ? current.map((operator) =>
                operator.id === savedOperator.id ? savedOperator : operator,
              )
            : [...current, savedOperator],
        ),
      );
      resetOperatorForm();
      setNotice(
        editingOperatorId
          ? "Operator updated successfully."
          : "Operator created successfully.",
      );
    } catch (err) {
      setError(getErrorMessage(err, "Could not save operator."));
    } finally {
      setIsOperatorSaving(false);
    }
  };

  const setOperatorActive = async (operator, active) => {
    setError("");
    setNotice("");

    if (!canManageOperators) {
      setError("You do not have permission to manage operators.");
      return;
    }

    setIsOperatorSaving(true);
    try {
      const savedOperator = active
        ? await operatorsService.updateOperator(operator.id, { active: true })
        : await operatorsService.deactivateOperator(operator.id);

      setOperators((current) =>
        sortOperators(
          current.map((item) =>
            item.id === savedOperator.id ? savedOperator : item,
          ),
        ),
      );
      if (editingOperatorId === operator.id) resetOperatorForm();
      setNotice(active ? "Operator activated." : "Operator deactivated.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update operator."));
    } finally {
      setIsOperatorSaving(false);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        activeOperators,
        activeSection,
        canCreateTransactions,
        canManageOperators,
        canReadSettings,
        canUpdateSettings,
        canViewReports,
        canViewTransactions,
        currencies,
        currencySummary,
        currentUser,
        dailySummary,
        dateFilter,
        downloadTransactions,
        editingOperatorId,
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
        isOperatorSaving,
        isOperatorsLoading,
        isPasswordSaving,
        isSaving,
        isSignedIn,
        loginError,
        loginForm,
        monthlyIncomeLeaders,
        notice,
        openNewTransaction,
        operatorForm,
        operatorPermissions,
        operatorSummary,
        operators,
        passwordForm,
        pipelines,
        reportCardTotals,
        resetOpen,
        resetOperatorForm,
        savePreference,
        saveOperator,
        saveSettings,
        setActiveSection,
        setDateFilter,
        setError,
        setLoginForm,
        setNotice,
        setOperatorActive,
        setOperatorForm,
        setPasswordForm,
        setResetOpen,
        setSettings,
        settings,
        startEditingOperator,
        transactionForm,
        transactions,
        toggleOperatorPermission,
        updateTransactionForm,
        visibleNavItems,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

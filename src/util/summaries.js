import { operatorIcons } from "../content/appContent";
import { getTransactionDate, toDateInputValue } from "./dates";

export const filterTransactionsByDate = (transactions, dateFilter) => {
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
      end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
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
};

export const createCurrencySummary = (transactions, currencies) =>
  currencies.reduce((summary, currency) => {
    const items = transactions.filter(
      (transaction) => (transaction.currency || "USD") === currency,
    );
    const totalFor = (type) =>
      items
        .filter((transaction) => transaction.category === type)
        .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

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
  }, {});

export const createOperatorSummary = (transactions, pipelines, currencies) => {
  const operatorNames = [
    ...new Set([
      ...pipelines,
      ...transactions.map((transaction) => transaction.from).filter(Boolean),
    ]),
  ];

  return operatorNames.map((name, index) => {
    const items = transactions.filter((transaction) => transaction.from === name);
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
};

export const createDailySummary = (transactions) => {
  const summaries = transactions.reduce((byDate, transaction) => {
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

  return [...summaries.values()].sort((a, b) => b.date.localeCompare(a.date));
};

export const createReportCardTotals = (transactions) => {
  const totals = {
    Expense: { etb: 0, usd: 0 },
    Conversion: { etb: 0, usd: 0 },
  };

  transactions.forEach((transaction) => {
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
};

export const createMonthlyIncomeLeaders = (transactions) => {
  const monthlyOperators = new Map();

  transactions
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
      leader: [...operators.values()].sort((a, b) => b.income - a.income)[0],
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
};

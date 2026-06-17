export const formatCurrency = (value, currency = "USD") => {
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

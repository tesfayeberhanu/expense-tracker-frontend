import { formatCurrency } from "../util";

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

export default function TransactionTypeSummaryCards({
  summary,
  reportTotals,
  currencies,
}) {
  return (
    <section
      className="summary-grid type-summary-grid"
      aria-label="Transaction summary"
    >
      {cards.map((card) => {
        const totalCount = currencies.reduce(
          (total, currency) => total + (summary[currency]?.[card.countKey] || 0),
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
                              summary[currency]?.[card.totalKey],
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

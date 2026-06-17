import { TransactionTypeSummaryCards } from "../components";
import { useFinance } from "../context";
import { formatCurrency, formatTransactionDate } from "../util";

export default function ReportsPage() {
  const {
    currencies,
    currencySummary,
    dailySummary,
    monthlyIncomeLeaders,
    operatorSummary,
    reportCardTotals,
  } = useFinance();

  return (
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
  );
}

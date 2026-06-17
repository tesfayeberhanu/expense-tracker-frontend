import { TransactionList, TransactionTypeSummaryCards } from "../components";
import { useFinance } from "../context";

export default function OverviewPage() {
  const {
    activeOperators,
    currencies,
    currencySummary,
    filteredTransactions,
    isLoading,
    setActiveSection,
  } = useFinance();

  return (
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
            {[...activeOperators]
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
  );
}

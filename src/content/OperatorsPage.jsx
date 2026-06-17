import { useFinance } from "../context";
import { formatCurrency } from "../util";

export default function OperatorsPage() {
  const { currencies, operatorSummary } = useFinance();

  return (
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
  );
}

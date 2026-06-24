import { transactionTypes } from "../content";
import { formatCurrency, formatTransactionDate } from "../util";

export default function TransactionList({
  canEdit = false,
  isLoading,
  onEdit,
  transactions,
}) {
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

  return transactions.map((transaction, index) => {
    const typeData = transactionTypes[transaction.category] ?? {
      icon: "•",
      color: "blue",
    };
    const isExpense = transaction.category === "Expense";
    const key =
      transaction._id ||
      `${transaction.date || transaction.createdAt}-${transaction.to}-${index}`;

    return (
      <article className="transaction-row" key={key}>
        <div className={`category-icon ${typeData.color}`}>{typeData.icon}</div>
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
          {canEdit && (
            <button
              className="data-button transaction-edit-button"
              type="button"
              onClick={() => onEdit?.(transaction)}
            >
              Edit
            </button>
          )}
        </div>
      </article>
    );
  });
}

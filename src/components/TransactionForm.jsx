import { useFinance } from "../context";

export default function TransactionForm() {
  const {
    currencies,
    handleSubmit,
    isSaving,
    pipelines,
    transactionForm,
    updateTransactionForm,
  } = useFinance();

  return (
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
        <label htmlFor="inChargeOfWithdrawal">Ordered By</label>
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
        <button className="submit-button" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Add transaction"}
          <span>→</span>
        </button>
      </form>
    </section>
  );
}

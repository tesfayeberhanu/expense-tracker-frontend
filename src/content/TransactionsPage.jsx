import { TransactionForm, TransactionList } from "../components";
import { useFinance } from "../context";

export default function TransactionsPage() {
  const {
    downloadTransactions,
    filteredTransactions,
    importInputRef,
    importTransactions,
    isImporting,
    isLoading,
  } = useFinance();

  return (
    <div className="content-grid">
      <section className="panel transaction-panel">
        <div className="panel-heading form-heading">
          <div>
            <p className="eyebrow">All activity</p>
            <h2>Transactions</h2>
          </div>
          <div className="transaction-tools">
            <span className="transaction-count">
              {filteredTransactions.length} shown
            </span>
            <button
              className="data-button"
              type="button"
              onClick={downloadTransactions}
              disabled={!filteredTransactions.length}
            >
              Download CSV
            </button>
            <button
              className="data-button"
              type="button"
              onClick={() => importInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? "Importing..." : "Import CSV"}
            </button>
            <input
              className="visually-hidden"
              ref={importInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={importTransactions}
            />
          </div>
        </div>
        <div className="transaction-list">
          <TransactionList
            transactions={filteredTransactions}
            isLoading={isLoading}
          />
        </div>
      </section>
      <TransactionForm />
    </div>
  );
}

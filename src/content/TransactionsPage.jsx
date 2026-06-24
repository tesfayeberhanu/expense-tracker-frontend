import { TransactionForm, TransactionList } from "../components";
import { useFinance } from "../context";

export default function TransactionsPage() {
  const {
    canCreateTransactions,
    canUpdateTransactions,
    canViewTransactions,
    downloadTransactions,
    filteredTransactions,
    importInputRef,
    importTransactions,
    isImporting,
    isLoading,
    startEditingTransaction,
  } = useFinance();

  return (
    <div
      className={
        canCreateTransactions && canViewTransactions ? "content-grid" : ""
      }
    >
      {canViewTransactions && (
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
              {canCreateTransactions && (
                <>
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
                </>
              )}
            </div>
          </div>
          <div className="transaction-list">
            <TransactionList
              canEdit={canUpdateTransactions}
              transactions={filteredTransactions}
              isLoading={isLoading}
              onEdit={startEditingTransaction}
            />
          </div>
        </section>
      )}
      {canCreateTransactions && <TransactionForm />}
    </div>
  );
}

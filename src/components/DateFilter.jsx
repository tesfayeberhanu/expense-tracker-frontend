import { useFinance } from "../context";

const filterModes = [
  ["all", "All"],
  ["date", "Date"],
  ["week", "Weekly"],
  ["month", "Monthly"],
  ["range", "Range"],
];

export default function DateFilter() {
  const {
    dateFilter,
    filteredTransactions,
    setDateFilter,
    transactions,
  } = useFinance();

  return (
    <section className="date-filter" aria-label="Filter data by date">
      <div className="date-filter-modes">
        {filterModes.map(([mode, label]) => (
          <button
            className={dateFilter.mode === mode ? "active" : ""}
            type="button"
            key={mode}
            aria-pressed={dateFilter.mode === mode}
            onClick={() => setDateFilter((current) => ({ ...current, mode }))}
          >
            {label}
          </button>
        ))}
      </div>
      {["date", "week", "month"].includes(dateFilter.mode) && (
        <label>
          Based on
          <input
            type="date"
            value={dateFilter.date}
            onChange={(event) =>
              setDateFilter((current) => ({
                ...current,
                date: event.target.value,
              }))
            }
          />
        </label>
      )}
      {dateFilter.mode === "range" && (
        <div className="date-range-fields">
          <label>
            From
            <input
              type="date"
              value={dateFilter.from}
              max={dateFilter.to || undefined}
              onChange={(event) =>
                setDateFilter((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={dateFilter.to}
              min={dateFilter.from || undefined}
              onChange={(event) =>
                setDateFilter((current) => ({
                  ...current,
                  to: event.target.value,
                }))
              }
            />
          </label>
        </div>
      )}
      <span className="date-filter-count">
        {filteredTransactions.length} of {transactions.length} transactions
      </span>
    </section>
  );
}

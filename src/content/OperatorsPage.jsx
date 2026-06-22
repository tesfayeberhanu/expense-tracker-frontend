import { useFinance } from "../context";
import { permissionLabels } from "./appContent";
import { formatCurrency } from "../util";

export default function OperatorsPage() {
  const {
    canManageOperators,
    canViewReports,
    currencies,
    editingOperatorId,
    isOperatorSaving,
    isOperatorsLoading,
    operatorForm,
    operatorPermissions,
    operatorSummary,
    operators,
    resetOperatorForm,
    saveOperator,
    setOperatorActive,
    setOperatorForm,
    startEditingOperator,
    toggleOperatorPermission,
  } = useFinance();

  return (
    <div className="operators-layout">
      {canManageOperators && (
        <section className="panel operator-admin-panel">
          <div className="panel-heading form-heading">
            <div>
              <p className="eyebrow">Access control</p>
              <h2>Operator accounts</h2>
            </div>
          </div>
          <div className="operator-admin-grid">
            <form className="operator-form" onSubmit={saveOperator}>
              <label htmlFor="operator-username">Username</label>
              <input
                id="operator-username"
                value={operatorForm.username}
                onChange={(event) =>
                  setOperatorForm({
                    ...operatorForm,
                    username: event.target.value,
                  })
                }
              />

              <label htmlFor="operator-password">
                {editingOperatorId ? "New password" : "Password"}
              </label>
              <input
                id="operator-password"
                type="password"
                autoComplete="new-password"
                value={operatorForm.password}
                placeholder={editingOperatorId ? "Leave blank to keep current" : ""}
                onChange={(event) =>
                  setOperatorForm({
                    ...operatorForm,
                    password: event.target.value,
                  })
                }
              />

              <label className="toggle-row operator-active-toggle">
                <span>
                  <strong>Active account</strong>
                  <small>Inactive operators cannot sign in.</small>
                </span>
                <input
                  type="checkbox"
                  checked={operatorForm.active}
                  onChange={(event) =>
                    setOperatorForm({
                      ...operatorForm,
                      active: event.target.checked,
                    })
                  }
                />
              </label>

              <div className="permission-grid">
                {operatorPermissions.map((permission) => (
                  <label className="permission-option" key={permission}>
                    <input
                      type="checkbox"
                      checked={operatorForm.permissions.includes(permission)}
                      onChange={(event) =>
                        toggleOperatorPermission(permission, event.target.checked)
                      }
                    />
                    <span>{permissionLabels[permission] || permission}</span>
                  </label>
                ))}
              </div>

              <div className="operator-form-actions">
                <button
                  className="submit-button"
                  type="submit"
                  disabled={isOperatorSaving}
                >
                  {editingOperatorId ? "Update operator" : "Create operator"}
                  <span>→</span>
                </button>
                {editingOperatorId && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={resetOperatorForm}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>

            <div className="operator-access-list">
              {isOperatorsLoading ? (
                <div className="empty-state compact-empty">
                  <div className="spinner" />
                  <h3>Loading operators</h3>
                </div>
              ) : operators.length ? (
                operators.map((operator) => (
                  <article className="operator-access-row" key={operator.id}>
                    <div>
                      <strong>{operator.username}</strong>
                      <span>{operator.permissions.length} permissions</span>
                    </div>
                    <span
                      className={`status-badge ${
                        operator.active ? "active" : "inactive"
                      }`}
                    >
                      {operator.active ? "Active" : "Inactive"}
                    </span>
                    <div className="operator-actions">
                      <button
                        className="data-button"
                        type="button"
                        onClick={() => startEditingOperator(operator)}
                      >
                        Edit
                      </button>
                      <button
                        className="data-button"
                        type="button"
                        disabled={isOperatorSaving}
                        onClick={() =>
                          setOperatorActive(operator, !operator.active)
                        }
                      >
                        {operator.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state compact-empty">
                  <div className="empty-icon">◆</div>
                  <h3>No operators yet</h3>
                  <p>Create the first operator account.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {canViewReports && (
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
      )}
    </div>
  );
}

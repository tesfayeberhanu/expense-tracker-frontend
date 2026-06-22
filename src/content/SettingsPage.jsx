import { useFinance } from "../context";

export default function SettingsPage() {
  const {
    canUpdateSettings,
    savePreference,
    saveSettings,
    setPasswordForm,
    setResetOpen,
    setSettings,
    settings,
  } = useFinance();

  return (
    <div className="settings-grid">
      <form className="panel settings-panel" onSubmit={saveSettings}>
        <div className="panel-heading form-heading">
          <div>
            <p className="eyebrow">Profile</p>
            <h2>Personal information</h2>
          </div>
        </div>
        <div className="settings-body">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            value={settings.name}
            disabled={!canUpdateSettings}
            onChange={(event) =>
              setSettings({ ...settings, name: event.target.value })
            }
          />
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={settings.email}
            disabled={!canUpdateSettings}
            onChange={(event) =>
              setSettings({ ...settings, email: event.target.value })
            }
          />
          <button
            className="submit-button"
            type="submit"
            disabled={!canUpdateSettings}
          >
            Save changes <span>→</span>
          </button>
        </div>
      </form>
      <div className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Preferences</p>
            <h2>Notifications & security</h2>
          </div>
        </div>
        <div className="settings-body">
          <label className="toggle-row">
            <span>
              <strong>Weekly summary</strong>
              <small>Receive your spending recap by email.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.weeklySummary}
              disabled={!canUpdateSettings}
              onChange={(event) =>
                savePreference("weeklySummary", event.target.checked)
              }
            />
          </label>
          <label className="toggle-row">
            <span>
              <strong>Transaction alerts</strong>
              <small>Get notified about new activity.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.transactionAlerts}
              disabled={!canUpdateSettings}
              onChange={(event) =>
                savePreference("transactionAlerts", event.target.checked)
              }
            />
          </label>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setResetOpen(true);
            }}
          >
            Change password
          </button>
        </div>
      </div>
    </div>
  );
}

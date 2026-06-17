import { useFinance } from "../context";

export default function PasswordResetModal() {
  const {
    handlePasswordChange,
    isPasswordSaving,
    passwordForm,
    resetOpen,
    setPasswordForm,
    setResetOpen,
  } = useFinance();

  if (!resetOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={() => setResetOpen(false)}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={() => setResetOpen(false)}
        >
          ×
        </button>
        <div className="modal-icon">●</div>
        <h2 id="reset-title">Change your password</h2>
        <p>Your new password must contain between 12 and 256 characters.</p>
        <form onSubmit={handlePasswordChange}>
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: event.target.value,
              })
            }
          />
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength="12"
            maxLength="256"
            required
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm({
                ...passwordForm,
                newPassword: event.target.value,
              })
            }
          />
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength="12"
            maxLength="256"
            required
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: event.target.value,
              })
            }
          />
          <button
            className="submit-button"
            type="submit"
            disabled={isPasswordSaving}
          >
            {isPasswordSaving ? "Updating..." : "Update password"}{" "}
            <span>→</span>
          </button>
        </form>
      </section>
    </div>
  );
}

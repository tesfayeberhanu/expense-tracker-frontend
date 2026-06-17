export default function Alert({ message, onDismiss, type = "error" }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className={`alert ${isSuccess ? "success-alert" : ""}`} role={isSuccess ? "status" : "alert"}>
      <span>{isSuccess ? "✓" : "!"}</span>
      {message}
      <button type="button" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

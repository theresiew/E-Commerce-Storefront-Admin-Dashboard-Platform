export function LoadingState({
  title = "Loading data",
  message = "Please wait while we prepare your view.",
}) {
  return (
    <div className="panel state-card">
      <div className="spinner" />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

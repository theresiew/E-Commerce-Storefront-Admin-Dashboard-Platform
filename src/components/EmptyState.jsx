export function EmptyState({ title, message, action }) {
  return (
    <div className="panel state-card">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

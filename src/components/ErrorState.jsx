export function ErrorState({ title = "Something went wrong", message, action }) {
  return (
    <div className="panel state-card state-card-error">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

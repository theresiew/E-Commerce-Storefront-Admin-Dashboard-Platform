export function FormField({ label, error, hint, htmlFor, children }) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <div className="field-head">
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </div>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

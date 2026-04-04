import { titleCase } from "../utils/formatters";

export function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${String(status).toLowerCase()}`}>
      {titleCase(status)}
    </span>
  );
}

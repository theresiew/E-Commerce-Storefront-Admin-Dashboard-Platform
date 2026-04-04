import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="panel state-card">
      <span className="eyebrow">404</span>
      <h1>That page does not exist.</h1>
      <p>The route may have changed or the content is not available in this role.</p>
      <Link to="/" className="primary-button">
        Return home
      </Link>
    </div>
  );
}

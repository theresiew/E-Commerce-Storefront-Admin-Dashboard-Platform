import { Link } from "react-router-dom";
import { eyebrowClass, primaryButtonClass, sectionClass } from "../lib/ui";

export function NotFoundPage() {
  return (
    <div className={`${sectionClass} grid place-items-center gap-4 py-16 text-center`}>
      <span className={eyebrowClass}>404</span>
      <h1 className="text-4xl font-semibold text-ink-900">That page does not exist.</h1>
      <p className="max-w-xl text-sm leading-7 text-ink-500">
        The route may have changed or the content is not available in this role.
      </p>
      <Link to="/" className={primaryButtonClass}>
        Return home
      </Link>
    </div>
  );
}

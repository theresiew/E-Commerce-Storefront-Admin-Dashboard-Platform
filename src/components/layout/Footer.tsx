import { shellClass } from "../../lib/ui";

export function Footer() {
  return (
    <footer className="px-4 pb-6 sm:px-6 lg:px-8">
      <div className={`mx-auto flex w-full max-w-7xl flex-col gap-6 ${shellClass} p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6`}>
        <div className="max-w-xl">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.3em] text-mint-600">
            NovaCart
          </p>
          <h3 className="mt-3 text-xl font-semibold text-ink-900">
            Storefront and admin operations in one polished workspace.
          </h3>
        </div>
        <p className="max-w-md text-sm leading-7 text-ink-500">
          Responsive shopping flows, RBAC protection, validated checkout, and admin
          inventory management.
        </p>
      </div>
    </footer>
  );
}

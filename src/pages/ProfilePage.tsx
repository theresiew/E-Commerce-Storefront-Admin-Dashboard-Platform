import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useMyOrders } from "../hooks/useOrders";
import { eyebrowClass, sectionClass } from "../lib/ui";
import { formatCurrency } from "../utils/formatters";

export function ProfilePage() {
  const { user } = useAuth();
  const ordersQuery = useMyOrders();

  return (
    <div className="grid gap-6">
      <section className={`${sectionClass} grid gap-2`}>
        <span className={eyebrowClass}>My profile</span>
        <h1 className="text-4xl font-semibold text-ink-900">{user?.fullName}</h1>
        <p className="text-sm leading-7 text-ink-500">{user?.email}</p>
      </section>

      <section className={`${sectionClass} grid gap-5`}>
        <div>
          <span className={eyebrowClass}>Order history</span>
          <h2 className="mt-3 text-3xl font-semibold text-ink-900">
            Track every order you have placed.
          </h2>
        </div>

        {ordersQuery.isLoading ? <LoadingState title="Loading your orders" /> : null}
        {ordersQuery.isError ? (
          <ErrorState message="We could not fetch your order history." />
        ) : null}
        {!ordersQuery.isLoading && !ordersQuery.isError && ordersQuery.data.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="Complete checkout to start building your order history."
          />
        ) : null}

        {!ordersQuery.isLoading && !ordersQuery.isError && ordersQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                  <th className="px-4">Order</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Items</th>
                  <th className="px-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.data.map((order: any) => (
                  <tr key={order._id || order.id} className="rounded-[24px] bg-white/75 shadow-sm">
                    <td className="rounded-l-[24px] px-4 py-4 text-sm font-semibold text-ink-900">
                      {order._id || order.id}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status || "PENDING"} />
                    </td>
                    <td className="px-4 py-4 text-sm text-ink-500">{order.items?.length || 0}</td>
                    <td className="rounded-r-[24px] px-4 py-4 text-sm font-semibold text-ink-900">
                      {formatCurrency(order.totalPrice || order.total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

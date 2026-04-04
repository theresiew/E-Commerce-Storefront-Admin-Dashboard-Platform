import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useMyOrders } from "../hooks/useOrders";
import { formatCurrency } from "../utils/formatters";

export function ProfilePage() {
  const { user } = useAuth();
  const ordersQuery = useMyOrders();

  return (
    <div className="page-stack">
      <section className="panel profile-hero">
        <span className="eyebrow">My profile</span>
        <h1>{user?.fullName}</h1>
        <p>{user?.email}</p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Order history</span>
            <h2>Track every order you have placed.</h2>
          </div>
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
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.data.map((order) => (
                  <tr key={order._id || order.id}>
                    <td>{order._id || order.id}</td>
                    <td>
                      <StatusBadge status={order.status || "PENDING"} />
                    </td>
                    <td>{order.items?.length || 0}</td>
                    <td>{formatCurrency(order.totalPrice || order.total || 0)}</td>
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

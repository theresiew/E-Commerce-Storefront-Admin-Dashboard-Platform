import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../api/categories";
import { deleteProduct } from "../api/products";
import { updateOrderStatus } from "../api/orders";
import { ConfirmModal } from "../components/ConfirmModal";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FormField } from "../components/FormField";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";
import { ORDER_STATUSES } from "../utils/constants";
import { useCategories, useProducts } from "../hooks/useCatalog";
import { useAllOrders } from "../hooks/useOrders";
import { useAuth } from "../context/AuthContext";
import {
  removeDemoCategory,
  removeDemoProduct,
  updateDemoOrderStatus,
  upsertDemoCategory,
} from "../lib/demoAdmin";
import { formatCurrency, getErrorMessage } from "../utils/formatters";
import { categorySchema } from "../validation/schemas";

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { isMockAdmin } = useAuth();
  const [categoryBeingEdited, setCategoryBeingEdited] = useState(null);
  const [productPendingDelete, setProductPendingDelete] = useState(null);

  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const ordersQuery = useAllOrders();

  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const categoryMutation = useMutation({
    mutationFn: async (payload) => {
      if (isMockAdmin) {
        return upsertDemoCategory(payload, categoryBeingEdited);
      }

      if (categoryBeingEdited) {
        return updateCategory(categoryBeingEdited.id, payload);
      }

      return createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      categoryForm.reset({ name: "" });
      setCategoryBeingEdited(null);
      toast.success("Category saved successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to save category.")),
  });

  const productDeleteMutation = useMutation({
    mutationFn: (productId) => {
      if (isMockAdmin) {
        removeDemoProduct(productId);
        return Promise.resolve({ success: true });
      }

      return deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductPendingDelete(null);
      toast.success("Product deleted successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to delete product.")),
  });

  const orderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => {
      if (isMockAdmin) {
        updateDemoOrderStatus(orderId, status);
        return Promise.resolve({ success: true });
      }

      return updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "all"] });
      toast.success("Order status updated.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update order status.")),
  });

  const categoryDeleteMutation = useMutation({
    mutationFn: (categoryId) => {
      if (isMockAdmin) {
        removeDemoCategory(categoryId);
        return Promise.resolve({ success: true });
      }

      return deleteCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Category deleted.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to delete category.")),
  });

  const submitCategory = categoryForm.handleSubmit((values) => {
    categoryMutation.mutate(values);
  });

  const loading =
    productsQuery.isLoading || categoriesQuery.isLoading || ordersQuery.isLoading;
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const orders = Array.isArray(ordersQuery.data) ? ordersQuery.data : [];
  const sortedProducts = [...products].sort((left, right) =>
    String(left.title).localeCompare(String(right.title))
  );
  const sortedOrders = [...orders].sort((left, right) =>
    String(right._id || right.id).localeCompare(String(left._id || left.id))
  );

  if (loading) {
    return <LoadingState title="Loading admin dashboard" />;
  }

  if (productsQuery.isError && categoriesQuery.isError && ordersQuery.isError) {
    return (
      <ErrorState message="We could not load the admin dashboard. Check your API connection and admin authorization, then try again." />
    );
  }

  return (
    <div className="page-stack">
      <section className="admin-overview">
        <article className="panel metric-card">
          <span>Products</span>
          <strong>{products.length}</strong>
        </article>
        <article className="panel metric-card">
          <span>Categories</span>
          <strong>{categories.length}</strong>
        </article>
        <article className="panel metric-card">
          <span>Orders</span>
          <strong>{orders.length}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Inventory</span>
            <h1>Manage live stock and product listings.</h1>
          </div>
          <Link to="/admin/product/new" className="primary-button icon-button">
            <Plus size={16} />
            Add Product
          </Link>
        </div>

        {productsQuery.isError ? (
          <ErrorState message="Product inventory could not be loaded." />
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            title="No products available"
            message="Add the first product to start managing inventory."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product._id || product.id}>
                    <td>{product.title}</td>
                    <td>{product.category?.name || product.category || "General"}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          Number(product.stockQuantity ?? product.countInStock ?? 0) <= 5
                            ? "status-cancelled"
                            : "status-delivered"
                        }`}
                      >
                        {product.stockQuantity ?? product.countInStock ?? 0}
                      </span>
                    </td>
                    <td>
                      <div className="button-row">
                        <Link
                          to={`/admin/product/${product._id || product.id}/edit`}
                          className="ghost-button icon-button"
                        >
                          <PencilLine size={16} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="ghost-button icon-button"
                          onClick={() => setProductPendingDelete(product)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dashboard-split">
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Categories</span>
              <h2>Add, edit, and remove product groups.</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={submitCategory}>
            <FormField
              label="Category Name"
              htmlFor="category-name"
              error={categoryForm.formState.errors.name?.message}
            >
              <input id="category-name" type="text" {...categoryForm.register("name")} />
            </FormField>
            <div className="button-row">
              <button type="submit" className="primary-button" disabled={categoryMutation.isPending}>
                {categoryMutation.isPending
                  ? "Saving..."
                  : categoryBeingEdited
                    ? "Update Category"
                    : "Create Category"}
              </button>
              {categoryBeingEdited ? (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    categoryForm.reset({ name: "" });
                    setCategoryBeingEdited(null);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className="stack-list">
            {categoriesQuery.isError ? (
              <ErrorState message="Categories could not be loaded or updated right now." />
            ) : null}

            {!categoriesQuery.isError &&
              categories.map((category) => (
              <article key={category.id} className="list-card">
                <div>
                  <strong>{category.name}</strong>
                  <p>{category.id}</p>
                </div>
                <div className="button-row">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setCategoryBeingEdited(category);
                      categoryForm.reset({ name: category.name });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => categoryDeleteMutation.mutate(category.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Orders</span>
              <h2>Monitor fulfillment and update statuses.</h2>
            </div>
          </div>

          <div className="stack-list">
            {ordersQuery.isError ? (
              <ErrorState message="Orders could not be loaded. This usually means the current login is not a real backend admin token." />
            ) : sortedOrders.length === 0 ? (
              <EmptyState
                title="No orders found"
                message="When orders are available, you will manage their statuses here."
              />
            ) : (
              sortedOrders.map((order) => (
                <article key={order._id || order.id} className="list-card">
                  <div>
                    <div className="button-row">
                      <strong>{order._id || order.id}</strong>
                      <StatusBadge status={order.status || "PENDING"} />
                    </div>
                    <p>{order.user?.email || order.shippingAddress?.email || "Customer order"}</p>
                    <p>{formatCurrency(order.totalPrice || order.total || 0)}</p>
                  </div>
                  <select
                    className="status-select"
                    defaultValue={order.status || "PENDING"}
                    onChange={(event) =>
                      orderStatusMutation.mutate({
                        orderId: order._id || order.id,
                        status: event.target.value,
                      })
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      <ConfirmModal
        isOpen={Boolean(productPendingDelete)}
        title="Delete product"
        message={`Are you sure you want to remove "${productPendingDelete?.title}" from inventory?`}
        confirmLabel="Delete product"
        loading={productDeleteMutation.isPending}
        onCancel={() => setProductPendingDelete(null)}
        onConfirm={() =>
          productDeleteMutation.mutate(productPendingDelete._id || productPendingDelete.id)
        }
      />
    </div>
  );
}

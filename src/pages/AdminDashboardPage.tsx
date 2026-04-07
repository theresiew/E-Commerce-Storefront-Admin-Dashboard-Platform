import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { createCategory, deleteCategory, updateCategory } from "../api/categories";
import { deleteProduct } from "../api/products";
import { updateOrderStatus } from "../api/orders";
import { ConfirmModal } from "../components/ConfirmModal";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FormField } from "../components/FormField";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useCategories, useProducts } from "../hooks/useCatalog";
import { useAllOrders } from "../hooks/useOrders";
import {
  eyebrowClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionClass,
} from "../lib/ui";
import {
  removeDemoCategory,
  removeDemoProduct,
  updateDemoOrderStatus,
  upsertDemoCategory,
} from "../lib/demoAdmin";
import { ORDER_STATUSES } from "../utils/constants";
import { formatCurrency, getErrorMessage } from "../utils/formatters";
import { categorySchema } from "../validation/schemas";

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { isMockAdmin } = useAuth();
  const [categoryBeingEdited, setCategoryBeingEdited] = useState<any>(null);
  const [productPendingDelete, setProductPendingDelete] = useState<any>(null);

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
    mutationFn: async (payload: any) => {
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
    mutationFn: (productId: string) => {
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
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => {
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
    mutationFn: (categoryId: string) => {
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
    String(left.title).localeCompare(String(right.title)),
  );
  const sortedOrders = [...orders].sort((left, right) =>
    String(right._id || right.id).localeCompare(String(left._id || left.id)),
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
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Products", value: products.length },
          { label: "Categories", value: categories.length },
          { label: "Orders", value: orders.length },
        ].map((item) => (
          <article key={item.label} className={`${sectionClass} grid gap-2`}>
            <span className="text-sm font-medium text-ink-500">{item.label}</span>
            <strong className="text-4xl font-semibold text-ink-900">{item.value}</strong>
          </article>
        ))}
      </section>

      <section className={`${sectionClass} grid gap-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className={eyebrowClass}>Inventory</span>
            <h1 className="mt-3 text-4xl font-semibold text-ink-900">
              Manage live stock and product listings.
            </h1>
          </div>
          <Link to="/admin/product/new" className={primaryButtonClass}>
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
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                  <th className="px-4">Title</th>
                  <th className="px-4">Category</th>
                  <th className="px-4">Price</th>
                  <th className="px-4">Stock</th>
                  <th className="px-4" />
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product: any) => (
                  <tr key={product._id || product.id} className="bg-white/75 shadow-sm">
                    <td className="rounded-l-[24px] px-4 py-4 text-sm font-semibold text-ink-900">
                      {product.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-ink-500">
                      {product.category?.name || product.category || "General"}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-ink-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
                          Number(product.stockQuantity ?? product.countInStock ?? 0) <= 5
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {product.stockQuantity ?? product.countInStock ?? 0}
                      </span>
                    </td>
                    <td className="rounded-r-[24px] px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/product/${product._id || product.id}/edit`}
                          className={secondaryButtonClass}
                        >
                          <PencilLine size={16} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={secondaryButtonClass}
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

      <section className="grid gap-6 xl:grid-cols-2">
        <section className={`${sectionClass} grid gap-5`}>
          <div>
            <span className={eyebrowClass}>Categories</span>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">
              Add, edit, and remove product groups.
            </h2>
          </div>

          <form className="grid gap-4" onSubmit={submitCategory}>
            <FormField
              label="Category Name"
              htmlFor="category-name"
              error={categoryForm.formState.errors.name?.message}
            >
              <input id="category-name" type="text" {...categoryForm.register("name")} />
            </FormField>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className={primaryButtonClass} disabled={categoryMutation.isPending}>
                {categoryMutation.isPending
                  ? "Saving..."
                  : categoryBeingEdited
                    ? "Update Category"
                    : "Create Category"}
              </button>
              {categoryBeingEdited ? (
                <button
                  type="button"
                  className={secondaryButtonClass}
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

          <div className="grid gap-3">
            {categoriesQuery.isError ? (
              <ErrorState message="Categories could not be loaded or updated right now." />
            ) : null}

            {!categoriesQuery.isError &&
              categories.map((category: any) => (
                <article
                  key={category.id}
                  className="flex flex-col gap-3 rounded-[26px] border border-white/70 bg-white/75 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <strong className="text-lg font-semibold text-ink-900">{category.name}</strong>
                    <p className="mt-1 text-sm text-ink-500">{category.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() => {
                        setCategoryBeingEdited(category);
                        categoryForm.reset({ name: category.name });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() => categoryDeleteMutation.mutate(category.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section className={`${sectionClass} grid gap-5`}>
          <div>
            <span className={eyebrowClass}>Orders</span>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">
              Monitor fulfillment and update statuses.
            </h2>
          </div>

          <div className="grid gap-3">
            {ordersQuery.isError ? (
              <ErrorState message="Orders could not be loaded. This usually means the current login is not a real backend admin token." />
            ) : sortedOrders.length === 0 ? (
              <EmptyState
                title="No orders found"
                message="When orders are available, you will manage their statuses here."
              />
            ) : (
              sortedOrders.map((order: any) => (
                <article
                  key={order._id || order.id}
                  className="flex flex-col gap-4 rounded-[26px] border border-white/70 bg-white/75 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-lg font-semibold text-ink-900">
                          {order._id || order.id}
                        </strong>
                        <StatusBadge status={order.status || "PENDING"} />
                      </div>
                      <p className="mt-2 text-sm text-ink-500">
                        {order.user?.email || order.shippingAddress?.email || "Customer order"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink-900">
                        {formatCurrency(order.totalPrice || order.total || 0)}
                      </p>
                    </div>
                    <select
                      className="w-full rounded-3xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none sm:w-52"
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
                  </div>
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

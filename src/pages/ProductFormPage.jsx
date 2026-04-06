import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  updateProduct,
} from "../api/products";
import { ErrorState } from "../components/ErrorState";
import { FormField } from "../components/FormField";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../context/AuthContext";
import { useCategories, useProduct } from "../hooks/useCatalog";
import { upsertDemoProduct } from "../lib/demoAdmin";
import { getErrorMessage } from "../utils/formatters";
import { productSchema } from "../validation/schemas";

export function ProductFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isMockAdmin } = useAuth();
  const { productId } = useParams();
  const isEditing = Boolean(productId);

  const form = useForm({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      brand: "",
      categoryId: "",
      price: 0,
      stockQuantity: 0,
      images: [""],
    },
  });

  const imagesFieldArray = useFieldArray({
    control: form.control,
    name: "images",
  });

  const categoriesQuery = useCategories();
  const productQuery = useProduct(productId);

  useEffect(() => {
    if (!productQuery.data) {
      return;
    }

    const product = productQuery.data;
    const categoryValue =
      product.category?._id ||
      product.category?.id ||
      product.categoryId ||
      product.category ||
      "";

    form.reset({
      title: product.title || "",
      description: product.description || "",
      brand: product.brand || "",
      categoryId: String(categoryValue),
      price: Number(product.price || 0),
      stockQuantity: Number(product.stockQuantity ?? product.countInStock ?? 0),
      images:
        product.images && product.images.length > 0
          ? product.images.map((image) =>
              typeof image === "string"
                ? image
                : image?.url?.url || image?.url || ""
            )
          : [product.image || ""],
    });
  }, [form, productQuery.data]);

  const productMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        name: values.title,
        description: values.description,
        brand: values.brand,
        categoryId: values.categoryId,
        price: values.price,
        stock: values.stockQuantity,
        images: values.images.map((url) => ({ url })),
      };

      if (isMockAdmin) {
        return upsertDemoProduct(payload, isEditing ? productId : null);
      }

      if (isEditing) {
        return updateProduct(productId, payload);
      }

      return createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin");
      toast.success(isEditing ? "Product updated." : "Product created.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to save product."));
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    productMutation.mutate(values);
  });

  if (categoriesQuery.isLoading || productQuery.isLoading) {
    return <LoadingState title="Loading product form" />;
  }

  if (categoriesQuery.isError || productQuery.isError) {
    return <ErrorState message="We could not prepare the product form." />;
  }

  return (
    <div className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Product form</span>
          <h1>{isEditing ? "Edit inventory item" : "Create a new inventory item"}</h1>
        </div>
        <Link to="/admin" className="ghost-button">
          Back to dashboard
        </Link>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="two-column-grid">
          <FormField label="Title" htmlFor="product-title" error={form.formState.errors.title?.message}>
            <input id="product-title" type="text" {...form.register("title")} />
          </FormField>
          <FormField label="Brand" htmlFor="product-brand" error={form.formState.errors.brand?.message}>
            <input id="product-brand" type="text" {...form.register("brand")} />
          </FormField>
          <FormField
            label="Category"
            htmlFor="product-category"
            error={form.formState.errors.categoryId?.message}
          >
            <select id="product-category" {...form.register("categoryId")}>
              <option value="">Select category</option>
              {categoriesQuery.data.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Price" htmlFor="product-price" error={form.formState.errors.price?.message}>
            <input id="product-price" type="number" step="0.01" {...form.register("price")} />
          </FormField>
          <FormField
            label="Stock Quantity"
            htmlFor="product-stock"
            error={form.formState.errors.stockQuantity?.message}
          >
            <input id="product-stock" type="number" step="1" {...form.register("stockQuantity")} />
          </FormField>
        </div>

        <FormField
          label="Description"
          htmlFor="product-description"
          error={form.formState.errors.description?.message}
        >
          <textarea id="product-description" rows="6" {...form.register("description")} />
        </FormField>

        <div className="stack-list">
          <div className="section-heading compact-heading">
            <div>
              <span className="eyebrow">Product images</span>
              <h2>Provide at least one valid image URL.</h2>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => imagesFieldArray.append("")}
            >
              Add image field
            </button>
          </div>

          {imagesFieldArray.fields.map((field, index) => (
            <div key={field.id} className="image-field-row">
              <FormField
                label={`Image URL ${index + 1}`}
                htmlFor={`product-image-${index}`}
                error={form.formState.errors.images?.[index]?.message}
              >
                <input
                  id={`product-image-${index}`}
                  type="url"
                  {...form.register(`images.${index}`)}
                />
              </FormField>
              {imagesFieldArray.fields.length > 1 ? (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => imagesFieldArray.remove(index)}
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          {typeof form.formState.errors.images?.message === "string" ? (
            <span className="field-error">{form.formState.errors.images.message}</span>
          ) : null}
        </div>

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={productMutation.isPending}>
            {productMutation.isPending
              ? "Saving..."
              : isEditing
                ? "Update Product"
                : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

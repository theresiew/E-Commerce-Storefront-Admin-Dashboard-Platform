import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createProduct, updateProduct } from "../api/products";
import { ErrorState } from "../components/ErrorState";
import { FormField } from "../components/FormField";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../context/AuthContext";
import { useCategories, useProduct } from "../hooks/useCatalog";
import {
  eyebrowClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionClass,
} from "../lib/ui";
import { upsertDemoProduct } from "../lib/demoAdmin";
import { getErrorMessage } from "../utils/formatters";
import { productSchema } from "../validation/schemas";

export function ProductFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isMockAdmin } = useAuth();
  const { productId } = useParams();
  const isEditing = Boolean(productId);

  const form = useForm<any>({
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

  const imagesFieldArray = useFieldArray<any>({
    control: form.control,
    name: "images",
  });

  const categoriesQuery = useCategories();
  const productQuery = useProduct(productId);
  const watchedCategoryId = form.watch("categoryId");
  const selectedCategory = categoriesQuery.data?.find(
    (category: any) => String(category.id) === String(watchedCategoryId),
  );

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
          ? product.images.map((image: any) =>
              typeof image === "string" ? image : image?.url?.url || image?.url || "",
            )
          : [product.image || ""],
    });
  }, [form, productQuery.data]);

  const productMutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        name: values.title,
        description: values.description,
        brand: values.brand,
        categoryId: values.categoryId,
        price: values.price,
        stock: values.stockQuantity,
        images: values.images.map((url: string) => ({ url })),
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
    <div className={`${sectionClass} grid gap-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className={eyebrowClass}>Product form</span>
          <h1 className="mt-3 text-4xl font-semibold text-ink-900">
            {isEditing ? "Edit inventory item" : "Create a new inventory item"}
          </h1>
        </div>
        <Link to="/admin" className={secondaryButtonClass}>
          Back to dashboard
        </Link>
      </div>

      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Title" htmlFor="product-title" error={form.formState.errors.title?.message as string | undefined}>
            <input id="product-title" type="text" {...form.register("title")} />
          </FormField>
          <FormField label="Brand" htmlFor="product-brand" error={form.formState.errors.brand?.message as string | undefined}>
            <input id="product-brand" type="text" {...form.register("brand")} />
          </FormField>
          <FormField label="Category" htmlFor="product-category" error={form.formState.errors.categoryId?.message as string | undefined}>
            <select id="product-category" {...form.register("categoryId")}>
              <option value="">Select category</option>
              {categoriesQuery.data.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Price" htmlFor="product-price" error={form.formState.errors.price?.message as string | undefined}>
            <input id="product-price" type="number" step="0.01" {...form.register("price")} />
          </FormField>
          <FormField
            label="Stock Quantity"
            htmlFor="product-stock"
            error={form.formState.errors.stockQuantity?.message as string | undefined}
          >
            <input id="product-stock" type="number" step="1" {...form.register("stockQuantity")} />
          </FormField>
        </div>

        <div className="rounded-[24px] border border-white/70 bg-white/70 p-4 text-sm text-ink-500">
          <p className="font-semibold text-ink-900">Current category link</p>
          <p className="mt-2">Selected name: {selectedCategory?.name || "None selected"}</p>
          <p className="mt-1">Selected ID: {watchedCategoryId || "None selected"}</p>
          {isEditing && productQuery.data ? (
            <p className="mt-1">
              Existing product category:{" "}
              {productQuery.data.category?.name || productQuery.data.category || "Unknown"}
            </p>
          ) : null}
        </div>

        <FormField
          label="Description"
          htmlFor="product-description"
          error={form.formState.errors.description?.message as string | undefined}
        >
          <textarea id="product-description" rows={6} {...form.register("description")} />
        </FormField>

        <div className="grid gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className={eyebrowClass}>Product images</span>
              <h2 className="mt-3 text-2xl font-semibold text-ink-900">
                Provide at least one valid image URL.
              </h2>
            </div>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => imagesFieldArray.append("")}
            >
              Add image field
            </button>
          </div>

          {imagesFieldArray.fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <FormField
                  label={`Image URL ${index + 1}`}
                  htmlFor={`product-image-${index}`}
                  error={form.formState.errors.images?.[index]?.message as string | undefined}
                >
                  <input id={`product-image-${index}`} type="url" {...form.register(`images.${index}`)} />
                </FormField>
              </div>
              {imagesFieldArray.fields.length > 1 ? (
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => imagesFieldArray.remove(index)}
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          {typeof form.formState.errors.images?.message === "string" ? (
            <span className="text-sm font-medium text-rose-600">
              {form.formState.errors.images.message}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className={primaryButtonClass} disabled={productMutation.isPending}>
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

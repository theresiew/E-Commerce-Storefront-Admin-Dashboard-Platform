import { fetchProducts } from "./products";
import { requestWithFallback } from "./client";
import { slugify } from "../utils/formatters";

function normalizeCategory(category) {
  if (typeof category === "string") {
    return {
      id: slugify(category),
      name: category,
    };
  }

  return {
    id: category?._id || category?.id || slugify(category?.name || "category"),
    name: category?.name || category?.title || "Unnamed category",
  };
}

function extractCategories(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.categories)) {
    return data.categories;
  }

  return [];
}

export async function fetchCategories() {
  try {
    const data = await requestWithFallback("get", ["/categories?limit=100", "/categories"]);
    return extractCategories(data).map(normalizeCategory);
  } catch {
    const products = await fetchProducts();
    const unique = [
      ...new Set(
        products
          .map((product) => product.category?.name || product.category)
          .filter(Boolean)
      ),
    ];
    return unique.map(normalizeCategory);
  }
}

export async function createCategory(payload) {
  return requestWithFallback("post", ["/categories"], payload);
}

export async function updateCategory(categoryId, payload) {
  return requestWithFallback(
    "patch",
    [`/categories/${categoryId}`],
    payload
  );
}

export async function deleteCategory(categoryId) {
  return requestWithFallback("delete", [`/categories/${categoryId}`]);
}

import { requestWithFallback } from "./client";
import { normalizeProduct } from "../utils/normalizers";
import { slugify } from "../utils/formatters";

function extractProducts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data?.all)) {
    return data.data.all;
  }

  if (Array.isArray(data?.data?.products)) {
    return data.data.products;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export async function fetchProducts() {
  const data = await requestWithFallback("get", ["/public/products", "/products"]);
  return extractProducts(data).map(normalizeProduct);
}

function matchesCategory(product, category) {
  const normalized = normalizeProduct(product);
  const categoryName = normalized.category?.name || normalized.category || "";
  const productCategoryId =
    normalized.category?._id || normalized.category?.id || normalized.categoryId || "";

  const candidateValues = [
    category?.id,
    category?.name,
    slugify(category?.name || ""),
    String(category?.id || "").toLowerCase(),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const productValues = [
    categoryName,
    slugify(categoryName),
    productCategoryId,
    String(productCategoryId || "").toLowerCase(),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return candidateValues.some((value) => productValues.includes(value));
}

export async function fetchProductsByCategory(category) {
  const allProducts = await fetchProducts();

  if (!category?.id && !category?.name) {
    return allProducts;
  }

  const localMatches = allProducts.filter((product) => matchesCategory(product, category));

  if (!category?.id) {
    return localMatches;
  }

  try {
    const data = await requestWithFallback("get", [
      `/public/products/category/${category.id}?limit=100`,
      `/public/products/category/${category.id}`,
    ]);
    const remoteMatches = extractProducts(data).map(normalizeProduct);
    const merged = new Map(
      [...remoteMatches, ...localMatches].map((product) => [product.id || product._id, product]),
    );

    return [...merged.values()];
  } catch {
    return localMatches;
  }
}

export async function fetchProductById(productId) {
  const response = await requestWithFallback("get", [
    `/public/products/${productId}`,
    `/products/${productId}`,
  ]);
  const product = response?.data?.product || response?.product || response;
  return normalizeProduct(product);
}

export async function createProduct(payload) {
  return requestWithFallback("post", ["/admin/products", "/products"], payload);
}

export async function updateProduct(productId, payload) {
  return requestWithFallback(
    "put",
    [`/admin/products/${productId}`, `/products/${productId}`],
    payload
  );
}

export async function deleteProduct(productId) {
  return requestWithFallback("delete", [
    `/admin/products/${productId}`,
    `/products/${productId}`,
  ]);
}

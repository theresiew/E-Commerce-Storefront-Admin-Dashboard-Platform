import { requestWithFallback } from "./client";
import { normalizeProduct } from "../utils/normalizers";

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

export async function fetchProductsByCategory(categoryId) {
  const data = await requestWithFallback("get", [
    `/public/products/category/${categoryId}?limit=100`,
    `/public/products/category/${categoryId}`,
  ]);
  return extractProducts(data).map(normalizeProduct);
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

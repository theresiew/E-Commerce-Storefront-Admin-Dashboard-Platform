import { requestWithFallback } from "./client";
import { normalizeOrder } from "../utils/normalizers";

function extractOrders(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.orders)) {
    return data.data.orders;
  }

  if (Array.isArray(data?.orders)) {
    return data.orders;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

export async function createOrder(payload) {
  return requestWithFallback("post", ["/auth/orders", "/orders"], payload);
}

export async function fetchMyOrders() {
  const data = await requestWithFallback("get", [
    "/auth/orders",
    "/orders/me",
    "/orders/myorders",
  ]);
  return extractOrders(data).map(normalizeOrder);
}

export async function fetchAllOrders() {
  const data = await requestWithFallback("get", ["/auth/orders/admin/all", "/orders"]);
  return extractOrders(data).map(normalizeOrder);
}

export async function updateOrderStatus(orderId, status) {
  return requestWithFallback(
    "patch",
    [`/auth/orders/${orderId}/status`, `/orders/${orderId}/status`],
    { status }
  );
}

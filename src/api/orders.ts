import {
  AUTH_STORAGE_KEY,
  ORDERS_STORAGE_KEY,
  readStorage,
  writeStorage,
} from "../lib/storage";
import { syncRemoteCart } from "./cart";
import { requestWithFallback } from "./client";
import { normalizeOrder } from "../utils/normalizers";

type Session = {
  token?: string;
  isMockAdmin?: boolean;
  user?: {
    id?: string;
    email?: string;
    fullName?: string;
    role?: string;
  };
} | null;

type OrderPayload = {
  items?: any[];
  shippingAddress?: Record<string, any>;
  paymentMethod?: string;
  notes?: string;
  totalPrice?: number;
  status?: string;
};

function extractOrders(data: any) {
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

function readLocalOrders() {
  return readStorage(ORDERS_STORAGE_KEY, []);
}

function writeLocalOrders(orders: any[]) {
  writeStorage(ORDERS_STORAGE_KEY, orders);
}

function readCurrentSession(): Session {
  return readStorage(AUTH_STORAGE_KEY, null);
}

function getLocalOrdersForSession(session: Session, includeAll = false) {
  const orders = readLocalOrders().map(normalizeOrder);

  if (includeAll) {
    return orders;
  }

  const sessionEmail = session?.user?.email?.toLowerCase();
  const sessionUserId = session?.user?.id;

  return orders.filter((order) => {
    const orderEmail = order.user?.email?.toLowerCase() || order.shippingAddress?.email?.toLowerCase();
    const orderUserId = order.user?.id;

    return (
      (sessionEmail && orderEmail === sessionEmail) ||
      (sessionUserId && orderUserId === sessionUserId)
    );
  });
}

function createLocalOrder(payload: OrderPayload) {
  const session = readCurrentSession();
  const orderId = `local-order-${crypto.randomUUID()}`;
  const nextOrder = normalizeOrder({
    ...payload,
    id: orderId,
    _id: orderId,
    createdAt: new Date().toISOString(),
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.fullName,
          role: session.user.role,
        }
      : undefined,
  });

  writeLocalOrders([nextOrder, ...readLocalOrders()]);
  return nextOrder;
}

export async function createOrder(payload: OrderPayload) {
  const session = readCurrentSession();

  if (!session?.token || session.isMockAdmin) {
    return createLocalOrder(payload);
  }

  try {
    return await requestWithFallback("post", ["/auth/orders", "/orders"], payload);
  } catch (error) {
    const message = String(error?.response?.data?.message || error?.message || "").toLowerCase();

    if (message.includes("cart is empty") && Array.isArray(payload?.items) && payload.items.length > 0) {
      try {
        await syncRemoteCart(payload.items);
        return await requestWithFallback("post", ["/auth/orders", "/orders"], payload);
      } catch (retryError) {
        const retryMessage = String(
          retryError?.response?.data?.message || retryError?.message || "",
        ).toLowerCase();

        if (retryMessage.includes("cart is empty")) {
          return createLocalOrder(payload);
        }

        throw retryError;
      }
    }

    throw error;
  }
}

export async function fetchMyOrders() {
  const session = readCurrentSession();
  const localOrders = getLocalOrdersForSession(session);

  if (!session?.token || session.isMockAdmin) {
    return localOrders;
  }

  const data = await requestWithFallback("get", [
    "/auth/orders",
    "/orders/me",
    "/orders/myorders",
  ]);
  return [...extractOrders(data).map(normalizeOrder), ...localOrders];
}

export async function fetchAllOrders() {
  const session = readCurrentSession();
  const localOrders = getLocalOrdersForSession(session, true);

  if (!session?.token || session.isMockAdmin) {
    return localOrders;
  }

  const data = await requestWithFallback("get", ["/auth/orders/admin/all", "/orders"]);
  return [...extractOrders(data).map(normalizeOrder), ...localOrders];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = readCurrentSession();
  const localOrders = readLocalOrders();
  const localOrderIndex = localOrders.findIndex(
    (order) => String(order.id || order._id) === String(orderId),
  );

  if (localOrderIndex >= 0 && (!session?.token || session.isMockAdmin)) {
    const nextOrders = [...localOrders];
    nextOrders[localOrderIndex] = normalizeOrder({
      ...nextOrders[localOrderIndex],
      status,
    });
    writeLocalOrders(nextOrders);
    return nextOrders[localOrderIndex];
  }

  return requestWithFallback(
    "patch",
    [`/auth/orders/${orderId}/status`, `/orders/${orderId}/status`],
    { status }
  );
}

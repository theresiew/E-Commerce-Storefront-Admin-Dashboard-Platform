import { DEMO_ADMIN_STORAGE_KEY, readStorage, writeStorage } from "./storage";
import { normalizeOrder, normalizeProduct } from "../utils/normalizers";
import { slugify } from "../utils/formatters";

function readDemoAdminState() {
  return readStorage(DEMO_ADMIN_STORAGE_KEY, {
    products: [],
    deletedProductIds: [],
    categories: [],
    deletedCategoryIds: [],
    orderStatuses: {},
  });
}

function writeDemoAdminState(nextState) {
  writeStorage(DEMO_ADMIN_STORAGE_KEY, nextState);
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function mergeDemoProducts(baseProducts = []) {
  const state = readDemoAdminState();
  const deletedIds = new Set(state.deletedProductIds || []);
  const baseMap = new Map(
    baseProducts
      .filter(Boolean)
      .map((product) => {
        const normalized = normalizeProduct(product);
        return [normalized.id, normalized];
      })
  );

  for (const product of state.products || []) {
    const normalized = normalizeProduct(product);
    baseMap.set(normalized.id, normalized);
  }

  return [...baseMap.values()].filter((product) => !deletedIds.has(product.id));
}

export function upsertDemoProduct(payload, existingId) {
  const state = readDemoAdminState();
  const nextId = existingId || createId("demo-product");
  const categoryId = payload.categoryId;
  const linkedCategory = (state.categories || []).find((category) => category.id === categoryId);

  const normalized = normalizeProduct({
    id: nextId,
    name: payload.name,
    description: payload.description,
    brand: payload.brand,
    categoryId,
    category: linkedCategory ? { name: linkedCategory.name, id: linkedCategory.id } : categoryId,
    price: payload.price,
    stock: payload.stock,
    images: (payload.images || []).map((image) =>
      typeof image === "string" ? { url: image } : image
    ),
  });

  const filtered = (state.products || []).filter((product) => product.id !== nextId);
  writeDemoAdminState({
    ...state,
    products: [...filtered, normalized],
    deletedProductIds: (state.deletedProductIds || []).filter((id) => id !== nextId),
  });

  return normalized;
}

export function removeDemoProduct(productId) {
  const state = readDemoAdminState();
  writeDemoAdminState({
    ...state,
    products: (state.products || []).filter((product) => product.id !== productId),
    deletedProductIds: [...new Set([...(state.deletedProductIds || []), productId])],
  });
}

export function mergeDemoCategories(baseCategories = []) {
  const state = readDemoAdminState();
  const deletedIds = new Set(state.deletedCategoryIds || []);
  const baseMap = new Map(
    baseCategories
      .filter(Boolean)
      .map((category) => [
        category.id || category._id || slugify(category.name || "category"),
        {
          id: category.id || category._id || slugify(category.name || "category"),
          name: category.name || "Unnamed category",
          description: category.description || "",
        },
      ])
  );

  for (const category of state.categories || []) {
    baseMap.set(category.id, category);
  }

  return [...baseMap.values()].filter((category) => !deletedIds.has(category.id));
}

export function upsertDemoCategory(payload, existingCategory) {
  const state = readDemoAdminState();
  const nextCategory = {
    id: existingCategory?.id || createId(slugify(payload.name || "category")),
    name: payload.name,
    description: payload.description || existingCategory?.description || "",
  };

  const filtered = (state.categories || []).filter(
    (category) => category.id !== nextCategory.id
  );

  writeDemoAdminState({
    ...state,
    categories: [...filtered, nextCategory],
    deletedCategoryIds: (state.deletedCategoryIds || []).filter((id) => id !== nextCategory.id),
  });

  return nextCategory;
}

export function removeDemoCategory(categoryId) {
  const state = readDemoAdminState();
  writeDemoAdminState({
    ...state,
    categories: (state.categories || []).filter((category) => category.id !== categoryId),
    deletedCategoryIds: [...new Set([...(state.deletedCategoryIds || []), categoryId])],
  });
}

export function mergeDemoOrders(baseOrders = []) {
  const state = readDemoAdminState();
  const statusMap = state.orderStatuses || {};

  return baseOrders.map((order) =>
    normalizeOrder({
      ...order,
      status: statusMap[order.id || order._id] || order.status,
    })
  );
}

export function updateDemoOrderStatus(orderId, status) {
  const state = readDemoAdminState();
  writeDemoAdminState({
    ...state,
    orderStatuses: {
      ...(state.orderStatuses || {}),
      [orderId]: status,
    },
  });
}

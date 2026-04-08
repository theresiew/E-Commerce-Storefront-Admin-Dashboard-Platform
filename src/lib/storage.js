export const AUTH_STORAGE_KEY = "novacart-auth";
export const CART_STORAGE_KEY = "novacart-cart";
export const USERS_STORAGE_KEY = "novacart-local-users";
export const DEMO_ADMIN_STORAGE_KEY = "novacart-demo-admin";
export const ORDERS_STORAGE_KEY = "novacart-local-orders";

export function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key) {
  localStorage.removeItem(key);
}

import { apiClient, requestWithFallback } from "./client";

type CartItem = Record<string, any>;

function extractCartItems(data: any): CartItem[] {
  return (
    data?.data?.items ||
    data?.items ||
    data?.cart?.items ||
    data?.cart ||
    (Array.isArray(data) ? data : [])
  );
}

export async function fetchRemoteCart() {
  try {
    const data = await requestWithFallback("get", ["/auth/cart", "/cart"]);
    return extractCartItems(data);
  } catch {
    return [];
  }
}

export async function syncRemoteCart(items: CartItem[]) {
  try {
    await clearRemoteCart();

    for (const item of items) {
      await requestWithFallback("post", ["/auth/cart/items"], {
        productId: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    const latest = await requestWithFallback("get", ["/auth/cart"]);
    return extractCartItems(latest);
  } catch {
    return items;
  }
}

export async function clearRemoteCart() {
  try {
    await apiClient.delete("/auth/cart");
  } catch {
    return null;
  }
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { clearRemoteCart, fetchRemoteCart, syncRemoteCart } from "../api/cart";
import { CART_STORAGE_KEY, readStorage, writeStorage } from "../lib/storage";
import { useAuth } from "./AuthContext";

type CartItem = {
  id: string;
  itemId: string | null;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stockQuantity: number;
  category: string;
  brand: string;
  variantId: string | null;
};

type CartContextValue = {
  items: CartItem[];
  totals: {
    quantity: number;
    subtotal: number;
    shipping: number;
    tax: number;
    grandTotal: number;
  };
  addItem: (product: Record<string, any>, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCartItem(product: Record<string, any>, quantity = 1): CartItem {
  return {
    id: product._id || product.id,
    itemId: product.itemId || null,
    title: product.title,
    price: Number(product.price || 0),
    image: product.images?.[0]?.url || product.images?.[0] || product.image || "",
    quantity,
    stockQuantity: Number(product.stockQuantity ?? product.countInStock ?? 0),
    category: product.category?.name || product.category || "",
    brand: product.brand || "",
    variantId: product.variantId || product.variants?.[0]?.id || null,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => readStorage(CART_STORAGE_KEY, []));

  useEffect(() => {
    writeStorage(CART_STORAGE_KEY, items);
  }, [items]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "USER") {
      return;
    }

    let ignore = false;

    fetchRemoteCart()
      .then((remoteItems) => {
        if (!ignore && Array.isArray(remoteItems) && remoteItems.length > 0) {
          setItems((currentItems) =>
            currentItems.length > 0
              ? currentItems
              : remoteItems.map((item) =>
                  normalizeCartItem(
                    {
                      ...item.product,
                      id: item.productId || item.product?.id,
                      itemId: item.id,
                      variantId: item.variantId,
                      price: item.price || item.product?.price,
                    },
                    item.quantity
                  )
                )
          );
        }
      })
      .catch(() => null);

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, userRole]);

  const persistRemote = async (nextItems: CartItem[]) => {
    if (isAuthenticated && userRole === "USER") {
      await syncRemoteCart(nextItems);
    }
  };

  const addItem = async (product: Record<string, any>, quantity = 1) => {
    const normalizedItem = normalizeCartItem(product, quantity);

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === normalizedItem.id);
      const nextItems = existing
        ? currentItems.map((item) =>
            item.id === normalizedItem.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + quantity,
                    item.stockQuantity || item.quantity + quantity
                  ),
                }
              : item
          )
        : [...currentItems, normalizedItem];

      void persistRemote(nextItems);
      return nextItems;
    });

    toast.success("Product added to cart.");
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    setItems((currentItems) => {
      const nextItems = currentItems
        .map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.stockQuantity || quantity)),
              }
            : item
        )
        .filter((item) => item.quantity > 0);

      void persistRemote(nextItems);
      return nextItems;
    });
  };

  const removeItem = async (itemId: string) => {
    setItems((currentItems) => {
      const nextItems = currentItems.filter((item) => item.id !== itemId);
      void persistRemote(nextItems);
      return nextItems;
    });

    toast.success("Item removed from cart.");
  };

  const clearCart = async () => {
    setItems([]);
    await clearRemoteCart();
  };

  const totals = useMemo(() => {
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = quantity > 0 ? (subtotal >= 150 ? 0 : 12) : 0;
    const tax = subtotal * 0.18;

    return {
      quantity,
      subtotal,
      shipping,
      tax,
      grandTotal: subtotal + shipping + tax,
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      totals,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
    }),
    [items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  eyebrowClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionClass,
} from "../lib/ui";
import { formatCurrency } from "../utils/formatters";

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const { clearCart, items, totals, removeItem, updateItemQuantity } = useCart();
  const amountToFreeShipping = Math.max(0, 150 - totals.subtotal);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Browse the storefront and add products to begin checkout."
        action={
          <Link to="/" className={primaryButtonClass}>
            Explore products
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
      <section className={`${sectionClass} grid gap-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className={eyebrowClass}>Shopping cart</span>
            <h1 className="mt-3 text-4xl font-semibold text-ink-900">
              Review your selected products.
            </h1>
          </div>
          <button type="button" className={secondaryButtonClass} onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <div className="grid gap-4">
          {items.map((item: any) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-[28px] border border-white/70 bg-white/75 p-4 lg:grid-cols-[120px_1fr_auto] lg:items-center"
            >
              <img
                src={item.image || "https://placehold.co/320x240"}
                alt={item.title}
                className="h-32 w-full rounded-3xl object-cover lg:h-24 lg:w-[120px]"
              />
              <div>
                <h3 className="text-xl font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{item.brand}</p>
                <strong className="mt-2 block text-lg text-mint-600">
                  {formatCurrency(item.price)}
                </strong>
              </div>
              <div className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-sand-50 p-1.5">
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-900"
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold text-ink-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-900"
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className={`${sectionClass} grid h-fit gap-4`}>
        <span className={eyebrowClass}>Order summary</span>
        <h2 className="text-3xl font-semibold text-ink-900">{totals.quantity} items ready</h2>
        <div className="grid gap-3 text-sm text-ink-500">
          <div className="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <strong className="text-ink-900">{formatCurrency(totals.subtotal)}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Shipping</span>
            <strong className="text-ink-900">
              {totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Tax</span>
            <strong className="text-ink-900">{formatCurrency(totals.tax)}</strong>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-ink-900/10 pt-3">
            <span>Total</span>
            <strong className="text-lg text-ink-900">{formatCurrency(totals.grandTotal)}</strong>
          </div>
        </div>

        <p className="text-sm leading-7 text-ink-500">
          {amountToFreeShipping > 0
            ? `${formatCurrency(amountToFreeShipping)} away from free shipping.`
            : "You unlocked free shipping."}
        </p>

        <button
          type="button"
          className={primaryButtonClass}
          onClick={() => {
            if (!isAuthenticated || userRole !== "USER") {
              navigate("/login", { state: { from: "/checkout" } });
              return;
            }

            navigate("/checkout");
          }}
        >
          <ShoppingBag size={16} />
          Proceed to checkout
        </button>
      </aside>
    </div>
  );
}

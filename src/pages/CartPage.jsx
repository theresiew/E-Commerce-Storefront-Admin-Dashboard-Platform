import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
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
          <Link to="/" className="primary-button">
            Explore products
          </Link>
        }
      />
    );
  }

  return (
    <div className="cart-layout">
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Shopping cart</span>
            <h1>Review your selected products.</h1>
          </div>
          <button type="button" className="ghost-button" onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <div className="cart-list">
          {items.map((item) => (
            <article key={item.id} className="cart-item">
              <img src={item.image || "https://placehold.co/320x240"} alt={item.title} />
              <div className="cart-item-copy">
                <h3>{item.title}</h3>
                <p>{item.brand}</p>
                <strong>{formatCurrency(item.price)}</strong>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-control">
                  <button
                    type="button"
                    className="ghost-button icon-only"
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    className="ghost-button icon-only"
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  className="ghost-button icon-button"
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

      <aside className="panel cart-summary">
        <span className="eyebrow">Order summary</span>
        <h2>{totals.quantity} items ready</h2>
        <div className="summary-list">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(totals.subtotal)}</strong>
          </div>
          <div>
            <span>Shipping</span>
            <strong>{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</strong>
          </div>
          <div>
            <span>Tax</span>
            <strong>{formatCurrency(totals.tax)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatCurrency(totals.grandTotal)}</strong>
          </div>
        </div>

        <p className="helper-note">
          {amountToFreeShipping > 0
            ? `${formatCurrency(amountToFreeShipping)} away from free shipping.`
            : "You unlocked free shipping."}
        </p>

        <button
          type="button"
          className="primary-button icon-button"
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

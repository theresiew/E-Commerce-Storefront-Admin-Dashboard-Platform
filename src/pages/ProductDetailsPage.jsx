import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useCart } from "../context/CartContext";
import { useProduct } from "../hooks/useCatalog";
import { formatCurrency } from "../utils/formatters";

export function ProductDetailsPage() {
  const { productId } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const productQuery = useProduct(productId);

  if (productQuery.isLoading) {
    return <LoadingState title="Loading product details" />;
  }

  if (productQuery.isError) {
    return <ErrorState message="We could not load this product right now." />;
  }

  const product = productQuery.data;
  const stock = Number(product.stockQuantity ?? product.countInStock ?? 0);
  const image =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image ||
    "https://placehold.co/900x700";

  return (
    <div className="details-grid">
      <div className="details-image panel">
        <img src={image} alt={product.title} />
      </div>

      <section className="panel details-copy">
        <Link to="/" className="back-link">
          Back to catalog
        </Link>
        <span className="eyebrow">{product.category?.name || product.category || "General"}</span>
        <h1>{product.title}</h1>
        <p className="details-brand">by {product.brand || "NovaCart Studio"}</p>
        <strong className="price-mark">{formatCurrency(product.price)}</strong>
        <p>{product.description}</p>

        <div className="stats-grid">
          <article>
            <span>Availability</span>
            <strong>{stock > 0 ? `${stock} units ready` : "Out of stock"}</strong>
          </article>
          <article>
            <span>Delivery</span>
            <strong>Dispatch within 24 hours</strong>
          </article>
        </div>

        <div className="quantity-strip">
          <span>Quantity</span>
          <div className="quantity-control">
            <button
              type="button"
              className="ghost-button icon-only"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              <Minus size={16} />
            </button>
            <strong>{quantity}</strong>
            <button
              type="button"
              className="ghost-button icon-only"
              onClick={() => setQuantity((current) => Math.min(stock || current + 1, current + 1))}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="primary-button icon-button"
            disabled={stock === 0}
            onClick={() => addItem(product, quantity)}
          >
            <ShoppingCart size={16} />
            Add to cart
          </button>
          <Link to="/cart" className="ghost-button">
            View cart
          </Link>
        </div>
      </section>
    </div>
  );
}

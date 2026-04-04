import { Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const image =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image ||
    "https://placehold.co/600x400";
  const stock = Number(product.stockQuantity ?? product.countInStock ?? 0);

  return (
    <article className="product-card">
      <div className="product-media">
        <img src={image} alt={product.title} />
        <span className={`stock-badge ${stock > 0 ? "success-badge" : "danger-badge"}`}>
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </span>
      </div>
      <div className="product-content">
        <div className="product-meta">
          <span>{product.category?.name || product.category || "General"}</span>
          <span>{product.brand || "Nova"}</span>
        </div>
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <div className="product-footer">
          <strong>{formatCurrency(product.price)}</strong>
          <div className="button-row">
            <Link
              to={`/products/${product._id || product.id}`}
              className="ghost-button icon-button"
            >
              <Eye size={16} />
              Details
            </Link>
            <button
              type="button"
              className="primary-button icon-button"
              disabled={stock === 0}
              onClick={() => addItem(product)}
            >
              <ShoppingCart size={16} />
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

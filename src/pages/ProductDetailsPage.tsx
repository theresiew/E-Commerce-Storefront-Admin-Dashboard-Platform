import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useCart } from "../context/CartContext";
import { useProduct } from "../hooks/useCatalog";
import {
  eyebrowClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionClass,
} from "../lib/ui";
import { formatCurrency } from "../utils/formatters";
import { getProductImageUrl, getProductPlaceholder } from "../utils/images";

export function ProductDetailsPage() {
  const { productId } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState("");
  const productQuery = useProduct(productId);
  const product = productQuery.data;

  useEffect(() => {
    if (product) {
      setImage(getProductImageUrl(product));
    }
  }, [product]);

  if (productQuery.isLoading) {
    return <LoadingState title="Loading product details" />;
  }

  if (productQuery.isError || !product) {
    return <ErrorState message="We could not load this product right now." />;
  }

  const stock = Number(product.stockQuantity ?? product.countInStock ?? 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${sectionClass} min-h-[440px] overflow-hidden p-0`}>
        <img
          src={image || getProductPlaceholder(product.title)}
          alt={product.title}
          className="h-full w-full object-cover"
          onError={() => setImage(getProductPlaceholder(product.title))}
        />
      </div>

      <section className={`${sectionClass} grid content-start gap-5`}>
        <Link to="/" className="text-sm font-semibold text-mint-600">
          Back to catalog
        </Link>
        <span className={eyebrowClass}>{product.category?.name || product.category || "General"}</span>
        <div>
          <h1 className="text-4xl font-semibold text-ink-900">{product.title}</h1>
          <p className="mt-2 text-sm text-ink-500">by {product.brand || "NovaCart Studio"}</p>
        </div>
        <strong className="text-4xl font-semibold text-mint-600">
          {formatCurrency(product.price)}
        </strong>
        <p className="text-sm leading-7 text-ink-500">{product.description}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-[24px] border border-white/70 bg-white/75 p-4">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
              Availability
            </span>
            <strong className="mt-2 block text-lg text-ink-900">
              {stock > 0 ? `${stock} units ready` : "Out of stock"}
            </strong>
          </article>
          <article className="rounded-[24px] border border-white/70 bg-white/75 p-4">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
              Delivery
            </span>
            <strong className="mt-2 block text-lg text-ink-900">Dispatch within 24 hours</strong>
          </article>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-ink-900">Quantity</span>
          <div className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-sand-50 p-1.5">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-900"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              <Minus size={16} />
            </button>
            <strong className="min-w-8 text-center text-sm text-ink-900">{quantity}</strong>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-900"
              onClick={() => setQuantity((current) => Math.min(stock || current + 1, current + 1))}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={primaryButtonClass}
            disabled={stock === 0}
            onClick={() => addItem(product, quantity)}
          >
            <ShoppingCart size={16} />
            Add to cart
          </button>
          <Link to="/cart" className={secondaryButtonClass}>
            View cart
          </Link>
        </div>
      </section>
    </div>
  );
}

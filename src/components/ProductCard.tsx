import { Eye, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { cn, primaryButtonClass, secondaryButtonClass } from "../lib/ui";
import { getPrimaryStorefrontCategory } from "../utils/catalog";
import { formatCurrency } from "../utils/formatters";
import { getProductImageUrl, getProductPlaceholder } from "../utils/images";

type Product = Record<string, any>;

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [image, setImage] = useState(() => getProductImageUrl(product));
  const stock = Number(product.stockQuantity ?? product.countInStock ?? 0);
  const storefrontCategory =
    getPrimaryStorefrontCategory(product) ||
    product.category?.name ||
    product.category ||
    "General";

  useEffect(() => {
    setImage(getProductImageUrl(product));
  }, [product]);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_20px_46px_rgba(23,31,52,0.10)] backdrop-blur-xl transition hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image || getProductPlaceholder(product.title)}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          onError={() => setImage(getProductPlaceholder(product.title))}
        />
        <span
          className={cn(
            "absolute left-4 top-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white",
            stock > 0 ? "bg-emerald-600/90" : "bg-rose-600/90",
          )}
        >
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </span>
      </div>
      <div className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
          <span>{storefrontCategory}</span>
          <span>{product.brand || "Nova"}</span>
        </div>
        <div className="grid gap-2">
          <h3 className="text-xl font-semibold text-ink-900">{product.title}</h3>
          <p className="line-clamp-3 text-sm leading-7 text-ink-500">{product.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <strong className="text-lg font-semibold text-mint-600">
            {formatCurrency(product.price)}
          </strong>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/products/${product._id || product.id}`}
              className={secondaryButtonClass}
            >
              <Eye size={16} />
              Details
            </Link>
            <button
              type="button"
              className={primaryButtonClass}
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

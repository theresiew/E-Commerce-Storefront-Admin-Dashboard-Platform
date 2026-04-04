import { ArrowRight, Search, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { ProductCard } from "../components/ProductCard";
import { useCategories, useProducts } from "../hooks/useCatalog";

export function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const deferredSearch = useDeferredValue(searchTerm);

  const productsQuery = useProducts();
  const categoriesQuery = useCategories();

  const filteredProducts = useMemo(() => {
    const search = deferredSearch.trim().toLowerCase();

    return (productsQuery.data || []).filter((product) => {
      const matchesCategory =
        activeCategory === "ALL" ||
        (product.category?.name || product.category) === activeCategory;
      const haystack = [product.title, product.description, product.brand]
        .join(" ")
        .toLowerCase();

      return matchesCategory && haystack.includes(search);
    });
  }, [activeCategory, deferredSearch, productsQuery.data]);

  if (productsQuery.isLoading) {
    return <LoadingState title="Loading storefront" message="Fetching live products and categories." />;
  }

  if (productsQuery.isError) {
    return (
      <ErrorState
        message="We could not load the product catalog. Check the API base URL and try again."
      />
    );
  }

  const categories = categoriesQuery.data || [];
  const categoryLabels = ["ALL", ...categories.map((category) => category.name)];

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Production-grade commerce</span>
          <h1>
            A polished storefront for shoppers and a fast-moving command center
            for admins.
          </h1>
          <p>
            Browse dynamic inventory, manage carts with persistence, complete a
            validated checkout, and control inventory, categories, and orders
            from one responsive React platform.
          </p>
          <div className="button-row">
            <Link to="/login" className="primary-button">
              Start Shopping
            </Link>
            <a href="#catalog" className="ghost-button">
              Explore Catalog
            </a>
          </div>
          <div className="hero-metrics">
            <article>
              <strong>{productsQuery.data.length}</strong>
              <span>Live products</span>
            </article>
            <article>
              <strong>{categories.length}</strong>
              <span>Dynamic categories</span>
            </article>
            <article>
              <strong>RBAC</strong>
              <span>Admin and shopper routes</span>
            </article>
          </div>
        </div>

        <div className="hero-card panel">
          <div className="feature-list">
            <article>
              <ShieldCheck size={18} />
              <div>
                <strong>Protected workflows</strong>
                <span>Role-aware sessions, admin gates, shopper-only checkout.</span>
              </div>
            </article>
            <article>
              <ShoppingBag size={18} />
              <div>
                <strong>Persistent cart</strong>
                <span>Cart data stays available across refreshes and sign-in cycles.</span>
              </div>
            </article>
            <article>
              <Truck size={18} />
              <div>
                <strong>Validated checkout</strong>
                <span>Strict shipping, payment, and contact validation before submit.</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="catalog-toolbar panel" id="catalog">
        <div>
          <span className="eyebrow">Catalog</span>
          <h2>Discover what is ready to ship.</h2>
        </div>
        <label className="search-box" htmlFor="search-products">
          <Search size={18} />
          <input
            id="search-products"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by product, description, or brand"
          />
        </label>
      </section>

      <section className="chip-row">
        {categoryLabels.map((label) => (
          <button
            key={label}
            type="button"
            className={`chip ${activeCategory === label ? "chip-active" : ""}`}
            onClick={() => setActiveCategory(label)}
          >
            {label}
          </button>
        ))}
      </section>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products match this filter"
          message="Try a different category or search term to uncover more inventory."
        />
      ) : (
        <section className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </section>
      )}

      <section className="cta-banner">
        <div>
          <span className="eyebrow">Admin access</span>
          <h2>Need to review orders or update stock?</h2>
          <p>Use the provided admin mock credentials from the README to enter the dashboard.</p>
        </div>
        <Link to="/login" className="ghost-button icon-button">
          Open Login
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

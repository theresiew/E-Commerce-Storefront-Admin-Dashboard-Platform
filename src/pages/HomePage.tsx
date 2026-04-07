import { ArrowRight, Search, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { ProductCard } from "../components/ProductCard";
import { useCategories, useProducts, useProductsByCategory } from "../hooks/useCatalog";
import {
  cn,
  eyebrowClass,
  mutedTextClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionClass,
} from "../lib/ui";

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  const categoriesQuery = useCategories();
  const activeCategory = searchParams.get("category") || "ALL";
  const selectedCategory = (categoriesQuery.data || []).find(
    (category: any) => category.name === activeCategory,
  );
  const allProductsQuery = useProducts();
  const categoryProductsQuery = useProductsByCategory(selectedCategory);
  const productsQuery = activeCategory === "ALL" ? allProductsQuery : categoryProductsQuery;

  useEffect(() => {
    const catalogSection = document.getElementById("catalog-results");

    if (catalogSection && activeCategory !== "ALL") {
      catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeCategory]);

  const filteredProducts = useMemo(() => {
    const search = deferredSearch.trim().toLowerCase();

    return (productsQuery.data || []).filter((product: any) => {
      const haystack = [product.title, product.description, product.brand]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [deferredSearch, productsQuery.data]);

  if (productsQuery.isLoading) {
    return <LoadingState title="Loading storefront" message="Fetching live products and categories." />;
  }

  if (productsQuery.isError) {
    return (
      <ErrorState message="We could not load the product catalog. Check the API base URL and try again." />
    );
  }

  const categories = categoriesQuery.data || [];
  const categoryLabels = ["ALL", ...categories.map((category: any) => category.name)];

  const handleCategoryClick = (label: string) => {
    if (label === "ALL") {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.delete("category");
        return nextParams;
      });
      return;
    }

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set("category", label);
      return nextParams;
    });
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <div className={`${sectionClass} grid gap-6`}>
          <div>
            <span className={eyebrowClass}>Production-grade commerce</span>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] text-ink-900 sm:text-5xl lg:text-7xl">
              A polished storefront for shoppers and a sharp command center for admins.
            </h1>
            <p className={`mt-5 max-w-2xl ${mutedTextClass}`}>
              Browse dynamic inventory, manage carts with persistence, complete a
              validated checkout, and control inventory, categories, and orders from
              one responsive React platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className={primaryButtonClass}>
              Start Shopping
            </Link>
            <a href="#catalog" className={secondaryButtonClass}>
              Explore Catalog
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[24px] border border-white/60 bg-white/60 p-4">
              <strong className="block text-3xl font-semibold text-ink-900">
                {productsQuery.data.length}
              </strong>
              <span className="text-sm text-ink-500">Live products</span>
            </article>
            <article className="rounded-[24px] border border-white/60 bg-white/60 p-4">
              <strong className="block text-3xl font-semibold text-ink-900">{categories.length}</strong>
              <span className="text-sm text-ink-500">Dynamic categories</span>
            </article>
            <article className="rounded-[24px] border border-white/60 bg-white/60 p-4">
              <strong className="block text-3xl font-semibold text-ink-900">RBAC</strong>
              <span className="text-sm text-ink-500">Admin and shopper routes</span>
            </article>
          </div>
        </div>

        <div className={`${sectionClass} grid gap-4`}>
          {[
            {
              icon: ShieldCheck,
              title: "Protected workflows",
              text: "Role-aware sessions, admin gates, and shopper-only checkout.",
            },
            {
              icon: ShoppingBag,
              title: "Persistent cart",
              text: "Cart data stays available across refreshes and sign-in cycles.",
            },
            {
              icon: Truck,
              title: "Validated checkout",
              text: "Strict shipping, payment, and contact validation before submit.",
            },
          ].map((item) => (
            <article key={item.title} className="flex gap-4 rounded-[26px] border border-white/60 bg-white/70 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-100 text-mint-600">
                <item.icon size={18} />
              </div>
              <div>
                <strong className="text-lg font-semibold text-ink-900">{item.title}</strong>
                <p className="mt-2 text-sm leading-7 text-ink-500">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="catalog" className={`${sectionClass} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between`}>
        <div>
          <span className={eyebrowClass}>Catalog</span>
          <h2 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-4xl">
            Discover what is ready to ship.
          </h2>
        </div>
        <label
          className="flex min-w-0 items-center gap-3 rounded-full border border-ink-900/10 bg-white px-5 py-3 lg:min-w-[360px]"
          htmlFor="search-products"
        >
          <Search size={18} className="text-ink-500" />
          <input
            id="search-products"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by product, description, or brand"
            className="w-full border-0 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-500/70"
          />
        </label>
      </section>

      <section className="flex flex-wrap gap-3">
        {categoryLabels.map((label) => (
          <button
            key={label}
            type="button"
            className={cn(
              "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
              activeCategory === label
                ? "border-mint-600/20 bg-mint-100 text-mint-600"
                : "border-ink-900/10 bg-white/75 text-ink-700 hover:border-mint-600/25 hover:text-mint-600",
            )}
            onClick={() => handleCategoryClick(label)}
          >
            {label}
          </button>
        ))}
      </section>

      <section id="catalog-results" className="flex flex-col gap-2">
        <span className={eyebrowClass}>Filtered Results</span>
        <h2 className="text-3xl font-semibold text-ink-900">
          {activeCategory === "ALL"
            ? "Showing all available products"
            : `Showing products in ${activeCategory}`}
        </h2>
      </section>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products match this filter"
          message="Try a different category or search term to uncover more inventory."
        />
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </section>
      )}

      <section className={`${sectionClass} flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <span className={eyebrowClass}>Admin access</span>
          <h2 className="mt-3 text-3xl font-semibold text-ink-900">
            Need to review orders or update stock?
          </h2>
          <p className={`mt-3 ${mutedTextClass}`}>
            Use the provided admin mock credentials from the README to enter the dashboard.
          </p>
        </div>
        <Link to="/login" className={secondaryButtonClass}>
          Open Login
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

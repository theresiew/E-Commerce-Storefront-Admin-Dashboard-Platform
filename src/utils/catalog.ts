import { slugify } from "./formatters";

const STOREFRONT_CATEGORY_CONFIG = [
  {
    name: "Phones",
    terms: [
      "phones",
      "phone",
      "mobile phones",
      "mobile phone",
      "mobile",
      "smartphone",
      "smartphones",
      "iphone",
      "android",
      "samsung",
    ],
  },
  {
    name: "Laptops",
    terms: ["laptops", "laptop", "notebook", "notebooks", "macbook", "ultrabook"],
  },
  {
    name: "Electronics",
    terms: [
      "electronics",
      "audio",
      "camera",
      "cameras",
      "tablet",
      "tablets",
      "wearables",
      "wearable",
      "tv",
      "gaming",
      "board games",
    ],
  },
  {
    name: "Fashion",
    terms: [
      "fashion",
      "bags",
      "bag",
      "handbag",
      "handbags",
      "shoes",
      "shoe",
      "accessories",
      "jewelry",
      "watches",
      "watch",
      "mens clothing",
      "womens clothing",
      "kids clothing",
      "clothing",
      "apparel",
    ],
  },
  {
    name: "Beauty",
    terms: [
      "beauty",
      "skincare",
      "skin care",
      "makeup",
      "haircare",
      "hair care",
      "fragrances",
      "fragrance",
      "personal care",
      "cosmetic",
      "cosmetics",
      "loreal",
    ],
  },
  {
    name: "Home",
    terms: [
      "home",
      "appliances",
      "appliance",
      "furniture",
      "bedding",
      "home decor",
      "decor",
      "kitchenware",
      "lighting",
      "household",
    ],
  },
  {
    name: "Groceries",
    terms: [
      "groceries",
      "grocery",
      "beverages",
      "beverage",
      "snacks",
      "snack",
      "food",
      "drinks",
      "drink",
    ],
  },
  {
    name: "Sports",
    terms: [
      "sports",
      "fitness",
      "fitness equipment",
      "running",
      "cycling",
      "outdoor sports",
      "supplements",
    ],
  },
  {
    name: "Automotive",
    terms: ["automotive", "car electronics", "car", "cars", "motorcycles", "motorcycle", "auto"],
  },
];

type ProductLike = Record<string, any>;

function normalizeTerm(value = "") {
  return slugify(String(value)).replace(/-/g, " ");
}

export function getCatalogSearchText(product: ProductLike) {
  return normalizeTerm(
    [
      product?.title,
      product?.description,
      product?.brand,
      product?.category?.name,
      product?.category,
      product?.categoryId,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function getCategoryScore(product: ProductLike, categoryConfig: { terms: string[] }) {
  const haystack = getCatalogSearchText(product);

  return categoryConfig.terms.reduce((score, term) => {
    const normalizedTerm = normalizeTerm(term);

    if (!normalizedTerm || !haystack.includes(normalizedTerm)) {
      return score;
    }

    return score + normalizedTerm.split(" ").length + 1;
  }, 0);
}

export function getPrimaryStorefrontCategory(product: ProductLike) {
  const ranked = STOREFRONT_CATEGORY_CONFIG.map((category) => ({
    name: category.name,
    score: getCategoryScore(product, category),
  })).sort((left, right) => right.score - left.score);

  if (!ranked[0] || ranked[0].score === 0) {
    return null;
  }

  return ranked[0].name;
}

export function getVisibleStorefrontCategories(products: ProductLike[] = []) {
  return STOREFRONT_CATEGORY_CONFIG.filter((category) =>
    products.some((product) => getPrimaryStorefrontCategory(product) === category.name),
  );
}

export function filterCatalogProducts(
  products: ProductLike[] = [],
  activeCategory = "ALL",
  searchTerm = "",
) {
  const normalizedSearch = normalizeTerm(searchTerm);

  return products.filter((product) => {
    const storefrontCategory = getPrimaryStorefrontCategory(product);
    const categoryMatches =
      activeCategory === "ALL" ? true : storefrontCategory === activeCategory;
    const searchMatches = normalizedSearch
      ? getCatalogSearchText(product).includes(normalizedSearch)
      : true;

    return categoryMatches && searchMatches;
  });
}

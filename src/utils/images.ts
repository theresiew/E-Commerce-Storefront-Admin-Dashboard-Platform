import { getPrimaryStorefrontCategory } from "./catalog";

type ProductLike = Record<string, any>;

const CATEGORY_VISUALS = {
  Phones: {
    start: "#dff7f2",
    end: "#b7e7de",
    accent: "#167c73",
    shape: "phone",
  },
  Laptops: {
    start: "#edf2ff",
    end: "#cfdcff",
    accent: "#3859a8",
    shape: "laptop",
  },
  Electronics: {
    start: "#e8f6ff",
    end: "#c2e5ff",
    accent: "#0f6fa6",
    shape: "device",
  },
  Fashion: {
    start: "#fff1e8",
    end: "#ffd7bf",
    accent: "#b55d1e",
    shape: "bag",
  },
  Beauty: {
    start: "#fff0f6",
    end: "#ffd5e8",
    accent: "#c04f84",
    shape: "bottle",
  },
  Home: {
    start: "#f5f2e7",
    end: "#e8dcc3",
    accent: "#7d6540",
    shape: "home",
  },
  Groceries: {
    start: "#eef9e8",
    end: "#cdecbf",
    accent: "#4f8a2e",
    shape: "basket",
  },
  Sports: {
    start: "#f1efff",
    end: "#dad3ff",
    accent: "#5b49b3",
    shape: "sport",
  },
  Automotive: {
    start: "#eef1f5",
    end: "#d3dae3",
    accent: "#465a73",
    shape: "car",
  },
  Default: {
    start: "#dff2ee",
    end: "#f6ead9",
    accent: "#135d66",
    shape: "device",
  },
};

const IMAGE_MISMATCH_RULES = [
  {
    terms: ["flower", "flowers", "floral", "rose", "garden", "petal", "dahlia", "bee", "plant"],
    allowedCategories: ["Beauty"],
  },
  {
    terms: ["shoe", "sneaker", "nike", "adidas", "jordan"],
    allowedCategories: ["Fashion", "Sports"],
  },
  {
    terms: ["car", "vehicle", "motorcycle", "engine"],
    allowedCategories: ["Automotive"],
  },
];

function getCategoryVisual(categoryLabel: string) {
  return CATEGORY_VISUALS[categoryLabel] || CATEGORY_VISUALS.Default;
}

function getShapeMarkup(shape: string, accent: string) {
  switch (shape) {
    case "phone":
      return `<rect x="304" y="130" width="192" height="340" rx="34" fill="rgba(255,255,255,0.86)" stroke="${accent}" stroke-width="16" />
      <rect x="334" y="185" width="132" height="208" rx="18" fill="${accent}" opacity="0.18" />
      <circle cx="400" cy="432" r="12" fill="${accent}" opacity="0.85" />`;
    case "laptop":
      return `<rect x="228" y="164" width="344" height="210" rx="24" fill="rgba(255,255,255,0.86)" stroke="${accent}" stroke-width="16" />
      <rect x="256" y="194" width="288" height="152" rx="12" fill="${accent}" opacity="0.16" />
      <rect x="200" y="392" width="400" height="34" rx="17" fill="${accent}" opacity="0.85" />`;
    case "bag":
      return `<path d="M285 230c0-60 46-104 115-104s115 44 115 104" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" />
      <rect x="235" y="230" width="330" height="210" rx="38" fill="rgba(255,255,255,0.9)" stroke="${accent}" stroke-width="16" />
      <rect x="314" y="282" width="172" height="26" rx="13" fill="${accent}" opacity="0.18" />`;
    case "bottle":
      return `<rect x="332" y="142" width="136" height="82" rx="22" fill="${accent}" opacity="0.85" />
      <rect x="282" y="208" width="236" height="230" rx="62" fill="rgba(255,255,255,0.9)" stroke="${accent}" stroke-width="16" />
      <rect x="330" y="270" width="140" height="72" rx="18" fill="${accent}" opacity="0.18" />`;
    case "home":
      return `<path d="M230 296 400 160l170 136v140H230Z" fill="rgba(255,255,255,0.9)" stroke="${accent}" stroke-width="16" stroke-linejoin="round" />
      <rect x="360" y="332" width="80" height="104" rx="16" fill="${accent}" opacity="0.18" />`;
    case "basket":
      return `<path d="M262 288h276l-30 152H292Z" fill="rgba(255,255,255,0.9)" stroke="${accent}" stroke-width="16" stroke-linejoin="round" />
      <path d="M308 288c8-48 42-84 92-84s84 36 92 84" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" />
      <path d="M338 336v74M400 336v74M462 336v74" stroke="${accent}" stroke-width="14" stroke-linecap="round" opacity="0.35" />`;
    case "sport":
      return `<circle cx="400" cy="292" r="118" fill="rgba(255,255,255,0.9)" stroke="${accent}" stroke-width="16" />
      <path d="M328 224c52 24 92 72 110 134M470 206c-18 60-62 116-128 154M308 308h184" fill="none" stroke="${accent}" stroke-width="14" stroke-linecap="round" opacity="0.45" />`;
    case "car":
      return `<path d="M248 332h304l-26 58H274Z" fill="rgba(255,255,255,0.9)" stroke="${accent}" stroke-width="16" stroke-linejoin="round" />
      <path d="M300 332 352 246h96l58 86" fill="none" stroke="${accent}" stroke-width="16" stroke-linejoin="round" />
      <circle cx="320" cy="404" r="34" fill="${accent}" opacity="0.85" />
      <circle cx="480" cy="404" r="34" fill="${accent}" opacity="0.85" />`;
    default:
      return `<rect x="250" y="160" width="300" height="240" rx="32" fill="rgba(255,255,255,0.9)" stroke="${accent}" stroke-width="16" />
      <circle cx="400" cy="280" r="56" fill="${accent}" opacity="0.18" />`;
  }
}

function shouldUseCategoryPlaceholder(
  product: ProductLike,
  imageUrl: string,
  categoryLabel: string,
) {
  if (!imageUrl) {
    return true;
  }

  const normalizedUrl = String(imageUrl).toLowerCase();
  const productText = [
    product?.title,
    product?.description,
    product?.brand,
    product?.category?.name,
    product?.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return IMAGE_MISMATCH_RULES.some(
    (rule) =>
      rule.terms.some((term) => normalizedUrl.includes(term)) &&
      !rule.allowedCategories.includes(categoryLabel) &&
      !rule.terms.some((term) => productText.includes(term)),
  );
}

export function getProductImageUrl(product: ProductLike) {
  const imageUrl =
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    product?.image ||
    "";
  const storefrontCategory = getPrimaryStorefrontCategory(product) || "Default";

  if (shouldUseCategoryPlaceholder(product, imageUrl, storefrontCategory)) {
    return getProductPlaceholder(product?.title, storefrontCategory);
  }

  return imageUrl;
}

export function getProductPlaceholder(title = "Product", categoryLabel = "Default") {
  const safeTitle = String(title || "Product")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const safeCategory = String(categoryLabel || "Default")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const theme = getCategoryVisual(categoryLabel);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.start}" />
          <stop offset="100%" stop-color="${theme.end}" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)" />
      <circle cx="640" cy="120" r="120" fill="rgba(255,255,255,0.22)" />
      <circle cx="120" cy="500" r="110" fill="rgba(255,255,255,0.16)" />
      ${getShapeMarkup(theme.shape, theme.accent)}
      <text x="400" y="492" text-anchor="middle" font-size="22" font-family="Segoe UI, Arial, sans-serif" fill="${theme.accent}" font-weight="700">${safeCategory}</text>
      <text x="400" y="532" text-anchor="middle" font-size="34" font-family="Segoe UI, Arial, sans-serif" fill="#1f2937" font-weight="700">${safeTitle}</text>
    </svg>`
  )}`;
}

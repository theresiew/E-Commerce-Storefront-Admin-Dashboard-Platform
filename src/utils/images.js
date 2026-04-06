export function getProductImageUrl(product) {
  return (
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    product?.image ||
    ""
  );
}

export function getProductPlaceholder(title = "Product") {
  const label = encodeURIComponent(title);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#dff2ee" />
          <stop offset="100%" stop-color="#f6ead9" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)" />
      <circle cx="640" cy="120" r="120" fill="rgba(19,93,102,0.08)" />
      <circle cx="120" cy="500" r="110" fill="rgba(242,153,74,0.10)" />
      <rect x="170" y="150" rx="36" ry="36" width="460" height="220" fill="rgba(255,255,255,0.85)" />
      <text x="400" y="255" text-anchor="middle" font-size="42" font-family="Segoe UI, Arial, sans-serif" fill="#135d66" font-weight="700">${label}</text>
      <text x="400" y="308" text-anchor="middle" font-size="22" font-family="Segoe UI, Arial, sans-serif" fill="#627084">Preview image unavailable</text>
    </svg>`
  )}`;
}

export function normalizeProduct(product) {
  if (!product) {
    return product;
  }

  const normalizedImages =
    product.images && product.images.length > 0
      ? product.images
          .map((image) => {
            if (typeof image === "string") {
              return { url: image };
            }

            if (typeof image?.url === "string") {
              return { ...image, url: image.url };
            }

            if (typeof image?.url?.url === "string") {
              return { ...image, url: image.url.url };
            }

            return null;
          })
          .filter(Boolean)
      : product.image
        ? [{ url: product.image }]
        : [];

  return {
    ...product,
    id: product.id || product._id,
    _id: product._id || product.id,
    title: product.title || product.name || "Untitled product",
    description: product.description || product.details || "",
    brand: product.brand || product.manufacturer || "NovaCart",
    category: product.category || product.categoryName || "General",
    categoryId:
      product.categoryId ||
      product.category?._id ||
      product.category?.id ||
      "",
    price: Number(product.price || 0),
    stockQuantity: Number(
      product.stockQuantity ?? product.countInStock ?? product.stock ?? 0
    ),
    variantId: product.variantId || product.variants?.[0]?.id || null,
    images: normalizedImages,
  };
}

export function normalizeOrder(order) {
  if (!order) {
    return order;
  }

  return {
    ...order,
    id: order.id || order._id,
    _id: order._id || order.id,
    status: order.status || "PENDING",
    items: Array.isArray(order.items) ? order.items : [],
    totalPrice: Number(order.totalPrice ?? order.total ?? 0),
  };
}

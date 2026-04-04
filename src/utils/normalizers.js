export function normalizeProduct(product) {
  if (!product) {
    return product;
  }

  return {
    ...product,
    id: product.id || product._id,
    _id: product._id || product.id,
    title: product.title || product.name || "Untitled product",
    description: product.description || product.details || "",
    brand: product.brand || product.manufacturer || "NovaCart",
    category: product.category || product.categoryName || "General",
    price: Number(product.price || 0),
    stockQuantity: Number(
      product.stockQuantity ?? product.countInStock ?? product.stock ?? 0
    ),
    variantId: product.variantId || product.variants?.[0]?.id || null,
    images:
      product.images && product.images.length > 0
        ? product.images.map((image) => (typeof image === "string" ? { url: image } : image))
        : product.image
          ? [{ url: product.image }]
          : [],
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

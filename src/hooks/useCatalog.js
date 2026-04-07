import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";
import {
  fetchProductById,
  fetchProductsByCategory,
  fetchProducts,
} from "../api/products";
import { mergeDemoCategories, mergeDemoProducts } from "../lib/demoAdmin";

export function useProducts() {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  return {
    ...query,
    data: useMemo(() => mergeDemoProducts(query.data || []), [query.data]),
  };
}

export function useProductsByCategory(category) {
  const query = useQuery({
    queryKey: ["products", "category", category?.id || category?.name],
    queryFn: () => fetchProductsByCategory(category),
    enabled: Boolean(category?.id || category?.name),
  });

  return {
    ...query,
    data: useMemo(() => mergeDemoProducts(query.data || []), [query.data]),
  };
}

export function useProduct(productId) {
  const productsQuery = useProducts();
  const query = useQuery({
    queryKey: ["products", productId],
    queryFn: () => fetchProductById(productId),
    enabled: Boolean(productId),
  });

  const mergedProduct = useMemo(() => {
    const fromList = (productsQuery.data || []).find(
      (product) => String(product.id || product._id) === String(productId)
    );

    return fromList || query.data || null;
  }, [productId, productsQuery.data, query.data]);

  return {
    ...query,
    data: mergedProduct,
  };
}

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return {
    ...query,
    data: useMemo(() => mergeDemoCategories(query.data || []), [query.data]),
  };
}

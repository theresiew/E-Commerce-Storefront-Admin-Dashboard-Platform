import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";
import {
  fetchProductById,
  fetchProducts,
} from "../api/products";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

export function useProduct(productId) {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: () => fetchProductById(productId),
    enabled: Boolean(productId),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

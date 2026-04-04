import { useQuery } from "@tanstack/react-query";
import { fetchAllOrders, fetchMyOrders } from "../api/orders";

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "me"],
    queryFn: fetchMyOrders,
  });
}

export function useAllOrders() {
  return useQuery({
    queryKey: ["orders", "all"],
    queryFn: fetchAllOrders,
  });
}

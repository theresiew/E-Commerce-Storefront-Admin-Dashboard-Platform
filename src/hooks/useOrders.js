import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOrders, fetchMyOrders } from "../api/orders";
import { mergeDemoOrders } from "../lib/demoAdmin";

export function useMyOrders() {
  const query = useQuery({
    queryKey: ["orders", "me"],
    queryFn: fetchMyOrders,
  });

  return {
    ...query,
    data: useMemo(() => mergeDemoOrders(query.data || []), [query.data]),
  };
}

export function useAllOrders() {
  const query = useQuery({
    queryKey: ["orders", "all"],
    queryFn: fetchAllOrders,
  });

  return {
    ...query,
    data: useMemo(() => mergeDemoOrders(query.data || []), [query.data]),
  };
}

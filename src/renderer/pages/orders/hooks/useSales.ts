// src/renderer/pages/sales/hooks/useSales.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Order } from "../../../api/core/order";
import orderAPI from "../../../api/core/order";

export interface SalesFilters {
  search: string;
  status: string; // e.g. 'pending', 'confirmed', 'completed', 'cancelled', '' for all
  startDate: string;
  endDate: string;
}

export interface OrderWithDetails extends Order {
  // we can add computed fields if needed
  customer_name?: string;
}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseSalesReturn {
  orders: OrderWithDetails[];
  paginatedOrders: OrderWithDetails[];
  filters: SalesFilters;
  setFilters: React.Dispatch<React.SetStateAction<SalesFilters>>;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedOrders: number[];
  setSelectedOrders: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: string; direction: "asc" | "desc" }>
  >;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  reload: () => void;
  handleFilterChange: (key: keyof SalesFilters, value: string) => void;
  resetFilters: () => void;
  toggleOrderSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useSales = (initialFilters?: Partial<SalesFilters>): UseSalesReturn => {
  const [allOrders, setAllOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "created_at",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<SalesFilters>({
    search: "",
    status: "",
    startDate: "",
    endDate: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.backendAPI?.order) {
        throw new Error("Order API not available");
      }

      const params: any = {
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await orderAPI.getAll(params);
      if (!response.status) throw new Error(response.message || "Failed to fetch orders");

      // Add customer name from relation if available
      const ordersWithCustomer = response.data.map((order) => ({
        ...order,
        customer_name: order.customer?.name || "Walk-in",
      }));

      if (mountedRef.current) {
        setAllOrders(ordersWithCustomer);
        setSelectedOrders([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load orders");
        console.error("Order loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters.search, filters.status, filters.startDate, filters.endDate, sortConfig.key, sortConfig.direction]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Client-side sorting (although API already sorts, we keep for consistency)
  const sortedOrders = useMemo(() => {
    return allOrders;
  }, [allOrders]);

  const totalItems = sortedOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalItems,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback((key: keyof SalesFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleOrderSelection = useCallback((id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedOrders((prev) =>
      prev.length === paginatedOrders.length ? [] : paginatedOrders.map((o) => o.id)
    );
  }, [paginatedOrders]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    orders: sortedOrders,
    paginatedOrders,
    filters,
    setFilters,
    loading,
    error,
    pagination,
    selectedOrders,
    setSelectedOrders,
    sortConfig,
    setSortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleOrderSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useSales;
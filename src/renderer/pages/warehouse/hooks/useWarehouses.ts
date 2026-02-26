// src/renderer/pages/warehouse/hooks/useWarehouses.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Warehouse } from "../../../api/core/warehouse";
import warehouseAPI from "../../../api/core/warehouse";

export interface WarehouseFilters {
  search: string;
  type: string; // 'warehouse', 'store', 'online', ''
  is_active: string; // 'true', 'false', ''
}

export interface WarehouseWithDetails extends Warehouse {
  // any computed fields if needed
}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseWarehousesReturn {
  warehouses: WarehouseWithDetails[];
  paginatedWarehouses: WarehouseWithDetails[];
  filters: WarehouseFilters;
  setFilters: React.Dispatch<React.SetStateAction<WarehouseFilters>>;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedWarehouses: number[];
  setSelectedWarehouses: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: string; direction: "asc" | "desc" }>
  >;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  reload: () => void;
  handleFilterChange: (key: keyof WarehouseFilters, value: string) => void;
  resetFilters: () => void;
  toggleWarehouseSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useWarehouses = (initialFilters?: Partial<WarehouseFilters>): UseWarehousesReturn => {
  const [allWarehouses, setAllWarehouses] = useState<WarehouseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "created_at",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<WarehouseFilters>({
    search: "",
    type: "",
    is_active: "true", // default show active only
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.backendAPI?.warehouse) {
        throw new Error("Warehouse API not available");
      }

      const params: any = {
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.is_active !== "") params.is_active = filters.is_active === "true";

      const response = await warehouseAPI.getAll(params);
      if (!response.status) throw new Error(response.message || "Failed to fetch warehouses");

      if (mountedRef.current) {
        setAllWarehouses(response.data);
        setSelectedWarehouses([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load warehouses");
        console.error("Warehouse loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters.search, filters.type, filters.is_active, sortConfig.key, sortConfig.direction]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const sortedWarehouses = useMemo(() => {
    return allWarehouses;
  }, [allWarehouses]);

  const totalItems = sortedWarehouses.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedWarehouses = sortedWarehouses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalItems,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback((key: keyof WarehouseFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      type: "",
      is_active: "true",
    });
    setCurrentPage(1);
  }, []);

  const toggleWarehouseSelection = useCallback((id: number) => {
    setSelectedWarehouses((prev) =>
      prev.includes(id) ? prev.filter((wid) => wid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedWarehouses((prev) =>
      prev.length === paginatedWarehouses.length ? [] : paginatedWarehouses.map((w) => w.id)
    );
  }, [paginatedWarehouses]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    warehouses: sortedWarehouses,
    paginatedWarehouses,
    filters,
    setFilters,
    loading,
    error,
    pagination,
    selectedWarehouses,
    setSelectedWarehouses,
    sortConfig,
    setSortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleWarehouseSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useWarehouses;
// src/renderer/pages/purchases/hooks/usePurchases.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Purchase } from "../../../api/core/purchase";
import purchaseAPI from "../../../api/core/purchase";

export interface PurchaseFilters {
  search: string;
  status: string; // e.g. 'pending', 'ordered', 'received', 'cancelled', '' for all
  supplier: string;
  warehouse: string;
  startDate: string;
  endDate: string;
}

export interface PurchaseWithDetails extends Purchase {
  supplier_name?: string;
  warehouse_name?: string;
}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UsePurchasesReturn {
  purchases: PurchaseWithDetails[];
  paginatedPurchases: PurchaseWithDetails[];
  filters: PurchaseFilters;
  setFilters: React.Dispatch<React.SetStateAction<PurchaseFilters>>;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedPurchases: number[];
  setSelectedPurchases: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: string; direction: "asc" | "desc" }>
  >;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  reload: () => void;
  handleFilterChange: (key: keyof PurchaseFilters, value: string) => void;
  resetFilters: () => void;
  togglePurchaseSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const usePurchases = (initialFilters?: Partial<PurchaseFilters>): UsePurchasesReturn => {
  const [allPurchases, setAllPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchases, setSelectedPurchases] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "created_at",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<PurchaseFilters>({
    search: "",
    status: "",
    supplier: "",
    warehouse: "",
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

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.backendAPI?.purchase) {
        throw new Error("Purchase API not available");
      }

      const params: any = {
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.supplier) params.supplierId = parseInt(filters.supplier) || undefined;
      if (filters.warehouse) params.warehouseId = parseInt(filters.warehouse) || undefined;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await purchaseAPI.getAll(params);
      if (!response.status) throw new Error(response.message || "Failed to fetch purchases");

      // Add supplier and warehouse names from relations
      const purchasesWithDetails = response.data.map((purchase) => ({
        ...purchase,
        supplier_name: purchase.supplier?.name || "Unknown",
        warehouse_name: purchase.warehouse?.name || "Unknown",
      }));

      if (mountedRef.current) {
        setAllPurchases(purchasesWithDetails);
        setSelectedPurchases([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load purchases");
        console.error("Purchase loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    filters.search,
    filters.status,
    filters.supplier,
    filters.warehouse,
    filters.startDate,
    filters.endDate,
    sortConfig.key,
    sortConfig.direction,
  ]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const sortedPurchases = useMemo(() => {
    return allPurchases;
  }, [allPurchases]);

  const totalItems = sortedPurchases.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedPurchases = sortedPurchases.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalItems,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback((key: keyof PurchaseFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
      supplier: "",
      warehouse: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  }, []);

  const togglePurchaseSelection = useCallback((id: number) => {
    setSelectedPurchases((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedPurchases((prev) =>
      prev.length === paginatedPurchases.length ? [] : paginatedPurchases.map((p) => p.id)
    );
  }, [paginatedPurchases]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    purchases: sortedPurchases,
    paginatedPurchases,
    filters,
    setFilters,
    loading,
    error,
    pagination,
    selectedPurchases,
    setSelectedPurchases,
    sortConfig,
    setSortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    togglePurchaseSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default usePurchases;
// src/renderer/pages/stock-items/hooks/useStockItems.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { StockItem } from "../../../api/core/stockItem";
import stockItemAPI from "../../../api/core/stockItem";
import productAPI from "../../../api/core/product";
import warehouseAPI from "../../../api/core/warehouse";

export interface StockItemFilters {
  search: string;
  warehouse: string;
  stock_status: string; // 'low_stock', 'out_of_stock', 'normal', ''
}

export interface StockItemWithDetails extends StockItem {
  product_name: string;
  product_sku: string;
  warehouse_name: string;
  status: "normal" | "low-stock" | "out-of-stock";
}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseStockItemsReturn {
  stockItems: StockItemWithDetails[];
  paginatedStockItems: StockItemWithDetails[];
  filters: StockItemFilters;
  setFilters: React.Dispatch<React.SetStateAction<StockItemFilters>>;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedItems: number[];
  setSelectedItems: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: string; direction: "asc" | "desc" }>
  >;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  reload: () => void;
  handleFilterChange: (key: keyof StockItemFilters, value: string) => void;
  resetFilters: () => void;
  toggleItemSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useStockItems = (initialFilters?: Partial<StockItemFilters>): UseStockItemsReturn => {
  const [allStockItems, setAllStockItems] = useState<StockItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "created_at",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<StockItemFilters>({
    search: "",
    warehouse: "",
    stock_status: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchStockItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.backendAPI?.stockItem) {
        throw new Error("StockItem API not available");
      }

      const params: any = {
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      if (filters.search) params.search = filters.search;
      if (filters.warehouse) params.warehouseId = parseInt(filters.warehouse) || undefined;
      if (filters.stock_status === "low_stock") {
        // We'll filter client-side or need API support; for now client-side
      } else if (filters.stock_status === "out_of_stock") {
        // client-side
      } else if (filters.stock_status === "normal") {
        // client-side
      }

      const response = await stockItemAPI.getAll(params);
      if (!response.status) throw new Error(response.message || "Failed to fetch stock items");

      // Fetch product and warehouse details for each stock item
      const stockItemsWithDetails = await Promise.all(
        response.data.map(async (item) => {
          let product_name = "Unknown";
          let product_sku = "";
          let warehouse_name = "Unknown";

          try {
            if (item.product) {
              product_name = (item.product as any).name || "Unknown";
              product_sku = (item.product as any).sku || "";
            } else {
              // fallback: fetch product
              const prodRes = await productAPI.getById((item.product as any).id);
              if (prodRes.status) {
                product_name = prodRes.data.name;
                product_sku = prodRes.data.sku || "";
              }
            }
          } catch (e) {}

          try {
            if (item.warehouse) {
              warehouse_name = (item.warehouse as any).name || "Unknown";
            } else {
              const whRes = await warehouseAPI.getById((item.warehouse as any).id);
              if (whRes.status) {
                warehouse_name = whRes.data.name;
              }
            }
          } catch (e) {}

          const status: "normal" | "low-stock" | "out-of-stock" = 
            item.quantity === 0 ? "out-of-stock" :
            item.quantity <= item.reorder_level ? "low-stock" : "normal";

          return {
            ...item,
            product_name,
            product_sku,
            warehouse_name,
            status,
          };
        })
      );

      // Apply client-side filters
      let filtered = stockItemsWithDetails;
      if (filters.stock_status === "low_stock") {
        filtered = filtered.filter(item => item.status === "low-stock");
      } else if (filters.stock_status === "out_of_stock") {
        filtered = filtered.filter(item => item.status === "out-of-stock");
      } else if (filters.stock_status === "normal") {
        filtered = filtered.filter(item => item.status === "normal");
      }

      if (mountedRef.current) {
        setAllStockItems(filtered);
        setSelectedItems([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load stock items");
        console.error("Stock items loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    filters.search,
    filters.warehouse,
    filters.stock_status,
    sortConfig.key,
    sortConfig.direction,
  ]);

  useEffect(() => {
    fetchStockItems();
  }, [fetchStockItems]);

  const sortedStockItems = useMemo(() => {
    // Client-side sorting if needed, but API already sorts
    return allStockItems;
  }, [allStockItems]);

  const totalItems = sortedStockItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedStockItems = sortedStockItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalItems,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback((key: keyof StockItemFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      warehouse: "",
      stock_status: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedItems((prev) =>
      prev.length === paginatedStockItems.length ? [] : paginatedStockItems.map((i) => i.id)
    );
  }, [paginatedStockItems]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchStockItems();
  }, [fetchStockItems]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    stockItems: sortedStockItems,
    paginatedStockItems,
    filters,
    setFilters,
    loading,
    error,
    pagination,
    selectedItems,
    setSelectedItems,
    sortConfig,
    setSortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleItemSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useStockItems;
// src/renderer/pages/stock-movements/hooks/useStockMovements.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { StockMovement } from "../../../api/core/stockMovement";
import stockMovementAPI from "../../../api/core/stockMovement";
import productAPI from "../../../api/core/product";
import warehouseAPI from "../../../api/core/warehouse";

export interface MovementFilters {
  search: string;
  movement_type: string; // 'in', 'out', 'transfer_in', 'transfer_out', 'adjustment', ''
  warehouse: string; // warehouse ID or name
  user: string; // username or ID
  date_from: string; // YYYY-MM-DD
  date_to: string; // YYYY-MM-DD
  change_direction: string; // 'in', 'out', 'all'
}

export interface MovementWithDetails extends StockMovement {
  product_name: string;
  product_sku: string;
  warehouse_name: string;
  user_name: string;
  change_direction: "IN" | "OUT";
  net_effect: number;
}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseStockMovementsReturn {
  movements: MovementWithDetails[];
  paginatedMovements: MovementWithDetails[];
  filters: MovementFilters;
  setFilters: React.Dispatch<React.SetStateAction<MovementFilters>>;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  sortConfig: { key: string; direction: "asc" | "desc" };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: string; direction: "asc" | "desc" }>
  >;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  reload: () => void;
  handleFilterChange: (key: keyof MovementFilters, value: string) => void;
  resetFilters: () => void;
  handleSort: (key: string) => void;
}

const useStockMovements = (initialFilters?: Partial<MovementFilters>): UseStockMovementsReturn => {
  const [allMovements, setAllMovements] = useState<MovementWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "created_at",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<MovementFilters>({
    search: "",
    movement_type: "",
    warehouse: "",
    user: "",
    date_from: "",
    date_to: "",
    change_direction: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.backendAPI?.stockMovement) {
        throw new Error("StockMovement API not available");
      }

      const params: any = {
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      if (filters.search) params.search = filters.search;
      if (filters.movement_type) params.movement_type = filters.movement_type;
      if (filters.warehouse) params.warehouseId = parseInt(filters.warehouse) || undefined;
      if (filters.user) params.userId = parseInt(filters.user) || undefined;
      if (filters.date_from) params.startDate = filters.date_from;
      if (filters.date_to) params.endDate = filters.date_to;

      const response = await stockMovementAPI.getAll(params);
      if (!response.status) throw new Error(response.message || "Failed to fetch movements");

      // Enrich with product, warehouse, user names
      const movementsWithDetails = await Promise.all(
        response.data.map(async (movement) => {
          console.log(movement)
          let product_name = "Unknown";
          let product_sku = "";
          let warehouse_name = "Unknown";
          let user_name = "System";

          try {
            if (movement.stockItem?.product) {
              product_name = (movement.stockItem.product as any).name || "Unknown";
              product_sku = (movement.stockItem.product as any).sku || "";
            }
          } catch (e) {}

          try {
            if (movement.warehouse) {
              warehouse_name = (movement.warehouse as any).name || "Unknown";
            }else if (movement.stockItem){
              warehouse_name = movement.stockItem?.warehouse?.name || "Unknown"
            }
          } catch (e) {}

          // User name - from metadata or created_by (simplified)
        //   if (movement.metadata && movement.metadata.user) {
        //     user_name = movement.metadata.user;
        //   }
          const change_direction: "IN" | "OUT" = movement.change > 0 ? "IN" : "OUT";
          const net_effect = movement.change;

          return {
            ...movement,
            product_name,
            product_sku,
            warehouse_name,
            user_name,
            change_direction,
            net_effect,
          };
        })
      );

      // Apply client-side filters that aren't supported by API
      let filtered = movementsWithDetails;
      if (filters.change_direction === "in") {
        filtered = filtered.filter(m => m.change_direction === "IN");
      } else if (filters.change_direction === "out") {
        filtered = filtered.filter(m => m.change_direction === "OUT");
      }

      if (mountedRef.current) {
        setAllMovements(filtered);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load movements");
        console.error("Movement loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    filters.search,
    filters.movement_type,
    filters.warehouse,
    filters.user,
    filters.date_from,
    filters.date_to,
    filters.change_direction,
    sortConfig.key,
    sortConfig.direction,
  ]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const sortedMovements = useMemo(() => {
    return allMovements;
  }, [allMovements]);

  const totalItems = sortedMovements.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedMovements = sortedMovements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalItems,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback((key: keyof MovementFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      movement_type: "",
      warehouse: "",
      user: "",
      date_from: "",
      date_to: "",
      change_direction: "",
    });
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchMovements();
  }, [fetchMovements]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    movements: sortedMovements,
    paginatedMovements,
    filters,
    setFilters,
    loading,
    error,
    pagination,
    sortConfig,
    setSortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    handleSort,
  };
};

export default useStockMovements;
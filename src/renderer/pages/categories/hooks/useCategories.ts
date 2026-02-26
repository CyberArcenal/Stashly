// src/renderer/pages/categories/hooks/useCategories.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Category } from "../../../api/core/category";
import categoryAPI from "../../../api/core/category";

export interface CategoryFilters {
  search: string;
  is_active: string; // "true", "false", ""
}

export interface CategoryWithDetails extends Category {
  // walang extra fields, pero pwede magdagdag kung kinakailangan
  product_count?: number; // optional kung gusto mo i-display kung ilang produkto ang nasa category
}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseCategoriesReturn {
  categories: CategoryWithDetails[];
  paginatedCategories: CategoryWithDetails[];
  filters: CategoryFilters;
  setFilters: React.Dispatch<React.SetStateAction<CategoryFilters>>;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedCategories: number[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: string; direction: "asc" | "desc" }>
  >;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  reload: () => void;
  handleFilterChange: (key: keyof CategoryFilters, value: string) => void;
  resetFilters: () => void;
  toggleCategorySelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useCategories = (initialFilters?: Partial<CategoryFilters>): UseCategoriesReturn => {
  const [allCategories, setAllCategories] = useState<CategoryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "created_at",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<CategoryFilters>({
    search: "",
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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.backendAPI?.category) {
        throw new Error("Category API not available");
      }

      const params: any = {
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      if (filters.search) params.search = filters.search;
      if (filters.is_active !== "") params.is_active = filters.is_active === "true";

      const response = await categoryAPI.getAll(params);
      if (!response.status) throw new Error(response.message || "Failed to fetch categories");

      if (mountedRef.current) {
        setAllCategories(response.data);
        setSelectedCategories([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load categories");
        console.error("Category loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters.search, filters.is_active, sortConfig.key, sortConfig.direction]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Sorting (client-side kung kailangan, pero ang API ay sumusuporta na ng sorting)
  // Para sa consistency, ginagamit pa rin natin ang client-side sort kung gusto ng multi-column,
  // pero ang API ay nagbabalik na ng sorted base sa sortConfig.
  // Dito, ginagamit na lang natin ang response mula sa API (diretso na).
  const sortedCategories = useMemo(() => {
    // Kung gusto mo ng client-side fallback, pwede, pero sa ngayon diretsong gamitin ang allCategories
    return allCategories;
  }, [allCategories]);

  const totalItems = sortedCategories.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalItems,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback((key: keyof CategoryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      is_active: "true",
    });
    setCurrentPage(1);
  }, []);

  const toggleCategorySelection = useCallback((id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedCategories((prev) =>
      prev.length === paginatedCategories.length ? [] : paginatedCategories.map((c) => c.id)
    );
  }, [paginatedCategories]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    categories: sortedCategories,
    paginatedCategories,
    filters,
    setFilters,
    loading,
    error,
    pagination,
    selectedCategories,
    setSelectedCategories,
    sortConfig,
    setSortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleCategorySelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useCategories;
// src/renderer/pages/productTaxChanges/hooks/useProductTaxChanges.ts
import { useState, useEffect, useCallback } from 'react';
import { showError } from '../../../utils/notification';
import type { ProductTaxChange } from '../../../api/core/productTaxChange';
import productTaxChangeAPI from '../../../api/core/productTaxChange';

export interface Filters {
  productId?: number;
  variantId?: number;
  search?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useProductTaxChanges = (initialProductId?: number) => {
  const [changes, setChanges] = useState<ProductTaxChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    productId: initialProductId,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'changed_at',
    direction: 'desc',
  });

  const fetchChanges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction.toUpperCase(),
      };
      if (filters.productId) params.productId = filters.productId;
      if (filters.variantId) params.variantId = filters.variantId;
      if (filters.search) params.search = filters.search;

      const response = await productTaxChangeAPI.getAll(params);
      if (response.status) {
        setChanges(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortConfig, filters]);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ productId: initialProductId });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const setPage = (page: number) => setPagination(prev => ({ ...prev, page }));
  const setPageSize = (size: number) => setPagination(prev => ({ ...prev, limit: size, page: 1 }));

  return {
    changes,
    loading,
    error,
    filters,
    pagination,
    sortConfig,
    handleFilterChange,
    resetFilters,
    handleSort,
    setPage,
    setPageSize,
    reload: fetchChanges,
  };
};
// src/renderer/pages/taxes/hooks/useTaxes.ts
import { useState, useEffect, useCallback } from 'react';
import { showError } from '../../../utils/notification';
import type { Tax } from '../../../api/core/tax';
import taxAPI from '../../../api/core/tax';

export interface TaxFilters {
  is_enabled?: string;
  type?: string;
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useTaxes = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaxFilters>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });

  const fetchTaxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction.toUpperCase(),
      };
      if (filters.is_enabled && filters.is_enabled !== '') params.is_enabled = filters.is_enabled === 'true';
      if (filters.type && filters.type !== '') params.type = filters.type;
      if (filters.search) params.search = filters.search;

      const response = await taxAPI.getAll(params);
      if (response.status) {
        setTaxes(response.data);
        // Assuming the API returns pagination metadata (you may need to adjust)
        // For now, we'll just set total from response headers or default
        setPagination(prev => ({ ...prev, total: response.data.length })); // placeholder
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
    fetchTaxes();
  }, [fetchTaxes]);

  const handleFilterChange = (key: keyof TaxFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // reset to first page
  };

  const resetFilters = () => {
    setFilters({});
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
    taxes,
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
    reload: fetchTaxes,
  };
};
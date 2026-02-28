// src/renderer/pages/suppliers/hooks/useSuppliers.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import supplierAPI, { type Supplier } from '../../../api/core/supplier';

export interface SupplierFilters {
  search: string;
  status: 'all' | 'approved' | 'pending' | 'rejected';
  is_active: 'all' | 'active' | 'inactive';
  startDate: string;
  endDate: string;
}

export const useSuppliers = () => {
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupplierFilters>({
    search: '',
    status: 'all',
    is_active: 'all',
    startDate: '',
    endDate: '',
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierAPI.getAll();
      if (response.status) {
        setAllSuppliers(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Apply filters, sorting, pagination
  const filteredSuppliers = useMemo(() => {
    let filtered = allSuppliers.filter(s => {
      // search by name, contact_person, email, phone
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (
          !s.name.toLowerCase().includes(term) &&
          !(s.contact_person?.toLowerCase() || '').includes(term) &&
          !(s.email?.toLowerCase() || '').includes(term) &&
          !(s.phone?.toLowerCase() || '').includes(term)
        ) {
          return false;
        }
      }
      // status filter
      if (filters.status !== 'all' && s.status !== filters.status) return false;
      // active/inactive filter
      if (filters.is_active === 'active' && !s.is_active) return false;
      if (filters.is_active === 'inactive' && s.is_active) return false;
      // date range (created_at)
      if (filters.startDate) {
        const created = new Date(s.created_at);
        if (created < new Date(filters.startDate)) return false;
      }
      if (filters.endDate) {
        const created = new Date(s.created_at);
        if (created > new Date(filters.endDate)) return false;
      }
      return true;
    });

    // sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof Supplier];
        let bVal: any = b[sortConfig.key as keyof Supplier];
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allSuppliers, filters, sortConfig]);

  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);

  const handleFilterChange = (key: keyof SupplierFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      is_active: 'all',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const toggleSupplierSelection = (id: number) => {
    setSelectedSuppliers(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSuppliers.length === paginatedSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(paginatedSuppliers.map(s => s.id));
    }
  };

  return {
    suppliers: paginatedSuppliers,
    allSuppliers,
    filters,
    loading,
    error,
    pagination: {
      total: filteredSuppliers.length,
      totalPages,
    },
    selectedSuppliers,
    setSelectedSuppliers,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload: fetchAll,
    handleFilterChange,
    resetFilters,
    toggleSupplierSelection,
    toggleSelectAll,
    handleSort,
  };
};
// src/renderer/pages/customers/hooks/useCustomers.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import customerAPI, { type Customer } from '../../../api/core/customer';

export interface CustomerFilters {
  search: string;
  status: 'all' | 'regular' | 'vip' | 'elite';
  startDate: string;
  endDate: string;
}

export const useCustomers = () => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerAPI.getAll();
      if (response.status) {
        setAllCustomers(response.data);
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
  const filteredCustomers = useMemo(() => {
    let filtered = allCustomers.filter(c => {
      // search by name, email, phone
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (!c.name.toLowerCase().includes(term) &&
            !(c.email?.toLowerCase() || '').includes(term) &&
            !(c.phone?.toLowerCase() || '').includes(term)) {
          return false;
        }
      }
      // status filter
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      // date range (join date)
      if (filters.startDate) {
        const joinDate = new Date(c.createdAt);
        if (joinDate < new Date(filters.startDate)) return false;
      }
      if (filters.endDate) {
        const joinDate = new Date(c.createdAt);
        if (joinDate > new Date(filters.endDate)) return false;
      }
      return true;
    });

    // sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof Customer];
        let bVal = b[sortConfig.key as keyof Customer];
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allCustomers, filters, sortConfig]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: '', status: 'all', startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const toggleCustomerSelection = (id: number) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map(c => c.id));
    }
  };

  return {
    customers: paginatedCustomers,
    allCustomers,
    filters,
    loading,
    error,
    pagination: {
      total: filteredCustomers.length,
      totalPages,
    },
    selectedCustomers,
    setSelectedCustomers,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload: fetchAll,
    handleFilterChange,
    resetFilters,
    toggleCustomerSelection,
    toggleSelectAll,
    handleSort,
  };
};
// src/renderer/pages/loyalty/hooks/useLoyaltyTransactions.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import loyaltyAPI, { type LoyaltyTransaction } from '../../../api/core/loyalty';

export interface LoyaltyFilters {
  search: string;
  transactionType: 'all' | 'earn' | 'redeem' | 'refund';
  customerId: string; // search by customer name
  startDate: string;
  endDate: string;
}

export const useLoyaltyTransactions = () => {
  const [allTransactions, setAllTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LoyaltyFilters>({
    search: '',
    transactionType: 'all',
    customerId: '',
    startDate: '',
    endDate: '',
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'timestamp',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loyaltyAPI.getAll();
      if (response.status) {
        setAllTransactions(response.data);
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
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions.filter(tx => {
      // search by notes, customer name, order number
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesCustomer = tx.customer?.name?.toLowerCase().includes(term) ?? false;
        const matchesOrder = tx.order?.order_number?.toLowerCase().includes(term) ?? false;
        const matchesNotes = tx.notes?.toLowerCase().includes(term) ?? false;
        if (!matchesCustomer && !matchesOrder && !matchesNotes) return false;
      }
      // transaction type filter
      if (filters.transactionType !== 'all' && tx.transactionType !== filters.transactionType) return false;
      // customer name search (manual filter)
      if (filters.customerId) {
        const term = filters.customerId.toLowerCase();
        if (!tx.customer?.name?.toLowerCase().includes(term)) return false;
      }
      // date range
      if (filters.startDate) {
        const txDate = new Date(tx.timestamp);
        if (txDate < new Date(filters.startDate)) return false;
      }
      if (filters.endDate) {
        const txDate = new Date(tx.timestamp);
        if (txDate > new Date(filters.endDate)) return false;
      }
      return true;
    });

    // sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof LoyaltyTransaction];
        let bVal: any = b[sortConfig.key as keyof LoyaltyTransaction];
        if (sortConfig.key === 'customer') {
          aVal = a.customer?.name || '';
          bVal = b.customer?.name || '';
        }
        if (sortConfig.key === 'order') {
          aVal = a.order?.order_number || '';
          bVal = b.order?.order_number || '';
        }
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allTransactions, filters, sortConfig]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  const handleFilterChange = (key: keyof LoyaltyFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      transactionType: 'all',
      customerId: '',
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

  const toggleTransactionSelection = (id: number) => {
    setSelectedTransactions(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === paginatedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(paginatedTransactions.map(t => t.id));
    }
  };

  return {
    transactions: paginatedTransactions,
    allTransactions,
    filters,
    loading,
    error,
    pagination: {
      total: filteredTransactions.length,
      totalPages,
    },
    selectedTransactions,
    setSelectedTransactions,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload: fetchAll,
    handleFilterChange,
    resetFilters,
    toggleTransactionSelection,
    toggleSelectAll,
    handleSort,
  };
};
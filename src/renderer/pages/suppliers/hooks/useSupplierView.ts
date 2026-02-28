// src/renderer/pages/suppliers/hooks/useSupplierView.ts
import { useState } from 'react';
import supplierAPI, { type Supplier } from '../../../api/core/supplier';
import purchaseAPI, { type Purchase } from '../../../api/core/purchase';
import { showError } from '../../../utils/notification';

export const useSupplierView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await supplierAPI.getById(id);
      if (!response.status) throw new Error(response.message);
      setSupplier(response.data);
    } catch (err: any) {
      showError(err.message || 'Failed to load supplier details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    if (!supplier || purchases.length > 0 || loadingPurchases) return;
    setLoadingPurchases(true);
    try {
      const response = await purchaseAPI.getBySupplier(supplier.id, { limit: 50 });
      if (response.status) {
        setPurchases(response.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load purchases');
    } finally {
      setLoadingPurchases(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setSupplier(null);
    setPurchases([]);
  };

  return {
    isOpen,
    loading,
    supplier,
    purchases,
    loadingPurchases,
    open,
    fetchPurchases,
    close,
  };
};
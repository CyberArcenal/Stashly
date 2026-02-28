// src/renderer/pages/purchases/hooks/usePurchaseView.ts
import { useState } from 'react';
import purchaseAPI, { type Purchase } from '../../../api/core/purchase';
import { showError } from '../../../utils/notification';

export const usePurchaseView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await purchaseAPI.getById(id);
      if (!response.status) throw new Error(response.message);
      setPurchase(response.data);
    } catch (err: any) {
      showError(err.message || 'Failed to load purchase details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setPurchase(null);
  };

  return {
    isOpen,
    loading,
    purchase,
    open,
    close,
  };
};
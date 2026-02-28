// src/renderer/pages/sales/hooks/useOrderView.ts
import { useState } from 'react';
import orderAPI, { type Order } from '../../../api/core/order';
import { showError } from '../../../utils/notification';

export const useOrderView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await orderAPI.getById(id);
      if (!response.status) throw new Error(response.message);
      setOrder(response.data);
    } catch (err: any) {
      showError(err.message || 'Failed to load order details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setOrder(null);
  };

  return {
    isOpen,
    loading,
    order,
    open,
    close,
  };
};
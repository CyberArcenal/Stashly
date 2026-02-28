// src/renderer/pages/loyalty/hooks/useLoyaltyView.ts
import { useState } from 'react';
import loyaltyAPI from '../../../api/core/loyalty';
import type { LoyaltyTransaction } from '../../../api/core/loyalty';

export const useLoyaltyView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<LoyaltyTransaction | null>(null);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await loyaltyAPI.getById(id);
      if (response.status) {
        setTransaction(response.data);
      } else {
        setTransaction(null);
      }
    } catch (error) {
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setTransaction(null);
  };

  return {
    isOpen,
    loading,
    transaction,
    open,
    close,
  };
};
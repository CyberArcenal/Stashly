// src/renderer/pages/stock-movements/hooks/useMovementView.ts
import { useState } from 'react';
import stockMovementAPI from '../../../api/core/stockMovement';
import type { StockMovement } from '../../../api/core/stockMovement';
import type { MovementWithDetails } from './useStockMovements';
import { showError } from '../../../utils/notification';

export const useMovementView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [movement, setMovement] = useState<MovementWithDetails | null>(null);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await stockMovementAPI.getById(id);
      if (!response.status) throw new Error(response.message);
      const data = response.data;


      // Enrich with details (similar to useStockMovements)
      const movementWithDetails: MovementWithDetails = {
        ...data,
        product_name: (data.stockItem?.product as any)?.name || 'Unknown',
        product_sku: (data.stockItem?.product as any)?.sku || '',
        warehouse_name: data.warehouse?.name || data.stockItem?.warehouse?.name || 'Unknown',
        user_name: JSON.parse(data.metadata as string)?.user || 'System',
        change_direction: data.change > 0 ? 'IN' : 'OUT',
        net_effect: data.change,
      };
      setMovement(movementWithDetails);
    } catch (err: any) {
      showError(err.message || 'Failed to load movement details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setMovement(null);
  };

  return {
    isOpen,
    loading,
    movement,
    open,
    close,
  };
};
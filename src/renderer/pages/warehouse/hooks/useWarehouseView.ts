// src/renderer/pages/warehouse/hooks/useWarehouseView.ts
import { useState } from 'react';
import warehouseAPI, { type Warehouse } from '../../../api/core/warehouse';
import stockItemAPI, { type StockItem } from '../../../api/core/stockItem';
import stockMovementAPI, { type StockMovement } from '../../../api/core/stockMovement';
import { showError } from '../../../utils/notification';

export const useWarehouseView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await warehouseAPI.getById(id);
      if (!response.status) throw new Error(response.message);
      setWarehouse(response.data);
    } catch (err: any) {
      showError(err.message || 'Failed to load warehouse details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockItems = async () => {
    if (!warehouse || stockItems.length > 0 || loadingStock) return;
    setLoadingStock(true);
    try {
      const response = await stockItemAPI.getByWarehouse(warehouse.id, { limit: 50 });
      if (response.status) {
        setStockItems(response.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load stock items');
    } finally {
      setLoadingStock(false);
    }
  };

  const fetchMovements = async () => {
    if (!warehouse || movements.length > 0 || loadingMovements) return;
    setLoadingMovements(true);
    try {
      const response = await stockMovementAPI.getByWarehouse(warehouse.id, { limit: 50 });
      if (response.status) {
        setMovements(response.data.items || []);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load movements');
    } finally {
      setLoadingMovements(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setWarehouse(null);
    setStockItems([]);
    setMovements([]);
  };

  return {
    isOpen,
    loading,
    warehouse,
    stockItems,
    movements,
    loadingStock,
    loadingMovements,
    open,
    fetchStockItems,
    fetchMovements,
    close,
  };
};
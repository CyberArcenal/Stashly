// src/renderer/pages/products/hooks/useVariantView.ts
import { useState } from 'react';
import productVariantAPI, { type ProductVariant } from '../../../api/core/productVariant';
import stockItemAPI, { type StockItem } from '../../../api/core/stockItem';
import stockMovementAPI, { type StockMovement } from '../../../api/core/stockMovement';
import { showError } from '../../../utils/notification';

export const useVariantView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      // Fetch variant details
      const variantRes = await productVariantAPI.getById(id);
      if (!variantRes.status) throw new Error(variantRes.message);
      const variantData = variantRes.data;
      setVariant(variantData);

      // Stock items might be included in variant, but fetch separately to be safe
      const stockRes = await stockItemAPI.getAll({ variantId: id });
      if (stockRes.status) {
        setStockItems(stockRes.data || []);
      } else {
        // Fallback to variant's stockItems if any
        setStockItems(variantData.stockItems || []);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load variant details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    if (movements.length > 0 || loadingMovements) return;
    setLoadingMovements(true);
    try {
      // Get all stock item IDs
      const stockItemIds = stockItems.map(s => s.id);
      if (stockItemIds.length === 0) {
        setMovements([]);
        return;
      }

      // Fetch movements for each stock item (limit 50 each)
      const movementPromises = stockItemIds.map(id =>
        stockMovementAPI.getByStockItem(id, { limit: 50 })
      );
      const movementResults = await Promise.all(movementPromises);
      const allMovements = movementResults.flatMap(res => res.data || []);
      setMovements(allMovements);
    } catch (err: any) {
      showError(err.message || 'Failed to load movements');
    } finally {
      setLoadingMovements(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setVariant(null);
    setStockItems([]);
    setMovements([]);
  };

  return {
    isOpen,
    loading,
    variant,
    stockItems,
    movements,
    loadingMovements,
    open,
    fetchMovements,
    close,
  };
};
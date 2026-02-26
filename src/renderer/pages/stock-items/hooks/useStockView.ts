// src/renderer/pages/stock-items/hooks/useStockView.ts
import { useState } from "react";
import type { StockItemWithDetails } from "./useStockItems";
import stockItemAPI from "../../../api/core/stockItem";

interface UseStockViewReturn {
  isOpen: boolean;
  stockItem: StockItemWithDetails | null;
  loading: boolean;
  open: (id: number) => void;
  close: () => void;
}

const useStockView = (): UseStockViewReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [stockItem, setStockItem] = useState<StockItemWithDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const open = async (id: number) => {
    setLoading(true);
    setIsOpen(true);
    try {
      const response = await stockItemAPI.getById(id);
      if (response.status) {
        // Build details (similar to fetch in useStockItems)
        const item = response.data;
        const stockItemWithDetails: StockItemWithDetails = {
          ...item,
          product_name: (item.product as any)?.name || "Unknown",
          product_sku: (item.product as any)?.sku || "",
          warehouse_name: (item.warehouse as any)?.name || "Unknown",
          status: item.quantity === 0 ? "out-of-stock" :
                  item.quantity <= item.reorder_level ? "low-stock" : "normal",
        };
        setStockItem(stockItemWithDetails);
      } else {
        setStockItem(null);
      }
    } catch (error) {
      setStockItem(null);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setStockItem(null);
  };

  return {
    isOpen,
    stockItem,
    loading,
    open,
    close,
  };
};

export default useStockView;
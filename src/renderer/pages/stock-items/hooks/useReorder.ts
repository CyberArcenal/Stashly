// src/renderer/pages/stock-items/hooks/useReorder.ts
import { useState } from "react";
import type { StockItemWithDetails } from "./useStockItems";

interface UseReorderReturn {
  isOpen: boolean;
  stockItem: StockItemWithDetails | null;
  open: (item: StockItemWithDetails) => void;
  close: () => void;
}

const useReorder = (): UseReorderReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [stockItem, setStockItem] = useState<StockItemWithDetails | null>(null);

  const open = (item: StockItemWithDetails) => {
    setStockItem(item);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setStockItem(null);
  };

  return {
    isOpen,
    stockItem,
    open,
    close,
  };
};

export default useReorder;
// src/renderer/pages/purchases/hooks/usePurchaseView.ts
import { useState } from "react";
import type { Purchase } from "../../../api/core/purchase";

interface UsePurchaseViewReturn {
  isOpen: boolean;
  purchase: Purchase | null;
  loading: boolean;
  open: (id: number) => void;
  close: () => void;
}

const usePurchaseView = (): UsePurchaseViewReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);

  const open = (id: number) => {
    setLoading(true);
    // In real implementation, fetch purchase by id
    setTimeout(() => {
      setPurchase({
        id,
        purchase_number: `PO-${id}`,
        status: "pending",
        subtotal: 2000,
        tax_amount: 200,
        total: 2200,
        notes: "Sample purchase",
        is_received: false,
        received_at: null,
        proceed_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        supplier: { id: 1, name: "ABC Supplier" },
        warehouse: { id: 1, name: "Main Warehouse" },
      } as Purchase);
      setLoading(false);
    }, 500);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setPurchase(null);
  };

  return {
    isOpen,
    purchase,
    loading,
    open,
    close,
  };
};

export default usePurchaseView;
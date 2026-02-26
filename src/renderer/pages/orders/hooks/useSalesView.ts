// src/renderer/pages/sales/hooks/useSalesView.ts
import { useState } from "react";
import type { Order } from "../../../api/core/order";

interface UseSalesViewReturn {
  isOpen: boolean;
  order: Order | null;
  loading: boolean;
  open: (id: number) => void;
  close: () => void;
}

const useSalesView = (): UseSalesViewReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const open = (id: number) => {
    setLoading(true);
    // In real implementation, fetch order by id
    // For placeholder, we just set a dummy
    setTimeout(() => {
      setOrder({
        id,
        order_number: `ORD-${id}`,
        status: "pending",
        subtotal: 1000,
        tax_amount: 120,
        total: 1120,
        notes: "Sample order",
        inventory_processed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        customer: { id: 1, name: "John Doe" },
      } as Order);
      setLoading(false);
    }, 500);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setOrder(null);
  };

  return {
    isOpen,
    order,
    loading,
    open,
    close,
  };
};

export default useSalesView;
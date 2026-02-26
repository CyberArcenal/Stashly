// src/renderer/pages/sales/hooks/useSalesForm.ts
import { useState } from "react";
import type { Order } from "../../../api/core/order";

type FormMode = "add" | "edit";

interface UseSalesFormReturn {
  isOpen: boolean;
  mode: FormMode;
  orderId: number | null;
  initialData: Partial<Order> | null;
  openAdd: () => void;
  openEdit: (order: Order) => void;
  close: () => void;
}

const useSalesForm = (): UseSalesFormReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("add");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Partial<Order> | null>(null);

  const openAdd = () => {
    setMode("add");
    setOrderId(null);
    setInitialData({});
    setIsOpen(true);
  };

  const openEdit = (order: Order) => {
    setMode("edit");
    setOrderId(order.id);
    setInitialData(order);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setOrderId(null);
    setInitialData(null);
  };

  return {
    isOpen,
    mode,
    orderId,
    initialData,
    openAdd,
    openEdit,
    close,
  };
};

export default useSalesForm;
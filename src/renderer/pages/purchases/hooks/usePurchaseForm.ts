// src/renderer/pages/purchases/hooks/usePurchaseForm.ts
import { useState } from "react";
import type { Purchase } from "../../../api/core/purchase";

type FormMode = "add" | "edit";

interface UsePurchaseFormReturn {
  isOpen: boolean;
  mode: FormMode;
  purchaseId: number | null;
  initialData: Partial<Purchase> | null;
  openAdd: () => void;
  openEdit: (purchase: Purchase) => void;
  close: () => void;
}

const usePurchaseForm = (): UsePurchaseFormReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("add");
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Partial<Purchase> | null>(null);

  const openAdd = () => {
    setMode("add");
    setPurchaseId(null);
    setInitialData({});
    setIsOpen(true);
  };

  const openEdit = (purchase: Purchase) => {
    setMode("edit");
    setPurchaseId(purchase.id);
    setInitialData(purchase);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setPurchaseId(null);
    setInitialData(null);
  };

  return {
    isOpen,
    mode,
    purchaseId,
    initialData,
    openAdd,
    openEdit,
    close,
  };
};

export default usePurchaseForm;
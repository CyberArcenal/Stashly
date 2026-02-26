// src/renderer/pages/warehouse/hooks/useWarehouseForm.ts
import { useState } from "react";
import type { Warehouse } from "../../../api/core/warehouse";

type FormMode = "add" | "edit";

interface UseWarehouseFormReturn {
  isOpen: boolean;
  mode: FormMode;
  warehouseId: number | null;
  initialData: Partial<Warehouse> | null;
  openAdd: () => void;
  openEdit: (warehouse: Warehouse) => void;
  close: () => void;
}

const useWarehouseForm = (): UseWarehouseFormReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("add");
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Partial<Warehouse> | null>(null);

  const openAdd = () => {
    setMode("add");
    setWarehouseId(null);
    setInitialData({});
    setIsOpen(true);
  };

  const openEdit = (warehouse: Warehouse) => {
    setMode("edit");
    setWarehouseId(warehouse.id);
    setInitialData(warehouse);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setWarehouseId(null);
    setInitialData(null);
  };

  return {
    isOpen,
    mode,
    warehouseId,
    initialData,
    openAdd,
    openEdit,
    close,
  };
};

export default useWarehouseForm;
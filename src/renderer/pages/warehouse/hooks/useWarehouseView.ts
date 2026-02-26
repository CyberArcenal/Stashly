// src/renderer/pages/warehouse/hooks/useWarehouseView.ts
import { useState } from "react";
import type { Warehouse } from "../../../api/core/warehouse";

interface UseWarehouseViewReturn {
  isOpen: boolean;
  warehouse: Warehouse | null;
  loading: boolean;
  open: (id: number) => void;
  close: () => void;
}

const useWarehouseView = (): UseWarehouseViewReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(false);

  const open = (id: number) => {
    setLoading(true);
    // In real implementation, fetch warehouse by id
    setTimeout(() => {
      setWarehouse({
        id,
        name: `Warehouse ${id}`,
        type: "warehouse",
        location: "Sample Location",
        limit_capacity: 1000,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
      } as Warehouse);
      setLoading(false);
    }, 500);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setWarehouse(null);
  };

  return {
    isOpen,
    warehouse,
    loading,
    open,
    close,
  };
};

export default useWarehouseView;
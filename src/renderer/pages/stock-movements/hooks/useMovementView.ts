// src/renderer/pages/stock-movements/hooks/useMovementView.ts
import { useState } from "react";
import type { MovementWithDetails } from "./useStockMovements";
import stockMovementAPI from "../../../api/core/stockMovement";

interface UseMovementViewReturn {
  isOpen: boolean;
  movement: MovementWithDetails | null;
  loading: boolean;
  open: (movement: MovementWithDetails) => void;
  close: () => void;
}

const useMovementView = (): UseMovementViewReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [movement, setMovement] = useState<MovementWithDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const open = (movement: MovementWithDetails) => {
    setMovement(movement);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setMovement(null);
  };

  return {
    isOpen,
    movement,
    loading,
    open,
    close,
  };
};

export default useMovementView;
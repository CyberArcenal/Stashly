// src/renderer/pages/inventory/hooks/useProductImageForm.ts
import { useState } from 'react';

interface UseProductImageFormReturn {
  isOpen: boolean;
  productId: number | null;
  open: (productId: number) => void;
  close: () => void;
}

export const useProductImageForm = (): UseProductImageFormReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);

  const open = (id: number) => {
    setProductId(id);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setProductId(null);
  };

  return {
    isOpen,
    productId,
    open,
    close,
  };
};
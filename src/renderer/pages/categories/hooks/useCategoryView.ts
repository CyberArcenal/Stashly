// src/renderer/pages/categories/hooks/useCategoryView.ts
import { useState } from "react";
import type { Category } from "../../../api/core/category";

interface UseCategoryViewReturn {
  isOpen: boolean;
  category: Category | null;
  loading: boolean;
  open: (id: number) => void;
  close: () => void;
}

const useCategoryView = (): UseCategoryViewReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const open = (id: number) => {
    // placeholder: hindi pa talaga kinukuha ang data, magla-load mamaya sa dialog
    setLoading(true);
    // Dito sa future mo gagawin ang API call
    setIsOpen(true);
    setLoading(false);
  };

  const close = () => {
    setIsOpen(false);
    setCategory(null);
  };

  return {
    isOpen,
    category,
    loading,
    open,
    close,
  };
};

export default useCategoryView;
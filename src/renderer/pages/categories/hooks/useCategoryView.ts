// src/renderer/pages/categories/hooks/useCategoryView.ts
import { useState } from 'react';
import categoryAPI, { type Category } from '../../../api/core/category';
import productAPI, { type Product } from '../../../api/core/product';
import { showError } from '../../../utils/notification';

export const useCategoryView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await categoryAPI.getById(id);
      if (!response.status) throw new Error(response.message);
      setCategory(response.data);
    } catch (err: any) {
      showError(err.message || 'Failed to load category details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!category || products.length > 0 || loadingProducts) return;
    setLoadingProducts(true);
    try {
      const response = await productAPI.getAll({ categoryId: category.id, limit: 50 });
      if (response.status) {
        setProducts(response.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setCategory(null);
    setProducts([]);
  };

  return {
    isOpen,
    loading,
    category,
    products,
    loadingProducts,
    open,
    fetchProducts,
    close,
  };
};
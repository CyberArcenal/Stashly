// src/renderer/pages/inventory/hooks/useProductTaxAssignment.ts
import { useState, useCallback, useMemo } from 'react';
import { dialogs } from '../../../utils/dialogs';
import type { Tax } from '../../../api/core/tax';
import type { Product } from '../../../api/core/product';
import taxAPI from '../../../api/core/tax';
import productAPI from '../../../api/core/product';

export const useProductTaxAssignment = (onSuccess?: () => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);
  const [selectedTaxIds, setSelectedTaxIds] = useState<number[]>([]);

  const open = useCallback(async (productId: number) => {
    setLoading(true);
    setIsOpen(true);
    try {
      const productRes = await productAPI.getById(productId);
      if (!productRes.status) throw new Error(productRes.message);
      setProduct(productRes.data);
      
      const currentTaxIds = productRes.data.taxes?.map(t => t.id) || [];
      setSelectedTaxIds(currentTaxIds);

      const taxesRes = await taxAPI.getAll({ is_enabled: true });
      if (taxesRes.status) {
        setAvailableTaxes(taxesRes.data);
      }
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to load product tax data');
      setIsOpen(false);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setProduct(null);
    setAvailableTaxes([]);
    setSelectedTaxIds([]);
    setLoading(false);
    setSaving(false);
  }, []);

  const currentGrossPrice = useMemo(() => {
    if (!product || !product.net_price) return 0;
    const productTaxes = availableTaxes.filter(t => 
      product.taxes?.some(pt => pt.id === t.id) && t.is_enabled && !t.is_deleted
    );
    let gross = product.net_price;
    for (const tax of productTaxes) {
      if (tax.type === 'percentage') gross = gross * (1 + tax.rate / 100);
      else gross = gross + tax.rate;
    }
    return gross;
  }, [product, availableTaxes]);

  const newGrossPrice = useMemo(() => {
    if (!product || !product.net_price) return 0;
    const selectedTaxes = availableTaxes.filter(t => selectedTaxIds.includes(t.id));
    let gross = product.net_price;
    for (const tax of selectedTaxes) {
      if (tax.type === 'percentage') gross = gross * (1 + tax.rate / 100);
      else gross = gross + tax.rate;
    }
    return gross;
  }, [product, selectedTaxIds, availableTaxes]);

  const handleSave = useCallback(async () => {
    if (!product) return;
    setSaving(true);
    try {
      await productAPI.update(product.id, { taxIds: selectedTaxIds });
      dialogs.success('Product taxes updated successfully');
      onSuccess?.();
      close();
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to update taxes');
    } finally {
      setSaving(false);
    }
  }, [product, selectedTaxIds, close, onSuccess]);

  return {
    isOpen,
    loading,
    saving,
    product,
    availableTaxes,
    selectedTaxIds,
    setSelectedTaxIds,
    currentGrossPrice,
    newGrossPrice,
    open,
    close,
    handleSave,
  };
};
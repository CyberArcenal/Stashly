// src/renderer/pages/productVariant/hooks/useVariantTaxAssignment.ts
import { useState, useCallback, useMemo } from 'react';
import { dialogs } from '../../../utils/dialogs';
import type { Tax } from '../../../api/core/tax';
import type { ProductVariant } from '../../../api/core/productVariant';
import taxAPI from '../../../api/core/tax';
import productVariantAPI from '../../../api/core/productVariant';

export const useVariantTaxAssignment = (onSuccess?: () => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);
  const [selectedTaxIds, setSelectedTaxIds] = useState<number[]>([]);

  const open = useCallback(async (variantId: number) => {
    setLoading(true);
    setIsOpen(true);
    try {
      const variantRes = await productVariantAPI.getById(variantId);
      if (!variantRes.status) throw new Error(variantRes.message);
      setVariant(variantRes.data);
      
      const currentTaxIds = variantRes.data.taxes?.map(t => t.id) || [];
      setSelectedTaxIds(currentTaxIds);

      const taxesRes = await taxAPI.getAll({ is_enabled: true });
      if (taxesRes.status) {
        setAvailableTaxes(taxesRes.data);
      }
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to load variant tax data');
      setIsOpen(false);
      setVariant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setVariant(null);
    setAvailableTaxes([]);
    setSelectedTaxIds([]);
    setLoading(false);
    setSaving(false);
  }, []);

  const currentGrossPrice = useMemo(() => {
    if (!variant || !variant.net_price) return 0;
    const variantTaxes = availableTaxes.filter(t => 
      variant.taxes?.some(pt => pt.id === t.id) && t.is_enabled && !t.is_deleted
    );
    let gross = variant.net_price;
    for (const tax of variantTaxes) {
      if (tax.type === 'percentage') gross = gross * (1 + tax.rate / 100);
      else gross = gross + tax.rate;
    }
    return gross;
  }, [variant, availableTaxes]);

  const newGrossPrice = useMemo(() => {
    if (!variant || !variant.net_price) return 0;
    const selectedTaxes = availableTaxes.filter(t => selectedTaxIds.includes(t.id));
    let gross = variant.net_price;
    for (const tax of selectedTaxes) {
      if (tax.type === 'percentage') gross = gross * (1 + tax.rate / 100);
      else gross = gross + tax.rate;
    }
    return gross;
  }, [variant, selectedTaxIds, availableTaxes]);

  const handleSave = useCallback(async () => {
    if (!variant) return;
    setSaving(true);
    try {
      await productVariantAPI.update(variant.id, { taxIds: selectedTaxIds });
      dialogs.success('Variant taxes updated successfully');
      onSuccess?.();
      close();
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to update taxes');
    } finally {
      setSaving(false);
    }
  }, [variant, selectedTaxIds, close, onSuccess]);

  return {
    isOpen,
    loading,
    saving,
    variant,
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
// src/renderer/pages/taxes/hooks/useTaxForm.ts
import { useState, useCallback } from 'react';
import type { Tax } from '../../../api/core/tax';

interface UseTaxFormReturn {
  isOpen: boolean;
  mode: 'add' | 'edit';
  taxId: number | null;
  initialData: Partial<Tax> | null;
  openAdd: () => void;
  openEdit: (tax: Tax) => void;
  close: () => void;
}

export const useTaxForm = (): UseTaxFormReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [taxId, setTaxId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Partial<Tax> | null>(null);

  const openAdd = useCallback(() => {
    setMode('add');
    setTaxId(null);
    setInitialData(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((tax: Tax) => {
    setMode('edit');
    setTaxId(tax.id);
    setInitialData(tax);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing to allow animation
    setTimeout(() => {
      setMode('add');
      setTaxId(null);
      setInitialData(null);
    }, 200);
  }, []);

  return { isOpen, mode, taxId, initialData, openAdd, openEdit, close };
};
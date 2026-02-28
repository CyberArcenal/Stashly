// src/renderer/pages/suppliers/hooks/useSupplierForm.ts
import { useState } from 'react';
import type { Supplier } from '../../../api/core/supplier';

export const useSupplierForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Partial<Supplier> | null>(null);

  const openAdd = () => {
    setMode('add');
    setSupplierId(null);
    setInitialData(null);
    setIsOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setMode('edit');
    setSupplierId(supplier.id);
    setInitialData(supplier);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setSupplierId(null);
    setInitialData(null);
  };

  return {
    isOpen,
    mode,
    supplierId,
    initialData,
    openAdd,
    openEdit,
    close,
  };
};
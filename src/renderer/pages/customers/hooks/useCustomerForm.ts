// src/renderer/pages/customers/hooks/useCustomerForm.ts
import { useState } from 'react';
import type { Customer } from '../../../api/core/customer';

export const useCustomerForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Partial<Customer> | null>(null);

  const openAdd = () => {
    setMode('add');
    setCustomerId(null);
    setInitialData(null);
    setIsOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setMode('edit');
    setCustomerId(customer.id);
    setInitialData(customer);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setCustomerId(null);
    setInitialData(null);
  };

  return {
    isOpen,
    mode,
    customerId,
    initialData,
    openAdd,
    openEdit,
    close,
  };
};
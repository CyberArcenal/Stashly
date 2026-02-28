// src/renderer/pages/customers/hooks/useCustomerView.ts
import { useState } from 'react';
import customerAPI, { type Customer } from '../../../api/core/customer';
import orderAPI, { type Order } from '../../../api/core/order';
import loyaltyAPI, { type LoyaltyTransaction } from '../../../api/core/loyalty';
import { showError } from '../../../utils/notification';

export const useCustomerView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);

  const open = async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await customerAPI.getById(id);
      if (!response.status) throw new Error(response.message);
      setCustomer(response.data);
    } catch (err: any) {
      showError(err.message || 'Failed to load customer details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!customer || orders.length > 0 || loadingOrders) return;
    setLoadingOrders(true);
    try {
      const response = await orderAPI.getByCustomer({ customerId: customer.id, limit: 50 });
      if (response.status) {
        setOrders(response.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchLoyalty = async () => {
    if (!customer || loyaltyTransactions.length > 0 || loadingLoyalty) return;
    setLoadingLoyalty(true);
    try {
      const response = await loyaltyAPI.getByCustomer(customer.id, 50);
      if (response.status) {
        setLoyaltyTransactions(response.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load loyalty history');
    } finally {
      setLoadingLoyalty(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setCustomer(null);
    setOrders([]);
    setLoyaltyTransactions([]);
  };

  return {
    isOpen,
    loading,
    customer,
    orders,
    loyaltyTransactions,
    loadingOrders,
    loadingLoyalty,
    open,
    fetchOrders,
    fetchLoyalty,
    close,
  };
};
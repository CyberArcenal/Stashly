// src/renderer/pages/customers/hooks/useCustomerView.ts
import { useState, useCallback, useRef } from 'react';
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

  const hasLoadedOrders = useRef(false);
  const hasLoadedLoyalty = useRef(false);
  const loadingOrdersRef = useRef(false);
  const loadingLoyaltyRef = useRef(false);

  const open = useCallback(async (id: number) => {
    setIsOpen(true);
    setLoading(true);
    // Reset flags
    hasLoadedOrders.current = false;
    hasLoadedLoyalty.current = false;
    loadingOrdersRef.current = false;
    loadingLoyaltyRef.current = false;
    setOrders([]);
    setLoyaltyTransactions([]);
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
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!customer || hasLoadedOrders.current || loadingOrdersRef.current) return;
    loadingOrdersRef.current = true;
    setLoadingOrders(true);
    try {
      const response = await orderAPI.getByCustomer({ customerId: customer.id, limit: 50 });
      if (response.status) {
        setOrders(response.data);
        hasLoadedOrders.current = true;
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load orders');
    } finally {
      loadingOrdersRef.current = false;
      setLoadingOrders(false);
    }
  }, [customer]); // stable – only depends on customer

  const fetchLoyalty = useCallback(async () => {
    if (!customer || hasLoadedLoyalty.current || loadingLoyaltyRef.current) return;
    loadingLoyaltyRef.current = true;
    setLoadingLoyalty(true);
    try {
      const response = await loyaltyAPI.getByCustomer(customer.id, 50);
      if (response.status) {
        setLoyaltyTransactions(response.data);
        hasLoadedLoyalty.current = true;
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load loyalty history');
    } finally {
      loadingLoyaltyRef.current = false;
      setLoadingLoyalty(false);
    }
  }, [customer]);

  const close = useCallback(() => {
    setIsOpen(false);
    setCustomer(null);
    setOrders([]);
    setLoyaltyTransactions([]);
    hasLoadedOrders.current = false;
    hasLoadedLoyalty.current = false;
    loadingOrdersRef.current = false;
    loadingLoyaltyRef.current = false;
  }, []);

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
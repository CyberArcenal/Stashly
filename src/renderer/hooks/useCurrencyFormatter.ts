// src/renderer/hooks/useCurrencyFormatter.ts
import { useCallback } from 'react';
import { useCurrency } from '../utils/configUtils/general';
import { formatCurrency as baseFormatCurrency } from '../utils/formatters';

/**
 * Custom hook that returns a currency formatter function
 * using the current currency from settings.
 */
export const useCurrencyFormatter = () => {
  const currency = useCurrency();

  const formatCurrency = useCallback(
    (amount: number | string | null | undefined) => {
      return baseFormatCurrency(amount, currency);
    },
    [currency]
  );

  return formatCurrency;
};

/**
 * Hook that returns the current currency symbol
 */
export const useCurrencySymbol = () => {
  const currency = useCurrency();
  
  const getSymbol = useCallback(
    (currencyCode?: string) => {
      const symbolMap: Record<string, string> = {
        PHP: '₱',
        USD: '$',
        EUR: '€',
        JPY: '¥',
        GBP: '£',
        AUD: 'A$',
        CAD: 'C$',
        CHF: 'CHF',
        CNY: '¥',
        HKD: 'HK$',
        SGD: 'S$',
        KRW: '₩',
        INR: '₹',
        BRL: 'R$',
        RUB: '₽',
        TRY: '₺',
      };
      return symbolMap[currencyCode || currency] || (currencyCode || currency);
    },
    [currency]
  );

  return getSymbol;
};
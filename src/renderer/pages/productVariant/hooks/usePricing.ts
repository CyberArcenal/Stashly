// src/renderer/hooks/usePricing.ts
import { useMemo } from 'react';

interface UsePricingParams {
  netPrice: number;
  cost: number;
  taxEnabled: boolean;
  taxRate: number;        // in percent (e.g., 12 for 12%)
  pricesIncludeTax: boolean;
}

export const usePricing = ({
  netPrice,
  cost,
  taxEnabled,
  taxRate = 0,
  pricesIncludeTax,
}: UsePricingParams) => {
  const { netAmount, vatAmount, finalPrice } = useMemo(() => {
    if (!taxEnabled) {
      return { netAmount: netPrice, vatAmount: 0, finalPrice: netPrice };
    }

    if (pricesIncludeTax) {
      // netPrice is gross (includes tax)
      const net = netPrice / (1 + taxRate / 100);
      const vat = netPrice - net;
      return { netAmount: net, vatAmount: vat, finalPrice: netPrice };
    } else {
      // netPrice is net (excludes tax)
      const vat = netPrice * (taxRate / 100);
      return { netAmount: netPrice, vatAmount: vat, finalPrice: netPrice + vat };
    }
  }, [netPrice, taxEnabled, taxRate, pricesIncludeTax]);

  const margin = finalPrice - cost;
  const marginPercent = cost ? (margin / cost) * 100 : 0;

  return {
    netAmount,
    vatAmount,
    finalPrice,
    margin,
    marginPercent,
  };
};
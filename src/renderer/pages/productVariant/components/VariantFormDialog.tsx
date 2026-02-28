// src/renderer/pages/products/components/VariantFormDialog.tsx
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import ProductSelect from '../../../components/Selects/Product';
import { dialogs } from '../../../utils/dialogs';
import type { ProductVariant, ProductVariantCreateData, ProductVariantUpdateData } from '../../../api/core/productVariant';
import productVariantAPI from '../../../api/core/productVariant';
import { useSalesSettings, useTaxSettings } from '../../../utils/configUtils/sales';

interface VariantFormDialogProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  variantId: number | null;
  productId: number | null; // optional: for pre-selecting product in add mode
  initialData: Partial<ProductVariant> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  productId: number | null;
  name: string;
  sku: string;
  net_price: number;
  cost_per_item: number;
  barcode: string;
  is_active: boolean;
};

const VariantFormDialog: React.FC<VariantFormDialogProps> = ({
  isOpen,
  mode,
  variantId,
  productId: propProductId,
  initialData,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      productId: null,
      name: '',
      sku: '',
      net_price: 0,
      cost_per_item: 0,
      barcode: '',
      is_active: true,
    },
  });

  const formProductId = watch('productId');
  const netPrice = watch('net_price') || 0;
  const cost = watch('cost_per_item') || 0;

  // Load tax settings
  const { vat_rate, prices_include_tax } = useTaxSettings();
  const { tax_enabled } = useSalesSettings();

  // Calculate final selling price
  const finalPrice = useMemo(() => {
    if (!tax_enabled) return netPrice;
    if (prices_include_tax) {
      // net_price already includes tax
      return netPrice;
    } else {
      // add VAT to base price
      return netPrice * (1 + vat_rate / 100);
    }
  }, [netPrice, tax_enabled, vat_rate, prices_include_tax]);

  // Breakdown for price summary
  const { netAmount, vatAmount } = useMemo(() => {
    if (!tax_enabled) {
      return { netAmount: netPrice, vatAmount: 0 };
    }
    if (prices_include_tax) {
      // Extract VAT from gross price
      const net = netPrice / (1 + vat_rate / 100);
      const vat = netPrice - net;
      return { netAmount: net, vatAmount: vat };
    } else {
      // Compute VAT on net price
      const vat = netPrice * (vat_rate / 100);
      return { netAmount: netPrice, vatAmount: vat };
    }
  }, [netPrice, tax_enabled, vat_rate, prices_include_tax]);

  // Margin calculation
  const margin = finalPrice - cost;
  const marginPercent = cost ? (margin / cost) * 100 : 0;

  // Populate form based on mode and props
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        productId: initialData.productId || initialData.product?.id || null,
        name: initialData.name || '',
        sku: initialData.sku || '',
        net_price: initialData.net_price || 0,
        cost_per_item: initialData.cost_per_item || 0,
        barcode: initialData.barcode || '',
        is_active: initialData.is_active ?? true,
      });
    } else if (mode === 'add') {
      reset({
        productId: propProductId || null,
        name: '',
        sku: '',
        net_price: 0,
        cost_per_item: 0,
        barcode: '',
        is_active: true,
      });
    }
  }, [mode, initialData, propProductId, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Prepare API data (convert empty strings to undefined)
      const apiData = {
        productId: data.productId!,
        name: data.name,
        sku: data.sku?.trim() || undefined,
        net_price: data.net_price || undefined,
        cost_per_item: data.cost_per_item || undefined,
        barcode: data.barcode?.trim() || undefined,
        is_active: data.is_active,
      };

      if (mode === 'add') {
        if (!data.productId) throw new Error('Product is required');
        await productVariantAPI.create(apiData);
        dialogs.success('Variant created successfully');
      } else {
        if (!variantId) throw new Error('Variant ID missing');
        await productVariantAPI.update(variantId, apiData);
        dialogs.success('Variant updated successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to save variant');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      safetyClose={true} 
      onClose={onClose} 
      title={mode === 'add' ? 'Add Variant' : 'Edit Variant'} 
      size="xl" // 👈 Ginawang wider (max-w-4xl)
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Product Selection - full width on first row */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Product {mode === 'add' && '*'}
            </label>
            <ProductSelect
              value={formProductId}
              onChange={(id) => setValue('productId', id)}
              placeholder="Select product..."
              disabled={!!propProductId && mode === 'add'} // Disable only if pre-selected in add mode
            />
            {mode === 'add' && !formProductId && (
              <p className="text-xs text-red-500 mt-1">Product is required</p>
            )}
          </div>

          {/* Variant Name */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Variant Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              SKU
            </label>
            <input
              {...register('sku')}
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Barcode
            </label>
            <input
              {...register('barcode')}
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
          </div>

          {/* Net Price */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Net Price {prices_include_tax ? '(incl. VAT)' : '(excl. VAT)'}
            </label>
            <input
              type="number"
              step="0.01"
              {...register('net_price', { valueAsNumber: true })}
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
          </div>

          {/* Cost per Item */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Cost per Item
            </label>
            <input
              type="number"
              step="0.01"
              {...register('cost_per_item', { valueAsNumber: true })}
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
              <input type="checkbox" {...register('is_active')} className="h-4 w-4" />
              Active
            </label>
          </div>

          {/* Price Summary Card - full width */}
          {(tax_enabled || netPrice > 0 || cost > 0) && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-2 p-4 rounded-md border" 
                 style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--sidebar-text)' }}>Price Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Column - Tax Breakdown */}
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-gray-500 uppercase">Tax Information</h5>
                  {tax_enabled ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--sidebar-text)' }}>Net (excl. VAT):</span>
                        <span className="font-mono" style={{ color: 'var(--sidebar-text)' }}>₱{netAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--sidebar-text)' }}>VAT ({vat_rate}%):</span>
                        <span className="font-mono" style={{ color: 'var(--sidebar-text)' }}>₱{vatAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-dashed" 
                           style={{ borderColor: 'var(--border-color)' }}>
                        <span style={{ color: 'var(--sidebar-text)' }}>Final (incl. VAT):</span>
                        <span className="font-mono" style={{ color: 'var(--accent-color)' }}>₱{finalPrice.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm font-semibold">
                      <span style={{ color: 'var(--sidebar-text)' }}>Selling Price:</span>
                      <span className="font-mono" style={{ color: 'var(--accent-color)' }}>₱{finalPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Middle Column - Cost & Margin */}
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-gray-500 uppercase">Profit Analysis</h5>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--sidebar-text)' }}>Cost per Item:</span>
                    <span className="font-mono" style={{ color: 'var(--sidebar-text)' }}>₱{cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--sidebar-text)' }}>Margin:</span>
                    <span className="font-mono" style={{ color: margin >= 0 ? '#10b981' : '#ef4444' }}>
                      ₱{margin.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--sidebar-text)' }}>Margin %:</span>
                    <span className="font-mono" style={{ color: margin >= 0 ? '#10b981' : '#ef4444' }}>
                      {marginPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Right Column - Settings Summary */}
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-gray-500 uppercase">Current Settings</h5>
                  <div className="text-xs text-gray-500">
                    <p>• VAT Rate: {vat_rate}%</p>
                    <p>• Tax: {tax_enabled ? 'Enabled' : 'Disabled'}</p>
                    <p>• Prices: {prices_include_tax ? 'Include VAT' : 'Exclude VAT'}</p>
                    {tax_enabled && prices_include_tax && (
                      <p className="text-xs italic mt-2">
                        ⓘ Input price should include VAT
                      </p>
                    )}
                    {tax_enabled && !prices_include_tax && (
                      <p className="text-xs italic mt-2">
                        ⓘ Input price is net of VAT
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create' : 'Update'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VariantFormDialog;
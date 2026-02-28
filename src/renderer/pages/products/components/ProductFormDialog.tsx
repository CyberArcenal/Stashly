// src/renderer/pages/inventory/components/ProductFormDialog.tsx
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import CategorySelect from '../../../components/Selects/Category';
import { dialogs } from '../../../utils/dialogs';
import type { Product, ProductCreateData, ProductUpdateData } from '../../../api/core/product';
import productAPI from '../../../api/core/product';
import { useSalesSettings, useTaxSettings } from '../../../utils/configUtils/sales';

interface ProductFormDialogProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  productId: number | null;
  initialData: Partial<Product> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  sku: string;
  net_price: number;
  cost_per_item: number;
  track_quantity: boolean;
  allow_backorder: boolean;
  is_published: boolean;
  categoryId: number | null;
  description?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
};

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  isOpen,
  mode,
  productId,
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
      name: '',
      sku: '',
      net_price: 0,
      cost_per_item: 0,
      track_quantity: true,
      allow_backorder: false,
      is_published: false,
      categoryId: null,
      description: '',
      barcode: '',
      weight: undefined,
      dimensions: '',
    },
  });

  const categoryId = watch('categoryId');
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

  // Optional: margin calculation
  const margin = finalPrice - cost;
  const marginPercent = cost ? (margin / cost) * 100 : 0;

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        sku: initialData.sku || '',
        net_price: initialData.net_price || 0,
        cost_per_item: initialData.cost_per_item || 0,
        track_quantity: initialData.track_quantity ?? true,
        allow_backorder: initialData.allow_backorder ?? false,
        is_published: initialData.is_published ?? false,
        categoryId: initialData.category?.id || null,
        description: initialData.description || '',
        barcode: initialData.barcode || '',
        weight: initialData.weight || undefined,
        dimensions: initialData.dimensions || '',
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Convert empty strings to null for optional fields
      const apiData = {
        ...data,
        description: data.description?.trim() || null,
        barcode: data.barcode?.trim() || null,
        dimensions: data.dimensions?.trim() || null,
        weight: data.weight || null,
      };

      if (mode === 'add') {
        await productAPI.create(apiData as ProductCreateData);
        dialogs.success('Product created successfully');
      } else {
        if (!productId) throw new Error('Product ID missing');
        await productAPI.update(productId, apiData as ProductUpdateData);
        dialogs.success('Product updated successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to save product');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      safetyClose={true} 
      onClose={onClose} 
      title={mode === 'add' ? 'Add New Product' : 'Edit Product'} 
      size="xl" // 👈 Ginawang wider (max-w-4xl)
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Product Name - full width sa wider modal */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Product Name *
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
              SKU *
            </label>
            <input
              {...register('sku', { required: 'SKU is required' })}
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
            {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>}
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

          {/* Category */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Category
            </label>
            <CategorySelect
              value={categoryId}
              onChange={(id) => setValue('categoryId', id)}
            />
          </div>

          {/* Price Section - 3 columns for better organization */}
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

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Weight
            </label>
            <input
              type="number"
              step="0.01"
              {...register('weight', { valueAsNumber: true })}
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
          </div>

          {/* Dimensions */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Dimensions
            </label>
            <input
              {...register('dimensions')}
              placeholder="LxWxH"
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
          </div>

          {/* Price Summary Card - wider layout */}
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

          {/* Description - full width */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="compact-input w-full border rounded-md"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--sidebar-text)',
              }}
            />
          </div>

          {/* Checkboxes */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex gap-6">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
              <input type="checkbox" {...register('track_quantity')} className="h-4 w-4" />
              Track Quantity
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
              <input type="checkbox" {...register('allow_backorder')} className="h-4 w-4" />
              Allow Backorder
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
              <input type="checkbox" {...register('is_published')} className="h-4 w-4" />
              Published
            </label>
          </div>
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

export default ProductFormDialog;
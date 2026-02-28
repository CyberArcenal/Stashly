// src/renderer/pages/products/components/VariantFormDialog.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import ProductSelect from '../../../components/Selects/Product';
import { dialogs } from '../../../utils/dialogs';
import type { ProductVariant, ProductVariantCreateData, ProductVariantUpdateData } from '../../../api/core/productVariant';
import productVariantAPI from '../../../api/core/productVariant';

interface VariantFormDialogProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  variantId: number | null;
  productId: number | null; // optional: for pre-selecting product in add mode (e.g., from product page)
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

  // Populate form based on mode and props
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Edit mode: use initialData for all fields
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
      // Add mode: use propProductId if provided (for pre-selection), otherwise blank
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
      if (mode === 'add') {
        if (!data.productId) throw new Error('Product is required');
        await productVariantAPI.create({
          productId: data.productId,
          name: data.name,
          sku: data.sku || undefined,
          net_price: data.net_price || undefined,
          cost_per_item: data.cost_per_item || undefined,
          barcode: data.barcode || undefined,
          is_active: data.is_active,
        });
        dialogs.success('Variant created successfully');
      } else {
        if (!variantId) throw new Error('Variant ID missing');
        await productVariantAPI.update(variantId, {
          productId: data.productId || undefined,
          name: data.name,
          sku: data.sku || undefined,
          net_price: data.net_price || undefined,
          cost_per_item: data.cost_per_item || undefined,
          barcode: data.barcode || undefined,
          is_active: data.is_active,
        });
        dialogs.success('Variant updated successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to save variant');
    }
  };

  return (
    <Modal isOpen={isOpen}   safetyClose={true} onClose={onClose} title={mode === 'add' ? 'Add Variant' : 'Edit Variant'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Product Selection - always enabled */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
            Product {mode === 'add' && '*'}
          </label>
          <ProductSelect
            value={formProductId}
            onChange={(id) => setValue('productId', id)}
            placeholder="Select product..."
            disabled={!!propProductId}
            // No disabled prop - user can always change product
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

        {/* Net Price */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
            Net Price
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

        {/* Active Checkbox */}
        <div>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
            <input type="checkbox" {...register('is_active')} className="h-4 w-4" />
            Active
          </label>
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
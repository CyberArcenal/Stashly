// src/renderer/pages/inventory/components/ProductImageFormDialog.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import { dialogs } from '../../../utils/dialogs';
import type { ProductImageCreateData } from '../../../api/core/productImage';
import productImageAPI from '../../../api/core/productImage';
import { Upload, X } from 'lucide-react';

interface ProductImageFormDialogProps {
  isOpen: boolean;
  productId: number;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
};

const ProductImageFormDialog: React.FC<ProductImageFormDialogProps> = ({
  isOpen,
  productId,
  onClose,
  onSuccess,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      image_url: '',
      alt_text: '',
      is_primary: false,
      sort_order: 0,
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isOpen, reset]);

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clear any manual URL
      setValue('image_url', '');
    } else {
      dialogs.error('Please select a valid image file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue('image_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Convert file to base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      let finalImageUrl = data.image_url;

      if (imageFile) {
        setIsConverting(true);
        // Convert file to base64
        finalImageUrl = await fileToBase64(imageFile);
        setIsConverting(false);
      }

      if (!finalImageUrl) {
        throw new Error('Either select an image file or provide an image URL');
      }

      const payload: ProductImageCreateData = {
        productId,
        image_url: finalImageUrl,
        alt_text: data.alt_text || null,
        is_primary: data.is_primary,
        sort_order: data.sort_order,
      };

      await productImageAPI.create(payload);
      dialogs.success('Image added successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to add image');
    } finally {
      setIsConverting(false);
    }
  };

  const isSaving = isSubmitting || isConverting;

  return (
    <Modal isOpen={isOpen}   safetyClose={true} onClose={onClose} title="Add Product Image" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Product ID (hidden or displayed as info) */}
        <div className="text-sm text-[var(--text-secondary)]">
          Product ID: <span className="font-medium text-[var(--sidebar-text)]">{productId}</span>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
            Image
          </label>
          <div
            className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-[var(--card-hover-bg)] transition-colors"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--card-secondary-bg)',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Drag & drop an image here, or click to select
                </p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            You can also provide an image URL below.
          </p>
        </div>

        {/* Image URL (manual) */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
            Image URL (optional if file selected)
          </label>
          <input
            {...register('image_url')}
            className="compact-input w-full border rounded-md"
            placeholder="https://example.com/image.jpg"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--sidebar-text)',
            }}
          />
        </div>

        {/* Alt Text */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
            Alt Text
          </label>
          <input
            {...register('alt_text')}
            className="compact-input w-full border rounded-md"
            placeholder="Image description"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--sidebar-text)',
            }}
          />
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
            Sort Order
          </label>
          <input
            type="number"
            min="0"
            step="1"
            {...register('sort_order', { valueAsNumber: true })}
            className="compact-input w-full border rounded-md"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--sidebar-text)',
            }}
          />
        </div>

        {/* Primary Checkbox */}
        <div>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
            <input type="checkbox" {...register('is_primary')} className="h-4 w-4" />
            Set as primary image
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Add Image'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductImageFormDialog;
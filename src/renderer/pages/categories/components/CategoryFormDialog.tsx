// src/renderer/pages/categories/components/CategoryFormDialog.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import CategorySelect from '../../../components/Selects/Category';
import { dialogs } from '../../../utils/dialogs';
import type { Category, CategoryCreateData, CategoryUpdateData } from '../../../api/core/category';
import categoryAPI from '../../../api/core/category';
import { Upload, X } from 'lucide-react';

interface CategoryFormDialogProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  categoryId: number | null;
  initialData: Partial<Category> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  slug: string;
  description: string;
  image_path: string;
  color: string;
  parentId: number | null;
  is_active: boolean;
};

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  mode,
  categoryId,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      slug: '',
      description: '',
      image_path: '',
      color: '',
      parentId: null,
      is_active: true,
    },
  });

  const name = watch('name');
  const parentId = watch('parentId');

  // Auto-generate slug from name (only in add mode or if slug is empty)
  useEffect(() => {
    if (mode === 'add' && name && !watch('slug')) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', generatedSlug);
    }
  }, [name, mode, setValue, watch]);

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        image_path: initialData.image_path || '',
        color: initialData.color || '',
        parentId: initialData.parent?.id || initialData.parentId || null,
        is_active: initialData.is_active ?? true,
      });
      if (initialData.image_path) {
        setImagePreview(initialData.image_path);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    } else {
      reset();
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData, reset]);

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setValue('image_path', '');
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
    setValue('image_path', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let finalImagePath = data.image_path;

      if (imageFile) {
        // TODO: Replace with actual file upload
        finalImagePath = `/uploads/${imageFile.name}`; // Placeholder
      }

      const payload = {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description || null,
        image_path: finalImagePath || null,
        color: data.color || null,
        parentId: data.parentId,
        is_active: data.is_active,
      };

      if (mode === 'add') {
        if (!data.name) throw new Error('Category name is required');
        await categoryAPI.create(payload);
        dialogs.success('Category created successfully');
      } else {
        if (!categoryId) throw new Error('Category ID missing');
        await categoryAPI.update(categoryId, payload);
        dialogs.success('Category updated successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || 'Failed to save category');
    }
  };

  return (
    <Modal isOpen={isOpen}   safetyClose={true} onClose={onClose} title={mode === 'add' ? 'Add Category' : 'Edit Category'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Name, Slug, Description */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
                Category Name *
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

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
                Slug
              </label>
              <input
                {...register('slug')}
                className="compact-input w-full border rounded-md"
                placeholder="auto-generated from name"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--sidebar-text)',
                }}
              />
            </div>

            {/* Description */}
            <div>
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
              {/* Active Checkbox */}
            <div>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
                <input type="checkbox" {...register('is_active')} className="h-4 w-4" />
                Active
              </label>
            </div>
          </div>

          {/* Right Column: Image, Parent Category, Color, Active */}
          <div className="space-y-4">
            {/* Image Upload */}
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
              {/* Manual image path input */}
              <div className="mt-2">
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Or enter image URL/path manually
                </label>
                <input
                  {...register('image_path')}
                  className="compact-input w-full border rounded-md text-sm"
                  placeholder="/images/category.jpg"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--sidebar-text)',
                  }}
                />
              </div>
            </div>

            {/* Parent Category (using CategorySelect) */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
                Parent Category
              </label>
              <CategorySelect
                value={parentId}
                onChange={(id) => setValue('parentId', id)}
                placeholder="None"
                activeOnly={true}
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
                Color (hex)
              </label>
              <input
                type="color"
                {...register('color')}
                className="compact-input w-full border rounded-md h-10"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                }}
              />
            </div>

          
          </div>
        </div>

        {/* Footer */}
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

export default CategoryFormDialog;
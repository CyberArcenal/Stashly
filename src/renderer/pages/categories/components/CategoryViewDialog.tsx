// src/renderer/pages/categories/components/CategoryViewDialog.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import {
  Package, Tag, Calendar, Edit, FolderTree, Layers, X
} from 'lucide-react';
import type { Category } from '../../../api/core/category';
import type { Product } from '../../../api/core/product';
import { formatDate, formatCurrency } from '../../../utils/formatters';

interface CategoryViewDialogProps {
  isOpen: boolean;
  category: Category | null;
  products: Product[];
  loading: boolean;
  loadingProducts?: boolean;
  onClose: () => void;
  onEdit?: (id: number) => void;
  onFetchProducts?: () => void;
}

const CategoryViewDialog: React.FC<CategoryViewDialogProps> = ({
  isOpen,
  category,
  products,
  loading,
  loadingProducts = false,
  onClose,
  onEdit,
  onFetchProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');

  useEffect(() => {
    if (activeTab === 'products' && onFetchProducts) {
      onFetchProducts();
    }
  }, [activeTab, onFetchProducts]);

  if (!category && !loading) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Category Details" size="xl">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
        </div>
      ) : category ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-md flex items-center justify-center"
                style={{
                  backgroundColor: category.color ? category.color : 'var(--card-secondary-bg)',
                  color: '#fff',
                }}
              >
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
                  {category.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Slug: {category.slug} • ID: {category.id}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
              {onEdit && (
                <Button variant="secondary" size="sm" onClick={() => onEdit(category.id)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-color)]">
            <nav className="flex gap-4">
              {(['overview', 'products'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-[var(--accent-blue)] text-[var(--accent-blue)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--sidebar-text)]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'products' && products.length > 0 && (
                    <span className="ml-2 text-xs bg-[var(--accent-blue)] text-white rounded-full px-1.5 py-0.5">
                      {products.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="mt-4">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left column: Basic info */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Tag className="w-4 h-4 mr-1" /> Category Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">ID:</span> {category.id}</div>
                      <div><span className="text-[var(--text-secondary)]">Name:</span> {category.name}</div>
                      <div><span className="text-[var(--text-secondary)]">Slug:</span> {category.slug}</div>
                      <div><span className="text-[var(--text-secondary)]">Color:</span>
                        <span className="ml-1 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: category.color || '#ccc', color: '#fff' }}>
                          {category.color || 'None'}
                        </span>
                      </div>
                      <div><span className="text-[var(--text-secondary)]">Status:</span> {category.is_active ? 'Active' : 'Inactive'}</div>
                      <div><span className="text-[var(--text-secondary)]">Image:</span> {category.image_path ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {category.description && (
                    <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                      <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Description</h4>
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{category.description}</p>
                    </div>
                  )}
                </div>

                {/* Right column: Parent/Children and dates */}
                <div className="space-y-4">
                  {category.parent && (
                    <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                        <FolderTree className="w-4 h-4 mr-1" /> Parent Category
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-[var(--text-secondary)]">Name:</span> {category.parent.name}</div>
                        <div><span className="text-[var(--text-secondary)]">Slug:</span> {category.parent.slug}</div>
                      </div>
                    </div>
                  )}

                  {category.children && category.children.length > 0 && (
                    <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                        <Layers className="w-4 h-4 mr-1" /> Subcategories ({category.children.length})
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {category.children.map(child => (
                          <div key={child.id} className="text-sm border-b border-[var(--border-color)] pb-1 last:border-0">
                            <span className="font-medium text-[var(--sidebar-text)]">{child.name}</span>
                            <span className="text-xs text-[var(--text-secondary)] ml-2">({child.slug})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Calendar className="w-4 h-4 mr-1" /> Timeline
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Created:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(category.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Updated:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(category.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Products in this Category</h4>
                {loadingProducts ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No products found in this category.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                      <thead className="bg-[var(--card-secondary-bg)]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">SKU</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Stock</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                        {products.map(product => {
                          const totalStock = product.stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                          return (
                            <tr key={product.id}>
                              <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{product.name}</td>
                              <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{product.sku}</td>
                              <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{formatCurrency(product.net_price || 0)}</td>
                              <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{totalStock}</td>
                              <td className="px-4 py-2 text-sm">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  product.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {product.is_published ? 'Published' : 'Unpublished'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-[var(--text-secondary)]">Category not found.</p>
      )}
    </Modal>
  );
};

export default CategoryViewDialog;
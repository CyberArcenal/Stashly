// src/renderer/pages/warehouse/components/WarehouseViewDialog.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import {
  Warehouse, MapPin, Package, Box, Calendar, Edit, TrendingUp,
  Layers, X
} from 'lucide-react';
import type { Warehouse as WarehouseType } from '../../../api/core/warehouse';
import type { StockItem } from '../../../api/core/stockItem';
import type { StockMovement } from '../../../api/core/stockMovement';
import { formatDate, formatCompactNumber } from '../../../utils/formatters';

interface WarehouseViewDialogProps {
  isOpen: boolean;
  warehouse: WarehouseType | null;
  stockItems: StockItem[];
  movements: StockMovement[];
  loading: boolean;
  loadingStock?: boolean;
  loadingMovements?: boolean;
  onClose: () => void;
  onEdit?: (id: number) => void;
  onFetchStock?: () => void;
  onFetchMovements?: () => void;
}

const WarehouseViewDialog: React.FC<WarehouseViewDialogProps> = ({
  isOpen,
  warehouse,
  stockItems,
  movements,
  loading,
  loadingStock = false,
  loadingMovements = false,
  onClose,
  onEdit,
  onFetchStock,
  onFetchMovements,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'movements'>('overview');

  useEffect(() => {
    if (activeTab === 'stock' && onFetchStock) {
      onFetchStock();
    }
    if (activeTab === 'movements' && onFetchMovements) {
      onFetchMovements();
    }
  }, [activeTab, onFetchStock, onFetchMovements]);

  if (!warehouse && !loading) return null;

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      warehouse: 'Warehouse',
      store: 'Store',
      online: 'Online',
    };
    return types[type] || type;
  };

  // Calculate total stock quantity
  const totalStock = stockItems? stockItems?.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const uniqueProducts = new Set(stockItems? stockItems?.map(item => item.product?.id):[]).size;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Warehouse Details" size="xl">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
        </div>
      ) : warehouse ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--card-secondary-bg)] rounded-md flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
                  {warehouse.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {getTypeLabel(warehouse.type)} • {warehouse.location || 'No location'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  warehouse.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {warehouse.is_active ? 'Active' : 'Inactive'}
              </span>
              {onEdit && (
                <Button variant="secondary" size="sm" onClick={() => onEdit(warehouse.id)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-color)]">
            <nav className="flex gap-4">
              {(['overview', 'stock', 'movements'] as const).map(tab => (
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
                  {tab === 'stock' && stockItems?.length > 0 && (
                    <span className="ml-2 text-xs bg-[var(--accent-blue)] text-white rounded-full px-1.5 py-0.5">
                      {stockItems?.length}
                    </span>
                  )}
                  {tab === 'movements' && movements?.length > 0 && (
                    <span className="ml-2 text-xs bg-[var(--accent-blue)] text-white rounded-full px-1.5 py-0.5">
                      {movements?.length}
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
                {/* Left column: Warehouse info */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Warehouse className="w-4 h-4 mr-1" /> Warehouse Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">ID:</span> {warehouse.id}</div>
                      <div><span className="text-[var(--text-secondary)]">Name:</span> {warehouse.name}</div>
                      <div><span className="text-[var(--text-secondary)]">Type:</span> {getTypeLabel(warehouse.type)}</div>
                      <div><span className="text-[var(--text-secondary)]">Location:</span> {warehouse.location || '-'}</div>
                      <div><span className="text-[var(--text-secondary)]">Capacity:</span> {formatCompactNumber(warehouse.limit_capacity)} units</div>
                      <div><span className="text-[var(--text-secondary)]">Status:</span> {warehouse.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>

                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Calendar className="w-4 h-4 mr-1" /> Timeline
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Created:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(warehouse.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Updated:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(warehouse.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Summary */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Package className="w-4 h-4 mr-1" /> Stock Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Total Stock Items:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{stockItems?.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Total Quantity:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatCompactNumber(totalStock)} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Unique Products:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{uniqueProducts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <TrendingUp className="w-4 h-4 mr-1" /> Movements Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Total Movements:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{movements?.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stock' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Stock Items</h4>
                {loadingStock ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
                  </div>
                ) : stockItems?.length === 0 ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No stock items found in this warehouse.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                      <thead className="bg-[var(--card-secondary-bg)]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">SKU</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Reorder Level</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                        {stockItems?.map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{item.product?.name || 'Unknown'}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{item.product?.sku || '-'}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{item.reorder_level}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                item.quantity === 0 ? 'bg-red-100 text-red-700' :
                                item.quantity <= item.reorder_level ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {item.quantity === 0 ? 'Out of Stock' :
                                 item.quantity <= item.reorder_level ? 'Low Stock' : 'In Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'movements' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Stock Movements</h4>
                {loadingMovements ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
                  </div>
                ) : movements?.length === 0 ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No movements found in this warehouse.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                      <thead className="bg-[var(--card-secondary-bg)]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Change</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Reference</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                        {movements?.map(m => (
                          <tr key={m.id}>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)] capitalize">{m.movement_type}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{m.stockItem?.product?.name || 'Unknown'}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">
                              <span className={m.change > 0 ? 'text-green-600' : 'text-red-600'}>
                                {m.change > 0 ? '+' : ''}{m.change}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{m.reference_code || '-'}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{formatDate(m.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-[var(--text-secondary)]">Warehouse not found.</p>
      )}
    </Modal>
  );
};

export default WarehouseViewDialog;
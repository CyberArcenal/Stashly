// src/renderer/pages/stock-items/components/StockViewDialog.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import {
  Package, Box, Warehouse, Calendar, Edit, AlertTriangle, BarChart3,
  ChevronRight, X, MapPin, Tag, DollarSign
} from 'lucide-react';
import type { StockItemWithDetails } from '../hooks/useStockItems';
import type { StockMovement } from '../../../api/core/stockMovement';
import stockMovementAPI from '../../../api/core/stockMovement';
import { formatCurrency, formatDate, formatCompactNumber } from '../../../utils/formatters';
import { showError } from '../../../utils/notification';

interface StockViewDialogProps {
  isOpen: boolean;
  stockItem: StockItemWithDetails | null;
  loading: boolean;
  onClose: () => void;
  onEdit?: (id: number) => void;
}

const StockViewDialog: React.FC<StockViewDialogProps> = ({
  isOpen,
  stockItem,
  loading,
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'product' | 'warehouse' | 'movements'>('overview');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Fetch movements when movements tab is activated
  useEffect(() => {
    if (activeTab === 'movements' && stockItem && movements.length === 0 && !loadingMovements) {
      const fetchMovements = async () => {
        setLoadingMovements(true);
        try {
          const response = await stockMovementAPI.getByStockItem(stockItem.id, { limit: 50 });
          if (response.status) {
            setMovements(response.data || []);
          }
        } catch (err: any) {
          showError(err.message || 'Failed to load movements');
        } finally {
          setLoadingMovements(false);
        }
      };
      fetchMovements();
    }
  }, [activeTab, stockItem, movements.length, loadingMovements]);

  if (!stockItem && !loading) return null;

  const getStatusColor = () => {
    if (stockItem?.quantity === 0) {
      return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle };
    } else if (stockItem?.quantity || 0 <= (stockItem?.reorder_level || 0)) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle };
    } else {
      return { bg: 'bg-green-100', text: 'text-green-700', icon: Package };
    }
  };

  const statusStyle = stockItem ? getStatusColor() : null;
  const StatusIcon = statusStyle?.icon || Package;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Item Details" size="xl">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
        </div>
      ) : stockItem ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--card-secondary-bg)] rounded-md flex items-center justify-center">
                <Box className="w-6 h-6 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
                  {stockItem.product_name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  SKU: {stockItem.product_sku} • Warehouse: {stockItem.warehouse_name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {statusStyle && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                  <StatusIcon className="w-3 h-3" />
                  {stockItem.quantity === 0 ? 'Out of Stock' :
                   stockItem.quantity <= stockItem.reorder_level ? 'Low Stock' : 'In Stock'}
                </span>
              )}
              {onEdit && (
                <Button variant="secondary" size="sm" onClick={() => onEdit(stockItem.id)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-color)]">
            <nav className="flex gap-4">
              {(['overview', 'product', 'warehouse', 'movements'] as const).map(tab => (
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
                  {tab === 'movements' && movements.length > 0 && (
                    <span className="ml-2 text-xs bg-[var(--accent-blue)] text-white rounded-full px-1.5 py-0.5">
                      {movements.length}
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
                {/* Left column: Stock info */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Package className="w-4 h-4 mr-1" /> Stock Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">ID:</span> {stockItem.id}</div>
                      <div><span className="text-[var(--text-secondary)]">Quantity:</span> {formatCompactNumber(stockItem.quantity)}</div>
                      <div><span className="text-[var(--text-secondary)]">Reorder Level:</span> {formatCompactNumber(stockItem.reorder_level)}</div>
                      <div><span className="text-[var(--text-secondary)]">Low Stock Threshold:</span> {stockItem.low_stock_threshold !== null ? formatCompactNumber(stockItem.low_stock_threshold) : 'Not set'}</div>
                      <div><span className="text-[var(--text-secondary)]">Created:</span> {formatDate(stockItem.created_at)}</div>
                      <div><span className="text-[var(--text-secondary)]">Updated:</span> {formatDate(stockItem.updated_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Right column: Summary cards */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <BarChart3 className="w-4 h-4 mr-1" /> Stock Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Current Level:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">
                          {stockItem.quantity} units
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Reorder at:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">
                          {stockItem.reorder_level} units
                        </span>
                      </div>
                      {stockItem.low_stock_threshold !== null && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Low Stock Alert:</span>
                          <span className="font-medium text-[var(--sidebar-text)]">
                            ≤ {stockItem.low_stock_threshold} units
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'product' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Product Details</h4>
                {!stockItem.product ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No product information available.</p>
                ) : (
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">Name:</span> {stockItem.product.name}</div>
                      <div><span className="text-[var(--text-secondary)]">SKU:</span> {stockItem.product.sku}</div>
                      <div><span className="text-[var(--text-secondary)]">Net Price:</span> {formatCurrency(stockItem.product.net_price || 0)}</div>
                      <div><span className="text-[var(--text-secondary)]">Cost per item:</span> {formatCurrency(stockItem.product.cost_per_item || 0)}</div>
                      <div><span className="text-[var(--text-secondary)]">Track Quantity:</span> {stockItem.product.track_quantity ? 'Yes' : 'No'}</div>
                      <div><span className="text-[var(--text-secondary)]">Published:</span> {stockItem.product.is_published ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'warehouse' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Warehouse Details</h4>
                {!stockItem.warehouse ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No warehouse information available.</p>
                ) : (
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">Name:</span> {stockItem.warehouse.name}</div>
                      <div><span className="text-[var(--text-secondary)]">Type:</span> {stockItem.warehouse.type}</div>
                      <div><span className="text-[var(--text-secondary)]">Location:</span> {stockItem.warehouse.location || 'N/A'}</div>
                      <div><span className="text-[var(--text-secondary)]">Capacity:</span> {formatCompactNumber(stockItem.warehouse.limit_capacity)}</div>
                      <div><span className="text-[var(--text-secondary)]">Active:</span> {stockItem.warehouse.is_active ? 'Yes' : 'No'}</div>
                    </div>
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
                ) : movements.length === 0 ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No movements found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                      <thead className="bg-[var(--card-secondary-bg)]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Change</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Reference</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Reason</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                        {movements.map(m => (
                          <tr key={m.id}>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)] capitalize">{m.movement_type}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">
                              <span className={m.change > 0 ? 'text-green-600' : 'text-red-600'}>
                                {m.change > 0 ? '+' : ''}{m.change}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{m.reference_code || '-'}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{m.reason || '-'}</td>
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
        <p className="text-center py-4 text-[var(--text-secondary)]">Stock item not found.</p>
      )}
    </Modal>
  );
};

export default StockViewDialog;
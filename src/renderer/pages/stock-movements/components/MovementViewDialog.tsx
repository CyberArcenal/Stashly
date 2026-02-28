// src/renderer/pages/stock-movements/components/MovementViewDialog.tsx
import React, { useState } from 'react';
import Modal from '../../../components/UI/Modal';
import {
  Package, ArrowUp, ArrowDown, RotateCcw, Warehouse, Calendar,
  User, FileText, Code, X, TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';
import type { MovementWithDetails } from '../hooks/useStockMovements';
import { formatDate, formatCompactNumber } from '../../../utils/formatters';

interface MovementViewDialogProps {
  isOpen: boolean;
  movement: MovementWithDetails | null;
  loading: boolean;
  onClose: () => void;
}

const MovementViewDialog: React.FC<MovementViewDialogProps> = ({
  isOpen,
  movement,
  loading,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'product' | 'warehouse' | 'metadata'>('overview');

  if (!movement && !loading) return null;

  const getMovementTypeIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      in: ArrowDown,
      out: ArrowUp,
      transfer_in: RotateCcw,
      transfer_out: RotateCcw,
      adjustment: RefreshCw,
    };
    return iconMap[type] || Package;
  };

  const getMovementTypeColor = (type: string) => {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
      in: { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-500' },
      out: { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-500' },
      transfer_in: { bg: 'bg-teal-100', text: 'text-teal-700', icon: 'text-teal-500' },
      transfer_out: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'text-orange-500' },
      adjustment: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-500' },
    };
    return colorMap[type] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-500' };
  };

  const TypeIcon = movement ? getMovementTypeIcon(movement.movement_type) : Package;
  const typeStyle = movement ? getMovementTypeColor(movement.movement_type) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Movement Details" size="xl">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
        </div>
      ) : movement ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-md flex items-center justify-center ${typeStyle?.bg}`}>
                <TypeIcon className={`w-6 h-6 ${typeStyle?.icon}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
                  {movement.product_name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  SKU: {movement.product_sku} • {movement.warehouse_name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${typeStyle?.bg} ${typeStyle?.text}`}>
                <TypeIcon className="w-3 h-3" />
                {movement.movement_type.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                movement.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {movement.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {movement.change > 0 ? '+' : ''}{formatCompactNumber(movement.change)} units
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-color)]">
            <nav className="flex gap-4">
              {(['overview', 'product', 'warehouse', 'metadata'] as const).map(tab => (
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
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="mt-4">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left column: Movement info */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Package className="w-4 h-4 mr-1" /> Movement Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">ID:</span> {movement.id}</div>
                      <div><span className="text-[var(--text-secondary)]">Type:</span> {movement.movement_type}</div>
                      <div><span className="text-[var(--text-secondary)]">Change:</span> {movement.change > 0 ? '+' : ''}{movement.change}</div>
                      <div><span className="text-[var(--text-secondary)]">Reference:</span> {movement.reference_code || '-'}</div>
                      <div><span className="text-[var(--text-secondary)]">Reason:</span> {movement.reason || '-'}</div>
                      <div><span className="text-[var(--text-secondary)]">User:</span> {movement.user_name}</div>
                    </div>
                  </div>

                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Calendar className="w-4 h-4 mr-1" /> Timeline
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Created:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(movement.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Updated:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(movement.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Summary */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Warehouse className="w-4 h-4 mr-1" /> Warehouse Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-[var(--text-secondary)]">Warehouse:</span> {movement.warehouse_name}</div>
                      {movement.warehouse && (
                        <div><span className="text-[var(--text-secondary)]">Location:</span> {movement.warehouse.location || 'N/A'}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Package className="w-4 h-4 mr-1" /> Product Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-[var(--text-secondary)]">Product:</span> {movement.product_name}</div>
                      <div><span className="text-[var(--text-secondary)]">SKU:</span> {movement.product_sku}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'product' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Product Details</h4>
                {!movement.stockItem?.product ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No product information available.</p>
                ) : (
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">Name:</span> {movement.product_name}</div>
                      <div><span className="text-[var(--text-secondary)]">SKU:</span> {movement.product_sku}</div>
                      <div><span className="text-[var(--text-secondary)]">Price:</span> {movement.stockItem.product.net_price ? `₱${movement.stockItem.product.net_price}` : 'N/A'}</div>
                      <div><span className="text-[var(--text-secondary)]">Category:</span> {movement.stockItem.product.category?.name || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'warehouse' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Warehouse Details</h4>
                {!movement.warehouse && !movement.stockItem?.warehouse ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No warehouse information available.</p>
                ) : (
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">Name:</span> {movement.warehouse_name}</div>
                      <div><span className="text-[var(--text-secondary)]">Type:</span> {movement.warehouse?.type || 'N/A'}</div>
                      <div><span className="text-[var(--text-secondary)]">Location:</span> {movement.warehouse?.location || 'N/A'}</div>
                      <div><span className="text-[var(--text-secondary)]">Capacity:</span> {movement.warehouse?.limit_capacity ? formatCompactNumber(movement.warehouse.limit_capacity) : 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'metadata' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Metadata</h4>
                {!movement.metadata ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No metadata available.</p>
                ) : (
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <pre className="text-xs bg-[var(--card-bg)] p-2 rounded max-h-96 overflow-auto">
                      {JSON.stringify(movement.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-[var(--text-secondary)]">Movement not found.</p>
      )}
    </Modal>
  );
};

export default MovementViewDialog;
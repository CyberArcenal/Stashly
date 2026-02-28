// src/renderer/pages/suppliers/components/SupplierViewDialog.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import {
  Building2, User, Mail, Phone, MapPin, FileText, Calendar, Edit,
  CheckCircle, XCircle, Clock, Package, CreditCard, X
} from 'lucide-react';
import type { Supplier } from '../../../api/core/supplier';
import type { Purchase } from '../../../api/core/purchase';
import { formatDate, formatCurrency } from '../../../utils/formatters';

interface SupplierViewDialogProps {
  isOpen: boolean;
  supplier: Supplier | null;
  purchases: Purchase[];
  loading: boolean;
  loadingPurchases?: boolean;
  onClose: () => void;
  onEdit?: (id: number) => void;
  onFetchPurchases?: () => void;
}

const SupplierViewDialog: React.FC<SupplierViewDialogProps> = ({
  isOpen,
  supplier,
  purchases,
  loading,
  loadingPurchases = false,
  onClose,
  onEdit,
  onFetchPurchases,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contact' | 'purchases' | 'notes'>('overview');

  useEffect(() => {
    if (activeTab === 'purchases' && onFetchPurchases) {
      onFetchPurchases();
    }
  }, [activeTab, onFetchPurchases]);

  if (!supplier && !loading) return null;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: any }> = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    };
    const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Building2 };
    const Icon = config.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Supplier Details" size="xl">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
        </div>
      ) : supplier ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--card-secondary-bg)] rounded-md flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
                  {supplier.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  ID: {supplier.id} • Tax ID: {supplier.tax_id || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(supplier.status)}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  supplier.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {supplier.is_active ? 'Active' : 'Inactive'}
              </span>
              {onEdit && (
                <Button variant="secondary" size="sm" onClick={() => onEdit(supplier.id)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-color)]">
            <nav className="flex gap-4">
              {(['overview', 'contact', 'purchases', 'notes'] as const).map(tab => (
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
                  {tab === 'purchases' && purchases?.length > 0 && (
                    <span className="ml-2 text-xs bg-[var(--accent-blue)] text-white rounded-full px-1.5 py-0.5">
                      {purchases?.length}
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
                      <Building2 className="w-4 h-4 mr-1" /> Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">ID:</span> {supplier.id}</div>
                      <div><span className="text-[var(--text-secondary)]">Name:</span> {supplier.name}</div>
                      <div><span className="text-[var(--text-secondary)]">Tax ID:</span> {supplier.tax_id || '-'}</div>
                      <div><span className="text-[var(--text-secondary)]">Status:</span> {supplier.status}</div>
                      <div><span className="text-[var(--text-secondary)]">Active:</span> {supplier.is_active ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Calendar className="w-4 h-4 mr-1" /> Timeline
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Created:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(supplier.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Updated:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{formatDate(supplier.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Address and summary */}
                <div className="space-y-4">
                  {supplier.address && (
                    <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                        <MapPin className="w-4 h-4 mr-1" /> Address
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{supplier.address}</p>
                    </div>
                  )}

                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Package className="w-4 h-4 mr-1" /> Purchases Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Total Orders:</span>
                        <span className="font-medium text-[var(--sidebar-text)]">{purchases?.length}</span>
                      </div>
                      {purchases?.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Total Spent:</span>
                          <span className="font-medium text-[var(--sidebar-text)]">
                            {formatCurrency(purchases?.reduce((sum, p) => sum + p.total, 0))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Contact Information</h4>
                <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[var(--text-secondary)]" />
                      <div>
                        <div className="text-[var(--text-secondary)] text-xs">Contact Person</div>
                        <div className="font-medium text-[var(--sidebar-text)]">{supplier.contact_person || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                      <div>
                        <div className="text-[var(--text-secondary)] text-xs">Email</div>
                        <div className="font-medium text-[var(--sidebar-text)]">{supplier.email || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                      <div>
                        <div className="text-[var(--text-secondary)] text-xs">Phone</div>
                        <div className="font-medium text-[var(--sidebar-text)]">{supplier.phone || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[var(--text-secondary)]" />
                      <div>
                        <div className="text-[var(--text-secondary)] text-xs">Tax ID</div>
                        <div className="font-medium text-[var(--sidebar-text)]">{supplier.tax_id || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Purchase Orders</h4>
                {loadingPurchases ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
                  </div>
                ) : purchases?.length === 0 ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No purchases found for this supplier.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-color)]">
                      <thead className="bg-[var(--card-secondary-bg)]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">PO #</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Items</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Total</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                        {purchases?.map(p => (
                          <tr key={p.id}>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{p.purchase_number}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{formatDate(p.created_at)}</td>
                            <td className="px-4 py-2 text-sm text-[var(--sidebar-text)]">{p.items?.length || 0}</td>
                            <td className="px-4 py-2 text-sm font-medium text-[var(--accent-green)]">{formatCurrency(p.total)}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                p.status === 'received' ? 'bg-green-100 text-green-700' :
                                p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                p.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {p.status}
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

            {activeTab === 'notes' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Notes</h4>
                {!supplier.notes ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No notes available.</p>
                ) : (
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{supplier.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-[var(--text-secondary)]">Supplier not found.</p>
      )}
    </Modal>
  );
};

export default SupplierViewDialog;
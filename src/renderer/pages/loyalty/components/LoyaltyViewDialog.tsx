// src/renderer/pages/loyalty/components/LoyaltyViewDialog.tsx
import React, { useState } from 'react';
import Modal from '../../../components/UI/Modal';
import {
  Award, User, ShoppingCart, Calendar, FileText, X
} from 'lucide-react';
import type { LoyaltyTransaction } from '../../../api/core/loyalty';
import { formatDate} from '../../../utils/formatters';

interface LoyaltyViewDialogProps {
  transaction: LoyaltyTransaction | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const LoyaltyViewDialog: React.FC<LoyaltyViewDialogProps> = ({
  transaction,
  loading,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'order'>('overview');

  if (!transaction && !loading) return null;

  const getTypeColor = (type: string) => {
    const typeMap: Record<string, { bg: string; text: string }> = {
      earn: { bg: 'bg-green-100', text: 'text-green-700' },
      redeem: { bg: 'bg-blue-100', text: 'text-blue-700' },
      refund: { bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    return typeMap[type] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const typeStyle = transaction ? getTypeColor(transaction.transactionType) : null;
  const pointsSign = transaction?.transactionType === 'earn' ? '+' : '-';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Loyalty Transaction Details" size="xl">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
        </div>
      ) : transaction ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--card-secondary-bg)] rounded-md flex items-center justify-center">
                <Award className="w-6 h-6 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
                  Transaction #{transaction.id}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {transaction.customer?.name || 'Unknown Customer'} • {formatDate(transaction.timestamp, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {typeStyle && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                  {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                </span>
              )}
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--accent-blue)] text-white">
                {pointsSign}{Math.abs(transaction.pointsChange)} pts
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-color)]">
            <nav className="flex gap-4">
              {(['overview', 'customer', 'order'] as const).map(tab => (
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
                {/* Left column: Transaction info */}
                <div className="space-y-4">
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                      <Award className="w-4 h-4 mr-1" /> Transaction Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">ID:</span> {transaction.id}</div>
                      <div><span className="text-[var(--text-secondary)]">Type:</span> {transaction.transactionType}</div>
                      <div><span className="text-[var(--text-secondary)]">Points Change:</span> {pointsSign}{Math.abs(transaction.pointsChange)}</div>
                      <div><span className="text-[var(--text-secondary)]">Timestamp:</span> {formatDate(transaction.timestamp)}</div>
                      <div><span className="text-[var(--text-secondary)]">Updated:</span> {transaction.updatedAt ? formatDate(transaction.updatedAt) : '-'}</div>
                    </div>
                  </div>

                  {transaction.notes && (
                    <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                        <FileText className="w-4 h-4 mr-1" /> Notes
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{transaction.notes}</p>
                    </div>
                  )}
                </div>

                {/* Right column: Summary */}
                <div className="space-y-4">
                  {transaction.customer && (
                    <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                        <User className="w-4 h-4 mr-1" /> Customer Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-[var(--text-secondary)]">Name:</span> {transaction.customer.name}</div>
                        <div><span className="text-[var(--text-secondary)]">Customer ID:</span> {transaction.customer.id}</div>
                      </div>
                    </div>
                  )}

                  {transaction.order && (
                    <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center text-[var(--sidebar-text)]">
                        <ShoppingCart className="w-4 h-4 mr-1" /> Order Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-[var(--text-secondary)]">Order #:</span> {transaction.order.order_number}</div>
                        <div><span className="text-[var(--text-secondary)]">Order ID:</span> {transaction.order.id}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'customer' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Customer Details</h4>
                {!transaction.customer ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No customer information available.</p>
                ) : (
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">ID:</span> {transaction.customer.id}</div>
                      <div><span className="text-[var(--text-secondary)]">Name:</span> {transaction.customer.name}</div>
                      {/* Add more fields if available in the customer object */}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'order' && (
              <div>
                <h4 className="font-medium mb-2 text-[var(--sidebar-text)]">Order Details</h4>
                {!transaction.order ? (
                  <p className="text-center py-4 text-[var(--text-secondary)]">No order information available.</p>
                ) : (
                  <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-[var(--text-secondary)]">Order ID:</span> {transaction.order.id}</div>
                      <div><span className="text-[var(--text-secondary)]">Order #:</span> {transaction.order.order_number}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-[var(--text-secondary)]">Transaction not found.</p>
      )}
    </Modal>
  );
};

export default LoyaltyViewDialog;
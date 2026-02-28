// src/renderer/pages/loyalty/components/LoyaltyTable.tsx
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { LoyaltyTransaction } from '../../../api/core/loyalty';
import { formatDate} from '../../../utils/formatters';
import LoyaltyActionsDropdown from './LoyaltyActionsDropdown';

interface LoyaltyTableProps {
  transactions: LoyaltyTransaction[];
  selectedTransactions: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onView: (transaction: LoyaltyTransaction) => void;
}

const LoyaltyTable: React.FC<LoyaltyTableProps> = ({
  transactions,
  selectedTransactions,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="icon-sm" />
    ) : (
      <ChevronDown className="icon-sm" />
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { bg: string; text: string }> = {
      earn: { bg: 'bg-green-100', text: 'text-green-700' },
      redeem: { bg: 'bg-blue-100', text: 'text-blue-700' },
      refund: { bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    const config = typeMap[type] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div
      className="overflow-x-auto rounded-md border compact-table"
      style={{ borderColor: "var(--border-color)" }}
    >
      <table className="min-w-full" style={{ borderColor: "var(--border-color)" }}>
        <thead style={{ backgroundColor: "var(--card-secondary-bg)" }}>
          <tr>
            <th
              scope="col"
              className="w-10 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              <input
                type="checkbox"
                checked={transactions.length > 0 && selectedTransactions.length === transactions.length}
                onChange={onToggleSelectAll}
                className="h-3 w-3 rounded border-gray-300"
                style={{ color: "var(--accent-blue)" }}
              />
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("customer")}
            >
              <div className="flex items-center gap-xs">
                <span>Customer</span>
                {getSortIcon("customer")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("transactionType")}
            >
              <div className="flex items-center gap-xs">
                <span>Type</span>
                {getSortIcon("transactionType")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("pointsChange")}
            >
              <div className="flex items-center gap-xs">
                <span>Points</span>
                {getSortIcon("pointsChange")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("order")}
            >
              <div className="flex items-center gap-xs">
                <span>Order #</span>
                {getSortIcon("order")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("timestamp")}
            >
              <div className="flex items-center gap-xs">
                <span>Date</span>
                {getSortIcon("timestamp")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Notes
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "var(--card-bg)" }}>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              onClick={(e) =>{e.stopPropagation(); onView(tx)}}
              className={`hover:bg-[var(--card-secondary-bg)] transition-colors ${
                selectedTransactions.includes(tx.id) ? "bg-[var(--accent-blue-dark)]" : ""
              }`}
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <td className="px-2 py-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedTransactions.includes(tx.id)}
                  onChange={() => onToggleSelect(tx.id)}
                  className="h-3 w-3 rounded border-gray-300"
                  style={{ color: "var(--accent-blue)" }}
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: "var(--text-secondary)" }}>
                {tx.customer?.name || 'N/A'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {getTypeBadge(tx.transactionType)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>
                {tx.transactionType === 'earn' ? '+' : '-'}{Math.abs(tx.pointsChange)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: "var(--text-secondary)" }}>
                {tx.order?.order_number || '-'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: "var(--text-secondary)" }}>
                {formatDate(tx.timestamp, 'MMM dd, yyyy HH:mm')}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm max-w-[150px] truncate" style={{ color: "var(--text-secondary)" }}>
                {tx.notes || '-'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <LoyaltyActionsDropdown
                  transaction={tx}
                  onView={onView}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoyaltyTable;
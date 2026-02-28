// src/renderer/pages/customers/components/CustomersTable.tsx
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Customer } from '../../../api/core/customer';
import { formatDate } from '../../../utils/formatters';
import CustomersActionsDropdown from './CustomersActionsDropdown'; // ✅ Correct import

interface CustomersTableProps {
  customers: Customer[];
  selectedCustomers: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onManageLoyalty?: (customer: Customer) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  selectedCustomers,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
  onManageLoyalty,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="icon-sm" />
    ) : (
      <ChevronDown className="icon-sm" />
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      regular: { bg: 'bg-blue-100', text: 'text-blue-700' },
      vip: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      elite: { bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                checked={customers.length > 0 && selectedCustomers.length === customers.length}
                onChange={onToggleSelectAll}
                className="h-3 w-3 rounded border-gray-300"
                style={{ color: "var(--accent-blue)" }}
              />
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center gap-xs">
                <span>Name</span>
                {getSortIcon("name")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("email")}
            >
              <div className="flex items-center gap-xs">
                <span>Email</span>
                {getSortIcon("email")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("phone")}
            >
              <div className="flex items-center gap-xs">
                <span>Phone</span>
                {getSortIcon("phone")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("status")}
            >
              <div className="flex items-center gap-xs">
                <span>Status</span>
                {getSortIcon("status")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("loyaltyPointsBalance")}
            >
              <div className="flex items-center gap-xs">
                <span>Loyalty Points</span>
                {getSortIcon("loyaltyPointsBalance")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("createdAt")}
            >
              <div className="flex items-center gap-xs">
                <span>Joined</span>
                {getSortIcon("createdAt")}
              </div>
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
          {customers.map((customer) => (
            <tr
              key={customer.id}
              onClick={(e) => {e.stopPropagation(); onView(customer)}}
              className={`hover:bg-[var(--card-secondary-bg)] transition-colors ${
                selectedCustomers.includes(customer.id) ? "bg-[var(--accent-blue-dark)]" : ""
              }`}
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <td className="px-2 py-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => onToggleSelect(customer.id)}
                  className="h-3 w-3 rounded border-gray-300"
                  style={{ color: "var(--accent-blue)" }}
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>
                {customer.name}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: "var(--text-secondary)" }}>
                {customer.email || '-'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: "var(--text-secondary)" }}>
                {customer.phone || '-'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {getStatusBadge(customer.status)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>
                {customer.loyaltyPointsBalance}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: "var(--text-secondary)" }}>
                {formatDate(customer.createdAt, 'MMM dd, yyyy')}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <CustomersActionsDropdown
                  customer={customer}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onManageLoyalty={onManageLoyalty}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersTable;
// src/renderer/pages/sales/components/SalesTable.tsx
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { OrderWithDetails } from "../hooks/useOrder";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import SalesActionsDropdown from "./OrderActionsDropdown";

interface SalesTableProps {
  orders: OrderWithDetails[];
  selectedOrders: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (order: OrderWithDetails) => void;
  onEdit: (order: OrderWithDetails) => void;
  onDelete: (order: OrderWithDetails) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({
  orders,
  selectedOrders,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="icon-sm" />
    ) : (
      <ChevronDown className="icon-sm" />
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; color: string }
    > = {
      initiated: { bg: "bg-gray-100", text: "text-gray-600", color: "gray" },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        color: "yellow",
      },
      confirmed: { bg: "bg-blue-100", text: "text-blue-700", color: "blue" },
      completed: { bg: "bg-green-100", text: "text-green-700", color: "green" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", color: "red" },
      refunded: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        color: "purple",
      },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div
      className="overflow-x-auto rounded-md border compact-table"
      style={{ borderColor: "var(--border-color)" }}
    >
      <table
        className="min-w-full"
        style={{ borderColor: "var(--border-color)" }}
      >
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
                checked={
                  orders.length > 0 && selectedOrders.length === orders.length
                }
                onChange={onToggleSelectAll}
                className="h-3 w-3 rounded border-gray-300"
                style={{ color: "var(--accent-blue)" }}
              />
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("order_number")}
            >
              <div className="flex items-center gap-xs">
                <span>Order #</span>
                {getSortIcon("order_number")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("customer_name")}
            >
              <div className="flex items-center gap-xs">
                <span>Customer</span>
                {getSortIcon("customer_name")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-xs">
                <span>Date</span>
                {getSortIcon("created_at")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("total")}
            >
              <div className="flex items-center gap-xs">
                <span>Total</span>
                {getSortIcon("total")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("status")}
            >
              <div className="flex items-center gap-xs">
                <span>Status</span>
                {getSortIcon("status")}
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
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={(e) => {
                e.stopPropagation();
                onView(order);
              }}
              className={`hover:bg-[var(--card-secondary-bg)] transition-colors ${
                selectedOrders.includes(order.id)
                  ? "bg-[var(--accent-blue-dark)]"
                  : ""
              }`}
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <td className="px-2 py-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  checked={selectedOrders.includes(order.id)}
                  onChange={(e) => {e.stopPropagation(); onToggleSelect(order.id)}}
                  className="h-3 w-3 rounded border-gray-300"
                  style={{ color: "var(--accent-blue)" }}
                />
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                style={{ color: "var(--sidebar-text)" }}
              >
                #{order.order_number}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {order.customer_name}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDate(order.created_at, "MMM dd, yyyy")}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                style={{ color: "var(--sidebar-text)" }}
              >
                {formatCurrency(order.total)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {getStatusBadge(order.status)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <SalesActionsDropdown
                  order={order}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdateStatus={onUpdateStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;

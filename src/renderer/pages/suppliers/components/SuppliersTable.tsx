// src/renderer/pages/suppliers/components/SuppliersTable.tsx
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Supplier } from "../../../api/core/supplier";
import { formatDate } from "../../../utils/formatters";
import SuppliersActionsDropdown from "./SuppliersActionsDropdown";

interface SuppliersTableProps {
  suppliers: Supplier[];
  selectedSuppliers: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onApprove?: (supplier: Supplier) => void;
  onReject?: (supplier: Supplier) => void;
  onToggleActive?: (supplier: Supplier) => void;
}

const SuppliersTable: React.FC<SuppliersTableProps> = ({
  suppliers,
  selectedSuppliers,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onToggleActive
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
    const statusMap: Record<string, { bg: string; text: string }> = {
      approved: { bg: "bg-green-100", text: "text-green-700" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
      rejected: { bg: "bg-red-100", text: "text-red-700" },
    };
    const config = statusMap[status] || {
      bg: "bg-gray-100",
      text: "text-gray-700",
    };
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
                  suppliers.length > 0 &&
                  selectedSuppliers.length === suppliers.length
                }
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
              onClick={() => onSort("contact_person")}
            >
              <div className="flex items-center gap-xs">
                <span>Contact Person</span>
                {getSortIcon("contact_person")}
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
              onClick={() => onSort("is_active")}
            >
              <div className="flex items-center gap-xs">
                <span>Active</span>
                {getSortIcon("is_active")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-xs">
                <span>Created</span>
                {getSortIcon("created_at")}
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
          {suppliers.map((supplier) => (
            <tr
              key={supplier.id}
              onClick={(e) => {
                e.stopPropagation();
                onView(supplier);
              }}
              className={`hover:bg-[var(--card-secondary-bg)] transition-colors ${
                selectedSuppliers.includes(supplier.id)
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
                  checked={selectedSuppliers.includes(supplier.id)}
                  onChange={() => onToggleSelect(supplier.id)}
                  className="h-3 w-3 rounded border-gray-300"
                  style={{ color: "var(--accent-blue)" }}
                />
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                style={{ color: "var(--sidebar-text)" }}
              >
                {supplier.name}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {supplier.contact_person || "-"}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {supplier.email || "-"}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {supplier.phone || "-"}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {getStatusBadge(supplier.status)}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {supplier.is_active ? "✅" : "❌"}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDate(supplier.created_at, "MMM dd, yyyy")}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <SuppliersActionsDropdown
                  supplier={supplier}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onApprove={onApprove}
                  onReject={onReject}
                  onToggleActive={onToggleActive}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuppliersTable;

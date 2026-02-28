// src/renderer/pages/warehouse/components/WarehouseTable.tsx
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { WarehouseWithDetails } from "../hooks/useWarehouses";
import { formatDate } from "../../../utils/formatters";
import WarehouseActionsDropdown from "./WarehouseActionsDropdown";

interface WarehouseTableProps {
  warehouses: WarehouseWithDetails[];
  selectedWarehouses: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (warehouse: WarehouseWithDetails) => void;
  onEdit: (warehouse: WarehouseWithDetails) => void;
  onDelete: (warehouse: WarehouseWithDetails) => void;
  onUpdateStatus: (id: number, isActive: boolean) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({
  warehouses,
  selectedWarehouses,
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

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? "bg-[var(--accent-green-dark)] text-[var(--accent-green)]"
      : "bg-[var(--accent-red-dark)] text-[var(--accent-red)]";
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      warehouse: "Warehouse",
      store: "Store",
      online: "Online",
    };
    return types[type] || type;
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
                checked={warehouses.length > 0 && selectedWarehouses.length === warehouses.length}
                onChange={onToggleSelectAll}
                className="h-3 w-3 rounded border-gray-300"
                style={{ color: "var(--accent-blue)" }}
              />
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center gap-xs">
                <span>Name</span>
                {getSortIcon("name")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("type")}
            >
              <div className="flex items-center gap-xs">
                <span>Type</span>
                {getSortIcon("type")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("location")}
            >
              <div className="flex items-center gap-xs">
                <span>Location</span>
                {getSortIcon("location")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("limit_capacity")}
            >
              <div className="flex items-center gap-xs">
                <span>Capacity</span>
                {getSortIcon("limit_capacity")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("is_active")}
            >
              <div className="flex items-center gap-xs">
                <span>Status</span>
                {getSortIcon("is_active")}
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
          {warehouses.map((warehouse) => (
            <tr
              key={warehouse.id}
              onClick={(e) =>{e.stopPropagation(); onView(warehouse)}}
              className={`hover:bg-[var(--card-secondary-bg)] transition-colors ${
                selectedWarehouses.includes(warehouse.id) ? "bg-[var(--accent-blue-dark)]" : ""
              }`}
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <td className="px-2 py-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedWarehouses.includes(warehouse.id)}
                  onChange={() => onToggleSelect(warehouse.id)}
                  className="h-3 w-3 rounded border-gray-300"
                  style={{ color: "var(--accent-blue)" }}
                />
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                style={{ color: "var(--sidebar-text)" }}
              >
                {warehouse.name}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {getTypeLabel(warehouse.type)}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {warehouse.location || "-"}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {warehouse.limit_capacity.toLocaleString()}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-xs py-xs rounded-full text-xs font-medium ${getStatusBadge(
                    warehouse.is_active
                  )}`}
                >
                  {warehouse.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <WarehouseActionsDropdown
                  warehouse={warehouse}
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

export default WarehouseTable;
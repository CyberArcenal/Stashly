// src/renderer/pages/stock-movements/components/MovementsTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Eye } from "lucide-react";
import type { MovementWithDetails } from "../hooks/useStockMovements";
import { formatDate, formatCompactNumber } from "../../../utils/formatters";

interface MovementsTableProps {
  movements: MovementWithDetails[];
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (movement: MovementWithDetails) => void;
}

const MovementsTable: React.FC<MovementsTableProps> = ({
  movements,
  onSort,
  sortConfig,
  onView,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="icon-sm" />
    ) : (
      <ChevronDown className="icon-sm" />
    );
  };

  const getMovementTypeBadge = (type: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      in: { bg: "bg-green-100", text: "text-green-700", label: "Stock In" },
      out: { bg: "bg-red-100", text: "text-red-700", label: "Stock Out" },
      transfer_in: { bg: "bg-teal-100", text: "text-teal-700", label: "Transfer In" },
      transfer_out: { bg: "bg-orange-100", text: "text-orange-700", label: "Transfer Out" },
      adjustment: { bg: "bg-purple-100", text: "text-purple-700", label: "Adjustment" },
    };
    const c = config[type] || { bg: "bg-gray-100", text: "text-gray-700", label: type };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getChangeDisplay = (change: number) => {
    const color = change > 0 ? "text-green-600" : "text-red-600";
    const sign = change > 0 ? "+" : "";
    return <span className={color}>{sign}{formatCompactNumber(change)}</span>;
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
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-xs">
                <span>Date/Time</span>
                {getSortIcon("created_at")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("product_name")}
            >
              <div className="flex items-center gap-xs">
                <span>Product</span>
                {getSortIcon("product_name")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("movement_type")}
            >
              <div className="flex items-center gap-xs">
                <span>Type</span>
                {getSortIcon("movement_type")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("change")}
            >
              <div className="flex items-center gap-xs">
                <span>Change</span>
                {getSortIcon("change")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("warehouse_name")}
            >
              <div className="flex items-center gap-xs">
                <span>Warehouse</span>
                {getSortIcon("warehouse_name")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("user_name")}
            >
              <div className="flex items-center gap-xs">
                <span>User</span>
                {getSortIcon("user_name")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
            >
              Reference
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "var(--card-bg)" }}>
          {movements.map((movement) => (
            <tr
              key={movement.id}
              className="hover:bg-[var(--card-secondary-bg)] transition-colors"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDate(movement.created_at, "MMM dd, yyyy HH:mm")}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                style={{ color: "var(--sidebar-text)" }}
              >
                <div>{movement.product_name}</div>
                <div className="text-xs text-gray-500">{movement.product_sku}</div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {getMovementTypeBadge(movement.movement_type)}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                style={{ color: "var(--sidebar-text)" }}
              >
                {getChangeDisplay(movement.change)}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {movement.warehouse_name}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {movement.user_name}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {movement.reference_code || "-"}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onView(movement)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovementsTable;
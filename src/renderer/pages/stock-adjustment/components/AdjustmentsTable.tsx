// src/renderer/pages/stock-adjustment/components/AdjustmentsTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Plus, Minus, User } from "lucide-react";
import type { MovementWithDetails } from "../hooks/useStockAdjustment";

interface AdjustmentsTableProps {
  movements: MovementWithDetails[];
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
}

const AdjustmentsTable: React.FC<AdjustmentsTableProps> = ({
  movements,
  onSort,
  sortConfig,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="icon-sm" />
    ) : (
      <ChevronDown className="icon-sm" />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  function onView(movement: MovementWithDetails) {
    throw new Error("Function not implemented.");
  }

  return (
    <div
      className="overflow-x-auto rounded-md border"
      style={{ borderColor: "var(--border-color)" }}
    >
      <table className="min-w-full compact-table">
        <thead style={{ backgroundColor: "var(--card-secondary-bg)" }}>
          <tr>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-xs">
                <span>Date</span>
                {getSortIcon("created_at")}
              </div>
            </th>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("product_name")}
            >
              <div className="flex items-center gap-xs">
                <span>Product</span>
                {getSortIcon("product_name")}
              </div>
            </th>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("warehouse_name")}
            >
              <div className="flex items-center gap-xs">
                <span>Warehouse</span>
                {getSortIcon("warehouse_name")}
              </div>
            </th>
            <th
              className="px-4 py-2 text-right text-xs font-semibold cursor-pointer"
              onClick={() => onSort("change")}
            >
              <div className="flex items-center gap-xs">
                <span>Change</span>
                {getSortIcon("change")}
              </div>
            </th>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("reason")}
            >
              <div className="flex items-center gap-xs">
                <span>Reason</span>
                {getSortIcon("reason")}
              </div>
            </th>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("user_name")}
            >
              <div className="flex items-center gap-xs">
                <span>By</span>
                {getSortIcon("user_name")}
              </div>
            </th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "var(--card-bg)" }}>
          {movements.map((movement) => (
            <tr
              key={movement.id}
              onClick={(e) =>{e.stopPropagation(); onView(movement)}}
              className="hover:bg-[var(--card-secondary-bg)] transition-colors"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDate(movement.created_at)}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--sidebar-text)" }}
              >
                <div>{movement.product_name}</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {movement.product_sku}
                </div>
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {movement.warehouse_name}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    movement.change > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {movement.change > 0 ? (
                    <Plus className="icon-xs mr-1" />
                  ) : (
                    <Minus className="icon-xs mr-1" />
                  )}
                  {Math.abs(movement.change)}
                </span>
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm max-w-xs truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {movement.reason || "-"}
              </td>
              <td
                className="px-4 py-2 whitespace-nowrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="flex items-center gap-1">
                  <User className="icon-xs" />
                  {movement.user_name}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdjustmentsTable;

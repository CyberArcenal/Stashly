// src/renderer/pages/stock-items/components/StockTable.tsx
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { StockItemWithDetails } from "../hooks/useStockItems";
import { formatCompactNumber, formatCurrency} from "../../../utils/formatters";
import StockActionsDropdown from "./StockActionsDropdown";

interface StockTableProps {
  stockItems: StockItemWithDetails[];
  selectedItems: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (item: StockItemWithDetails) => void;
  onEditThreshold: (item: StockItemWithDetails) => void;
  onReorder: (item: StockItemWithDetails) => void;
}

const StockTable: React.FC<StockTableProps> = ({
  stockItems,
  selectedItems,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEditThreshold,
  onReorder,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="icon-sm" />
    ) : (
      <ChevronDown className="icon-sm" />
    );
  };

  const getStatusBadge = (status: StockItemWithDetails["status"]) => {
    switch (status) {
      case "normal":
        return "bg-[var(--accent-green-dark)] text-[var(--accent-green)]";
      case "low-stock":
        return "bg-[var(--accent-orange-dark)] text-[var(--accent-orange)]";
      case "out-of-stock":
        return "bg-[var(--accent-red-dark)] text-[var(--accent-red)]";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getStatusText = (status: StockItemWithDetails["status"]) => {
    switch (status) {
      case "normal": return "Normal";
      case "low-stock": return "Low Stock";
      case "out-of-stock": return "Out of Stock";
      default: return status;
    }
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
                checked={stockItems.length > 0 && selectedItems.length === stockItems.length}
                onChange={onToggleSelectAll}
                className="h-3 w-3 rounded border-gray-300"
                style={{ color: "var(--accent-blue)" }}
              />
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
              onClick={() => onSort("quantity")}
            >
              <div className="flex items-center gap-xs">
                <span>Quantity</span>
                {getSortIcon("quantity")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("reorder_level")}
            >
              <div className="flex items-center gap-xs">
                <span>Reorder Level</span>
                {getSortIcon("reorder_level")}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors"
              onClick={() => onSort("total_value")}
            >
              <div className="flex items-center gap-xs">
                <span>Total Value</span>
                {getSortIcon("total_value")}
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
          {stockItems.map((item) => {
            const totalValue = (item.product?.cost_per_item || 0) * item.quantity;
            return (
              <tr
                key={item.id}
                onClick={(e) =>{e.stopPropagation(); onView(item)}}
                className={`hover:bg-[var(--card-secondary-bg)] transition-colors ${
                  selectedItems.includes(item.id) ? "bg-[var(--accent-blue-dark)]" : ""
                }`}
                style={{ borderBottom: "1px solid var(--border-color)" }}
              >
                <td className="px-2 py-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                    checked={selectedItems.includes(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    className="h-3 w-3 rounded border-gray-300"
                    style={{ color: "var(--accent-blue)" }}
                  />
                </td>
                <td
                  className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                  style={{ color: "var(--sidebar-text)" }}
                >
                  <div>{item.product_name}</div>
                  <div className="text-xs text-gray-500">{item.product_sku}</div>
                </td>
                <td
                  className="px-4 py-2 whitespace-nowrap text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.warehouse_name}
                </td>
                <td
                  className="px-4 py-2 whitespace-nowrap text-sm"
                  style={{ color: "var(--sidebar-text)" }}
                >
                  {formatCompactNumber(item.quantity)}
                </td>
                <td
                  className="px-4 py-2 whitespace-nowrap text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {formatCompactNumber(item.reorder_level)}
                </td>
                <td
                  className="px-4 py-2 whitespace-nowrap text-sm"
                  style={{ color: "var(--sidebar-text)" }}
                >
                  {formatCurrency(totalValue)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-xs py-xs rounded-full text-xs font-medium ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {getStatusText(item.status)}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <StockActionsDropdown
                    stockItem={item}
                    onView={onView}
                    onEditThreshold={onEditThreshold}
                    onReorder={onReorder}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
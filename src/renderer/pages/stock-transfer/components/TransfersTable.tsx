// src/renderer/pages/stock-transfer/components/TransfersTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Calendar, Package, User } from "lucide-react";
import type { TransferWithDetails } from "../hooks/useStockTransfer";

interface TransfersTableProps {
  transfers: TransferWithDetails[];
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
}

const TransfersTable: React.FC<TransfersTableProps> = ({
  transfers,
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

  const getTypeBadge = (type: string) => {
    if (type === "transfer_in") {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Transfer In</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">Transfer Out</span>;
  };

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
                <Calendar className="icon-xs" />
                <span>Date</span>
                {getSortIcon("created_at")}
              </div>
            </th>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("movement_type")}
            >
              <div className="flex items-center gap-xs">
                <span>Type</span>
                {getSortIcon("movement_type")}
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
            <th className="px-4 py-2 text-left text-xs font-semibold">Variant</th>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("from_warehouse_name")}
            >
              <div className="flex items-center gap-xs">
                <span>From</span>
                {getSortIcon("from_warehouse_name")}
              </div>
            </th>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("to_warehouse_name")}
            >
              <div className="flex items-center gap-xs">
                <span>To</span>
                {getSortIcon("to_warehouse_name")}
              </div>
            </th>
            <th
              className="px-4 py-2 text-right text-xs font-semibold cursor-pointer"
              onClick={() => onSort("change")}
            >
              <div className="flex items-center gap-xs">
                <span>Qty</span>
                {getSortIcon("change")}
              </div>
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold">Reason</th>
            <th
              className="px-4 py-2 text-left text-xs font-semibold cursor-pointer"
              onClick={() => onSort("user_name")}
            >
              <div className="flex items-center gap-xs">
                <User className="icon-xs" />
                <span>By</span>
                {getSortIcon("user_name")}
              </div>
            </th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "var(--card-bg)" }}>
          {transfers.map((transfer) => (
            <tr
              key={transfer.id}
              className="hover:bg-[var(--card-secondary-bg)] transition-colors"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
             <td className="px-4 py-2 whitespace-nowrap text-sm overflow-hidden text-ellipsis" style={{ color: "var(--text-secondary)", maxWidth: "200px" }} >
                {formatDate(transfer.created_at)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {getTypeBadge(transfer.movement_type)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: "var(--sidebar-text)" }}>
                <div>{transfer.product_name}</div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{transfer.product_sku}</div>
              </td>
             <td className="px-4 py-2 whitespace-nowrap text-sm overflow-hidden text-ellipsis" style={{ color: "var(--text-secondary)", maxWidth: "200px" }} >
                {transfer.stockItem?.variant?.id ? "Variant" : "-"}
              </td>
             <td className="px-4 py-2 whitespace-nowrap text-sm overflow-hidden text-ellipsis" style={{ color: "var(--text-secondary)", maxWidth: "200px" }} >
                {transfer.from_warehouse_name}
              </td>
             <td className="px-4 py-2 whitespace-nowrap text-sm overflow-hidden text-ellipsis" style={{ color: "var(--text-secondary)", maxWidth: "200px" }} >
                {transfer.to_warehouse_name}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  transfer.change > 0 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                }`}>
                  <Package className="icon-xs mr-1" />
                  {Math.abs(transfer.change)}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm max-w-xs truncate" style={{ color: "var(--text-secondary)" }}>
                {transfer.reason || "-"}
              </td>
             <td className="px-4 py-2 whitespace-nowrap text-sm overflow-hidden text-ellipsis" style={{ color: "var(--text-secondary)", maxWidth: "200px" }} >
                <div className="flex items-center gap-1">
                  <User className="icon-xs" />
                  {transfer.user_name}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransfersTable;
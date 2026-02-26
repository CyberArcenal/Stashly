// src/renderer/pages/stock-items/components/StockViewDialog.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import type { StockItemWithDetails } from "../hooks/useStockItems";
import { formatCurrency, formatDate, formatCompactNumber } from "../../../utils/formatters";

interface StockViewDialogProps {
  stockItem: StockItemWithDetails | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const StockViewDialog: React.FC<StockViewDialogProps> = ({
  stockItem,
  loading,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Item Details">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : stockItem ? (
        <div className="space-y-3">
          <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Placeholder: Detailed view will be enhanced later.
          </p>
          <div>
            <span className="font-medium">ID:</span> {stockItem.id}
          </div>
          <div>
            <span className="font-medium">Product:</span> {stockItem.product_name} ({stockItem.product_sku})
          </div>
          <div>
            <span className="font-medium">Warehouse:</span> {stockItem.warehouse_name}
          </div>
          <div>
            <span className="font-medium">Quantity:</span> {formatCompactNumber(stockItem.quantity)}
          </div>
          <div>
            <span className="font-medium">Reorder Level:</span> {formatCompactNumber(stockItem.reorder_level)}
          </div>
          <div>
            <span className="font-medium">Low Stock Threshold:</span>{" "}
            {stockItem.low_stock_threshold !== null ? formatCompactNumber(stockItem.low_stock_threshold) : "Not set"}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              stockItem.status === "normal" ? "bg-green-100 text-green-700" :
              stockItem.status === "low-stock" ? "bg-orange-100 text-orange-700" :
              "bg-red-100 text-red-700"
            }`}>
              {stockItem.status === "normal" ? "Normal" :
               stockItem.status === "low-stock" ? "Low Stock" : "Out of Stock"}
            </span>
          </div>
          <div>
            <span className="font-medium">Created:</span> {formatDate(stockItem.created_at, "MMM dd, yyyy HH:mm")}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {formatDate(stockItem.updated_at, "MMM dd, yyyy HH:mm")}
          </div>
        </div>
      ) : (
        <p className="text-center py-4">No stock item data.</p>
      )}
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="btn btn-secondary btn-sm">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default StockViewDialog;
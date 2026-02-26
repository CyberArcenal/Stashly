// src/renderer/pages/purchases/components/PurchaseViewDialog.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import type { Purchase } from "../../../api/core/purchase";
import { formatCurrency, formatDate } from "../../../utils/formatters";

interface PurchaseViewDialogProps {
  purchase: Purchase | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseViewDialog: React.FC<PurchaseViewDialogProps> = ({
  purchase,
  loading,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Details">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : purchase ? (
        <div className="space-y-3">
          <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Placeholder: Ang view dialog ay gagawin sa susunod.
          </p>
          <div>
            <span className="font-medium">PO #:</span> {purchase.purchase_number}
          </div>
          <div>
            <span className="font-medium">Supplier:</span>{" "}
            {purchase.supplier?.name || "Unknown"}
          </div>
          <div>
            <span className="font-medium">Warehouse:</span>{" "}
            {purchase.warehouse?.name || "Unknown"}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              purchase.status === "received" ? "bg-green-100 text-green-700" :
              purchase.status === "cancelled" ? "bg-red-100 text-red-700" :
              purchase.status === "ordered" as "initiated" | "pending" | "confirmed" | "received" | "cancelled" ? "bg-blue-100 text-blue-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {purchase.status}
            </span>
          </div>
          <div>
            <span className="font-medium">Subtotal:</span> {formatCurrency(purchase.subtotal)}
          </div>
          <div>
            <span className="font-medium">Tax:</span> {formatCurrency(purchase.tax_amount)}
          </div>
          <div>
            <span className="font-medium">Total:</span> {formatCurrency(purchase.total)}
          </div>
          <div>
            <span className="font-medium">Notes:</span> {purchase.notes || "-"}
          </div>
          <div>
            <span className="font-medium">Created:</span>{" "}
            {formatDate(purchase.created_at, "MMM dd, yyyy HH:mm")}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>{" "}
            {formatDate(purchase.updated_at, "MMM dd, yyyy HH:mm")}
          </div>
        </div>
      ) : (
        <p className="text-center py-4">No purchase data.</p>
      )}
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="btn btn-secondary btn-sm">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default PurchaseViewDialog;
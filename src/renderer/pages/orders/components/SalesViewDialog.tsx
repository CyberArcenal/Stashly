// src/renderer/pages/sales/components/SalesViewDialog.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import type { Order } from "../../../api/core/order";
import { formatCurrency, formatDate } from "../../../utils/formatters";

interface SalesViewDialogProps {
  order: Order | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const SalesViewDialog: React.FC<SalesViewDialogProps> = ({
  order,
  loading,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : order ? (
        <div className="space-y-3">
          <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Placeholder: Ang view dialog ay gagawin sa susunod.
          </p>
          <div>
            <span className="font-medium">Order #:</span> {order.order_number}
          </div>
          <div>
            <span className="font-medium">Customer:</span>{" "}
            {order.customer?.name || "Walk-in"}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.status === "completed" ? "bg-green-100 text-green-700" :
              order.status === "cancelled" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {order.status}
            </span>
          </div>
          <div>
            <span className="font-medium">Subtotal:</span> {formatCurrency(order.subtotal)}
          </div>
          <div>
            <span className="font-medium">Tax:</span> {formatCurrency(order.tax_amount)}
          </div>
          <div>
            <span className="font-medium">Total:</span> {formatCurrency(order.total)}
          </div>
          <div>
            <span className="font-medium">Notes:</span> {order.notes || "-"}
          </div>
          <div>
            <span className="font-medium">Created:</span>{" "}
            {formatDate(order.created_at, "MMM dd, yyyy HH:mm")}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>{" "}
            {formatDate(order.updated_at, "MMM dd, yyyy HH:mm")}
          </div>
        </div>
      ) : (
        <p className="text-center py-4">No order data.</p>
      )}
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="btn btn-secondary btn-sm">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default SalesViewDialog;
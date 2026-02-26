// src/renderer/pages/stock-movements/components/MovementViewDialog.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import type { MovementWithDetails } from "../hooks/useStockMovements";
import { formatDate, formatCompactNumber } from "../../../utils/formatters";

interface MovementViewDialogProps {
  movement: MovementWithDetails | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const MovementViewDialog: React.FC<MovementViewDialogProps> = ({
  movement,
  loading,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Movement Details">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : movement ? (
        <div className="space-y-3">
          <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Placeholder: Detailed view will be enhanced later.
          </p>
          <div>
            <span className="font-medium">ID:</span> {movement.id}
          </div>
          <div>
            <span className="font-medium">Product:</span> {movement.product_name} ({movement.product_sku})
          </div>
          <div>
            <span className="font-medium">Movement Type:</span>{" "}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              movement.movement_type === "in" ? "bg-green-100 text-green-700" :
              movement.movement_type === "out" ? "bg-red-100 text-red-700" :
              movement.movement_type === "transfer_in" ? "bg-teal-100 text-teal-700" :
              movement.movement_type === "transfer_out" ? "bg-orange-100 text-orange-700" :
              "bg-purple-100 text-purple-700"
            }`}>
              {movement.movement_type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div>
            <span className="font-medium">Change:</span>{" "}
            <span className={movement.change > 0 ? "text-green-600" : "text-red-600"}>
              {movement.change > 0 ? "+" : ""}{formatCompactNumber(movement.change)}
            </span>
          </div>
          <div>
            <span className="font-medium">Warehouse:</span> {movement.warehouse_name}
          </div>
          <div>
            <span className="font-medium">User:</span> {movement.user_name}
          </div>
          <div>
            <span className="font-medium">Reference:</span> {movement.reference_code || "-"}
          </div>
          <div>
            <span className="font-medium">Reason:</span> {movement.reason || "-"}
          </div>
          <div>
            <span className="font-medium">Created:</span> {formatDate(movement.created_at, "MMM dd, yyyy HH:mm:ss")}
          </div>
          {movement.metadata && (
            <div>
              <span className="font-medium">Metadata:</span>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(movement.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center py-4">No movement data.</p>
      )}
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="btn btn-secondary btn-sm">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default MovementViewDialog;
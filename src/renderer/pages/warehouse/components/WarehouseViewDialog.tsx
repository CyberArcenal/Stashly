// src/renderer/pages/warehouse/components/WarehouseViewDialog.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import type { Warehouse } from "../../../api/core/warehouse";
import { formatDate } from "../../../utils/formatters";

interface WarehouseViewDialogProps {
  warehouse: Warehouse | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const WarehouseViewDialog: React.FC<WarehouseViewDialogProps> = ({
  warehouse,
  loading,
  isOpen,
  onClose,
}) => {
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      warehouse: "Warehouse",
      store: "Store",
      online: "Online",
    };
    return types[type] || type;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Warehouse Details">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : warehouse ? (
        <div className="space-y-3">
          <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Placeholder: Ang view dialog ay gagawin sa susunod.
          </p>
          <div>
            <span className="font-medium">ID:</span> {warehouse.id}
          </div>
          <div>
            <span className="font-medium">Name:</span> {warehouse.name}
          </div>
          <div>
            <span className="font-medium">Type:</span> {getTypeLabel(warehouse.type)}
          </div>
          <div>
            <span className="font-medium">Location:</span> {warehouse.location || "-"}
          </div>
          <div>
            <span className="font-medium">Capacity:</span> {warehouse.limit_capacity.toLocaleString()} units
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className={warehouse.is_active ? "text-green-600" : "text-red-600"}>
              {warehouse.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="font-medium">Created:</span>{" "}
            {formatDate(warehouse.created_at, "MMM dd, yyyy HH:mm")}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>{" "}
            {formatDate(warehouse.updated_at, "MMM dd, yyyy HH:mm")}
          </div>
        </div>
      ) : (
        <p className="text-center py-4">No warehouse data.</p>
      )}
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="btn btn-secondary btn-sm">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default WarehouseViewDialog;
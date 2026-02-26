// src/renderer/pages/warehouse/components/WarehouseFormDialog.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import type { Warehouse } from "../../../api/core/warehouse";

interface WarehouseFormDialogProps {
  isOpen: boolean;
  mode: "add" | "edit";
  warehouseId: number | null;
  initialData: Partial<Warehouse> | null;
  onClose: () => void;
  onSuccess: () => void;
}

const WarehouseFormDialog: React.FC<WarehouseFormDialogProps> = ({
  isOpen,
  mode,
  warehouseId,
  initialData,
  onClose,
  onSuccess,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // dummy success
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "add" ? "Add Warehouse" : "Edit Warehouse"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Placeholder: Ang form na ito ay gagawin sa susunod na development phase.
        </p>
        <div>
          <label className="block text-sm font-medium mb-1">Name (dummy)</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            defaultValue={initialData?.name || ""}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success">
            {mode === "add" ? "Create" : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WarehouseFormDialog;
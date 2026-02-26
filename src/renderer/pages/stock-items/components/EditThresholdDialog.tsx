// src/renderer/pages/stock-items/components/EditThresholdDialog.tsx
import React, { useState } from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import type { StockItemWithDetails } from "../hooks/useStockItems";
import stockItemAPI from "../../../api/core/stockItem";
import { showSuccess, showError } from "../../../utils/notification";

interface EditThresholdDialogProps {
  isOpen: boolean;
  stockItem: StockItemWithDetails | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditThresholdDialog: React.FC<EditThresholdDialogProps> = ({
  isOpen,
  stockItem,
  onClose,
  onSuccess,
}) => {
  const [threshold, setThreshold] = useState(stockItem?.reorder_level || 0);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (stockItem) {
      setThreshold(stockItem.reorder_level);
    }
  }, [stockItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItem) return;
    setLoading(true);
    try {
      const response = await stockItemAPI.update(stockItem.id, { reorder_level: threshold });
      if (response.status) {
        showSuccess("Reorder threshold updated successfully.");
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Reorder Threshold">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Placeholder: This functionality is partially implemented.
        </p>
        {stockItem && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <input
                type="text"
                value={stockItem.product_name}
                disabled
                className="w-full border rounded p-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse</label>
              <input
                type="text"
                value={stockItem.warehouse_name}
                disabled
                className="w-full border rounded p-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Quantity</label>
              <input
                type="number"
                value={stockItem.quantity}
                disabled
                className="w-full border rounded p-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Reorder Threshold</label>
              <input
                type="number"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full border rounded p-2"
                required
              />
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditThresholdDialog;
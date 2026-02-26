// src/renderer/pages/stock-items/components/ReorderDialog.tsx
import React, { useState } from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import type { StockItemWithDetails } from "../hooks/useStockItems";
import { dialogs } from "../../../utils/dialogs";

interface ReorderDialogProps {
  isOpen: boolean;
  stockItem: StockItemWithDetails | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ReorderDialog: React.FC<ReorderDialogProps> = ({
  isOpen,
  stockItem,
  onClose,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (stockItem) {
      setQuantity(stockItem.reorder_level * 2 || 10); // default suggestion
    }
  }, [stockItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItem) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      dialogs.success(`Reorder request for ${quantity} units submitted.`, "Reorder");
      setLoading(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reorder Stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Placeholder: This will trigger a purchase order creation in the future.
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
              <label className="block text-sm font-medium mb-1">Reorder Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
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
            {loading ? "Submitting..." : "Submit Reorder"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReorderDialog;
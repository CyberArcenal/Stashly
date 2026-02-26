// src/renderer/pages/categories/components/CategoryFormDialog.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import type { Category } from "../../../api/core/category";

interface CategoryFormDialogProps {
  isOpen: boolean;
  mode: "add" | "edit";
  categoryId: number | null;
  initialData: Partial<Category> | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  mode,
  categoryId,
  initialData,
  onClose,
  onSuccess,
}) => {
  // Placeholder: dummy form, gagawin sa future
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // dummy success
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "add" ? "Add Category" : "Edit Category"}>
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

export default CategoryFormDialog;
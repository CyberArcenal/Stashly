// src/renderer/pages/categories/components/CategoryViewDialog.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import type { Category } from "../../../api/core/category";

interface CategoryViewDialogProps {
  category: Category | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const CategoryViewDialog: React.FC<CategoryViewDialogProps> = ({
  category,
  loading,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Category Details">
      {loading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : category ? (
        <div className="space-y-3">
          <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Placeholder: Ang view dialog ay gagawin sa susunod.
          </p>
          <div>
            <span className="font-medium">ID:</span> {category.id}
          </div>
          <div>
            <span className="font-medium">Name:</span> {category.name}
          </div>
          <div>
            <span className="font-medium">Slug:</span> {category.slug}
          </div>
          <div>
            <span className="font-medium">Description:</span> {category.description || "-"}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className={category.is_active ? "text-green-600" : "text-red-600"}>
              {category.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="font-medium">Created:</span>{" "}
            {new Date(category.created_at).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Updated:</span>{" "}
            {new Date(category.updated_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <p className="text-center py-4">No category data.</p>
      )}
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="btn btn-secondary btn-sm"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default CategoryViewDialog;
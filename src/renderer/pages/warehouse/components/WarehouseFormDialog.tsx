// src/renderer/pages/warehouse/components/WarehouseFormDialog.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { dialogs } from "../../../utils/dialogs";
import type {
  Warehouse,
  WarehouseCreateData,
  WarehouseUpdateData,
} from "../../../api/core/warehouse";
import warehouseAPI from "../../../api/core/warehouse";

interface WarehouseFormDialogProps {
  isOpen: boolean;
  mode: "add" | "edit";
  warehouseId: number | null;
  initialData: Partial<Warehouse> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  type: "warehouse" | "store" | "online";
  location: string;
  limit_capacity: number;
  is_active: boolean;
};

const WarehouseFormDialog: React.FC<WarehouseFormDialogProps> = ({
  isOpen,
  mode,
  warehouseId,
  initialData,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      type: "warehouse",
      location: "",
      limit_capacity: 0,
      is_active: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        type: initialData.type || "warehouse",
        location: initialData.location || "",
        limit_capacity: initialData.limit_capacity || 0,
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset(); // clear for add mode
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "add") {
        if (!data.name) throw new Error("Warehouse name is required");
        await warehouseAPI.create({
          name: data.name,
          type: data.type,
          location: data.location || null,
          limit_capacity: data.limit_capacity || 0,
          is_active: data.is_active,
        });
        dialogs.success("Warehouse created successfully");
      } else {
        if (!warehouseId) throw new Error("Warehouse ID missing");
        await warehouseAPI.update(warehouseId, {
          name: data.name,
          type: data.type,
          location: data.location || null,
          limit_capacity: data.limit_capacity || 0,
          is_active: data.is_active,
        });
        dialogs.success("Warehouse updated successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to save warehouse");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      safetyClose={true}
      onClose={onClose}
      title={mode === "add" ? "Add Warehouse" : "Edit Warehouse"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Warehouse Name *
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Type
              </label>
              <select
                {...register("type")}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              >
                <option value="warehouse">Warehouse</option>
                <option value="store">Store</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Capacity */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Capacity (units)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                {...register("limit_capacity", { valueAsNumber: true })}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
            </div>

            {/* Location */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Location
              </label>
              <input
                {...register("location")}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
            </div>

            {/* Active Checkbox */}
            {/* <div className="pt-2">
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
                <input type="checkbox" {...register('is_active')} className="h-4 w-4" />
                Active
              </label>
            </div> */}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "add"
                ? "Create Warehouse"
                : "Update Warehouse"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WarehouseFormDialog;

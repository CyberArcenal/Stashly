// src/renderer/pages/suppliers/components/SupplierFormDialog.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { dialogs } from "../../../utils/dialogs";
import type {
  Supplier,
  SupplierCreateData,
  SupplierUpdateData,
} from "../../../api/core/supplier";
import supplierAPI from "../../../api/core/supplier";

interface SupplierFormDialogProps {
  isOpen: boolean;
  mode: "add" | "edit";
  supplierId: number | null;
  initialData: Partial<Supplier> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  is_active: boolean;
};

const SupplierFormDialog: React.FC<SupplierFormDialogProps> = ({
  isOpen,
  mode,
  supplierId,
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
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      tax_id: "",
      notes: "",
      status: "pending",
      is_active: false,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        contact_person: initialData.contact_person || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        tax_id: initialData.tax_id || "",
        notes: initialData.notes || "",
        status: initialData.status || "pending",
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset(); // clear for add mode
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "add") {
        if (!data.name) throw new Error("Supplier name is required");
        await supplierAPI.create({
          name: data.name,
          contact_person: data.contact_person || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          address: data.address || undefined,
          tax_id: data.tax_id || undefined,
          notes: data.notes || undefined,
          status: data.status,
          is_active: data.is_active,
        });
        dialogs.success("Supplier created successfully");
      } else {
        if (!supplierId) throw new Error("Supplier ID missing");
        await supplierAPI.update(supplierId, {
          name: data.name,
          contact_person: data.contact_person || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          address: data.address || undefined,
          tax_id: data.tax_id || undefined,
          notes: data.notes || undefined,
        });
        dialogs.success("Supplier updated successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to save supplier");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      safetyClose={true}
      onClose={onClose}
      title={mode === "add" ? "Add Supplier" : "Edit Supplier"}
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
                Supplier Name *
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

            {/* Contact Person */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Contact Person
              </label>
              <input
                {...register("contact_person")}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Email
              </label>
              <input
                type="email"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Phone
              </label>
              <input
                {...register("phone")}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Address */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Address
              </label>
              <textarea
                {...register("address")}
                rows={3}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
            </div>

            {/* Tax ID */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Tax ID
              </label>
              <input
                {...register("tax_id")}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
            </div>

            {/* Status */}
            {/* <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>
                Status
              </label>
              <select
                {...register('status')}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--sidebar-text)',
                }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div> */}

            {/* Notes */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
            </div>

            {/* Active Checkbox */}
            {/* <div>
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
                ? "Create Supplier"
                : "Update Supplier"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierFormDialog;

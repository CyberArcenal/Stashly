// src/renderer/pages/customers/components/CustomerFormDialog.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { dialogs } from "../../../utils/dialogs";
import type {
  Customer,
  CustomerCreateData,
  CustomerUpdateData,
} from "../../../api/core/customer";
import customerAPI from "../../../api/core/customer";

interface CustomerFormDialogProps {
  isOpen: boolean;
  mode: "add" | "edit";
  customerId: number | null;
  initialData: Partial<Customer> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  email: string;
  phone: string;
  contactInfo: string;
  status: "regular" | "vip" | "elite";
  // Points fields are intentionally omitted – managed separately
};

const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  isOpen,
  mode,
  customerId,
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
      email: "",
      phone: "",
      contactInfo: "",
      status: "regular",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        contactInfo: initialData.contactInfo || "",
        status: initialData.status || "regular",
      });
    } else {
      reset(); // clear for add mode
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "add") {
        if (!data.name) throw new Error("Customer name is required");
        await customerAPI.create({
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          contactInfo: data.contactInfo || undefined,
          status: data.status,
          // Points default to 0, can be omitted
        });
        dialogs.success("Customer created successfully");
      } else {
        if (!customerId) throw new Error("Customer ID missing");
        await customerAPI.update(customerId, {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          contactInfo: data.contactInfo || undefined,
          status: data.status,
        });
        dialogs.success("Customer updated successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to save customer");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      safetyClose={true}
      onClose={onClose}
      title={mode === "add" ? "Add Customer" : "Edit Customer"}
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
                Customer Name *
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
            {/* Contact Info (e.g., address, notes) */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Contact Info
              </label>
              <textarea
                {...register("contactInfo")}
                rows={3}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
                placeholder="Additional contact information..."
              />
            </div>

            {/* Status */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Status
              </label>
              <select
                {...register("status")}
                className="compact-input w-full border rounded-md"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              >
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
                <option value="elite">Elite</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "add" ? "Create" : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerFormDialog;

// src/renderer/pages/taxes/components/TaxFormDialog.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { dialogs } from "../../../utils/dialogs";
import type { Tax, TaxCreateData, TaxUpdateData } from "../../../api/core/tax";
import taxAPI from "../../../api/core/tax";

interface TaxFormDialogProps {
  isOpen: boolean;
  mode: "add" | "edit";
  taxId: number | null;
  initialData: Partial<Tax> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  code: string;
  rate: number;
  type: "percentage" | "fixed";
  is_enabled: boolean;
  is_default: boolean;
  description?: string;
  customCode?: string;
};

// Predefined tax codes
const TAX_CODE_OPTIONS = [
  { value: "vat", label: "VAT (Value Added Tax)" },
  { value: "sales_tax", label: "Sales Tax" },
  { value: "import_duty", label: "Import Duty" },
  { value: "excise_tax", label: "Excise Tax" },
  { value: "service_tax", label: "Service Tax" },
  { value: "luxury_tax", label: "Luxury Tax" },
  { value: "environmental_tax", label: "Environmental Tax" },
  { value: "digital_tax", label: "Digital Services Tax" },
  { value: "withholding_tax", label: "Withholding Tax" },
  { value: "other", label: "Other (Custom)" },
];

const TaxFormDialog: React.FC<TaxFormDialogProps> = ({
  isOpen,
  mode,
  taxId,
  initialData,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      code: "",
      rate: 0,
      type: "percentage",
      is_enabled: true,
      is_default: false,
      description: "",
    },
  });

  const type = watch("type");
  const selectedCode = watch("code");

  // Kapag nagbago ang code, i‑set ang default name (opsyonal)
  useEffect(() => {
    if (mode === "add" && selectedCode && selectedCode !== "other") {
      const option = TAX_CODE_OPTIONS.find((opt) => opt.value === selectedCode);
      if (option) {
        // Puwede mong i‑set ang name batay sa napiling code, kung gusto mo
        // setValue('name', option.label);
      }
    }
  }, [selectedCode, mode, setValue]);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        code: initialData.code || "",
        rate: initialData.rate || 0,
        type: initialData.type || "percentage",
        is_enabled: initialData.is_enabled ?? true,
        is_default: initialData.is_default ?? false,
        description: initialData.description || "",
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Para sa "other", hayaan ang user na mag‑input ng custom code (pero hindi natin pinapayagan sa ngayon)
      // Kung gusto mo ng custom, puwede kang magdagdag ng text field kapag "other" ang napili.
      const finalCode = data.code === "other" ? "other" : data.code; // o kaya ay pwedeng i‑customize

      const payload: TaxCreateData | TaxUpdateData = {
        name: data.name.trim(),
        code: finalCode, // huwag nang baguhin – gagamitin ang mismong value mula sa select
        rate: Number(data.rate),
        type: data.type,
        is_enabled: data.is_enabled,
        is_default: data.is_default,
        description: data.description?.trim() || null,
      };

      if (mode === "add") {
        await taxAPI.create(payload as TaxCreateData);
        dialogs.success("Tax created successfully");
      } else {
        if (!taxId) throw new Error("Tax ID missing");
        await taxAPI.update(taxId, payload as TaxUpdateData);
        dialogs.success("Tax updated successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to save tax");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      safetyClose
      onClose={onClose}
      title={mode === "add" ? "Add New Tax" : "Edit Tax"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Name */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--sidebar-text)" }}
            >
              Tax Name *
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="compact-input w-full border rounded-md px-3 py-2"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border-color)",
                color: "var(--sidebar-text)",
              }}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Code - Select Dropdown */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--sidebar-text)" }}
            >
              Tax Code *
            </label>
            <select
              {...register("code", { required: "Code is required" })}
              className="compact-input w-full border rounded-md px-3 py-2"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border-color)",
                color: "var(--sidebar-text)",
              }}
            >
              <option value="">Select tax code</option>
              {TAX_CODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.code && (
              <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              The code is used internally and should be unique.
            </p>
          </div>

          {/* Sa loob ng form, pagkatapos ng select */}
          {selectedCode === "other" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Custom Code
              </label>
              <input
                type="text"
                {...register("customCode", {
                  required: "Custom code is required",
                })}
                className="compact-input w-full border rounded-md px-3 py-2"
              />
            </div>
          )}

          {/* Rate and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Rate *
              </label>
              <input
                type="number"
                step={type === "percentage" ? "0.01" : "0.01"}
                min="0"
                {...register("rate", {
                  required: "Rate is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Rate must be non-negative" },
                })}
                className="compact-input w-full border rounded-md px-3 py-2"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              />
              {errors.rate && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.rate.message}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--sidebar-text)" }}
              >
                Type *
              </label>
              <select
                {...register("type")}
                className="compact-input w-full border rounded-md px-3 py-2"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--sidebar-text)",
                }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₱)</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--sidebar-text)" }}
            >
              <input
                type="checkbox"
                {...register("is_enabled")}
                className="h-4 w-4"
              />
              Enabled
            </label>
            <label
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--sidebar-text)" }}
            >
              <input
                type="checkbox"
                {...register("is_default")}
                className="h-4 w-4"
              />
              Default Tax
            </label>
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--sidebar-text)" }}
            >
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="compact-input w-full border rounded-md px-3 py-2"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border-color)",
                color: "var(--sidebar-text)",
              }}
            />
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

export default TaxFormDialog;

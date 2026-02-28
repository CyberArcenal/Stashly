// src/renderer/pages/sales/components/SalesFormDialog.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import CustomerSelect from "../../../components/Selects/Customer";
import ProductSelect from "../../../components/Selects/Product";
import ProductVariantSelect from "../../../components/Selects/ProductVariant";
import WarehouseSelect from "../../../components/Selects/Warehouse";
import { dialogs } from "../../../utils/dialogs";
import type { Order, OrderCreateData, OrderUpdateData } from "../../../api/core/order";
import orderAPI from "../../../api/core/order";
import customerAPI, { type Customer } from "../../../api/core/customer";
import { Trash2, Plus, ChevronDown, ChevronUp, Award } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";
import { useSalesSettings, useTaxSettings } from "../../../utils/configUtils/sales";

interface SalesFormDialogProps {
  isOpen: boolean;
  mode: "add" | "edit";
  orderId: number | null;
  initialData: Partial<Order> | null;
  onClose: () => void;
  onSuccess: () => void;
}

type OrderItemForm = {
  productId: number | null;
  productName?: string;
  variantId: number | null;
  variantName?: string;
  warehouseId: number | null;
  warehouseName?: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type FormData = {
  order_number: string;
  customerId: number | null;
  customerName?: string;
  notes: string;
  items: OrderItemForm[];
  subtotal: number;
  total: number;
};

const SalesFormDialog: React.FC<SalesFormDialogProps> = ({
  isOpen,
  mode,
  orderId,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [customerBalance, setCustomerBalance] = useState(0);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  // Load tax settings
  const { vat_rate, prices_include_tax } = useTaxSettings();
  const { tax_enabled } = useSalesSettings();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      order_number: "",
      customerId: null,
      notes: "",
      items: [],
      subtotal: 0,
      total: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const customerId = watch("customerId");
  const subtotal = watch("subtotal");
  const total = watch("total");

  // Compute tax based on subtotal and settings
  const { subtotalExclTax, taxAmount, totalBeforePoints } = useMemo(() => {
    if (!tax_enabled) {
      return {
        subtotalExclTax: subtotal,
        taxAmount: 0,
        totalBeforePoints: subtotal,
      };
    }
    if (prices_include_tax) {
      // Subtotal already includes VAT, extract net and VAT
      const net = subtotal / (1 + vat_rate / 100);
      const tax = subtotal - net;
      return { subtotalExclTax: net, taxAmount: tax, totalBeforePoints: subtotal };
    } else {
      // Subtotal is net of VAT, add VAT
      const tax = subtotal * (vat_rate / 100);
      return { subtotalExclTax: subtotal, taxAmount: tax, totalBeforePoints: subtotal + tax };
    }
  }, [subtotal, tax_enabled, vat_rate, prices_include_tax]);

  // Final total after points discount
  const finalTotal = Math.max(0, totalBeforePoints - (usePoints ? pointsAmount : 0));

  // Helper to recalc totals from current items and points
  const recalcTotals = useCallback(
    (currentItems: OrderItemForm[]) => {
      const sub = currentItems.reduce((sum, item) => sum + (item.total || 0), 0);
      setValue("subtotal", sub);
      // total will be updated via useEffect watching subtotal/points
    },
    [setValue]
  );

  // Update total whenever subtotal or points change
  useEffect(() => {
    setValue("total", finalTotal);
  }, [finalTotal, setValue]);

  // Update an item and immediately recalc totals
  const updateItem = (index: number, updates: Partial<OrderItemForm>) => {
    const currentItems = getValues("items");
    const current = currentItems[index];
    const updated = { ...current, ...updates };
    updated.total = updated.quantity * updated.unit_price;

    setValue(`items.${index}`, updated);
    const newItems = [...currentItems];
    newItems[index] = updated;
    recalcTotals(newItems);
  };

  // Fetch customer details when customerId changes
  useEffect(() => {
    if (!customerId) {
      setCustomerBalance(0);
      setUsePoints(false);
      setPointsAmount(0);
      return;
    }
    const fetchCustomer = async () => {
      setLoadingCustomer(true);
      try {
        const res = await customerAPI.getById(customerId);
        if (res.status) {
          setCustomerBalance(res.data.loyaltyPointsBalance);
        }
      } catch (err) {
        console.error("Failed to fetch customer", err);
      } finally {
        setLoadingCustomer(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  const handleUsePointsChange = (checked: boolean) => {
    setUsePoints(checked);
    if (!checked) {
      setPointsAmount(0);
    }
    // Recalc totals (total will update via useEffect)
    const currentItems = getValues("items");
    recalcTotals(currentItems);
  };

  const handleUseAllPoints = () => {
    const maxPoints = Math.min(customerBalance, totalBeforePoints);
    setPointsAmount(maxPoints);
  };

  const pointsError =
    usePoints && pointsAmount > customerBalance
      ? "Insufficient points"
      : usePoints && pointsAmount > totalBeforePoints
      ? "Points exceed total"
      : "";

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      const formItems: OrderItemForm[] = (initialData.items || []).map((item) => ({
        productId: item.product?.id || null,
        productName: item.product?.name,
        variantId: item.variant?.id || null,
        variantName: item.variant?.name,
        warehouseId: item.warehouse?.id || null,
        warehouseName: item.warehouse?.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.line_gross_total,
      }));

      reset({
        order_number: initialData.order_number || "",
        customerId: initialData.customer?.id || null,
        customerName: initialData.customer?.name,
        notes: initialData.notes || "",
        items: formItems,
        subtotal: initialData.subtotal || 0,
        total: initialData.total || 0,
      });
      setUsePoints(false);
      setPointsAmount(0);
    } else if (mode === "add") {
      reset({
        order_number: `ORD-${Date.now()}`,
        customerId: null,
        notes: "",
        items: [],
        subtotal: 0,
        total: 0,
      });
      setUsePoints(false);
      setPointsAmount(0);
    }
  }, [mode, initialData, reset]);

  const addItem = () => {
    append({
      productId: null,
      variantId: null,
      warehouseId: null,
      quantity: 1,
      unit_price: 0,
      total: 0,
    });
    setExpandedItems((prev) => [...prev, fields.length]);
  };

  const removeItem = (index: number) => {
    remove(index);
    setTimeout(() => {
      const currentItems = getValues("items");
      recalcTotals(currentItems);
    }, 0);
    setExpandedItems((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    );
  };

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const expandAll = () => {
    setExpandedItems(fields.map((_, i) => i));
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  const onSubmit = async (data: FormData) => {
    if (
      !(await dialogs.confirm({
        title: "Submit",
        message: "Are you sure do you want to submit this form?.",
      }))
    )
      return;

    try {
      if (data.items.length === 0) throw new Error("At least one item is required");

      const payload = {
        order_number: data.order_number,
        customerId: data.customerId || undefined,
        notes:
          data.notes ||
          (usePoints ? `Points used: ${pointsAmount}` : undefined),
        items: data.items.map((item) => ({
          productId: item.productId!,
          variantId: item.variantId || undefined,
          warehouseId: item.warehouseId || undefined,
          quantity: item.quantity,
          unitPrice: item.unit_price,
        })),
      };

      if (mode === "add") {
        await orderAPI.create(payload as OrderCreateData);
        dialogs.success("Order created successfully");
      } else {
        if (!orderId) throw new Error("Order ID missing");
        await orderAPI.update(orderId, payload);
        dialogs.success("Order updated successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dialogs.error(err.message || "Failed to save order");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      safetyClose={true}
      onClose={async () => {
        if (
          !(await dialogs.confirm({
            title: "Close Order Dialog",
            message: "Are you sure do you want to close this dialog?.",
          }))
        )
          return;
        onClose();
      }}
      title={mode === "add" ? "Create Order" : "Edit Order"}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Customer, Notes, Points, Summary */}
            <div className="space-y-4">
              <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md space-y-3">
                <h3 className="text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>
                  Customer Information
                </h3>
                <CustomerSelect
                  value={customerId}
                  onChange={(id) => setValue("customerId", id)}
                  placeholder="Select customer (optional)"
                />
                {customerId && (
                  <div className="text-xs flex items-center gap-1 text-[var(--text-secondary)]">
                    <Award className="w-3 h-3" />
                    Loyalty points:{" "}
                    <span className="font-medium">{customerBalance}</span>
                  </div>
                )}
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "var(--sidebar-text)" }}
                  >
                    Order Notes
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="compact-input w-full border rounded-md"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border-color)",
                      color: "var(--sidebar-text)",
                    }}
                    placeholder="Enter notes or special instructions"
                  />
                </div>
              </div>

              {/* Points Section */}
              {customerId && customerBalance > 0 && (
                <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md space-y-2">
                  <label
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--sidebar-text)" }}
                  >
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => handleUsePointsChange(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Use loyalty points
                  </label>
                  {usePoints && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max={Math.min(customerBalance, totalBeforePoints)}
                          value={pointsAmount}
                          onChange={(e) => {
                            const val = Math.min(
                              Number(e.target.value),
                              customerBalance,
                              totalBeforePoints
                            );
                            setPointsAmount(val);
                          }}
                          className="compact-input flex-1 border rounded-md"
                          style={{
                            backgroundColor: "var(--card-bg)",
                            borderColor: "var(--border-color)",
                            color: "var(--sidebar-text)",
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleUseAllPoints}
                        >
                          Use All
                        </Button>
                      </div>
                      {pointsError && (
                        <p className="text-xs text-red-500">{pointsError}</p>
                      )}
                      <div className="text-xs text-[var(--text-secondary)]">
                        Available: {customerBalance} pts | Max use: {totalBeforePoints.toFixed(0)} pts
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary Card with Tax Breakdown */}
              {items.length > 0 && (
                <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-2" style={{ color: "var(--sidebar-text)" }}>
                    Order Summary
                  </h3>
                  <div className="space-y-1 text-sm">
                    {tax_enabled && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Subtotal (excl. tax):</span>
                          <span className="font-medium">{formatCurrency(subtotalExclTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">VAT ({vat_rate}%):</span>
                          <span className="font-medium">{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-dashed pt-1">
                          <span className="font-medium">Total before points:</span>
                          <span className="font-bold">{formatCurrency(totalBeforePoints)}</span>
                        </div>
                      </>
                    )}
                    {!tax_enabled && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                    )}
                    {usePoints && pointsAmount > 0 && (
                      <div className="flex justify-between text-[var(--accent-green)]">
                        <span>Points discount:</span>
                        <span>-{formatCurrency(pointsAmount)}</span>
                      </div>
                    )}
                    <div
                      className="flex justify-between border-t pt-1"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-[var(--accent-green)]">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                    {tax_enabled && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        *Prices {prices_include_tax ? "include" : "exclude"} VAT
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Items */}
            <div className="bg-[var(--card-secondary-bg)] p-3 rounded-md flex flex-col">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>
                  Items ({items.length})
                </h3>
                <div className="flex gap-1">
                  {items.length > 1 && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={expandAll}
                        icon={ChevronDown}
                      >
                        <span className="hidden sm:inline">Expand</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={collapseAll}
                        icon={ChevronUp}
                      >
                        <span className="hidden sm:inline">Collapse</span>
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    onClick={addItem}
                    icon={Plus}
                  >
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="min-h-[200px] max-h-[400px] overflow-y-auto pr-1 space-y-2">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                    No items added. Click "Add Item" to start.
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const item = items[index];
                    const isExpanded = expandedItems.includes(index);
                    return (
                      <div
                        key={field.id}
                        className="border rounded-md"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        {/* Item Header */}
                        <div
                          className="flex items-center justify-between p-2 cursor-pointer hover:bg-[var(--card-hover-bg)]"
                          onClick={() => toggleExpand(index)}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium" style={{ color: "var(--sidebar-text)" }}>
                              Item {index + 1}
                            </span>
                            {item.productName && (
                              <span
                                className="truncate max-w-[150px]"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {item.productName}{" "}
                                {item.variantName && `- ${item.variantName}`}
                              </span>
                            )}
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              x{item.quantity} = {formatCurrency(item.total)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(index);
                              }}
                              className="p-1 rounded-full hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button type="button" className="p-1">
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div
                            className="p-3 border-t space-y-3"
                            style={{ borderColor: "var(--border-color)" }}
                          >
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  Product *
                                </label>
                                <ProductSelect
                                  value={item.productId}
                                  onChange={(id, product) => {
                                    updateItem(index, {
                                      productId: id,
                                      productName: product?.name,
                                      variantId: null,
                                      variantName: undefined,
                                      unit_price: product?.net_price || 0,
                                    });
                                  }}
                                  placeholder="Select product"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  Variant (optional)
                                </label>
                                <ProductVariantSelect
                                  value={item.variantId}
                                  onChange={(id, variant) => {
                                    updateItem(index, {
                                      variantId: id,
                                      variantName: variant?.name,
                                      unit_price:
                                        variant?.net_price || item.unit_price,
                                    });
                                  }}
                                  productId={item.productId || undefined}
                                  placeholder="Select variant"
                                  disabled={!item.productId}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">
                                  Warehouse (optional)
                                </label>
                                <WarehouseSelect
                                  value={item.warehouseId}
                                  onChange={(id, wh) =>
                                    updateItem(index, {
                                      warehouseId: id,
                                      warehouseName: wh?.name,
                                    })
                                  }
                                  placeholder="Select warehouse"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateItem(index, {
                                        quantity: parseInt(e.target.value) || 1,
                                      })
                                    }
                                    className="compact-input w-full border rounded-md"
                                    style={{
                                      backgroundColor: "var(--card-bg)",
                                      borderColor: "var(--border-color)",
                                      color: "var(--sidebar-text)",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    Unit Price
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(e) =>
                                      updateItem(index, {
                                        unit_price: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="compact-input w-full border rounded-md"
                                    style={{
                                      backgroundColor: "var(--card-bg)",
                                      borderColor: "var(--border-color)",
                                      color: "var(--sidebar-text)",
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: "var(--accent-green)" }}
                                >
                                  Line Total: {formatCurrency(item.total)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-[var(--border-color)] shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (
                !(await dialogs.confirm({
                  title: "Close Order Dialog",
                  message: "Are you sure do you want to close this dialog?.",
                }))
              )
                return;
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={isSubmitting || !!pointsError}
          >
            {isSubmitting
              ? "Saving..."
              : mode === "add"
              ? "Create Order"
              : "Update Order"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SalesFormDialog;
import { useState } from "react";
import type { ProductVariant } from "../../../api/core/productVariant";

type FormMode = "add" | "edit";

const useVariantForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("add");
  const [variantId, setVariantId] = useState<number | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [initialData, setInitialData] =
    useState<Partial<ProductVariant> | null>(null);

  const openAdd = (productId: number | null) => {
    setMode("add");
    setProductId(productId);
    setVariantId(null);
    setInitialData(null);
    setIsOpen(true);
  };

  const openEdit = (variant: ProductVariant, productId: number | null) => {
    setMode("edit");
    setProductId(productId);
    setVariantId(variant.id);
    setInitialData(variant);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setVariantId(null);
    setInitialData(null);
  };

  return {
    isOpen,
    mode,
    variantId,
    productId,
    initialData,
    openAdd,
    openEdit,
    close,
  };
};

export default useVariantForm;

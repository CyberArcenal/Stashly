// src/renderer/pages/inventory/components/ProductActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ImageIcon,
  Layers,
  Globe,
  Power,
  PowerOff,
  PinOff,
} from "lucide-react";
import { dialogs } from "../../../utils/dialogs";
import type { ProductWithDetails } from "../hooks/useProducts";

interface ProductActionsDropdownProps {
  product: ProductWithDetails;
  onView: (product: ProductWithDetails) => void;
  onEdit: (product: ProductWithDetails) => void;
  onDelete: (product: ProductWithDetails) => void;
  onManageImages?: (product: ProductWithDetails) => void;
  onAddVariant?: (product: ProductWithDetails) => void;
  onPublish?: (product: ProductWithDetails) => void;
  onUnpublish?: (product: ProductWithDetails) => void;
  onActivate?: (product: ProductWithDetails) => void;
  onDeactivate?: (product: ProductWithDetails) => void;
  onTaxSettings?: (product: ProductWithDetails) => void;
}

const ProductActionsDropdown: React.FC<ProductActionsDropdownProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  onManageImages,
  onAddVariant,
  onPublish,
  onUnpublish,
  onActivate,
  onDeactivate,
  onTaxSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 300; // increased to accommodate new items
    const windowHeight = window.innerHeight;

    if (rect.bottom + dropdownHeight > windowHeight) {
      return {
        bottom: `${windowHeight - rect.top + 5}px`,
        right: `${window.innerWidth - rect.right}px`,
      };
    }
    return {
      top: `${rect.bottom + 5}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  };

  return (
    <div className="product-actions-dropdown-container" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors relative cursor-pointer"
        title="More Actions"
      >
        <MoreVertical
          className="w-4 h-4"
          style={{ color: "var(--text-secondary)" }}
        />
      </button>

      {isOpen && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-56 z-50 max-h-96 overflow-y-auto"
          style={getDropdownPosition()}
        >
          <div className="py-1">
            {/* View Details */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onView(product));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>View Details</span>
            </button>

            {/* Edit Product */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onEdit(product));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-yellow-500" />
              <span>Edit Product</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onTaxSettings?.(product));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-yellow-500" />
              <span>Manage Taxes</span>
            </button>
            {/* Publish / Unpublish */}
            {product.is_published ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onUnpublish?.(product));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <PinOff className="w-4 h-4 text-orange-500" />
                <span>Unpublish</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onPublish?.(product));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Globe className="w-4 h-4 text-green-500" />
                <span>Publish</span>
              </button>
            )}

            {/* Activate / Deactivate */}
            {product.is_active ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onDeactivate?.(product));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <PowerOff className="w-4 h-4 text-red-500" />
                <span>Deactivate</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onActivate?.(product));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Power className="w-4 h-4 text-green-500" />
                <span>Activate</span>
              </button>
            )}

            {/* Manage Images */}
            {onManageImages && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onManageImages(product));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <ImageIcon className="w-4 h-4 text-purple-500" />
                <span>Manage Images</span>
              </button>
            )}

            {/* Add Variant */}
            {onAddVariant && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onAddVariant(product));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Add Variant</span>
              </button>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onDelete(product));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Product</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductActionsDropdown;

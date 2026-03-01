// src/renderer/pages/productVariant/components/VariantActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Percent,
} from "lucide-react";
import type { VariantWithDetails } from "../hooks/useVariants";

interface VariantActionsDropdownProps {
  variant: VariantWithDetails;
  onView: (variant: VariantWithDetails) => void;
  onEdit: (variant: VariantWithDetails) => void;
  onDelete: (variant: VariantWithDetails) => void;
  onTax?: (variant: VariantWithDetails) => void;
}

const VariantActionsDropdown: React.FC<VariantActionsDropdownProps> = ({
  variant,
  onView,
  onEdit,
  onDelete,
  onTax,
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
    const dropdownHeight = 200;
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
    <div className="variant-actions-dropdown-container" ref={dropdownRef}>
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
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-48 z-50 max-h-96 overflow-y-auto"
          style={getDropdownPosition()}
        >
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onView(variant));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>View</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onEdit(variant));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-yellow-500" />
              <span>Edit</span>
            </button>
            {onTax && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onTax(variant));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Percent className="w-4 h-4 text-indigo-500" />
                <span>Tax Settings</span>
              </button>
            )}
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onDelete(variant));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantActionsDropdown;
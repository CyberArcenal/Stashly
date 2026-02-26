// src/renderer/pages/stock-items/components/StockActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  MoreVertical,
  Package,
} from "lucide-react";
import { dialogs } from "../../../utils/dialogs";
import type { StockItemWithDetails } from "../hooks/useStockItems";

interface StockActionsDropdownProps {
  stockItem: StockItemWithDetails;
  onView: (item: StockItemWithDetails) => void;
  onEditThreshold: (item: StockItemWithDetails) => void;
  onReorder: (item: StockItemWithDetails) => void;
}

const StockActionsDropdown: React.FC<StockActionsDropdownProps> = ({
  stockItem,
  onView,
  onEditThreshold,
  onReorder,
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
    const dropdownHeight = 160;
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
    <div className="stock-actions-dropdown-container" ref={dropdownRef}>
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
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-64 z-50 max-h-96 overflow-y-auto"
          style={getDropdownPosition()}
        >
          <div className="py-1">
            {/* View Details */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onView(stockItem));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 text-sky-500" /> <span>View Details</span>
            </button>

            {/* Edit Threshold */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onEditThreshold(stockItem));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-yellow-500" /> <span>Edit Threshold</span>
            </button>

            {/* Reorder */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onReorder(stockItem));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Package className="w-4 h-4 text-green-600" /> <span>Reorder Quantity</span>
            </button>

            {/* Additional actions could be added later */}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockActionsDropdown;
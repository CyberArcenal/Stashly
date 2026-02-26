// src/renderer/pages/warehouse/components/WarehouseActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  MoreVertical,
  Package,
} from "lucide-react";
import { dialogs } from "../../../utils/dialogs";
import type { WarehouseWithDetails } from "../hooks/useWarehouses";

interface WarehouseActionsDropdownProps {
  warehouse: WarehouseWithDetails;
  onView: (warehouse: WarehouseWithDetails) => void;
  onEdit: (warehouse: WarehouseWithDetails) => void;
  onDelete: (warehouse: WarehouseWithDetails) => void;
  onUpdateStatus: (id: number, isActive: boolean) => void;
}

const WarehouseActionsDropdown: React.FC<WarehouseActionsDropdownProps> = ({
  warehouse,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
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
    const dropdownHeight = 220;
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

  const handleStatusChange = async () => {
    const newStatus = !warehouse.is_active;
    const action = newStatus ? "activate" : "deactivate";
    const confirmed = await dialogs.confirm({
      title: `${action === "activate" ? "Activate" : "Deactivate"} Warehouse`,
      message: `Are you sure you want to ${action} "${warehouse.name}"?`,
    });
    if (!confirmed) return;
    handleAction(() => onUpdateStatus(warehouse.id, newStatus));
  };

  return (
    <div className="warehouse-actions-dropdown-container" ref={dropdownRef}>
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
                handleAction(() => onView(warehouse));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 text-sky-500" /> <span>View Details</span>
            </button>

            {/* Edit Warehouse */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onEdit(warehouse));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-yellow-500" /> <span>Edit Warehouse</span>
            </button>

            {/* View Stock (placeholder - maybe link to stock page, but we don't have one) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dialogs.info("View stock feature coming soon.", "Info");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Package className="w-4 h-4 text-green-600" /> <span>View Stock</span>
            </button>

            {/* Activate/Deactivate */}
            <button
              onClick={handleStatusChange}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              {warehouse.is_active ? (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />{" "}
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />{" "}
                  <span>Activate</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Add Note (placeholder) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dialogs.info("Add note feature coming soon.", "Info");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <FileText className="w-4 h-4 text-blue-500" /> <span>Add Note</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onDelete(warehouse));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> <span>Delete Warehouse</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseActionsDropdown;
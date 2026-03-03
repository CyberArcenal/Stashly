// src/renderer/pages/suppliers/components/SuppliersActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import { Eye, Edit, Trash2, MoreVertical, CheckCircle, XCircle, Power } from "lucide-react";
import type { Supplier } from "../../../api/core/supplier";

interface SuppliersActionsDropdownProps {
  supplier: Supplier;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onApprove?: (supplier: Supplier) => void;
  onReject?: (supplier: Supplier) => void;
  onToggleActive?: (supplier: Supplier) => void;
}

const SuppliersActionsDropdown: React.FC<SuppliersActionsDropdownProps> = ({
  supplier,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onToggleActive,
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
    const dropdownHeight = 300; // increased for more items
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
    <div className="suppliers-actions-dropdown-container" ref={dropdownRef}>
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
            {/* View */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onView(supplier));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>View Details</span>
            </button>

            {/* Edit */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onEdit(supplier));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-yellow-500" />
              <span>Edit Supplier</span>
            </button>

            {/* Status actions - only show if not already approved/rejected */}
            {supplier.status !== 'approved' && onApprove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onApprove(supplier));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Mark as Approved</span>
              </button>
            )}

            {supplier.status !== 'rejected' && onReject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onReject(supplier));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Mark as Rejected</span>
              </button>
            )}

            {/* Toggle Active */}
            {onToggleActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onToggleActive(supplier));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Power className={`w-4 h-4 ${supplier.is_active ? 'text-green-500' : 'text-gray-500'}`} />
                <span>{supplier.is_active ? 'Deactivate' : 'Activate'}</span>
              </button>
            )}

            <div className="border-t border-gray-200 my-1"></div>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onDelete(supplier));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Supplier</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersActionsDropdown;
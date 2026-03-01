// src/renderer/pages/taxes/components/TaxActionsDropdown.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import type { Tax } from '../../../api/core/tax';

interface TaxActionsDropdownProps {
  tax: Tax;
  onEdit: (tax: Tax) => void;
  onDelete: (tax: Tax) => void;
}

const TaxActionsDropdown: React.FC<TaxActionsDropdownProps> = ({ tax, onEdit, onDelete }) => {
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 100;
    const windowHeight = window.innerHeight;
    if (rect.bottom + dropdownHeight > windowHeight) {
      return { bottom: `${windowHeight - rect.top + 5}px`, right: `${window.innerWidth - rect.right}px` };
    }
    return { top: `${rect.bottom + 5}px`, right: `${window.innerWidth - rect.right}px` };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
      </button>
      {isOpen && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-40 z-50"
          style={getDropdownPosition()}
        >
          <div className="py-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleAction(() => onEdit(tax)); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-yellow-500" />
              <span>Edit</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAction(() => onDelete(tax)); }}
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

export default TaxActionsDropdown;
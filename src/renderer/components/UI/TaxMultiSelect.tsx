// src/renderer/components/UI/TaxMultiSelect.tsx
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Tax } from '../../api/core/tax';

interface TaxMultiSelectProps {
  value: number[]; // currently selected tax IDs
  onChange: (taxIds: number[]) => void;
  availableTaxes: Tax[]; // all enabled taxes
  disabled?: boolean;
}

const TaxMultiSelect: React.FC<TaxMultiSelectProps> = ({
  value,
  onChange,
  availableTaxes,
  disabled = false,
}) => {
  const selectedTaxes = useMemo(() => {
    return availableTaxes.filter(tax => value.includes(tax.id));
  }, [availableTaxes, value]);

  const unselectedTaxes = useMemo(() => {
    return availableTaxes.filter(tax => !value.includes(tax.id));
  }, [availableTaxes, value]);

  const handleAdd = (taxId: number) => {
    onChange([...value, taxId]);
  };

  const handleRemove = (taxId: number) => {
    onChange(value.filter(id => id !== taxId));
  };

  const handleAddAll = () => {
    onChange(availableTaxes.map(t => t.id));
  };

  const handleRemoveAll = () => {
    onChange([]);
  };

  return (
    <div className="grid grid-cols-2 gap-4 border rounded-md p-3" style={{ borderColor: 'var(--border-color)' }}>
      {/* Available Taxes */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium" style={{ color: 'var(--sidebar-text)' }}>Available Taxes</h4>
          <button
            type="button"
            onClick={handleAddAll}
            disabled={disabled || unselectedTaxes.length === 0}
            className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            style={{ borderColor: 'var(--border-color)' }}
          >
            Add All
          </button>
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {unselectedTaxes.map(tax => (
            <div
              key={tax.id}
              className="flex items-center justify-between p-2 rounded text-sm border"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div>
                <span style={{ color: 'var(--sidebar-text)' }}>{tax.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({tax.type === 'percentage' ? `${tax.rate}%` : `₱${tax.rate}`})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(tax.id)}
                disabled={disabled}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
          {unselectedTaxes.length === 0 && (
            <p className="text-sm text-gray-500 italic">All taxes selected</p>
          )}
        </div>
      </div>

      {/* Selected Taxes */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium" style={{ color: 'var(--sidebar-text)' }}>Selected Taxes</h4>
          <button
            type="button"
            onClick={handleRemoveAll}
            disabled={disabled || selectedTaxes.length === 0}
            className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            style={{ borderColor: 'var(--border-color)' }}
          >
            Remove All
          </button>
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {selectedTaxes.map(tax => (
            <div
              key={tax.id}
              className="flex items-center justify-between p-2 rounded text-sm border"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div>
                <span style={{ color: 'var(--sidebar-text)' }}>{tax.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({tax.type === 'percentage' ? `${tax.rate}%` : `₱${tax.rate}`})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(tax.id)}
                disabled={disabled}
                className="p-1 rounded hover:bg-gray-100 text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {selectedTaxes.length === 0 && (
            <p className="text-sm text-gray-500 italic">No taxes selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxMultiSelect;
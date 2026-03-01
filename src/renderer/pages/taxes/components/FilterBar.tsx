// src/renderer/pages/taxes/components/FilterBar.tsx
import React from 'react';
import type { TaxFilters } from '../hooks/useTaxes';

interface FilterBarProps {
  filters: TaxFilters;
  onFilterChange: (key: keyof TaxFilters, value: string) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 rounded-md border" style={{ backgroundColor: 'var(--card-secondary-bg)', borderColor: 'var(--border-color)' }}>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>Search</label>
        <input
          type="text"
          placeholder="Name, code, description..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="compact-input w-full border rounded-md px-3 py-2"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--sidebar-text)' }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>Type</label>
        <select
          value={filters.type || ''}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="compact-input w-full border rounded-md px-3 py-2"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--sidebar-text)' }}
        >
          <option value="">All</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>Status</label>
        <select
          value={filters.is_enabled || ''}
          onChange={(e) => onFilterChange('is_enabled', e.target.value)}
          className="compact-input w-full border rounded-md px-3 py-2"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--sidebar-text)' }}
        >
          <option value="">All</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>
      <div className="flex items-end md:col-span-3">
        <button
          onClick={onReset}
          className="compact-button w-full rounded-md py-2"
          style={{ backgroundColor: 'var(--primary-color)', color: 'var(--sidebar-text)' }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
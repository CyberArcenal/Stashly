// src/renderer/pages/customers/components/FilterBar.tsx
import React from 'react';
import type { CustomerFilters } from '../hooks/useCustomers';

interface FilterBarProps {
  filters: CustomerFilters;
  onFilterChange: (key: keyof CustomerFilters, value: string) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sm mb-4 compact-card rounded-md border p-3"
      style={{
        backgroundColor: "var(--card-secondary-bg)",
        borderColor: "var(--border-color)",
      }}
    >
      <div>
        <label className="block text-sm font-medium mb-xs" style={{ color: "var(--sidebar-text)" }}>
          Search
        </label>
        <input
          type="text"
          placeholder="Name, email or phone..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="compact-input w-full border rounded-md"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            color: "var(--sidebar-text)",
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-xs" style={{ color: "var(--sidebar-text)" }}>
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="compact-input w-full border rounded-md"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            color: "var(--sidebar-text)",
          }}
        >
          <option value="all">All Status</option>
          <option value="regular">Regular</option>
          <option value="vip">VIP</option>
          <option value="elite">Elite</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-xs" style={{ color: "var(--sidebar-text)" }}>
          Join Date From
        </label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange("startDate", e.target.value)}
          className="compact-input w-full border rounded-md"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            color: "var(--sidebar-text)",
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-xs" style={{ color: "var(--sidebar-text)" }}>
          Join Date To
        </label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange("endDate", e.target.value)}
          className="compact-input w-full border rounded-md"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            color: "var(--sidebar-text)",
          }}
        />
      </div>

      <div className="flex items-end md:col-span-4">
        <button
          onClick={onReset}
          className="compact-button w-full rounded-md transition-colors"
          style={{
            backgroundColor: "var(--primary-color)",
            color: "var(--sidebar-text)",
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
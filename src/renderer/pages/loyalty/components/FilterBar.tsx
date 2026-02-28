// src/renderer/pages/loyalty/components/FilterBar.tsx
import React from 'react';
import type { LoyaltyFilters } from '../hooks/useLoyaltyTransactions';

interface FilterBarProps {
  filters: LoyaltyFilters;
  onFilterChange: (key: keyof LoyaltyFilters, value: string) => void;
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
          placeholder="Customer, order #, notes..."
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
          Transaction Type
        </label>
        <select
          value={filters.transactionType}
          onChange={(e) => onFilterChange("transactionType", e.target.value)}
          className="compact-input w-full border rounded-md"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            color: "var(--sidebar-text)",
          }}
        >
          <option value="all">All Types</option>
          <option value="earn">Earn</option>
          <option value="redeem">Redeem</option>
          <option value="refund">Refund</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-xs" style={{ color: "var(--sidebar-text)" }}>
          Customer Name
        </label>
        <input
          type="text"
          placeholder="Filter by customer..."
          value={filters.customerId}
          onChange={(e) => onFilterChange("customerId", e.target.value)}
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
          Start Date
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
          End Date
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
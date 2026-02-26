// src/renderer/pages/stock-transfer/components/FilterBar.tsx
import React from "react";
import { Calendar, X } from "lucide-react";
import type { TransferFilters } from "../hooks/useStockTransfer";
import type { Warehouse } from "../../../api/core/warehouse";

interface FilterBarProps {
  filters: TransferFilters;
  onFilterChange: (key: keyof TransferFilters, value: string) => void;
  onReset: () => void;
  warehouses: Warehouse[];
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset, warehouses }) => {
  return (
    <div
      className="compact-card rounded-md mb-4 p-3"
      style={{
        backgroundColor: "var(--card-secondary-bg)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--sidebar-text)" }}>
          Advanced Filters
        </h4>
        <button
          onClick={onReset}
          className="text-xs compact-button flex items-center gap-1"
          style={{ color: "var(--text-secondary)", backgroundColor: "var(--card-bg)" }}
        >
          <X className="icon-xs" />
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-sm">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--sidebar-text)" }}>
            <Calendar className="icon-xs inline mr-1" />
            Date From
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange("date_from", e.target.value)}
            className="compact-input w-full rounded-md"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--sidebar-text)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--sidebar-text)" }}>
            <Calendar className="icon-xs inline mr-1" />
            Date To
          </label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange("date_to", e.target.value)}
            className="compact-input w-full rounded-md"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--sidebar-text)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--sidebar-text)" }}>
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange("type", e.target.value as any)}
            className="compact-input w-full rounded-md"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--sidebar-text)" }}
          >
            <option value="all">All Types</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--sidebar-text)" }}>
            Warehouse
          </label>
          <select
            value={filters.warehouse}
            onChange={(e) => onFilterChange("warehouse", e.target.value)}
            className="compact-input w-full rounded-md"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--sidebar-text)" }}
          >
            <option value="all">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
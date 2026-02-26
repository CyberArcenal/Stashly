import React, { useState } from "react";
import { Download, Filter, RefreshCw } from "lucide-react";
import Button from "../../components/UI/Button";
import Pagination from "../../components/Shared/Pagination1";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";

import useStockAdjustment from "./hooks/useStockAdjustment";
import useAdjustmentForm from "./hooks/useAdjustmentForm";
import AdjustmentForm from "./components/AdjustmentForm";
import FilterBar from "./components/FilterBar";
import AdjustmentsTable from "./components/AdjustmentsTable";

const StockAdjustmentPage: React.FC = () => {
  const {
    movements,
    paginatedMovements,
    filters,
    loading,
    error,
    pagination,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    handleSort,
    warehouses,
    products,
    exportFormat,
    setExportFormat,
    exportLoading,
    handleExport,
  } = useStockAdjustment();

  const form = useAdjustmentForm({ onSuccess: reload });

  const [showFilters, setShowFilters] = useState(false);

  const getDisplayRange = () => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, pagination.count);
    return { start, end };
  };
  const { start, end } = getDisplayRange();

  return (
    <div
      className="compact-card rounded-md shadow-md border"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--sidebar-text)" }}>
            <div className="w-2 h-6 rounded-full" style={{ backgroundColor: "var(--accent-blue)" }}></div>
            Stock Adjustment
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Adjust inventory levels and track changes
          </p>
        </div>
        <div className="flex gap-sm">
          <button
            className="compact-button rounded-md flex items-center transition-colors"
            style={{
              backgroundColor: showFilters ? "var(--accent-blue)" : "var(--card-secondary-bg)",
              color: "var(--sidebar-text)",
            }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="icon-sm mr-xs" />
            Filters {showFilters ? "↑" : "↓"}
          </button>
          <button
            onClick={reload}
            disabled={loading}
            className="btn btn-secondary btn-sm rounded-md flex items-center"
          >
            <RefreshCw className={`icon-sm mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          {/* Export */}
          <div
            className="flex items-center gap-xs border rounded-md px-2 py-1"
            style={{
              backgroundColor: "var(--card-secondary-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Export:
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="text-xs border-none bg-transparent focus:ring-0 cursor-pointer"
              style={{ color: "var(--sidebar-text)" }}
              disabled={exportLoading}
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
            <Button
              onClick={handleExport}
              disabled={exportLoading || movements.length === 0}
              className="compact-button rounded-md flex items-center gap-1 px-2 py-1 text-xs"
            >
              <Download className="icon-xs" />
              {exportLoading ? "..." : "Export"}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-sm mb-4">
        <div
          className="compact-stats rounded-md relative overflow-hidden p-3"
          style={{ backgroundColor: "var(--card-secondary-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Adjustments</div>
          <div className="text-xl font-bold mt-1" style={{ color: "var(--sidebar-text)" }}>{pagination.count}</div>
        </div>
        <div
          className="compact-stats rounded-md relative overflow-hidden p-3"
          style={{ backgroundColor: "var(--card-secondary-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Stock Increases</div>
          <div className="text-xl font-bold mt-1 flex items-center gap-1" style={{ color: "var(--accent-green)" }}>
            {movements.filter(m => m.change > 0).length}
          </div>
        </div>
        <div
          className="compact-stats rounded-md relative overflow-hidden p-3"
          style={{ backgroundColor: "var(--card-secondary-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Stock Decreases</div>
          <div className="text-xl font-bold mt-1 flex items-center gap-1" style={{ color: "var(--accent-red)" }}>
            {movements.filter(m => m.change < 0).length}
          </div>
        </div>
        <div
          className="compact-stats rounded-md relative overflow-hidden p-3"
          style={{ backgroundColor: "var(--card-secondary-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Net Change</div>
          <div
            className="text-xl font-bold mt-1"
            style={{
              color: movements.reduce((sum, m) => sum + m.change, 0) >= 0 ? "var(--accent-green)" : "var(--accent-red)",
            }}
          >
            {movements.reduce((sum, m) => sum + m.change, 0) > 0 ? "+" : ""}
            {movements.reduce((sum, m) => sum + m.change, 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          warehouses={warehouses}
        />
      )}

      {/* Adjustment Form */}
      <AdjustmentForm
        form={form}
        products={products}
        warehouses={warehouses}
        onSubmit={form.handleSubmit}
      />

      {/* Page Size & Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm mb-2">
        <div className="flex items-center gap-sm">
          <label className="text-sm" style={{ color: "var(--sidebar-text)" }}>Show:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="compact-input border rounded text-sm"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--sidebar-text)" }}
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>entries</span>
        </div>
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {pagination.count > 0 ? (
            <>Showing {start} to {end} of {pagination.count} entries</>
          ) : "No entries found"}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md" style={{ backgroundColor: "var(--card-secondary-bg)", color: "var(--text-secondary)" }}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: "var(--accent-blue)" }}></div>
            Loading adjustment history...
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="text-center py-4 text-red-500">Error: {error}</div>}

      {/* Table */}
      {!loading && !error && (
        <AdjustmentsTable
          movements={paginatedMovements}
          onSort={handleSort}
          sortConfig={sortConfig}
        />
      )}

      {/* Pagination */}
      {!loading && !error && movements.length > 0 && pagination.total_pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={pagination.count}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            showPageSize={false}
          />
        </div>
      )}
    </div>
  );
};

export default StockAdjustmentPage;
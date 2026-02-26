import React, { useState } from "react";
import { Plus, Download, Filter, RefreshCw, Package } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/UI/Button";
import Pagination from "../../components/Shared/Pagination1";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError, showInfo } from "../../utils/notification";

import useWarehouses from "./hooks/useWarehouses";

import FilterBar from "./components/FilterBar";

import warehouseAPI from "../../api/core/warehouse";
import { stockExportAPI, type StockExportParams } from "../../api/exports/stocks";
import useWarehouseForm from "./hooks/useWarehouseForm";
import useWarehouseView from "./hooks/useWarehouseView";
import WarehouseTable from "./components/WarehouseTable";
import WarehouseFormDialog from "./components/WarehouseFormDialog";
import WarehouseViewDialog from "./components/WarehouseViewDialog";
import { warehouseExportAPI, type WarehouseExportParams } from "../../api/exports/warehouse";

const WarehousesPage: React.FC = () => {
  const {
    paginatedWarehouses,
    warehouses,
    filters,
    loading,
    error,
    pagination,
    selectedWarehouses,
    setSelectedWarehouses,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleWarehouseSelection,
    toggleSelectAll,
    handleSort,
  } = useWarehouses();

  const formDialog = useWarehouseForm();
  const viewDialog = useWarehouseView();

  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("csv");

  const handleDelete = async (warehouse: any) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Warehouse",
      message: `Are you sure you want to delete "${warehouse.name}"?`,
    });
    if (!confirmed) return;
    try {
      await warehouseAPI.delete(warehouse.id);
      showInfo("Warehouse deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWarehouses.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedWarehouses.length} warehouses?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedWarehouses.map((id) => warehouseAPI.delete(id)));
      showSuccess(`${selectedWarehouses.length} warehouses deleted.`);
      setSelectedWarehouses([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleUpdateStatus = async (id: number, isActive: boolean) => {
    try {
      await warehouseAPI.update(id, { is_active: isActive });
      showSuccess(`Warehouse ${isActive ? "activated" : "deactivated"} successfully.`);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleExportWarehouse = async () => {
    const confirmed = await dialogs.confirm({
      title: "Export Warehouse",
      message: `Export all warehouse as ${exportFormat.toUpperCase()}?`,
    });
    if (!confirmed) return;
    setExportLoading(true);
    try {
      const exportParams: WarehouseExportParams = {
        format: exportFormat,
        // optionally filter by selected warehouse? but we'll export all for now
      };
      await warehouseExportAPI.exportWarehouses(exportParams);
      showSuccess("Stock export started.");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setExportLoading(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm mb-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--sidebar-text)" }}>
            Warehouses
          </h2>
          <p className="mt-xs text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage storage locations and inventory
          </p>
        </div>
        <div className="flex flex-wrap gap-xs w-full sm:w-auto">
          <button
            className="compact-button rounded-md flex items-center transition-colors ease-in-out hover:scale-105 hover:shadow-md disabled:opacity-50"
            style={{
              backgroundColor: "var(--card-secondary-bg)",
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
            className="btn btn-secondary btn-sm rounded-md flex items-center transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`icon-sm mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          {/* Export Stock Button (since no dedicated stock page) */}
          <div
            className="flex items-center gap-xs border rounded-md px-2 py-1"
            style={{
              backgroundColor: "var(--card-secondary-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-1">
              <label className="text-xs" style={{ color: "var(--sidebar-text)" }}>
                Export Warehouse:
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="text-xs border-none bg-transparent focus:ring-0 cursor-pointer"
                style={{ color: "var(--sidebar-text)" }}
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <Button
              onClick={handleExportWarehouse}
              disabled={exportLoading}
              className="compact-button rounded-md flex items-center gap-1 px-2 py-1 text-xs"
            >
              <Download className="icon-xs" />
              {exportLoading ? "..." : "Export"}
            </Button>
          </div>

          <Button
            onClick={formDialog.openAdd}
            variant="success"
            size="sm"
            icon={Plus}
            iconPosition="left"
          >
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      {warehouses.length > 0 && (
        <div
          className="mb-4 compact-card rounded-md border p-3 flex flex-wrap items-center justify-between gap-2"
          style={{
            backgroundColor: "var(--card-secondary-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]"></span>
              {warehouses.filter((w) => w.is_active).length} Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-red)]"></span>
              {warehouses.filter((w) => !w.is_active).length} Inactive
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)]"></span>
              {warehouses.length} Total
            </span>
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Total Capacity: {warehouses.reduce((sum, w) => sum + w.limit_capacity, 0).toLocaleString()} units
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      )}

      {/* Bulk Selection */}
      {selectedWarehouses.length > 0 && (
        <div
          className="mb-2 compact-card rounded-md border flex items-center justify-between p-2"
          style={{
            backgroundColor: "var(--accent-blue-dark)",
            borderColor: "var(--accent-blue)",
          }}
        >
          <span className="font-medium text-sm" style={{ color: "var(--accent-green)" }}>
            {selectedWarehouses.length} warehouse(s) selected
          </span>
          <div className="flex gap-xs">
            <button
              className="compact-button bg-[var(--accent-red)] hover:bg-[var(--accent-red-hover)] text-white rounded-md"
              onClick={handleBulkDelete}
              title="Delete selected"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Page Size & Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm mb-2">
        <div className="flex items-center gap-sm">
          <label className="text-sm" style={{ color: "var(--sidebar-text)" }}>
            Show:
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="compact-input border rounded text-sm"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
              color: "var(--sidebar-text)",
            }}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            entries
          </span>
        </div>
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {pagination.count > 0 ? (
            <>
              Showing {start} to {end} of {pagination.count} entries
            </>
          ) : (
            "No entries found"
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-4">
          <div
            className="animate-spin rounded-full h-6 w-6 border-b-2"
            style={{ borderColor: "var(--accent-blue)" }}
          ></div>
        </div>
      )}

      {/* Error */}
      {error && <div className="text-center py-4 text-red-500">Error: {error}</div>}

      {/* Table */}
      {!loading && !error && (
        <>
          <WarehouseTable
            warehouses={paginatedWarehouses}
            selectedWarehouses={selectedWarehouses}
            onToggleSelect={toggleWarehouseSelection}
            onToggleSelectAll={toggleSelectAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            onView={(warehouse) => viewDialog.open(warehouse.id)}
            onEdit={formDialog.openEdit}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
          />

          {/* Empty State */}
          {warehouses.length === 0 && (
            <div
              className="text-center py-8 border rounded-md"
              style={{ borderColor: "var(--border-color)" }}
            >
              <Package className="icon-xl mx-auto mb-2" style={{ color: "var(--text-secondary)" }} />
              <p className="text-base" style={{ color: "var(--sidebar-text)" }}>
                No warehouses found.
              </p>
              <p className="mt-xs text-sm" style={{ color: "var(--text-tertiary)" }}>
                {Object.values(filters).some((v) => v)
                  ? "Try adjusting your search or filters"
                  : "Start by creating your first warehouse"}
              </p>
              <div className="mt-2 gap-xs flex justify-center">
                {Object.values(filters).some((v) => v) && (
                  <button
                    className="compact-button rounded-md"
                    style={{ backgroundColor: "var(--accent-blue)", color: "white" }}
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  to="/warehouses/form"
                  className="compact-button rounded-md inline-block"
                  style={{ backgroundColor: "var(--accent-green)", color: "white" }}
                  onClick={(e) => {
                    e.preventDefault();
                    formDialog.openAdd();
                  }}
                >
                  Add First Warehouse
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {warehouses.length > 0 && pagination.total_pages > 1 && (
            <div className="mt-2">
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
        </>
      )}

      {/* Dialogs */}
      <WarehouseFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        warehouseId={formDialog.warehouseId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <WarehouseViewDialog
        warehouse={viewDialog.warehouse}
        loading={viewDialog.loading}
        isOpen={viewDialog.isOpen}
        onClose={viewDialog.close}
      />
    </div>
  );
};

export default WarehousesPage;
// src/renderer/pages/customers/index.tsx
import React, { useState } from "react";
import { Plus, Download, Filter, RefreshCw, Users } from "lucide-react";
import Button from "../../components/UI/Button";
import Pagination from "../../components/Shared/Pagination1";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError, showInfo } from "../../utils/notification";

import customerAPI from "../../api/core/customer";
import {
  customerExportAPI,
  type CustomerExportParams,
} from "../../api/exports/customer";
import { useCustomers } from "./hooks/useCustomers";
import { useCustomerForm } from "./hooks/useCustomerForm";
import { useCustomerView } from "./hooks/useCustomerView";
import FilterBar from "./components/FilterBar";
import CustomersTable from "./components/CustomersTable";
import CustomerFormDialog from "./components/CustomerFormDialog";
import CustomerViewDialog from "./components/CustomerViewDialog";

const CustomersPage: React.FC = () => {
  const {
    customers,
    allCustomers,
    filters,
    loading,
    error,
    pagination,
    selectedCustomers,
    setSelectedCustomers,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleCustomerSelection,
    toggleSelectAll,
    handleSort,
  } = useCustomers();

  const formDialog = useCustomerForm();
  const viewDialog = useCustomerView();

  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">(
    "csv",
  );

  const handleDelete = async (customer: any) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Customer",
      message: `Are you sure you want to delete customer "${customer.name}"?`,
    });
    if (!confirmed) return;
    try {
      await customerAPI.delete(customer.id);
      showInfo("Customer deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedCustomers.length} customers?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedCustomers.map((id) => customerAPI.delete(id)));
      showSuccess(`${selectedCustomers.length} customers deleted.`);
      setSelectedCustomers([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleExport = async () => {
    if (allCustomers.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Export Customers",
      message: `Export ${pagination.total} customers as ${exportFormat.toUpperCase()}?`,
    });
    if (!confirmed) return;
    setExportLoading(true);
    try {
      const exportParams: CustomerExportParams = {
        format: exportFormat,
        status: filters.status === "all" ? undefined : filters.status,
        search: filters.search || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
      };
      await customerExportAPI.exportCustomers(exportParams);
      showSuccess("Export started.");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const getDisplayRange = () => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, pagination.total);
    return { start, end };
  };
  const { start, end } = getDisplayRange();

  // Summary stats
  const regularCount = allCustomers.filter(
    (c) => c.status === "regular",
  ).length;
  const vipCount = allCustomers.filter((c) => c.status === "vip").length;
  const eliteCount = allCustomers.filter((c) => c.status === "elite").length;
  const totalPoints = allCustomers.reduce(
    (sum, c) => sum + c.loyaltyPointsBalance,
    0,
  );

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
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--sidebar-text)" }}
          >
            Customers
          </h2>
          <p
            className="mt-xs text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage and track all customer information
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
            <RefreshCw
              className={`icon-sm mr-1 ${loading ? "animate-spin" : ""}`}
            />
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
            <div className="flex items-center gap-1">
              <label
                className="text-xs"
                style={{ color: "var(--sidebar-text)" }}
              >
                Export:
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
              onClick={handleExport}
              disabled={exportLoading || allCustomers.length === 0}
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
            Add Customer
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      {pagination.total > 0 && (
        <div
          className="mb-4 compact-card rounded-md border p-3 flex flex-wrap items-center justify-between gap-2"
          style={{
            backgroundColor: "var(--card-secondary-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {regularCount} Regular
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              {vipCount} VIP
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              {eliteCount} Elite
            </span>
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Total Loyalty Points: {totalPoints.toLocaleString()}
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
      {selectedCustomers.length > 0 && (
        <div
          className="mb-2 compact-card rounded-md border flex items-center justify-between p-2"
          style={{
            backgroundColor: "var(--accent-blue-dark)",
            borderColor: "var(--accent-blue)",
          }}
        >
          <span
            className="font-medium text-sm"
            style={{ color: "var(--accent-green)" }}
          >
            {selectedCustomers.length} customer(s) selected
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
          {pagination.total > 0 ? (
            <>
              Showing {start} to {end} of {pagination.total} entries
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
      {error && (
        <div className="text-center py-4 text-red-500">Error: {error}</div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <CustomersTable
            customers={customers}
            selectedCustomers={selectedCustomers}
            onToggleSelect={toggleCustomerSelection}
            onToggleSelectAll={toggleSelectAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            onView={(cust) => viewDialog.open(cust.id)}
            onEdit={formDialog.openEdit}
            onDelete={handleDelete}
            onManageLoyalty={(cust) => {
              dialogs.info(
                "Loyalty management will be implemented later.",
                "Coming Soon",
              );
            }}
          />

          {/* Empty State */}
          {allCustomers.length === 0 && (
            <div
              className="text-center py-8 border rounded-md"
              style={{ borderColor: "var(--border-color)" }}
            >
              <Users
                className="icon-xl mx-auto mb-2"
                style={{ color: "var(--text-secondary)" }}
              />
              <p className="text-base" style={{ color: "var(--sidebar-text)" }}>
                No customers found.
              </p>
              <p
                className="mt-xs text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                {Object.values(filters).some((v) => v && v !== "all")
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first customer"}
              </p>
              <div className="mt-2 gap-xs flex justify-center">
                {Object.values(filters).some((v) => v && v !== "all") && (
                  <button
                    className="compact-button rounded-md"
                    style={{
                      backgroundColor: "var(--accent-blue)",
                      color: "white",
                    }}
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  className="compact-button rounded-md"
                  style={{
                    backgroundColor: "var(--accent-green)",
                    color: "white",
                  }}
                  onClick={formDialog.openAdd}
                >
                  Add First Customer
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 0 && pagination.totalPages > 1 && (
            <div className="mt-2">
              <Pagination
                currentPage={currentPage}
                totalItems={pagination.total}
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
      <CustomerFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        customerId={formDialog.customerId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

    <CustomerViewDialog hook={viewDialog} />
    </div>
  );
};

export default CustomersPage;

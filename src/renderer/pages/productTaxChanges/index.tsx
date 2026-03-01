// src/renderer/pages/productTaxChanges/index.tsx
import React, { useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import Pagination from '../../components/Shared/Pagination1';
import { useProductTaxChanges } from './hooks/useProductTaxChanges';
import ProductTaxChangeTable from './components/ProductTaxChangeTable';
import ProductTaxChangeViewDialog from './components/ProductTaxChangeViewDialog';

const ProductTaxChangesPage: React.FC = () => {
  const {
    changes,
    loading,
    error,
    filters,
    pagination,
    sortConfig,
    handleFilterChange,
    resetFilters,
    handleSort,
    setPage,
    setPageSize,
    reload,
  } = useProductTaxChanges();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedChangeId, setSelectedChangeId] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleView = (change: any) => {
    setSelectedChangeId(change.id);
    setViewDialogOpen(true);
  };

  const getDisplayRange = () => {
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return { start, end };
  };
  const { start, end } = getDisplayRange();

  return (
    <div
      className="compact-card rounded-md shadow-md border"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--sidebar-text)' }}>Product Tax Change History</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            View all tax changes applied to products and variants
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            className="compact-button rounded-md flex items-center px-3 py-2"
            style={{ backgroundColor: 'var(--card-secondary-bg)', color: 'var(--sidebar-text)' }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="icon-sm mr-1" />
            Filters {showFilters ? '↑' : '↓'}
          </button>
          <button
            onClick={reload}
            disabled={loading}
            className="btn btn-secondary btn-sm rounded-md flex items-center px-3 py-2"
          >
            <RefreshCw className={`icon-sm mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Simple Filter Bar (optional) */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 rounded-md border" style={{ backgroundColor: 'var(--card-secondary-bg)', borderColor: 'var(--border-color)' }}>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>Product ID</label>
            <input
              type="number"
              value={filters.productId || ''}
              onChange={(e) => handleFilterChange('productId', e.target.value ? Number(e.target.value) : undefined)}
              className="compact-input w-full border rounded-md px-3 py-2"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--sidebar-text)' }}
              placeholder="Filter by product ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>Variant ID</label>
            <input
              type="number"
              value={filters.variantId || ''}
              onChange={(e) => handleFilterChange('variantId', e.target.value ? Number(e.target.value) : undefined)}
              className="compact-input w-full border rounded-md px-3 py-2"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--sidebar-text)' }}
              placeholder="Filter by variant ID"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sidebar-text)' }}>Search (reason, product name)</label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="compact-input w-full border rounded-md px-3 py-2"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--sidebar-text)' }}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={resetFilters}
              className="compact-button px-4 py-2 rounded-md"
              style={{ backgroundColor: 'var(--primary-color)', color: 'var(--sidebar-text)' }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Page Size & Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <div className="flex items-center gap-2">
          <label className="text-sm" style={{ color: 'var(--sidebar-text)' }}>Show:</label>
          <select
            value={pagination.limit}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="compact-input border rounded text-sm px-2 py-1"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--sidebar-text)' }}
          >
            {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
          </select>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>entries</span>
        </div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {pagination.total > 0 ? `Showing ${start} to ${end} of ${pagination.total} entries` : 'No entries found'}
        </div>
      </div>

      {/* Loading/Error/Table */}
      {loading && <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--accent-blue)' }}></div></div>}
      {error && <div className="text-center py-4 text-red-500">Error: {error}</div>}
      {!loading && !error && (
        <>
          <ProductTaxChangeTable
            changes={changes}
            onSort={handleSort}
            sortConfig={sortConfig}
            onView={handleView}
          />
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                showPageSize={false}
              />
            </div>
          )}
        </>
      )}

      {/* View Dialog */}
      <ProductTaxChangeViewDialog
        isOpen={viewDialogOpen}
        changeId={selectedChangeId}
        onClose={() => setViewDialogOpen(false)}
      />
    </div>
  );
};

export default ProductTaxChangesPage;
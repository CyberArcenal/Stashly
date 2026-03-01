// src/renderer/pages/productTaxChanges/components/ProductTaxChangeTable.tsx
import React from 'react';
import { ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import type { ProductTaxChange } from '../../../api/core/productTaxChange';

interface Props {
  changes: ProductTaxChange[];
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onView: (change: ProductTaxChange) => void;
}

const ProductTaxChangeTable: React.FC<Props> = ({ changes, onSort, sortConfig, onView }) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="overflow-x-auto rounded-md border" style={{ borderColor: 'var(--border-color)' }}>
      <table className="min-w-full" style={{ borderColor: 'var(--border-color)' }}>
        <thead style={{ backgroundColor: 'var(--card-secondary-bg)' }}>
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => onSort('id')}
            >
              <div className="flex items-center gap-1">ID {getSortIcon('id')}</div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => onSort('product')}
            >
              <div className="flex items-center gap-1">Product {getSortIcon('product')}</div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => onSort('variant')}
            >
              <div className="flex items-center gap-1">Variant {getSortIcon('variant')}</div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => onSort('old_gross_price')}
            >
              <div className="flex items-center gap-1">Old Gross {getSortIcon('old_gross_price')}</div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => onSort('new_gross_price')}
            >
              <div className="flex items-center gap-1">New Gross {getSortIcon('new_gross_price')}</div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => onSort('changed_by')}
            >
              <div className="flex items-center gap-1">Changed By {getSortIcon('changed_by')}</div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => onSort('changed_at')}
            >
              <div className="flex items-center gap-1">Changed At {getSortIcon('changed_at')}</div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: 'var(--card-bg)' }}>
          {changes.map(change => (
            <tr
              key={change.id}
              className="hover:bg-[var(--card-secondary-bg)] transition-colors"
              style={{ borderBottom: '1px solid var(--border-color)' }}
            >
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: 'var(--sidebar-text)' }}>{change.id}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: 'var(--sidebar-text)' }}>
                {change.product ? `${change.product.name} (${change.product.sku})` : (change.productId ? `Product #${change.productId}` : '-')}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: 'var(--sidebar-text)' }}>
                {change.variant ? `${change.variant.name} (${change.variant.sku})` : (change.variantId ? `Variant #${change.variantId}` : '-')}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: 'var(--sidebar-text)' }}>
                {change.old_gross_price !== null ? formatCurrency(change.old_gross_price) : '-'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: 'var(--sidebar-text)' }}>
                {change.new_gross_price !== null ? formatCurrency(change.new_gross_price) : '-'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: 'var(--sidebar-text)' }}>{change.changed_by}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: 'var(--sidebar-text)' }}>{formatDateTime(change.changed_at)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <button
                  onClick={() => onView(change)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                </button>
              </td>
            </tr>
          ))}
          {changes.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                No tax change records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTaxChangeTable;
// src/renderer/pages/productTaxChanges/components/ProductTaxChangeViewDialog.tsx
import React, { useEffect, useState } from 'react';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { Loader } from 'lucide-react';
import type { ProductTaxChange } from '../../../api/core/productTaxChange';
import productTaxChangeAPI from '../../../api/core/productTaxChange';

interface Props {
  isOpen: boolean;
  changeId: number | null;
  onClose: () => void;
}

const ProductTaxChangeViewDialog: React.FC<Props> = ({ isOpen, changeId, onClose }) => {
  const [change, setChange] = useState<ProductTaxChange | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && changeId) {
      setLoading(true);
      setError(null);
      productTaxChangeAPI.getById(changeId)
        .then(res => {
          if (res.status) setChange(res.data);
          else throw new Error(res.message);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setChange(null);
      setError(null);
    }
  }, [isOpen, changeId]);

  const formatTaxList = (taxes?: Array<{ name: string; rate: number; type: string }>) => {
    if (!taxes || taxes.length === 0) return 'None';
    return taxes.map(t => `${t.name} (${t.type === 'percentage' ? t.rate + '%' : '₱' + t.rate})`).join(', ');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Change Details" size="md">
      {loading ? (
        <div className="flex justify-center py-8"><Loader className="animate-spin" /></div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">Error: {error}</div>
      ) : change ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Change ID:</span> {change.id}</div>
            <div><span className="font-medium">Changed At:</span> {formatDateTime(change.changed_at)}</div>
            <div><span className="font-medium">Changed By:</span> {change.changed_by}</div>
            <div><span className="font-medium">Reason:</span> {change.reason || '-'}</div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="font-medium mb-2">Product / Variant</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Product:</span>{' '}
                {change.product ? `${change.product.name} (${change.product.sku})` : (change.productId ? `ID ${change.productId}` : '-')}
              </div>
              <div>
                <span className="font-medium">Variant:</span>{' '}
                {change.variant ? `${change.variant.name} (${change.variant.sku})` : (change.variantId ? `ID ${change.variantId}` : '-')}
              </div>
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="font-medium mb-2">Taxes</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Old Taxes:</span> {formatTaxList(change.old_taxes)}
                {change.old_tax_ids && !change.old_taxes && <span>IDs: {change.old_tax_ids.join(', ')}</span>}
              </div>
              <div>
                <span className="font-medium">New Taxes:</span> {formatTaxList(change.new_taxes)}
                {change.new_tax_ids && !change.new_taxes && <span>IDs: {change.new_tax_ids.join(', ')}</span>}
              </div>
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="font-medium mb-2">Gross Price</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Old Gross:</span> {formatCurrency(change.old_gross_price || 0)}</div>
              <div><span className="font-medium">New Gross:</span> {formatCurrency(change.new_gross_price || 0)}</div>
              {change.old_gross_price !== null && change.new_gross_price !== null && (
                <div className="col-span-2">
                  <span className="font-medium">Difference:</span>{' '}
                  <span className={change.new_gross_price - change.old_gross_price > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(change.new_gross_price - change.old_gross_price)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-[var(--text-secondary)]">No data</div>
      )}
    </Modal>
  );
};

export default ProductTaxChangeViewDialog;
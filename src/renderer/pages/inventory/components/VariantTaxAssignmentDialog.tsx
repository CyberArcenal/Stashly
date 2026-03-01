// src/renderer/pages/productVariant/components/VariantTaxAssignmentDialog.tsx
import React from 'react';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';
import TaxMultiSelect from '../../../components/UI/TaxMultiSelect';
import { formatCurrency } from '../../../utils/formatters';
import { useVariantTaxAssignment } from '../hooks/useVariantTaxAssignment';

interface VariantTaxAssignmentDialogProps {
  hook: ReturnType<typeof useVariantTaxAssignment>;
}

const VariantTaxAssignmentDialog: React.FC<VariantTaxAssignmentDialogProps> = ({ hook }) => {
  const {
    isOpen,
    loading,
    saving,
    variant,
    availableTaxes,
    selectedTaxIds,
    setSelectedTaxIds,
    currentGrossPrice,
    newGrossPrice,
    close,
    handleSave,
  } = hook;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={close} title={`Manage Taxes – ${variant?.name || ''}`} size="lg">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
        </div>
      ) : variant ? (
        <div className="space-y-4">
          {/* Price Preview */}
          <div className="bg-[var(--card-secondary-bg)] p-4 rounded-md border" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--sidebar-text)' }}>Price Preview</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[var(--text-secondary)]">Net Price:</span> {formatCurrency(variant.net_price || 0)}</div>
              <div><span className="text-[var(--text-secondary)]">Current Gross:</span> {formatCurrency(currentGrossPrice)}</div>
              <div><span className="text-[var(--text-secondary)]">New Gross:</span> 
                <span className={newGrossPrice !== currentGrossPrice ? 'font-bold text-[var(--accent-blue)]' : ''}>
                  {' '}{formatCurrency(newGrossPrice)}
                </span>
              </div>
              {newGrossPrice !== currentGrossPrice && (
                <div className="col-span-2 text-xs">
                  <span className="text-[var(--text-secondary)]">Difference:</span>{' '}
                  <span className={newGrossPrice > currentGrossPrice ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(newGrossPrice - currentGrossPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tax Selection */}
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--sidebar-text)' }}>Select Taxes</h4>
            <TaxMultiSelect
              value={selectedTaxIds}
              onChange={setSelectedTaxIds}
              availableTaxes={availableTaxes}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
            <Button type="button" variant="success" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default VariantTaxAssignmentDialog;
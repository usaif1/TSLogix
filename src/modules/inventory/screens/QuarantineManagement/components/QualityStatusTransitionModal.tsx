import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components';
import { QuarantineInventoryItem, QualityControlStatus } from '../../../store';

interface QualityStatusTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transitionStatus: QualityControlStatus | null;
  selectedItemsCount: number;
  selectedItem: QuarantineInventoryItem | null;
  reason: string;
  notes: string;
  quantityToMove: number;
  packageQuantityToMove: number;
  weightToMove: number;
  volumeToMove: number;
  onReasonChange: (reason: string) => void;
  onNotesChange: (notes: string) => void;
  onQuantityToMoveChange: (quantity: number) => void;
  onPackageQuantityToMoveChange: (packageQuantity: number) => void;
  onWeightToMoveChange: (weight: number) => void;
  onVolumeToMoveChange: (volume: number) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const getStatusLabel = (status: QualityControlStatus, t: any) => {
  switch (status) {
    case QualityControlStatus.CUARENTENA:
      return t('inventory:quarantine');
    case QualityControlStatus.APROBADO:
      return t('inventory:approved');
    case QualityControlStatus.DEVOLUCIONES:
      return t('inventory:returns');
    case QualityControlStatus.CONTRAMUESTRAS:
      return t('inventory:samples');
    case QualityControlStatus.RECHAZADOS:
      return t('inventory:rejected');
    default:
      return status;
  }
};

const getStatusColor = (status: QualityControlStatus) => {
  switch (status) {
    case QualityControlStatus.CUARENTENA:
      return 'text-yellow-600';
    case QualityControlStatus.APROBADO:
      return 'text-green-600';
    case QualityControlStatus.DEVOLUCIONES:
      return 'text-blue-600';
    case QualityControlStatus.CONTRAMUESTRAS:
      return 'text-purple-600';
    case QualityControlStatus.RECHAZADOS:
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const QualityStatusTransitionModal: React.FC<QualityStatusTransitionModalProps> = ({
  isOpen,
  onClose,
  transitionStatus,
  selectedItemsCount,
  selectedItem,
  reason,
  notes,
  quantityToMove,
  packageQuantityToMove,
  weightToMove,
  volumeToMove,
  onReasonChange,
  onNotesChange,
  onQuantityToMoveChange,
  onPackageQuantityToMoveChange,
  onWeightToMoveChange,
  onVolumeToMoveChange,
  onConfirm,
  isLoading = false,
}) => {
  const { t } = useTranslation(['inventory', 'common']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim() && quantityToMove > 0) {
      onConfirm();
    }
  };

  if (!isOpen || !transitionStatus) return null;

  const isSingleItem = selectedItemsCount === 1;
  const showQuantityFields = isSingleItem && selectedItem;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getStatusColor(transitionStatus).replace('text-', 'bg-')}`}>
                {getStatusLabel(transitionStatus, t).charAt(0)}
              </div>
              <span>{t('transition_to')} {getStatusLabel(transitionStatus, t)}</span>
            </h2>
            <p className="text-sm text-gray-600">
              {t('transition_confirmation_message', { 
                count: selectedItemsCount, 
                status: getStatusLabel(transitionStatus, t) 
              })}
              {' '}
              {showQuantityFields ? t('specify_quantities_and_reason') : t('please_provide_reason')}
            </p>
          </div>

          {/* Item Information - Only show for single item */}
          {showQuantityFields && selectedItem && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">{t('item_details')}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{t('product')}:</span>
                  <div className="font-medium">{selectedItem.entry_order_product.product.name}</div>
                  <div className="text-xs text-gray-500">{selectedItem.entry_order_product.product.product_code}</div>
                </div>
                <div>
                  <span className="text-gray-500">{t('location')}:</span>
                  <div className="font-medium">
                    {selectedItem.cell.row}{String(selectedItem.cell.bay).padStart(2, '0')}.{String(selectedItem.cell.position).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{selectedItem.cell.warehouse.name}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {/* Quantity Fields - Only show for single item */}
            {showQuantityFields && selectedItem && (
              <div className="grid grid-cols-2 gap-4">
                {/* Quantity to Move */}
                <div>
                  <label htmlFor="quantityToMove" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('quantity_to_move')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quantityToMove"
                    type="number"
                    min="1"
                    max={Number(selectedItem.inventory_quantity) || 0}
                    value={quantityToMove}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQuantityToMoveChange(Number(e.target.value))}
                    required
                    disabled={isLoading}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {t('available')}: {Number(selectedItem.inventory_quantity || 0).toLocaleString()}
                  </div>
                </div>

                {/* Package Quantity to Move */}
                <div>
                  <label htmlFor="packageQuantityToMove" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('packages_to_move')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="packageQuantityToMove"
                    type="number"
                    min="1"
                    max={Number(selectedItem.package_quantity) || 0}
                    value={packageQuantityToMove}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPackageQuantityToMoveChange(Number(e.target.value))}
                    required
                    disabled={isLoading}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {t('available')}: {Number(selectedItem.package_quantity || 0).toLocaleString()} pkg
                  </div>
                </div>

                {/* Weight to Move */}
                <div>
                  <label htmlFor="weightToMove" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('weight_to_move_kg')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="weightToMove"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={Number(selectedItem.weight_kg) || 0}
                    value={weightToMove}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onWeightToMoveChange(Number(e.target.value))}
                    required
                    disabled={isLoading}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {t('available')}: {Number(selectedItem.weight_kg || 0).toFixed(2)} kg
                  </div>
                </div>

                {/* Volume to Move */}
                <div>
                  <label htmlFor="volumeToMove" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('volume_to_move_m3')}
                  </label>
                  <input
                    id="volumeToMove"
                    type="number"
                    step="0.01"
                    min="0"
                    max={Number(selectedItem.volume_m3) || 0}
                    value={volumeToMove}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onVolumeToMoveChange(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {t('available')}: {Number(selectedItem.volume_m3 || 0).toFixed(2)} m³
                  </div>
                </div>
              </div>
            )}

            {/* Reason Field */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                {t('reason')} <span className="text-red-500">*</span>
              </label>
              <input
                id="reason"
                type="text"
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onReasonChange(e.target.value)}
                placeholder={t('enter_reason_status_change')}
                required
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Notes Field */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                {t('additional_notes')}
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNotesChange(e.target.value)}
                placeholder={t('add_additional_notes_observations')}
                rows={3}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('common:cancel')}
            </Button>
            <Button
              type="submit"
              variant="action"
              disabled={!reason.trim() || (showQuantityFields && quantityToMove <= 0) || isLoading}
            >
              {isLoading ? t('processing') : t('confirm_transition')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QualityStatusTransitionModal; 
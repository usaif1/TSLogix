import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text, LoaderSync } from '@/components';
import { QuarantineInventoryItem, QualityControlStatus } from '../../../store';
import CellGrid, { Cell } from '../../AllocateOrder/components/CellGrid';

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
  availableCells: Cell[];
  selectedCellId: string | null;
  onCellSelect: (cell: Cell | null) => void;
  isFetchingCells: boolean;
  onFetchCells: (status: QualityControlStatus) => void;
}

const getStatusLabel = (status: QualityControlStatus, t: (key: string) => string) => {
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
  availableCells,
  selectedCellId,
  onCellSelect,
  isFetchingCells,
  onFetchCells,
}) => {
  const { t } = useTranslation(['inventory', 'common']);

  const requiresCellSelection = transitionStatus && [
    QualityControlStatus.APROBADO,
    QualityControlStatus.DEVOLUCIONES,
    QualityControlStatus.CONTRAMUESTRAS,
    QualityControlStatus.RECHAZADOS
  ].includes(transitionStatus);

  useEffect(() => {
    if (isOpen && requiresCellSelection && transitionStatus && selectedItem) {
      onFetchCells(transitionStatus);
    }
  }, [isOpen, requiresCellSelection, transitionStatus, selectedItem, onFetchCells]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) return;
    if (showQuantityFields && quantityToMove <= 0) return;
    if (requiresCellSelection && !selectedCellId) {
      return;
    }
    
    onConfirm();
  };

  if (!isOpen || !transitionStatus) return null;

  const isSingleItem = selectedItemsCount === 1;
  const showQuantityFields = isSingleItem && selectedItem;
  const selectedCell = selectedCellId ? availableCells.find(cell => cell.cell_id === selectedCellId) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg w-full mx-4 p-6 ${requiresCellSelection ? 'max-w-5xl max-h-[90vh] overflow-y-auto' : 'max-w-2xl'}`}>
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
              {requiresCellSelection 
                ? transitionStatus === QualityControlStatus.APROBADO
                  ? t('select_destination_cell_and_provide_reason')
                  : t('specify_quantities_destination_and_reason')
                : showQuantityFields 
                  ? t('specify_quantities_and_reason') 
                  : t('please_provide_reason')
              }
            </p>
          </div>

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
                  <span className="text-gray-500">{t('current_location')}:</span>
                  <div className="font-medium">
                    {selectedItem.cell.row}{String(selectedItem.cell.bay).padStart(2, '0')}.{String(selectedItem.cell.position).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{selectedItem.cell.warehouse.name}</div>
                </div>
              </div>
            </div>
          )}

          {requiresCellSelection && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {t('select_destination_cell')} <span className="text-red-500">*</span>
              </h3>
              
              {selectedCell && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text weight="font-semibold" additionalClass="text-blue-900">
                        {t('selected_destination')}: {selectedCell.cellReference || `${selectedCell.row}.${String(selectedCell.bay).padStart(2, "0")}.${String(selectedCell.position).padStart(2, "0")}`}
                      </Text>
                      <Text size="xs" additionalClass="text-blue-700">
                        {transitionStatus} Area - {t('capacity')}: {selectedCell.capacity}
                      </Text>
                    </div>
                    <Button
                      type="button"
                      variant="cancel"
                      onClick={() => onCellSelect(null)}
                      additionalClass="text-xs py-1 px-2"
                    >
                      {t('change')}
                    </Button>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg bg-white">
                {isFetchingCells ? (
                  <div className="flex justify-center py-8">
                    <LoaderSync loaderText={t('loading_available_cells')} />
                  </div>
                ) : availableCells.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Text>{t('no_available_cells_for_status', { status: getStatusLabel(transitionStatus, t) })}</Text>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <CellGrid
                      cells={availableCells}
                      onSelect={onCellSelect}
                      selectedId={selectedCellId || undefined}
                      specialRowsOnly={transitionStatus !== QualityControlStatus.APROBADO}
                      allowedRows={
                        transitionStatus === QualityControlStatus.APROBADO ? undefined :
                        transitionStatus === QualityControlStatus.DEVOLUCIONES ? ['V'] :
                        transitionStatus === QualityControlStatus.CONTRAMUESTRAS ? ['T'] :
                        transitionStatus === QualityControlStatus.RECHAZADOS ? ['R'] :
                        undefined
                      }
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                {getStatusSpecificMessage(transitionStatus, t)}
              </div>
            </div>
          )}

          {!requiresCellSelection && transitionStatus === QualityControlStatus.APROBADO && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Text size="sm" additionalClass="text-green-800">
                ℹ️ {t('approval_no_cell_change_message')}
              </Text>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {showQuantityFields && selectedItem && (
              <div className="grid grid-cols-2 gap-4">
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

          {requiresCellSelection && !selectedCellId && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text size="sm" additionalClass="text-red-800">
                ⚠️ {t('cell_selection_required_message')}
              </Text>
            </div>
          )}

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
              disabled={
                !reason.trim() || 
                (showQuantityFields && quantityToMove <= 0) || 
                (requiresCellSelection && !selectedCellId) ||
                isLoading
              }
            >
              {isLoading ? t('processing') : t('confirm_transition')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getStatusSpecificMessage = (status: QualityControlStatus, t: (key: string) => string): string => {
  switch (status) {
    case QualityControlStatus.DEVOLUCIONES:
      return t('devoluciones_cell_help');
    case QualityControlStatus.CONTRAMUESTRAS:
      return t('contramuestras_cell_help');
    case QualityControlStatus.RECHAZADOS:
      return t('rechazados_cell_help');
    default:
      return '';
  }
};

export default QualityStatusTransitionModal; 
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Divider } from '@/components';
import { useQuarantineManagement } from '../../hooks/useQuarantineManagement';
import { 
  QualityControlFilters, 
  QualityControlInventoryTable, 
  QualityStatusTransitionModal 
} from './components';

const QuarantineManagement: React.FC = () => {
  const { t } = useTranslation(['inventory', 'common']);
  const {
    inventory,
    filteredInventory,
    warehouses,
    isLoading,
    isTransitioning,
    filters,
    selection,
    transition,
    handlers,
    isFetchingCells,
  } = useQuarantineManagement();

  // ✅ FIXED: Pre-load cells only when transitioning (removed automatic cell loading)
  // This prevents unnecessary API calls when just changing warehouse filters
  // Cells will be loaded only when needed (when opening transition modal)

  // Show loading when initially fetching data (no warehouses loaded yet)
  if (isLoading && warehouses.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Text size="3xl" weight="font-bold">
          {t('inventory:quality_control')}
        </Text>
        <Divider height="lg" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <Text additionalClass="mt-4 text-gray-600">{t('common:loading')}</Text>
          </div>
        </div>
      </div>
    );
  }

  

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Compact Header */}
      <div className="flex-shrink-0 flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-4">
          <Text size="2xl" weight="font-bold">
            {t('inventory:quality_control')}
          </Text>
          {filters.selectedStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1">
              <Text size="xs" weight="font-medium" additionalClass="text-blue-800">
                {filters.selectedStatus}
              </Text>
            </div>
          )}
        </div>
        {selection.selectedItems.length > 0 && (
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded">
            <Text size="xs" additionalClass="text-blue-700 font-medium">
              {selection.selectedItems.length} {t('common:selected')}
            </Text>
          </div>
        )}
      </div>

      {/* Compact Filters */}
      <div className="flex-shrink-0 bg-white border border-gray-200 rounded p-3 mb-3 shadow-sm">
        <QualityControlFilters
          warehouses={warehouses}
          selectedWarehouse={filters.selectedWarehouse}
          searchTerm={filters.searchTerm}
          onWarehouseChange={handlers.onWarehouseChange}
          onSearchChange={handlers.onSearchChange}
          totalItems={inventory.length}
          filteredItems={filteredInventory.length}
          selectedItemId={selection.selectedItems.length > 0 ? selection.selectedItems[0] : null}
          onTransitionToStatus={handlers.onTransitionToStatus}
          selectedStatus={filters.selectedStatus}
          onRefreshByStatus={handlers.onRefreshByStatus}
        />
      </div>

      {/* Main Table - Maximum space */}
      <div className="flex-1 min-h-0 bg-white rounded border border-gray-200 shadow-sm flex flex-col">
        <QualityControlInventoryTable
          data={filteredInventory}
          selectedItemId={selection.selectedItems.length > 0 ? selection.selectedItems[0] : null}
          onItemSelect={(itemId) => {
            if (itemId) {
              handlers.onToggleItemSelection(itemId);
            } else {
              handlers.onClearSelection();
            }
          }}
          pageSize={15}
          emptyMessage={
            inventory.length === 0
              ? t('inventory:no_items_found')
              : t('inventory:no_items_match_filters')
          }
        />
      </div>

      {/* Status Transition Modal */}
      <QualityStatusTransitionModal
        isOpen={transition.showModal}
        onClose={handlers.onCloseModal}
        transitionStatus={transition.transitionStatus}
        selectedItemsCount={selection.selectedItems.length}
        selectedItem={transition.selectedItem}
        reason={transition.reason}
        notes={transition.notes}
        quantityToMove={transition.quantityToMove}
        packageQuantityToMove={transition.packageQuantityToMove}
        weightToMove={transition.weightToMove}
        volumeToMove={transition.volumeToMove}
        onReasonChange={handlers.onReasonChange}
        onNotesChange={handlers.onNotesChange}
        onQuantityToMoveChange={handlers.onQuantityToMoveChange}
        onPackageQuantityToMoveChange={handlers.onPackageQuantityToMoveChange}
        onWeightToMoveChange={handlers.onWeightToMoveChange}
        onVolumeToMoveChange={handlers.onVolumeToMoveChange}
        onConfirm={handlers.onConfirmTransition}
        isLoading={isTransitioning}
        availableCells={transition.availableCells}
        selectedCellId={transition.selectedCellId}
        onCellSelect={handlers.onCellSelect}
        isFetchingCells={isFetchingCells}
        onFetchCells={handlers.onFetchCellsForStatus}
      />
    </div>
  );
};

export default QuarantineManagement; 
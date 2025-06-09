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
  } = useQuarantineManagement();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
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
    <div className="flex flex-col h-full">
      {/* Simple Header */}
      <Text size="3xl" weight="font-bold">
        {t('inventory:quality_control')}
      </Text>
      <Divider height="lg" />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <QualityControlFilters
          warehouses={warehouses}
          selectedWarehouse={filters.selectedWarehouse}
          searchTerm={filters.searchTerm}
          onWarehouseChange={handlers.onWarehouseChange}
          onSearchChange={handlers.onSearchChange}
          totalItems={inventory.length}
          filteredItems={filteredInventory.length}
          selectedItems={selection.selectedItems}
          onTransitionToStatus={handlers.onTransitionToStatus}
          selectedStatus={filters.selectedStatus}
          onRefreshByStatus={handlers.onRefreshByStatus}
        />
      </div>

      {/* Main Table - Focus Area */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Text size="lg" weight="font-semibold">
                {t('inventory:inventory_items')}
              </Text>
              <Text size="sm" additionalClass="text-gray-600">
                {filteredInventory.length} {t('inventory:items_found')}
              </Text>
            </div>
            
            {selection.selectedItems.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded">
                <Text size="sm" additionalClass="text-blue-700 font-medium">
                  {selection.selectedItems.length} {t('common:selected')}
                </Text>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <QualityControlInventoryTable
            data={filteredInventory}
            selectedItems={selection.selectedItems}
            onToggleItemSelection={handlers.onToggleItemSelection}
            pageSize={50}
            emptyMessage={
              inventory.length === 0
                ? t('inventory:no_items_found')
                : t('inventory:no_items_match_filters')
            }
          />
        </div>
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
      />
    </div>
  );
};

export default QuarantineManagement; 
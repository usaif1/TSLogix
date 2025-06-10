import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Divider } from '@/components';
import { useQuarantineManagement } from '../../hooks/useQuarantineManagement';
import { QualityControlStatus } from '../../store';
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

  // ✅ NEW: Quality Control System Status Indicator
  const getQualityControlInfo = () => {
    const statusInfo = {
      [QualityControlStatus.CUARENTENA]: { 
        cells: 'A-Q rows (Standard warehouse)', 
        description: 'Initial quarantine state' 
      },
      [QualityControlStatus.APROBADO]: { 
        cells: 'A-Q rows (Standard warehouse)', 
        description: 'Ready for departure' 
      },
      [QualityControlStatus.DEVOLUCIONES]: { 
        cells: 'V row (Returns area)', 
        description: 'Customer returns' 
      },
      [QualityControlStatus.CONTRAMUESTRAS]: { 
        cells: 'T row (Samples area)', 
        description: 'Quality samples' 
      },
      [QualityControlStatus.RECHAZADOS]: { 
        cells: 'R row (Rejected area)', 
        description: 'Failed quality control' 
      },
    };
    return statusInfo[filters.selectedStatus || QualityControlStatus.CUARENTENA];
  };

  

  return (
    <div className="flex flex-col overflow-hidden pb-4" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header - Fixed height */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <Text size="3xl" weight="font-bold">
            {t('inventory:quality_control')}
          </Text>
          {/* Quality Control System Status */}
          {filters.selectedStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Text size="sm" weight="font-medium" additionalClass="text-blue-900">
                {filters.selectedStatus} System
              </Text>
              <Text size="xs" additionalClass="text-blue-700">
                {getQualityControlInfo().cells} • {getQualityControlInfo().description}
              </Text>
            </div>
          )}
        </div>
        <Divider height="lg" />
      </div>

      {/* Filters - Fixed height container */}
      <div className="flex-shrink-0 relative z-20 bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
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

      {/* Main Table - Takes remaining height */}
      <div className="flex-1 min-h-0 relative z-10 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
        {/* Table Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
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

        {/* Table Content - Properly sized container to ensure pagination visibility */}
        <div className="flex-1 min-h-0 flex flex-col">
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
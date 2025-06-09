import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Button } from '@/components';
import { QualityControlStatus } from '../../../store';

interface QualityControlFiltersProps {
  warehouses: Array<{ warehouse_id: string; name: string }>;
  selectedWarehouse: { value: string; label: string } | null;
  searchTerm: string;
  onWarehouseChange: (warehouse: { value: string; label: string } | null) => void;
  onSearchChange: (term: string) => void;
  totalItems: number;
  filteredItems: number;
  selectedItems: string[];
  onTransitionToStatus: (status: QualityControlStatus) => void;
  selectedStatus: QualityControlStatus | null;
  onRefreshByStatus: (status: QualityControlStatus) => void;
}

type OptionType = { value: string; label: string };

const QualityControlFilters: React.FC<QualityControlFiltersProps> = ({
  warehouses,
  selectedWarehouse,
  searchTerm,
  onWarehouseChange,
  onSearchChange,
  totalItems,
  filteredItems,
  selectedItems,
  onTransitionToStatus,
  selectedStatus,
  onRefreshByStatus,
}) => {
  const { t } = useTranslation(['inventory', 'common']);

  const warehouseOptions = [
    { value: "all", label: t('common:all_warehouses') },
    ...warehouses.map(w => ({ value: w.warehouse_id, label: w.name }))
  ];

  const statusOptions = [
    { value: QualityControlStatus.CUARENTENA, label: t('inventory:quarantine') },
    { value: QualityControlStatus.APROBADO, label: t('inventory:approved') },
    { value: QualityControlStatus.RECHAZADOS, label: t('inventory:rejected') },
    { value: QualityControlStatus.DEVOLUCIONES, label: t('inventory:returns') },
    { value: QualityControlStatus.CONTRAMUESTRAS, label: t('inventory:samples') }
  ];

  const hasSelection = selectedItems.length > 0;

  // Find the current selected status option
  const selectedStatusOption = selectedStatus 
    ? statusOptions.find(option => option.value === selectedStatus) 
    : null;

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('inventory:status')}
          </label>
          <Select
            options={statusOptions}
            value={selectedStatusOption}
            onChange={(option: OptionType | null) => {
              if (option) {
                onRefreshByStatus(option.value as QualityControlStatus);
              } else {
                onRefreshByStatus(QualityControlStatus.CUARENTENA);
              }
            }}
            placeholder={t('inventory:filter_by_status')}
            isClearable={true}
            className="text-sm"
          />
        </div>

        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('common:search')}
          </label>
          <input
            type="text"
            placeholder={t('inventory:search_products')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Warehouse Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('inventory:warehouse')}
          </label>
          <Select
            options={warehouseOptions}
            value={selectedWarehouse || { value: "all", label: t('common:all_warehouses') }}
            onChange={(option: OptionType | null) => 
              option?.value === "all" ? onWarehouseChange(null) : onWarehouseChange(option)
            }
            placeholder={t('inventory:select_warehouse')}
            isClearable={false}
            className="text-sm"
          />
        </div>
      </div>

      {/* Selection Actions */}
      {hasSelection && (
        <div className="border-t border-gray-200 bg-blue-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm font-medium text-blue-900">
              {selectedItems.length} {t('common:items_selected')}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="action"
                onClick={() => onTransitionToStatus(QualityControlStatus.APROBADO)}
                additionalClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
              >
                {t('inventory:approve')}
              </Button>

              <Button
                variant="action"
                onClick={() => onTransitionToStatus(QualityControlStatus.RECHAZADOS)}
                additionalClass="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                {t('inventory:reject')}
              </Button>

              <Button
                variant="action"
                onClick={() => onTransitionToStatus(QualityControlStatus.CONTRAMUESTRAS)}
                additionalClass="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
              >
                {t('inventory:move_to_samples')}
              </Button>

              <Button
                variant="action"
                onClick={() => onTransitionToStatus(QualityControlStatus.DEVOLUCIONES)}
                additionalClass="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm"
              >
                {t('inventory:move_to_returns')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityControlFilters; 
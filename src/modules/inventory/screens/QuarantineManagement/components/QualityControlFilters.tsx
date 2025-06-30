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
  selectedItemId: string | null;
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
  selectedItemId,
  onTransitionToStatus,
  selectedStatus,
  onRefreshByStatus,
}) => {
  const { t } = useTranslation(['inventory', 'common']);

  const warehouseOptions = warehouses.map(w => ({ value: w.warehouse_id, label: w.name }));

  const statusOptions = [
    { value: QualityControlStatus.CUARENTENA, label: t('inventory:quarantine') },
    { value: QualityControlStatus.APROBADO, label: t('inventory:approved') },
    { value: QualityControlStatus.RECHAZADOS, label: t('inventory:rejected') },
    { value: QualityControlStatus.DEVOLUCIONES, label: t('inventory:returns') },
    { value: QualityControlStatus.CONTRAMUESTRAS, label: t('inventory:samples') }
  ];

  // Find the current selected status option
  const selectedStatusOption = selectedStatus 
    ? statusOptions.find(option => option.value === selectedStatus) 
    : null;

  return (
    <div className="space-y-3">
      {/* Compact Filter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">
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
            isClearable={false}
            className="text-sm"
            styles={{
              menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
              menu: (base: any) => ({ ...base, zIndex: 9999 }),
              control: (base: any, state: any) => ({
                ...base,
                minHeight: '32px',
                borderColor: selectedStatus ? '#3B82F6' : state.isFocused ? '#3B82F6' : '#D1D5DB',
                boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
              }),
            }}
            menuPortalTarget={document.body}
          />
        </div>

        {/* Warehouse Filter */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t('inventory:warehouse')}
          </label>
          <Select
            options={warehouseOptions}
            value={selectedWarehouse}
            onChange={(option: OptionType | null) => onWarehouseChange(option)}
            placeholder={t('inventory:select_warehouse')}
            isClearable={false}
            className="text-sm"
            styles={{
              menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
              menu: (base: any) => ({ ...base, zIndex: 9999 }),
              control: (base: any, state: any) => ({
                ...base,
                minHeight: '32px',
                borderColor: selectedWarehouse ? '#10B981' : state.isFocused ? '#3B82F6' : '#D1D5DB',
                boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
              }),
            }}
            menuPortalTarget={document.body}
            isDisabled={warehouseOptions.length === 0}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t('common:search')}
          </label>
          <input
            type="text"
            placeholder={t('inventory:search_products')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Compact Stats */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t('inventory:items')}
          </label>
          <div className="flex items-center gap-2 h-8 px-2 bg-gray-50 rounded border text-sm">
            <span className="text-gray-700">{filteredItems}</span>
            <span className="text-gray-400">of</span>
            <span className="text-gray-700">{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Single Item Actions */}
      {selectedItemId && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs font-medium text-blue-800">
              {t('common:item_selected')} - {t('inventory:choose_action')}
            </div>

            <div className="flex flex-wrap gap-1">
              <Button
                variant="action"
                onClick={() => onTransitionToStatus(QualityControlStatus.APROBADO)}
                additionalClass="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
              >
                {t('inventory:approve')}
              </Button>

              <Button
                variant="action"
                onClick={() => onTransitionToStatus(QualityControlStatus.RECHAZADOS)}
                additionalClass="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
              >
                {t('inventory:reject')}
              </Button>

              <Button
                variant="action"
                onClick={() => onTransitionToStatus(QualityControlStatus.CONTRAMUESTRAS)}
                additionalClass="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
              >
                {t('inventory:move_to_samples')}
              </Button>

              <Button
                variant="action"
                onClick={() => onTransitionToStatus(QualityControlStatus.DEVOLUCIONES)}
                additionalClass="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs"
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
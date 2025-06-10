/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
// Using emoji icons instead of lucide-react

interface FilterOption {
  value: string;
  label: string;
}

interface InventoryLogFiltersProps {
  filters: {
    warehouse: FilterOption | null;
    movementType: FilterOption | null;
    qualityStatus: FilterOption | null;
    dateRange: { start: string; end: string };
    searchTerm: string;
  };
  onFilterChange: (filterName: string, value: any) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  warehouseOptions: FilterOption[];
  totalResults: number;
  isLoading?: boolean;
}

const InventoryLogFilters: React.FC<InventoryLogFiltersProps> = ({
  filters,
  onFilterChange,
  onSearchChange,
  onClearFilters,
  warehouseOptions,
  totalResults,
  isLoading = false,
}) => {
  const { t } = useTranslation(['inventory', 'common']);

  const movementTypeOptions: FilterOption[] = [
    { value: "ENTRY", label: t('inventory:entry') },
    { value: "DEPARTURE", label: t('inventory:departure') },
    { value: "TRANSFER", label: t('inventory:transfer') },
    { value: "ADJUSTMENT", label: t('inventory:adjustment') },
  ];

  const qualityStatusOptions: FilterOption[] = [
    { value: "CUARENTENA", label: t('inventory:quarantine') },
    { value: "APROBADO", label: t('inventory:approved') },
    { value: "DEVOLUCIONES", label: t('inventory:returns') },
    { value: "CONTRAMUESTRAS", label: t('inventory:samples') },
    { value: "RECHAZADOS", label: t('inventory:rejected') },
  ];

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#3B82F6',
      },
      borderRadius: '8px',
      minHeight: '38px',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EBF8FF' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3B82F6' : '#EBF8FF',
      },
    }),
  };

  const hasActiveFilters = filters.warehouse || filters.movementType || filters.qualityStatus || 
                          filters.searchTerm || filters.dateRange.start || filters.dateRange.end;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">🔍</span>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('inventory:filters')}
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <span>🔄</span>
            <span>{t('common:clear_all')}</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          type="text"
          placeholder={t('inventory:search_products_entries')}
          value={filters.searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {filters.searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Warehouse Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('inventory:warehouse')}
          </label>
          <Select
            options={warehouseOptions}
            value={filters.warehouse}
            onChange={(option) => onFilterChange('warehouse', option)}
            placeholder={t('inventory:all_warehouses')}
            isClearable
            isLoading={isLoading}
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>

        {/* Movement Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('inventory:movement_type')}
          </label>
          <Select
            options={movementTypeOptions}
            value={filters.movementType}
            onChange={(option) => onFilterChange('movementType', option)}
            placeholder={t('inventory:all_movements')}
            isClearable
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>

        {/* Quality Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('inventory:quality_status')}
          </label>
          <Select
            options={qualityStatusOptions}
            value={filters.qualityStatus}
            onChange={(option) => onFilterChange('qualityStatus', option)}
            placeholder={t('inventory:all_statuses')}
            isClearable
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="mr-1">📅</span>
            {t('inventory:date_range')}
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="text-sm text-gray-600">
            {isLoading ? (
              <span className="text-blue-600">{t('common:loading')}...</span>
            ) : (
              <>
                <span className="font-medium text-gray-900">{totalResults}</span>
                {' '}{t('inventory:records_found')}
              </>
            )}
          </span>
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            <span>🔍</span>
            <span>{t('common:filtered')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryLogFilters; 
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FunnelSimple,
  MagnifyingGlass,
  X,
  User,
  Lightning,
  Database,
  Eraser,
} from "@phosphor-icons/react";
import Select, { SingleValue } from "react-select";

// Components
import { Button, Text, TextInput } from "@/components";

// Store and Service
import { useEventLogState, useEventLogActions, FilterOption } from "@/modules/eventLogs/store";
import EventLogService from "@/modules/eventLogs/api/eventLog.service";

interface EventLogsFiltersProps {
  onFiltersChange?: () => void;
  className?: string;
  compact?: boolean;
}

const EventLogsFilters: React.FC<EventLogsFiltersProps> = ({
  onFiltersChange,
  className = "",
  compact = false,
}) => {
  const { t } = useTranslation(['eventLogs', 'common']);
  
  // Store state
  const { filters, appliedFilters, loaders } = useEventLogState();
  const { 
    setAppliedFilters, 
    clearFilters, 
    addFilterAction, 
    removeFilterAction,
    addFilterUser,
    removeFilterUser,
    addFilterEntityType,
    removeFilterEntityType,
  } = useEventLogActions();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState(appliedFilters.searchTerm || '');
  const [dateFrom, setDateFrom] = useState(appliedFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(appliedFilters.dateTo || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Loading states
  const isLoadingFilters = loaders['eventLogs/fetch-filters'];

  // Memoize the onFiltersChange callback to prevent infinite loops
  const memoizedOnFiltersChange = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange();
    }
  }, [onFiltersChange]);

  // Load filters on mount
  useEffect(() => {
    if (!filters) {
      EventLogService.fetchFilters();
    }
  }, [filters]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== appliedFilters.searchTerm) {
        setAppliedFilters({ searchTerm });
        memoizedOnFiltersChange();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, appliedFilters.searchTerm, setAppliedFilters, memoizedOnFiltersChange]);

  // Handle date changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (dateFrom !== appliedFilters.dateFrom || dateTo !== appliedFilters.dateTo) {
        setAppliedFilters({ dateFrom, dateTo });
        memoizedOnFiltersChange();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dateFrom, dateTo, appliedFilters.dateFrom, appliedFilters.dateTo, setAppliedFilters, memoizedOnFiltersChange]);

  // Quick date range handlers
  const handleQuickDateRange = (range: '1h' | '24h' | '7d' | '30d') => {
    const now = new Date();
    let fromDate: Date;

    switch (range) {
      case '1h':
        fromDate = new Date(now.getTime() - (1 * 60 * 60 * 1000));
        break;
      case '24h':
        fromDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        break;
      case '7d':
        fromDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '30d':
        fromDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      default:
        fromDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    }

    setDateFrom(fromDate.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
    setAppliedFilters({ 
      timeRange: range,
      dateFrom: fromDate.toISOString().split('T')[0],
      dateTo: now.toISOString().split('T')[0]
    });
  };

  // Handle filter selections
  const handleActionSelect = useCallback((option: SingleValue<FilterOption>) => {
    if (option && !appliedFilters.actions.find(a => a.value === option.value)) {
      addFilterAction(option);
      memoizedOnFiltersChange();
    }
  }, [appliedFilters.actions, addFilterAction, memoizedOnFiltersChange]);

  const handleUserSelect = useCallback((option: SingleValue<FilterOption>) => {
    if (option && !appliedFilters.users.find(u => u.value === option.value)) {
      addFilterUser(option);
      memoizedOnFiltersChange();
    }
  }, [appliedFilters.users, addFilterUser, memoizedOnFiltersChange]);

  const handleEntityTypeSelect = useCallback((option: SingleValue<FilterOption>) => {
    if (option && !appliedFilters.entityTypes.find(e => e.value === option.value)) {
      addFilterEntityType(option);
      memoizedOnFiltersChange();
    }
  }, [appliedFilters.entityTypes, addFilterEntityType, memoizedOnFiltersChange]);

  // Handle filter removals
  const handleRemoveActionFilter = useCallback((actionValue: string) => {
    removeFilterAction(actionValue);
    memoizedOnFiltersChange();
  }, [removeFilterAction, memoizedOnFiltersChange]);

  const handleRemoveUserFilter = useCallback((userId: string) => {
    removeFilterUser(userId);
    memoizedOnFiltersChange();
  }, [removeFilterUser, memoizedOnFiltersChange]);

  const handleRemoveEntityTypeFilter = useCallback((entityValue: string) => {
    removeFilterEntityType(entityValue);
    memoizedOnFiltersChange();
  }, [removeFilterEntityType, memoizedOnFiltersChange]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    clearFilters();
    memoizedOnFiltersChange();
  }, [clearFilters, memoizedOnFiltersChange]);

  // Convert filter arrays to dropdown options
  const actionOptions: FilterOption[] = filters?.actions.map(action => ({
    value: action,
    label: action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  })) || [];

  const userOptions: FilterOption[] = filters?.users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`
  })) || [];

  const entityTypeOptions: FilterOption[] = filters?.entityTypes.map(entityType => ({
    value: entityType,
    label: entityType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  })) || [];

  // Filter tag component
  const FilterTag: React.FC<{ 
    label: string; 
    onRemove: () => void; 
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }> = ({ label, onRemove, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
        {label}
        <button
          onClick={onRemove}
          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition-colors"
        >
          <X size={12} />
        </button>
      </span>
    );
  };

  // Calculate active filters count
  const activeFiltersCount = 
    appliedFilters.actions.length + 
    appliedFilters.users.length + 
    appliedFilters.entityTypes.length + 
    (appliedFilters.searchTerm ? 1 : 0) +
    (appliedFilters.dateFrom || appliedFilters.dateTo ? 1 : 0);

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-3 ${className}`}>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <TextInput
              name="search"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="action" onClick={() => handleQuickDateRange('24h')} additionalClass="text-sm px-3 py-1">
              {t('last_24_hours')}
            </Button>
            <Button variant="action" onClick={() => handleQuickDateRange('7d')} additionalClass="text-sm px-3 py-1">
              {t('last_7_days')}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="action" onClick={handleClearAllFilters} additionalClass="text-sm px-3 py-1">
                <Eraser size={14} className="mr-1" />
                {t('clear_filters')} ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FunnelSimple size={20} className="text-gray-500 mr-2" />
            <Text size="lg" weight="font-semibold" additionalClass="text-gray-900">
              {t('filters')}
            </Text>
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFiltersCount} {t('active')}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="action"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              additionalClass="text-sm"
            >
              {showAdvancedFilters ? t('simple_view') : t('advanced_search')}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="action" onClick={handleClearAllFilters}>
                <Eraser size={16} className="mr-1" />
                {t('clear_all')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MagnifyingGlass size={16} className="inline mr-1" />
            {t('search_events')}
          </label>
          <TextInput
            name="search"
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Date Range Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('quick_date_ranges')}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="action" onClick={() => handleQuickDateRange('1h')}>
              {t('last_hour')}
            </Button>
            <Button variant="action" onClick={() => handleQuickDateRange('24h')}>
              {t('last_24_hours')}
            </Button>
            <Button variant="action" onClick={() => handleQuickDateRange('7d')}>
              {t('last_7_days')}
            </Button>
            <Button variant="action" onClick={() => handleQuickDateRange('30d')}>
              {t('last_30_days')}
            </Button>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('date_from')}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('date_to')}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Actions Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lightning size={16} className="inline mr-1" />
              {t('filter_by_action')}
            </label>
            <Select
              options={actionOptions}
              placeholder={t('select_actions')}
              onChange={handleActionSelect}
              isDisabled={isLoadingFilters}
              isClearable
            />
          </div>

          {/* Users Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              {t('filter_by_user')}
            </label>
            <Select
              options={userOptions}
              placeholder={t('select_users')}
              onChange={handleUserSelect}
              isDisabled={isLoadingFilters}
              isClearable
            />
          </div>

          {/* Entity Types Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Database size={16} className="inline mr-1" />
              {t('filter_by_entity')}
            </label>
            <Select
              options={entityTypeOptions}
              placeholder={t('select_entities')}
              onChange={handleEntityTypeSelect}
              isDisabled={isLoadingFilters}
              isClearable
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <Text weight="font-medium" additionalClass="text-gray-900">
              {t('advanced_options')}
            </Text>
            
            {/* Additional filters can be added here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ip_address')}
                </label>
                <TextInput
                  name="ip_filter"
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('session_id')}
                </label>
                <TextInput
                  name="session_filter"
                  placeholder="Session ID"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div>
            <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-3">
              {t('active_filters')}:
            </Text>
            <div className="flex flex-wrap gap-2">
              {/* Search Term Tag */}
              {appliedFilters.searchTerm && (
                <FilterTag
                  label={`${t('search')}: "${appliedFilters.searchTerm}"`}
                  onRemove={() => {
                    setSearchTerm('');
                    setAppliedFilters({ searchTerm: '' });
                  }}
                  color="purple"
                />
              )}

              {/* Date Range Tag */}
              {(appliedFilters.dateFrom || appliedFilters.dateTo) && (
                <FilterTag
                  label={`${t('date_range')}: ${appliedFilters.dateFrom || 'Any'} - ${appliedFilters.dateTo || 'Any'}`}
                  onRemove={() => {
                    setDateFrom('');
                    setDateTo('');
                    setAppliedFilters({ dateFrom: '', dateTo: '' });
                  }}
                  color="orange"
                />
              )}

              {/* Action Tags */}
              {appliedFilters.actions.map((action) => (
                <FilterTag
                  key={action.value}
                  label={`${t('action')}: ${action.label}`}
                  onRemove={() => handleRemoveActionFilter(action.value)}
                  color="blue"
                />
              ))}

              {/* User Tags */}
              {appliedFilters.users.map((user) => (
                <FilterTag
                  key={user.value}
                  label={`${t('user')}: ${user.label}`}
                  onRemove={() => handleRemoveUserFilter(user.value)}
                  color="green"
                />
              ))}

              {/* Entity Type Tags */}
              {appliedFilters.entityTypes.map((entityType) => (
                <FilterTag
                  key={entityType.value}
                  label={`${t('entity')}: ${entityType.label}`}
                  onRemove={() => handleRemoveEntityTypeFilter(entityType.value)}
                  color="purple"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventLogsFilters; 
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Download,
  FunnelSimple,
  ArrowClockwise,
} from "@phosphor-icons/react";

// Components
import { Button, Text } from "@/components";
import { EventLogsTable, EventLogsFilters } from "@/modules/eventLogs/components";

// Store and Service
import { useEventLogState, useEventLogActions } from "@/modules/eventLogs/store";
import { EventLogService } from "@/modules/eventLogs/api/eventLog.service";

const EventLogsPage: React.FC = () => {
  const { t } = useTranslation(['eventLogs', 'common']);
  
  // Store state
  const { events, loaders, appliedFilters } = useEventLogState();
  const { setCurrentView } = useEventLogActions();
  
  // Local state
  const [showFilters, setShowFilters] = useState(false);

  // Loading states
  const isEventsLoading = loaders['eventLogs/fetch-events'];
  const isExporting = loaders['eventLogs/export-events'];

  // Initialize data on mount
  useEffect(() => {
    initializeData();
    setCurrentView('events');
  }, []);

  // Initialize events data
  const initializeData = async () => {
    try {
      await EventLogService.fetchEvents(appliedFilters, 50, 0);
    } catch (error) {
      console.error('Error initializing event logs data:', error);
      toast.error(t('error_loading_data'));
    }
  };

  // Handle filters change
  const handleFiltersChange = async () => {
    try {
      await EventLogService.fetchEvents(appliedFilters, 50, 0);
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error(t('error_loading_data'));
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      toast.info(t('export_started'));
      await EventLogService.exportEvents(appliedFilters, format);
      toast.success(t('export_completed'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('export_failed'));
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    EventLogService.fetchEvents(appliedFilters, 50, 0);
  };

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Text size="2xl" weight="font-bold" additionalClass="text-gray-900 mt-2">
              {t('event_logs')}
            </Text>
            <Text size="sm" additionalClass="text-gray-600 mt-1">
              {events.length} {t('events_found')}
            </Text>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              variant="action"
              disabled={isEventsLoading}
              additionalClass="flex items-center"
            >
              <ArrowClockwise size={16} className="mr-2" />
              {t('refresh')}
            </Button>
            
            <Button
              onClick={toggleFilters}
              variant="action"
              additionalClass="flex items-center"
            >
              <FunnelSimple size={16} className="mr-2" />
              {showFilters ? t('hide_filters') : t('show_filters')}
            </Button>
            
            <Button
              onClick={() => handleExport('csv')}
              variant="action"
              disabled={isExporting}
              additionalClass="flex items-center"
            >
              <Download size={16} className="mr-2" />
              {isExporting ? t('exporting') : t('export_csv')}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <EventLogsFilters 
            onFiltersChange={handleFiltersChange}
            compact={true}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-6">
          <EventLogsTable 
            showPagination={true}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default EventLogsPage; 
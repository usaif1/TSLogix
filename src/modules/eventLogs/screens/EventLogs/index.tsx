import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ChartBar,
  List,
  Download,
  FunnelSimple,
  ArrowClockwise,
} from "@phosphor-icons/react";

// Components
import { Button, Text } from "@/components";
import { DashboardOverview, EventLogsTable, EventLogsFilters } from "@/modules/eventLogs/components";

// Store and Service
import { useEventLogState, useEventLogActions } from "@/modules/eventLogs/store";
import { EventLogService } from "@/modules/eventLogs/api/eventLog.service";

type TabType = 'dashboard' | 'events';

interface TabButtonProps {
  id: TabType;
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  isActive: boolean;
  onClick: (id: TabType) => void;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ id, icon: Icon, label, isActive, onClick, count }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700 border border-blue-300'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    <Icon size={16} className="mr-2" />
    {label}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
        isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const EventLogsPage: React.FC = () => {
  const { t } = useTranslation(['eventLogs', 'common']);
  
  // Store state
  const { events, loaders, appliedFilters } = useEventLogState();
  const { setCurrentView } = useEventLogActions();
  
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showFilters, setShowFilters] = useState(false);

  // Loading states
  const isDashboardLoading = loaders['eventLogs/fetch-dashboard'];
  const isEventsLoading = loaders['eventLogs/fetch-events'];
  const isExporting = loaders['eventLogs/export-events'];

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, []);

  // Initialize dashboard and events data
  const initializeData = async () => {
    try {
      await Promise.all([
        EventLogService.fetchDashboard('24h'),
        EventLogService.fetchEvents(appliedFilters, 50, 0),
      ]);
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

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentView(tab === 'dashboard' ? 'dashboard' : 'events');
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
    if (activeTab === 'dashboard') {
      EventLogService.fetchDashboard('24h');
    } else {
      EventLogService.fetchEvents(appliedFilters, 50, 0);
    }
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
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              variant="action"
              disabled={isDashboardLoading || isEventsLoading}
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

        {/* Tabs */}
        <div className="flex space-x-2 mt-4">
          <TabButton
            id="dashboard"
            icon={ChartBar}
            label={t('dashboard')}
            isActive={activeTab === 'dashboard'}
            onClick={handleTabChange}
          />
          <TabButton
            id="events"
            icon={List}
            label={t('events')}
            isActive={activeTab === 'events'}
            onClick={handleTabChange}
            count={events.length}
          />
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
          {activeTab === 'dashboard' ? (
            <DashboardOverview />
          ) : (
            <EventLogsTable 
              showPagination={true}
              className="h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventLogsPage; 
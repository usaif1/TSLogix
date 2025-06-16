import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChartBar,
  Clock,
  Users,
  Warning,
  CheckCircle,
  XCircle,
  Info,
  ArrowUp,
  ArrowDown,
} from "@phosphor-icons/react";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Store and Service
import { useEventLogState, useEventLogActions } from "@/modules/eventLogs/store";
import { EventLogService } from "@/modules/eventLogs/api/eventLog.service";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<IconProps>;
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'indigo';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
}

interface IconProps {
  size: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
  subtitle,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
  };

  const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <Icon size={20} className={iconColorClasses[color]} />
            <Text size="sm" weight="font-medium" additionalClass="ml-2 text-gray-600">
              {title}
            </Text>
          </div>
          <Text size="xl" weight="font-bold" additionalClass="mt-1 text-gray-900">
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" additionalClass="text-gray-500 mt-1">
              {subtitle}
            </Text>
          )}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center ml-4 ${trendColorClasses[trend]}`}>
            {trend === 'up' && <ArrowUp size={14} />}
            {trend === 'down' && <ArrowDown size={14} />}
            <Text size="sm" weight="font-medium" additionalClass="ml-1">
              {trendValue}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

interface TimeRangeButtonProps {
  timeRange: '1h' | '24h' | '7d' | '30d';
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TimeRangeButton: React.FC<TimeRangeButtonProps> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-sm rounded-md transition-colors ${
      active
        ? 'bg-blue-100 text-blue-700 border border-blue-300'
        : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);

const DashboardOverview: React.FC = () => {
  const { t } = useTranslation(['eventLogs', 'common']);
  
  // Store state
  const { dashboard, loaders } = useEventLogState();
  const { setAppliedFilters } = useEventLogActions();
  
  // Local state
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Loading states
  const isDashboardLoading = loaders['eventLogs/fetch-dashboard'];

  // Load dashboard data on mount and time range change
  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      await EventLogService.fetchDashboard(selectedTimeRange);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleTimeRangeChange = (timeRange: '1h' | '24h' | '7d' | '30d') => {
    setSelectedTimeRange(timeRange);
    setAppliedFilters({ timeRange });
  };

  if (isDashboardLoading && !dashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderSync loaderText={t('loading_statistics')} />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <Text additionalClass="text-gray-500 mb-4">{t('no_data_available')}</Text>
        <Button onClick={loadDashboardData} variant="action">
          {t('refresh')}
        </Button>
      </div>
    );
  }

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Time Range Controls */}
      <div className="flex items-center justify-between">
        <Text size="lg" weight="font-semibold" additionalClass="text-gray-900">
          {t('system_activity')}
        </Text>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <TimeRangeButton
            timeRange="1h"
            active={selectedTimeRange === '1h'}
            onClick={() => handleTimeRangeChange('1h')}
          >
            {t('last_hour')}
          </TimeRangeButton>
          <TimeRangeButton
            timeRange="24h"
            active={selectedTimeRange === '24h'}
            onClick={() => handleTimeRangeChange('24h')}
          >
            {t('last_24_hours')}
          </TimeRangeButton>
          <TimeRangeButton
            timeRange="7d"
            active={selectedTimeRange === '7d'}
            onClick={() => handleTimeRangeChange('7d')}
          >
            {t('last_7_days')}
          </TimeRangeButton>
          <TimeRangeButton
            timeRange="30d"
            active={selectedTimeRange === '30d'}
            onClick={() => handleTimeRangeChange('30d')}
          >
            {t('last_30_days')}
          </TimeRangeButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('total_events')}
          value={formatNumber(dashboard.summary.totalEvents)}
          icon={ChartBar}
          color="blue"
        />
        <StatCard
          title={t('error_events')}
          value={formatNumber(dashboard.summary.errorEvents)}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title={t('active_users')}
          value={formatNumber(dashboard.topUsers.length)}
          icon={Users}
          color="green"
        />
        <StatCard
          title={t('recent_activity')}
          value={formatNumber(dashboard.summary.recentActivity)}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Charts and Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-900">
            {t('top_actions')}
          </Text>
          <div className="space-y-3">
            {dashboard.topActions.slice(0, 5).map((action, index) => (
              <div key={action.action} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-orange-500' :
                    index === 3 ? 'bg-purple-500' : 'bg-gray-400'
                  }`} />
                  <Text additionalClass="text-gray-900">{EventLogService.translateAction(action.action, t)}</Text>
                </div>
                <Text weight="font-medium" additionalClass="text-gray-600">
                  {formatNumber(action.count)}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-900">
            {t('top_users')}
          </Text>
          <div className="space-y-3">
            {dashboard.topUsers.slice(0, 5).map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-orange-500' :
                    index === 3 ? 'bg-purple-500' : 'bg-gray-400'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-900">
                      {user.name}
                    </Text>
                    <Text size="xs" additionalClass="text-gray-500">
                      {user.email}
                    </Text>
                  </div>
                </div>
                <Text weight="font-medium" additionalClass="text-gray-600">
                  {formatNumber(user.eventCount)}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:col-span-2">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-900">
            {t('recent_events')}
          </Text>
          <div className="space-y-3">
            {dashboard.recentEvents.slice(0, 5).map((event) => {
              const severity = EventLogService.getEventSeverity(event.action);
              const severityIcons = {
                error: XCircle,
                warning: Warning,
                success: CheckCircle,
                info: Info,
              };
              const severityColors = {
                error: 'text-red-600',
                warning: 'text-orange-600',
                success: 'text-green-600',
                info: 'text-blue-600',
              };

              const SeverityIcon = severityIcons[severity];

              return (
                <div key={event.audit_id} className="flex items-start space-x-3">
                  <SeverityIcon size={16} className={`mt-1 ${severityColors[severity]}`} />
                  <div className="flex-1 min-w-0">
                    <Text size="sm" additionalClass="text-gray-900 truncate">
                      {event.description}
                    </Text>
                    <Text size="xs" additionalClass="text-gray-500">
                      {new Date(event.performed_at).toLocaleString()} • {event.user?.first_name} {event.user?.last_name}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 
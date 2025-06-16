import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  ArrowUp,
  ArrowDown,
  Warning,
  CheckCircle,
  XCircle,
  Info,
  User,
  Calendar,
  Monitor,
  FileText,
} from "@phosphor-icons/react";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Store and Service
import { useEventLogState, useEventLogActions, EventLog } from "@/modules/eventLogs/store";
import { EventLogService } from "@/modules/eventLogs/api/eventLog.service";

interface EventLogsTableProps {
  showPagination?: boolean;
  emptyMessage?: string;
  className?: string;
  onEventSelect?: (event: EventLog) => void;
}

type SortField = 'performed_at' | 'action' | 'entity_type' | 'user' | 'description';
type SortDirection = 'asc' | 'desc';

const EventLogsTable: React.FC<EventLogsTableProps> = ({
  showPagination = true,
  emptyMessage,
  className = "",
  onEventSelect,
}) => {
  const { t } = useTranslation(['eventLogs', 'common']);
  
  // Store state
  const { events, pagination, loaders, selectedEventId } = useEventLogState();
  const { setSelectedEventId, setCurrentPage } = useEventLogActions();
  
  // Local state
  const [sortField, setSortField] = useState<SortField>('performed_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Loading states
  const isLoading = loaders['eventLogs/fetch-events'] || loaders['eventLogs/search-events'];

  // Sorted and paginated events
  const sortedEvents = useMemo(() => {
    if (!events.length) return [];
    
    return [...events].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortField) {
        case 'performed_at':
          valueA = new Date(a.performed_at).getTime();
          valueB = new Date(b.performed_at).getTime();
          break;
        case 'action':
          valueA = a.action.toLowerCase();
          valueB = b.action.toLowerCase();
          break;
        case 'entity_type':
          valueA = a.entity_type.toLowerCase();
          valueB = b.entity_type.toLowerCase();
          break;
        case 'user':
          valueA = a.user ? `${a.user.first_name} ${a.user.last_name}`.toLowerCase() : '';
          valueB = b.user ? `${b.user.first_name} ${b.user.last_name}`.toLowerCase() : '';
          break;
        case 'description':
          valueA = a.description.toLowerCase();
          valueB = b.description.toLowerCase();
          break;
        default:
          valueA = '';
          valueB = '';
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle event selection
  const handleEventSelect = (event: EventLog) => {
    setSelectedEventId(event.audit_id);
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  // Handle event expansion
  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get severity info
  const getSeverityInfo = (action: string) => {
    const severity = EventLogService.getEventSeverity(action);
    const severityConfig = {
      error: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        label: t('error'),
      },
      warning: {
        icon: Warning,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        label: t('warning'),
      },
      success: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        label: t('success'),
      },
      info: {
        icon: Info,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        label: t('info'),
      },
    };
    
    return severityConfig[severity];
  };

  // Format user name
  const formatUserName = (user: EventLog['user']): string => {
    if (!user) return t('unknown');
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Render sort header
  const SortHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <span className="text-blue-600">
            {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </span>
        )}
      </div>
    </th>
  );

  if (isLoading && events.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderSync loaderText={t('loading_events')} />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <Text size="lg" additionalClass="text-gray-500 mb-2">
          {emptyMessage || t('no_events_found')}
        </Text>
        <Text additionalClass="text-gray-400">
          {t('try_adjusting_filters')}
        </Text>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Results Summary */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <Text additionalClass="text-sm text-gray-600">
            {showPagination && pagination ? (
              <>
                {t('showing')} {((pagination.currentPage - 1) * pagination.limit) + 1}-
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} {t('of')} {pagination.totalCount} {t('events')}
              </>
            ) : (
              `${events.length} ${t('events')}`
            )}
          </Text>
          {isLoading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <Text size="sm" additionalClass="text-blue-600">{t('common:loading')}</Text>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <SortHeader field="performed_at">{t('timestamp')}</SortHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('severity')}
              </th>
              <SortHeader field="action">{t('action')}</SortHeader>
              <SortHeader field="user">{t('user')}</SortHeader>
              <SortHeader field="entity_type">{t('entity_type')}</SortHeader>
              <SortHeader field="description">{t('description')}</SortHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('details')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEvents.map((event) => {
              const severityInfo = getSeverityInfo(event.action);
              const SeverityIcon = severityInfo.icon;
              const isExpanded = expandedEvents.has(event.audit_id);
              const isSelected = selectedEventId === event.audit_id;

              return (
                <React.Fragment key={event.audit_id}>
                  <tr 
                    className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => handleEventSelect(event)}
                  >
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <div>
                          <Text size="sm" weight="font-medium" additionalClass="text-gray-900">
                            {formatTimestamp(event.performed_at).split(' ')[0]}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {formatTimestamp(event.performed_at).split(' ')[1]}
                          </Text>
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityInfo.bg} ${severityInfo.color} ${severityInfo.border} border`}>
                        <SeverityIcon size={12} className="mr-1" />
                        {severityInfo.label}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Text weight="font-medium" additionalClass="text-gray-900">
                        {EventLogService.translateAction(event.action, t)}
                      </Text>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <div>
                          <Text size="sm" weight="font-medium" additionalClass="text-gray-900">
                            {formatUserName(event.user)}
                          </Text>
                          {event.user?.email && (
                            <Text size="xs" additionalClass="text-gray-500">
                              {event.user.email}
                            </Text>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Entity Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Text additionalClass="text-gray-900">{event.entity_type}</Text>
                      <Text size="xs" additionalClass="text-gray-500">
                        ID: {event.entity_id}
                      </Text>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <Text additionalClass="text-gray-900 line-clamp-2">
                        {event.description}
                      </Text>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        onClick={() => toggleEventExpansion(event.audit_id)}
                        variant="action"
                        additionalClass="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} className="mr-1" />
                        {isExpanded ? t('hide') : t('view_details')}
                      </Button>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Column */}
                          <div className="space-y-3">
                            <div>
                              <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                                {t('performed_at')}
                              </Text>
                              <Text size="sm" additionalClass="text-gray-900">
                                {formatTimestamp(event.performed_at)}
                              </Text>
                            </div>
                            
                            {event.ip_address && (
                              <div>
                                <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                                  {t('ip_address')}
                                </Text>
                                <div className="flex items-center">
                                  <Monitor size={14} className="text-gray-400 mr-1" />
                                  <Text size="sm" additionalClass="text-gray-900">
                                    {event.ip_address}
                                  </Text>
                                </div>
                              </div>
                            )}

                            {event.session_id && (
                              <div>
                                <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                                  {t('session_id')}
                                </Text>
                                <Text size="sm" additionalClass="text-gray-900 font-mono">
                                  {event.session_id}
                                </Text>
                              </div>
                            )}
                          </div>

                          {/* Right Column */}
                          <div className="space-y-3">
                            {event.old_values && (
                              <div>
                                <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                                  {t('before')}
                                </Text>
                                <div className="bg-red-50 border border-red-200 rounded p-2">
                                  <Text size="xs" additionalClass="text-red-800 font-mono">
                                    {JSON.stringify(event.old_values, null, 2)}
                                  </Text>
                                </div>
                              </div>
                            )}

                            {event.new_values && (
                              <div>
                                <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                                  {t('after')}
                                </Text>
                                <div className="bg-green-50 border border-green-200 rounded p-2">
                                  <Text size="xs" additionalClass="text-green-800 font-mono">
                                    {JSON.stringify(event.new_values, null, 2)}
                                  </Text>
                                </div>
                              </div>
                            )}

                            {event.metadata && (
                              <div>
                                <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                                  {t('metadata')}
                                </Text>
                                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                  <Text size="xs" additionalClass="text-blue-800 font-mono">
                                    {JSON.stringify(event.metadata, null, 2)}
                                  </Text>
                                </div>
                              </div>
                            )}

                            {event.user_agent && (
                              <div>
                                <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                                  {t('user_agent')}
                                </Text>
                                <Text size="xs" additionalClass="text-gray-600 break-all">
                                  {event.user_agent}
                                </Text>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center">
            <Text additionalClass="text-sm text-gray-700">
              {t('page')} {pagination.currentPage} {t('of')} {pagination.totalPages}
            </Text>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="action"
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPrev}
              additionalClass="text-sm px-3 py-1"
            >
              {t('first')}
            </Button>
            <Button
              variant="action"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              additionalClass="text-sm px-3 py-1"
            >
              {t('previous')}
            </Button>
            <Button
              variant="action"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              additionalClass="text-sm px-3 py-1"
            >
              {t('next')}
            </Button>
            <Button
              variant="action"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNext}
              additionalClass="text-sm px-3 py-1"
            >
              {t('last')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventLogsTable;
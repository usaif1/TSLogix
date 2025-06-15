/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { 
  useEventLogStore,
  EventLog, 
  EventLogDashboard, 
  EventLogStatistics, 
  EventLogFilters,
  SearchCriteria 
} from "../store";

// ✅ Base URL for event logs API
const baseURL = '/eventlogs';

// ✅ Get store actions
const {
  setEvents,
  addEvents,
  setCurrentEvent,
  setDashboard,
  setStatistics,
  setFilters,
  setPagination,
  startLoader,
  stopLoader,
} = useEventLogStore.getState();

// ✅ Types for API responses
interface EventLogResponse {
  events: EventLog[];
  totalCount: number;
  hasMore: boolean;
}

interface DashboardResponse {
  summary: EventLogStatistics;
  recentEvents: EventLog[];
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: string; name: string; email: string; eventCount: number }>;
  topEntityTypes: Array<{ entityType: string; count: number }>;
  hourlyActivity: Array<{ hour: string; count: number }>;
}

// ✅ Event Logs Service
export const EventLogService = {
  
  // ✅ Fetch event logs with filters
  fetchEvents: async (filters: any = {}, limit = 50, offset = 0) => {
    try {
      startLoader("eventLogs/fetch-events");
      
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.actions?.length) {
        filters.actions.forEach((action: string) => params.append('actions', action));
      }
      if (filters.entityTypes?.length) {
        filters.entityTypes.forEach((type: string) => params.append('entityTypes', type));
      }
      if (filters.userIds?.length) {
        filters.userIds.forEach((id: string) => params.append('userIds', id));
      }
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      
      const response = await api.get(`${baseURL}?${params.toString()}`);
      
      // Check if response exists and has data
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
      
      const data: EventLogResponse = response.data.data || response.data;
      
      // Update store
      setEvents(data.events || []);
      
      // Update pagination
      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil((data.totalCount || 0) / limit);
      
      setPagination({
        currentPage,
        totalPages,
        totalCount: data.totalCount || 0,
        hasNext: data.hasMore || false,
        hasPrev: currentPage > 1,
        limit,
        offset,
      });
      
      return data;
    } catch (error: any) {
      console.error("Fetch events error:", error);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        console.error('Events request timed out');
        // Return empty data for timeout
        const emptyData: EventLogResponse = {
          events: [],
          totalCount: 0,
          hasMore: false,
        };
        setEvents([]);
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrev: false,
          limit,
          offset: 0,
        });
        return emptyData;
      }
      
      throw error;
    } finally {
      stopLoader("eventLogs/fetch-events");
    }
  },

  // ✅ Fetch dashboard data
  fetchDashboard: async (timeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
    try {
      startLoader("eventLogs/fetch-dashboard");
      
      const response = await api.get(`${baseURL}/dashboard?timeRange=${timeRange}`);
      
      // Check if response exists and has data
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
      
      const data: DashboardResponse = response.data.data || response.data;
      
      // Transform and set dashboard data
      const dashboard: EventLogDashboard = {
        summary: data.summary,
        recentEvents: data.recentEvents,
        topActions: data.topActions,
        topUsers: data.topUsers,
        topEntityTypes: data.topEntityTypes,
        hourlyActivity: data.hourlyActivity,
      };
      
      setDashboard(dashboard);
      return dashboard;
    } catch (error: any) {
      console.error("Fetch dashboard error:", error);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        console.error('Dashboard request timed out');
        // Return mock data or empty dashboard for timeout
        const mockDashboard: EventLogDashboard = {
          summary: {
            totalEvents: 0,
            errorEvents: 0,
            warningEvents: 0,
            infoEvents: 0,
            recentActivity: 0,
            timeRange: timeRange,
            dateFrom: new Date().toISOString(),
            dateTo: new Date().toISOString(),
          },
          recentEvents: [],
          topActions: [],
          topUsers: [],
          topEntityTypes: [],
          hourlyActivity: [],
        };
        setDashboard(mockDashboard);
        return mockDashboard;
      }
      
      throw error;
    } finally {
      stopLoader("eventLogs/fetch-dashboard");
    }
  },

  // ✅ Fetch event log statistics
  fetchStatistics: async (dateFrom?: string, dateTo?: string) => {
    try {
      startLoader("eventLogs/fetch-statistics");
      
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await api.get(`${baseURL}/statistics?${params.toString()}`);
      const data: EventLogStatistics = response.data.data || response.data;
      
      setStatistics(data);
      return data;
    } catch (error) {
      console.error("Fetch statistics error:", error);
      throw error;
    } finally {
      stopLoader("eventLogs/fetch-statistics");
    }
  },

  // ✅ Fetch available filters
  fetchFilters: async () => {
    try {
      startLoader("eventLogs/fetch-filters");
      
      const response = await api.get(`${baseURL}/filters`);
      const data: EventLogFilters = response.data.data || response.data;
      
      setFilters(data);
      return data;
    } catch (error) {
      console.error("Fetch filters error:", error);
      throw error;
    } finally {
      stopLoader("eventLogs/fetch-filters");
    }
  },

  // ✅ Advanced search for event logs
  searchEvents: async (searchCriteria: SearchCriteria, limit = 100, offset = 0) => {
    try {
      startLoader("eventLogs/search-events");
      
      const payload = {
        ...searchCriteria,
        limit,
        offset,
      };
      
      const response = await api.post(`${baseURL}/search`, payload);
      const data: EventLogResponse = response.data.data || response.data;
      
      // Update store
      setEvents(data.events);
      
      // Update pagination
      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(data.totalCount / limit);
      
      setPagination({
        currentPage,
        totalPages,
        totalCount: data.totalCount,
        hasNext: data.hasMore,
        hasPrev: currentPage > 1,
        limit,
        offset,
      });
      
      return data;
    } catch (error) {
      console.error("Search events error:", error);
      throw error;
    } finally {
      stopLoader("eventLogs/search-events");
    }
  },

  // ✅ Get specific event log by ID
  fetchEventById: async (logId: string) => {
    try {
      startLoader("eventLogs/fetch-event-detail");
      
      const response = await api.get(`${baseURL}/${logId}`);
      const data: EventLog = response.data.data || response.data;
      
      setCurrentEvent(data);
      return data;
    } catch (error) {
      console.error("Fetch event detail error:", error);
      throw error;
    } finally {
      stopLoader("eventLogs/fetch-event-detail");
    }
  },

  // ✅ Get entity-specific event logs
  fetchEntityEvents: async (entityType: string, entityId: string, limit = 50) => {
    try {
      startLoader("eventLogs/fetch-entity-events");
      
      const response = await api.get(`${baseURL}/entity/${entityType}/${entityId}?limit=${limit}`);
      const data: EventLog[] = response.data.data || response.data;
      
      return data;
    } catch (error) {
      console.error("Fetch entity events error:", error);
      throw error;
    } finally {
      stopLoader("eventLogs/fetch-entity-events");
    }
  },

  // ✅ Get user-specific event logs
  fetchUserEvents: async (userId: string, limit = 100) => {
    try {
      startLoader("eventLogs/fetch-user-events");
      
      const response = await api.get(`${baseURL}/user/${userId}?limit=${limit}`);
      const data: EventLog[] = response.data.data || response.data;
      
      return data;
    } catch (error) {
      console.error("Fetch user events error:", error);
      throw error;
    } finally {
      stopLoader("eventLogs/fetch-user-events");
    }
  },

  // ✅ Export event logs
  exportEvents: async (filters: any = {}, format: 'csv' | 'excel' = 'csv') => {
    try {
      startLoader("eventLogs/export-events");
      
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.actions?.length) {
        filters.actions.forEach((action: string) => params.append('actions', action));
      }
      if (filters.entityTypes?.length) {
        filters.entityTypes.forEach((type: string) => params.append('entityTypes', type));
      }
      if (filters.userIds?.length) {
        filters.userIds.forEach((id: string) => params.append('userIds', id));
      }
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      
      params.append('format', format);
      
      const response = await api.get(`${baseURL}/export?${params.toString()}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eventlogs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      console.error("Export events error:", error);
      throw error;
    } finally {
      stopLoader("eventLogs/export-events");
    }
  },

  // ✅ Load more events (for pagination)
  loadMoreEvents: async (currentEvents: EventLog[], filters: any = {}) => {
    try {
      const currentLength = currentEvents.length;
      const moreFilters = {
        ...filters,
        offset: currentLength,
        limit: 50,
      };
      
      const response = await EventLogService.fetchEvents(moreFilters);
      
      if (response.events.length > 0) {
        addEvents(response.events);
      }
      
      return response;
    } catch (error) {
      console.error("Load more events error:", error);
      throw error;
    }
  },

  // ✅ Refresh dashboard data
  refreshDashboard: async (timeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
    try {
      const [dashboard, filters] = await Promise.all([
        EventLogService.fetchDashboard(timeRange),
        EventLogService.fetchFilters(),
      ]);
      
      return { dashboard, filters };
    } catch (error) {
      console.error("Refresh dashboard error:", error);
      throw error;
    }
  },

  // ✅ Real-time updates (if needed)
  pollForUpdates: async (lastTimestamp: string) => {
    try {
      const response = await api.get(`${baseURL}?dateFrom=${lastTimestamp}&limit=10`);
      const data: EventLogResponse = response.data.data || response.data;
      
      if (data.events.length > 0) {
        // Prepend new events to existing ones
        const store = useEventLogStore.getState();
        const updatedEvents = [...data.events, ...store.events];
        setEvents(updatedEvents);
      }
      
      return data.events;
    } catch (error) {
      console.error("Poll for updates error:", error);
      throw error;
    }
  },

  // ✅ Get formatted event description
  getEventDescription: (event: EventLog): string => {
    const userName = event.user 
      ? `${event.user.first_name} ${event.user.last_name}`.trim()
      : 'Unknown User';
    
    const timestamp = new Date(event.performed_at).toLocaleString();
    
    return `${userName} performed ${event.action} on ${event.entity_type} (${event.entity_id}) at ${timestamp}`;
  },

  // ✅ Get event severity level
  getEventSeverity: (action: string): 'info' | 'warning' | 'error' | 'success' => {
    const errorActions = ['ERROR_OCCURRED', 'EXCEPTION_HANDLED', 'SYSTEM_ERROR_LOGGED', 'LOGIN_FAILED'];
    const warningActions = ['LOGIN_ATTEMPT', 'UNAUTHORIZED_ACCESS', 'DATA_VALIDATION_FAILED'];
    const successActions = ['LOGIN_SUCCESS', 'LOGOUT', 'RECORD_CREATED', 'RECORD_UPDATED'];
    
    if (errorActions.some(a => action.includes(a))) return 'error';
    if (warningActions.some(a => action.includes(a))) return 'warning';
    if (successActions.some(a => action.includes(a))) return 'success';
    
    return 'info';
  },

  // ✅ Format event changes
  formatEventChanges: (oldValues: any, newValues: any): string => {
    if (!oldValues && !newValues) return 'No changes recorded';
    
    const changes: string[] = [];
    
    if (newValues && typeof newValues === 'object') {
      Object.keys(newValues).forEach(key => {
        const oldValue = oldValues?.[key] || 'N/A';
        const newValue = newValues[key];
        
        if (oldValue !== newValue) {
          changes.push(`${key}: ${oldValue} → ${newValue}`);
        }
      });
    }
    
    return changes.length > 0 ? changes.join(', ') : 'No changes recorded';
  },
};

export default EventLogService; 
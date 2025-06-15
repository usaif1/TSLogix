/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

// ✅ Loader types for event logs operations
export type EventLogLoaderTypes =
  | "eventLogs/fetch-events"
  | "eventLogs/fetch-dashboard" 
  | "eventLogs/fetch-statistics"
  | "eventLogs/fetch-filters"
  | "eventLogs/export-events"
  | "eventLogs/search-events"
  | "eventLogs/fetch-event-detail"
  | "eventLogs/fetch-entity-events"
  | "eventLogs/fetch-user-events";

// ✅ Event log interfaces
export interface EventLogUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: {
    name: string;
  };
}

export interface EventLog {
  audit_id: string;
  user_id: string;
  performed_at: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  user?: EventLogUser;
}

// ✅ Dashboard statistics interfaces
export interface EventLogStatistics {
  totalEvents: number;
  errorEvents: number;
  warningEvents: number;
  infoEvents: number;
  recentActivity: number;
  timeRange: string;
  dateFrom: string;
  dateTo: string;
}

export interface TopAction {
  action: string;
  count: number;
}

export interface TopUser {
  userId: string;
  name: string;
  email: string;
  eventCount: number;
}

export interface TopEntityType {
  entityType: string;
  count: number;
}

export interface HourlyActivity {
  hour: string;
  count: number;
}

export interface EventLogDashboard {
  summary: EventLogStatistics;
  recentEvents: EventLog[];
  topActions: TopAction[];
  topUsers: TopUser[];
  topEntityTypes: TopEntityType[];
  hourlyActivity: HourlyActivity[];
}

// ✅ Filter interfaces
export interface FilterOption {
  value: string;
  label: string;
}

export interface EventLogFilters {
  actions: string[];
  entityTypes: string[];
  users: Array<{
    id: string;
    name: string;
    email: string;
    role?: string;
  }>;
}

export interface AppliedFilters {
  actions: FilterOption[];
  entityTypes: FilterOption[];
  users: FilterOption[];
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
  timeRange: '1h' | '24h' | '7d' | '30d' | 'custom';
}

// ✅ Search criteria interface
export interface SearchCriteria {
  actions?: string[];
  entityTypes?: string[];
  userIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  ipAddresses?: string[];
  searchText?: string;
  hasOldValues?: boolean;
  hasNewValues?: boolean;
  hasMetadata?: boolean;
}

// ✅ Pagination interface
export interface EventLogPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  offset: number;
}

// ✅ Main store interface
interface EventLogStore {
  // Data
  events: EventLog[];
  currentEvent: EventLog | null;
  dashboard: EventLogDashboard | null;
  statistics: EventLogStatistics | null;
  filters: EventLogFilters | null;
  
  // UI State
  appliedFilters: AppliedFilters;
  pagination: EventLogPagination;
  selectedEventId: string | null;
  
  // Loading states
  loaders: Record<EventLogLoaderTypes, boolean>;
  
  // View state
  currentView: 'dashboard' | 'events' | 'search';
  showAdvancedSearch: boolean;
  showFilters: boolean;
}

// ✅ Store actions interface
interface EventLogStoreActions {
  // Data setters
  setEvents: (events: EventLog[]) => void;
  addEvents: (events: EventLog[]) => void;
  setCurrentEvent: (event: EventLog | null) => void;
  setDashboard: (dashboard: EventLogDashboard) => void;
  setStatistics: (statistics: EventLogStatistics) => void;
  setFilters: (filters: EventLogFilters) => void;
  
  // Filter actions
  setAppliedFilters: (filters: Partial<AppliedFilters>) => void;
  clearFilters: () => void;
  addFilterAction: (action: FilterOption) => void;
  removeFilterAction: (actionValue: string) => void;
  addFilterUser: (user: FilterOption) => void;
  removeFilterUser: (userId: string) => void;
  addFilterEntityType: (entityType: FilterOption) => void;
  removeFilterEntityType: (entityValue: string) => void;
  
  // Pagination actions
  setPagination: (pagination: Partial<EventLogPagination>) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (limit: number) => void;
  
  // UI actions
  setCurrentView: (view: 'dashboard' | 'events' | 'search') => void;
  setShowAdvancedSearch: (show: boolean) => void;
  setShowFilters: (show: boolean) => void;
  setSelectedEventId: (id: string | null) => void;
  
  // Loader controls
  startLoader: (loader: EventLogLoaderTypes) => void;
  stopLoader: (loader: EventLogLoaderTypes) => void;
  
  // Reset actions
  resetEventLogStore: () => void;
  resetFilters: () => void;
  resetPagination: () => void;
}

// ✅ Default states
const defaultAppliedFilters: AppliedFilters = {
  actions: [],
  entityTypes: [],
  users: [],
  dateFrom: '',
  dateTo: '',
  searchTerm: '',
  timeRange: '24h',
};

const defaultPagination: EventLogPagination = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  hasNext: false,
  hasPrev: false,
  limit: 50,
  offset: 0,
};

const defaultLoaders: Record<EventLogLoaderTypes, boolean> = {
  "eventLogs/fetch-events": false,
  "eventLogs/fetch-dashboard": false,
  "eventLogs/fetch-statistics": false,
  "eventLogs/fetch-filters": false,
  "eventLogs/export-events": false,
  "eventLogs/search-events": false,
  "eventLogs/fetch-event-detail": false,
  "eventLogs/fetch-entity-events": false,
  "eventLogs/fetch-user-events": false,
};

// ✅ Create the store
export const useEventLogStore = create<EventLogStore & EventLogStoreActions>((set) => ({
  // Initial state
  events: [],
  currentEvent: null,
  dashboard: null,
  statistics: null,
  filters: null,
  appliedFilters: defaultAppliedFilters,
  pagination: defaultPagination,
  selectedEventId: null,
  loaders: defaultLoaders,
  currentView: 'dashboard',
  showAdvancedSearch: false,
  showFilters: true,

  // Data setters
  setEvents: (events) => set({ events }),
  
  addEvents: (newEvents) => set((state) => ({
    events: [...state.events, ...newEvents]
  })),
  
  setCurrentEvent: (event) => set({ currentEvent: event }),
  
  setDashboard: (dashboard) => set({ dashboard }),
  
  setStatistics: (statistics) => set({ statistics }),
  
  setFilters: (filters) => set({ filters }),

  // Filter actions
  setAppliedFilters: (filters) => set((state) => ({
    appliedFilters: { ...state.appliedFilters, ...filters }
  })),

  clearFilters: () => set({ appliedFilters: defaultAppliedFilters }),

  addFilterAction: (action) => set((state) => ({
    appliedFilters: {
      ...state.appliedFilters,
      actions: [...state.appliedFilters.actions, action]
    }
  })),

  removeFilterAction: (actionValue) => set((state) => ({
    appliedFilters: {
      ...state.appliedFilters,
      actions: state.appliedFilters.actions.filter(a => a.value !== actionValue)
    }
  })),

  addFilterUser: (user) => set((state) => ({
    appliedFilters: {
      ...state.appliedFilters,
      users: [...state.appliedFilters.users, user]
    }
  })),

  removeFilterUser: (userId) => set((state) => ({
    appliedFilters: {
      ...state.appliedFilters,
      users: state.appliedFilters.users.filter(u => u.value !== userId)
    }
  })),

  addFilterEntityType: (entityType) => set((state) => ({
    appliedFilters: {
      ...state.appliedFilters,
      entityTypes: [...state.appliedFilters.entityTypes, entityType]
    }
  })),

  removeFilterEntityType: (entityValue) => set((state) => ({
    appliedFilters: {
      ...state.appliedFilters,
      entityTypes: state.appliedFilters.entityTypes.filter(e => e.value !== entityValue)
    }
  })),

  // Pagination actions
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  })),

  setCurrentPage: (page) => set((state) => ({
    pagination: { 
      ...state.pagination, 
      currentPage: page,
      offset: (page - 1) * state.pagination.limit
    }
  })),

  setPageSize: (limit) => set((state) => ({
    pagination: { 
      ...state.pagination, 
      limit,
      offset: (state.pagination.currentPage - 1) * limit
    }
  })),

  // UI actions
  setCurrentView: (view) => set({ currentView: view }),
  
  setShowAdvancedSearch: (show) => set({ showAdvancedSearch: show }),
  
  setShowFilters: (show) => set({ showFilters: show }),
  
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  // Loader controls
  startLoader: (loader) => set((state) => ({
    loaders: { ...state.loaders, [loader]: true }
  })),

  stopLoader: (loader) => set((state) => ({
    loaders: { ...state.loaders, [loader]: false }
  })),

  // Reset actions
  resetEventLogStore: () => set({
    events: [],
    currentEvent: null,
    dashboard: null,
    statistics: null,
    filters: null,
    appliedFilters: defaultAppliedFilters,
    pagination: defaultPagination,
    selectedEventId: null,
    loaders: defaultLoaders,
    currentView: 'dashboard',
    showAdvancedSearch: false,
    showFilters: true,
  }),

  resetFilters: () => set({ appliedFilters: defaultAppliedFilters }),
  
  resetPagination: () => set({ pagination: defaultPagination }),
}));

// ✅ Export convenience hooks
export const useEventLogState = () => {
  const store = useEventLogStore();
  return {
    events: store.events,
    currentEvent: store.currentEvent,
    dashboard: store.dashboard,
    statistics: store.statistics,
    filters: store.filters,
    appliedFilters: store.appliedFilters,
    pagination: store.pagination,
    selectedEventId: store.selectedEventId,
    loaders: store.loaders,
    currentView: store.currentView,
    showAdvancedSearch: store.showAdvancedSearch,
    showFilters: store.showFilters,
  };
};

export const useEventLogActions = () => {
  const store = useEventLogStore();
  return {
    setEvents: store.setEvents,
    addEvents: store.addEvents,
    setCurrentEvent: store.setCurrentEvent,
    setDashboard: store.setDashboard,
    setStatistics: store.setStatistics,
    setFilters: store.setFilters,
    setAppliedFilters: store.setAppliedFilters,
    clearFilters: store.clearFilters,
    addFilterAction: store.addFilterAction,
    removeFilterAction: store.removeFilterAction,
    addFilterUser: store.addFilterUser,
    removeFilterUser: store.removeFilterUser,
    addFilterEntityType: store.addFilterEntityType,
    removeFilterEntityType: store.removeFilterEntityType,
    setPagination: store.setPagination,
    setCurrentPage: store.setCurrentPage,
    setPageSize: store.setPageSize,
    setCurrentView: store.setCurrentView,
    setShowAdvancedSearch: store.setShowAdvancedSearch,
    setShowFilters: store.setShowFilters,
    setSelectedEventId: store.setSelectedEventId,
    startLoader: store.startLoader,
    stopLoader: store.stopLoader,
    resetEventLogStore: store.resetEventLogStore,
    resetFilters: store.resetFilters,
    resetPagination: store.resetPagination,
  };
}; 
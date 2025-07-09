import { create } from "zustand";
import createSelectors from "@/utils/selectors";
import { ClientFormFields, AvailableCell } from "@/modules/client/api/client.service";

export type ClientLoaderTypes =
  | "clients/fetch-clients"
  | "clients/fetch-client"
  | "clients/create-client"
  | "clients/update-client"
  | "clients/delete-client"
  | "clients/fetch-form-fields"
  | "clients/fetch-available-cells"
  | "clients/fetch-available-cells-with-assignments"
  | "clients/fetch-warehouses"
  | "clients/assign-cell"
  | "clients/remove-cell-assignment";

export interface Client {
  client_id: string;
  client_type: "JURIDICO" | "NATURAL";
  
  // Juridico client fields (formerly Commercial)
  company_name?: string;
  company_type?: string;
  establishment_type?: string;
  ruc?: string;
  
  // Natural client fields (formerly Individual)
  first_names?: string;
  last_name?: string;
  mothers_last_name?: string;
  individual_id?: string;
  date_of_birth?: string;
  
  // Common fields
  email: string;
  address: string;
  phone: string;
  cell_phone: string;
  active_state_id: string;
  created_at: string;
  updated_at: string;
  
  // Client users array
  client_users?: Array<{
    client_user_id?: string;
    name: string;
    created_at?: string;
  }>;
  
  // Relations
  active_state?: {
    name: string;
  };
  cellAssignments?: Array<{
    assignment_id: string;
    cell: {
      id: string;
      row: string;
      bay: number;
      position: number;
    };
    warehouse: {
      warehouse_id: string;
      name: string;
    };
    assigned_at: string;
    assigned_by: string;
    assignedBy: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    is_active: boolean;
  }>;
  departureOrders?: Array<{
    departure_order_id: string;
    departure_order_no: string;
    order_status: string;
    created_at?: string;
  }>;
  
  // Counts
  _count?: {
    cellAssignments: number;
    departureOrders: number;
  };
}

export interface ClientPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ClientFilters {
  client_type: { value: string; label: string } | null;
  search: string;
  page: number;
  limit: number;
}

export interface CellAssignmentState {
  selectedCells: AvailableCell[];
  observations: string;
  warehouseId: string | null;
}

interface ClientStore {
  // Data
  clients: Client[];
  currentClient: Client | null;
  clientFormFields: ClientFormFields | null;
  availableCells: AvailableCell[];
  pagination: ClientPagination | null;
  
  // Filters and search
  filters: ClientFilters;
  
  // Cell assignment state
  cellAssignment: CellAssignmentState;
  
  // Loading states
  loaders: Record<ClientLoaderTypes, boolean>;
}

interface ClientStoreActions {
  // Data setters
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (clientId: string, client: Partial<Client>) => void;
  removeClient: (clientId: string) => void;
  setCurrentClient: (client: Client | null) => void;
  setClientFormFields: (fields: ClientFormFields) => void;
  setAvailableCells: (cells: AvailableCell[]) => void;
  setPagination: (pagination: ClientPagination) => void;
  
  // Filters
  setFilters: (filters: Partial<ClientFilters>) => void;
  resetFilters: () => void;
  
  // Cell assignment
  setCellAssignment: (assignment: Partial<CellAssignmentState>) => void;
  resetCellAssignment: () => void;
  
  // Loader controls
  startLoader: (loader: ClientLoaderTypes) => void;
  stopLoader: (loader: ClientLoaderTypes) => void;
  
  // Reset store
  resetClientStore: () => void;
}

const clientInitialState: ClientStore = {
  // Data
  clients: [],
  currentClient: null,
  clientFormFields: null,
  availableCells: [],
  pagination: null,
  
  // Filters and search
  filters: {
    client_type: null,
    search: "",
    page: 1,
    limit: 10,
  },
  
  // Cell assignment state
  cellAssignment: {
    selectedCells: [],
    observations: "",
    warehouseId: null,
  },
  
  // Loading states
  loaders: {
    "clients/fetch-clients": false,
    "clients/fetch-client": false,
    "clients/create-client": false,
    "clients/update-client": false,
    "clients/delete-client": false,
    "clients/fetch-form-fields": false,
    "clients/fetch-available-cells": false,
    "clients/fetch-available-cells-with-assignments": false,
    "clients/fetch-warehouses": false,
    "clients/assign-cell": false,
    "clients/remove-cell-assignment": false,
  },
};

const clientStore = create<ClientStore & ClientStoreActions>((set) => ({
  ...clientInitialState,

  // Data setters
  setClients: (clients: Client[]) => set({ clients }),
  
  addClient: (client: Client) => set((state) => ({
    clients: [...state.clients, client]
  })),
  
  updateClient: (clientId: string, updatedClient: Partial<Client>) => set((state) => ({
    clients: state.clients.map((client) =>
      client.client_id === clientId ? { ...client, ...updatedClient } : client
    ),
    currentClient: state.currentClient?.client_id === clientId 
      ? { ...state.currentClient, ...updatedClient }
      : state.currentClient
  })),
  
  removeClient: (clientId: string) => set((state) => ({
    clients: state.clients.filter((client) => client.client_id !== clientId),
    currentClient: state.currentClient?.client_id === clientId ? null : state.currentClient
  })),
  
  setCurrentClient: (client: Client | null) => set({ currentClient: client }),
  
  setClientFormFields: (fields: ClientFormFields) => set({ clientFormFields: fields }),
  
  setAvailableCells: (cells: AvailableCell[]) => set({ availableCells: cells }),
  
  setPagination: (pagination: ClientPagination) => set({ pagination }),

  // Filters
  setFilters: (newFilters: Partial<ClientFilters>) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  resetFilters: () => set((state) => ({
    filters: {
      client_type: null,
      search: "",
      page: 1,
      limit: state.filters.limit,
    }
  })),

  // Cell assignment
  setCellAssignment: (assignment: Partial<CellAssignmentState>) => set((state) => ({
    cellAssignment: { ...state.cellAssignment, ...assignment }
  })),
  
  resetCellAssignment: () => set({
    cellAssignment: {
      selectedCells: [],
      observations: "",
      warehouseId: null,
    }
  }),

  // Loader controls
  startLoader: (loader: ClientLoaderTypes) => set((state) => ({
    loaders: { ...state.loaders, [loader]: true }
  })),
  
  stopLoader: (loader: ClientLoaderTypes) => set((state) => ({
    loaders: { ...state.loaders, [loader]: false }
  })),

  // Reset store
  resetClientStore: () => set(clientInitialState),
}));

export const ClientStore = createSelectors(clientStore);
export default ClientStore; 
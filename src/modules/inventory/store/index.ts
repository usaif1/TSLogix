/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import createSelectors from "@/utils/selectors";

// ✅ NEW: Quality Control Status Enum
export enum QualityControlStatus {
  CUARENTENA = "CUARENTENA",           // Quarantine (initial state)
  APROBADO = "APROBADO",               // Approved (ready for departure)
  DEVOLUCIONES = "DEVOLUCIONES",       // Returns
  CONTRAMUESTRAS = "CONTRAMUESTRAS",   // Samples
  RECHAZADOS = "RECHAZADOS"            // Rejected
}

// ✅ NEW: System Action Enum
export enum SystemAction {
  ENTRY_ORDER_CREATED = "ENTRY_ORDER_CREATED",
  QUALITY_STATUS_CHANGED = "QUALITY_STATUS_CHANGED",
  INVENTORY_ALLOCATED = "INVENTORY_ALLOCATED",
  INVENTORY_MOVED = "INVENTORY_MOVED",
  AUDIT_LOG_CREATED = "AUDIT_LOG_CREATED"
}

type AssignCellLoader = "inventoryLogs/assign-cell";
export type InventoryLogLoaderTypes =
  | "inventoryLogs/fetch-logs"
  | "inventoryLogs/fetch-log"
  | "inventoryLogs/create-log"
  | "inventoryLogs/update-log"
  | "inventoryLogs/delete-log"
  | "inventoryLogs/add-inventory"
  | "inventoryLogs/fetch-warehouses"
  | "inventoryLogs/fetch-cells"
  | "inventoryLogs/fetch-products-ready"
  | "inventoryLogs/assign-product-to-cell"
  | "inventoryLogs/fetch-inventory-summary"
  | "inventoryLogs/fetch-quarantine-inventory"
  | "inventoryLogs/quality-transition"
  | "inventoryLogs/fetch-available-for-departure"
  | "inventoryLogs/fetch-audit-trail"
  | AssignCellLoader;

type InventoryLog = any;
type Warehouse = any;
type Cell = any;

// ✅ Updated interfaces to match backend structure

export interface ProductReadyForAssignment {
  entry_order_product_id: string;
  serial_number: string;
  product_code: string;
  lot_series: string;
  inventory_quantity: number;
  package_quantity: number;
  quantity_pallets?: number;
  presentation: string;
  weight_kg: number;
  volume_m3?: number;
  insured_value?: number;
  temperature_range?: string;
  
  // ✅ New fields from backend
  allocated_quantity: number;
  remaining_quantity: number;
  remaining_packaging_qty: number;
  remaining_weight: number;
  
  product: {
    product_id: string;
    product_code: string;
    name: string;
  };
  
  supplier: {
    supplier_id: string;
    name: string;
  };
  
  // ✅ FIXED: Add supplier_name field
  supplier_name?: string;
  
  entry_order: {
    entry_order_id: string;
    entry_order_no: string;
    registration_date: string;
  };
  
  cellAssignments: Array<{
    assignment_id: string;
    packaging_quantity: number;
    weight: number;
    cell: {
      warehouse: { name: string };
      row: string;
      bay: number;
      position: number;
    };
  }>;
  
  packaging_type: string;
}

export interface InventorySummary {
  inventory_id: string;
  current_quantity: number;
  current_package_quantity: number;
  current_weight: number;
  current_volume?: number;
  status: string;
  product_status?: string;
  status_code?: number;
  quality_status?: QualityControlStatus; // ✅ NEW
  
  product: {
    product_id: string;
    product_code: string;
    name: string;
  };
  
  cell: {
    id: string;
    row: string;
    bay: number;
    position: number;
    cellReference: string;
  };
  
  warehouse: {
    warehouse_id: string;
    name: string;
  };
  
  allocation?: {
    allocation_id: string;
    guide_number?: string;
    observations?: string;
    allocated_at: string;
    allocated_by?: string; // ✅ NEW
    last_modified_by?: string; // ✅ NEW
    last_modified_at?: string; // ✅ NEW
    entry_order_no?: string;
  };
}

// ✅ NEW: Quality Control Transition Interface
export interface QualityControlTransition {
  transition_id: string;
  allocation_id?: string;
  inventory_id?: string;
  from_status?: QualityControlStatus;
  to_status: QualityControlStatus;
  quantity_moved: number;
  package_quantity_moved: number;
  weight_moved: number;
  volume_moved?: number;
  from_cell_id?: string;
  to_cell_id?: string;
  performed_by: string;
  performed_at: string;
  reason?: string;
  notes?: string;
}

// ✅ NEW: System Audit Log Interface
export interface SystemAuditLog {
  audit_id: string;
  user_id: string;
  performed_at: string;
  action: SystemAction;
  entity_type: string;
  entity_id: string;
  description: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  ip_address?: string;
  session_id?: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// ✅ NEW: Quarantine Inventory Interface
export interface QuarantineInventoryItem {
  allocation_id: string;
  inventory_quantity: number;
  package_quantity: number;
  weight_kg: number;
  volume_m3?: number;
  product_status: string;
  quality_status: QualityControlStatus;
  allocated_at: string;
  allocated_by: string;
  
  entry_order_product: {
    product: {
      product_id: string;
      product_code: string;
      name: string;
    };
    entry_order: {
      entry_order_no: string;
    };
  };
  
  cell: {
    id: string;
    row: string;
    bay: number;
    position: number;
    warehouse: {
      warehouse_id: string;
      name: string;
    };
  };
  
  inventory: Array<{
    inventory_id: string;
    status: string;
    current_quantity: number;
  }>;
  
  allocator: {
    first_name: string;
    last_name: string;
  };
}

export interface InventoryLogStore {
  inventoryLogs: InventoryLog[];
  currentInventoryLog: InventoryLog | null;
  loaders: Record<InventoryLogLoaderTypes, boolean>;
  warehouses: Warehouse[];
  cells: Cell[];
  // Products ready for assignment (no warehouse constraint)
  productsReadyForAssignment: ProductReadyForAssignment[];
  // Inventory summary
  inventorySummary: InventorySummary[];
  // Selected product for assignment
  selectedProductForAssignment: ProductReadyForAssignment | null;
  // ✅ NEW: Quarantine inventory
  quarantineInventory: QuarantineInventoryItem[];
  // ✅ NEW: Available inventory for departure
  availableInventoryForDeparture: InventorySummary[];
  // ✅ NEW: Audit trail
  auditTrail: SystemAuditLog[];
  
  // ✅ NEW: Quarantine Management State
  quarantineFilters: {
    selectedWarehouse: { value: string; label: string } | null;
    searchTerm: string;
    selectedStatus: QualityControlStatus | null;
  };
  quarantineSelection: {
    selectedItems: string[];
    isAllSelected: boolean;
  };
  quarantineTransition: {
    showModal: boolean;
    transitionStatus: QualityControlStatus | null;
    reason: string;
    notes: string;
    quantityToMove: number;
    packageQuantityToMove: number;
    weightToMove: number;
    volumeToMove: number;
    selectedItem: QuarantineInventoryItem | null;
  };
  
  // ✅ NEW: Available Inventory State
  availableFilters: {
    selectedWarehouse: { value: string; label: string } | null;
    searchTerm: string;
  };
}

export interface InventoryLogStoreActions {
  setInventoryLogs: (logs: InventoryLog[]) => void;
  setCurrentInventoryLog: (log: InventoryLog | null) => void;
  addInventoryLog: (log: InventoryLog) => void;
  addInventoryLogs: (logs: InventoryLog[]) => void;
  updateInventoryLog: (id: string, data: InventoryLog) => void;
  deleteInventoryLog: (id: string) => void;
  startLoader: (loader: InventoryLogLoaderTypes) => void;
  stopLoader: (loader: InventoryLogLoaderTypes) => void;
  resetInventoryLogStore: () => void;
  setWarehouses: (list: Warehouse[]) => void;
  setCells: (list: Cell[]) => void;
  setProductsReadyForAssignment: (products: ProductReadyForAssignment[]) => void;
  setInventorySummary: (summary: InventorySummary[]) => void;
  setSelectedProductForAssignment: (product: ProductReadyForAssignment | null) => void;
  // ✅ NEW: Quarantine and quality control actions
  setQuarantineInventory: (inventory: QuarantineInventoryItem[]) => void;
  setAvailableInventoryForDeparture: (inventory: InventorySummary[]) => void;
  setAuditTrail: (logs: SystemAuditLog[]) => void;
  
  // ✅ NEW: Quarantine Management Actions
  setQuarantineFilters: (filters: Partial<{ selectedWarehouse: { value: string; label: string } | null; searchTerm: string; selectedStatus: QualityControlStatus | null }>) => void;
  setQuarantineSelection: (selection: Partial<{ selectedItems: string[]; isAllSelected: boolean }>) => void;
  setQuarantineTransition: (transition: Partial<{ showModal: boolean; transitionStatus: QualityControlStatus | null; reason: string; notes: string; quantityToMove: number; packageQuantityToMove: number; weightToMove: number; volumeToMove: number; selectedItem: QuarantineInventoryItem | null }>) => void;
  resetQuarantineSelection: () => void;
  toggleQuarantineItemSelection: (itemId: string) => void;
  toggleAllQuarantineSelection: () => void;
  
  // ✅ NEW: Available Inventory Actions
  setAvailableFilters: (filters: Partial<{ selectedWarehouse: { value: string; label: string } | null; searchTerm: string }>) => void;
}

const initialLoaders: Record<InventoryLogLoaderTypes, boolean> = {
  "inventoryLogs/fetch-logs": false,
  "inventoryLogs/fetch-log": false,
  "inventoryLogs/create-log": false,
  "inventoryLogs/update-log": false,
  "inventoryLogs/delete-log": false,
  "inventoryLogs/add-inventory": false,
  "inventoryLogs/fetch-warehouses": false,
  "inventoryLogs/fetch-cells": false,
  "inventoryLogs/fetch-products-ready": false,
  "inventoryLogs/assign-product-to-cell": false,
  "inventoryLogs/fetch-inventory-summary": false,
  "inventoryLogs/assign-cell": false,
  "inventoryLogs/fetch-quarantine-inventory": false,
  "inventoryLogs/quality-transition": false,
  "inventoryLogs/fetch-available-for-departure": false,
  "inventoryLogs/fetch-audit-trail": false,
};

const initialState: InventoryLogStore = {
  inventoryLogs: [],
  currentInventoryLog: null,
  loaders: initialLoaders,
  warehouses: [],
  cells: [],
  productsReadyForAssignment: [],
  inventorySummary: [],
  selectedProductForAssignment: null,
  quarantineInventory: [],
  availableInventoryForDeparture: [],
  auditTrail: [],
  
  // ✅ NEW: Quarantine Management State
  quarantineFilters: {
    selectedWarehouse: null,
    searchTerm: '',
    selectedStatus: null,
  },
  quarantineSelection: {
    selectedItems: [],
    isAllSelected: false,
  },
  quarantineTransition: {
    showModal: false,
    transitionStatus: null,
    reason: '',
    notes: '',
    quantityToMove: 0,
    packageQuantityToMove: 0,
    weightToMove: 0,
    volumeToMove: 0,
    selectedItem: null,
  },
  
  // ✅ NEW: Available Inventory State
  availableFilters: {
    selectedWarehouse: null,
    searchTerm: '',
  },
};

export const useInventoryLogStore = create<
  InventoryLogStore & InventoryLogStoreActions
>((set) => ({
  ...initialState,

  // Existing setters
  setInventoryLogs: (logs) => set({ inventoryLogs: logs }),
  setCurrentInventoryLog: (log) => set({ currentInventoryLog: log }),

  // Single CRUD
  addInventoryLog: (log) =>
    set((state) => ({ inventoryLogs: [...state.inventoryLogs, log] })),
  // Bulk insert
  addInventoryLogs: (logs) =>
    set((state) => ({ inventoryLogs: [...state.inventoryLogs, ...logs] })),
  updateInventoryLog: (id, data) =>
    set((state) => ({
      inventoryLogs: state.inventoryLogs.map((l) =>
        (l as any).log_id === id ? { ...l, ...data } : l
      ),
    })),
  deleteInventoryLog: (id) =>
    set((state) => ({
      inventoryLogs: state.inventoryLogs.filter(
        (l) => (l as any).log_id !== id
      ),
    })),

  setWarehouses: (warehouses) => set({ warehouses }),
  setCells: (cells) => set({ cells }),

  // Setters for existing features
  setProductsReadyForAssignment: (products) => set({ productsReadyForAssignment: products }),
  setInventorySummary: (summary) => set({ inventorySummary: summary }),
  setSelectedProductForAssignment: (product) => set({ selectedProductForAssignment: product }),

  // ✅ NEW: Setters for quarantine and quality control features
  setQuarantineInventory: (inventory) => set({ quarantineInventory: inventory }),
  setAvailableInventoryForDeparture: (inventory) => set({ availableInventoryForDeparture: inventory }),
  setAuditTrail: (logs) => set({ auditTrail: logs }),

  // ✅ NEW: Quarantine Management Actions
  setQuarantineFilters: (filters) =>
    set((state) => ({
      quarantineFilters: { ...state.quarantineFilters, ...filters }
    })),
  setQuarantineSelection: (selection) =>
    set((state) => ({
      quarantineSelection: { ...state.quarantineSelection, ...selection }
    })),
  setQuarantineTransition: (transition) =>
    set((state) => ({
      quarantineTransition: { ...state.quarantineTransition, ...transition }
    })),
  resetQuarantineSelection: () =>
    set({ quarantineSelection: { selectedItems: [], isAllSelected: false } }),
  toggleQuarantineItemSelection: (itemId) =>
    set((state) => {
      const selectedItems = state.quarantineSelection.selectedItems.includes(itemId)
        ? state.quarantineSelection.selectedItems.filter(id => id !== itemId)
        : [...state.quarantineSelection.selectedItems, itemId];
      
      return {
        quarantineSelection: {
          selectedItems,
          isAllSelected: selectedItems.length === state.quarantineInventory.length && state.quarantineInventory.length > 0
        }
      };
    }),
  toggleAllQuarantineSelection: () =>
    set((state) => {
      const isAllSelected = !state.quarantineSelection.isAllSelected;
      return {
        quarantineSelection: {
          selectedItems: isAllSelected ? state.quarantineInventory.map(item => item.allocation_id) : [],
          isAllSelected
        }
      };
    }),

  // ✅ NEW: Available Inventory Actions
  setAvailableFilters: (filters) =>
    set((state) => ({
      availableFilters: { ...state.availableFilters, ...filters }
    })),

  // Loader controls
  startLoader: (loader) =>
    set((state) => ({ loaders: { ...state.loaders, [loader]: true } })),
  stopLoader: (loader) =>
    set((state) => ({ loaders: { ...state.loaders, [loader]: false } })),

  resetInventoryLogStore: () => set(initialState),
}));

export default createSelectors(useInventoryLogStore);
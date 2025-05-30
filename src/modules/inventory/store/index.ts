/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import createSelectors from "@/utils/selectors";

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
  | AssignCellLoader;

type InventoryLog = any;
type Warehouse = any;
type Cell = any;

// UPDATED: Product ready for assignment interface (no warehouse constraint)
export interface ProductReadyForAssignment {
  entry_order_product_id: string;
  remaining_packaging_qty: number;
  remaining_weight: number;
  packaging_type: string;
  packaging_status: string;
  packaging_code: string;
  expiration_date: string | null;
  product: {
    product_id: string;
    product_code: string;
    name: string;
  };
  entry_order: {
    entry_order_id: string;
    entry_order_no: string;
    supplier: {
      name: string;
    };
  };
  cellAssignments: Array<{
    assignment_id: string;
    packaging_quantity: number;
    weight: number;
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
  }>;
}

// Inventory summary interface
export interface InventorySummary {
  inventory_id: string;
  product_id: string;
  warehouse_id: string;
  cell_id: string;
  quantity: number;
  packaging_quantity: number;
  weight: number;
  volume: number | null;
  status: string;
  expiration_date: string | null;
  packaging_type: string;
  packaging_status: string;
  packaging_code: string;
  product: {
    product_id: string;
    product_code: string;
    name: string;
  };
  entryOrderProduct: {
    entry_order_product_id: string;
    packaging_type: string;
    packaging_status: string;
    audit_status: string;
    entry_order: {
      entry_order_no: string;
    };
  };
  warehouse: {
    warehouse_id: string;
    name: string;
  };
  warehouseCell: {
    id: string;
    row: string;
    bay: number;
    position: number;
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

  // Setters for new features
  setProductsReadyForAssignment: (products) => set({ productsReadyForAssignment: products }),
  setInventorySummary: (summary) => set({ inventorySummary: summary }),
  setSelectedProductForAssignment: (product) => set({ selectedProductForAssignment: product }),

  // Loader controls
  startLoader: (loader) =>
    set((state) => ({ loaders: { ...state.loaders, [loader]: true } })),
  stopLoader: (loader) =>
    set((state) => ({ loaders: { ...state.loaders, [loader]: false } })),

  resetInventoryLogStore: () => set(initialState),
}));

export default createSelectors(useInventoryLogStore);
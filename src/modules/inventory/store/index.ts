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
  | AssignCellLoader;

type InventoryLog = any;
type Warehouse = any;
type Cell = any;

export interface InventoryLogStore {
  inventoryLogs: InventoryLog[];
  currentInventoryLog: InventoryLog | null;
  loaders: Record<InventoryLogLoaderTypes, boolean>;
  warehouses: Warehouse[];
  cells: Cell[];
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
  "inventoryLogs/assign-cell": false,
};

const initialState: InventoryLogStore = {
  inventoryLogs: [],
  currentInventoryLog: null,
  loaders: initialLoaders,
  warehouses: [],
  cells: [],
};

export const useInventoryLogStore = create<
  InventoryLogStore & InventoryLogStoreActions
>((set) => ({
  ...initialState,

  // Setters
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

  // Loader controls
  startLoader: (loader) =>
    set((state) => ({ loaders: { ...state.loaders, [loader]: true } })),
  stopLoader: (loader) =>
    set((state) => ({ loaders: { ...state.loaders, [loader]: false } })),

  resetInventoryLogStore: () => set(initialState),
}));

export default createSelectors(useInventoryLogStore);

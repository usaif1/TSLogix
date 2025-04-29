/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import createSelectors from "@/utils/selectors";

// Loader keys for inventory logs
export type InventoryLogLoaderTypes =
  | "inventoryLogs/fetch-logs"
  | "inventoryLogs/fetch-log"
  | "inventoryLogs/create-log"
  | "inventoryLogs/update-log"
  | "inventoryLogs/delete-log";

// InventoryLog type (replace with actual interface)
type InventoryLog = any;

// Store state
export interface InventoryLogStore {
  inventoryLogs: InventoryLog[];
  currentInventoryLog: InventoryLog | null;
  loaders: Record<InventoryLogLoaderTypes, boolean>;
}

// Store actions
export interface InventoryLogStoreActions {
  setInventoryLogs: (logs: InventoryLog[]) => void;
  setCurrentInventoryLog: (log: InventoryLog | null) => void;
  addInventoryLog: (log: InventoryLog) => void;
  updateInventoryLog: (id: string, data: InventoryLog) => void;
  deleteInventoryLog: (id: string) => void;
  startLoader: (loader: InventoryLogLoaderTypes) => void;
  stopLoader: (loader: InventoryLogLoaderTypes) => void;
  resetInventoryLogStore: () => void;
}

const initialLoaders: Record<InventoryLogLoaderTypes, boolean> = {
  "inventoryLogs/fetch-logs": false,
  "inventoryLogs/fetch-log": false,
  "inventoryLogs/create-log": false,
  "inventoryLogs/update-log": false,
  "inventoryLogs/delete-log": false,
};

const initialState: InventoryLogStore = {
  inventoryLogs: [],
  currentInventoryLog: null,
  loaders: initialLoaders,
};

export const useInventoryLogStore = create<
  InventoryLogStore & InventoryLogStoreActions
>((set) => ({
  ...initialState,

  // Setters
  setInventoryLogs: (logs) => set({ inventoryLogs: logs }),
  setCurrentInventoryLog: (log) => set({ currentInventoryLog: log }),

  // CRUD operations
  addInventoryLog: (log) =>
    set((state) => ({ inventoryLogs: [...state.inventoryLogs, log] })),
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

  // Loader controls
  startLoader: (loader) =>
    set((state) => ({
      loaders: { ...state.loaders, [loader]: true },
    })),
  stopLoader: (loader) =>
    set((state) => ({
      loaders: { ...state.loaders, [loader]: false },
    })),

  // Reset
  resetInventoryLogStore: () => set(initialState),
}));

export default createSelectors(useInventoryLogStore);

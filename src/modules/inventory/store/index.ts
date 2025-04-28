/* eslint-disable @typescript-eslint/no-explicit-any */
import createSelectors from "@/utils/selectors";
import { create } from "zustand";



type Inventory = any;

// Loader keys matching service
type LoaderKey =
  | "inventory/fetch-all"
  | "inventory/fetch-one"
  | "inventory/create"
  | "inventory/update"
  | "inventory/delete"
  | "inventory/audit";

interface InventoryStoreState {
  inventories: Inventory[];
  selectedInventory: Inventory | null;
  loaders: Record<LoaderKey, boolean>;
}

interface InventoryStoreActions {
  setInventories: (data: Inventory[]) => void;
  setSelectedInventory: (data: Inventory) => void;
  resetInventoryStore: () => void;
  startLoader: (key: LoaderKey) => void;
  stopLoader: (key: LoaderKey) => void;
}

const initialState: InventoryStoreState = {
  inventories: [],
  selectedInventory: null,
  loaders: {
    "inventory/fetch-all": false,
    "inventory/fetch-one": false,
    "inventory/create": false,
    "inventory/update": false,
    "inventory/delete": false,
    "inventory/audit": false,
  },
};

export const InventoryStore = create<InventoryStoreState & InventoryStoreActions>(
  (set) => ({
    ...initialState,
    setInventories: (data) => set({ inventories: data }),
    setSelectedInventory: (data) => set({ selectedInventory: data }),
    resetInventoryStore: () => set(initialState),
    startLoader: (key) =>
      set((state) => ({ loaders: { ...state.loaders, [key]: true } })),
    stopLoader: (key) =>
      set((state) => ({ loaders: { ...state.loaders, [key]: false } })),
  })
);

export default createSelectors(InventoryStore);
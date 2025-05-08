import { create } from "zustand";
import createSelectors from "@/utils/selectors";

export type LoaderTypes =
  | "warehouses/fetch-warehouses"
  | "cells/fetch-cells"
  | "cells/allocate-pallets";

export type WarehouseCell = {
  id: string;
  warehouse_id: string;
  row: string;
  bay: number;
  position: number;
  kind: string;
  status: string;
  capacity: number;
  currentUsage: number;
};

export type WarehouseMeta = {
  warehouse_id: string;
  name: string;
};

type WarehouseCellStore = {
  warehouses: WarehouseMeta[];
  cells: WarehouseCell[];
  loaders: Record<LoaderTypes, boolean>;
};

type WarehouseCellStoreActions = {
  setWarehouses: (list: WarehouseMeta[]) => void;
  setCells: (cells: WarehouseCell[]) => void;
  addCells: (cells: WarehouseCell[]) => void;
  startLoader: (type: LoaderTypes) => void;
  stopLoader: (type: LoaderTypes) => void;
};

const initialLoaders: Record<LoaderTypes, boolean> = {
  "warehouses/fetch-warehouses": false,
  "cells/fetch-cells": false,
  "cells/allocate-pallets": false,
};

const useWarehouseCellStore = create<
  WarehouseCellStore & WarehouseCellStoreActions
>((set) => ({
  warehouses: [],
  cells: [],
  loaders: initialLoaders,

  setWarehouses: (list) => set({ warehouses: list }),
  setCells: (cells) => set({ cells }),
  addCells: (newSlots) =>
    set((state) => ({ cells: [...state.cells, ...newSlots] })),

  startLoader: (type) =>
    set((state) => ({ loaders: { ...state.loaders, [type]: true } })),
  stopLoader: (type) =>
    set((state) => ({ loaders: { ...state.loaders, [type]: false } })),
}));

export default createSelectors(useWarehouseCellStore);

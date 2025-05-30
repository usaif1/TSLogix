/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
// utils
import createSelectors from "@/utils/selectors";
// Import types from the types file
import type {
  EntryOrder,
  ProductAudit as AllAudit,
  ProductWithInventory,
  Warehouse,
  TemperatureRange,
  PackagingOption,
  DepartureFormFields,
  AvailableCell,
  CellValidation,
  ProcessLoaderTypes as LoaderTypes,
  SubmitStatus
} from "@/modules/process/types";

interface ProcessesStore {
  // Entry orders
  entryOrders: EntryOrder[];
  currentEntryOrder: EntryOrder | null;
  allAudit: AllAudit[] | null;
  departureOrders: any[];

  // Form field options
  origins: any[];
  users: any[];
  customers: any[];
  suppliers: any[];
  documentTypes: any[];
  products: any[];
  entryOrderStatus: any[];
  
  // Warehouse and packaging options
  warehouses: Warehouse[];
  temperatureRanges: TemperatureRange[];
  packagingTypes: PackagingOption[];
  packagingStatuses: PackagingOption[];

  // Departure form fields
  departureFormFields: DepartureFormFields;

  // Departure form inventory state
  productsWithInventory: ProductWithInventory[];
  inventoryError: string;
  submitStatus: SubmitStatus;

  // Cell selection state
  availableCells: AvailableCell[];
  selectedCell: AvailableCell | null;
  cellValidation: CellValidation | null;

  // Current entry order number
  currentEntryOrderNo: string | null;

  // Loaders
  loaders: Record<LoaderTypes, boolean>;
}

type ProcessesStoreActions = {
  setEntryOrders: (data: EntryOrder[]) => void;
  setCurrentEntryOrder: (data: EntryOrder | null) => void;
  setAllAudit: (data: AllAudit[] | null) => void;
  setDepartureOrders: (data: any[]) => void;
  setCurrentEntryOrderNo: (data: string | null) => void;
  resetProcessesStore: () => void;

  // departure form inventory actions
  setProductsWithInventory: (data: ProductWithInventory[]) => void;
  setInventoryError: (error: string) => void;
  setSubmitStatus: (status: SubmitStatus) => void;
  clearInventoryState: () => void;

  // warehouse actions
  setWarehouses: (warehouses: Warehouse[]) => void;

  // New actions for multi-product support
  setTemperatureRanges: (ranges: TemperatureRange[]) => void;
  setPackagingTypes: (types: PackagingOption[]) => void;
  setPackagingStatuses: (statuses: PackagingOption[]) => void;

  // loader actions
  startLoader: (loaderType: LoaderTypes) => void;
  stopLoader: (loaderType: LoaderTypes) => void;

  // departure form fields
  setDepartureFormFields: (data: DepartureFormFields) => void;

  // cell selection actions
  setAvailableCells: (cells: AvailableCell[]) => void;
  setSelectedCell: (cell: AvailableCell | null) => void;
  setCellValidation: (validation: CellValidation | null) => void;
  clearCellState: () => void;
};

const authInitialState: ProcessesStore = {
  entryOrders: [],
  currentEntryOrder: null,
  allAudit: null,
  departureOrders: [],

  origins: [],
  users: [],
  customers: [],
  suppliers: [],
  documentTypes: [],
  products: [],
  entryOrderStatus: [],
  
  // New initial state
  warehouses: [],
  temperatureRanges: [],
  packagingTypes: [],
  packagingStatuses: [],

  departureFormFields: {
    customers: [],
    documentTypes: [],
    users: [],
    packagingTypes: [],
    labels: [],
  },

  // departure form inventory state
  productsWithInventory: [],
  inventoryError: "",
  submitStatus: {},

  // cell selection state
  availableCells: [],
  selectedCell: null,
  cellValidation: null,

  currentEntryOrderNo: null,
  loaders: {
    "processes/fetch-entry-orders": false,
    "processes/fetch-departure-orders": false,
    "processes/fetch-entry-order": false,
    "processes/load-products-inventory": false,
    "processes/load-cells": false,
    "processes/validate-cell": false,
    "processes/submit-departure": false,
    "processes/fetch-warehouses": false,
  },
};

const processesStore = create<ProcessesStore & ProcessesStoreActions>(
  (set) => ({
    ...authInitialState,

    // loader controls
    startLoader: (loaderType) =>
      set((state) => ({ loaders: { ...state.loaders, [loaderType]: true } })),
    stopLoader: (loaderType) =>
      set((state) => ({ loaders: { ...state.loaders, [loaderType]: false } })),

    // reset entire store
    resetProcessesStore: () => set(authInitialState),

    // entry orders
    setEntryOrders: (data) => set({ entryOrders: data }),
    setCurrentEntryOrder: (data) => set({ currentEntryOrder: data }),

    // audits
    setAllAudit: (data) => set({ allAudit: data }),

    // departure orders
    setDepartureOrders: (data) => set({ departureOrders: data }),

    // entry order number
    setCurrentEntryOrderNo: (data) => set({ currentEntryOrderNo: data }),

    // departure form
    setDepartureFormFields: (data) => set({ departureFormFields: data }),

    // warehouses
    setWarehouses: (warehouses) => set({ warehouses }),

    // New actions for multi-product support
    setTemperatureRanges: (ranges) => set({ temperatureRanges: ranges }),
    setPackagingTypes: (types) => set({ packagingTypes: types }),
    setPackagingStatuses: (statuses) => set({ packagingStatuses: statuses }),

    // departure form inventory actions
    setProductsWithInventory: (data) => set({ productsWithInventory: data }),
    setInventoryError: (error) => set({ inventoryError: error }),
    setSubmitStatus: (status) => set({ submitStatus: status }),
    clearInventoryState: () => set({
      productsWithInventory: [],
      inventoryError: "",
      submitStatus: {},
    }),

    // cell selection actions
    setAvailableCells: (cells) => set({ availableCells: cells }),
    setSelectedCell: (cell) => set({ selectedCell: cell }),
    setCellValidation: (validation) => set({ cellValidation: validation }),
    clearCellState: () => set({
      availableCells: [],
      selectedCell: null,
      cellValidation: null,
      inventoryError: "",
    }),
  })
);

export default createSelectors(processesStore);

// Re-export types that might be needed by components
export type { 
  ProcessesStore, 
  ProcessesStoreActions
};
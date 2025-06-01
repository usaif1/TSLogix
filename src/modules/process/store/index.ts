/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import createSelectors from "@/utils/selectors";
import {
  EntryOrder,
  EntryOrderProduct,
  EntryFormFields,
  EntryOrderReview,
  InventorySelection,
  ProductAudit as AllAudit,
  ProductWithInventory,
  Warehouse,
  TemperatureRange,
  PackagingOption,
  DepartureFormFields,
  AvailableCell,
  CellValidation,
  ProcessLoaderTypes as LoaderTypes,
  SubmitStatus,
} from "@/modules/process/types";

interface ProcessesStore {
  // Entry Orders
  entryOrders: EntryOrder[];
  currentEntryOrder: EntryOrder | null;
  pendingEntryOrders: EntryOrder[]; // For admin review
  approvedEntryOrders: EntryOrder[]; // For warehouse allocation

  // Form Fields
  entryFormFields: EntryFormFields;

  // Entry Order Creation
  currentEntryOrderNo: string | null;

  // Review System
  reviewStatus: {
    success?: boolean;
    message?: string;
  };

  // Departure Orders
  departureOrders: any[];
  departureFormFields: DepartureFormFields;

  // Inventory Management
  productsWithInventory: ProductWithInventory[];
  inventorySelections: InventorySelection[];
  inventoryError: string;
  submitStatus: SubmitStatus;

  // Cell Management
  availableCells: AvailableCell[];
  selectedCell: AvailableCell | null;
  cellValidation: CellValidation | null;

  // Warehouses
  warehouses: Warehouse[];

  // Loading states
  loaders: {
    "processes/fetch-entry-orders": boolean;
    "processes/fetch-pending-orders": boolean;
    "processes/fetch-approved-orders": boolean;
    "processes/fetch-entry-order": boolean;
    "processes/create-entry-order": boolean;
    "processes/review-entry-order": boolean;
    "processes/load-form-fields": boolean;
    "processes/fetch-warehouses": boolean;
    "processes/load-products-inventory": boolean;
    "processes/load-cells": boolean;
    "processes/validate-cell": boolean;
    "processes/submit-departure": boolean;
    "processes/fetch-departure-orders": boolean;
  };
}

interface ProcessesStoreActions {
  // Loader controls
  startLoader: (loaderType: keyof ProcessesStore["loaders"]) => void;
  stopLoader: (loaderType: keyof ProcessesStore["loaders"]) => void;

  // Entry Orders
  setEntryOrders: (orders: EntryOrder[]) => void;
  setCurrentEntryOrder: (order: EntryOrder | null) => void;
  setPendingEntryOrders: (orders: EntryOrder[]) => void;
  setApprovedEntryOrders: (orders: EntryOrder[]) => void;

  // Form Fields
  setEntryFormFields: (fields: EntryFormFields) => void;
  setCurrentEntryOrderNo: (orderNo: string | null) => void;

  // Review System
  setReviewStatus: (status: { success?: boolean; message?: string }) => void;
  clearReviewStatus: () => void;

  // Warehouses
  setWarehouses: (warehouses: Warehouse[]) => void;

  // Departure Orders
  setDepartureOrders: (orders: any[]) => void;
  setDepartureFormFields: (fields: DepartureFormFields) => void;

  // Inventory Management
  setProductsWithInventory: (products: ProductWithInventory[]) => void;
  setInventorySelections: (selections: InventorySelection[]) => void;
  addInventorySelection: (selection: InventorySelection) => void;
  removeInventorySelection: (inventoryId: string) => void;
  updateInventorySelection: (inventoryId: string, updates: Partial<InventorySelection>) => void;
  clearInventorySelections: () => void;
  setInventoryError: (error: string) => void;
  setSubmitStatus: (status: SubmitStatus) => void;
  clearInventoryState: () => void;

  // Cell Management
  setAvailableCells: (cells: AvailableCell[]) => void;
  setSelectedCell: (cell: AvailableCell | null) => void;
  setCellValidation: (validation: CellValidation | null) => void;
  clearCellState: () => void;

  // Reset
  resetProcessesStore: () => void;
}

const processesInitialState: ProcessesStore = {
  // Entry Orders
  entryOrders: [],
  currentEntryOrder: null,
  pendingEntryOrders: [],
  approvedEntryOrders: [],

  // Form Fields
  entryFormFields: {
    origins: [],
    documentTypes: [],
    users: [],
    suppliers: [],
    products: [],
    warehouses: [],
    temperatureRanges: [],
    originTypes: [],
    documentTypeOptions: [],
    orderStatusOptions: [],
    presentationOptions: [],
    temperatureRangeOptions: [],
  },

  // Entry Order Creation
  currentEntryOrderNo: null,

  // Review System
  reviewStatus: {},

  // Departure Orders
  departureOrders: [],
  departureFormFields: {
    customers: [],
    documentTypes: [],
    users: [],
    packagingTypes: [],
    labels: [],
  },

  // Inventory Management
  productsWithInventory: [],
  inventorySelections: [],
  inventoryError: "",
  submitStatus: {},

  // Cell Management
  availableCells: [],
  selectedCell: null,
  cellValidation: null,

  // Warehouses
  warehouses: [],

  // Loading states
  loaders: {
    "processes/fetch-entry-orders": false,
    "processes/fetch-pending-orders": false,
    "processes/fetch-approved-orders": false,
    "processes/fetch-entry-order": false,
    "processes/create-entry-order": false,
    "processes/review-entry-order": false,
    "processes/load-form-fields": false,
    "processes/fetch-warehouses": false,
    "processes/load-products-inventory": false,
    "processes/load-cells": false,
    "processes/validate-cell": false,
    "processes/submit-departure": false,
    "processes/fetch-departure-orders": false,
  },
};

const processesStore = create<ProcessesStore & ProcessesStoreActions>((set, get) => ({
  ...processesInitialState,

  // Loader controls
  startLoader: (loaderType) =>
    set((state) => ({ loaders: { ...state.loaders, [loaderType]: true } })),
  stopLoader: (loaderType) =>
    set((state) => ({ loaders: { ...state.loaders, [loaderType]: false } })),

  // Entry Orders
  setEntryOrders: (orders) => set({ entryOrders: orders }),
  setCurrentEntryOrder: (order) => set({ currentEntryOrder: order }),
  setPendingEntryOrders: (orders) => set({ pendingEntryOrders: orders }),
  setApprovedEntryOrders: (orders) => set({ approvedEntryOrders: orders }),

  // Form Fields
  setEntryFormFields: (fields) => set({ entryFormFields: fields }),
  setCurrentEntryOrderNo: (orderNo) => set({ currentEntryOrderNo: orderNo }),

  // Review System
  setReviewStatus: (status) => set({ reviewStatus: status }),
  clearReviewStatus: () => set({ reviewStatus: {} }),

  // Warehouses
  setWarehouses: (warehouses) => set({ warehouses }),

  // Departure Orders
  setDepartureOrders: (orders) => set({ departureOrders: orders }),
  setDepartureFormFields: (fields) => set({ departureFormFields: fields }),

  // Inventory Management
  setProductsWithInventory: (products) => set({ productsWithInventory: products }),
  setInventorySelections: (selections) => set({ inventorySelections: selections }),

  addInventorySelection: (selection) => {
    const { inventorySelections } = get();
    const exists = inventorySelections.find((s) => s.inventory_id === selection.inventory_id);
    if (!exists) {
      set({ inventorySelections: [...inventorySelections, selection] });
    }
  },

  removeInventorySelection: (inventoryId) => {
    const { inventorySelections } = get();
    set({ inventorySelections: inventorySelections.filter((s) => s.inventory_id !== inventoryId) });
  },

  updateInventorySelection: (inventoryId, updates) => {
    const { inventorySelections } = get();
    set({
      inventorySelections: inventorySelections.map((s) =>
        s.inventory_id === inventoryId ? { ...s, ...updates } : s
      ),
    });
  },

  clearInventorySelections: () => set({ inventorySelections: [] }),
  setInventoryError: (error) => set({ inventoryError: error }),
  setSubmitStatus: (status) => set({ submitStatus: status }),
  clearInventoryState: () =>
    set({
      productsWithInventory: [],
      inventorySelections: [],
      inventoryError: "",
      submitStatus: {},
    }),

  // Cell Management
  setAvailableCells: (cells) => set({ availableCells: cells }),
  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setCellValidation: (validation) => set({ cellValidation: validation }),
  clearCellState: () =>
    set({
      availableCells: [],
      selectedCell: null,
      cellValidation: null,
      inventoryError: "",
    }),

  // Reset
  resetProcessesStore: () => set(processesInitialState),
}));

export default createSelectors(processesStore);

// Re-export types that might be needed by components
export type { ProcessesStore, ProcessesStoreActions };
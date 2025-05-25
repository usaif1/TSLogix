/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
// utils
import createSelectors from "@/utils/selectors";

type LoaderTypes =
  | "processes/fetch-entry-orders"
  | "processes/fetch-departure-orders"
  | "processes/fetch-entry-order"
  | "processes/load-products-inventory"
  | "processes/load-cells"
  | "processes/validate-cell"
  | "processes/submit-departure"
  | "processes/fetch-warehouses";

type DepartureFormFields = {
  customers: any[];
  documentTypes: any[];
  users: any[];
  packagingTypes: any[];
  labels: any[];
};

interface ProductWithInventory {
  product_id: number;
  product_name: string;
  available_packaging: number;
  available_weight: number;
  available_volume: number;
  location_count: number;
}

interface AvailableCell {
  inventory_id: string;
  cell_id: string;
  cell_reference: string;
  product_name: string;
  available_packaging: number;
  available_weight: number;
  available_volume: number | null;
  expiration_date: string | null;
  entry_order_no: string;
  lot_series: string | null;
  admission_date: string;
}

interface CellValidation {
  inventory_id: string;
  cell_id: string;
  cell_reference: string;
  entry_order_no: string;
  requested_qty: number;
  requested_weight: number;
  remaining_qty: number;
  remaining_weight: number;
  will_be_empty: boolean;
}

interface Warehouse {
  warehouse_id: string;
  name: string;
}

type EntryOrder = any;
type AllAudit = any;

export type ProcessesStore = {
  // entry orders list
  entryOrders: EntryOrder[];
  // currently loaded entry order details
  currentEntryOrder: EntryOrder | null;
  // all audits
  allAudit: AllAudit[] | null;
  // departure orders list
  departureOrders: any[];

  // entry order form fields
  origins: any[];
  users: any[];
  customers: any[];
  suppliers: any[];
  documentTypes: any[];
  products: any[];
  entryOrderStatus: any[];

  // departure form fields
  departureFormFields: DepartureFormFields;

  // warehouses for departure form
  warehouses: Warehouse[];

  // departure form inventory state
  productsWithInventory: ProductWithInventory[];
  inventoryError: string;

  // New fields for single cell selection
  availableCells: AvailableCell[];
  selectedCell: AvailableCell | null;
  cellValidation: CellValidation | null;

  // departure form submit status
  submitStatus: {
    success?: boolean;
    message?: string;
  };

  // last fetched entry order number
  currentEntryOrderNo: string | null;

  // loading states
  loaders: Record<LoaderTypes, boolean>;
};

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
  setSubmitStatus: (status: { success?: boolean; message?: string; }) => void;
  clearInventoryState: () => void;

  // warehouse actions
  setWarehouses: (warehouses: Warehouse[]) => void;

  // loader actions
  startLoader: (loaderType: LoaderTypes) => void;
  stopLoader: (loaderType: LoaderTypes) => void;

  // departure form fields
  setDepartureFormFields: (data: DepartureFormFields) => void;

  // New actions for cell selection
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

  departureFormFields: {
    customers: [],
    documentTypes: [],
    users: [],
    packagingTypes: [],
    labels: [],
  },

  warehouses: [],

  // departure form inventory state
  productsWithInventory: [],
  inventoryError: "",
  submitStatus: {},

  // New initial state for cell selection
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

    // departure form inventory actions
    setProductsWithInventory: (data) => set({ productsWithInventory: data }),
    setInventoryError: (error) => set({ inventoryError: error }),
    setSubmitStatus: (status) => set({ submitStatus: status }),
    clearInventoryState: () => set({
      productsWithInventory: [],
      inventoryError: "",
      submitStatus: {},
    }),

    // New cell selection actions
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

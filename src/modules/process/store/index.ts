/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
// utils
import createSelectors from "@/utils/selectors";

type LoaderTypes =
  | "processes/fetch-entry-orders"
  | "processes/fetch-departure-orders"
  | "processes/fetch-entry-order";

type DepartureFormFields = {
  customers: any[];
  documentTypes: any[];
  users: any[];
  packagingTypes: any[];
  labels: any[];
};

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

  // loader actions
  startLoader: (loaderType: LoaderTypes) => void;
  stopLoader: (loaderType: LoaderTypes) => void;

  // departure form fields
  setDepartureFormFields: (data: DepartureFormFields) => void;
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

  currentEntryOrderNo: null,
  loaders: {
    "processes/fetch-entry-orders": false,
    "processes/fetch-departure-orders": false,
    "processes/fetch-entry-order": false,
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
  })
);

export default createSelectors(processesStore);

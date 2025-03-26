/* eslint-disable @typescript-eslint/no-explicit-any */
// dependencies
import { create } from "zustand";

// utils
import createSelectors from "@/utils/selectors";

type LoaderTypes =
  | "processes/fetch-entry-orders"
  | "processes/fetch-departure-orders";

type DepartureFormFields = {
  customers: any[];
  documentTypes: any[];
  users: any[];
  packagingTypes: any[];
  labels: any[];
};

type ProcessesStore = {
  // auth user
  entryOrders: any[];
  departureOrders: any[];

  //   entry order form fields
  origins: any[];
  users: any[];
  customers: any[];
  suppliers: any[];
  documentTypes: any[];
  products: any[];
  entryOrderStatus: any[];

  // departure form fields
  departureFormFields: DepartureFormFields;

  // last order no
  currentEntryOrderNo: any;

  // loading states
  loaders: Record<LoaderTypes, boolean>;
};

type ProcessesStoreActions = {
  // reset modal store
  setEntryOrders: (data: any) => void;
  setDepartureOrders: (data: any) => void;
  resetProcessesStore: () => void;

  // loader actions
  startLoader: (loaderType: LoaderTypes) => void;
  stopLoader: (loaderType: LoaderTypes) => void;

  // action to set departure form fields
  setDepartureFormFields: (data: DepartureFormFields) => void;
};

const authInitialState: ProcessesStore = {
  // entry orders
  entryOrders: [],

  //   entry order form fields
  origins: [],
  users: [],
  customers: [],
  suppliers: [],
  documentTypes: [],
  departureOrders: [],
  products: [],
  entryOrderStatus: [],
  currentEntryOrderNo: "",

  // departure form fields initial state
  departureFormFields: {
    customers: [],
    documentTypes: [],
    users: [],
    packagingTypes: [],
    labels: [],
  },

  loaders: {
    "processes/fetch-entry-orders": false,
    "processes/fetch-departure-orders": false,
  },
};

const processesStore = create<ProcessesStore & ProcessesStoreActions>(
  (set) => ({
    ...authInitialState,

    // loader actions
    startLoader: (loaderType: LoaderTypes) =>
      set((state) => ({
        ...state,
        loaders: { ...state.loaders, [loaderType]: true },
      })),

    stopLoader: (loaderType: LoaderTypes) =>
      set((state) => ({
        ...state,
        loaders: { ...state.loaders, [loaderType]: false },
      })),

    // reset store
    resetProcessesStore: () => set(authInitialState),
    setEntryOrders: (data: any) => set({ entryOrders: data }),
    setDepartureOrders: (data: any) => set({ departureOrders: data }),

    setDepartureFormFields: (data: DepartureFormFields) =>
      set({ departureFormFields: data }),
  })
);

export default createSelectors(processesStore);

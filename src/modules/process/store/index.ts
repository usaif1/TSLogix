/* eslint-disable @typescript-eslint/no-explicit-any */
// dependencies
import { create } from "zustand";

// utils
import createSelectors from "@/utils/selectors";

type LoaderTypes = "processes/fetch-entry-orders" | "processes/fetch-departure-orders";

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
      set((state) => {
        return { ...state, loaders: { ...state.loaders, [loaderType]: true } };
      }),

    stopLoader: (loaderType: LoaderTypes) =>
      set((state) => {
        return { ...state, loaders: { ...state.loaders, [loaderType]: false } };
      }),

    // reset address store
    resetProcessesStore: () => set(authInitialState),
    setEntryOrders: (data: any) => set({ entryOrders: data }),
    setDepartureOrders: (data: any) => set({ departureOrders: data }),
  })
);

export default createSelectors(processesStore);

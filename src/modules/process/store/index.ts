/* eslint-disable @typescript-eslint/no-explicit-any */
// dependencies
import { create } from "zustand";

// utils
import createSelectors from "@/utils/selectors";

type LoaderTypes = "processes/fetch-entry-orders";

type ProcessesStore = {
  // entry order
  entryOrders: any[];

  origins: any[];
  users: any[];
  suppliers: any[];
  documentTypes: any[];

  // departure
  departureOrders: any[];
  departureExitOptions: any[];

  // loading states
  loaders: Record<LoaderTypes, boolean>;
};

type ProcessesStoreActions = {
  //  entry order actions
  setEntryOrders: (data: any) => void;

  // departure order actions
  setDepartureOrders: (data: any) => void;
  setDepartureExitOptions: (data: any) => void;

  // reset modal store
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
  suppliers: [],
  documentTypes: [],

  // departure orders
  departureOrders: [],
  departureExitOptions: [],

  loaders: {
    "processes/fetch-entry-orders": false,
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

    // entry orders
    setEntryOrders: (data: any) => set({ entryOrders: data }),

    // departure orders
    setDepartureExitOptions: (data: any) => set({ departureExitOptions: data }),
    setDepartureOrders: (data: any) => set({ departureOrders: data }),
  })
);

export default createSelectors(processesStore);

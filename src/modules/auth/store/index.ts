/* eslint-disable @typescript-eslint/no-explicit-any */
// dependencies
import { create } from "zustand";

// utils
import createSelectors from "@/utils/selectors";

type LoaderTypes = "auth/initial-load";

type AuthStore = {
  // auth user
  authUser: any;

  // loading states
  loaders: Record<LoaderTypes, boolean>;
};

type AuthStoreActions = {
  // reset modal store
  resetAuthStore: () => void;
  setAuthUser: (data: any) => void;

  // loader actions
  startLoader: (loaderType: LoaderTypes) => void;
  stopLoader: (loaderType: LoaderTypes) => void;
};

const authInitialState: AuthStore = {
  // auth user
  authUser: null,

  loaders: {
    "auth/initial-load": false,
  },
};

const authStore = create<AuthStore & AuthStoreActions>((set) => ({
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
  resetAuthStore: () => set(authInitialState),
  setAuthUser: (data) => set({ authUser: data }),
}));

export default createSelectors(authStore);

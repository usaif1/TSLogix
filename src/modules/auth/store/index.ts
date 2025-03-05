/* eslint-disable @typescript-eslint/no-explicit-any */
// dependencies
import { create } from "zustand";

// utils
import createSelectors from "@/utils/selectors";
import { authService } from "@/services/auth/authService";
import { SignInWithEmailPassword } from "@/types";

type LoaderTypes = "auth/initial-load" | "auth/login" | "auth/logout";

type AuthStore = {
  // auth user
  authUser: any;
  authError: string | null;

  // loading states
  loaders: Record<LoaderTypes, boolean>;
};

type AuthStoreActions = {
  login: (credentials: SignInWithEmailPassword) => void;
  logout: () => void;
  // reset modal store
  resetAuthStore: () => void;
  setAuthUser: (data: any) => void;
  setAuthError: (error: string | null) => void;

  // loader actions
  startLoader: (loaderType: LoaderTypes) => void;
  stopLoader: (loaderType: LoaderTypes) => void;
  clearError: () => void;
  initAuth: () => void;
};

const authInitialState: AuthStore = {
  // auth user
  authUser: null,
  authError: null,
  loaders: {
    "auth/initial-load": false,
    "auth/login": false,
    "auth/logout": false,
  },
};

const authStore = create<AuthStore & AuthStoreActions>((set) => ({
  ...authInitialState,

  login: (credentials) => {
    set((state) => ({
      ...state,
      authError: null,
      loaders: { ...state.loaders, "auth/login": true },
    }));

    authService
      .login(credentials)
      .then((response) => {
        set({
          authUser: response.user,
          loaders: {
            ...authInitialState.loaders,
            "auth/initial-load": false,
            "auth/login": false,
          },
        });
      })
      .catch((error) => {
        set({
          authError: error.message || "Login failed",
          loaders: {
            ...authInitialState.loaders,
            "auth/initial-load": false,
            "auth/login": false,
          },
        });
      });
  },

  logout: () => {
    set((state) => ({
      ...state,
      loaders: { ...state.loaders, "auth/logout": true },
    }));

    authService.logout();

    set({
      ...authInitialState,
      loaders: {
        ...authInitialState.loaders,
        "auth/initial-load": false,
        "auth/logout": false,
      },
    });
  },

  initAuth: () => {
    set((state) => ({
      ...state,
      loaders: { ...state.loaders, "auth/initial-load": true },
    }));

    const user = authService.getUser();

    set({
      authUser: user,
      loaders: { ...authInitialState.loaders, "auth/initial-load": false },
    });
  },

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
  setAuthError: (error) => set({ authError: error }),
  clearError: () => set({ authError: null }),
}));

export default createSelectors(authStore);

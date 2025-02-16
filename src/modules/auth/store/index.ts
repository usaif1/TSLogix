// dependencies
import { create } from "zustand";

// utils
import createSelectors from "@/utils/selectors";

type AuthStore = {
  // auth user
  authUser: boolean;
  loadingAuthUser: boolean;
};

type AuthStoreActions = {
  // reset modal store
  resetAuthStore: () => void;
};

const authInitialState: AuthStore = {
  // auth user
  authUser: true,
  loadingAuthUser: true,
};

const authStore = create<AuthStore & AuthStoreActions>((set) => ({
  ...authInitialState,

  // reset address store
  resetAuthStore: () => set(authInitialState),
}));

export default createSelectors(authStore);

// dependencies
import React from "react";
import { create } from "zustand";
// import { User } from "firebase/auth";

// utils
import createSelectors from "@/utils/selectors";
import { BasicModalComponent } from "@/components/ModalComponents";

type GlobalStore = {
  // auth user
  // authUser: User | null;
  loadingAuthUser: boolean;

  // modal
  modalComponent: React.FC;
  isModalOpen: boolean;
  closeModalCallback: () => void;
};

type GlobalActions = {
  openModal: () => void;
  closeModal: () => void;

  // reset modal store
  resetGlobalStore: () => void;
};

const globalInitialState: GlobalStore = {
  // auth user
  // authUser: null,
  loadingAuthUser: true,

  // modal
  modalComponent: BasicModalComponent,
  isModalOpen: false,
  closeModalCallback: () => null,
};

const globalStore = create<GlobalStore & GlobalActions>((set) => ({
  ...globalInitialState,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  // reset address store
  resetGlobalStore: () => set(globalInitialState),
}));

export default createSelectors(globalStore);

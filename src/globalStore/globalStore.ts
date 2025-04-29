// dependencies
import React from "react";
import { create } from "zustand";

// utils
import createSelectors from "@/utils/selectors";
import {
  BasicModalComponent,
  ModalCloseButtonDefault,
} from "@/components/ModalComponents";

type GlobalStore = {
  // modal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModalComponent: any;
  ModalCloseButton: React.FC;
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
  // modal
  ModalComponent: BasicModalComponent,
  ModalCloseButton: ModalCloseButtonDefault,
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

"use client";

// dependencies
import React from "react";
import { X } from "@phosphor-icons/react";

// store
import { GlobalStore } from "@/globalStore";

const ModalCancelBtn: React.FC = () => {
  const closeModal = GlobalStore.use.closeModal();
  const closeModalCallback = GlobalStore.use.closeModalCallback();

  const onClick = () => {
    closeModal();
    closeModalCallback();
  };

  return (
    <button
      onClick={onClick}
      className="absolute top-2 right-2 bg-gray-700 h-6 w-6 rounded-full flex items-center justify-center"
    >
      <X weight="bold" size={17} color="white" />
    </button>
  );
};

export default ModalCancelBtn;

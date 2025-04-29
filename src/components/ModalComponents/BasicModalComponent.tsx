import React, { useEffect } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const BasicModalComponent: React.FC<ModalProps> = ({ title, children, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="border-b px-4 py-2 flex justify-between items-center">
          <h2 className="text-lg font-medium">{title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default BasicModalComponent;
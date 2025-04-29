import React from "react";

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
  </div>
);

export default Spinner;

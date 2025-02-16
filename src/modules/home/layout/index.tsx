// dependencies
import React from "react";
import { Outlet } from "react-router";

const AuthLayout: React.FC = () => {
  return (
    <div className="layout bg-red-500">
      <Outlet />
    </div>
  );
};

export default AuthLayout;

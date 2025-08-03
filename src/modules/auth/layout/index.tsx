// dependencies
import React from "react";
import { Outlet } from "react-router";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default AuthLayout;

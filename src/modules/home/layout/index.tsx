// dependencies
import React from "react";
import { Outlet } from "react-router";

// components
import { Navbar, Header } from "@/components";

const AuthLayout: React.FC = () => {
  return (
    <div className="layout bg-background-primary">
      <Header />
      <div className="h-full flex">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

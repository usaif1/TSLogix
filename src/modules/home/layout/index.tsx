// dependencies
import React from "react";
import { Outlet } from "react-router";

// components
import { Navbar, Header } from "@/components";

const AuthLayout: React.FC = () => {
  return (
    <div className="layout bg-background-primary min-h-screen">
      <Header />
      <div className="h-full flex min-h-0">
        <Navbar />
        <div className="w-full h-full pt-5 px-10 flex-1 min-w-0 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

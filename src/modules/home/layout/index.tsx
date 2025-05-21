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
        <div className="w-full h-full pt-5 px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

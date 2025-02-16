// dependencies
import React from "react";
import { Routes, Route } from "react-router";

// layout
import AuthLayout from "@/modules/auth/layout";

// screens
import { Login } from "@/modules/auth/screens";

const UnProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" Component={AuthLayout}>
        <Route index Component={Login} />
      </Route>
    </Routes>
  );
};

export default UnProtectedRoutes;

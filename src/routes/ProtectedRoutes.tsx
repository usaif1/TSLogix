// dependencies
import React from "react";
import { Routes, Route } from "react-router";

// screens
import { HomePage } from "@/modules/home/screens";

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" Component={HomePage} />
    </Routes>
  );
};

export default ProtectedRoutes;

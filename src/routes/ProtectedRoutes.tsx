// dependencies
import React from "react";
import { Routes, Route } from "react-router";

// screens
import { HomeLayout } from "@/layouts";

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" Component={HomeLayout} />
      <Route />
    </Routes>
  );
};

export default ProtectedRoutes;

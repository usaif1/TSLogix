// dependencies
import React from "react";
import { Routes, Route } from "react-router";

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" />
    </Routes>
  );
};

export default ProtectedRoutes;

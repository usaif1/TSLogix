// dependencies
import React from "react";
import { Routes, Route } from "react-router";

// layouts
import { HomeLayout } from "@/layouts";

// screens
import { HomePage } from "@/modules/home/screens";
import { Entry, ProcessHome, Departure } from "@/modules/process/screens";

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" Component={HomeLayout}>
        <Route index Component={HomePage} />
        <Route path="processes">
          <Route index Component={ProcessHome} />
          <Route path="entry" Component={Entry} />
          <Route path="departure" Component={Departure} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;

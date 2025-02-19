// dependencies
import React from "react";
import { Routes, Route } from "react-router";

// layouts
import { HomeLayout } from "@/layouts";

// screens
import { HomePage } from "@/modules/home/screens";
import {
  Entry,
  ProcessHome,
  Departure,
  NewEntryOrder,
} from "@/modules/process/screens";

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<HomePage />} />
        <Route path="processes">
          <Route index element={<ProcessHome />} />
          <Route path="entry" element={<Entry />} />
          <Route path="entry/new" element={<NewEntryOrder />} />
          <Route path="departure" element={<Departure />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;

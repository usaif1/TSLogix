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
  NewEntry,
  MassEntry,
} from "@/modules/process/screens";

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<HomePage />} />
        <Route path="processes">
          <Route index element={<ProcessHome />} />
          <Route path="entry">
            <Route index element={<Entry />} />
            <Route path="new" element={<NewEntry />} />
            <Route path="mass" element={<MassEntry />} />
          </Route>
          <Route path="departure">
            <Route index element={<Departure />} />
            <Route path="approved" element={<Departure />} />
            <Route path="returned" element={<Departure />} />
            <Route path="counter" element={<Departure />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;

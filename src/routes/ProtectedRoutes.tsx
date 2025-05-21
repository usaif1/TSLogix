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
  NewEntry,
  MassEntry,
  // departure
  Departure,
  DepartureApproved,
  DepartureCounter,
  DepartureReturned,
  Audit,
} from "@/modules/process/screens";

import {
  // maintenance
  Supplier,
  NewSupplier,
  MaintenanceHome,
  Product,
  NewProduct,
} from "@/modules/maintenance/screens";

import {
  // inventory
  InventoryLog,
  AllocateOrder,
} from "@/modules/inventory/screens";

import { WareHouse } from "@/modules/warehouse/screens";

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
            <Route path="audit" element={<Audit />} />
          </Route>
          <Route path="departure">
            <Route index element={<Departure />} />
            <Route path="approved" element={<DepartureApproved />} />
            <Route path="returned" element={<DepartureReturned />} />
            <Route path="counter" element={<DepartureCounter />} />
          </Route>
        </Route>
        <Route path="maintenance">
          <Route index element={<MaintenanceHome />} />
          <Route path="supplier">
            <Route index element={<Supplier />} />
            <Route path="new" element={<NewSupplier />} />
          </Route>
          <Route path="product">
            <Route index element={<Product />} />
            <Route path="new" element={<NewProduct />} />
          </Route>
        </Route>
        <Route path="warehouse">
          <Route index element={<WareHouse />} />
        </Route>
        <Route path="inventory">
          <Route index element={<InventoryLog />} />
          <Route path="allocate" element={<AllocateOrder />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;

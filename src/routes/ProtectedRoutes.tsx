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
  DepartureDispatch,
  DepartureWarehouseDispatch,
  Audit,
  DepartureAudit,
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
  InventorySummary,
  QuarantineManagement,
} from "@/modules/inventory/screens";

import { WareHouse } from "@/modules/warehouse/screens";

import {
  // client
  Client,
  NewClient,
  ClientDetail,
} from "@/modules/client/screens";

import {
  // event logs
  EventLogsPage,
} from "@/modules/eventLogs/screens";

import {
  // reports
  Reports,
} from "@/modules/reports/screens";

// Role-based route wrapper component
const RoleProtectedRoute: React.FC<{
  element: React.ReactElement;
  allowedRoles: string[];
  fallback?: React.ReactElement;
}> = ({ element, allowedRoles, fallback }) => {
  const userRole = localStorage.getItem("role");
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return element;
};

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
            <Route path="dispatch" element={<DepartureDispatch />} />
            <Route 
              path="warehouse-dispatch" 
              element={
                <RoleProtectedRoute 
                  element={<DepartureWarehouseDispatch />} 
                  allowedRoles={["ADMIN", "WAREHOUSE_INCHARGE"]}
                />
              } 
            />
            <Route path="audit" element={<DepartureAudit />} />
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
          <Route path="client">
            <Route index element={<Client />} />
            <Route path="new" element={<NewClient />} />
            <Route path=":clientId" element={<ClientDetail />} />
          </Route>
        </Route>
        <Route path="warehouse">
          <Route index element={<WareHouse />} />
        </Route>
        <Route path="inventory">
          <Route index element={<InventoryLog />} />
          <Route path="allocate" element={<AllocateOrder />} />
          <Route path="summary" element={<InventorySummary />} />
          <Route path="quarantine" element={<QuarantineManagement />} />
        </Route>
        <Route path="system-logs">
          <Route path="events" element={<EventLogsPage />} />
        </Route>
        <Route path="reports">
          <Route index element={<Reports />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;

"use client";

// dependencies
import React from "react";

// components
import { GlobalBanner, WarehouseCoordinator, Navbar, Text } from "@/components";

const Home: React.FC = () => {
  return (
    <main className="p-2">
      <GlobalBanner />
      <WarehouseCoordinator />
      <Navbar />
      <Text classname="text-blue-900" weight="font-bold" size="xl">
        Welcome to the Warehouse Control System
      </Text>
    </main>
  );
};

export default Home;

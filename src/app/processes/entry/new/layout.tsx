// dependencies
import React from "react";

// components
import { GlobalBanner, Navbar, WarehouseCoordinator } from "@/components";

const ProcessesLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="lg:px-10 xl:px-44">
      <GlobalBanner />
      <WarehouseCoordinator />
      <Navbar />
      {children}
    </div>
  );
};

export default ProcessesLayout;

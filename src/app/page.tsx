// "use client";

// dependencies
import React from "react";
import { redirect } from "next/navigation";

// components
// import { GlobalBanner, WarehouseCoordinator, Navbar, Text } from "@/components";

const Home: React.FC = () => {
  const user = false;

  if (!user) {
    redirect("/login");
  } else {
    redirect("/home");
  }

  return <main className="main"></main>;
};

export default Home;

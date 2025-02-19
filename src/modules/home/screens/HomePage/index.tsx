// dependencies
import React from "react";

// components
import TSLogixLogoHigh from "@/assets/TSLogixLogoHigh.webp";
import { Divider, Text } from "@/components";
import { HomePageLink } from "./components";

const links = [
  {
    title: "Entry Order",
    route: "/processes/entry",
  },
  {
    title: "Departure Order",
    route: "/processes/departure",
  },
  {
    title: "Suppliers",
    route: "/maintenance/supplier",
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="home_container">
      <div className="flex flex-col items-center">
        <img src={TSLogixLogoHigh} />
        <Text classname="italic text-[28px]" weight="font-bold">
          Welcome to the Warehouse Control System
        </Text>
      </div>
      <Divider height="md" />
      <div className="flex items-center gap-x-5">
        {links.map((link) => {
          return <HomePageLink item={link} />;
        })}
      </div>
    </div>
  );
};

export default HomePage;

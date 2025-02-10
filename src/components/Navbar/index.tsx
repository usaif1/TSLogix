"use client";

import React from "react";
import Menu, { SubMenu, MenuItem } from "rc-menu";
import { House } from "@phosphor-icons/react";
import "rc-menu/assets/index.css"; // Ensure you import styles for rc-menu
import Link from "next/link";

const links = [
  {
    title: "Processes",
    route: "/processes",
    subroutes: [
      { type: "item", title: "Entry Order", route: "/processes/entry" },
      { type: "item", title: "Departure Order", route: "/processes/departure" },
    ],
  },
  {
    title: "Maintenance",
    route: "/maintenance",
    subroutes: [
      { type: "item", title: "Supplier", route: "/maintenance/supplier" },
      { type: "item", title: "Product", route: "/maintenance/product" },
    ],
  },
  {
    title: "Reports",
    route: "/maintenance",
    subroutes: [
      { type: "item", title: "Supplier1", route: "/maintenance/supplier" },
      { type: "item", title: "Product1", route: "/maintenance/product" },
    ],
  },
];

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-blue-900 px-2 py-1.5 flex items-center">
      <Link href="/" className="mr-4">
        <House color="white" weight="fill" size={20} />
      </Link>
      <Menu mode="horizontal" className="bg-transparent">
        {links.map((link) => (
          <SubMenu
            key={link.title}
            title={
              <div className="bg-blue-200">
                <div className="text-blue-800 text-xs whitespace-nowrap">
                  {link.title} &#9205;
                </div>
              </div>
            }
            className="min-w-[110px] bg-blue-200 -" // Ensures submenu has enough space
          >
            {link.subroutes.map((subRoute) => (
              <MenuItem
                key={subRoute.title}
                className="text-xs whitespace-nowrap min-w-[150px] !p-0" // Prevents truncation
              >
                <Link className="w-full p-1" href={subRoute.route}>
                  {subRoute.title}
                </Link>
              </MenuItem>
            ))}
          </SubMenu>
        ))}
      </Menu>
    </nav>
  );
};

export default Navbar;

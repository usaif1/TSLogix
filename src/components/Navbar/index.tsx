// dependencies
import React, { useState } from "react";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";

// components
import SubRoute from "./SubRoute";
import Route from "./Route";
import { House, Gear, FolderSimple, FileText } from "@phosphor-icons/react";
import { NavLink, useLocation } from "react-router";
import Text from "../Text";

const links = [
  {
    title: "Processes",
    route: "/processes",
    icon: Gear,
    subroutes: [
      { title: "Entry Order", route: "/processes/entry" },
      { title: "Departure Order", route: "/processes/departure" },
    ],
  },
  {
    title: "Maintenance",
    route: "/maintenance",
    icon: FolderSimple,
    subroutes: [
      { title: "Supplier", route: "/maintenance/supplier" },
      { title: "Product", route: "/maintenance/product" },
    ],
  },
  {
    title: "Reports",
    route: "/maintenance",
    icon: FileText,
    subroutes: [
      { title: "Supplier1", route: "/maintenance/supplier" },
      { title: "Product1", route: "/maintenance/product" },
    ],
  },
];

const Navbar: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<string>("");
  const location = useLocation();

  console.log(location.pathname);

  return (
    <nav className="w-64 h-full bg-blue-900 px-5 py-1.5 flex flex-col">
      <Accordion className="w-full" allowMultiple>
        <AccordionItem
          className="w-full"
          header={() => (
            <NavLink
              to="/"
              className={`w-full flex items-center gap-x-2 text-white py-3`}
            >
              <House color="white" size={20} />
              <Text color="text-white">Home</Text>
            </NavLink>
          )}
        />
        {links.map((link) => {
          return (
            <AccordionItem
              className="w-full cursor-pointer"
              header={() => <Route item={link} />}
              key={link.title}
            >
              <Accordion className="flex flex-col gap-y-2">
                {link.subroutes.map((subroute) => {
                  return (
                    <AccordionItem
                      header={() => <SubRoute item={subroute} />}
                      key={subroute.title}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  );
                })}
              </Accordion>
            </AccordionItem>
          );
        })}
      </Accordion>
    </nav>
  );
};

export default Navbar;

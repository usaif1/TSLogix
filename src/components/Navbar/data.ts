// dependencies
import {  House, Gear, FolderSimple, FileText, ChartBar  } from "@phosphor-icons/react";


export const home= {
    title: "Home",
    route: "/",
    icon: House,
   
  }

export const  links = [
    {
      title: "Processes",
      route: "/processes",
      icon: Gear,
      subroutes: [
        { title: "Entry Order", route: "/processes/entry" },
        {
          title: "Departure Order",
          route: "/processes/departure",
        },
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
      route: "/reports",
      icon: FileText,
      subroutes: [
        { title: "Warehouse Report", route: "/warehouse" },
      ],
    },
    {
      title: "Inventory",
      route: "/inventory",
      icon: ChartBar,
      subroutes: []
    }
  ];
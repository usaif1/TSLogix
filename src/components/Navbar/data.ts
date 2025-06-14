// dependencies
import {  House, Gear, FolderSimple, FileText, ChartBar, Users  } from "@phosphor-icons/react";
import { TFunction } from "i18next";

export const getHomeData = (t: TFunction) => ({
    title: t('home'),
    route: "/",
    icon: House,
});

export const getLinksData = (t: TFunction) => [
    {
      title: t('processes'),
      route: "/processes",
      icon: Gear,
      subroutes: [
        { title: t('entry_order'), route: "/processes/entry" },
        {
          title: t('departure_order'),
          route: "/processes/departure",
        },
      ],
    },
    {
      title: t('maintenance'),
      route: "/maintenance",
      icon: FolderSimple,
      subroutes: [
        { title: t('supplier'), route: "/maintenance/supplier" },
        { title: t('product'), route: "/maintenance/product" },
      ],
    },
    {
      title: t('clients'),
      route: "/client",
      icon: Users,
      subroutes: [],
    },
    {
      title: t('reports'),
      route: "/reports",
      icon: FileText,
      subroutes: [
        { title: t('warehouse_report'), route: "/warehouse" },
      ],
    },
    {
      title: t('inventory'),
      route: "/inventory",
      icon: ChartBar,
      subroutes: []
    }
  ];

// Legacy exports for backward compatibility
export const home = {
    title: "Home",
    route: "/",
    icon: House,
};

export const links = [
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
      title: "Clients",
      route: "/client",
      icon: Users,
      subroutes: [],
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
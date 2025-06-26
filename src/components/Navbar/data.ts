// dependencies
import {  House, Gear, FolderSimple, FileText, ChartBar, ClockCounterClockwise  } from "@phosphor-icons/react";
import { TFunction } from "i18next";

// Define user roles
export enum UserRole {
  CLIENT = "CLIENT",
  USER = "USER", // Same as CLIENT for this system
  WAREHOUSE_INCHARGE = "WAREHOUSE_INCHARGE", 
  WAREHOUSE_ASSISTANT = "WAREHOUSE_ASSISTANT",
  ADMIN = "ADMIN"
}

export const getHomeData = (t: TFunction) => ({
    title: t('home'),
    route: "/",
    icon: House,
});

// Get all links without filtering (for reference)
const getAllLinksData = (t: TFunction) => [
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
        { title: t('client'), route: "/maintenance/client" },
      ],
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
    },
    {
      title: t('event_logs'),
      route: "/system-logs/events",
      icon: ClockCounterClockwise,
      subroutes: [],
    }
];

// Role-based filtering function
export const getFilteredLinksData = (t: TFunction, userRole: string | null) => {
  const allLinks = getAllLinksData(t);
  
  // If no role or unknown role, return all links
  if (!userRole) {
    return allLinks;
  }

  // Normalize role for comparison (handle both string and object cases)
  const normalizedRole = userRole.toString().toUpperCase();

  // Role-based filtering
  switch (normalizedRole) {
    case UserRole.CLIENT:
    case UserRole.USER:
      // USER can see everything EXCEPT: clients, inventory, event_logs
      return allLinks.map(link => {
        if (link.route === "/maintenance") {
          return {
            ...link,
            subroutes: link.subroutes.filter(subroute => subroute.route !== "/maintenance/client")
          };
        }
        return link;
      }).filter(link => 
        link.route !== "/inventory" && 
        link.route !== "/system-logs/events"
      );
      
    case UserRole.WAREHOUSE_ASSISTANT:
      // WAREHOUSE_ASSISTANT can see most things except event_logs
      return allLinks.filter(link => 
        link.route !== "/system-logs/events"
      );
      
    case UserRole.WAREHOUSE_INCHARGE:
      // WAREHOUSE_INCHARGE can see everything except event_logs
      return allLinks.filter(link => 
        link.route !== "/system-logs/events"
      );
      
    case UserRole.ADMIN:
      // ADMIN can see everything
      return allLinks;
      
    default:
      // Unknown role - return all links
      return allLinks;
  }
};

// Backward compatibility - use filtered version by default
export const getLinksData = (t: TFunction, userRole?: string | null) => {
  if (userRole !== undefined) {
    return getFilteredLinksData(t, userRole);
  }
  // Fallback to all links if no role provided (for backward compatibility)
  return getAllLinksData(t);
};

// Helper function to check if user can access a specific route
export const canAccessRoute = (route: string, userRole: string | null): boolean => {
  if (!userRole) return false;
  
  // Create a dummy translation function for route checking only
  const dummyT = (key: string) => key;
  const allowedRoutes = getFilteredLinksData(dummyT as any, userRole)
    .flatMap(link => [link.route, ...link.subroutes.map(sub => sub.route)]);
    
  return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
};

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
        { title: "Client", route: "/maintenance/client" },
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
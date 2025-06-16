import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AccordionItem,
  ControlledAccordion,
  useAccordionProvider,
} from "@szhsin/react-accordion";
import { useLocation } from "react-router";

// components
import LogoutButton from "@/components/Logout";
import SubRoute from "./SubRoute";
import Route from "./Route";

// data
import { getFilteredLinksData, getHomeData } from "./data";
import HomeRoute from "./HomeRoute";

// store
import { AuthStore } from "@/globalStore";

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation(['common']);
  const location = useLocation();
  
  // Get user role from auth store with multiple fallbacks
  const { authUser } = AuthStore();
  const userRole = authUser?.role?.name || authUser?.role || localStorage.getItem("role") || null;

  // Memoize the filtered links based on user role
  const links = useMemo(() => {
    if (!userRole) {
      return [];
    }
    return getFilteredLinksData(t, userRole);
  }, [t, i18n.language, userRole]);
  
  const home = useMemo(() => getHomeData(t), [t, i18n.language]);

  const providerValue = useAccordionProvider({
    allowMultiple: false,
    transition: true,
    transitionTimeout: 500,
  });

  useEffect(() => {
    const activeRoute = links.find((link) =>
      location.pathname.includes(link.route)
    );

    if (activeRoute && activeRoute.subroutes.length > 0) {
      providerValue.toggle(activeRoute.route);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Only depend on pathname, not links

  // Don't render navbar if no user role
  if (!userRole) {
    return null;
  }

  return (
    <nav className="relative w-64 h-full bg-primary-500 px-5 py-1.5 flex flex-col">
      <ControlledAccordion providerValue={providerValue} className="w-full">
        <HomeRoute item={home} />
        {links.map((link) => (
          <AccordionItem
            className="w-full cursor-pointer"
            header={({ state }) => (
              <Route
                item={link}
                isOpen={state.isEnter}
                hasSubroutes={link.subroutes.length > 0}
              />
            )}
            key={link.route} // Use route as key instead of title for stability
            itemKey={link.route}
          >
            <div className="flex flex-col gap-y-2">
              {link.subroutes.map((subroute) => (
                <SubRoute 
                  key={subroute.route} 
                  item={subroute} 
                />
              ))}
            </div>
          </AccordionItem>
        ))}
        <div className="absolute bottom-24 left-10 right-10 mx-auto">
          <LogoutButton />
        </div>
      </ControlledAccordion>
    </nav>
  );
};

export default Navbar;

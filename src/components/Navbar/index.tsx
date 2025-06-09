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
import { getLinksData, getHomeData } from "./data";
import HomeRoute from "./HomeRoute";

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation(['common']);
  const location = useLocation();

  // Memoize the translated data to prevent recreation on every render
  const links = useMemo(() => getLinksData(t), [t, i18n.language]);
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

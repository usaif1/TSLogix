import React, { useEffect } from "react";
import {
  Accordion,
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
import { links, home } from "./data";
import HomeRoute from "./HomeRoute";

const Navbar: React.FC = () => {
  const location = useLocation();

  const providerValue = useAccordionProvider({
    allowMultiple: true,
    transition: true,
    transitionTimeout: 500,
  });

  useEffect(() => {
    const activeRoute = links.find((link) =>
      location.pathname.includes(link.route)
    );

    if (activeRoute) providerValue.toggle(activeRoute.route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            key={link.title}
            itemKey={link.route}
          >
            <Accordion
              className="flex flex-col gap-y-2"
              transition
              transitionTimeout={250}
            >
              {link.subroutes.map((subroute) => (
                <AccordionItem
                  header={() => <SubRoute item={subroute} />}
                  key={subroute.title}
                  itemKey={subroute.route}
                  onClick={(e) => e.stopPropagation()}
                />
              ))}
            </Accordion>
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

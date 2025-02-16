// dependencies
import React from "react";
import { NavLink } from "react-router";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { CaretRight } from "@phosphor-icons/react";

const Breadcrumbs: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <div className="w-full flex items-center gap-x-2">
      {breadcrumbs.map(({ breadcrumb, key, location }, index) => (
        <div key={index} className="flex items-center gap-x-2">
          {index > 0 ? (
            <CaretRight
              className="text-breadcrumb-inactive"
              size={16}
              weight="bold"
            />
          ) : null}

          <NavLink
            to={key}
            className={`anchor ${
              key === location.pathname
                ? "text-breadcrumb"
                : "text-breadcrumb-inactive"
            }`}
          >
            {breadcrumb}
          </NavLink>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;

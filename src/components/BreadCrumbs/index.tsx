// dependencies
import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { CaretRight } from "@phosphor-icons/react";

const Breadcrumbs: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <div className="w-full flex items-center gap-x-2">
      {breadcrumbs.map(({ breadcrumb, key }, index) => (
        <div key={key} className="flex items-center gap-x-2">
          {index > 0 ? (
            <CaretRight
              className="text-breadcrumb-inactive"
              size={16}
              weight="bold"
            />
          ) : null}

          <span className="text-breadcrumb">{breadcrumb}</span>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;

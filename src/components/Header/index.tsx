// dependencies
import React from "react";

// components
import TSLogixLogo from "@/assets/TSLogixLogo.webp";
import BreadCrumbs from "../BreadCrumbs";

const Header: React.FC = () => {
  return (
    <div className="w-full flex bg-white items-center gap-x-4">
      <div>
        <img src={TSLogixLogo} className="w-64" />
      </div>
      <div>
        <BreadCrumbs />
      </div>
    </div>
  );
};

export default Header;

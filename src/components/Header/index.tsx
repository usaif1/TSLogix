// dependencies
import React from "react";
import { useNavigate } from "react-router";

// components
import TSLogixLogo from "@/assets/TSLogixLogo.webp";
import BreadCrumbs from "../BreadCrumbs";

const Header: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex bg-white items-center gap-x-4">
      <div>
        <img onClick={() => navigate("/")} src={TSLogixLogo} className="w-64" />
      </div>
      <div>
        <BreadCrumbs />
      </div>
    </div>
  );
};

export default Header;

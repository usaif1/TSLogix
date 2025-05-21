// dependencies
import React from "react";
import { useNavigate } from "react-router";

// components
import TSLogixLogo from "@/assets/TSLogixLogo.webp";
import BreadCrumbs from "../BreadCrumbs";
import LanguageSwitcher from "../LanguageSwitcher";

const Header: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex bg-white items-center justify-between px-4">
      <div className="flex items-center gap-x-4">
        <div>
          <img 
            onClick={() => navigate("/")} 
            src={TSLogixLogo} 
            className="w-64 cursor-pointer" 
            alt="TSLogix Logo"
          />
        </div>
        <div>
          <BreadCrumbs />
        </div>
      </div>
      <div>
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default Header;

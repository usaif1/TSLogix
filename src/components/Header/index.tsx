// dependencies
import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

// assets
import TSLLogo from "@/assets/TSLLogo.svg?react";

// components
import TSLogixLogo from "@/assets/TSLogixLogo.webp";
import BreadCrumbs from "../BreadCrumbs";
import LanguageSwitcher from "../LanguageSwitcher";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  return (
    <div className="relative w-full flex bg-white items-center justify-between px-4">
      <div className="rounded-md absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <TSLLogo className="w-36" />
      </div>

      <div className="flex items-center gap-x-4">
        <div>
          <img
            onClick={() => navigate("/")}
            src={TSLogixLogo}
            className="w-64 cursor-pointer"
            alt={t("common:logo_alt_text")}
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

import React from "react";
import { useTranslation } from "react-i18next";
import { AuthService } from "@/globalService";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-md h-10 bg-red-500 hover:bg-red-600 cursor-pointer text-white font-bold"
    >
      {t('logout')}
    </button>
  );
};

export default LogoutButton;

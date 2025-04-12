import React from "react";
import { Button } from "@/components";
import { AuthService } from "@/globalService";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate("/");
  };

  return (
    <Button onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;

import React, { useEffect } from "react";
import { useNavigate } from "react-router";

const MaintenanceHome: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("process home useEffect")

    navigate("/maintenance/supplier", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>loading...</div>;
};

export default MaintenanceHome;

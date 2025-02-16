import React, { useEffect } from "react";
import { useNavigate } from "react-router";

const ProcessHome: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/processes/entry", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>loading...</div>;
};

export default ProcessHome;

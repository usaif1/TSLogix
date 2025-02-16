// dependencies
import React, { ReactNode } from "react";

interface LoginLayoutProps {
  children: ReactNode;
}

const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return <main className="main items-center justify-center">{children}</main>;
};

export default LoginLayout;

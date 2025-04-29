import React from "react";

interface CardProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children }) => (
  <div className="overflow-hidden">
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ children }) => (
  <div className="">
    {children}
  </div>
);
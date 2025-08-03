// dependencies
import React from "react";

// components
import { LoginForm, LoginHeader } from "../components";
import CustomText from "@/components/Text";

// assets
import WarehouseImage from "@/assets/WhatsApp Image 2025-07-12 at 23.12.54.jpeg";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Image Section - 3/4 of screen on desktop, background on mobile */}
      <div className="lg:w-3/4 relative lg:flex hidden">
        <img 
          src={WarehouseImage}
          alt="TSLogix Warehouse Facility"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
        
        {/* Company branding overlay */}
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-5xl font-bold mb-3 tracking-tight">TS LOGIX</h1>
          <p className="text-xl opacity-90 font-light">Soluciones Integrales de Almacén</p>
          <p className="text-lg opacity-75 mt-1">Warehouse Management System</p>
        </div>
      </div>
      
      {/* Login Form Section - 1/4 of screen on desktop, full screen on mobile */}
      <div className="w-full lg:w-1/4 flex items-center justify-center bg-white px-6 py-8 lg:px-8 lg:py-12 min-h-screen lg:min-h-0 relative">
        {/* Mobile background */}
        <div className="lg:hidden absolute inset-0 opacity-10">
          <img 
            src={WarehouseImage}
            alt="TSLogix Warehouse Facility"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="w-full max-w-sm relative z-10">
          <LoginHeader />
          <div className="mt-8">
            <LoginForm />
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <CustomText size="xs" additionalClass="text-gray-500">
              © 2025 TS LOGIX. Todos los derechos reservados.
            </CustomText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// dependencies
import React from "react";

//components
import TSLogixLogo from "@/assets/TSLogixLogo.webp";
import CustomText from "@/components/Text";

const LoginHeader: React.FC = () => {
  return (
    <div className="text-center">
      <img src={TSLogixLogo} alt="TSLogix Peru" className="h-16 mx-auto mb-4" />
      <CustomText size="2xl" weight="font-bold" additionalClass="text-gray-900 mb-2">
        Bienvenido de nuevo
      </CustomText>
      <CustomText size="sm" weight="font-normal" additionalClass="text-gray-600">
        Inicia sesión en tu cuenta
      </CustomText>
    </div>
  );
};

export default LoginHeader;

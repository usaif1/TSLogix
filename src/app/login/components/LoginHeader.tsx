// dependencies
import React from "react";
import Image from "next/image";

//components
import TSLogixLogo from "@/assets/TSLogixLogo.webp";
import { Text, Divider } from "@/components";

const LoginHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image src={TSLogixLogo} alt="TSLogix Peru" className="w-full h-20" />
      <Divider height="xs" />
      <Text size="xl" weight="font-medium">
        Warehouse Control System
      </Text>
    </div>
  );
};

export default LoginHeader;

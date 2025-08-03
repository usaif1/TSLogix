// dependencies
import React from "react";
import SyncLoader from "react-spinners/SyncLoader";

// components
import Text from "../Text";

type Props = {
  loaderText?: string;
  size?: "sm" | "md" | "lg";
  additionalClass?: string;
};

const LoaderSync: React.FC<Props> = ({ 
  loaderText = "Loading...", 
  size = "md",
  additionalClass = "" 
}) => {
  const sizeMap = {
    sm: { textSize: "sm" as const, spinnerSize: 8 },
    md: { textSize: "base" as const, spinnerSize: 10 },
    lg: { textSize: "lg" as const, spinnerSize: 12 }
  };

  const { textSize, spinnerSize } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${additionalClass}`}>
      <div className="flex items-center gap-x-2">
        {loaderText && (
          <Text size={textSize} weight="font-medium">
            {loaderText}
          </Text>
        )}
        <SyncLoader color="#2c2b6d" size={spinnerSize} />
      </div>
    </div>
  );
};

export default LoaderSync;

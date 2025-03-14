// dependencies
import React from "react";
import SyncLoader from "react-spinners/SyncLoader";

// components
import Text from "../Text";

type Props = {
  loaderText: string;
};

const LoaderSync: React.FC<Props> = ({ loaderText }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center gap-x-2">
        <Text size="lg" weight="font-medium">
          {loaderText}
        </Text>
        <SyncLoader color="#2c2b6d" size={10} />
      </div>
    </div>
  );
};

export default LoaderSync;

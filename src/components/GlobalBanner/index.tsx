// dependencies
import React from "react";
import Text from "../Text";

const GlobalBanner: React.FC = () => {
  return (
    <div className="w-full relative border border-blue-950 py-2 bg-white">
      <div className="text-white absolute left-12 top-0 h-full bg-blue-500 flex items-center justify-center">
        TSLogix Logo goes here
      </div>
      <div>
        <Text additionalClass="text-center text-blue-800 font-bold">
          Your products in the hands of professionals do everything right in the
          right way
        </Text>
        <Text additionalClass="text-center text-blue-800 font-bold">
          &quot; Do everything right in the right way &quot;
        </Text>
      </div>
    </div>
  );
};

export default GlobalBanner;

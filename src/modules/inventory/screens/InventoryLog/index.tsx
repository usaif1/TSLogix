import React, { useMemo, useEffect, useCallback } from "react";
import { Plus } from "@phosphor-icons/react";


// services
import { ProcessService } from "@/globalService";

// store
import { ProcessesStore } from "@/globalStore";

const InventoryLog: React.FC = () => {
  const { loaders } = ProcessesStore();

  return (
    <div className="flex flex-col h-full">
      <p>hello world</p>
    </div>
  );
};

export default InventoryLog;

// dependencies
import React from "react";

// components
import { Divider, Text } from "@/components";

const NewMassEntryOrderForm: React.FC = () => {
  return (
    <form className="order_entry_form">
      <Text size="xl" weight="font-medium">
        Bulk Entry Order Registration
      </Text>
      <Divider />
      <div className="flex items-center">
        <div className="flex flex-col">
          <label>Origin</label>
          <input
            type="text"
            name="origin"
            className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        <div className="flex flex-col">
          <label>Origin</label>
          <input
            type="text"
            name="origin"
            className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>
    </form>
  );
};

export default NewMassEntryOrderForm;

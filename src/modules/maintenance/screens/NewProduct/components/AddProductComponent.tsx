// dependencies
import React from "react";
import Select, { CSSObjectWithLabel } from "react-select";

// components
import { Button, Divider } from "@/components";

const originOptions = [
  { value: "originOption1", label: "originOption1" },
  { value: "originOption2", label: "originOption2" },
  { value: "originOption3", label: "originOption3" },
];

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

const AddProductComponent: React.FC = () => {
  return (
    <div>
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="personnel_in_charge">Line Name</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="personnel_in_charge"
            name="personnel_in_charge"
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="personnel_in_charge">Group Name</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="personnel_in_charge"
            name="personnel_in_charge"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Product Name</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Manufacturer</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Temperature</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">State</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Humidity</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>
      <Divider height="lg" />
      <div className="flex gap-10">
        <Button variant="action" additionalClass="w-40">
          Add
        </Button>
        <Button variant="cancel" additionalClass="w-40">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddProductComponent;

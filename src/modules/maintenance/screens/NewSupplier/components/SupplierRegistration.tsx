// dependencies
import React, { useState } from "react";
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

const SupplierRegistration: React.FC = () => {

  return (
    <form className="order_entry_form">
      <div className="w-full flex items-center gap-x-6">
        {/* Company Name */}
        <div className="w-full flex flex-col">
          <label htmlFor="origin">Company Name</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* entry order no */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">RUC</label>
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
        {/* address */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Address</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* city */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">City</label>
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
        {/* personnel in charge */}
        <div className="w-full flex flex-col">
          <label htmlFor="personnel_in_charge">Country</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="personnel_in_charge"
            name="personnel_in_charge"
          />
        </div>

        {/* Phone */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Phone</label>
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
      <div>
        <div className="w-full flex items-center gap-x-6">
          <div className="w-full flex flex-col">
            <label htmlFor="entry_order_no">Phone</label>
            <input
              type="text"
              disabled
              id="entry_order_no"
              name="entry_order_no"
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>

          <div className="w-full flex flex-col">
            <label htmlFor="entry_order_no">Email</label>
            <input
              type="text"
              disabled
              id="entry_order_no"
              name="entry_order_no"
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>
        </div>
      </div>
      <Divider height="lg" />
      <div className="flex gap-10">
        <Button variant="action" additionalClass="w-40">
          Register
        </Button>
        <Button variant="cancel" additionalClass="w-40">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default SupplierRegistration;

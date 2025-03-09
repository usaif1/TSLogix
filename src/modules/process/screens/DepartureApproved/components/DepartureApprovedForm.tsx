// dependencies
import React, { useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";

// components
import { Button, Divider } from "@/components";

const DepartureApprovedForm: React.FC = () => {
  return (
    <form className="order_entry_form">
      <div className="w-full flex items-center gap-x-6">
        {/* Entry Order No */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Dispatch Order No</label>
          <input
            type="text"
            autoCapitalize="on"
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
        {/* Palettes */}
        <div className="w-full flex flex-col">
          <label htmlFor="palletes">Palettes</label>
          <input
            type="text"
            autoCapitalize="on"
            id="palletes"
            name="palletes"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Product Description */}
        <div className="w-full flex flex-col">
          <label htmlFor="product_description">Product Description</label>
          <textarea
            id="product_description"
            name="product_description"
            className="border border-slate-400 rounded-md px-4 pt-2 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Quantity */}
        <div className="w-full flex flex-col">
          <label htmlFor="quantity">Quantity</label>
          <div className="w-full flex items-end gap-x-2">
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>
        </div>

        {/* Weight */}
        <div className="w-full flex flex-col">
          <label htmlFor="weight">Weight</label>
          <div className="w-full flex items-end gap-x-2">
            <input
              type="number"
              id="weight"
              name="weight"
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
            <span>Kg</span>
          </div>
        </div>

        {/* Insured Value */}
        <div className="w-full flex flex-col">
          <label htmlFor="insured_value">Insured Value</label>
          <input
            type="number"
            id="insured_value"
            name="insured_value"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Date of Entry */}
        <div className="w-1/2 flex flex-col">
          <label htmlFor="entry_date">Date of Dispatch</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="entry_date"
            name="entry_date"
          />
        </div>

        {/* Entry Transfer Note */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_transfer_note">Dispatch Transfer Note</label>
          <input
            type="text"
            id="entry_transfer_note"
            name="entry_transfer_note"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Presentation */}
        <div className="w-full flex flex-col">
          <label htmlFor="presentation">Presentation</label>
          <input
            type="text"
            id="presentation"
            name="presentation"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* Order Status */}
        <div className="w-full flex flex-col">
          <label htmlFor="order_status">Status</label>
          <input
            type="number"
            id="order_status"
            name="order_status"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* Order Type */}
        <div className="w-full flex flex-col">
          <label htmlFor="order_type">Type</label>
          <input
            type="number"
            id="order_type"
            name="order_type"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Comments */}
        <div className="w-full flex flex-col">
          <label htmlFor="comments">Comments</label>
          <textarea
            id="comments"
            name="comments"
            className="border border-slate-400 rounded-md px-4 pt-2 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider height="2xl" />

      <div>
        <Button
          variant="action"
          additionalClass="w-40"
          type="submit"
          disabled
        >
          Register
        </Button>
      </div>
    </form>
  );
};

export default DepartureApprovedForm;

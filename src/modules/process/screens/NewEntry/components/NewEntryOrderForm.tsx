/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import DatePicker from "react-datepicker";

// components
import { Button, Divider, Text } from "@/components";
import { EntryFormData } from "@/modules/process/types";

const NewEntryOrderForm: React.FC = () => {
  // Define states for all form fields
  const [formData, setFormData] = useState<EntryFormData>({
    palletes: "",
    entry_order_no: "",
    order_status: "",
    insured_value: "",
    presentation: "",
    total_qty: "",
    code: "",
    product_description: "",
    weight: "",
    quantity: "",
    entry_date: new Date(),
    entry_transfer_note: "",
    order_type: "",
    comments: "",
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Convert numeric strings to numbers if possible, otherwise keep as string.
    const updatedValue =
      value === "" ? "" : isNaN(Number(value)) ? value : Number(value);

    setFormData((prevState) => ({
      ...prevState,
      [name]: updatedValue,
    }));
  };

  // Simplified form validation that checks every field is filled
  const isFormValid = () =>
    Object.values(formData).every((value) => {
      if (typeof value === "string") return value.trim() !== "";
      if (value instanceof Date) return !isNaN(value.getTime());
      return value !== null && value !== undefined;
    });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add submission logic here
  };

  return (
    <form className="order_entry_form" onSubmit={onSubmit}>
      <div className="w-full flex items-center gap-x-6">
        {/* Entry Order No */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Entry Order No</label>
          <input
            type="text"
            autoCapitalize="on"
            id="entry_order_no"
            name="entry_order_no"
            value={formData.entry_order_no}
            onChange={handleChange}
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
            value={formData.palletes}
            onChange={handleChange}
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
            value={formData.product_description}
            onChange={handleChange}
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
              value={formData.quantity}
              onChange={handleChange}
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
              value={formData.weight}
              onChange={handleChange}
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
            <Text>Kg</Text>
          </div>
        </div>

        {/* Insured Value */}
        <div className="w-full flex flex-col">
          <label htmlFor="insured_value">Insured Value</label>
          <input
            type="number"
            id="insured_value"
            name="insured_value"
            value={formData.insured_value}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Date of Entry */}
        <div className="w-1/2 flex flex-col">
          <label htmlFor="entry_date">Date of Entry</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="entry_date"
            name="entry_date"
            selected={formData.entry_date}
            onChange={(date) =>
              setFormData({ ...formData, entry_date: date as Date })
            }
          />
        </div>

        {/* Entry Transfer Note */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_transfer_note">Entry Transfer Note</label>
          <input
            type="text"
            id="entry_transfer_note"
            name="entry_transfer_note"
            value={formData.entry_transfer_note}
            onChange={handleChange}
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
            value={formData.presentation}
            onChange={handleChange}
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
            value={formData.order_status}
            onChange={handleChange}
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
            value={formData.order_type}
            onChange={handleChange}
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
            value={formData.comments}
            onChange={handleChange}
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
          disabled={!isFormValid()}
        >
          Register
        </Button>
      </div>
    </form>
  );
};

export default NewEntryOrderForm;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";

// components
import { Button, Divider } from "@/components";
import { DepartureFormData } from "@/modules/process/types";
import { ProcessesStore } from "@/globalStore";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

const DepartureApprovedForm: React.FC = () => {
  const { customers, documentTypes, labels, packagingTypes, users } =
    ProcessesStore();

  // Initialize your form data state
  const [formData, setFormData] = useState<DepartureFormData>({
    customer: { option: "", value: "" },
    departure_order_no: "",
    registration_date: new Date(),
    document_type: { option: "", value: "" },
    document_no: "",
    document_date: new Date(),
    transfer_date_and_time: new Date(),
    personnel_in_charge: "",
    document_status: { option: "", value: "" },
    arrival_point: "",
    packaging_type: { option: "", value: "" },
    labeled: { option: "", value: "" },
    id_responsible: "",
    collection_responsible: "",
    order_status: "",
    observation: "",
  });

  // Handlers for text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for react-select
  const handleSelectChange = (name: keyof DepartureFormData, newValue: any) => {
    // If using string state, store newValue.value
    setFormData((prev) => ({
      ...prev,
      [name]: newValue ? newValue.value : "",
    }));
  };

  // Handler for date fields
  const handleDateChange = (name: keyof DepartureFormData, date: Date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  // For radio buttons like order_status
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form className="order_entry_form space-y-4">
      {/* Row 1 */}
      <div className="flex items-center gap-x-6">
        {/* Customer */}
        <div className="w-full flex flex-col">
          <label htmlFor="customer" className="mb-1 font-medium">
            Customer
          </label>
          <Select
            options={customers}
            styles={reactSelectStyle}
            inputId="customer"
            name="customer"
            // find the matching option or pass null
            value={
              formData.customer
                ? { value: formData.customer, label: formData.customer }
                : null
            }
            onChange={(option) => handleSelectChange("customer", option)}
          />
        </div>

        {/* Departure Order No */}
        <div className="w-full flex flex-col">
          <label htmlFor="departure_order_no" className="mb-1 font-medium">
            Departure Order No
          </label>
          <input
            type="text"
            id="departure_order_no"
            name="departure_order_no"
            value={formData.departure_order_no}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 
                       focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* Registration Date */}
        <div className="w-full flex flex-col">
          <label htmlFor="registration_date" className="mb-1 font-medium">
            Registration Date
          </label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            id="registration_date"
            name="registration_date"
            selected={formData.registration_date}
            onChange={(date) =>
              handleDateChange("registration_date", date as Date)
            }
            className="w-full h-10 border border-slate-400 rounded-md pl-4 
                       focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      {/* Row 2 */}
      <div className="flex items-center gap-x-6">
        {/* Document Type */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_type" className="mb-1 font-medium">
            Document Type
          </label>
          <Select
            options={documentTypes}
            styles={reactSelectStyle}
            inputId="document_type"
            name="document_type"
            value={formData.document_type}
            onChange={(option) => handleSelectChange("document_type", option)}
          />
        </div>

        {/* Document No */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_no" className="mb-1 font-medium">
            Document No
          </label>
          <input
            type="text"
            id="document_no"
            name="document_no"
            value={formData.document_no}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 
                       focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* Document Date */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_date" className="mb-1 font-medium">
            Document Date
          </label>
          <DatePicker
            id="document_date"
            name="document_date"
            selected={formData.document_date}
            onChange={(date) => handleDateChange("document_date", date as Date)}
            className="w-full h-10 border border-slate-400 rounded-md pl-4 
                       focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      {/* Row 3 */}
      <div className="flex items-center gap-x-6">
        {/* Transfer Date and Time */}
        <div className="w-full flex flex-col">
          <label htmlFor="transfer_date_and_time" className="mb-1 font-medium">
            Date and Time of Transfer
          </label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            id="transfer_date_and_time"
            name="transfer_date_and_time"
            selected={formData.transfer_date_and_time}
            onChange={(date) =>
              handleDateChange("transfer_date_and_time", date as Date)
            }
            className="w-full h-10 border border-slate-400 rounded-md pl-4 
                       focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* Personnel In Charge */}
        <div className="w-full flex flex-col">
          <label htmlFor="personnel_in_charge" className="mb-1 font-medium">
            Personnel In Charge
          </label>
          <Select
            options={users}
            styles={reactSelectStyle}
            inputId="personnel_in_charge"
            name="personnel_in_charge"
            value={formData.personnel_in_charge}
            onChange={(option) =>
              handleSelectChange("personnel_in_charge", option)
            }
          />
        </div>

        {/* Document Status */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_status" className="mb-1 font-medium">
            Document Status
          </label>
          <Select
            options={labels}
            styles={reactSelectStyle}
            inputId="document_status"
            name="document_status"
            value={
              formData.document_status
                ? {
                    value: formData.document_status,
                    label: formData.document_status,
                  }
                : null
            }
            onChange={(option) => handleSelectChange("document_status", option)}
          />
        </div>
      </div>

      <Divider />

      {/* Row 4 */}
      <div className="flex items-center gap-x-6">
        {/* Arrival Point */}
        <div className="w-full flex flex-col">
          <label htmlFor="arrival_point" className="mb-1 font-medium">
            Arrival Point
          </label>
          <input
            type="text"
            id="arrival_point"
            name="arrival_point"
            value={formData.arrival_point}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 
                       focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* Packaging Type */}
        <div className="w-full flex flex-col">
          <label htmlFor="packaging_type" className="mb-1 font-medium">
            Packaging Type
          </label>
          <Select
            options={packagingTypes}
            styles={reactSelectStyle}
            inputId="packaging_type"
            name="packaging_type"
            value={
              formData.packaging_type
                ? {
                    value: formData.packaging_type,
                    label: formData.packaging_type,
                  }
                : null
            }
            onChange={(option) => handleSelectChange("packaging_type", option)}
          />
        </div>

        {/* Labeled */}
        <div className="w-full flex flex-col">
          <label htmlFor="labeled" className="mb-1 font-medium">
            Labeled
          </label>
          <Select
            options={labels}
            styles={reactSelectStyle}
            inputId="labeled"
            name="labeled"
            value={
              formData.labeled
                ? { value: formData.labeled, label: formData.labeled }
                : null
            }
            onChange={(option) => handleSelectChange("labeled", option)}
          />
        </div>
      </div>

      <Divider />

      {/* Row 5 */}
      <div className="flex items-center gap-x-6">
        {/* ID Responsible */}
        <div className="w-full flex flex-col">
          <label htmlFor="id_responsible" className="mb-1 font-medium">
            ID Responsible
          </label>
          <input
            type="text"
            id="id_responsible"
            name="id_responsible"
            value={formData.id_responsible}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 
                       focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* Responsible for Collection */}
        <div className="w-full flex flex-col">
          <label htmlFor="collection_responsible" className="mb-1 font-medium">
            Responsible for Collection
          </label>
          <input
            type="text"
            id="collection_responsible"
            name="collection_responsible"
            value={formData.collection_responsible}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 
                       focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      {/* Row 6: Radio Buttons for Order Status */}
      <div className="flex items-center gap-x-6">
        <div>
          <input
            type="radio"
            id="order_in_process"
            name="order_status"
            value="order_in_process"
            checked={formData.order_status === "order_in_process"}
            onChange={handleInputChange}
          />
          <label htmlFor="order_in_process" className="ml-1">
            Order in Process
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="send_order"
            name="order_status"
            value="send_order"
            checked={formData.order_status === "send_order"}
            onChange={handleRadioChange}
          />
          <label htmlFor="send_order" className="ml-1">
            Send Order
          </label>
        </div>
      </div>

      <Divider />

      {/* Row 7: Observation */}
      <div className="flex flex-col">
        <label htmlFor="observation" className="mb-1 font-medium">
          Observation
        </label>
        <textarea
          id="observation"
          name="observation"
          value={formData.observation}
          onChange={handleInputChange}
          className="border border-slate-400 rounded-md px-4 pt-2 
                     focus-visible:outline-1 focus-visible:outline-primary-500"
        />
      </div>

      <Divider />

      {/* Submit or Action Button */}
      <div className="mt-4">
        <Button
          variant="action"
          additionalClass="w-40"
          onClick={() => console.log("Submit clicked")}
        >
          Add Product
        </Button>
      </div>
    </form>
  );
};

export default DepartureApprovedForm;

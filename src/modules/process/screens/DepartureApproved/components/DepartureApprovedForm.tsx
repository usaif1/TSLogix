// dependencies
import React, { useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";

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

const DepartureApprovedForm: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <form className="order_entry_form">
      <div className="w-full flex items-center gap-x-6">
        {/* customer */}
        <div className="w-full flex flex-col">
          <label htmlFor="origin">Customer</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="customer"
            name="customer"
          />
        </div>

        {/* departure order no */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Departure Order No</label>
          <input
            type="text"
            disabled
            id="departure_order_no"
            name="departure_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* registration date */}

        <div className="w-full flex flex-col">
          <label htmlFor="registration_date">Registration Date</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="registration_date"
            name="registration_date"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* document type */}
        <div className="w-full flex flex-col">
          <label htmlFor="document">Document Type</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="document"
            name="document"
          />
        </div>

        {/* document no */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Document No</label>
          <input
            type="text"
            disabled
            id="document_no"
            name="document_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* document date */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_date">Document Date</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="document_date"
            name="document_date"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* transfer date and time */}
        <div className="w-full flex flex-col">
          <label htmlFor="transfer_date_and_time">
            Date and Time of Transfer
          </label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="transfer_date_and_time"
            name="transfer_date_and_time"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>

        {/* personnel in charge */}
        <div className="w-full flex flex-col">
          <label htmlFor="personnel_in_charge">Personnel In Charge</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="personnel_in_charge"
            name="personnel_in_charge"
          />
        </div>

        {/* document status */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_status">Document Status</label>
          <Select
            options={originOptions}
            isDisabled
            styles={reactSelectStyle}
            inputId="document_status"
            name="document_status"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* arrival point */}
        <div className="w-full flex flex-col">
          <label htmlFor="arrival_point">Arrival Point</label>
          <input
            type="text"
            disabled
            id="arrival_point"
            name="arrival_point"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* packaging type */}
        <div className="w-full flex flex-col">
          <label htmlFor="packaging_type">Packaging Type</label>
          <Select
            options={originOptions}
            isDisabled
            styles={reactSelectStyle}
            inputId="packaging_type"
            name="packaging_type"
          />
        </div>

        {/* labeled */}
        <div className="w-full flex flex-col">
          <label htmlFor="packaging_type">Labeled</label>
          <Select
            options={originOptions}
            isDisabled
            styles={reactSelectStyle}
            inputId="packaging_type"
            name="packaging_type"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* ID responsible */}
        <div className="w-full flex flex-col">
          <label htmlFor="id_responsible">ID Responsible</label>
          <input
            type="text"
            disabled
            id="id_responsible"
            name="id_responsible"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* responsible for collection */}
        <div className="w-full flex flex-col">
          <label htmlFor="collection_responsible">
            Responsible for Collection
          </label>
          <input
            type="text"
            disabled
            id="collection_responsible"
            name="collection_responsible"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div>
        <div className="w-full flex items-center gap-x-6">
          <div>
            <input
              type="radio"
              id="order_in_process"
              name="order_status"
              value="order_in_process"
            />
            <label htmlFor="order_in_process"> Order in Process</label>
          </div>
          <div>
            <input
              type="radio"
              id="send_order"
              name="order_status"
              value="send_order"
            />
            <label htmlFor="send_order"> Send Order</label>
          </div>
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="observation">Observation</label>
          <textarea
            id="observation"
            name="observation"
            className="border border-slate-400 rounded-md px-4 pt-2 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div>
        <Button variant="action" additionalClass="w-40">
          Add Product
        </Button>
      </div>
    </form>
  );
};

export default DepartureApprovedForm;

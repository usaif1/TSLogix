// dependencies
import React, { useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";

// components
import { Button, Divider, Text } from "@/components";

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

const NewMassEntryOrderForm: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <form className="order_entry_form">
      <div className="w-full flex items-center gap-x-6">
        {/* origin */}
        <div className="w-full flex flex-col">
          <label htmlFor="origin">Origin</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="origin"
            name="origin"
          />
        </div>

        {/* entry order no */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">Entry Order No</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* document */}
        <div className="w-full flex flex-col">
          <label htmlFor="document">Document</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="document"
            name="document"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
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

        {/* admission date and time */}
        <div className="w-full flex flex-col">
          <label htmlFor="admission_date_and_time">
            Admission Date and Time
          </label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="admission_date_and_time"
            name="admission_date_and_time"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
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
      <div className="w-full flex items-center gap-x-6">
        {/* total volume */}
        <div className="w-full flex flex-col">
          <label htmlFor="total_volume">Total Volume</label>
          <div className="w-full flex items-end gap-x-2">
            <input
              type="text"
              disabled
              id="total_volume"
              name="total_volume"
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
            <Text>M3</Text>
          </div>
        </div>

        {/* total weight */}
        <div className="w-full flex flex-col">
          <label htmlFor="total_weight">Total Weight</label>
          <div className="w-full flex items-end gap-x-2">
            <input
              type="text"
              disabled
              id="total_weight"
              name="total_weight"
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
            <Text>Kg</Text>
          </div>
        </div>

        {/* CIF value/ Purchase Value */}
        <div className="w-full flex flex-col">
          <label htmlFor="cif_value_purchase_value">
            CIF Value/ Purchase Value
          </label>
          <input
            type="text"
            disabled
            id="cif_value_purchase_value"
            name="cif_value_purchase_value"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* supplier */}
        <div className="w-full flex flex-col">
          <label htmlFor="supplier">Archive</label>
          <input
            type="text"
            disabled
            id="supplier"
            name="supplier"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* product */}
        <div className="w-full flex flex-col">
          <label htmlFor="product">Product</label>
          <input
            type="text"
            disabled
            id="product"
            name="product"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* protocol/ analysis certificate */}
        <div className="w-full flex flex-col">
          <label htmlFor="protocol_analysis_certificate">
            Protocol/ Analysis Certificate
          </label>
          <input
            type="text"
            disabled
            id="protocol_analysis_certificate"
            name="protocol_analysis_certificate"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* manufacturing date */}
        <div className="w-full flex flex-col">
          <label htmlFor="manufacturing_date">Manufacturing Date</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="manufacturing_date"
            name="manufacturing_date"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>

        {/* expiration date */}
        <div className="w-full flex flex-col">
          <label htmlFor="expiration_date">Expiration Date</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="expiration_date"
            name="expiration_date"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>

        {/* lot/ series */}
        <div className="w-full flex flex-col">
          <label htmlFor="lot_series">Lot/ Series</label>
          <input
            type="text"
            disabled
            id="lot_series"
            name="lot_series"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* quantity packaging */}
        <div className="w-full flex flex-col">
          <label htmlFor="quantity_packaging">Quantity Packaging</label>
          <input
            type="text"
            disabled
            id="quantity_packaging"
            name="quantity_packaging"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* presentation */}
        <div className="w-full flex flex-col">
          <label htmlFor="presentation">Presentation</label>
          <input
            type="text"
            disabled
            id="presentation"
            name="presentation"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* total qty (units) */}
        <div className="w-full flex flex-col">
          <label htmlFor="total_qty_units">Total Qty (Units)</label>
          <input
            type="text"
            disabled
            id="total_qty_units"
            name="total_qty_units"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* technical specification */}
        <div className="w-full flex flex-col">
          <label htmlFor="technical_specification">
            Technical Specification
          </label>
          <input
            type="text"
            disabled
            id="technical_specification"
            name="technical_specification"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* temperature */}
        <div className="w-full flex flex-col">
          <label htmlFor="temperature">Temperature</label>
          <input
            type="text"
            disabled
            id="temperature"
            name="temperature"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* humidity */}
        <div className="w-full flex flex-col">
          <label htmlFor="humidity">Humidity</label>
          <input
            type="text"
            disabled
            id="humidity"
            name="humidity"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div>
        <Button variant="action" additionalClass="w-40">
          Register
        </Button>
      </div>
    </form>
  );
};

export default NewMassEntryOrderForm;

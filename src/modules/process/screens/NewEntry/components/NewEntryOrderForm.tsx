/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";

// components
import { Button, Divider, Text } from "@/components";
import { ProcessesStore } from "@/globalStore";
import { EntryFormData } from "@/modules/process/types";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

const NewEntryOrderForm: React.FC = () => {
  const { documentTypes, origins, users, suppliers } = ProcessesStore();

  // Define states for all form fields
  const [formData, setFormData] = useState<EntryFormData>({
    origin: { option: "", value: "" },
    palettes: "",
    product_description: "",
    insured_value: "",
    entry_order_no: "",
    document: { option: "", value: "" },
    registration_date: new Date(),
    document_date: new Date(),
    admission_date_and_time: new Date(),
    entry_date: new Date(),
    entry_transfer_note: "",
    personnel_in_charge: { option: "", value: "" },
    document_status: { option: "Registered", value: "REGISTERED" },
    order_status: "",
    observation: "",
    total_volume: "",
    total_weight: "",
    cif_value: "",
    supplier: { option: "", value: "" },
    product: "",
    protocol_analysis_certificate: null,
    manufacturing_date: new Date(),
    expiration_date: new Date(),
    lot_series: "",
    quantity_packaging: "",
    presentation: "",
    total_qty: "",
    technical_specification: null,
    temperature: "",
    humidity: "",
    type: "",
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Ensure the value is either a number or string
    const updatedValue =
      value === "" ? "" : isNaN(Number(value)) ? value : Number(value);

    setFormData((prevState) => ({
      ...prevState,
      [name]: updatedValue,
    }));
  };

  const handleSelectChange = (name: string, selectedOption: any) => {
    console.log("selected option", selectedOption);

    setFormData((prevState) => ({
      ...prevState,
      [name]: selectedOption,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prevState) => ({
      ...prevState,
      [field]: file,
    }));
  };

  // Function to check if all fields are filled
  const isFormValid = () => {
    for (const key in formData) {
      const fieldValue = formData[key as keyof EntryFormData];

      if (typeof fieldValue === "string") {
        if (fieldValue === "") {
          return false; // If it's an empty string, return false
        }
      } else if (
        fieldValue &&
        typeof fieldValue === "object" &&
        "option" in fieldValue
      ) {
        if (fieldValue.option === "" || fieldValue.value === "") {
          return false; // If 'option' or 'value' is empty, return false
        }
      }
    }
    return true; // All fields are valid
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const documentStatusOptions = useMemo(() => {
    return [{ value: "REGISTERED", label: "Registered" }];
  }, []);

  return (
    <form className="order_entry_form" onSubmit={onSubmit}>
      <div className="w-full flex items-center gap-x-6">
        {/* origin */}
        <div className="w-full flex flex-col">
          <label htmlFor="origin">Origin</label>
          <Select
            options={origins}
            styles={reactSelectStyle}
            inputId="origin"
            name="origin"
            value={formData.origin}
            onChange={(selectedOption) =>
              handleSelectChange("origin", selectedOption)
            }
          />
        </div>

        {/* entry order no */}
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

        {/* document */}
        <div className="w-full flex flex-col">
          <label htmlFor="document">Document</label>
          <Select
            options={documentTypes}
            styles={reactSelectStyle}
            inputId="document"
            name="document"
            value={formData.document}
            onChange={(selectedOption) =>
              handleSelectChange("document", selectedOption)
            }
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
            selected={formData.registration_date}
            onChange={(date) =>
              setFormData({ ...formData, registration_date: date as Date })
            }
          />
        </div>

        {/* document date */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_date">Document Date</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="document_date"
            name="document_date"
            selected={formData.document_date}
            onChange={(date) =>
              setFormData({ ...formData, document_date: date as Date })
            }
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
            selected={formData.admission_date_and_time}
            onChange={(date) =>
              setFormData({
                ...formData,
                admission_date_and_time: date as Date,
              })
            }
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* personnel in charge */}
        <div className="w-full flex flex-col">
          <label htmlFor="personnel_in_charge">Personnel In Charge</label>
          <Select
            options={users}
            styles={reactSelectStyle}
            inputId="personnel_in_charge"
            name="personnel_in_charge"
            value={formData.personnel_in_charge}
            onChange={(selectedOption) =>
              handleSelectChange("personnel_in_charge", selectedOption)
            }
          />
        </div>

        {/* document status */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_status">Document Status</label>
          <Select
            options={documentStatusOptions}
            isDisabled
            styles={reactSelectStyle}
            inputId="document_status"
            name="document_status"
            value={documentStatusOptions[0]}
            onChange={(selectedOption) =>
              handleSelectChange("document_status", selectedOption)
            }
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
              checked={formData.order_status === "order_in_process"}
              onChange={handleChange}
            />
            <label htmlFor="order_in_process"> Order in Process</label>
          </div>
          <div>
            <input
              type="radio"
              id="send_order"
              name="order_status"
              value="send_order"
              checked={formData.order_status === "send_order"}
              onChange={handleChange}
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
            value={formData.observation}
            onChange={handleChange}
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
              type="number"
              id="total_volume"
              name="total_volume"
              value={formData.total_volume}
              onChange={handleChange}
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
              type="number"
              id="total_weight"
              name="total_weight"
              value={formData.total_weight}
              onChange={handleChange}
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
            <Text>Kg</Text>
          </div>
        </div>

        {/* CIF value/ Purchase Value */}
        <div className="w-full flex flex-col">
          <label htmlFor="cif_value">CIF Value/ Purchase Value</label>
          <input
            type="number"
            id="cif_value"
            name="cif_value"
            value={formData.cif_value}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* supplier */}
        <div className="w-full flex flex-col">
          <label htmlFor="supplier">Supplier</label>
          <Select
            options={suppliers}
            styles={reactSelectStyle}
            inputId="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={(selectedOption) =>
              handleSelectChange("supplier", selectedOption)
            }
          />
        </div>

        {/* product */}
        <div className="w-full flex flex-col">
          <label htmlFor="product">Product</label>
          <input
            type="text"
            id="product"
            name="product"
            value={formData.product}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* protocol/ analysis certificate */}
        <div className="w-full flex flex-col">
          <label htmlFor="protocol_analysis_certificate">
            Protocol/ Analysis Certificate
          </label>

          <div className="flex items-center gap-x-2">
            {/* White box that displays file name or "No file selected" */}
            <input
              type="text"
              className="w-[60%] h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
              readOnly
              value={
                formData.protocol_analysis_certificate
                  ? formData.protocol_analysis_certificate.name
                  : "No file selected"
              }
            />

            {/* Hidden input for file */}
            <input
              type="file"
              accept=".png, .jpg, .jpeg, .webp"
              id="protocol_analysis_certificate"
              className="hidden"
              onChange={(e) =>
                handleFileChange(e, "protocol_analysis_certificate")
              }
            />

            {/* Select file button */}
            <Button
              type="button"
              onClick={() =>
                document
                  .getElementById("protocol_analysis_certificate")
                  ?.click()
              }
            >
              Select File
            </Button>
          </div>
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
            selected={formData.manufacturing_date}
            onChange={(date) =>
              setFormData({ ...formData, manufacturing_date: date as Date })
            }
          />
        </div>

        {/* expiration date */}
        <div className="w-full flex flex-col">
          <label htmlFor="expiration_date">Expiration Date</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="expiration_date"
            name="expiration_date"
            selected={formData.expiration_date}
            onChange={(date) =>
              setFormData({ ...formData, expiration_date: date as Date })
            }
          />
        </div>

        {/* lot/ series */}
        <div className="w-full flex flex-col">
          <label htmlFor="lot_series">Lot/ Series</label>
          <input
            type="text"
            id="lot_series"
            name="lot_series"
            value={formData.lot_series}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">

        {/* expiration date */}
        <div className="w-full flex flex-col">
          <label htmlFor="expiration_date">Palettes</label>
          <input
            type="text"
            id="lot_series"
            name="lot_series"
            value={formData.palettes}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* lot/ series */}
        <div className="w-full flex flex-col">
          <label htmlFor="lot_series">Insured Value</label>
          <input
            type="text"
            id="lot_series"
            name="lot_series"
            value={formData.insured_value}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* manufacturing date */}
        <div className="w-full flex flex-col">
          <label htmlFor="manufacturing_date">Entry Date</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="expiration_date"
            name="expiration_date"
            selected={formData.entry_date}
            onChange={(date) =>
              setFormData({ ...formData, expiration_date: date as Date })
            }
          />
        </div>

        {/* expiration date */}
        <div className="w-full flex flex-col">
          <label htmlFor="expiration_date">Entry Transfer Note</label>
          <input
            type="text"
            id="lot_series"
            name="lot_series"
            value={formData.entry_transfer_note}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* lot/ series */}
        <div className="w-full flex flex-col">
          <label htmlFor="lot_series">Type</label>
          <input
            type="text"
            id="lot_series"
            name="lot_series"
            value={formData.type}
            onChange={handleChange}
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
            type="number"
            id="quantity_packaging"
            name="quantity_packaging"
            value={formData.quantity_packaging}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* presentation */}

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

        {/* total qty (units) */}
        <div className="w-full flex flex-col">
          <label htmlFor="total_qty">Total Qty (Units)</label>
          <input
            type="number"
            id="total_qty"
            name="total_qty"
            value={formData.total_qty}
            onChange={handleChange}
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

          <div className="flex items-center gap-x-2">
            {/* White box that displays file name or "No file selected" */}
            <input
              type="text"
              className="w-[60%] h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
              readOnly
              value={
                formData.technical_specification
                  ? formData.technical_specification.name
                  : "No file selected"
              }
            />

            {/* Hidden input for file */}
            <input
              type="file"
              accept=".png, .jpg, .jpeg, .webp"
              id="technical_specification"
              className="hidden"
              onChange={(e) => handleFileChange(e, "technical_specification")}
            />

            {/* Select file button */}
            <Button
              type="button"
              onClick={() =>
                document.getElementById("technical_specification")?.click()
              }
            >
              Select File
            </Button>
          </div>
        </div>

        {/* temperature */}
        <div className="w-full flex flex-col">
          <label htmlFor="temperature">Temperature</label>
          <input
            type="number"
            id="temperature"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* humidity */}

        <div className="w-full flex flex-col">
          <label htmlFor="humidity">Humidity</label>
          <input
            type="number"
            id="humidity"
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
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

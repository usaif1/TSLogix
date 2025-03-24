/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";

// components
import { Button, Divider, Text } from "@/components";
import FileUpload from "@/components/FileUpload";
import { ProcessesStore } from "@/globalStore";
import { EntryFormData } from "@/modules/process/types";
import { ProcessService } from "@/modules/process/api/process.service";
import { supabase } from "@/lib/supabase/supabaseClient";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

const NewEntryOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    documentTypes,
    origins,
    users,
    products,
    suppliers,
    currentEntryOrderNo,
    entryOrderStatus,
  } = ProcessesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      entry_order_no: currentEntryOrderNo?.currentOrderNo || "",
    }));
  }, [currentEntryOrderNo]);

  const [formData, setFormData] = useState<EntryFormData>({
    origin: { option: "", value: "" },
    palettes: "",
    product_description: "",
    insured_value: "",
    entry_order_no: currentEntryOrderNo?.currentOrderNo || "",
    document_type_id: { option: "", value: "" },
    registration_date: new Date(),
    document_date: new Date(),
    admission_date_time: new Date(),
    entry_date: new Date(),
    entry_transfer_note: "",
    personnel_incharge_id: { option: "", value: "" },
    document_status: { option: "Registered", value: "REGISTERED" },
    order_status: { option: "", value: "" },
    observation: "",
    total_volume: "",
    total_weight: "",
    cif_value: "",
    supplier: { option: "", value: "" },
    product: { option: "", value: "" },
    certificate_protocol_analysis: "",
    mfd_date_time: new Date(),
    expiration_date: new Date(),
    lot_series: "",
    quantity_packaging: "",
    presentation: "",
    total_qty: "",
    technical_specification: "",
    max_temperature: "",
    min_temperature: "",
    humidity: "",
    type: "",
  });

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [techSpecFile, setTechSpecFile] = useState<File | null>(null);

  useEffect(() => {
    if (submitStatus.success) {
      navigate("/processes/entry");
    }
  }, [submitStatus.success, navigate]);

  const handleEntryOrderNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const prefix = currentEntryOrderNo?.currentOrderNo || "";

    if (newValue.startsWith(prefix)) {
      setFormData((prev) => ({
        ...prev,
        entry_order_no: newValue,
      }));
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, selectedOption: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: selectedOption,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      let certificateUrl = "";
      if (certificateFile) {
        const fileName = `${Date.now()}_${certificateFile.name}`;
        const { error } = await supabase.storage
          .from("order")
          .upload(fileName, certificateFile);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from("order")
          .getPublicUrl(fileName);
        certificateUrl = urlData.publicUrl;
      }

      let techSpecUrl = "";
      if (techSpecFile) {
        const fileName = `${Date.now()}_${techSpecFile.name}`;
        const { error } = await supabase.storage
          .from("order")
          .upload(fileName, techSpecFile);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from("order")
          .getPublicUrl(fileName);
        techSpecUrl = urlData.publicUrl;
      }

      const submissionData = { ...formData };

      const apiSubmissionData = {
        ...submissionData,
        document_status: formData.document_status?.value || "REGISTERED",
        origin: formData.origin?.value || "",
        document_type_id: formData.document_type_id?.value || "",
        personnel_incharge_id: formData.personnel_incharge_id?.value || "",
        supplier: formData.supplier?.value || "",
        certificate_protocol_analysis: certificateUrl,
        product: formData.product?.value || "",
        technical_specification: techSpecUrl,
        order_status: formData.order_status?.value || "",
        order_type: "ENTRY",
      };

      await ProcessService.createNewEntryOrder(apiSubmissionData);

      const initialFormData = {
        origin: { option: "", value: "" },
        palettes: "",
        product_description: "",
        insured_value: "",
        entry_order_no: currentEntryOrderNo?.currentOrderNo || "",
        document_type_id: { option: "", value: "" },
        registration_date: new Date(),
        document_date: new Date(),
        admission_date_time: new Date(),
        entry_date: new Date(),
        entry_transfer_note: "",
        personnel_incharge_id: { option: "", value: "" },
        document_status: { option: "Registered", value: "REGISTERED" },
        order_status: { option: "", value: "" },
        observation: "",
        total_volume: "",
        total_weight: "",
        cif_value: "",
        supplier: { option: "", value: "" },
        product: { option: "", value: "" },
        certificate_protocol_analysis: "",
        mfd_date_time: new Date(),
        expiration_date: new Date(),
        lot_series: "",
        quantity_packaging: "",
        presentation: "",
        total_qty: "",
        technical_specification: "",
        max_temperature: "",
        min_temperature: "",
        humidity: "",
        type: "",
      };

      setFormData(initialFormData);
      setCertificateFile(null);
      setTechSpecFile(null);

      setSubmitStatus({
        success: true,
        message: "Entry order created successfully",
      });
    } catch (error) {
      console.error("Error creating entry order:", error);
      setSubmitStatus({
        success: false,
        message: "Failed to create entry order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            onChange={handleEntryOrderNoChange}
            disabled
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* document */}
        <div className="w-full flex flex-col">
          <label htmlFor="document">Document</label>
          <Select
            options={documentTypes}
            styles={reactSelectStyle}
            inputId="document_type_id"
            name="document_type_id"
            value={formData.document_type_id}
            onChange={(selectedOption) =>
              handleSelectChange("document_type_id", selectedOption)
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
            disabled
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
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={20}
            dateFormat="MM/dd/yyyy"
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
            selected={formData.admission_date_time}
            onChange={(date) =>
              setFormData({
                ...formData,
                admission_date_time: date as Date,
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
            inputId="personnel_incharge_id"
            name="personnel_incharge_id"
            value={formData.personnel_incharge_id}
            onChange={(selectedOption) =>
              handleSelectChange("personnel_incharge_id", selectedOption)
            }
          />
        </div>

        {/* document status */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_status">Document Status</label>
          <Select
            options={documentStatusOptions}
            styles={reactSelectStyle}
            inputId="document_status"
            name="document_status"
            value={documentStatusOptions[0]}
            onChange={(selectedOption) =>
              handleSelectChange("document_status", selectedOption)
            }
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="order_status">Order Status</label>
          <Select
            options={entryOrderStatus}
            styles={reactSelectStyle}
            inputId="order_status"
            name="order_status"
            value={documentStatusOptions[0]}
            onChange={(selectedOption) =>
              handleSelectChange("order_status", selectedOption)
            }
          />
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
          <div className="w-full flex items-end gap-x-2">
            <input
              type="number"
              id="cif_value"
              name="cif_value"
              value={formData.cif_value}
              onChange={handleChange}
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
            <Text>$</Text>
          </div>
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
          <Select
            options={products}
            styles={reactSelectStyle}
            inputId="product"
            name="product"
            value={formData.product}
            onChange={(selectedOption) =>
              handleSelectChange("product", selectedOption)
            }
          />
        </div>

        {/* protocol/ analysis certificate */}
        <div className="w-full flex flex-col">
          <FileUpload
            id="certificate_protocol_analysis"
            label="Protocol/ Analysis Certificate"
            onFileSelected={(file: File) => setCertificateFile(file)}
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
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
        {/* manufacturing date */}
        <div className="w-full flex flex-col">
          <label htmlFor="manufacturing_date">Manufacturing Date</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="manufacturing_date"
            name="manufacturing_date"
            selected={formData.mfd_date_time}
            onChange={(date) =>
              setFormData({ ...formData, mfd_date_time: date as Date })
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
        {/* palettes */}
        <div className="w-full flex flex-col">
          <label htmlFor="palettes">Palettes</label>
          <input
            type="text"
            id="palettes"
            name="palettes"
            value={formData.palettes}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* insured value */}
        <div className="w-full flex flex-col">
          <label htmlFor="insured_value">Insured Value</label>
          <input
            type="text"
            id="insured_value"
            name="insured_value"
            value={formData.insured_value}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* technical specification */}
        <div className="w-full flex flex-col">
          <FileUpload
            id="technical_specification"
            label="Technical Specification"
            onFileSelected={(file: File) => {
              console.log("Tech spec file selected:", file.name);
              setTechSpecFile(file);
            }}
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* entry date */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_date">Entry Date</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="entry_date"
            name="entry_date"
            selected={formData.entry_date}
            onChange={(date) =>
              setFormData({ ...formData, entry_date: date as Date })
            }
          />
        </div>

        {/* entry transfer note */}
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

        {/* type */}
        <div className="w-full flex flex-col">
          <label htmlFor="type">Type</label>
          <input
            type="text"
            id="type"
            name="type"
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

        {/* total qty */}
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
        {/* temperature */}
        <div className="w-full flex flex-col">
          <label htmlFor="max_temperature">Max. Temp</label>
          <input
            type="number"
            id="max_temperature"
            name="max_temperature"
            value={formData.max_temperature}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="min_temperature">Min Temp</label>
          <input
            type="number"
            id="min_temperature"
            name="min_temperature"
            value={formData.min_temperature}
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

      {/* Submission status message */}
      {submitStatus.message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            submitStatus.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <Divider height="2xl" />

      <div>
        <Button variant="action" additionalClass="w-40" type="submit">
          {isSubmitting ? "Submitting..." : "Register"}
        </Button>
      </div>
    </form>
  );
};

export default NewEntryOrderForm;

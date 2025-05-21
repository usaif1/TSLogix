/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";

// Components
import { Button, Divider, Text } from "@/components";
import { ProcessesStore } from "@/globalStore";
import { DepartureFormData } from "@/modules/process/types";
import { ProcessService } from "@/modules/process/api/process.service";
import useFormComplete from "@/hooks/useFormComplete";
import { useNavigate } from "react-router";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
  control: (style: CSSObjectWithLabel) => ({
    ...style,
    minHeight: "2.5rem",
  }),
};

const DepartureApprovedForm: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const navigate = useNavigate();

  const { departureFormFields } = ProcessesStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const [formData, setFormData] = useState<DepartureFormData>({
    customer: { option: "", value: "", label: "" },
    palettes: "",
    departure_date: new Date(),
    departure_order_no: "",
    document_type_id: { option: "", value: "", label: "" },
    document_number: "",
    document_date: new Date(),
    departure_status: { option: "", value: "", label: "" },
    departure_transfer_note: "",
    personnel_incharge_id: { option: "", value: "", label: "" },
    observation: "",
    total_volume: "",
    total_weight: "",
    arrival_point: "",
    packaging_type: { option: "", value: "", label: "" },
    labeled: "",
    id_responsible: "",
    reponsible_for_collection: "",
    order_status: "",
    dispatch_order_number: "",
    order_code: "",
    product_description: "",
    insured_value: "",
    dispatch_date: new Date(),
    presentation: "",
  });

  const isFormComplete = useFormComplete(formData, [
    "presentation",
    "order_code",
    "departure_transfer_note",
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, selectedOption: any) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption }));
  };

  const handleDateChange = (date: Date | null, name: string) => {
    if (date) setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setSubmitStatus({});

      const submissionData = {
        ...formData,
        customer_id: formData.customer?.value || "",
        document_type_id: formData.document_type_id?.value || "",
        personnel_in_charge_id: formData.personnel_incharge_id?.value || "",
        packaging_id: formData.packaging_type?.value || "",
        status_id: formData.departure_status?.value || "",
        document_no: formData.document_number,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
      };

      await ProcessService.createNewDepartureOrder(submissionData);

      setSubmitStatus({
        success: true,
        message: t('process:departure_success'),
      });

      // Reset form after success
      setFormData((prev) => ({
        ...prev,
        departure_order_no: "",
        document_number: "",
        order_code: "",
        departure_transfer_note: "",
        observation: "",
        total_volume: "",
        total_weight: "",
        arrival_point: "",
        labeled: "",
        id_responsible: "",
        reponsible_for_collection: "",
        dispatch_order_number: "",
        palettes: "",
        product_description: "",
        insured_value: "",
        presentation: "",
        document_type_id: { option: "", value: "", label: "" },
        customer: { option: "", value: "", label: "" },
        personnel_incharge_id: { option: "", value: "", label: "" },
        packaging_type: { option: "", value: "", label: "" },
        departure_status: { option: "", value: "", label: "" },
      }));

      navigate(-1);
    } catch (error) {
      console.error("Departure order creation failed:", error);
      setSubmitStatus({
        success: false,
        message: t('process:departure_failure'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="order_entry_form" onSubmit={handleSubmit}>
      {/* First Row */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="customer">{t('process:customer')}</label>
          <Select
            options={departureFormFields.customers}
            styles={reactSelectStyle}
            inputId="customer"
            name="customer"
            value={formData.customer}
            onChange={(selected) => handleSelectChange("customer", selected)}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="departure_order_no">{t('process:departure_order_no')}</label>
          <input
            type="text"
            id="departure_order_no"
            name="departure_order_no"
            value={formData.departure_order_no}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="departure_date">{t('process:departure_date')}</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            selected={formData.departure_date}
            onChange={(date) => handleDateChange(date, "departure_date")}
            required
          />
        </div>
      </div>

      <Divider />

      {/* Document Information */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="document_type_id">{t('process:document_type')}</label>
          <Select
            options={departureFormFields.documentTypes}
            styles={reactSelectStyle}
            inputId="document_type_id"
            name="document_type_id"
            value={formData.document_type_id}
            onChange={(selected) =>
              handleSelectChange("document_type_id", selected)
            }
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="document_number">{t('process:document_number')}</label>
          <input
            type="text"
            id="document_number"
            name="document_number"
            value={formData.document_number}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="document_date">{t('process:document_date')}</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            selected={formData.document_date}
            onChange={(date) => handleDateChange(date, "document_date")}
            required
          />
        </div>
      </div>

      <Divider />

      {/* Shipping Information */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="dispatch_order_number">{t('process:dispatch_order_number')}</label>
          <input
            type="text"
            id="dispatch_order_number"
            name="dispatch_order_number"
            value={formData.dispatch_order_number}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="arrival_point">{t('process:arrival_point')}</label>
          <input
            type="text"
            id="arrival_point"
            name="arrival_point"
            value={formData.arrival_point}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="packaging_type">{t('process:packaging_type')}</label>
          <Select
            options={departureFormFields.packagingTypes}
            styles={reactSelectStyle}
            inputId="packaging_type"
            name="packaging_type"
            value={formData.packaging_type}
            onChange={(selected) =>
              handleSelectChange("packaging_type", selected)
            }
          />
        </div>
      </div>

      <Divider />

      {/* Product Information */}
      <div className="w-full flex flex-col">
        <label htmlFor="product_description">{t('process:product_description')}</label>
        <textarea
          id="product_description"
          name="product_description"
          value={formData.product_description}
          onChange={handleChange}
          className="border border-slate-400 rounded-md px-4 py-2 h-24"
          required
        />
      </div>

      <Divider />

      {/* Measurements */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="total_volume">{t('process:total_volume')}</label>
          <input
            type="number"
            id="total_volume"
            name="total_volume"
            value={formData.total_volume}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="total_weight">{t('process:total_weight')}</label>
          <input
            type="number"
            id="total_weight"
            name="total_weight"
            value={formData.total_weight}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="insured_value">{t('process:insured_value')}</label>
          <input
            type="number"
            id="insured_value"
            name="insured_value"
            value={formData.insured_value}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>
      </div>

      <Divider />

      {/* Personnel Information */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="personnel_incharge_id">{t('process:personnel_in_charge')}</label>
          <Select
            options={departureFormFields.users}
            styles={reactSelectStyle}
            inputId="personnel_incharge_id"
            name="personnel_incharge_id"
            value={formData.personnel_incharge_id}
            onChange={(selected) =>
              handleSelectChange("personnel_incharge_id", selected)
            }
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="id_responsible">{t('process:id_responsible')}</label>
          <input
            type="text"
            id="id_responsible"
            name="id_responsible"
            value={formData.id_responsible}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="reponsible_for_collection">
            {t('process:collection_responsible')}
          </label>
          <input
            type="text"
            id="reponsible_for_collection"
            name="reponsible_for_collection"
            value={formData.reponsible_for_collection}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>
      </div>

      <Divider />

      {/* Status Section */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="departure_status">{t('process:departure_status')}</label>
          <Select
            options={departureFormFields.documentTypes} // example placeholder
            styles={reactSelectStyle}
            inputId="departure_status"
            name="departure_status"
            value={formData.departure_status}
            onChange={(selected) =>
              handleSelectChange("departure_status", selected)
            }
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="labeled">{t('process:labeled')}</label>
          <input
            type="text"
            id="labeled"
            name="labeled"
            value={formData.labeled}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="palettes">{t('process:palettes')}</label>
          <input
            type="text"
            id="palettes"
            name="palettes"
            value={formData.palettes}
            onChange={handleChange}
            className="h-10 border border-slate-400 rounded-md px-4"
            required
          />
        </div>
      </div>

      <Divider />

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
          <label htmlFor="order_in_process"> {t('process:order_in_process')}</label>
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
          <label htmlFor="send_order"> {t('process:send_order')}</label>
        </div>
      </div>
      <Divider />

      {/* Additional Information */}
      <div className="w-full flex flex-col">
        <label htmlFor="observation">{t('process:observations')}</label>
        <textarea
          id="observation"
          name="observation"
          value={formData.observation}
          onChange={handleChange}
          className="border border-slate-400 rounded-md px-4 py-2 h-32"
        />
      </div>

      <Divider height="2xl" />

      <div>
        <Button
          disabled={!isFormComplete || isSubmitting}
          variant="action"
          additionalClass="w-40"
          type="submit"
        >
          {isSubmitting ? t('common:submitting') : t('common:register')}
        </Button>
      </div>
      {/* Status Feedback */}
      {submitStatus.message && (
        <Text
          additionalClass={`text-center p-2 mb-4 rounded-md ${
            submitStatus.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {submitStatus.message}
        </Text>
      )}
    </form>
  );
};

export default DepartureApprovedForm;

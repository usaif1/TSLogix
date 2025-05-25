import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button, Divider, Text } from "@/components";
import Spinner from "@/components/Spinner";
import { ProcessesStore } from "@/globalStore";
import { DepartureFormData } from "@/modules/process/types";
import { ProcessService } from "@/modules/process/api/process.service";
import useFormComplete from "@/hooks/useFormComplete";

// Import form sections
import BasicInformationSection from "./sections/BasicInformationSection";
import CellSelectionSection from "./sections/CellSelectionSection";
import QuantitiesSection from "./sections/QuantitiesSection";
import OrderInformationSection from "./sections/OrderInformationSection";
import DocumentInformationSection from "./sections/DocumentInformationSection";
import ProductInformationSection from "./sections/ProductInformationSection";
import PackagingStatusSection from "./sections/PackagingStatusSection";
import PersonnelInformationSection from "./sections/PersonnelInformationSection";
import AdditionalInformationSection from "./sections/AdditionalInformationSection";
import DispatchInformationSection from "./sections/DispatchInformationSection";
import OrderStatusSection from "./sections/OrderStatusSection";
import ObservationsSection from "./sections/ObservationsSection";

const DepartureApprovedForm: React.FC = () => {
  const { t } = useTranslation(["process", "common"]);
  const navigate = useNavigate();

  const {
    submitStatus,
    loaders,
    cellValidation,
    selectedCell,
    inventoryError,
  } = ProcessesStore();

  const [packagingListFile, setPackagingListFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<DepartureFormData>({
    customer: { option: "", value: "", label: "" },
    warehouse: { option: "", value: "", label: "" },
    product: { option: "", value: "", label: "" },
    palettes: "",
    departure_date: new Date(),
    departure_order_no: "",
    document_type_id: { option: "", value: "", label: "" },
    document_number: "",
    document_date: new Date(),
    departure_transfer_note: "",
    personnel_incharge_id: { option: "", value: "", label: "" },
    observation: "",
    total_volume: "",
    total_weight: "",
    total_qty: "",
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
    packaging_list: "",
  });

  const isSubmitting = loaders["processes/submit-departure"];
  const isValidatingCell = loaders["processes/validate-cell"];

  const isFormComplete = useFormComplete(formData, [
    "presentation",
    "order_code",
    "departure_transfer_note",
    "labeled",
    "dispatch_order_number",
    "packaging_list",
  ]);

  const canSubmit = useMemo(() => {
    return (
      isFormComplete &&
      !isValidatingCell &&
      !inventoryError &&
      cellValidation &&
      selectedCell
    );
  }, [
    isFormComplete,
    isValidatingCell,
    inventoryError,
    cellValidation,
    selectedCell,
  ]);

  // Navigate after successful submission
  useEffect(() => {
    if (submitStatus.success) {
      const timer = setTimeout(() => {
        navigate(-1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus.success, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectChange = (name: string, selectedOption: any) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption }));
  };

  const handleDateChange = (date: Date | null, name: string) => {
    if (date) setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      ProcessesStore.setState({
        submitStatus: {
          success: false,
          message: t("process:form_incomplete_or_cell_issues"),
        },
      });
      return;
    }

    const submissionData = {
      ...formData,
      customer_id: formData.customer?.value || "",
      warehouse_id: formData.warehouse?.value || "",
      product_id: formData.product?.value || "",
      document_type_id: formData.document_type_id?.value || "",
      personnel_in_charge_id: formData.personnel_incharge_id?.value || "",
      packaging_id: formData.packaging_type?.value || "",
      document_no: formData.document_number,
      total_qty: parseInt(formData.total_qty || "0"),
      total_weight: parseFloat(formData.total_weight || "0"),
      total_volume: parseFloat(formData.total_volume || "0"),
      palettes: formData.palettes || "0",
      insured_value: parseFloat(formData.insured_value || "0"),
      date_and_time_of_transfer: formData.departure_date,
      registration_date: new Date(),
      reponsible_for_collection: formData.reponsible_for_collection,
      packaging_list: packagingListFile?.name || "",
    };

    await ProcessService.createDepartureOrderWithState(submissionData);
  };

  return (
    <form className="order_entry_form" onSubmit={handleSubmit}>
      <BasicInformationSection
        formData={formData}
        handleSelectChange={handleSelectChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <CellSelectionSection formData={formData} />

      <Divider />

      <QuantitiesSection
        formData={formData}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <OrderInformationSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <DocumentInformationSection
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleDateChange={handleDateChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <ProductInformationSection
        formData={formData}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <PackagingStatusSection
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        isSubmitting={isSubmitting}
        packagingListFile={packagingListFile}
        setPackagingListFile={setPackagingListFile}
      />

      <Divider />

      <PersonnelInformationSection
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <AdditionalInformationSection
        formData={formData}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <DispatchInformationSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <OrderStatusSection
        formData={formData}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
      />

      <Divider />

      <ObservationsSection
        formData={formData}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
      />

      <Divider height="2xl" />

      {/* Submit Button */}
      <div className="flex justify-end gap-x-4">
        <Button
          variant="cancel"
          additionalClass="w-32"
          type="button"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          {t("common:cancel")}
        </Button>

        <Button
          disabled={!canSubmit || isSubmitting}
          variant="action"
          additionalClass="w-40"
          type="submit"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <Spinner />
              <span className="ml-2">{t("common:submitting")}</span>
            </div>
          ) : (
            t("process:create_departure_order")
          )}
        </Button>
      </div>

      {/* Status Feedback */}
      {submitStatus.message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            submitStatus.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <Text>
            {submitStatus.success
              ? t("process:departure_success")
              : submitStatus.message.startsWith("failed_")
              ? t(`process:${submitStatus.message}`)
              : submitStatus.message}
          </Text>
        </div>
      )}
    </form>
  );
};

export default DepartureApprovedForm;

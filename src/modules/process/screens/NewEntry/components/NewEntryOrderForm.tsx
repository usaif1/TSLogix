/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// components
import { Button, Divider, Text } from "@/components";
import FileUpload from "@/components/FileUpload";
import { ProcessesStore } from "@/globalStore";
import { ProcessService } from "@/modules/process/api/process.service";
import { supabase } from "@/lib/supabase/supabaseClient";
import useFormComplete from "@/hooks/useFormComplete";
import ProductEntryCard from "./ProductEntryCard";
import { EntryFormData, ProductData, getPackagingCode } from "@/modules/process/types";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface ProductData {
  id: string;
  product_id: string;
  quantity_packaging: string;
  total_qty: string;
  total_weight: string;
  total_volume: string;
  palettes: string;
  presentation: string;
  product_description: string;
  insured_value: string;
  technical_specification: string;
  expiration_date: Date;
  mfd_date_time: Date;
  packaging_type: string;
  packaging_status: string;
  packaging_code: string;
}

interface EntryFormData {
  // Entry Order Level Data
  origin: { option: string; value: string; label: string };
  entry_order_no: string;
  document_type_id: { option: string; value: string; label: string };
  registration_date: Date;
  document_date: Date;
  admission_date_time: Date;
  entry_date: Date;
  entry_transfer_note: string;
  personnel_incharge_id: { option: string; value: string; label: string };
  document_status: { option: string; value: string; label: string };
  order_status: { option: string; value: string; label: string };
  observation: string;
  cif_value: string;
  supplier: { option: string; value: string; label: string };
  certificate_protocol_analysis: string;
  lot_series: string;
  type: string;
  
  // Products Array
  products: ProductData[];
}

const NewEntryOrderForm: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
3
  const {
    documentTypes,
    origins,
    users,
    products,
    suppliers,
    currentEntryOrderNo,
    entryOrderStatus,
    temperatureRanges,
    packagingTypes,
    packagingStatuses,
  } = ProcessesStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const [formData, setFormData] = useState<EntryFormData>({
    origin: { option: "", value: "", label: "" },
    entry_order_no: currentEntryOrderNo || "",
    document_type_id: { option: "", value: "", label: "" },
    registration_date: new Date(),
    document_date: new Date(),
    admission_date_time: new Date(),
    entry_date: new Date(),
    entry_transfer_note: "",
    personnel_incharge_id: { option: "", value: "", label: "" },
    document_status: {
      option: "Registered",
      value: "REGISTERED",
      label: "REGISTERED",
    },
    order_status: { option: "", value: "", label: "" },
    observation: "",
    cif_value: "",
    supplier: { option: "", value: "", label: "" },
    certificate_protocol_analysis: "",
    lot_series: "",
    type: "",
    products: [],
  });

  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      entry_order_no: currentEntryOrderNo || "",
    }));
  }, [currentEntryOrderNo]);

  const isReturnOrigin = useMemo(() => {
    return (
      formData.origin?.label === "Return" || formData.origin?.label === "RETURN"
    );
  }, [formData.origin]);

  const isReconditionedOrigin = useMemo(() => {
    return (
      formData.origin?.label === "Reconditioned" ||
      formData.origin?.label === "Reconditioned"
    );
  }, [formData.origin]);

  const shouldDisableFields = useMemo(() => {
    return isReturnOrigin || isReconditionedOrigin;
  }, [isReturnOrigin, isReconditionedOrigin]);

  // Add new product
  const addProduct = () => {
    const newProduct: ProductData = {
      id: Date.now().toString(),
      product_id: "",
      quantity_packaging: "",
      total_qty: "",
      total_weight: "",
      total_volume: "",
      palettes: "",
      presentation: "",
      product_description: "",
      insured_value: "",
      technical_specification: "",
      expiration_date: new Date(),
      mfd_date_time: new Date(),
      packaging_type: "",
      packaging_status: "",
      packaging_code: "",
    };

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };

  // Remove product
  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  // Update product
  const updateProduct = (productId: string, updatedProduct: Partial<ProductData>) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId ? { ...p, ...updatedProduct } : p
      )
    }));
  };

  const handleEntryOrderNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const prefix = currentEntryOrderNo || "";

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

    if (formData.products.length === 0) {
      setSubmitStatus({
        success: false,
        message: "Please add at least one product",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      let certificateUrl = "";
      if (certificateFile && !isReturnOrigin) {
        const fileName = `${Date.now()}_${certificateFile.name.replace(/[\s.]/g, "")}`;
        const { error } = await supabase.storage
          .from("order")
          .upload(fileName, certificateFile);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from("order")
          .getPublicUrl(fileName);
        certificateUrl = urlData.publicUrl;
      }

      const submissionData = {
        // Entry order level data
        order_type: "ENTRY",
        document_status: formData.document_status?.value || "REGISTERED",
        origin_id: formData.origin?.value || "",
        document_type_id: formData.document_type_id?.value || "",
        personnel_incharge_id: formData.personnel_incharge_id?.value || "",
        supplier_id: formData.supplier?.value || "",
        status_id: formData.order_status?.value || "",
        entry_order_no: formData.entry_order_no,
        registration_date: formData.registration_date,
        document_date: formData.document_date,
        admission_date_time: formData.admission_date_time,
        entry_date: formData.entry_date,
        entry_transfer_note: formData.entry_transfer_note,
        observation: formData.observation,
        cif_value: formData.cif_value,
        certificate_protocol_analysis: certificateUrl,
        lot_series: formData.lot_series,
        type: formData.type,
        
        // Products array
        products: formData.products.map(product => ({
          product_id: product.product_id,
          quantity_packaging: parseInt(product.quantity_packaging) || 0,
          total_qty: parseInt(product.total_qty) || 0,
          total_weight: parseFloat(product.total_weight) || 0,
          total_volume: parseFloat(product.total_volume) || 0,
          palettes: parseInt(product.palettes) || 0,
          presentation: product.presentation,
          product_description: product.product_description,
          insured_value: parseFloat(product.insured_value) || 0,
          technical_specification: product.technical_specification,
          expiration_date: product.expiration_date,
          mfd_date_time: product.mfd_date_time,
          packaging_type: product.packaging_type,
          packaging_status: product.packaging_status,
          packaging_code: product.packaging_code,
        }))
      };

      await ProcessService.createNewEntryOrder(submissionData);

      // Reset form
      setFormData({
        origin: { option: "", value: "", label: "" },
        entry_order_no: currentEntryOrderNo || "",
        document_type_id: { option: "", value: "", label: "" },
        registration_date: new Date(),
        document_date: new Date(),
        admission_date_time: new Date(),
        entry_date: new Date(),
        entry_transfer_note: "",
        personnel_incharge_id: { option: "", value: "", label: "" },
        document_status: {
          option: "Registered",
          value: "REGISTERED",
          label: "REGISTERED",
        },
        order_status: { option: "", value: "", label: "" },
        observation: "",
        cif_value: "",
        supplier: { option: "", value: "", label: "" },
        certificate_protocol_analysis: "",
        lot_series: "",
        type: "",
        products: [],
      });
      setCertificateFile(null);

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
      {/* Entry Order Header Information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
          {t('process:entry_order_information')}
        </Text>

        <div className="w-full flex items-center gap-x-6">
          {/* origin */}
          <div className="w-full flex flex-col">
            <label htmlFor="origin">{t('process:origin')} *</label>
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
            <label htmlFor="entry_order_no">{t('process:entry_order_no')} *</label>
            <input
              type="text"
              autoCapitalize="on"
              id="entry_order_no"
              name="entry_order_no"
              value={formData.entry_order_no}
              onChange={handleEntryOrderNoChange}
              readOnly
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>

          {/* document */}
          <div className="w-full flex flex-col">
            <label htmlFor="document">{t('process:document')} *</label>
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
            <label htmlFor="registration_date">{t('process:registration_date')} *</label>
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
            <label htmlFor="document_date">{t('process:document_date')} *</label>
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
              {t('process:admission_date_and_time')} *
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
            <label htmlFor="personnel_in_charge">{t('process:personnel_in_charge')} *</label>
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

          {/* supplier */}
          <div className="w-full flex flex-col">
            <label
              htmlFor="supplier"
              className={isReconditionedOrigin ? "text-gray-400" : ""}
            >
              {t('process:supplier')} {!isReconditionedOrigin && "*"}
            </label>
            <Select
              options={suppliers}
              styles={reactSelectStyle}
              inputId="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={(selectedOption) =>
                handleSelectChange("supplier", selectedOption)
              }
              isDisabled={isReconditionedOrigin}
              className={isReconditionedOrigin ? "react-select--is-disabled" : ""}
            />
            {isReconditionedOrigin && (
              <p className="text-xs text-amber-600 mt-1">
                {t('process:not_applicable')}
              </p>
            )}
          </div>

          {/* order status */}
          <div className="w-full flex flex-col">
            <label htmlFor="order_status">{t('process:order_status')} *</label>
            <Select
              options={entryOrderStatus}
              styles={reactSelectStyle}
              inputId="order_status"
              name="order_status"
              value={formData.order_status}
              onChange={(selectedOption) =>
                handleSelectChange("order_status", selectedOption)
              }
            />
          </div>
        </div>

        <Divider />

        {/* General information */}
        <div className="w-full flex items-center gap-x-6">
          <div className="w-full flex flex-col">
            <label htmlFor="observation">{t('process:observation')}</label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              className="border border-slate-400 rounded-md px-4 pt-2 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>
          
          <div className="w-full flex flex-col">
            <label htmlFor="cif_value">
              <span>$</span>
              {t('process:cif_value')} *
            </label>
            <input
              type="number"
              id="cif_value"
              name="cif_value"
              value={formData.cif_value}
              onChange={handleChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>

          <div className="w-full flex flex-col">
            <label htmlFor="lot_series">{t('process:lot_series')} *</label>
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

        {/* Certificate upload for non-return origins */}
        {!shouldDisableFields && (
          <div className="mt-4">
            <FileUpload
              id="certificate_protocol_analysis"
              label={t('process:protocol_analysis_certificate')}
              onFileSelected={(file: File) => setCertificateFile(file)}
            />
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
            {t('process:products')} ({formData.products.length})
          </Text>
          <Button
            type="button"
            variant="action"
            onClick={addProduct}
            additionalClass="px-4 py-2"
          >
            + {t('process:add_product')}
          </Button>
        </div>

        {formData.products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Text>{t('process:no_products_added')}</Text>
            <Text additionalClass="text-sm mt-1">{t('process:click_add_product_to_start')}</Text>
          </div>
        )}

        {formData.products.map((product, index) => (
          <ProductEntryCard
            key={product.id}
            product={product}
            index={index}
            products={products}
            packagingTypes={packagingTypes}
            packagingStatuses={packagingStatuses}
            temperatureRanges={temperatureRanges}
            shouldDisableFields={shouldDisableFields}
            onUpdate={(updatedProduct) => updateProduct(product.id, updatedProduct)}
            onRemove={() => removeProduct(product.id)}
          />
        ))}
      </div>

      {/* Submit Section */}
      {submitStatus.message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            submitStatus.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {submitStatus.success 
            ? t('process:entry_success')
            : (submitStatus.message || t('process:entry_failure'))}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          disabled={formData.products.length === 0 || isSubmitting}
          variant="action"
          additionalClass="w-40"
          type="submit"
        >
          {isSubmitting ? t('process:submitting') : t('process:register')}
        </Button>
      </div>
    </form>
  );
};

export default NewEntryOrderForm;
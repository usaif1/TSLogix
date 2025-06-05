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
import ProductEntryCard from "./ProductEntryCard";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

// ✅ Updated ProductData interface to include product_code
export interface ProductData {
  id: string;
  product_id: string;
  product_code: string; // ✅ Added product_code field
  supplier_id: string;
  serial_number: string;
  lot_series: string;
  guide_number: string;

  // Updated field names to match new backend schema
  inventory_quantity: string;
  package_quantity: string;
  weight_kg: string;
  volume_m3: string;
  quantity_pallets: string;
  presentation: string;
  product_description: string;
  insured_value: string;
  technical_specification: string;
  manufacturing_date: Date;
  expiration_date: Date;
  temperature_range: string;
  humidity: string;
  health_registration: string;
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

interface NewEntryOrderFormProps {
  submitButtonText?: string;
}

const NewEntryOrderForm: React.FC<NewEntryOrderFormProps> = ({
  submitButtonText = "Create Entry Order",
}) => {
  const { t } = useTranslation(["process", "common"]);
  const navigate = useNavigate();

  const {
    entryFormFields: {
      documentTypes,
      origins,
      users,
      products,
      suppliers,
      temperatureRanges,
      orderStatusOptions: entryOrderStatus,
      presentationOptions,
    },
    currentEntryOrderNo,
  } = ProcessesStore();

  const dropdownOptions = useMemo(() => {
    return {
      origins: origins || [],
      documentTypes: documentTypes || [],
      users: users || [],
      products: products || [],
      suppliers: suppliers || [],
      temperatureRanges: temperatureRanges || [],
      orderStatus: entryOrderStatus || [],
      presentationOptions: presentationOptions || [],
    };
  }, [origins, documentTypes, users, products, suppliers, temperatureRanges, entryOrderStatus, presentationOptions]);

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const [formData, setFormData] = useState<EntryFormData>({
    origin: { option: "", value: "", label: "" },
    entry_order_no: "",
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

  // ✅ Load initial data and entry order number
  useEffect(() => {
    ProcessService.getCurrentEntryOrderNo();
  }, []);

  // ✅ Update entry order number when it's loaded from store
  useEffect(() => {
    if (currentEntryOrderNo && currentEntryOrderNo !== formData.entry_order_no) {
      setFormData(prev => ({
        ...prev,
        entry_order_no: currentEntryOrderNo
      }));
    }
  }, [currentEntryOrderNo, formData.entry_order_no]);

  const isReturnOrigin = useMemo(() => {
    return (
      formData.origin?.label === "Devolución" ||
      formData.origin?.label === "Return" ||
      formData.origin?.label === "RETURN"
    );
  }, [formData.origin]);

  const isReconditionedOrigin = useMemo(() => {
    return (
      formData.origin?.label === "Acondicionado" ||
      formData.origin?.label === "Reconditioned" ||
      formData.origin?.label === "RECONDITIONED"
    );
  }, [formData.origin]);

  const shouldDisableFields = useMemo(() => {
    return isReturnOrigin || isReconditionedOrigin;
  }, [isReturnOrigin, isReconditionedOrigin]);

  // ✅ Add product with product_code field
  const addProduct = () => {
    const newProduct: ProductData = {
      id: Date.now().toString(),
      product_id: "",
      product_code: "", 
      supplier_id: "",
      serial_number: "",
      lot_series: "",
      guide_number: "",
      inventory_quantity: "",
      package_quantity: "",
      weight_kg: "",
      volume_m3: "",
      quantity_pallets: "",
      presentation: "CAJA",
      product_description: "",
      insured_value: "",
      technical_specification: "",
      manufacturing_date: new Date(),
      expiration_date: new Date(),
      temperature_range: "AMBIENTE",
      humidity: "",
      health_registration: "",
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  // Remove product
  const removeProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
  };

  // ✅ Fixed updateProduct to properly handle product_code auto-population
  const updateProduct = (
    productId: string,
    updatedProduct: Partial<ProductData>
  ) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, ...updatedProduct };
          
          // ✅ Auto-populate product_code when product_id changes
          if (updatedProduct.product_id && updatedProduct.product_id !== p.product_id) {
            console.log("Looking for product with ID:", updatedProduct.product_id);
            console.log("Available products:", dropdownOptions.products);
            
            // ✅ Check multiple possible property names for product selection
            const selectedProduct = dropdownOptions.products.find(
              (product: any) => {
                return (
                  product.value === updatedProduct.product_id || 
                  product.product_id === updatedProduct.product_id ||
                  product.id === updatedProduct.product_id
                );
              }
            );
            
            console.log("Found selected product:", selectedProduct);
            
            if (selectedProduct) {
              // ✅ Check multiple possible property names for product_code
              const productCode = selectedProduct.product_code || 
                                 selectedProduct.code || 
                                 selectedProduct.productCode || 
                                 "";
              
              console.log("Setting product_code to:", productCode);
              updated.product_code = productCode;
            } else {
              console.log("No product found, clearing product_code");
              updated.product_code = "";
            }
          }
          
          return updated;
        }
        return p;
      }),
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

  // Form submission logic
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.products.length === 0) {
      setSubmitStatus({
        success: false,
        message: "Please add at least one product",
      });
      return;
    }

    // Validate required fields for new backend schema
    for (let i = 0; i < formData.products.length; i++) {
      const product = formData.products[i];
      if (!product.product_id) {
        setSubmitStatus({
          success: false,
          message: `Product ${i + 1}: Please select a product`,
        });
        return;
      }
      if (!product.supplier_id) {
        setSubmitStatus({
          success: false,
          message: `Product ${i + 1}: Please select a supplier`,
        });
        return;
      }
      if (!product.serial_number) {
        setSubmitStatus({
          success: false,
          message: `Product ${i + 1}: Serial number is required`,
        });
        return;
      }
      if (!product.lot_series) {
        setSubmitStatus({
          success: false,
          message: `Product ${i + 1}: Lot series is required`,
        });
        return;
      }
      if (!product.guide_number) {
        setSubmitStatus({
          success: false,
          message: `Product ${i + 1}: Guide number is required`,
        });
        return;
      }
      if (!product.inventory_quantity || parseInt(product.inventory_quantity) <= 0) {
        setSubmitStatus({
          success: false,
          message: `Product ${i + 1}: Inventory quantity must be greater than 0`,
        });
        return;
      }
      if (!product.package_quantity || parseInt(product.package_quantity) <= 0) {
        setSubmitStatus({
          success: false,
          message: `Product ${i + 1}: Package quantity must be greater than 0`,
        });
        return;
      }
      if (!product.weight_kg || parseFloat(product.weight_kg) <= 0) {
        setSubmitStatus({
          success: false,
          message: `Product ${i + 1}: Weight must be greater than 0`,
        });
        return;
      }
    }

    setLoading(true);
    setSubmitStatus({});

    try {
      let certificateUrl = "";
      if (certificateFile && !isReturnOrigin) {
        const fileName = `${Date.now()}_${certificateFile.name.replace(
          /[\s.]/g,
          ""
        )}`;
        const { error } = await supabase.storage
          .from("order")
          .upload(fileName, certificateFile);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from("order")
          .getPublicUrl(fileName);
        certificateUrl = urlData.publicUrl;
      }

      // Updated payload to match new backend schema
      const submissionData = {
        // Entry order level data
        entry_order_no: formData.entry_order_no,
        origin_id: formData.origin?.value || "",
        document_type_id: formData.document_type_id?.value || "",
        registration_date: formData.registration_date,
        document_date: formData.document_date,
        entry_date_time: formData.admission_date_time,
        created_by: localStorage.getItem("id"),
        organisation_id: localStorage.getItem("organisation_id"),
        order_status: formData.order_status?.value || "REVISION",
        total_volume: formData.products.reduce((sum, p) => sum + parseFloat(p.volume_m3 || "0"), 0),
        total_weight: formData.products.reduce((sum, p) => sum + parseFloat(p.weight_kg || "0"), 0),
        cif_value: parseFloat(formData.cif_value) || null,
        total_pallets: formData.products.reduce((sum, p) => sum + parseInt(p.quantity_pallets || "0"), 0),
        observation: formData.observation,
        uploaded_documents: certificateUrl || null,

        // ✅ Products array with product_code included
        products: formData.products.map((product) => ({
          serial_number: product.serial_number,
          supplier_id: product.supplier_id,
          product_code: product.product_code, // ✅ Include product_code in submission
          product_id: product.product_id,
          lot_series: product.lot_series,
          manufacturing_date: product.manufacturing_date,
          expiration_date: product.expiration_date,
          inventory_quantity: parseInt(product.inventory_quantity),
          package_quantity: parseInt(product.package_quantity),
          quantity_pallets: parseInt(product.quantity_pallets) || null,
          presentation: product.presentation || "CAJA",
          guide_number: product.guide_number,
          weight_kg: parseFloat(product.weight_kg),
          volume_m3: parseFloat(product.volume_m3) || null,
          insured_value: parseFloat(product.insured_value) || null,
          temperature_range: product.temperature_range || "AMBIENTE",
          humidity: product.humidity,
          health_registration: product.health_registration,
        })),
      };

      // ✅ Always create new entry order
      await ProcessService.createNewEntryOrder(submissionData);

      setSubmitStatus({
        success: true,
        message: "Entry order created successfully and sent for admin review",
      });

      // Show success message briefly, then redirect
      setTimeout(() => {
        navigate("/processes/entry");
      }, 1500);
    } catch (error) {
      console.error("Error creating entry order:", error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create entry order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="order_entry_form" onSubmit={handleFormSubmit}>
      {/* Entry Order Header Information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <Text
          size="lg"
          weight="font-semibold"
          additionalClass="mb-4 text-gray-800"
        >
          {t("process:entry_order_information")}
        </Text>

        <div className="w-full flex items-center gap-x-6">
          {/* origin */}
          <div className="w-full flex flex-col">
            <label htmlFor="origin">{t("process:origin")} *</label>
            <Select
              options={dropdownOptions.origins}
              styles={reactSelectStyle}
              inputId="origin"
              name="origin"
              value={formData.origin.value ? formData.origin : null}
              onChange={(selectedOption) =>
                handleSelectChange("origin", selectedOption)
              }
              placeholder="Select origin..."
              isClearable
            />
          </div>

          {/* entry order no */}
          <div className="w-full flex flex-col">
            <label htmlFor="entry_order_no">
              {t("process:entry_order_no")} *
            </label>
            <input
              type="text"
              autoCapitalize="on"
              id="entry_order_no"
              name="entry_order_no"
              value={formData.entry_order_no}
              onChange={handleEntryOrderNoChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-gray-100"
              placeholder="Loading order number..."
            />
          </div>

          {/* document */}
          <div className="w-full flex flex-col">
            <label htmlFor="document">{t("process:document")} *</label>
            <Select
              options={dropdownOptions.documentTypes}
              styles={reactSelectStyle}
              inputId="document_type_id"
              name="document_type_id"
              value={formData.document_type_id.value ? formData.document_type_id : null}
              onChange={(selectedOption) =>
                handleSelectChange("document_type_id", selectedOption)
              }
              placeholder="Select document type..."
              isClearable
            />
          </div>
        </div>

        <Divider />

        <div className="w-full flex items-center gap-x-6">
          {/* registration date */}
          <div className="w-full flex flex-col">
            <label htmlFor="registration_date">
              {t("process:registration_date")} *
            </label>
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
            <label htmlFor="document_date">
              {t("process:document_date")} *
            </label>
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
              {t("process:admission_date_and_time")} *
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
            <label htmlFor="personnel_in_charge">
              {t("process:personnel_in_charge")} *
            </label>
            <Select
              options={dropdownOptions.users}
              styles={reactSelectStyle}
              inputId="personnel_incharge_id"
              name="personnel_incharge_id"
              value={formData.personnel_incharge_id.value ? formData.personnel_incharge_id : null}
              onChange={(selectedOption) =>
                handleSelectChange("personnel_incharge_id", selectedOption)
              }
              placeholder="Select personnel..."
              isClearable
            />
          </div>

          {/* supplier */}
          <div className="w-full flex flex-col">
            <label
              htmlFor="supplier"
              className={isReconditionedOrigin ? "text-gray-400" : ""}
            >
              {t("process:supplier")} {!isReconditionedOrigin && "*"}
            </label>
            <Select
              options={dropdownOptions.suppliers}
              styles={reactSelectStyle}
              inputId="supplier"
              name="supplier"
              value={formData.supplier.value ? formData.supplier : null}
              onChange={(selectedOption) =>
                handleSelectChange("supplier", selectedOption)
              }
              isDisabled={isReconditionedOrigin}
              className={
                isReconditionedOrigin ? "react-select--is-disabled" : ""
              }
              placeholder="Select supplier..."
              isClearable
            />
            {isReconditionedOrigin && (
              <p className="text-xs text-amber-600 mt-1">
                {t("process:not_applicable")}
              </p>
            )}
          </div>

          {/* order status */}
          <div className="w-full flex flex-col">
            <label htmlFor="order_status">{t("process:order_status")} *</label>
            <Select
              options={dropdownOptions.orderStatus.map((item: any) => ({
                option: item.label,
                value: item.value,
                label: item.label,
              }))}
              styles={reactSelectStyle}
              inputId="order_status"
              name="order_status"
              value={formData.order_status.value ? formData.order_status : null}
              onChange={(selectedOption) =>
                handleSelectChange("order_status", selectedOption)
              }
              placeholder="Select status..."
              isClearable
            />
          </div>
        </div>

        <Divider />

        {/* General information */}
        <div className="w-full flex items-center gap-x-6">
          <div className="w-full flex flex-col">
            <label htmlFor="observation">{t("process:observation")}</label>
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
              {t("process:cif_value")} *
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
            <label htmlFor="lot_series">{t("process:lot_series")} *</label>
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
              label={t("process:protocol_analysis_certificate")}
              onFileSelected={(file: File) => setCertificateFile(file)}
            />
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Text
            size="lg"
            weight="font-semibold"
            additionalClass="text-gray-800"
          >
            {t("process:products")} ({formData.products.length})
          </Text>
          <Button
            type="button"
            variant="action"
            onClick={addProduct}
            additionalClass="px-4 py-2"
          >
            + {t("process:add_product")}
          </Button>
        </div>

        {formData.products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Text>{t("process:no_products_added")}</Text>
            <Text additionalClass="text-sm mt-1">
              {t("process:click_add_product_to_start")}
            </Text>
          </div>
        )}

        {formData.products.map((product, index) => (
          <ProductEntryCard
            key={product.id}
            product={product}
            index={index}
            products={dropdownOptions.products}
            suppliers={dropdownOptions.suppliers}
            temperatureRanges={dropdownOptions.temperatureRanges}
            shouldDisableFields={shouldDisableFields}
            onUpdate={(updatedProduct) =>
              updateProduct(product.id, updatedProduct)
            }
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
            ? t("process:entry_success")
            : submitStatus.message || t("process:entry_failure")}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="cancel"
          onClick={() => navigate(-1)}
          additionalClass="w-40"
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          disabled={loading}
          variant="action"
          additionalClass="w-48"
        >
          {loading ? "Creating..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default NewEntryOrderForm;
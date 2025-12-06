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
  registration_date: Date;
  document_date: Date;
  admission_date_time: Date;
  entry_date: Date;
  entry_transfer_note: string;
  personnel_incharge_id: { option: string; value: string; label: string };
  document_status: { option: string; value: string; label: string };
  observation: string;
  cif_value: string;
  supplier: { option: string; value: string; label: string };
  certificate_protocol_analysis: string;
  guide_number: string;
  type: string;

  // ✅ NEW: Multi-user client support
  client: { option: string; value: string; label: string };
  client_user: { option: string; value: string; label: string };

  // Products Array
  products: ProductData[];
}

interface NewEntryOrderFormProps {
  submitButtonText?: string;
}

const NewEntryOrderForm: React.FC<NewEntryOrderFormProps> = () => {
  const { t } = useTranslation(["process", "common"]);
  const navigate = useNavigate();

  const {
    entryFormFields: {
      documentTypes,
      origins,
      users,
      products,
      suppliers,
      temperatureRangeOptions: temperatureRanges,
      orderStatusOptions: entryOrderStatus,
      presentationOptions,
      clients, // ✅ NEW: Client options for admin users
      clientUsers, // ✅ NEW: Client user options for multi-user support
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
      temperatureRanges: (temperatureRanges || []).filter(temp => temp.value !== "AMBIENTE"),
      orderStatus: entryOrderStatus || [],
      presentationOptions: presentationOptions || [],
      clients: clients || [], // ✅ NEW: Client options
      clientUsers: clientUsers || [], // ✅ NEW: Client user options
    };
  }, [origins, documentTypes, users, products, suppliers, temperatureRanges, entryOrderStatus, presentationOptions, clients, clientUsers]);


  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // ✅ Updated state for multi-select document types and files
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<Array<{value: string, label: string}>>([]);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({});

  const [formData, setFormData] = useState<EntryFormData>({
    origin: { option: "", value: "", label: "" },
    entry_order_no: "",
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
    observation: "",
    cif_value: "",
    supplier: { option: "", value: "", label: "" },
    certificate_protocol_analysis: "",
    guide_number: "",
    type: "",
    // ✅ NEW: Multi-user client support
    client: { option: "", value: "", label: "" },
    client_user: { option: "", value: "", label: "" },
    products: [],
  });

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

  // ✅ NEW: Auto-populate client information for CLIENT role users
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    const clientId = localStorage.getItem("client_id");
    const username = localStorage.getItem("username");
    const isPrimaryUser = localStorage.getItem("is_primary_user") === "true";

    if (userRole === "CLIENT" && clientId) {
      // For CLIENT users, auto-select their client
      const clientData = dropdownOptions.clients.find((client: any) => client.value === clientId);
      if (clientData) {
        setFormData(prev => ({
          ...prev,
          client: clientData
        }));
      }

      // If user is not primary, auto-select themselves as the client user
      if (!isPrimaryUser && username) {
        const clientUserData = dropdownOptions.clientUsers.find((user: any) => user.username === username);
        if (clientUserData) {
          setFormData(prev => ({
            ...prev,
            client_user: clientUserData
          }));
        }
      }
    }
  }, [dropdownOptions.clients, dropdownOptions.clientUsers]);

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

  // ✅ Add product with product_code
  const addProduct = () => {
    const newProduct: ProductData = {
      id: Date.now().toString(),
      product_id: "",
      product_code: "", 
      supplier_id: "",
      serial_number: "",
      lot_series: "",
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
      | React.ChangeEvent<HTMLSelectElement>
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

  // ✅ Handle document type selection
  const handleDocumentTypeChange = (selectedOptions: any) => {
    const newTypes = selectedOptions || [];
    setSelectedDocumentTypes(newTypes);
    
    // Clear files for unselected document types
    const newDocumentFiles = { ...documentFiles };
    Object.keys(newDocumentFiles).forEach(type => {
      if (!newTypes.find((t: any) => t.value === type)) {
        delete newDocumentFiles[type];
      }
    });
    setDocumentFiles(newDocumentFiles);
  };

  // ✅ Handle file selection for specific document type
  const handleFileSelection = (documentType: string, file: File | null) => {
    setDocumentFiles(prev => ({
      ...prev,
      [documentType]: file
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
      // ✅ Use FormData for multipart upload with multiple documents
      const formDataToSend = new FormData();

      // ✅ Append form fields
      const submissionData = {
        // Entry order level data
        entry_order_no: formData.entry_order_no,
        origin_id: formData.origin?.value || "",
        registration_date: formData.registration_date,
        document_date: formData.document_date,
        entry_date_time: formData.admission_date_time,
        created_by: localStorage.getItem("id"),
        organisation_id: localStorage.getItem("organisation_id"),
        order_status: "REVISION",
        total_volume: formData.products.reduce((sum, p) => sum + parseFloat(p.volume_m3 || "0"), 0),
        total_weight: formData.products.reduce((sum, p) => sum + parseFloat(p.weight_kg || "0"), 0),
        cif_value: parseFloat(formData.cif_value) || null,
        total_pallets: formData.products.reduce((sum, p) => sum + parseInt(p.quantity_pallets || "0"), 0),
        observation: formData.observation,
        guide_number: formData.guide_number || "",
        // ✅ NEW: Multi-user client support
        client_id: formData.client?.value || localStorage.getItem("client_id"),
        client_user_id: formData.client_user?.value || null,

        // ✅ Products array with product_code included
        products: formData.products.map((product) => ({
          serial_number: product.serial_number,
          supplier_id: product.supplier_id,
          product_code: product.product_code,
          product_id: product.product_id,
          lot_series: product.lot_series,
          guide_number: formData.guide_number || "",
          manufacturing_date: product.manufacturing_date,
          expiration_date: product.expiration_date,
          inventory_quantity: parseInt(product.inventory_quantity),
          package_quantity: parseInt(product.package_quantity),
          quantity_pallets: parseInt(product.quantity_pallets) || null,
          presentation: product.presentation || "CAJA",
          weight_kg: parseFloat(product.weight_kg),
          volume_m3: parseFloat(product.volume_m3) || null,
          insured_value: parseFloat(product.insured_value) || null,
          temperature_range: product.temperature_range || "AMBIENTE",
          humidity: product.humidity,
          health_registration: product.health_registration,
        })),
      };

      // ✅ Append non-product form data
      Object.keys(submissionData).forEach(key => {
        if (key !== 'products') {
          formDataToSend.append(key, String(submissionData[key as keyof typeof submissionData]));
        }
      });

      // ✅ Append products array - Send each product individually
      submissionData.products.forEach((product, index) => {
        Object.keys(product).forEach(productKey => {
          const value = product[productKey as keyof typeof product];
          if (value !== null && value !== undefined) {
            formDataToSend.append(`products[${index}][${productKey}]`, String(value));
          }
        });
      });

      // ✅ Append document types
      const documentTypesArray = selectedDocumentTypes.map(type => type.value);
      formDataToSend.append('document_types', JSON.stringify(documentTypesArray));

      // ✅ Append files
      selectedDocumentTypes.forEach(docType => {
        const file = documentFiles[docType.value];
        if (file) {
          formDataToSend.append('documents', file);
        }
      });

      // ✅ Debug log to check FormData structure
      console.log('📋 FormData being sent:');
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      // ✅ Submit using new ProcessService method for document uploads
      const result = await ProcessService.createNewEntryOrderWithDocuments(formDataToSend);

      setSubmitStatus({
        success: true,
        message: "Entry order created successfully and sent for admin review",
      });

      // Log document upload results if available
      if (result.document_uploads) {
        console.log('📎 Document upload results:', result.document_uploads);
      }

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
              placeholder={t("process:select_origin")}
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
              placeholder={t("process:loading_order_number")}
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
              placeholder={t("process:select_personnel")}
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
              placeholder={t("process:select_supplier")}
              isClearable
            />
            {isReconditionedOrigin && (
              <p className="text-xs text-amber-600 mt-1">
                {t("process:not_applicable")}
              </p>
            )}
          </div>

          {/* order status - auto-filled as REVISION */}
          <div className="w-full flex flex-col">
            <label htmlFor="order_status">{t("process:order_status")} *</label>
            <input
              type="text"
              id="order_status"
              name="order_status"
              value="REVISION"
              disabled
              className="h-10 border border-slate-400 rounded-md px-4 bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("process:auto_filled_revision")}
            </p>
          </div>
        </div>

        <Divider />

        {/* ✅ NEW: Multi-user client selection section */}
        <div className="w-full flex items-center gap-x-6">
          {/* Client Selection - Only for ADMIN/WAREHOUSE users */}
          {localStorage.getItem("role") !== "CLIENT" && (
            <div className="w-full flex flex-col">
              <label htmlFor="client">
                {t("process:client")} *
              </label>
              <Select
                options={dropdownOptions.clients}
                styles={reactSelectStyle}
                inputId="client"
                name="client"
                value={formData.client.value ? formData.client : null}
                onChange={(selectedOption) =>
                  handleSelectChange("client", selectedOption)
                }
                placeholder={t("process:select_client")}
                isClearable
              />
            </div>
          )}

          {/* Client User Selection - For primary CLIENT users or when client is selected by admin */}
          {(localStorage.getItem("is_primary_user") === "true" || localStorage.getItem("role") !== "CLIENT") &&
           formData.client.value && (
            <div className="w-full flex flex-col">
              <label htmlFor="client_user">
                {t("process:client_user")}
              </label>
              <Select
                options={dropdownOptions.clientUsers.filter((user: any) => user.client_id === formData.client.value)}
                styles={reactSelectStyle}
                inputId="client_user"
                name="client_user"
                value={formData.client_user.value ? formData.client_user : null}
                onChange={(selectedOption) =>
                  handleSelectChange("client_user", selectedOption)
                }
                placeholder={t("process:select_client_user")}
                isClearable
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("process:optional_specify_which_user")}
              </p>
            </div>
          )}

          {/* Show client info for CLIENT users (read-only) */}
          {localStorage.getItem("role") === "CLIENT" && formData.client.value && (
            <div className="w-full flex flex-col">
              <label htmlFor="client_display">
                {t("process:client")}
              </label>
              <input
                type="text"
                id="client_display"
                value={formData.client.label}
                disabled
                className="h-10 border border-slate-400 rounded-md px-4 bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("process:auto_selected_based_on_your_account")}
              </p>
            </div>
          )}
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
            <label htmlFor="guide_number">{t("process:guide_number")} *</label>
            <input
              type="text"
              id="guide_number"
              name="guide_number"
              value={formData.guide_number}
              onChange={handleChange}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>
        </div>

        {/* Document Upload Section */}
        {!shouldDisableFields && (
          <div className="mt-4">
            <Divider />
            <div className="mt-4">
              <Text
                size="sm"
                weight="font-semibold"
                additionalClass="mb-3 text-gray-800"
              >
                📎 {t("process:document_upload")}
              </Text>
              
              {/* Document Type Multi-Select */}
              <div className="mb-4">
                <Select
                  isMulti
                  options={dropdownOptions.documentTypes}
                  value={selectedDocumentTypes}
                  onChange={handleDocumentTypeChange}
                  placeholder={t("process:select_document_types_placeholder")}
                  className="text-sm"
                  styles={{
                    ...reactSelectStyle,
                    container: (style) => ({ ...style, height: "auto" })
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("process:max_10_files_10mb_each")}
                </p>
              </div>

              {/* Document Upload Areas */}
              {selectedDocumentTypes.length > 0 && (
                <div className="space-y-4">
                  {selectedDocumentTypes.map((docType) => (
                    <div key={docType.value} className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Text
                          size="sm"
                          weight="font-medium"
                          additionalClass="text-gray-700"
                        >
                          📄 {docType.label}
                        </Text>
                        {documentFiles[docType.value] && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            ✅ {t("process:file_selected")}
                          </span>
                        )}
                      </div>
                      <FileUpload
                        id={`document_upload_${docType.value}`}
                        label={`${t("process:upload")} ${docType.label}`}
                        onFileSelected={(file: File) => handleFileSelection(docType.value, file)}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                      />
                      {documentFiles[docType.value] && (
                        <div className="mt-2 text-xs text-gray-600">
                          📎 {documentFiles[docType.value]?.name} 
                          ({Math.round((documentFiles[docType.value]?.size || 0) / 1024)} KB)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            ? t("process:entry_order_created_successfully")
            : submitStatus.message || t("process:failed_to_create_entry_order")}
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
          {t("common:cancel")}
        </Button>
        
        <Button
          type="submit"
          disabled={loading}
          variant="action"
          additionalClass="w-48"
        >
          {loading ? t("process:creating") : t("process:create_entry_order")}
        </Button>
      </div>
    </form>
  );
};

export default NewEntryOrderForm;
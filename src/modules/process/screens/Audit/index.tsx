/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { Text, LoaderSync, Divider, Button } from "@/components";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/globalService";
import { formatDate } from "@/utils/dateUtils";

interface ReviewData {
  review_status: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
  review_comments: string;
}

// ✅ Define proper types
interface ExtendedEntryOrder {
  entry_order_no: string;
  organisation_name?: string;
  order?: {
    organisation?: {
      name: string;
    };
  };
  products?: any[];
  registration_date: string; // ✅ API returns ISO string
  document_date: string; // ✅ API returns ISO string
  entry_date_time: string; // ✅ API returns ISO string
  order_status: string;
  review_status: string;
  review_comments?: string;
  reviewer_name?: string;
  reviewed_at?: string; // ✅ API returns ISO string
  documentType?: {
    name: string;
  };
  origin?: {
    name: string;
  };
  origin_id: string;
  document_type_id: string;
  total_volume?: number;
  total_weight?: number;
  calculated_total_weight?: number;
  calculated_total_volume?: number;
  cif_value?: number;
  total_pallets?: number;
  observation?: string;
  created_by?: string; // ✅ Legacy field
  creator?: { // ✅ New API structure
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  // ✅ Add missing properties from API response
  uploaded_documents?: any[] | string;
  calculated_totals?: {
    inventory_quantity?: number;
    package_quantity?: number;
    weight_kg?: number;
    volume_m3?: number;
    insured_value?: number;
  };
  creator_name?: string;
  allocation_percentage?: number;
  inventoryAllocations?: any[];
}

interface SubmitStatus {
  success: boolean;
  message?: string; // ✅ Make message optional
}

// ✅ Add react-select styling
const reactSelectStyle = {
  container: (style: any) => ({
    ...style,
    height: "2.5rem",
  }),
};

const Review: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawOrderNo = searchParams.get("orderNo") || "";
  const orderNo = decodeURIComponent(rawOrderNo);

  // ✅ Use proper typing
  const entry = ProcessesStore.use.currentEntryOrder() as ExtendedEntryOrder | null;
  const loading = ProcessesStore.use.loaders()["processes/fetch-entry-order"];
  const reviewStatus = ProcessesStore.use.reviewStatus();
  const isUpdating = ProcessesStore.use.loaders()["processes/update-entry-order"];
  const submitStatus = ProcessesStore.use.submitStatus() as SubmitStatus;

  // ✅ Get form fields from store (loaded via fetchEntryFormFields)
  const entryFormFields = ProcessesStore.use.entryFormFields();
  const formFieldsLoading = ProcessesStore.use.loaders()["processes/load-form-fields"];

  const [showModal, setShowModal] = useState(false);
  const [reviewMode, setReviewMode] = useState<
    "approve" | "reject" | "revision"
  >("approve");
  const [reviewComments, setReviewComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  // ✅ Clear status when component mounts and load ONLY form fields
  useEffect(() => {
    ProcessService.clearReviewStatus();
    ProcessesStore.getState().setSubmitStatus({ success: false, message: "" });
    
    // ✅ Only load form fields for edit mode (this loads everything we need)
    ProcessService.fetchEntryFormFields();
  }, []);

  useEffect(() => {
    if (orderNo) {
      ProcessService.fetchEntryOrderByNo(orderNo);
    }
  }, [orderNo]);

  useEffect(() => {
    if (entry?.review_comments) {
      setReviewComments(entry.review_comments);
    }
  }, [entry?.review_comments]);

  // ✅ Handle successful update - safely check message
  useEffect(() => {
    if (submitStatus.success && submitStatus.message?.includes("updated successfully")) {
      setIsEditMode(false);
      setTimeout(() => {
        ProcessService.fetchEntryOrderByNo(orderNo);
        ProcessesStore.getState().setSubmitStatus({ success: false, message: "" });
      }, 2000);
    }
  }, [submitStatus, orderNo]);

  // ✅ Check if current user can edit - now properly typed
  const canUserEdit = useCallback(() => {
    if (!entry) return false;
    
    const userId = localStorage.getItem("id");
    const userRole = localStorage.getItem("role");
    
    // ✅ Check both possible creator field locations
    const creatorId = entry.created_by || entry.creator?.id;
    
    // ✅ Debug logging to help troubleshoot
    console.log("Edit permissions check:", {
      userId,
      userRole,
      creatorId,
      reviewStatus: entry.review_status,
      canEdit: entry.review_status === "NEEDS_REVISION" && (creatorId === userId || userRole === "ADMIN")
    });
    
    return (
      entry.review_status === "NEEDS_REVISION" && 
      (creatorId === userId || userRole === "ADMIN")
    );
  }, [entry]);

  // ✅ Initialize edit form - properly handle string dates
  const initializeEditForm = useCallback(() => {
    if (!entry) return;

    const formData = {
      entry_order_no: entry.entry_order_no || "",
      origin_id: entry.origin_id || "",
      document_type_id: entry.document_type_id || "",
      // ✅ Properly handle string dates from API
      registration_date: entry.registration_date ? entry.registration_date.split('T')[0] : "",
      document_date: entry.document_date ? entry.document_date.split('T')[0] : "",
      entry_date_time: entry.entry_date_time ? entry.entry_date_time.slice(0, 16) : "",
      order_status: entry.order_status || "PENDING",
      total_volume: entry.total_volume || 0,
      total_weight: entry.total_weight || 0,
      cif_value: entry.cif_value || 0,
      total_pallets: entry.total_pallets || 0,
      observation: entry.observation || "",
      products: entry.products?.map((product: any) => ({
        entry_order_product_id: product.entry_order_product_id,
        serial_number: product.serial_number || "",
        supplier_id: product.supplier_id || "",
        product_code: product.product_code || "",
        product_id: product.product_id || "",
        lot_series: product.lot_series || "",
        // ✅ Properly handle string dates from products
        manufacturing_date: product.manufacturing_date ? product.manufacturing_date.split('T')[0] : "",
        expiration_date: product.expiration_date ? product.expiration_date.split('T')[0] : "",
        inventory_quantity: product.inventory_quantity || 0,
        package_quantity: product.package_quantity || 0,
        quantity_pallets: product.quantity_pallets || 0,
        presentation: product.presentation || "CAJA",
        guide_number: product.guide_number || "",
        weight_kg: product.weight_kg || 0,
        volume_m3: product.volume_m3 || 0,
        insured_value: product.insured_value || 0,
        temperature_range: product.temperature_range || "AMBIENTE",
        humidity: product.humidity || 0,
        health_registration: product.health_registration || "",
      })) || [],
    };

    setEditFormData(formData);
    setIsEditMode(true);
  }, [entry]);

  // ✅ Handle form input changes
  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ Handle product changes
  const handleProductChange = (index: number, field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      products: prev.products.map((product: any, i: number) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  // ✅ Add new product
  const addProduct = () => {
    const newProduct = {
      entry_order_product_id: null,
      serial_number: "",
      supplier_id: "",
      product_code: "",
      product_id: "",
      lot_series: "",
      manufacturing_date: "",
      expiration_date: "",
      inventory_quantity: 0,
      package_quantity: 0,
      quantity_pallets: 0,
      presentation: "CAJA",
      guide_number: "",
      weight_kg: 0,
      volume_m3: 0,
      insured_value: 0,
      temperature_range: "AMBIENTE",
      humidity: 0,
      health_registration: "",
    };

    setEditFormData((prev: any) => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };

  // ✅ Remove product
  const removeProduct = (index: number) => {
    setEditFormData((prev: any) => ({
      ...prev,
      products: prev.products.filter((_: any, i: number) => i !== index)
    }));
  };

  // ✅ Handle update submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData) return;

    try {
      // ✅ Transform dates back to proper format - handle strings properly
      const formDataToSubmit = {
        ...editFormData,
        registration_date: new Date(editFormData.registration_date),
        document_date: new Date(editFormData.document_date),
        entry_date_time: new Date(editFormData.entry_date_time),
        products: editFormData.products.map((product: any) => ({
          ...product,
          manufacturing_date: new Date(product.manufacturing_date),
          expiration_date: new Date(product.expiration_date),
        }))
      };

      await ProcessService.updateEntryOrder(orderNo, formDataToSubmit);
    } catch (error) {
      console.error("Failed to update entry order:", error);
    }
  };

  const handleReview = useCallback(async () => {
    if (!entry) return;

    setIsSubmitting(true);
    try {
      const reviewData: ReviewData = {
        review_status:
          reviewMode === "approve"
            ? "APPROVED"
            : reviewMode === "reject"
            ? "REJECTED"
            : "NEEDS_REVISION",
        review_comments: reviewComments.trim(),
      };

      await ProcessService.reviewEntryOrder(orderNo, reviewData);

      closeModal();
      await ProcessService.fetchEntryOrderByNo(orderNo);

      const statusText =
        reviewMode === "approve"
          ? t('process:approved')
          : reviewMode === "reject"
          ? t('process:rejected')
          : t('process:marked_for_revision');

      console.log(`${t('process:entry_order')} ${statusText} ${t('common:successfully')}!`);
    } catch (err) {
      console.error(`${t('process:failed_to')} ${reviewMode} ${t('process:entry_order')}:`, err);
    } finally {
      setIsSubmitting(false);
    }
  }, [entry, reviewMode, reviewComments, orderNo, t]);

  const openModal = useCallback((mode: "approve" | "reject" | "revision") => {
    setReviewMode(mode);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setReviewComments(entry?.review_comments || "");
    setReviewMode("approve");
    setIsSubmitting(false);
  }, [entry?.review_comments]);

  if (loading || formFieldsLoading) {
    return (
      <div className="flex flex-col h-full">
        <Divider height="lg" />
        <LoaderSync loaderText={t('process:loading_order_details')} />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col h-full">
        <Text size="3xl" weight="font-bold">
          {t('process:entry_order_review')}: {orderNo}
        </Text>
        <Divider height="lg" />
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <Text size="lg" additionalClass="text-red-600 mb-2">
            {t('process:entry_order_not_found')}
          </Text>
          <Text size="sm" additionalClass="text-red-500">
            {t('process:entry_order_not_found_message', { orderNo })}
          </Text>
          <Button
            variant="cancel"
            onClick={() => navigate(-1)}
            additionalClass="mt-4"
          >
            {t('common:back')}
          </Button>
        </div>
      </div>
    );
  }

  // ✅ If in edit mode, show the edit form
  if (isEditMode && editFormData && entryFormFields) {
    return (
      <div className="flex flex-col h-full">
        {/* Edit Header */}
        <div className="flex justify-between items-center">
          <Text size="3xl" weight="font-bold">
            {t('process:edit_entry_order')}: {orderNo}
          </Text>
          <div className="flex space-x-2">
            <Button
              variant="cancel"
              onClick={() => setIsEditMode(false)}
              disabled={isUpdating}
            >
              {t('process:cancel_edit')}
            </Button>
          </div>
        </div>
        <Divider height="lg" />

        {/* Status Messages - safely check message */}
        {submitStatus.message && (
          <div className={`p-4 rounded-lg mb-4 ${
            submitStatus.success
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <Text size="sm" weight="font-medium">
              {submitStatus.message}
            </Text>
            {submitStatus.success && (
              <Text size="xs" additionalClass="mt-1">
                {t('process:returning_to_view_mode')}
              </Text>
            )}
          </div>
        )}

        {/* Edit Form */}
        <div className="flex-1 overflow-y-auto">
          <form className="order_entry_form space-y-6" onSubmit={handleUpdateSubmit}>
            
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
                {t('process:basic_information')}
              </Text>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Origin */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:origin')} *</label>
                  <Select
                    options={entryFormFields.origins?.map((origin: any) => ({
                      value: origin.origin_id || origin.value,
                      label: origin.name || origin.label
                    })) || []}
                    styles={reactSelectStyle}
                    value={entryFormFields.origins?.find((o: any) => (o.origin_id || o.value) === editFormData.origin_id) ? {
                      value: editFormData.origin_id,
                      label: entryFormFields.origins?.find((o: any) => (o.origin_id || o.value) === editFormData.origin_id)?.name || entryFormFields.origins?.find((o: any) => (o.origin_id || o.value) === editFormData.origin_id)?.label
                    } : null}
                    onChange={(selected: any) => handleEditInputChange('origin_id', selected?.value || '')}
                    placeholder={t('process:select_origin')}
                    isClearable
                  />
                </div>

                {/* Document Type */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:document_type')} *</label>
                  <Select
                    options={entryFormFields.documentTypes?.map((dt: any) => ({
                      value: dt.document_type_id || dt.value,
                      label: dt.name || dt.label
                    })) || []}
                    styles={reactSelectStyle}
                    value={entryFormFields.documentTypes?.find((dt: any) => (dt.document_type_id || dt.value) === editFormData.document_type_id) ? {
                      value: editFormData.document_type_id,
                      label: entryFormFields.documentTypes?.find((dt: any) => (dt.document_type_id || dt.value) === editFormData.document_type_id)?.name || entryFormFields.documentTypes?.find((dt: any) => (dt.document_type_id || dt.value) === editFormData.document_type_id)?.label
                    } : null}
                    onChange={(selected: any) => handleEditInputChange('document_type_id', selected?.value || '')}
                    placeholder={t('process:select_document_type')}
                    isClearable
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:registration_date')} *</label>
                  <input
                    type="date"
                    value={editFormData.registration_date}
                    onChange={(e) => handleEditInputChange('registration_date', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:document_date')} *</label>
                  <input
                    type="date"
                    value={editFormData.document_date}
                    onChange={(e) => handleEditInputChange('document_date', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:entry_date_time')} *</label>
                  <input
                    type="datetime-local"
                    value={editFormData.entry_date_time}
                    onChange={(e) => handleEditInputChange('entry_date_time', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:order_status')}</label>
                  <select
                    value={editFormData.order_status}
                    onChange={(e) => handleEditInputChange('order_status', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                  >
                    {entryFormFields.orderStatusOptions?.map((status: any) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    )) || (
                      <>
                        <option value="PENDING">{t('process:pending')}</option>
                        <option value="IN_PROGRESS">{t('process:in_progress')}</option>
                        <option value="COMPLETED">{t('process:completed')}</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:cif_value')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.cif_value}
                    onChange={(e) => handleEditInputChange('cif_value', parseFloat(e.target.value) || 0)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:total_pallets')}</label>
                  <input
                    type="number"
                    value={editFormData.total_pallets}
                    onChange={(e) => handleEditInputChange('total_pallets', parseInt(e.target.value) || 0)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Observations */}
              <div className="flex flex-col">
                <label className="font-medium text-gray-700 mb-1">{t('process:observation')}</label>
                <textarea
                  value={editFormData.observation}
                  onChange={(e) => handleEditInputChange('observation', e.target.value)}
                  rows={3}
                  className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-1 focus-visible:outline-primary-500"
                  placeholder={t('process:enter_observations')}
                />
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
                  {t('process:products')} ({editFormData.products.length})
                </Text>
                <Button
                  type="button"
                  variant="action"
                  onClick={addProduct}
                  additionalClass="px-4 py-2"
                >
                  {t('process:add_product')}
                </Button>
              </div>

              {editFormData.products.map((product: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <Text weight="font-semibold">{t('process:product')} #{index + 1}</Text>
                    {editFormData.products.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeProduct(index)}
                        additionalClass="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        {t('common:remove')}
                      </Button>
                    )}
                  </div>

                  {/* Product Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:product')} *</label>
                      <Select
                        options={entryFormFields.products?.map((p: any) => ({
                          value: p.product_id || p.value,
                          label: `${p.name || p.label} (${p.product_code || ''})`
                        })) || []}
                        styles={reactSelectStyle}
                        value={entryFormFields.products?.find((p: any) => (p.product_id || p.value) === product.product_id) ? {
                          value: product.product_id,
                          label: `${entryFormFields.products?.find((p: any) => (p.product_id || p.value) === product.product_id)?.name || entryFormFields.products?.find((p: any) => (p.product_id || p.value) === product.product_id)?.label} (${entryFormFields.products?.find((p: any) => (p.product_id || p.value) === product.product_id)?.product_code || ''})`
                        } : null}
                        onChange={(selected: any) => {
                          handleProductChange(index, 'product_id', selected?.value || '');
                          const selectedProduct = entryFormFields.products?.find((p: any) => (p.product_id || p.value) === selected?.value);
                          if (selectedProduct) {
                            handleProductChange(index, 'product_code', selectedProduct.product_code || '');
                          }
                        }}
                        placeholder={t('process:select_product')}
                        isClearable
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:supplier')} *</label>
                      <Select
                        options={entryFormFields.suppliers?.map((s: any) => ({
                          value: s.supplier_id || s.value,
                          label: s.name || s.label
                        })) || []}
                        styles={reactSelectStyle}
                        value={entryFormFields.suppliers?.find((s: any) => (s.supplier_id || s.value) === product.supplier_id) ? {
                          value: product.supplier_id,
                          label: entryFormFields.suppliers?.find((s: any) => (s.supplier_id || s.value) === product.supplier_id)?.name || entryFormFields.suppliers?.find((s: any) => (s.supplier_id || s.value) === product.supplier_id)?.label
                        } : null}
                        onChange={(selected: any) => handleProductChange(index, 'supplier_id', selected?.value || '')}
                        placeholder={t('process:select_supplier')}
                        isClearable
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:serial_number')} *</label>
                      <input
                        type="text"
                        value={product.serial_number}
                        onChange={(e) => handleProductChange(index, 'serial_number', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:lot_series')} *</label>
                      <input
                        type="text"
                        value={product.lot_series}
                        onChange={(e) => handleProductChange(index, 'lot_series', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:guide_number')} *</label>
                      <input
                        type="text"
                        value={product.guide_number}
                        onChange={(e) => handleProductChange(index, 'guide_number', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:inventory_quantity')} *</label>
                      <input
                        type="number"
                        value={product.inventory_quantity}
                        onChange={(e) => handleProductChange(index, 'inventory_quantity', parseInt(e.target.value) || 0)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                        min="1"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:package_quantity')} *</label>
                      <input
                        type="number"
                        value={product.package_quantity}
                        onChange={(e) => handleProductChange(index, 'package_quantity', parseInt(e.target.value) || 0)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:manufacturing_date')} *</label>
                      <input
                        type="date"
                        value={product.manufacturing_date}
                        onChange={(e) => handleProductChange(index, 'manufacturing_date', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:expiration_date')} *</label>
                      <input
                        type="date"
                        value={product.expiration_date}
                        onChange={(e) => handleProductChange(index, 'expiration_date', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:weight_kg')} *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={product.weight_kg}
                        onChange={(e) => handleProductChange(index, 'weight_kg', parseFloat(e.target.value) || 0)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                        min="0.01"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:presentation')}</label>
                      <select
                        value={product.presentation}
                        onChange={(e) => handleProductChange(index, 'presentation', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                      >
                        {entryFormFields.presentationOptions?.map((pres: any) => (
                          <option key={pres.value} value={pres.value}>
                            {pres.label}
                          </option>
                        )) || (
                          <>
                            <option value="PALETA">{t('process:paleta')}</option>
                            <option value="CAJA">{t('process:caja')}</option>
                            <option value="SACO">{t('process:saco')}</option>
                            <option value="UNIDAD">{t('process:unidad')}</option>
                            <option value="PAQUETE">{t('process:paquete')}</option>
                            <option value="TAMBOS">{t('process:tambo')}</option>
                            <option value="BULTO">{t('process:bulto')}</option>
                            <option value="OTRO">{t('process:otro')}</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:temperature_range')}</label>
                      <select
                        value={product.temperature_range}
                        onChange={(e) => handleProductChange(index, 'temperature_range', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                      >
                        {entryFormFields.temperatureRanges?.map((temp: any) => (
                          <option key={temp.value} value={temp.value}>
                            {temp.label}
                          </option>
                        )) || (
                          <>
                            <option value="AMBIENTE">{t('process:ambient')}</option>
                            <option value="FRIO">{t('process:refrigerated')}</option>
                            <option value="CONGELADO">{t('process:frozen')}</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Section */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="cancel"
                onClick={() => setIsEditMode(false)}
                additionalClass="w-40"
                disabled={isUpdating}
              >
                {t('common:cancel')}
              </Button>
              
              <Button
                type="submit"
                disabled={isUpdating}
                variant="action"
                additionalClass="w-48"
              >
                {isUpdating ? t('process:updating') : t('process:update_entry_order')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ✅ Regular view mode - All date fields are strings from API
  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "NEEDS_REVISION":
        return "bg-orange-100 text-orange-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReviewStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return t('process:approved');
      case "REJECTED":
        return t('process:rejected');
      case "NEEDS_REVISION":
        return t('process:needs_revision');
      case "PENDING":
        return t('process:pending');
      default:
        return status;
    }
  };

  // ✅ Handle document download/view
  const handleDocumentAction = async (documentData: any, action: 'view' | 'download') => {
    if (typeof documentData === 'string') {
      // Old format - single URL
      if (action === 'view') {
        window.open(documentData, '_blank');
      } else {
        // Force download by fetching the file as blob
        try {
          const response = await fetch(documentData);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = documentData.split('/').pop() || 'document.pdf';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Download failed:', error);
          // Fallback to opening in new tab
          window.open(documentData, '_blank');
        }
      }
    } else {
      // New format - object with file details
      if (action === 'view') {
        window.open(documentData.public_url, '_blank');
      } else {
        // Force download by fetching the file as blob
        try {
          const response = await fetch(documentData.public_url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = documentData.file_name || 'document.pdf';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Download failed:', error);
          // Fallback to opening in new tab
          window.open(documentData.public_url, '_blank');
        }
      }
    }
  };

  // ✅ Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };





  const canReview =
    entry.review_status === "PENDING" ||
    entry.review_status === "NEEDS_REVISION";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Text size="3xl" weight="font-bold">
          {t('process:entry_order_review')}: {orderNo}
        </Text>
        <Button
          variant="cancel"
          onClick={() => navigate(-1)}
        >
          {t('common:back')}
        </Button>
      </div>
      <Divider height="lg" />

      {/* Status Messages - safely check message */}
      {reviewStatus.message && (
        <div className={`p-4 rounded-lg mb-4 ${
          reviewStatus.success
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          <Text size="sm" weight="font-medium">
            {reviewStatus.message}
          </Text>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Compact Order Information */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
              {entry.entry_order_no} - {entry.creator ? `${entry.creator.first_name} ${entry.creator.last_name}` : entry.creator_name || 'N/A'}
            </Text>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReviewStatusColor(entry.review_status)}`}>
              {getReviewStatusText(entry.review_status)}
            </span>
          </div>

          {/* Compact grid layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs">{t('process:order_status')}</span>
              <p className="font-medium">{entry.order_status}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:total_products')}</span>
              <p className="font-medium">{entry.products?.length || 0}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:total_weight')}</span>
              <p className="font-medium">{entry.calculated_totals?.weight_kg || entry.total_weight || 0} kg</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:total_volume')}</span>
              <p className="font-medium">{entry.calculated_totals?.volume_m3 || entry.total_volume || 0} m³</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:cif_value')}</span>
              <p className="font-medium">${entry.cif_value || 0}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:entry_date')}</span>
              <p className="font-medium">{formatDate(entry.entry_date_time)}</p>
            </div>
          </div>

          {/* Comments/Observations inline */}
          {(entry.observation || entry.review_comments) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {entry.observation && (
                <div className="mb-2">
                  <span className="text-gray-500 text-xs">{t('process:observations')}: </span>
                  <span className="text-sm">{entry.observation}</span>
                </div>
              )}
              {entry.review_comments && (
                <div>
                  <span className="text-gray-500 text-xs">{t('process:review_comments')}: </span>
                  <span className="text-sm">{entry.review_comments}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documents and Allocations - Compact */}
        {((entry.uploaded_documents) || (entry.inventoryAllocations && entry.inventoryAllocations.length > 0)) && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Documents */}
              {entry.uploaded_documents && (
                <div>
                  <Text size="lg" weight="font-semibold" additionalClass="mb-3 text-gray-800">
                    {t('process:uploaded_documents')}
                  </Text>
                  
                  {typeof entry.uploaded_documents === 'string' ? (
                    <div className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <Text size="sm" weight="font-medium">{entry.uploaded_documents.split('/').pop() || t('process:document')}</Text>
                        </div>
                        <div className="flex space-x-1">
                          <Button onClick={() => handleDocumentAction(entry.uploaded_documents, 'view')} additionalClass="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700">
                            {t('process:view')}
                          </Button>
                          <Button onClick={() => handleDocumentAction(entry.uploaded_documents, 'download')} additionalClass="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700">
                            {t('process:download')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {entry.uploaded_documents.map((document: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <Text size="sm" weight="font-medium">{document.file_name}</Text>
                                <Text size="xs" additionalClass="text-gray-500">{document.document_type?.replace(/_/g, ' ')} • {formatFileSize(document.file_size)}</Text>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button onClick={() => handleDocumentAction(document, 'view')} additionalClass="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700">
                                {t('process:view')}
                              </Button>
                              <Button onClick={() => handleDocumentAction(document, 'download')} additionalClass="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700">
                                {t('process:download')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Allocations */}
              {(() => {
                const hasProductAllocations = entry.products?.some((product: any) => product.inventoryAllocations && product.inventoryAllocations.length > 0);
                const hasEntryAllocations = entry.inventoryAllocations && entry.inventoryAllocations.length > 0;
                return hasProductAllocations || hasEntryAllocations;
              })() && (
                <div>
                  <Text size="lg" weight="font-semibold" additionalClass="mb-3 text-gray-800">
                    {t('process:allocations')} ({(() => {
                      const allAllocations: any[] = [];
                      entry.products?.forEach((product: any) => {
                        if (product.inventoryAllocations) {
                          allAllocations.push(...product.inventoryAllocations);
                        }
                      });
                      return allAllocations.length > 0 ? allAllocations.length : (entry.inventoryAllocations?.length || 0);
                    })()})
                  </Text>
                  <div className="space-y-2">
                    {(() => {
                      // Get all allocations from products
                      const allAllocations: any[] = [];
                      entry.products?.forEach((product: any) => {
                        if (product.inventoryAllocations) {
                          product.inventoryAllocations.forEach((allocation: any) => {
                            allAllocations.push({
                              ...allocation,
                              productName: product.product?.name || 'N/A',
                              productCode: product.product?.product_code || 'N/A'
                            });
                          });
                        }
                      });
                      
                      // If no product allocations, fall back to entry.inventoryAllocations
                      const allocationsToShow = allAllocations.length > 0 ? allAllocations : (entry.inventoryAllocations || []);
                      
                      return allocationsToShow.map((allocation: any, index: number) => (
                        <div key={allocation.allocation_id || index} className="border border-gray-200 rounded p-3 text-sm">
                          <div className="flex justify-between items-center">
                            <div>
                              <Text size="sm" weight="font-medium">
                                {t('process:cell_reference')}: {allocation.cellReference || 
                                 (allocation.cell ? `${allocation.cell.row}.${String(allocation.cell.bay).padStart(2, '0')}.${String(allocation.cell.position).padStart(2, '0')}` : 'N/A')}
                              </Text>
                              <Text size="xs" additionalClass="text-gray-500">
                                {allocation.inventory_quantity || 0} {t('process:units')} • {formatDate(allocation.allocated_at)}
                              </Text>
                              {allocation.productName && (
                                <Text size="xs" additionalClass="text-blue-600">
                                  {allocation.productName} ({allocation.productCode})
                                </Text>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${allocation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {allocation.status === 'ACTIVE' ? t('process:active') : allocation.status}
                              </span>
                              <Text size="xs" additionalClass="text-gray-500 mt-1">
                                {allocation.allocator ? `${allocation.allocator.first_name} ${allocation.allocator.last_name}` : allocation.allocator_name || (t('process:allocator') + ': N/A')}
                              </Text>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Table - Compact */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
              {t('process:products')} ({entry.products?.length || 0})
            </Text>

            <div className="flex space-x-2">
              {/* ✅ Edit button for NEEDS_REVISION orders */}
              {canUserEdit() && (
                <Button
                  variant="action"
                  onClick={initializeEditForm}
                  additionalClass="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {t('process:edit_order')}
                </Button>
              )}

              {/* ✅ Review buttons only for admin/non-client users */}
              {canReview && localStorage.getItem("role") !== "CLIENT" && (
                <>
                  <Button
                    variant="action"
                    onClick={() => openModal("approve")}
                    additionalClass="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSubmitting}
                  >
                    {t('process:approve')}
                  </Button>
                  <Button
                    onClick={() => openModal("revision")}
                    additionalClass="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={isSubmitting}
                  >
                    {t('process:needs_revision')}
                  </Button>
                  <Button
                    onClick={() => openModal("reject")}
                    additionalClass="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                    disabled={isSubmitting}
                  >
                    {t('process:reject')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Excel-like Products Table */}
          {entry.products && entry.products.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:product')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:serial_number')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:supplier')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:lot_series')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:inventory_quantity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:package_quantity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:weight_kg')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:volume_m3')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:presentation')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:temperature_range')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:dates')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('process:allocations')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entry.products.map((product: any, index: number) => (
                    <tr key={product.entry_order_product_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                      <td className="px-3 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm border-r border-gray-200">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900">
                            {product.product?.name}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {product.product?.product_code}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 font-mono">
                        {product.serial_number}
                      </td>
                      <td className="px-4 py-4 text-sm border-r border-gray-200">
                        <div>
                          <Text weight="font-medium" additionalClass="text-gray-900">
                            {product.supplier?.name}
                          </Text>
                          <Text size="xs" additionalClass="text-gray-500">
                            {product.supplier?.country?.name}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 font-mono">
                        {product.lot_series}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-center font-medium">
                        {product.inventory_quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-center font-medium">
                        {product.package_quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-right font-medium">
                        {product.weight_kg} kg
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-right font-medium">
                        {product.volume_m3 || 0} m³
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.presentation}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {product.temperature_range}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 border-r border-gray-200">
                        <div className="space-y-1">
                          <div>
                            <Text size="xs" additionalClass="text-gray-400">Mfg:</Text>
                            <Text size="xs">{formatDate(product.manufacturing_date)}</Text>
                          </div>
                          <div>
                            <Text size="xs" additionalClass="text-gray-400">Exp:</Text>
                            <Text size="xs">{formatDate(product.expiration_date)}</Text>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {product.inventoryAllocations && product.inventoryAllocations.length > 0 ? (
                          <div className="space-y-1">
                            {product.inventoryAllocations.map((allocation: any) => (
                              <div key={allocation.allocation_id} className="flex items-center space-x-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {allocation.cellReference}
                                </span>
                                <Text size="xs" additionalClass="text-gray-500">
                                  {allocation.inventory_quantity} units
                                </Text>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {t('process:not_allocated')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
              <Text>{t('process:no_products_found')}</Text>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <Text size="xl" weight="font-bold">
                {reviewMode === "approve"
                  ? t('process:approve_order')
                  : reviewMode === "reject"
                  ? t('process:reject_order')
                  : t('process:request_revision_order')}
                : {orderNo}
              </Text>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <Divider />

            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  {t('process:review_comments')} {reviewMode !== "approve" && "*"}
                </label>
                <textarea
                  className="w-full rounded p-3 h-32 resize-none bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={
                    reviewMode === "approve"
                      ? t('process:enter_additional_comments_optional')
                      : reviewMode === "reject"
                      ? t('process:explain_rejection_reason')
                      : t('process:specify_revision_needs')
                  }
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  required={reviewMode !== "approve"}
                  disabled={isSubmitting}
                />
              </div>

              {reviewMode !== "approve" && !reviewComments.trim() && (
                <Text size="sm" additionalClass="text-red-600">
                  {t('process:comments_required_for_rejection_revision')}
                </Text>
              )}
            </div>

            <Divider />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="cancel"
                onClick={closeModal}
                additionalClass="px-6 py-2"
                disabled={isSubmitting}
              >
                {t('common:cancel')}
              </Button>

              <Button
                onClick={handleReview}
                additionalClass={`px-6 py-2 text-white ${
                  reviewMode === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : reviewMode === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
                disabled={
                  isSubmitting ||
                  (reviewMode !== "approve" && !reviewComments.trim())
                }
              >
                {isSubmitting
                  ? t('process:processing')
                  : reviewMode === "approve"
                  ? t('process:approve_order')
                  : reviewMode === "reject"
                  ? t('process:reject_order')
                  : t('process:request_revision')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
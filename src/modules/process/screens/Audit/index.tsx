/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  created_by: string; // ✅ Add this property
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
    
    return (
      entry.review_status === "NEEDS_REVISION" && 
      (entry.created_by === userId || userRole === "ADMIN")
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
          ? "approved"
          : reviewMode === "reject"
          ? "rejected"
          : "marked for revision";

      console.log(`Entry order ${statusText} successfully!`);
    } catch (err) {
      console.error(`Failed to ${reviewMode} entry order:`, err);
    } finally {
      setIsSubmitting(false);
    }
  }, [entry, reviewMode, reviewComments, orderNo]);

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
        <LoaderSync loaderText="Loading order details..." />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col h-full">
        <Text size="3xl" weight="font-bold">
          Entry Order Review: {orderNo}
        </Text>
        <Divider height="lg" />
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <Text size="lg" additionalClass="text-red-600 mb-2">
            Entry order not found
          </Text>
          <Text size="sm" additionalClass="text-red-500">
            The requested entry order "{orderNo}" could not be found.
          </Text>
          <Button
            variant="cancel"
            onClick={() => navigate(-1)}
            additionalClass="mt-4"
          >
            Back
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
            Edit Entry Order: {orderNo}
          </Text>
          <div className="flex space-x-2">
            <Button
              variant="cancel"
              onClick={() => setIsEditMode(false)}
              disabled={isUpdating}
            >
              Cancel Edit
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
                Returning to view mode...
              </Text>
            )}
          </div>
        )}

        {/* Review Comments from Admin */}
        {entry.review_comments && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
            <Text size="sm" weight="font-medium" additionalClass="text-orange-800 mb-2">
              Admin Review Comments:
            </Text>
            <Text size="sm" additionalClass="text-orange-700">
              {entry.review_comments}
            </Text>
          </div>
        )}

        {/* Edit Form */}
        <div className="flex-1 overflow-y-auto">
          <form className="order_entry_form space-y-6" onSubmit={handleUpdateSubmit}>
            
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
                Basic Information
              </Text>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Origin */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Origin *</label>
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
                    placeholder="Select origin..."
                    isClearable
                  />
                </div>

                {/* Document Type */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Document Type *</label>
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
                    placeholder="Select document type..."
                    isClearable
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Registration Date *</label>
                  <input
                    type="date"
                    value={editFormData.registration_date}
                    onChange={(e) => handleEditInputChange('registration_date', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Document Date *</label>
                  <input
                    type="date"
                    value={editFormData.document_date}
                    onChange={(e) => handleEditInputChange('document_date', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Entry Date & Time *</label>
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
                  <label className="font-medium text-gray-700 mb-1">Order Status</label>
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
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">CIF Value</label>
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
                  <label className="font-medium text-gray-700 mb-1">Total Pallets</label>
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
                <label className="font-medium text-gray-700 mb-1">Observations</label>
                <textarea
                  value={editFormData.observation}
                  onChange={(e) => handleEditInputChange('observation', e.target.value)}
                  rows={3}
                  className="border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-1 focus-visible:outline-primary-500"
                  placeholder="Enter any observations..."
                />
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
                  Products ({editFormData.products.length})
                </Text>
                <Button
                  type="button"
                  variant="action"
                  onClick={addProduct}
                  additionalClass="px-4 py-2"
                >
                  Add Product
                </Button>
              </div>

              {editFormData.products.map((product: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <Text weight="font-semibold">Product #{index + 1}</Text>
                    {editFormData.products.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeProduct(index)}
                        additionalClass="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Product Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">Product *</label>
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
                        placeholder="Select product..."
                        isClearable
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">Supplier *</label>
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
                        placeholder="Select supplier..."
                        isClearable
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">Serial Number *</label>
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
                      <label className="font-medium text-gray-700 mb-1">Lot Series *</label>
                      <input
                        type="text"
                        value={product.lot_series}
                        onChange={(e) => handleProductChange(index, 'lot_series', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">Guide Number *</label>
                      <input
                        type="text"
                        value={product.guide_number}
                        onChange={(e) => handleProductChange(index, 'guide_number', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">Inventory Qty *</label>
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
                      <label className="font-medium text-gray-700 mb-1">Package Qty *</label>
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
                      <label className="font-medium text-gray-700 mb-1">Manufacturing Date *</label>
                      <input
                        type="date"
                        value={product.manufacturing_date}
                        onChange={(e) => handleProductChange(index, 'manufacturing_date', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">Expiration Date *</label>
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
                      <label className="font-medium text-gray-700 mb-1">Weight (kg) *</label>
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
                      <label className="font-medium text-gray-700 mb-1">Presentation</label>
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
                            <option value="PALETA">PALETA</option>
                            <option value="CAJA">CAJA</option>
                            <option value="SACO">SACO</option>
                            <option value="UNIDAD">UNIDAD</option>
                            <option value="PAQUETE">PAQUETE</option>
                            <option value="TAMBOS">TAMBOS</option>
                            <option value="BULTO">BULTO</option>
                            <option value="OTRO">OTRO</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">Temperature Range</label>
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
                            <option value="AMBIENTE">AMBIENTE</option>
                            <option value="FRIO">FRIO</option>
                            <option value="CONGELADO">CONGELADO</option>
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
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isUpdating}
                variant="action"
                additionalClass="w-48"
              >
                {isUpdating ? "Updating..." : "Update Entry Order"}
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

  const orderInfo = [
    { label: "Entry Order No", value: entry.entry_order_no },
    {
      label: "Organisation",
      value: entry.organisation_name || entry.order?.organisation?.name,
    },
    { label: "Total Products", value: entry.products?.length || 0 },
    {
      label: "Total Inventory Qty",
      // ✅ Calculate from products array instead of relying on stored total
      value: entry.products?.reduce((sum: number, product: any) => {
        return sum + (Number(product.inventory_quantity) || 0);
      }, 0) || 0,
    },
    { 
      label: "Total Package Qty", 
      // ✅ Calculate from products array instead of relying on stored total
      value: entry.products?.reduce((sum: number, product: any) => {
        return sum + (Number(product.package_quantity) || 0);
      }, 0) || 0,
    },
    {
      label: "Total Weight",
      // ✅ Calculate from products array if calculated totals are not available
      value: `${
        entry.calculated_total_weight || 
        entry.total_weight || 
        entry.products?.reduce((sum: number, product: any) => {
          return sum + (Number(product.weight_kg) || 0);
        }, 0) || 0
      } kg`,
    },
    {
      label: "Total Volume",
      // ✅ Calculate from products array if calculated totals are not available
      value: `${
        entry.calculated_total_volume || 
        entry.total_volume || 
        entry.products?.reduce((sum: number, product: any) => {
          return sum + (Number(product.volume_m3) || 0);
        }, 0) || 0
      } m³`,
    },
    {
      label: "Registration Date",
      // ✅ Pass string directly to formatDate
      value: formatDate(entry.registration_date),
    },
    {
      label: "Document Date",
      // ✅ Pass string directly to formatDate
      value: formatDate(entry.document_date),
    },
    {
      label: "Entry Date",
      // ✅ Pass string directly to formatDate
      value: formatDate(entry.entry_date_time),
    },
    { label: "Order Status", value: entry.order_status },
    { label: "Document Type", value: entry.documentType?.name },
    { label: "Supplier", value: getMainSupplier(entry.products) },
    { label: "Origin", value: entry.origin?.name },
    { label: "Review Status", value: entry.review_status },
    { label: "Reviewed By", value: entry.reviewer_name || "Not reviewed" },
    {
      label: "Reviewed At",
      // ✅ Pass string directly to formatDate with null check
      value: entry.reviewed_at ? formatDate(entry.reviewed_at) : "Not reviewed",
    },
  ];

  function getMainSupplier(products: any[]) {
    if (!products || products.length === 0) return "-";

    const suppliers = [
      ...new Set(products.map((p) => p.supplier?.name).filter(Boolean)),
    ];

    if (suppliers.length === 1) {
      return suppliers[0];
    } else if (suppliers.length > 1) {
      return `Multiple (${suppliers.length} suppliers)`;
    } else {
      return "-";
    }
  }

  const canReview =
    entry.review_status === "PENDING" ||
    entry.review_status === "NEEDS_REVISION";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Text size="3xl" weight="font-bold">
          Entry Order Review: {orderNo}
        </Text>
        <Button
          variant="cancel"
          onClick={() => navigate(-1)}
        >
          Back
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

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Order Information Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <Text
              size="lg"
              weight="font-semibold"
              additionalClass="text-gray-800"
            >
              Order Information
            </Text>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getReviewStatusColor(
                entry.review_status
              )}`}
            >
              {entry.review_status}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderInfo.map(({ label, value }) => (
              <div key={label} className="flex flex-col space-y-1">
                <span className="font-medium text-gray-700 text-sm">{label}</span>
                <span className="text-gray-600 text-sm">{value ?? "-"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Comments */}
        {entry.review_comments && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Text
              size="lg"
              weight="font-semibold"
              additionalClass="mb-3 text-gray-800"
            >
              Review Comments
            </Text>
            <div className="bg-gray-50 rounded-lg p-4">
              <Text size="sm" additionalClass="text-gray-700">
                {entry.review_comments}
              </Text>
            </div>
          </div>
        )}

        {/* Products Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <Text
              size="lg"
              weight="font-semibold"
              additionalClass="text-gray-800"
            >
              Products ({entry.products?.length || 0})
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
                  Edit Order
                </Button>
              )}

              {/* ✅ Existing review buttons for admin */}
              {canReview && (
                <>
                  <Button
                    variant="action"
                    onClick={() => openModal("approve")}
                    additionalClass="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSubmitting}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => openModal("revision")}
                    additionalClass="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={isSubmitting}
                  >
                    Needs Revision
                  </Button>
                  <Button
                    onClick={() => openModal("reject")}
                    additionalClass="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                    disabled={isSubmitting}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {entry.products?.map((product: any, index: number) => (
              <div
                key={product.entry_order_product_id}
                className="rounded-lg p-4 bg-gray-50"
              >
                {/* Product Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Text weight="font-semibold" additionalClass="text-gray-800">
                      #{index + 1}: {product.product?.name}
                    </Text>
                    <Text size="sm" additionalClass="text-gray-600">
                      Code: {product.product?.product_code} | Serial: {product.serial_number}
                    </Text>
                  </div>
                </div>

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Inventory Qty:
                    </span>
                    <span className="text-gray-600">
                      {product.inventory_quantity}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Package Qty:
                    </span>
                    <span className="text-gray-600">
                      {product.package_quantity}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Weight:
                    </span>
                    <span className="text-gray-600">{product.weight_kg} kg</span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Volume:
                    </span>
                    <span className="text-gray-600">
                      {product.volume_m3 || 0} m³
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Presentation:
                    </span>
                    <span className="text-gray-600">{product.presentation}</span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Lot Series:
                    </span>
                    <span className="text-gray-600">{product.lot_series}</span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Temperature:
                    </span>
                    <span className="text-gray-600">
                      {product.temperature_range}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Supplier:
                    </span>
                    <span className="text-gray-600">
                      {product.supplier?.name}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Country:
                    </span>
                    <span className="text-gray-600">
                      {product.supplier?.country?.name ||
                        product.supplier_country}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Guide Number:
                    </span>
                    <span className="text-gray-600">{product.guide_number}</span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Insured Value:
                    </span>
                    <span className="text-gray-600">
                      ${product.insured_value || 0}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Humidity:
                    </span>
                    <span className="text-gray-600">{product.humidity}%</span>
                  </div>
                </div>

                {/* Dates - strings passed directly to formatDate */}
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Manufacturing Date:
                    </span>
                    <span className="text-gray-600">
                      {formatDate(product.manufacturing_date)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      Expiration Date:
                    </span>
                    <span className="text-gray-600">
                      {formatDate(product.expiration_date)}
                    </span>
                  </div>
                </div>

                {/* Health Registration */}
                {product.health_registration && (
                  <div className="mt-3 text-sm">
                    <span className="font-medium text-gray-700 block mb-1">
                      Health Registration:
                    </span>
                    <span className="text-gray-600">
                      {product.health_registration}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(!entry.products || entry.products.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Text>No products found</Text>
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
                  ? "Approve Order"
                  : reviewMode === "reject"
                  ? "Reject Order"
                  : "Request Revision"}
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
                  Review Comments {reviewMode !== "approve" && "*"}
                </label>
                <textarea
                  className="w-full rounded p-3 h-32 resize-none bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={
                    reviewMode === "approve"
                      ? "Enter any additional comments (optional)..."
                      : reviewMode === "reject"
                      ? "Please explain why this order is being rejected..."
                      : "Please specify what needs to be revised..."
                  }
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  required={reviewMode !== "approve"}
                  disabled={isSubmitting}
                />
              </div>

              {reviewMode !== "approve" && !reviewComments.trim() && (
                <Text size="sm" additionalClass="text-red-600">
                  Comments are required for rejection or revision requests.
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
                Cancel
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
                  ? "Processing..."
                  : reviewMode === "approve"
                  ? "Approve Order"
                  : reviewMode === "reject"
                  ? "Reject Order"
                  : "Request Revision"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
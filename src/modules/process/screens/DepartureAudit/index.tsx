/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Text, LoaderSync, Divider, Button } from "@/components";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/globalService";
import { formatDate } from "@/utils/dateUtils";
import { DepartureApprovalStep, UserRole } from "@/modules/process/types";

const DepartureAudit: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawOrderNo = searchParams.get("orderNo") || "";
  const orderNo = decodeURIComponent(rawOrderNo);

  const {
    currentDepartureOrder: order,
    departureAuditTrail,
    userRole,
    departurePermissions,
    loaders,
    reviewStatus,
    departureFormFields,
  } = ProcessesStore();

  const loading = loaders["processes/fetch-departure-orders"];
  const isUpdating = loaders["processes/update-departure-order"];

  const [showModal, setShowModal] = useState(false);
  const [reviewMode, setReviewMode] = useState<"approve" | "reject" | "revision">("approve");
  const [reviewComments, setReviewComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Load departure order and permissions
  useEffect(() => {
    if (orderNo) {
      ProcessService.fetchComprehensiveDepartureOrderByNo(orderNo);
    }
    
    // Initialize user role and permissions
    const role = localStorage.getItem("role") as UserRole;
    if (role) {
      ProcessesStore.getState().setUserRole(role);
      const permissions = ProcessService.getDefaultPermissions(role);
      ProcessesStore.getState().setDeparturePermissions(permissions);
    }

    // Load form fields for edit mode
    ProcessService.loadDepartureFormFields();
  }, [orderNo]);

  // Load audit trail when order is available
  useEffect(() => {
    if (order && (order.departure_order_id || order.departure_order_no || (order as any)?.departure_order_code)) {
      const orderId = order.departure_order_id || order.departure_order_no || (order as any)?.departure_order_code;
      ProcessService.getDepartureOrderAuditTrail(orderId)
        .then(auditTrail => {
          ProcessesStore.getState().setDepartureAuditTrail(orderId, auditTrail);
        })
        .catch(error => {
          console.error("Failed to load audit trail:", error);
        });
    }
  }, [order?.departure_order_id, order?.departure_order_no]);

  // Handle successful update
  useEffect(() => {
    if (submitStatus.success && submitStatus.message?.includes("updated successfully")) {
      setIsEditMode(false);
      setTimeout(() => {
        ProcessService.fetchComprehensiveDepartureOrderByNo(orderNo, true);
        setSubmitStatus({ success: false, message: "" });
      }, 2000);
    }
  }, [submitStatus, orderNo]);

  // ✅ Check if current user can edit - only allow editing own orders in REVISION status
  const canUserEdit = useCallback(() => {
    if (!order) return false;
    
    const userId = localStorage.getItem("id");
    const userRole = localStorage.getItem("role");
    
    // Check if order is in REVISION status and user created it (or is admin)
    const creatorId = (order as any).created_by || (order as any).creator?.id;
    
    return (
      (order as any).order_status === "REVISION" && 
      (creatorId === userId || userRole === "ADMIN")
    );
  }, [order]);

  // ✅ Initialize edit form with current order data
  const initializeEditForm = useCallback(() => {
    if (!order) return;

    const formData = {
      departure_order_code: (order as any).departure_order_no || (order as any).departure_order_code || "",
      customer_id: (order as any).customer_id || (order as any).client_id || "",
      warehouse_id: (order as any).warehouse_id || "",
      document_type_id: (order as any).document_type_id || "",
      document_number: (order as any).document_number || (order as any).dispatch_document_number || "",
      document_date: (order as any).document_date ? (order as any).document_date.split('T')[0] : "",
      departure_date: (order as any).departure_date_time ? (order as any).departure_date_time.split('T')[0] : "",
      departure_time: (order as any).departure_date_time ? (order as any).departure_date_time.slice(11, 16) : "",
      transport_type: (order as any).transport_type || "",
      destination_point: (order as any).destination_point || (order as any).arrival_point || "",
      carrier_name: (order as any).carrier_name || "",
      total_volume: (order as any).total_volume || 0,
      total_weight: (order as any).total_weight || 0,
      total_pallets: (order as any).total_pallets || 0,
      observation: (order as any).observation || (order as any).observations || "",
      priority_level: (order as any).priority_level || "MEDIUM",
      products: (order as any).products?.map((product: any) => ({
        departure_order_product_id: product.departure_order_product_id,
        product_id: product.product_id || product.product?.product_id,
        product_code: product.product_code || product.product?.product_code,
        product_name: product.product_name || product.product?.name,
        requested_quantity: product.requested_quantity || 0,
        requested_weight: product.requested_weight || 0,
        packaging_quantity: product.packaging_quantity || product.requested_packages || 0,
        pallet_quantity: product.pallet_quantity || product.requested_pallets || 0,
        lot_number: product.lot_series || product.lot_number || "",
        packaging_type: product.packaging_type || "",
        presentation: product.presentation || "CAJA",
        entry_order_no: product.entry_order_no || "",
        guide_number: product.guide_number || "",
      })) || [],
    };

    setEditFormData(formData);
    setIsEditMode(true);
  }, [order]);

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

  // ✅ Handle update submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData || !order) return;

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add basic fields
      formData.append("document_date", editFormData.document_date);
      formData.append("departure_date_time", `${editFormData.departure_date}T${editFormData.departure_time}:00.000Z`);
      formData.append("destination_point", editFormData.destination_point);
      formData.append("transport_type", editFormData.transport_type);
      formData.append("carrier_name", editFormData.carrier_name);
      formData.append("total_volume", editFormData.total_volume.toString());
      formData.append("total_weight", editFormData.total_weight.toString());
      formData.append("total_pallets", editFormData.total_pallets.toString());
      formData.append("observation", editFormData.observation);
      formData.append("warehouse_id", editFormData.warehouse_id);
      formData.append("customer_id", editFormData.customer_id);

      // Add products
      editFormData.products.forEach((product: any, index: number) => {
        formData.append(`products[${index}][departure_order_product_id]`, product.departure_order_product_id || "");
        formData.append(`products[${index}][product_id]`, product.product_id);
        formData.append(`products[${index}][product_code]`, product.product_code);
        formData.append(`products[${index}][requested_quantity]`, product.requested_quantity.toString());
        formData.append(`products[${index}][requested_weight]`, product.requested_weight.toString());
        formData.append(`products[${index}][packaging_quantity]`, product.packaging_quantity.toString());
        formData.append(`products[${index}][pallet_quantity]`, product.pallet_quantity.toString());
        formData.append(`products[${index}][lot_series]`, product.lot_number);
        formData.append(`products[${index}][presentation]`, product.presentation);
      });

      const orderId = (order as any).departure_order_id || (order as any).departure_order_no || (order as any).departure_order_code;
      await ProcessService.updateDepartureOrder(orderId, formData);
      
      setSubmitStatus({
        success: true,
        message: "Departure order updated successfully!"
      });
    } catch (error) {
      console.error("Failed to update departure order:", error);
      setSubmitStatus({
        success: false,
        message: "Failed to update departure order. Please try again."
      });
    }
  };



  // Handle review actions
  const handleReview = useCallback(async () => {
    if (!order) return;

    console.log('handleReview called with reviewMode:', reviewMode);
    setIsSubmitting(true);
    try {
      const orderId = order.departure_order_id || order.departure_order_no || (order as any)?.departure_order_code;
      console.log('Using orderId:', orderId);
      
      switch (reviewMode) {
        case "approve":
          await ProcessService.approveDepartureOrder(orderId, {
            comments: reviewComments.trim(),
            priority_level: (order as any).priority_level,
          });
          break;
          
        case "reject":
          if (!rejectionReason.trim() || !reviewComments.trim()) {
            throw new Error("Rejection reason and comments are required");
          }
          await ProcessService.rejectDepartureOrder(orderId, {
            comments: reviewComments.trim(),
            reason: rejectionReason.trim(),
          });
          break;
          
        case "revision":
          if (!reviewComments.trim()) {
            throw new Error("Revision comments are required");
          }
          await ProcessService.requestDepartureOrderRevision(orderId, {
            comments: reviewComments.trim(),
            required_changes: [reviewComments.trim()],
          });
          break;
      }

      closeModal();
      // Refresh order data (force refresh since status changed)
      await ProcessService.fetchComprehensiveDepartureOrderByNo(orderNo, true);

      const statusText = reviewMode === "approve" 
        ? t('process:approved')
        : reviewMode === "reject"
        ? t('process:rejected')
        : t('process:marked_for_revision');

      console.log(`${t('process:departure_order')} ${statusText} ${t('common:successfully')}!`);
    } catch (err: any) {
      console.error(`${t('process:failed_to')} ${reviewMode} ${t('process:departure_order')}:`, err);
    } finally {
      setIsSubmitting(false);
    }
  }, [order, reviewMode, reviewComments, rejectionReason, orderNo, t]);

  const openModal = useCallback((mode: "approve" | "reject" | "revision") => {
    setReviewMode(mode);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setReviewComments("");
    setRejectionReason("");
    setReviewMode("approve");
    setIsSubmitting(false);
  }, []);

  // Get status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "REVISION":
        return "bg-orange-100 text-orange-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status?: string) => {
    if (!status) return 'Unknown';
    return t(`process:${status.toLowerCase()}`, status);
  };

  const canReview = (order as any)?.order_status === "PENDING" && 
                   userRole && 
                   userRole !== "CLIENT" &&
                   (departurePermissions?.can_approve_order || departurePermissions?.can_reject_order);

  // Debug logging for permissions
  console.log('DepartureAudit Debug:', {
    orderStatus: (order as any)?.order_status,
    userRole,
    departurePermissions,
    canReview,
    isPending: (order as any)?.order_status === "PENDING",
    isNotClient: userRole !== "CLIENT",
    hasApprovePermission: departurePermissions?.can_approve_order,
    hasRejectPermission: departurePermissions?.can_reject_order
  });

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Divider height="lg" />
        <LoaderSync loaderText={t('process:loading_departure_order_details')} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col h-full">
        <Text size="3xl" weight="font-bold">
          {t('process:departure_order_review')}: {orderNo}
        </Text>
        <Divider height="lg" />
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <Text size="lg" additionalClass="text-red-600 mb-2">
            {t('process:departure_order_not_found')}
          </Text>
          <Text size="sm" additionalClass="text-red-500">
            {t('process:departure_order_not_found_message', { orderNo })}
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

  const auditTrail = departureAuditTrail[order.departure_order_id || order.departure_order_no || (order as any)?.departure_order_code] || [];

  // ✅ If in edit mode, show the edit form
  if (isEditMode && editFormData && departureFormFields) {
    return (
      <div className="flex flex-col h-full">
        {/* Edit Header */}
        <div className="flex justify-between items-center">
          <Text size="3xl" weight="font-bold">
            {t('process:edit_departure_order')}: {orderNo}
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

        {/* Status Messages */}
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

        {/* Review Comments from Admin */}
        {(order as any).review_comments && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
            <Text size="sm" weight="font-medium" additionalClass="text-orange-800 mb-2">
              {t('process:admin_review_comments')}:
            </Text>
            <Text size="sm" additionalClass="text-orange-700">
              {(order as any).review_comments}
            </Text>
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
                {/* Document Date */}
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

                {/* Departure Date */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:departure_date')} *</label>
                  <input
                    type="date"
                    value={editFormData.departure_date}
                    onChange={(e) => handleEditInputChange('departure_date', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>

                {/* Departure Time */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:departure_time')} *</label>
                  <input
                    type="time"
                    value={editFormData.departure_time}
                    onChange={(e) => handleEditInputChange('departure_time', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    required
                  />
                </div>

                {/* Destination Point */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:destination_point')}</label>
                  <input
                    type="text"
                    value={editFormData.destination_point}
                    onChange={(e) => handleEditInputChange('destination_point', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    placeholder={t('process:enter_destination')}
                  />
                </div>

                {/* Transport Type */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:transport_type')}</label>
                  <input
                    type="text"
                    value={editFormData.transport_type}
                    onChange={(e) => handleEditInputChange('transport_type', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    placeholder={t('process:enter_transport_type')}
                  />
                </div>

                {/* Carrier Name */}
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:carrier_name')}</label>
                  <input
                    type="text"
                    value={editFormData.carrier_name}
                    onChange={(e) => handleEditInputChange('carrier_name', e.target.value)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    placeholder={t('process:enter_carrier_name')}
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:total_volume')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.total_volume}
                    onChange={(e) => handleEditInputChange('total_volume', parseFloat(e.target.value) || 0)}
                    className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">{t('process:total_weight')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.total_weight}
                    onChange={(e) => handleEditInputChange('total_weight', parseFloat(e.target.value) || 0)}
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
                <label className="font-medium text-gray-700 mb-1">{t('process:observations')}</label>
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
              <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
                {t('process:products')} ({editFormData.products.length})
              </Text>

              {editFormData.products.map((product: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <Text weight="font-semibold">{t('process:product')} #{index + 1}: {product.product_name}</Text>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:requested_quantity')} *</label>
                      <input
                        type="number"
                        value={product.requested_quantity}
                        onChange={(e) => handleProductChange(index, 'requested_quantity', parseInt(e.target.value) || 0)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                        min="1"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:requested_weight')} *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={product.requested_weight}
                        onChange={(e) => handleProductChange(index, 'requested_weight', parseFloat(e.target.value) || 0)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                        min="0.01"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:packaging_quantity')} *</label>
                      <input
                        type="number"
                        value={product.packaging_quantity}
                        onChange={(e) => handleProductChange(index, 'packaging_quantity', parseInt(e.target.value) || 0)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                        required
                        min="1"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:lot_number')}</label>
                      <input
                        type="text"
                        value={product.lot_number}
                        onChange={(e) => handleProductChange(index, 'lot_number', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{t('process:presentation')}</label>
                      <select
                        value={product.presentation}
                        onChange={(e) => handleProductChange(index, 'presentation', e.target.value)}
                        className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
                      >
                        <option value="PALETA">{t('process:paleta')}</option>
                        <option value="CAJA">{t('process:caja')}</option>
                        <option value="SACO">{t('process:saco')}</option>
                        <option value="UNIDAD">{t('process:unidad')}</option>
                        <option value="PAQUETE">{t('process:paquete')}</option>
                        <option value="TAMBOS">{t('process:tambo')}</option>
                        <option value="BULTO">{t('process:bulto')}</option>
                        <option value="OTRO">{t('process:otro')}</option>
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
                {isUpdating ? t('process:updating') : t('process:update_departure_order')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }



  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Text size="3xl" weight="font-bold">
          {t('process:departure_order_review')}: {orderNo}
        </Text>
        <Button
          variant="cancel"
          onClick={() => navigate(-1)}
        >
          {t('common:back')}
        </Button>
      </div>
      <Divider height="lg" />

      {/* Status Messages */}
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
              {order.departure_order_no || (order as any)?.departure_order_code} - {(order as any)?.creator ? `${(order as any).creator.first_name} ${(order as any).creator.last_name}` : (order as any)?.creator_name || 'N/A'}
            </Text>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor((order as any)?.order_status || order.status)}`}>
              {getStatusText((order as any)?.order_status || order.status)}
            </span>
          </div>

          {/* Compact grid layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs">{t('process:client')}</span>
              <p className="font-medium">{(order as any)?.client?.company_name || (order as any)?.customer?.name || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:total_products')}</span>
              <p className="font-medium">{(order as any)?.comprehensive_summary?.total_products || order.products?.length || 0}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:total_quantity')}</span>
              <p className="font-medium">{(order as any)?.comprehensive_summary?.total_quantity || 0}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:total_weight')}</span>
              <p className="font-medium">{(order as any)?.comprehensive_summary?.total_weight || (order as any)?.total_weight || 0} kg</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:total_pallets')}</span>
              <p className="font-medium">{(order as any)?.total_pallets || 0}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">{t('process:departure_date')}</span>
              <p className="font-medium">{formatDate((order as any)?.departure_date_time || order.departure_date)}</p>
            </div>
          </div>

          {/* Comments/Observations inline */}
          {((order as any)?.observation || (order as any)?.review_comments) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {(order as any)?.observation && (
                <div className="mb-2">
                  <span className="text-gray-500 text-xs">{t('process:observations')}: </span>
                  <span className="text-sm">{(order as any)?.observation}</span>
                </div>
              )}
              {(order as any)?.review_comments && (
                <div>
                  <span className="text-gray-500 text-xs">{t('process:review_comments')}: </span>
                  <span className="text-sm">{(order as any)?.review_comments}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documents Section */}
        {(order as any)?.uploaded_documents && (order as any).uploaded_documents.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <Text size="lg" weight="font-semibold" additionalClass="mb-3 text-gray-800">
              {t('process:uploaded_documents')} ({(order as any).uploaded_documents.length})
            </Text>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(order as any).uploaded_documents.map((doc: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <Text size="sm" weight="font-medium">{doc.file_name}</Text>
                        <Text size="xs" additionalClass="text-gray-500">
                          {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''} • {doc.document_type || 'Document'}
                        </Text>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {doc.public_url && (
                        <>
                          <button
                            onClick={() => window.open(doc.public_url, '_blank')}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title={t('process:view_document')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <a
                            href={doc.public_url}
                            download={doc.file_name}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title={t('process:download_document')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products and Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
              {t('process:products')} ({order.products?.length || 0})
            </Text>

            <div className="flex space-x-2">
              {/* Edit button for REVISION orders */}
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

              {/* Review Actions */}
              {canReview && (
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
          {order.products && order.products.length > 0 ? (
            <div className="overflow-x-auto">
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
                      {t('process:lot_series')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:supplier')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:requested_quantity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:requested_packages')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:requested_pallets')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:requested_weight')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:presentation')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {t('process:temperature_requirement')}
                    </th>
                    {(order as any)?.order_status !== 'COMPLETED' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('process:allocation_info')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.products.map((product: any, index: number) => {
                    const productSummary = (order as any)?.products_summary?.find(
                      (p: any) => p.departure_order_product_id === product.departure_order_product_id
                    );
                    
                    return (
                      <tr key={product.departure_order_product_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 text-sm border-r border-gray-200">
                          <div>
                            <Text weight="font-medium" additionalClass="text-gray-900">
                              {product.product?.name || product.product_name}
                            </Text>
                            <Text size="xs" additionalClass="text-gray-500">
                              {product.product?.product_code || product.product_code}
                            </Text>
                            {product.product?.manufacturer && (
                              <Text size="xs" additionalClass="text-gray-400">
                                {product.product.manufacturer}
                              </Text>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 font-mono">
                          {product.lot_series}
                        </td>
                        <td className="px-4 py-4 text-sm border-r border-gray-200">
                          <div>
                            <Text weight="font-medium" additionalClass="text-gray-900">
                              {productSummary?.supplier_info?.company_name || product.supplier?.name || '-'}
                            </Text>
                            {productSummary?.supplier_info?.contact_person && (
                              <Text size="xs" additionalClass="text-gray-500">
                                {productSummary.supplier_info.contact_person}
                              </Text>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-center font-medium">
                          {product.requested_quantity?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-center font-medium">
                          {product.requested_packages || 0}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-center font-medium">
                          {product.requested_pallets || 0}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-center font-medium">
                          {product.requested_weight} kg
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 text-center">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {product.presentation || 'CAJA'}
                          </span>
                        </td>
                                                 <td className={`px-4 py-4 text-sm text-gray-900 text-center ${(order as any)?.order_status !== 'COMPLETED' ? 'border-r border-gray-200' : ''}`}>
                           <span className={`px-2 py-1 text-xs rounded ${
                             product.temperature_requirement === 'REFRIGERADO' ? 'bg-blue-100 text-blue-800' :
                             product.temperature_requirement === 'CONGELADO' ? 'bg-purple-100 text-purple-800' :
                             'bg-green-100 text-green-800'
                           }`}>
                             {product.temperature_requirement || 'AMBIENTE'}
                           </span>
                         </td>
                         {(order as any)?.order_status !== 'COMPLETED' && (
                           <td className="px-4 py-4 text-sm text-gray-700">
                             <div className="space-y-1">
                               {/* Available Inventory Info */}
                               {productSummary?.available_inventory_summary?.total_available_quantity > 0 && (
                                 <div>
                                   <Text size="xs" additionalClass="text-green-600 font-medium">
                                     {t('process:available')}: {productSummary.available_inventory_summary.total_available_quantity.toLocaleString()}
                                   </Text>
                                   <Text size="xs" additionalClass="text-gray-500">
                                     {productSummary.available_inventory_summary.total_available_cells} {t('process:cells')}
                                   </Text>
                                 </div>
                               )}
                               
                               {/* Entry Order Info */}
                               {productSummary?.entry_order_info?.source_entry_orders?.length > 0 && (
                                 <div>
                                   <Text size="xs" additionalClass="text-blue-600">
                                     {t('process:from')}: {productSummary.entry_order_info.source_entry_orders.join(', ')}
                                   </Text>
                                 </div>
                               )}
                               
                               {/* Allocation Status */}
                               {productSummary?.allocation_status && (
                                 <div>
                                   <Text size="xs" additionalClass={
                                     productSummary.allocation_status.is_fully_allocated ? 'text-green-600' : 'text-orange-600'
                                   }>
                                     {productSummary.allocation_status.is_fully_allocated ? 
                                       t('process:fully_allocated') : 
                                       `${productSummary.allocation_status.allocation_percentage}% ${t('process:allocated')}`
                                     }
                                   </Text>
                                 </div>
                               )}
                             </div>
                           </td>
                         )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Text size="sm">
                {t('process:no_products_found')}
              </Text>
            </div>
          )}
        </div>

        {/* Audit Trail */}
        {auditTrail.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Text
              size="lg"
              weight="font-semibold"
              additionalClass="mb-4 text-gray-800"
            >
              {t('process:audit_trail')} ({auditTrail.length})
            </Text>
            <div className="space-y-3">
              {auditTrail.map((step: DepartureApprovalStep, index: number) => (
                <div key={step.step_id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded border">
                  <div className="flex-shrink-0">
                    <span className={`
                      inline-block w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center text-white
                      ${step.step_type === 'APPROVED' ? 'bg-green-500' :
                        step.step_type === 'REJECTED' ? 'bg-red-500' :
                        step.step_type === 'REVISION_REQUESTED' ? 'bg-orange-500' :
                        step.step_type === 'DISPATCHED' ? 'bg-blue-500' : 'bg-gray-500'}
                    `}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Text weight="font-medium" additionalClass="text-gray-800">
                        {t(`process:${step.step_type.toLowerCase()}`)} {t('process:by')} {step.performer_name}
                      </Text>
                      <Text size="xs" additionalClass="text-gray-500">
                        {formatDate(step.performed_at)}
                      </Text>
                    </div>
                    {step.comments && (
                      <Text size="sm" additionalClass="text-gray-600 mt-1">
                        {step.comments}
                      </Text>
                    )}
                    {step.reason && (
                      <Text size="sm" additionalClass="text-red-600 mt-1">
                        {t('process:reason')}: {step.reason}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <Text size="xl" weight="font-bold">
                {reviewMode === "approve"
                  ? t('process:approve_departure_order')
                  : reviewMode === "reject"
                  ? t('process:dispatch_departure_order')
                  : t('process:request_revision_departure_order')}
                : {orderNo}
              </Text>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Divider />

            <div className="mt-4 space-y-4">
              {/* Rejection Reason (only for reject) */}
              {reviewMode === "reject" && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    {t('process:rejection_reason')} *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded p-3 border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder={t('process:enter_rejection_reason')}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}


              {/* Comments */}
              <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    {reviewMode === "approve" 
                      ? `${t('process:approval_comments')} (${t('process:optional')})`
                      : `${t('process:review_comments')} *`
                    }
                  </label>
                  <textarea
                    className="w-full rounded p-3 h-32 resize-none bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder={
                      reviewMode === "approve"
                        ? t('process:enter_additional_comments_optional')
                        : reviewMode === "reject"
                        ? t('process:explain_rejection_details')
                        : t('process:specify_revision_requirements')
                    }
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    required={reviewMode !== "approve"}
                    disabled={isSubmitting}
                  />
                </div>

              {reviewMode !== "approve"  && !reviewComments.trim() && (
                <Text size="sm" additionalClass="text-red-600">
                  {t('process:comments_required_for_rejection_revision')}
                </Text>
              )}

              {reviewMode === "reject" && !rejectionReason.trim() && (
                <Text size="sm" additionalClass="text-red-600">
                  {t('process:reason_required_for_rejection')}
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
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
                disabled={
                  isSubmitting ||
                  (reviewMode !== "approve" && !reviewComments.trim()) ||
                  (reviewMode === "reject" && !rejectionReason.trim())
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

export default DepartureAudit; 
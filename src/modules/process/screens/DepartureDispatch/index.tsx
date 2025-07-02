/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Text, LoaderSync, Divider, Button } from "@/components";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/globalService";
import { formatDate } from "@/utils/dateUtils";
import { UserRole } from "@/modules/process/types";

const DepartureDispatch: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawOrderNo = searchParams.get("orderNo") || "";
  const orderNo = decodeURIComponent(rawOrderNo);

  const {
    currentDepartureOrder: order,
    userRole,
    departurePermissions,
    loaders,
  } = ProcessesStore();

  const loading = loaders["processes/fetch-departure-orders"];
  const isDispatching = loaders["processes/dispatch-departure-order"] || false;

  const [dispatchNotes, setDispatchNotes] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
  }, [orderNo]);

  // Handle dispatch confirmation
  const handleDispatch = useCallback(async () => {
    if (!order) return;

    try {
      const orderId = order.departure_order_id || order.departure_order_no || order.departure_order_code;
      
      console.log('Dispatching order:', { orderId, dispatchNotes });
      
      await ProcessService.simpleDispatchDepartureOrder(
        orderId,
        dispatchNotes.trim() || "Order dispatched - inventory removed"
      );

      setShowConfirmModal(false);
      
      // Navigate back to departure list
      navigate('/processes/departure', { 
        state: { 
          message: t('process:order_dispatched_successfully', { orderNo }),
          type: 'success' 
        }
      });

    } catch (err: any) {
      console.error("Failed to dispatch departure order:", err);
      alert(`Failed to dispatch order: ${err.message}`);
    }
  }, [order, dispatchNotes, orderNo, navigate, t]);

    const canDispatch = (order as any)?.order_status === "APPROVED" &&
                   userRole && 
                   userRole !== "CLIENT" &&
                   (departurePermissions?.can_dispatch_order || userRole === "WAREHOUSE_INCHARGE");

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
          {t('process:dispatch_departure_order')}: {orderNo}
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

  if ((order as any).order_status !== "APPROVED") {
    return (
      <div className="flex flex-col h-full">
        <Text size="3xl" weight="font-bold">
          {t('process:dispatch_departure_order')}: {orderNo}
        </Text>
        <Divider height="lg" />
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
          <Text size="lg" additionalClass="text-yellow-600 mb-2">
            {t('process:order_not_approved_for_dispatch')}
          </Text>
          <Text size="sm" additionalClass="text-yellow-500">
            {t('process:only_approved_orders_can_be_dispatched')}
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

  const orderInfo = [
    { label: t('process:departure_order_no'), value: order.departure_order_no || order.departure_order_code },
    { label: t('process:customer'), value: (order as any).client?.company_name || (order as any).customer?.name },
    { label: t('process:warehouse'), value: order.warehouse?.name },
    { label: t('process:destination_point'), value: (order as any).destination_point || (order as any).arrival_point },
    { label: t('process:transport_type'), value: order.transport_type },
    { label: t('process:total_products'), value: order.products?.length || 0 },
    {
      label: t('process:total_quantity'),
      value: (order as any).comprehensive_summary?.total_quantity || 0,
    },
    {
      label: t('process:total_weight'),
      value: `${(order as any).comprehensive_summary?.total_weight || order.total_weight || 0} kg`,
    },
    {
      label: t('process:total_value'),
      value: `$${(order as any).comprehensive_summary?.total_value || (order as any).total_value || 0}`,
    },
    {
      label: t('process:departure_date'),
      value: formatDate((order as any).departure_date_time || order.departure_date),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Text size="3xl" weight="font-bold">
          {t('process:dispatch_departure_order')}: {orderNo}
        </Text>
        <div className="flex space-x-2">
          <Button
            variant="cancel"
            onClick={() => navigate(-1)}
          >
            {t('common:back')}
          </Button>
          {canDispatch && (
            <Button
              onClick={() => setShowConfirmModal(true)}
              additionalClass="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isDispatching}
            >
              {isDispatching ? t('process:dispatching') : t('process:confirm_dispatch')}
            </Button>
          )}
        </div>
      </div>
      <Divider height="lg" />

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Order Information Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <Text
              size="lg"
              weight="font-semibold"
              additionalClass="text-gray-800"
            >
              {t('process:dispatch_information')}
            </Text>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {t('process:approved')}
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

        {/* Products to Dispatch */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Text
            size="lg"
            weight="font-semibold"
            additionalClass="mb-4 text-gray-800"
          >
            {t('process:products_to_dispatch')} ({order.products?.length || 0})
          </Text>
          <div className="space-y-4">
            {order.products?.map((product: any, index: number) => (
              <div
                key={product.departure_order_product_id || index}
                className="rounded-lg p-4 border border-gray-200 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Text weight="font-semibold" additionalClass="text-gray-800">
                      #{index + 1}: {product.product?.name || product.product_name}
                    </Text>
                    <Text size="sm" additionalClass="text-gray-600">
                      {t('process:product_code')}: {product.product?.product_code || product.product_code}
                    </Text>
                  </div>
                  <div className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text size="sm" additionalClass="text-blue-800 font-medium">
                      {t('process:ready_for_dispatch')}
                    </Text>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      {t('process:quantity')}:
                    </span>
                    <span className="text-gray-600">
                      {product.requested_quantity || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      {t('process:weight')}:
                    </span>
                    <span className="text-gray-600">
                      {product.requested_weight || 0} kg
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      {t('process:packages')}:
                    </span>
                    <span className="text-gray-600">
                      {product.requested_packages || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">
                      {t('process:lot_number')}:
                    </span>
                    <span className="text-gray-600">
                      {product.lot_series || product.lot_number || '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Notes */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Text
            size="lg"
            weight="font-semibold"
            additionalClass="mb-4 text-gray-800"
          >
            {t('process:dispatch_notes')} ({t('process:optional')})
          </Text>
          <textarea
            className="w-full rounded p-3 h-32 resize-none bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder={t('process:enter_dispatch_notes_placeholder')}
            value={dispatchNotes}
            onChange={(e) => setDispatchNotes(e.target.value)}
          />
        </div>

        {/* Warning Information */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <Text weight="font-medium" additionalClass="text-amber-800 mb-1">
                {t('process:dispatch_warning_title')}
              </Text>
              <Text size="sm" additionalClass="text-amber-700">
                {t('process:dispatch_warning_message')}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <Text size="lg" weight="font-bold" additionalClass="text-gray-900">
                  {t('process:confirm_dispatch_title')}
                </Text>
                <Text size="sm" additionalClass="text-gray-600">
                  {orderNo}
                </Text>
              </div>
            </div>

            <div className="mb-6">
              <Text size="sm" additionalClass="text-gray-700">
                {t('process:confirm_dispatch_message')}
              </Text>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                <li>• {t('process:products_will_be_removed_from_inventory')}</li>
                <li>• {t('process:order_status_will_change_to_dispatched')}</li>
                <li>• {t('process:this_action_cannot_be_undone')}</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="cancel"
                onClick={() => setShowConfirmModal(false)}
                additionalClass="flex-1"
                disabled={isDispatching}
              >
                {t('common:cancel')}
              </Button>
              <Button
                onClick={handleDispatch}
                additionalClass="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isDispatching}
              >
                {isDispatching ? t('process:dispatching') : t('process:confirm_dispatch')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartureDispatch; 
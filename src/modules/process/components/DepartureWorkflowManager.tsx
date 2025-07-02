/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Text, LoaderSync } from "@/components";
import {
  DepartureOrder,
  DepartureOrderStatus,
} from "@/modules/process/types";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/globalService";
import { ExpiryUrgencyIndicator } from "@/modules/process/screens/DepartureApproved/components";

interface DepartureWorkflowManagerProps {
  order: DepartureOrder;
  onOrderUpdate?: (updatedOrder: DepartureOrder) => void;
  showAuditTrail?: boolean;
  showActions?: boolean;
}

const DepartureWorkflowManager: React.FC<DepartureWorkflowManagerProps> = ({
  order,
  onOrderUpdate,
  showAuditTrail = true,
  showActions = true,
}) => {
  const { t } = useTranslation(['process', 'common']);
  
  const { 
    userRole, 
    departurePermissions, 
    departureAuditTrail 
  } = ProcessesStore();

  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [actionComments, setActionComments] = useState("");
  const [actionReason, setActionReason] = useState("");

  // Load audit trail on component mount
  useEffect(() => {
    if (order.departure_order_id) {
      ProcessService.getDepartureOrderAuditTrail(order.departure_order_id)
        .then(auditTrail => {
          ProcessesStore.getState().setDepartureAuditTrail(order.departure_order_id, auditTrail);
        })
        .catch(error => {
          console.error("Failed to load audit trail:", error);
        });
    }
  }, [order.departure_order_id]);

  // Get order status styling
  const getStatusStyling = (status: DepartureOrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "REVISION":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  // Get priority styling
  const getPriorityStyling = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-400 animate-pulse";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-400";
      default:
        return "bg-gray-100 text-gray-600 border-gray-400";
    }
  };

  // Check if user can perform specific actions
  const canPerformAction = (action: string) => {
    if (!userRole) return false;
    return ProcessService.canPerformAction(action, order.status, userRole);
  };

  // Handle approval action
  const handleApprove = async () => {
    if (!canPerformAction("approve")) return;
    
    setIsProcessingAction(true);
    try {
      await ProcessService.approveDepartureOrder(order.departure_order_id, {
        comments: actionComments,
        priority_level: order.priority_level,
      });
      
      setShowApprovalModal(false);
      setActionComments("");
      
      if (onOrderUpdate) {
        // Refresh order data
        const updatedOrder = await ProcessService.fetchComprehensiveDepartureOrderById(order.departure_order_id);
        onOrderUpdate(updatedOrder);
      }
    } catch (error: any) {
      console.error("Failed to approve order:", error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle rejection action
  const handleReject = async () => {
    if (!canPerformAction("reject")) return;
    
    if (!actionComments.trim() || !actionReason.trim()) {
      return;
    }

    setIsProcessingAction(true);
    try {
      await ProcessService.rejectDepartureOrder(order.departure_order_id, {
        comments: actionComments,
        reason: actionReason,
      });
      
      setShowRejectionModal(false);
      setActionComments("");
      setActionReason("");
      
      if (onOrderUpdate) {
        const updatedOrder = await ProcessService.fetchComprehensiveDepartureOrderById(order.departure_order_id);
        onOrderUpdate(updatedOrder);
      }
    } catch (error: any) {
      console.error("Failed to reject order:", error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle revision request
  const handleRequestRevision = async () => {
    if (!canPerformAction("request_revision")) return;
    
    if (!actionComments.trim()) {
      return;
    }

    setIsProcessingAction(true);
    try {
      await ProcessService.requestDepartureOrderRevision(order.departure_order_id, {
        comments: actionComments,
        required_changes: [actionComments], // For simplicity, using comments as required changes
      });
      
      setShowRevisionModal(false);
      setActionComments("");
      
      if (onOrderUpdate) {
        const updatedOrder = await ProcessService.fetchComprehensiveDepartureOrderById(order.departure_order_id);
        onOrderUpdate(updatedOrder);
      }
    } catch (error: any) {
      console.error("Failed to request revision:", error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Get expiry risk summary for the order
  const getOrderExpiryRisk = () => {
    if (!order.expiry_risk_summary) return null;
    
    const { has_expired_items, has_urgent_items, has_warning_items, overall_risk_level } = order.expiry_risk_summary;
    
    return {
      hasRisks: has_expired_items || has_urgent_items || has_warning_items,
      level: overall_risk_level,
      message: has_expired_items 
        ? t('process:contains_expired_items')
        : has_urgent_items 
        ? t('process:contains_urgent_items')
        : has_warning_items 
        ? t('process:contains_warning_items')
        : t('process:no_expiry_risks'),
    };
  };

  const expiryRisk = getOrderExpiryRisk();
  const auditTrail = departureAuditTrail[order.departure_order_id] || [];

  return (
    <div className="space-y-4">
      {/* Order Status Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyling(order.status)}`}>
            {t(`process:${order.status.toLowerCase()}`)}
          </span>
          
          {/* Priority Badge */}
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityStyling(order.priority_level)}`}>
            {t('process:priority')}: {t(`process:${order.priority_level.toLowerCase()}`)}
          </span>

          {/* Expiry Risk Indicator */}
          {expiryRisk?.hasRisks && (
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <Text size="xs" additionalClass="text-red-600 font-medium">
                {expiryRisk.message}
              </Text>
            </div>
          )}
        </div>

        {/* Order Information */}
        <div className="text-right">
          <Text size="sm" weight="font-medium">{order.departure_order_code}</Text>
          <Text size="xs" additionalClass="text-gray-500">
            {t('process:created')}: {new Date(order.created_at).toLocaleDateString()}
          </Text>
          {order.creator && (
            <Text size="xs" additionalClass="text-gray-500">
              {t('process:by')}: {order.creator.first_name} {order.creator.last_name}
            </Text>
          )}
        </div>
      </div>

      {/* Product Expiry Summary */}
      {order.products && order.products.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <Text size="sm" weight="font-medium" additionalClass="mb-3">
            {t('process:product_expiry_summary')} ({order.products.length} {t('process:products')})
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {order.products.slice(0, 6).map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <Text size="xs" weight="font-medium">{product.product_code}</Text>
                  <Text size="xs" additionalClass="text-gray-500">{product.lot_number}</Text>
                </div>
                <ExpiryUrgencyIndicator
                  urgency={product.expiry_info.expiry_urgency}
                  daysToExpiry={product.expiry_info.days_to_expiry}
                  expirationDate={product.expiration_date}
                  size="sm"
                  showDetails={false}
                />
              </div>
            ))}
            {order.products.length > 6 && (
              <div className="flex items-center justify-center p-2 bg-gray-100 rounded border border-dashed">
                <Text size="xs" additionalClass="text-gray-600">
                  +{order.products.length - 6} {t('process:more_products')}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow Actions */}
      {showActions && (order.status === "PENDING" || order.status === "APPROVED") && (
        <div className="p-4 bg-white rounded-lg border">
          <Text size="sm" weight="font-medium" additionalClass="mb-3">
            {t('process:available_actions')} ({t(`process:role_${userRole?.toLowerCase()}`)})
          </Text>
          
          <div className="flex flex-wrap gap-3">
            {canPerformAction("approve") && order.status === "PENDING" && (
              <Button
                onClick={() => setShowApprovalModal(true)}
                disabled={isProcessingAction}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                {t('process:approve_order')}
              </Button>
            )}

            {canPerformAction("reject") && order.status === "PENDING" && (
              <Button
                onClick={() => setShowRejectionModal(true)}
                disabled={isProcessingAction}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                {t('process:reject_order')}
              </Button>
            )}

            {canPerformAction("request_revision") && order.status === "PENDING" && (
              <Button
                onClick={() => setShowRevisionModal(true)}
                disabled={isProcessingAction}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
              >
                {t('process:request_revision')}
              </Button>
            )}

            {canPerformAction("dispatch") && order.status === "APPROVED" && (
              <Button
                onClick={() => {
                  // Navigate to dispatch interface (would be implemented)
                  console.log("Navigate to dispatch interface");
                }}
                disabled={isProcessingAction}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {t('process:dispatch_order')}
              </Button>
            )}

            {!departurePermissions?.can_approve_order && !departurePermissions?.can_reject_order && (
              <Text size="sm" additionalClass="text-gray-500 italic">
                {t('process:no_actions_available_for_role')}
              </Text>
            )}
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {showAuditTrail && auditTrail.length > 0 && (
        <div className="p-4 bg-white rounded-lg border">
          <Text size="sm" weight="font-medium" additionalClass="mb-3">
            {t('process:audit_trail')} ({auditTrail.length} {t('process:actions')})
          </Text>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {auditTrail.map((step, index) => (
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
                  <div className="flex items-center justify-between mb-1">
                    <Text size="xs" weight="font-medium">
                      {t(`process:${step.step_type.toLowerCase()}`)} {t('process:by')} {step.performer_name}
                    </Text>
                    <Text size="xs" additionalClass="text-gray-500">
                      {new Date(step.performed_at).toLocaleString()}
                    </Text>
                  </div>
                  
                  <Text size="xs" additionalClass="text-gray-600 mb-1">
                    {t('process:role')}: {t(`process:${step.performer_role.toLowerCase()}`)}
                  </Text>
                  
                  {step.comments && (
                    <Text size="xs" additionalClass="text-gray-700 bg-white p-2 rounded border">
                      {step.comments}
                    </Text>
                  )}
                  
                  {step.reason && (
                    <Text size="xs" additionalClass="text-red-700 bg-red-50 p-2 rounded border border-red-200 mt-1">
                      {t('process:reason')}: {step.reason}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full m-4 p-6">
            <Text size="lg" weight="font-bold" additionalClass="mb-4">
              {t('process:approve_departure_order')}
            </Text>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('process:approval_comments')} ({t('process:optional')})
              </label>
              <textarea
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder={t('process:enter_approval_comments')}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowApprovalModal(false)}
                disabled={isProcessingAction}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t('common:cancel')}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessingAction}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                {isProcessingAction ? (
                  <LoaderSync loaderText={t('process:approving')} />
                ) : (
                  <span>{t('process:approve')}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full m-4 p-6">
            <Text size="lg" weight="font-bold" additionalClass="mb-4">
              {t('process:reject_departure_order')}
            </Text>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('process:rejection_reason')} *
              </label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={t('process:enter_rejection_reason')}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('process:detailed_comments')} *
              </label>
              <textarea
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder={t('process:enter_detailed_rejection_comments')}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowRejectionModal(false)}
                disabled={isProcessingAction}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t('common:cancel')}
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessingAction || !actionComments.trim() || !actionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
              >
                {isProcessingAction ? (
                  <LoaderSync loaderText={t('process:rejecting')} />
                ) : (
                  <span>{t('process:reject')}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full m-4 p-6">
            <Text size="lg" weight="font-bold" additionalClass="mb-4">
              {t('process:request_order_revision')}
            </Text>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('process:revision_requirements')} *
              </label>
              <textarea
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                placeholder={t('process:specify_required_changes')}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowRevisionModal(false)}
                disabled={isProcessingAction}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t('common:cancel')}
              </Button>
              <Button
                onClick={handleRequestRevision}
                disabled={isProcessingAction || !actionComments.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center space-x-2"
              >
                {isProcessingAction ? (
                  <LoaderSync loaderText={t('process:requesting_revision')} />
                ) : (
                  <span>{t('process:request_revision')}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartureWorkflowManager; 
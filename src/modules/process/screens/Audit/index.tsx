/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Select, { CSSObjectWithLabel } from "react-select";
import { Text, LoaderSync, Divider, Button } from "@/components";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/globalService";
import { formatDate } from "@/utils/dateUtils";
import { getPackagingCode, AuditResult } from "@/modules/process/types";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "2.5rem",
    borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
    "&:hover": {
      borderColor: state.isFocused ? "#3b82f6" : "#94a3b8",
    },
  }),
};

interface ProductAuditForm {
  entry_order_product_id: string;
  audit_result: AuditResult;
  packaging_type: string;
  packaging_status: string;
  comments: string;
  discrepancy_notes: string;
  product_comments: string;
}

const Audit: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawOrderNo = searchParams.get("orderNo") || "";
  const orderNo = decodeURIComponent(rawOrderNo);

  const entry = ProcessesStore.use.currentEntryOrder();
  const packagingTypes = ProcessesStore.use.packagingTypes();
  const packagingStatuses = ProcessesStore.use.packagingStatuses();
  const loading = ProcessesStore.use.loaders()["processes/fetch-entry-order"];

  const [showModal, setShowModal] = useState(false);
  const [auditMode, setAuditMode] = useState<"approve" | "reject">("approve");
  const [overallComments, setOverallComments] = useState("");
  const [productAudits, setProductAudits] = useState<ProductAuditForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orderNo) {
      ProcessService.fetchEntryOrderByNo(orderNo);
    }
  }, [orderNo]);

  useEffect(() => {
    ProcessService.fetchEntryOrderFormFields();
  }, []);

  useEffect(() => {
    if (entry?.products) {
      const initialAudits = entry.products.map((product: any) => ({
        entry_order_product_id: product.entry_order_product_id,
        audit_result: "PENDING" as AuditResult,
        packaging_type: product.packaging_type || "",
        packaging_status: product.packaging_status || "",
        comments: "",
        discrepancy_notes: "",
        product_comments: product.product_description || "",
      }));
      setProductAudits(initialAudits);
      setOverallComments(entry.comments || "");
    }
  }, [entry?.products, entry?.comments]);

  const updateProductAudit = useCallback((productId: string, field: string, value: any) => {
    setProductAudits(prev => 
      prev.map(audit => 
        audit.entry_order_product_id === productId 
          ? { ...audit, [field]: value }
          : audit
      )
    );
  }, []);

  const setAllProductsAuditResult = useCallback((result: AuditResult) => {
    setProductAudits(prev => 
      prev.map(audit => ({ ...audit, audit_result: result }))
    );
  }, []);

  const handleBulkAudit = useCallback(async () => {
    if (!entry) return;
    
    setIsSubmitting(true);
    try {
      if (auditMode === "approve") {
        const incompleteProducts = productAudits.filter(audit => 
          !audit.packaging_type || !audit.packaging_status
        );

        if (incompleteProducts.length > 0) {
          alert("Please select packaging type and status for all products when approving.");
          setIsSubmitting(false);
          return;
        }
      }

      const auditsData = productAudits.map(productAudit => ({
        entry_order_product_id: productAudit.entry_order_product_id,
        audit_result: productAudit.audit_result as string,
        comments: productAudit.comments || undefined,
        discrepancy_notes: productAudit.discrepancy_notes || undefined,
        packaging_type: auditMode === "approve" && productAudit.packaging_type 
          ? productAudit.packaging_type 
          : undefined,
        packaging_status: auditMode === "approve" && productAudit.packaging_status 
          ? productAudit.packaging_status 
          : undefined,
        product_comments: productAudit.product_comments || undefined,
      }));

      await ProcessService.createBulkAudit({
        audits: auditsData,
        overall_audit_comments: overallComments,
      });

      closeModal();
      await ProcessService.fetchEntryOrderByNo(orderNo);
      
      alert(`Audit ${auditMode === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      console.error(`Failed to ${auditMode} audit:`, err);
      alert(`Failed to ${auditMode} audit. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  }, [entry, auditMode, productAudits, overallComments, orderNo]);

  const openModal = useCallback((mode: "approve" | "reject") => {
    setAuditMode(mode);
    setAllProductsAuditResult(mode === "approve" ? "PASSED" : "FAILED");
    setShowModal(true);
  }, [setAllProductsAuditResult]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setOverallComments(entry?.comments || "");
    setAuditMode("approve");
    setIsSubmitting(false);
  }, [entry?.comments]);

  if (loading) {
    return <LoaderSync loaderText="Loading order details..." />;
  }

  if (!entry) {
    return (
      <div className="flex flex-col h-[85%] p-6 space-y-6">
        <Text size="3xl" weight="font-bold">
          Entry Order Audit: {orderNo}
        </Text>
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <Text size="lg" additionalClass="text-red-600 mb-2">Entry order not found</Text>
          <Text size="sm" additionalClass="text-red-500">
            The requested entry order "{orderNo}" could not be found.
          </Text>
          <Button
            variant="cancel"
            onClick={() => navigate(-1)}
            additionalClass="px-6 py-2 mt-4"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  const orderInfo = [
    { label: "Entry Order No", value: entry.entry_order_no },
    { label: "Organisation", value: entry.order?.organisation?.name },
    { label: "Total Products", value: entry.products?.length || 0 },
    { label: "Total Packaging Qty", value: entry.total_quantity_packaging },
    { label: "Total Weight", value: `${entry.total_weight} kg` },
    { label: "Total Volume", value: `${entry.total_volume} m³` },
    { label: "Entry Date", value: formatDate(entry.entry_date) },
    { label: "Document Date", value: formatDate(entry.document_date) },
    { label: "Admission Date", value: formatDate(entry.admission_date_time) },
    { label: "Document Status", value: entry.document_status },
    { label: "Document Type", value: entry.documentType?.name },
    { label: "Supplier", value: entry.supplier?.name },
    { label: "Origin", value: entry.origin?.name },
    { label: "Audit Status", value: entry.audit_status },
  ];

  return (
    <div className="flex flex-col h-[85%] p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Text size="3xl" weight="font-bold">
          Entry Order Audit: {orderNo}
        </Text>
        <Button
          variant="cancel"
          onClick={() => navigate(-1)}
          additionalClass="px-4 py-2"
        >
          Back
        </Button>
      </div>

      {/* Order Information Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
          Order Information
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderInfo.map(({ label, value }) => (
            <div key={label} className="flex flex-col space-y-1">
              <span className="font-medium text-gray-700 text-sm">{label}</span>
              <span className="text-gray-600 text-sm">{value ?? "-"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Products Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
            Products ({entry.products?.length || 0})
          </Text>
          
          {/* Action Buttons */}
          {(entry.audit_status === "PENDING" || entry.audit_status === "FAILED") && (
            <div className="flex space-x-2">
              <Button
                variant="action"
                onClick={() => openModal("approve")}
                additionalClass="px-4 py-2"
                disabled={isSubmitting}
              >
                {entry.audit_status === "FAILED" ? "Re-approve" : "Approve"}
              </Button>
              <Button
                onClick={() => openModal("reject")}
                additionalClass="px-4 py-2"
                disabled={isSubmitting}
              >
                Reject
              </Button>
            </div>
          )}
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {entry.products?.map((product: any, index: number) => (
            <div key={product.entry_order_product_id} className="rounded-lg p-4 bg-gray-50">
              {/* Product Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Text weight="font-semibold" additionalClass="text-gray-800">
                    #{index + 1}: {product.product?.name}
                  </Text>
                  <Text size="sm" additionalClass="text-gray-600">
                    Code: {product.product?.product_code}
                  </Text>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.audit_status === "PASSED" 
                    ? "bg-green-100 text-green-800" 
                    : product.audit_status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {product.audit_status || "PENDING"}
                </span>
              </div>
              
              {/* Flex Layout for Product Information */}
              <div className="flex flex-wrap gap-4 text-sm">
                {/* Product Details */}
                <div className="flex-1 min-w-24">
                  <span className="font-medium text-gray-700 block mb-1">Quantity:</span>
                  <span className="text-gray-600">{product.quantity_packaging}</span>
                </div>
                
                <div className="flex-1 min-w-24">
                  <span className="font-medium text-gray-700 block mb-1">Weight:</span>
                  <span className="text-gray-600">{product.total_weight} kg</span>
                </div>
                
                <div className="flex-1 min-w-24">
                  <span className="font-medium text-gray-700 block mb-1">Volume:</span>
                  <span className="text-gray-600">{product.total_volume} m³</span>
                </div>
                
                <div className="flex-1 min-w-24">
                  <span className="font-medium text-gray-700 block mb-1">Palettes:</span>
                  <span className="text-gray-600">{product.palettes || 0}</span>
                </div>
                
                {/* Packaging Information */}
                <div className="flex-1 min-w-32">
                  <span className="font-medium text-gray-700 block mb-1">Type:</span>
                  <span className="text-gray-600 font-medium">
                    {product.packaging_type || "Not set"}
                  </span>
                </div>
                
                <div className="flex-1 min-w-28">
                  <span className="font-medium text-gray-700 block mb-1">Status:</span>
                  <span className="text-gray-600 font-medium">
                    {product.packaging_status || "Not set"}
                  </span>
                </div>
                
                <div className="flex-1 min-w-20">
                  <span className="font-medium text-gray-700 block mb-1">Code:</span>
                  <span className="text-gray-600 font-mono text-xs">
                    {product.packaging_code || "Not set"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!entry.products || entry.products.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Text>No products found</Text>
          </div>
        )}
      </div>

      {/* Audit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <Text size="xl" weight="font-bold">
                {auditMode === "approve" ? "Approve" : "Reject"} Audit: {orderNo}
              </Text>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <Divider />

            <div className="mt-4 space-y-4">
              {entry?.products?.map((product: any, index: number) => {
                const productAudit = productAudits.find(
                  audit => audit.entry_order_product_id === product.entry_order_product_id
                );

                return (
                  <div key={product.entry_order_product_id} className="rounded-lg p-4 bg-gray-50">
                    <Text weight="font-semibold" additionalClass="mb-3">
                      Product #{index + 1}: {product.product?.name}
                    </Text>

                    {auditMode === "approve" && (
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-48">
                          <label className="block font-medium text-gray-700 mb-1">
                            Packaging Type *
                          </label>
                          <Select
                            options={packagingTypes}
                            styles={reactSelectStyle}
                            value={packagingTypes.find((pt: any) => pt.value === productAudit?.packaging_type) || null}
                            onChange={(selectedOption) =>
                              updateProductAudit(
                                product.entry_order_product_id,
                                "packaging_type",
                                selectedOption?.value || ""
                              )
                            }
                            placeholder="Select packaging type"
                          />
                        </div>

                        <div className="flex-1 min-w-48">
                          <label className="block font-medium text-gray-700 mb-1">
                            Packaging Status *
                          </label>
                          <Select
                            options={packagingStatuses}
                            styles={reactSelectStyle}
                            value={packagingStatuses.find((ps: any) => ps.value === productAudit?.packaging_status) || null}
                            onChange={(selectedOption) =>
                              updateProductAudit(
                                product.entry_order_product_id,
                                "packaging_status",
                                selectedOption?.value || ""
                              )
                            }
                            placeholder="Select packaging status"
                          />
                        </div>

                        <div className="flex-1 min-w-48">
                          <label className="block font-medium text-gray-700 mb-1">
                            Packaging Code
                          </label>
                          <input
                            type="text"
                            value={
                              productAudit?.packaging_type && productAudit?.packaging_status
                                ? getPackagingCode(productAudit.packaging_type as any, productAudit.packaging_status as any)
                                : ""
                            }
                            readOnly
                            className="w-full h-10 rounded px-3 bg-gray-100 text-gray-600"
                            placeholder="Auto-generated"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-64">
                        <label className="block font-medium text-gray-700 mb-1">
                          Audit Comments
                        </label>
                        <textarea
                          className="w-full rounded p-2 h-20 resize-none bg-white"
                          placeholder="Enter audit comments..."
                          value={productAudit?.comments || ""}
                          onChange={(e) =>
                            updateProductAudit(
                              product.entry_order_product_id,
                              "comments",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-64">
                        <label className="block font-medium text-gray-700 mb-1">
                          Discrepancy Notes
                        </label>
                        <textarea
                          className="w-full rounded p-2 h-20 resize-none bg-white"
                          placeholder="Note any discrepancies..."
                          value={productAudit?.discrepancy_notes || ""}
                          onChange={(e) =>
                            updateProductAudit(
                              product.entry_order_product_id,
                              "discrepancy_notes",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Overall Audit Comments
                </label>
                <textarea
                  className="w-full rounded p-3 h-24 resize-none bg-white"
                  placeholder="Enter overall comments for this audit..."
                  value={overallComments}
                  onChange={(e) => setOverallComments(e.target.value)}
                />
              </div>
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
                variant={auditMode === "approve" ? "action" : "danger"}
                onClick={handleBulkAudit}
                additionalClass="px-6 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? "Processing..." 
                  : auditMode === "approve" 
                    ? "Approve All" 
                    : "Reject All"
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
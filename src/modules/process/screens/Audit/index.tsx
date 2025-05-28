import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Select, { CSSObjectWithLabel } from "react-select";
import { Text, LoaderSync, Divider, Button } from "@/components";
import ModalCancelBtn from "@/components/ModalComponents/ModalCloseButtonDefault";
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

  // Load form fields when component mounts
  useEffect(() => {
    ProcessService.fetchEntryOrderFormFields();
  }, []);

  // Initialize product audits when entry order is loaded
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
  }, [entry?.products]);

  const updateProductAudit = (productId: string, field: string, value: any) => {
    setProductAudits(prev => 
      prev.map(audit => 
        audit.entry_order_product_id === productId 
          ? { ...audit, [field]: value }
          : audit
      )
    );
  };

  const setAllProductsAuditResult = (result: AuditResult) => {
    setProductAudits(prev => 
      prev.map(audit => ({ ...audit, audit_result: result }))
    );
  };

  const handleBulkAudit = async () => {
    if (!entry) return;
    
    setIsSubmitting(true);
    try {
      // Validate required fields for approve mode
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

      // Prepare audit data
      const auditsData = productAudits.map(productAudit => ({
        entry_order_product_id: productAudit.entry_order_product_id,
        audit_result: productAudit.audit_result,
        comments: productAudit.comments,
        discrepancy_notes: productAudit.discrepancy_notes,
        packaging_type: auditMode === "approve" ? productAudit.packaging_type : null,
        packaging_status: auditMode === "approve" ? productAudit.packaging_status : null,
        product_comments: productAudit.product_comments,
      }));

      // Use bulk audit endpoint
      await ProcessService.createBulkAudit({
        audits: auditsData,
        overall_audit_comments: overallComments,
      });

      closeModal();
      // Refresh the entry order data
      await ProcessService.fetchEntryOrderByNo(orderNo);
      
      alert(`Audit ${auditMode === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      console.error(`Failed to ${auditMode} audit:`, err);
      alert(`Failed to ${auditMode} audit. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (mode: "approve" | "reject") => {
    setAuditMode(mode);
    
    // Set all products to the appropriate audit result
    if (mode === "approve") {
      setAllProductsAuditResult("PASSED");
    } else {
      setAllProductsAuditResult("FAILED");
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setOverallComments(entry?.comments || "");
    setAuditMode("approve");
    setIsSubmitting(false);
  };

  if (loading) {
    return <LoaderSync loaderText="Loading order details..." />;
  }

  const fields = entry
    ? [
        { label: "Entry Order No", value: entry.entry_order_no },
        { label: "Organisation", value: entry.order?.organisation?.name },
        { label: "Total Products", value: entry.products?.length || 0 },
        { label: "Total Packaging Qty", value: entry.total_quantity_packaging },
        { label: "Total Weight", value: `${entry.total_weight} kg` },
        { label: "Total Volume", value: `${entry.total_volume} m³` },
        { label: "Entry Date", value: formatDate(entry.entry_date) },
        { label: "Document Date", value: formatDate(entry.document_date) },
        {
          label: "Admission Date",
          value: formatDate(entry.admission_date_time),
        },
        { label: "Document Status", value: entry.document_status },
        { label: "Observation", value: entry.observation },
        { label: "Document Type", value: entry.documentType?.name },
        { label: "Supplier", value: entry.supplier?.name },
        { label: "Origin", value: entry.origin?.name },
        { label: "Audit Status", value: entry.audit_status },
        { label: "Overall Comments", value: entry.comments },
      ]
    : [];

  return (
    <div className="flex flex-col h-[85%] p-6 space-y-6 overflow-y-scroll">
      <Text size="3xl" weight="font-bold">
        Entry Order Audit: {orderNo}
      </Text>

      {entry ? (
        <>
          {/* Entry Order Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
              Order Information
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <span className="font-semibold text-gray-700">{label}</span>
                  <span className="text-gray-600">{value ?? "-"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
              Products ({entry.products?.length || 0})
            </Text>
            {entry.products?.map((product: any, index: number) => {
              const productAudit = productAudits.find(
                audit => audit.entry_order_product_id === product.entry_order_product_id
              );

              return (
                <div key={product.entry_order_product_id} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <Text size="md" weight="font-semibold" additionalClass="text-gray-800">
                      Product #{index + 1}: {product.product?.name}
                    </Text>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.audit_status === "PASSED" 
                          ? "bg-green-100 text-green-800" 
                          : product.audit_status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {product.audit_status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Product Code</span>
                      <span className="text-gray-600">{product.product?.product_code}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Quantity</span>
                      <span className="text-gray-600">{product.quantity_packaging} packages</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Weight</span>
                      <span className="text-gray-600">{product.total_weight} kg</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Volume</span>
                      <span className="text-gray-600">{product.total_volume} m³</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Current Packaging Type</span>
                      <span className="text-gray-600">{product.packaging_type || "Not set"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Current Packaging Status</span>
                      <span className="text-gray-600">{product.packaging_status || "Not set"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Current Packaging Code</span>
                      <span className="text-gray-600">{product.packaging_code || "Not set"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Expiration Date</span>
                      <span className="text-gray-600">{formatDate(product.expiration_date)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Manufacturing Date</span>
                      <span className="text-gray-600">{formatDate(product.mfd_date_time)}</span>
                    </div>
                  </div>

                  {/* Show existing audits if any */}
                  {product.audits && product.audits.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <Text size="sm" weight="font-medium" additionalClass="text-blue-800 mb-2">
                        Previous Audits
                      </Text>
                      {product.audits.map((audit: any, auditIndex: number) => (
                        <div key={audit.audit_id} className="text-sm text-blue-700 mb-1">
                          {formatDate(audit.audit_date)}: {audit.audit_result} 
                          {audit.comments && ` - ${audit.comments}`}
                        </div>
                      ))}
                    </div>
                  )}

                  {product.product_description && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-600 mt-1">{product.product_description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-red-500">Entry order not found.</div>
      )}

      <div>
        {entry && (
          <div className="flex justify-start space-x-4">
            {(entry.audit_status === "PENDING" || entry.audit_status === "FAILED") && (
              <>
                <Button
                  variant="action"
                  onClick={() => openModal("approve")}
                  additionalClass="px-6 py-2"
                  disabled={isSubmitting}
                >
                  {entry.audit_status === "FAILED" ? "Re-approve" : "Approve Audit"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => openModal("reject")}
                  additionalClass="px-6 py-2"
                  disabled={isSubmitting}
                >
                  Reject Audit
                </Button>
              </>
            )}

            <Button
              variant="cancel"
              onClick={() => navigate(-1)}
              additionalClass="px-6 py-2"
            >
              Back
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Audit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-lg">
            <div className="absolute top-4 right-4">
              <ModalCancelBtn />
            </div>
            
            <Text size="xl" weight="font-bold" additionalClass="mb-4">
              {auditMode === "approve" ? "Approve" : "Reject"} Audit: {orderNo}
            </Text>
            
            <Divider />

            {/* Products Audit Forms */}
            <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-800">
              {auditMode === "approve" ? "Update Packaging Information and Comments" : "Add Rejection Comments"}
            </Text>

            {entry?.products?.map((product: any, index: number) => {
              const productAudit = productAudits.find(
                audit => audit.entry_order_product_id === product.entry_order_product_id
              );

              return (
                <div key={product.entry_order_product_id} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
                  <Text size="md" weight="font-semibold" additionalClass="mb-3">
                    Product #{index + 1}: {product.product?.name}
                  </Text>

                  {auditMode === "approve" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Packaging Type */}
                      <div className="flex flex-col">
                        <label className="font-medium text-gray-700 mb-1">
                          Packaging Type *
                        </label>
                        <Select
                          options={packagingTypes}
                          styles={reactSelectStyle}
                          value={packagingTypes.find(pt => pt.value === productAudit?.packaging_type) || null}
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

                      {/* Packaging Status */}
                      <div className="flex flex-col">
                        <label className="font-medium text-gray-700 mb-1">
                          Packaging Status *
                        </label>
                        <Select
                          options={packagingStatuses}
                          styles={reactSelectStyle}
                          value={packagingStatuses.find(ps => ps.value === productAudit?.packaging_status) || null}
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

                      {/* Packaging Code (Display only) */}
                      <div className="flex flex-col">
                        <label className="font-medium text-gray-700 mb-1">
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
                          className="h-10 border border-slate-400 rounded-md px-4 bg-gray-100 text-gray-600"
                          placeholder="Auto-generated"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product-specific Comments */}
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">
                        Product Comments
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded p-2 h-20"
                        placeholder="Enter updated product description/comments..."
                        value={productAudit?.product_comments || ""}
                        onChange={(e) =>
                          updateProductAudit(
                            product.entry_order_product_id,
                            "product_comments",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Audit Comments */}
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">
                        Audit Comments
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded p-2 h-20"
                        placeholder="Enter audit-specific comments..."
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
                  </div>

                  {/* Discrepancy Notes */}
                  <div className="mt-4">
                    <label className="font-medium text-gray-700 mb-1 block">
                      Discrepancy Notes
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded p-2 h-20"
                      placeholder="Note any discrepancies found during audit..."
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
              );
            })}

            {/* Overall Comments */}
            <div className="mb-6">
              <label className="font-medium text-gray-700 mb-2 block">
                Overall Audit Comments
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-3 h-32"
                placeholder="Enter overall comments for this audit..."
                value={overallComments}
                onChange={(e) => setOverallComments(e.target.value)}
              />
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
                    ? "Approve All Products" 
                    : "Reject All Products"
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
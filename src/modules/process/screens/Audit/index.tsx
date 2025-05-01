import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Text, LoaderSync, Divider } from "@/components";
import ModalCancelBtn from "@/components/ModalComponents/ModalCloseButtonDefault";
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/globalService";
import { formatDate } from "@/utils/dateUtils";

const Audit: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawOrderNo = searchParams.get("orderNo") || "";
  const orderNo = decodeURIComponent(rawOrderNo);

  const entry = ProcessesStore.use.currentEntryOrder();
  const loading = ProcessesStore.use.loaders()["processes/fetch-entry-order"];

  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (orderNo) {
      ProcessService.fetchEntryOrderByNo(orderNo);
    }
  }, [orderNo]);

  const handleApproveAudit = async () => {
    if (!entry) return;
    try {
      console.log("Approve audit for order:", entry, "Comment:", comment);
      await ProcessService.createAudit({
        entry_order_id: entry.entry_order_id,
        audit_result: "PASSED",
        comments: comment,
      });
      closeModal();
      ProcessService.fetchEntryOrderByNo(orderNo);
    } catch (err) {
      console.error("Failed to approve audit:", err);
    }
  };

  const handleRejectAudit = () => {
    console.log("Reject audit for order:", orderNo, "Comment:", comment);
    // TODO: Call service to reject audit
    closeModal();
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setComment("");
  };

  if (loading) {
    return <LoaderSync loaderText="Loading order details..." />;
  }

  const fields = entry
    ? [
        { label: "Entry Order No", value: entry.entry_order_no },
        { label: "Organisation", value: entry.order?.organisation?.name },
        { label: "Palettes", value: entry.palettes },
        { label: "Product", value: entry.product?.name },
        { label: "Quantity", value: entry.total_qty },
        { label: "Weight", value: entry.total_weight },
        { label: "Insured Value", value: entry.insured_value },
        { label: "Entry Date", value: formatDate(entry.entry_date) },
        { label: "Document Date", value: formatDate(entry.document_date) },
        {
          label: "Admission Date",
          value: formatDate(entry.admission_date_time),
        },
        {
          label: "Registration Date",
          value: formatDate(entry.registration_date),
        },
        { label: "Document Status", value: entry.document_status },
        { label: "Order Progress", value: entry.order_progress },
        { label: "Observation", value: entry.observation },
        { label: "Presentation", value: entry.presentation },
        { label: "Comments", value: entry.comments },
        { label: "Document Type", value: entry.documentType?.name },
        { label: "Supplier", value: entry.supplier?.name },
        { label: "Origin", value: entry.origin?.name },
        { label: "Status", value: entry.status },
        { label: "Audit Result", value: entry.audit_status },
      ]
    : [];

  return (
    <div className="flex flex-col h-[85%] p-6 space-y-6 overflow-y-scroll">
      <Text size="3xl" weight="font-bold">
        Entry Order: {orderNo}
      </Text>

      {entry ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="font-semibold">{label}</span>
              <span>{value ?? "-"} </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-red-500">Entry order not found.</div>
      )}
      <div>
        {entry && (
          <div className="flex justify-start space-x-4">
            {entry.audit_status === "PENDING" ? (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
                onClick={openModal}
              >
                Audit
              </button>
            ) : null}

            {entry.audit_status === "FAILED" ? (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
                onClick={openModal}
              >
                Try Again
              </button>
            ) : null}

            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded cursor-pointer"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Audit Modal with slight background blur */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-lg">
            <div className="absolute top-4 right-4">
              <ModalCancelBtn />
            </div>
            <Text size="xl" weight="font-bold">
              Audit Order: {orderNo}
            </Text>
            <Divider height="xl" />
            <textarea
              className="w-full border border-gray-300 rounded p-2 h-32 mb-4"
              placeholder="Enter your comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Divider height="xl" />
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleApproveAudit}
              >
                Approve
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleRejectAudit}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;

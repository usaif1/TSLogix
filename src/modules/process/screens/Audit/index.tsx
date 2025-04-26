import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Text, LoaderSync } from "@/components";
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

  useEffect(() => {
    if (orderNo) {
      ProcessService.fetchEntryOrderByNo(orderNo);
    }
  }, [orderNo]);

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
        { label: "Admission Date", value: formatDate(entry.admission_date_time) },
        { label: "Registration Date", value: formatDate(entry.registration_date) },
        { label: "Document Status", value: entry.document_status },
        { label: "Order Progress", value: entry.order_progress },
        { label: "Observation", value: entry.observation },
        { label: "Presentation", value: entry.presentation },
        { label: "Comments", value: entry.comments },
        { label: "Document Type", value: entry.documentType?.name },
        { label: "Supplier", value: entry.supplier?.name },
        { label: "Origin", value: entry.origin?.name },
        { label: "Status", value: entry.status },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <Text size="3xl" weight="font-bold">
        Entry Order: {orderNo} 
      </Text>

      {entry ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="font-semibold">{label}</span>
              <span>{value ?? '-'}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-red-500">Entry order not found.</div>
      )}

      {entry && (
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {/* your audit logic here */}}
          >
            Audit
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Audit;

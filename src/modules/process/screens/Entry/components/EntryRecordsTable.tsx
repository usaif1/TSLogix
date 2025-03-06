// dependencies
import React from "react";

// store
import { ProcessesStore } from "@/globalStore";

const EntryRecordsTable: React.FC = () => {
  const entryOrders = ProcessesStore.use.entryOrders();

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="px-4 py-2 text-left">Entry Order No</th>
            <th className="px-4 py-2 text-left">Origin</th>
            <th className="px-4 py-2 text-left">Supplier</th>
            <th className="px-4 py-2 text-left">Document Type</th>
          </tr>
        </thead>
        <tbody>
          {entryOrders.map((entryOrder, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="px-4 py-2">{entryOrder.entry_order_no}</td>
              <td className="px-4 py-2">{entryOrder.origin?.name}</td>
              <td className="px-4 py-2">{entryOrder.supplier?.name}</td>
              <td className="px-4 py-2">{entryOrder.documentType?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntryRecordsTable;

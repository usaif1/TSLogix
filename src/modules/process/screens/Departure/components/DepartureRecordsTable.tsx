// dependencies
import React from "react";

// store
import { ProcessesStore } from "@/globalStore";

const EntryRecordsTable: React.FC = () => {
  const departureOrders = ProcessesStore.use.departureOrders();

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="px-4 py-2 text-left">Departure Order No</th>
            <th className="px-4 py-2 text-left">Document Type</th>
          </tr>
        </thead>
        <tbody>
          {departureOrders.map((departureOrder, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="px-4 py-2">{departureOrder.departure_order_no}</td>
              <td className="px-4 py-2">{departureOrder.documentType?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntryRecordsTable;

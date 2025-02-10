"use client";

import { GlobalBanner, WarehouseCoordinator, Navbar } from "@/components";
import Link from "next/link";

export default function Entry() {
  return (
    <>
      <GlobalBanner />
      <WarehouseCoordinator />
      <Navbar />

      <div className="w-full bg-gray-100 border border-gray-300 rounded-md">
        <div className="w-full flex items-center justify-between border-b p-4 pb-2">
          <p className="text-lg font-bold text-blue-900">Entry Order</p>
          <p className="text-lg font-bold text-black mr-40">F.ALM-16.4</p>
        </div>
        <div className="border-b p-4 pb-2">
          <form>
            <div className="grid grid-cols-5 gap-x-6">
              {/* Year */}
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium">Year:</label>
                <input
                  type="text"
                  value="2025"
                  onChange={() => {}}
                  className="p-1 border border-gray-300 rounded w-20 text-center"
                />
              </div>

              {/* Document Type */}
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium">Document Type:</label>
                <select className="w-40 p-1 border border-gray-300 rounded">
                  <option>All</option>
                </select>
              </div>

              {/* Document Number */}
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium">Document Number:</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-32 text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-x-6 items-center col-span-2 justify-end">
                <button className="px-4 py-0.5 text-xs bg-blue-900 hover:bg-blue-600 text-white rounded">
                  Process
                </button>
                <button className="px-4 py-0.5 text-xs bg-blue-900 hover:bg-blue-600 text-white rounded">
                  Generate Order
                </button>
                <Link
                  href={"/processes/entry/new"}
                  className="px-4 py-0.5 text-xs bg-blue-900 hover:bg-blue-600 text-white rounded"
                >
                  Generate Bulk Order
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
    // <div className="bg-white p-6 rounded-lg shadow-md">
    //   <h1 className="text-xl font-bold mb-6">Entry Order</h1>

    //   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    //     {/* Year */}
    //     <div className="flex items-center gap-2">
    //       <label className="text-sm font-medium">Year:</label>
    //       <input
    //         type="text"
    //         value="2025"
    //         className="p-1 border border-gray-300 rounded w-20 text-center"
    //       />
    //     </div>

    //     {/* Document Type */}
    // <div className="flex items-center gap-2">
    //   <label className="text-sm font-medium">Document Type:</label>
    //   <select className="p-1 border border-gray-300 rounded">
    //     <option>All</option>
    //   </select>
    // </div>

    //     {/* Document Number */}
    //     <div className="flex items-center gap-2">
    //   <label className="text-sm font-medium">Document Number:</label>
    //   <input
    //     type="text"
    //     value="F.A.M-16.4"
    //     className="p-1 border border-gray-300 rounded w-32"
    //   />
    //     </div>
    //   </div>

    //   {/* Action Buttons */}
    //   <div className="flex flex-wrap gap-3 justify-end">
    // <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
    //   Process
    // </button>
    // <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
    //   Generate Order
    // </button>
    // <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm">
    //   Generate Bulk Order
    // </button>
    //   </div>
    // </div>
  );
}

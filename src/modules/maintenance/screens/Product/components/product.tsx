/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import { Divider } from "@/components";
import DataTable from "@/components/DataTable";
import { createTableColumns } from "@/utils/tableUtils";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface ProductRegisterProps {
  productLineOptions: any[];
  groupOptions: any[];
  products: any[];
  selectedProductLine: any;
  setSelectedProductLine: (option: any) => void;
  selectedGroup: any;
  setSelectedGroup: (option: any) => void;
  searchText: string;
  setSearchText: (text: string) => void;
}

const ProductRegisterComponent: React.FC<ProductRegisterProps> = ({
  productLineOptions,
  groupOptions,
  products,
  selectedProductLine,
  setSelectedProductLine,
  selectedGroup,
  setSelectedGroup,
  searchText,
  setSearchText,
}) => {
  const columns = useMemo(
    () =>
      createTableColumns([
        { accessor: "name", header: "Product Name" },
        { accessor: "manufacturer", header: "Manufacturer" },
        {
          accessor: "product_line.name",
          header: "Product Line",
          cell: (info) => info.getValue() || "N/A",
        },
        {
          accessor: "group.name",
          header: "Group",
          cell: (info) => info.getValue() || "N/A",
        },
        { accessor: "humidity", header: "Humidity" },
        {
          accessor: "min_temperature",
          header: "Min Temp",
          cell: (info) => {
            const value = info.getValue();
            return value !== undefined && value !== null ? `${value}°C` : "N/A";
          },
        },
        {
          accessor: "max_temperature",
          header: "Max Temp",
          cell: (info) => {
            const value = info.getValue();
            return value !== undefined && value !== null ? `${value}°C` : "N/A";
          },
        },
      ]),
    []
  );

  return (
    <div>
      {/* Filter section */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="product_line">Product Line</label>
          <Select
            inputId="product_line"
            name="product_line"
            options={productLineOptions}
            styles={reactSelectStyle}
            onChange={(option) => setSelectedProductLine(option)}
            placeholder="Select Product Line"
            value={selectedProductLine}
            isClearable
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="group">Group</label>
          <Select
            inputId="group"
            name="group"
            options={groupOptions}
            styles={reactSelectStyle}
            onChange={(option) => setSelectedGroup(option)}
            placeholder="Select Group"
            value={selectedGroup}
            isClearable
          />
        </div>
      </div>

      <Divider />

      {/* Search field for product name or id */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-1/2 flex flex-col">
          <label htmlFor="searchText">Product Name or ID</label>
          <input
            type="text"
            id="searchText"
            name="searchText"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            placeholder="Search by product name or id"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full overflow-x-auto">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Container with fixed maximum height */}
        <div className="mt-2 min-w-[800px] max-h-100 overflow-y-auto">
          <DataTable
            data={products}
            columns={columns}
            showPagination={true}
            pageSize={10}
            emptyMessage="No products found. Try adjusting your filters."
          />
        </div>
      </div>
    </div>
  );
};

export default ProductRegisterComponent;

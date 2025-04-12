import React, { useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { Plus } from "@phosphor-icons/react";
import { Link } from "react-router";

// services
import { ProcessService } from "@/globalService";

// components
import { Divider, Text, Searchbar } from "@/components";
import { DepartureRecordsTable } from "./components";

const Entry: React.FC = () => {
  useEffect(() => {
    ProcessService.fetchAllDepartureOrders();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      ProcessService.fetchAllDepartureOrders(searchValue);
    }, 800),
    []
  );

  const handleSearch = (searchValue: string) => {
    debouncedSearch(searchValue);
  };

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Departure Order
      </Text>
      <Divider />
      <div className="w-1/2">
        <Searchbar
          iconHidden={true}
          searchButton={true}
          placeholder="Enter Order Number"
          onSearch={handleSearch}
        />
      </div>
      <Divider />
      <Link
        to={"/processes/departure/approved"}
        className="!w-56 bg-action-nav hover:bg-[#0F2F47] text-white px-2 py-2 rounded-md font-bold flex justify-center cursor-pointer "
      >
        <div className="flex items-center gap-x-2">
          <Text color="text-white">Generate Order</Text>
          <Plus className="text-white" weight="bold" size={16} />
        </div>
      </Link>
      <Divider />
      <div className="h-4/5 bg-white rounded-md px-2 py-1.5">
        <DepartureRecordsTable />
      </div>
    </div>
  );
};

export default Entry;

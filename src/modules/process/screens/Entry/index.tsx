import React, { useMemo, useEffect, useCallback } from "react";
import { Plus } from "@phosphor-icons/react";
import debounce from "lodash.debounce";

// components
import { OrderBtnGroup } from "../../components";
import { Divider, Text, Searchbar, LoaderSync } from "@/components";
import { EntryRecordsTable } from "./components";

// services
import { ProcessService } from "@/globalService";

// store
import { ProcessesStore } from "@/globalStore";

const Entry: React.FC = () => {
  const { loaders } = ProcessesStore();

  const buttonGroup = useMemo(
    () => [
      {
        title: "Generate Order",
        icon: Plus,
        route: "/processes/entry/new",
      },
    ],
    []
  );

  // Debounced search function
  const handleSearch = useCallback(
    debounce((searchValue: string) => {
      ProcessService.fetchAllEntryOrders(searchValue);
    }, 800),
    []
  );

  useEffect(() => {
    ProcessService.fetchAllEntryOrders();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Entry Order
      </Text>
      <Divider />
      <div className="w-1/2">
        <Searchbar
          searchButton={true}
          iconHidden={true}
          placeholder="Enter Order Number"
          onSearch={handleSearch}
        />
      </div>
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
      <Divider />
      <div className="sm:h-3/5 2xl:h-full rounded-md py-1.5 overflow-scroll max-w-[85%]">
        {loaders["processes/fetch-entry-orders"] ? (
          <>
            <Divider height="md" />
            <LoaderSync loaderText="Fetching Entry Orders. Please Wait" />
          </>
        ) : (
          <EntryRecordsTable />
        )}
      </div>
    </div>
  );
};

export default Entry;

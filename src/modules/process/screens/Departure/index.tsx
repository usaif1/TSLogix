import React, { useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { Plus } from "@phosphor-icons/react";

// services
import { ProcessService } from "@/globalService";

// components
import { Divider, Text, Searchbar, Button } from "@/components";
import { DepartureOptions, DepartureRecordsTable } from "./components";

// store
import { GlobalStore } from "@/globalStore";

const Entry: React.FC = () => {
  useEffect(() => {
    ProcessService.fetchAllDepartureOrders();
  }, []);

  const openModal = GlobalStore.use.openModal();

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

  const onClick = () => {
    GlobalStore.setState((prevState) => ({
      ...prevState,
      ModalComponent: DepartureOptions,
    }));
    openModal();
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
      <Button variant="action" additionalClass="!w-56" onClick={onClick}>
        <div className="flex items-center gap-x-2">
          <Text color="text-white">Generate Order</Text>
          <Plus className="text-white" weight="bold" size={16} />
        </div>
      </Button>
      <Divider />
      <div className="h-4/5 bg-white rounded-md px-2 py-1.5">
        <DepartureRecordsTable />
      </div>
    </div>
  );
};

export default Entry;

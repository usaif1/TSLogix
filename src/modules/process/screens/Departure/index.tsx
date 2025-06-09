import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "@phosphor-icons/react";

import { Text, Divider } from "@/components";
import Searchbar from "@/components/Searchbar";
import DepartureRecordsTable from "./components/DepartureRecordsTable";
import { ProcessService } from "@/modules/process/api/process.service";
import { useDebounce } from "@/hooks/useDebounce";

const Departure: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debounce the search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Single effect that handles both initial load and search
  useEffect(() => {
    ProcessService.fetchAllDepartureOrders(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('departure_orders')}
      </Text>

      <div className="w-1/2">
        <Searchbar
          iconHidden={true}
          searchButton={true}
          placeholder={t('search_order_placeholder')}
          onSearch={handleSearch}
        />
      </div>
      <Divider />
      <Link
        to={"/processes/departure/approved"}
        className="!w-56 bg-action-nav hover:bg-[#0F2F47] text-white px-2 py-2 rounded-md font-bold flex justify-center cursor-pointer "
      >
        <div className="flex items-center gap-x-2">
          <Text color="text-white">{t('generate_order')}</Text>
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

export default Departure;

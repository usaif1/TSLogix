import React, { useMemo, useEffect, useCallback, useState } from "react";
import { Plus, FileArrowUp } from "@phosphor-icons/react";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";

// components
import { OrderBtnGroup } from "../../components";
import { Divider, Text, Searchbar, LoaderSync } from "@/components";
import { Pagination } from "@/components/Pagination";
import { EntryRecordsTable } from "./components";

// services
import { ProcessService } from "@/globalService";

// store
import { ProcessesStore } from "@/globalStore";

const Entry: React.FC = () => {
  const { t } = useTranslation(["process", "common"]);
  const { loaders } = ProcessesStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState<any>(null);
  const [searchValue, setSearchValue] = useState("");

  const buttonGroup = useMemo(
    () => [
      {
        title: t("process:generate_order"),
        icon: Plus,
        route: "/processes/entry/new",
      },
      {
        title: t("process:bulk_upload_orders"),
        icon: FileArrowUp,
        route: "/processes/entry/bulk",
      },
    ],
    [t]
  );

  // Function to fetch orders with pagination
  const fetchOrders = useCallback(async (page: number, limit: number, search?: string) => {
    const result = await ProcessService.fetchEntryOrders({
      orderNo: search || undefined,
      page,
      limit
    });
    if (result?.pagination) {
      setPagination(result.pagination);
    }
  }, []);

  // Debounced search function
  const handleSearch = useCallback(
    debounce((searchVal: string) => {
      setSearchValue(searchVal);
      setCurrentPage(1); // Reset to first page on search
      fetchOrders(1, itemsPerPage, searchVal);
    }, 800),
    [itemsPerPage, fetchOrders]
  );

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchOrders(page, itemsPerPage, searchValue);
  }, [itemsPerPage, searchValue, fetchOrders]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page
    fetchOrders(1, limit, searchValue);
  }, [searchValue, fetchOrders]);

  useEffect(() => {
    fetchOrders(currentPage, itemsPerPage);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t("process:entry_orders")}
      </Text>
      <Divider />
      <div className="w-full max-w-md">
        <Searchbar
          searchButton={true}
          iconHidden={true}
          placeholder={t("process:enter_order_number")}
          onSearch={handleSearch}
        />
      </div>
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
      <Divider />
      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col">
        {loaders["processes/fetch-entry-orders"] ? (
          <div className="flex justify-center items-center h-full">
            <LoaderSync loaderText={t("process:fetching_entry_orders")} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              <EntryRecordsTable />
            </div>
            {pagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.total_pages}
                totalItems={pagination.total_items}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Entry;
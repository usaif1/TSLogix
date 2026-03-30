import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "@phosphor-icons/react";

import { Text, Divider } from "@/components";
import Searchbar from "@/components/Searchbar";
import { Pagination } from "@/components/Pagination";
import DepartureRecordsTable from "./components/DepartureRecordsTable";
import LoaderSync from "@/components/Loaders/LoaderSync";
import { ProcessService } from "@/modules/process/api/process.service";
import { useDebounce } from "@/hooks/useDebounce";

const Departure: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState<any>(null);

  // Get user role from localStorage
  const userRole = localStorage.getItem("role");

  // Debounce the search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Function to fetch departure orders with pagination
  const fetchDepartureOrders = useCallback(async (page: number, limit: number, searchTerm?: string) => {
    setIsLoading(true);
    try {
      const organisationId = localStorage.getItem("organisation_id");
      const result = await ProcessService.fetchComprehensiveDepartureOrders({
        organisationId: organisationId || undefined,
        orderNo: searchTerm || undefined,
        page,
        limit
      });

      if (result?.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch departure orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for initial load and search changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
    fetchDepartureOrders(1, itemsPerPage, debouncedSearchQuery || undefined);
  }, [debouncedSearchQuery, itemsPerPage, fetchDepartureOrders]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchDepartureOrders(page, itemsPerPage, debouncedSearchQuery || undefined);
  }, [itemsPerPage, debouncedSearchQuery, fetchDepartureOrders]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page
    fetchDepartureOrders(1, limit, debouncedSearchQuery || undefined);
  }, [debouncedSearchQuery, fetchDepartureOrders]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <Text size="3xl" weight="font-bold">
          {t('departure_orders')}
        </Text>
      </div>

      <div className="w-1/2">
        <Searchbar
          iconHidden={true}
          searchButton={true}
          placeholder={t('search_order_placeholder')}
          onSearch={handleSearch}
        />
      </div>
      <Divider />
      <div className="flex gap-4">
        <Link
          to={"/processes/departure/create"}
          className="!w-56 bg-action-nav hover:bg-[#0F2F47] text-white px-2 py-2 rounded-md font-bold flex justify-center cursor-pointer "
        >
          <div className="flex items-center gap-x-2">
            <Text color="text-white">{t('generate_fifo_order')}</Text>
            <Plus className="text-white" weight="bold" size={16} />
          </div>
        </Link>
        
        {/* Only show warehouse dispatch button for non-client users */}
        {userRole && userRole !== "CLIENT" && (
          <Link
            to={"/processes/departure/warehouse-dispatch"}
            className="!w-80 bg-action-nav hover:bg-[#0F2F47] text-white px-2 py-2 rounded-md font-bold flex justify-center cursor-pointer "
          >
            <div className="flex items-center gap-x-2">
              <Text color="text-white">{t('warehouse_dispatch_center')}</Text>
              <Plus className="text-white" weight="bold" size={16} />
            </div>
          </Link>
        )}

        {/* Bulk Upload Departure Orders Button */}
        <Link
          to={"/processes/departure/bulk-upload"}
          className="!w-64 bg-action-nav hover:bg-[#0F2F47] text-white px-2 py-2 rounded-md font-bold flex justify-center cursor-pointer "
        >
          <div className="flex items-center gap-x-2">
            <Text color="text-white">{t('bulk_upload_departure_orders')}</Text>
            <Plus className="text-white" weight="bold" size={16} />
          </div>
        </Link>
      </div>
      <Divider />
      <div className="flex-1 flex flex-col bg-white rounded-md px-2 py-1.5 relative min-h-0">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md">
            <LoaderSync loaderText={t('common:loading_orders')} size="lg" />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <DepartureRecordsTable
            isLoading={isLoading}
            totalOrders={pagination?.total_items || 0}
          />
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
      </div>
    </div>
  );
};

export default Departure;

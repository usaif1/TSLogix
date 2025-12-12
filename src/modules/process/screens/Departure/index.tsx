import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "@phosphor-icons/react";

import { Text, Divider } from "@/components";
import Searchbar from "@/components/Searchbar";
import DepartureRecordsTable from "./components/DepartureRecordsTable";
import LoaderSync from "@/components/Loaders/LoaderSync";
import { ProcessService } from "@/modules/process/api/process.service";
import { useDebounce } from "@/hooks/useDebounce";

// Pagination state interface
interface PaginationState {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const PAGE_SIZE = 10; // Items per page

const Departure: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Get user role from localStorage
  const userRole = localStorage.getItem("role");

  // Debounce the search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Function to fetch departure orders with pagination
  const fetchDepartureOrders = useCallback(async (page: number, searchTerm?: string) => {
    setIsLoading(true);
    try {
      const organisationId = localStorage.getItem("organisation_id");
      const result = await ProcessService.fetchComprehensiveDepartureOrders({
        organisationId: organisationId || undefined,
        orderNo: searchTerm || undefined,
        page,
        limit: PAGE_SIZE,
      });

      setPagination({
        currentPage: result.pagination.current_page,
        totalItems: result.pagination.total_items,
        totalPages: result.pagination.total_pages,
        hasNextPage: result.pagination.has_next_page,
        hasPreviousPage: result.pagination.has_previous_page,
      });
    } catch (error) {
      console.error("Failed to fetch departure orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for initial load and search changes - reset to page 1
  useEffect(() => {
    fetchDepartureOrders(1, debouncedSearchQuery || undefined);
  }, [debouncedSearchQuery, fetchDepartureOrders]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    fetchDepartureOrders(newPage, debouncedSearchQuery || undefined);
  }, [debouncedSearchQuery, fetchDepartureOrders]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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
            <Text color="text-white">Bulk Upload Orders</Text>
            <Plus className="text-white" weight="bold" size={16} />
          </div>
        </Link>
      </div>
      <Divider />
      <div className="h-4/5 bg-white rounded-md px-2 py-1.5 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-md">
            <LoaderSync loaderText={t('common:loading_orders')} size="lg" />
          </div>
        )}
        <DepartureRecordsTable
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
};

export default Departure;

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Select, { SingleValue } from "react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "@phosphor-icons/react";

// Components
import { Button, Text, TextInput } from "@/components";

// Services and Store
import { ClientService } from "@/modules/client/api/client.service";
import { ClientStore, Client } from "@/modules/client/store";

interface OptionType {
  value: string;
  label: string;
}

const ClientList: React.FC = () => {
  const { t } = useTranslation(['client', 'common']);
  const navigate = useNavigate();
  
  // Hardcoded client type options (no need for API call)
  const clientTypeOptions = [
    { value: "JURIDICO", label: t('client:types.commercial') },
    { value: "NATURAL", label: t('client:types.individual') },
  ];
  
  // Store state
  const clients = ClientStore.use.clients();
  const filters = ClientStore.use.filters();
  const pagination = ClientStore.use.pagination();
  const isLoading = ClientStore.use.loaders()['clients/fetch-clients'];
  const { setFilters, resetFilters } = ClientStore.getState();

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load initial clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch clients based on current filters
  const fetchClients = async () => {
    try {
      const filterParams = {
        client_type: filters.client_type?.value,
        search: filters.search || undefined,
        page: filters.page,
        limit: filters.limit,
      };

      await ClientService.fetchClients(filterParams);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients");
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounced search
    setTimeout(() => {
      setFilters({ search: value, page: 1 });
    }, 500);
  };

  // Handle client type filter change
  const handleClientTypeChange = (selectedOption: SingleValue<OptionType>) => {
    setFilters({ 
      client_type: selectedOption,
      page: 1 
    });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    resetFilters();
  };

  // Refresh clients when filters change
  useEffect(() => {
    fetchClients();
  }, [filters.client_type, filters.search, filters.page]);

  const getClientDisplayName = (client: Client): string => {
    if (client.client_type === "JURIDICO") {
      return client.company_name || "Unknown Company";
    } else {
      return `${client.first_names || ""} ${client.last_name || ""}`.trim() || "Unknown Individual";
    }
  };
  const getClientTypeDisplay = (clientType: string): string => {
    return clientType === "JURIDICO" ? t('client:types.commercial') : t('client:types.individual');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/maintenance/client/${clientId}`);
  };

  // PDF Download functionality
  const handleDownloadPDF = async () => {
    if (clients.length === 0) {
      toast.error(t('client:list.no_data_to_export'));
      return;
    }

    setIsDownloading(true);
    
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(t('client:list.client_list_title'), 14, 22);
      
      // Add generation date
      doc.setFontSize(10);
      const currentDate = new Date().toLocaleDateString();
      doc.text(`${t('client:list.generated_on')}: ${currentDate}`, 14, 32);
      
      // Prepare table data
      const tableColumns = [
        t('client:table.code'),
        t('client:table.name'),
        t('client:table.type'),
        'RUC/DNI',
        t('client:table.email'),
        t('client:table.phone'),
        t('client:table.created_at')
      ];
      
      const tableRows = clients.map(client => [
        client.client_code || 'N/A',
        getClientDisplayName(client),
        getClientTypeDisplay(client.client_type),
        client.client_type === "JURIDICO" ? (client.ruc || 'N/A') : (client.individual_id || 'N/A'),
        client.email || 'N/A',
        client.phone || 'N/A',
        client.created_at ? formatDate(client.created_at) : 'N/A'
      ]);
      
      // Add table
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 40,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue header
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // Light gray for alternate rows
        },
        margin: { top: 40, right: 14, bottom: 20, left: 14 }
      });
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `${t('client:list.page')} ${i} ${t('client:list.of')} ${pageCount} - ${t('client:list.total_clients')}: ${clients.length}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `clients_list_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      toast.success(t('client:messages.pdf_downloaded_successfully'));
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(t('client:messages.pdf_download_failed'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-240px)] flex flex-col">
      {/* Filters - Compact */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('client:filters.search')}
            </label>
            <TextInput
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t('client:filters.search_placeholder')}
            />
          </div>

          {/* Client Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('client:filters.client_type')}
            </label>
            <Select
              value={filters.client_type}
              onChange={handleClientTypeChange}
              options={clientTypeOptions}
              placeholder={t('client:filters.all_types')}
              isClearable
            />
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <Button
              variant="action"
              onClick={handleClearFilters}
              additionalClass="flex-1 h-[38px]"
            >
              {t('client:filters.clear')}
            </Button>
            <Button
              variant="primary"
              onClick={handleDownloadPDF}
              disabled={isDownloading || clients.length === 0}
              additionalClass="flex items-center gap-2 h-[38px] px-4"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('client:buttons.downloading')}</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>{t('client:buttons.download_pdf')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Client List - Scrollable */}
      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        {/* Results Summary */}
        <div className="px-4 py-2 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {pagination ? (
                <>
                  {t('client:list.showing')} {((pagination.currentPage - 1) * filters.limit) + 1}-
                  {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} {t('client:list.of')} {pagination.totalCount} {t('client:list.results')}
                </>
              ) : (
                `${clients.length} ${t('client:list.results')}`
              )}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <Text additionalClass="mt-4">{t('common:loading')}</Text>
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <Text additionalClass="text-gray-500 mb-2">{t('client:list.no_clients')}</Text>
              <Text additionalClass="text-sm text-gray-400">{t('client:list.no_clients_description')}</Text>
            </div>
          </div>
        ) : (
          <>
            {/* Table - Scrollable */}
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('client:table.code')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('client:table.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('client:table.type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('client:table.contact')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('client:table.cells')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('client:table.created')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('client:table.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr 
                      key={client.client_id} 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => handleClientClick(client.client_id)}
                    >
                      {/* Client Code */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex px-3 py-1 text-sm font-mono font-medium bg-gray-100 text-gray-800 rounded-md">
                            {client.client_code || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <Text weight="font-medium" additionalClass="text-gray-900">
                            {getClientDisplayName(client)}
                          </Text>
                          {client.client_type === "JURIDICO" && client.ruc && (
                            <Text additionalClass="text-sm text-gray-500">
                              RUC: {client.ruc}
                            </Text>
                          )}
                          {client.client_type === "NATURAL" && client.individual_id && (
                            <Text additionalClass="text-sm text-gray-500">
                              {t('client:fields.individual_id')}: {client.individual_id}
                            </Text>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          client.client_type === "JURIDICO" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {getClientTypeDisplay(client.client_type)}
                        </span>
                        {client.client_type === "JURIDICO" && client.establishment_type && (
                          <div className="text-xs text-gray-500 mt-1">
                            {client.establishment_type}
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <Text additionalClass="text-sm text-gray-900">{client.email}</Text>
                          <Text additionalClass="text-sm text-gray-500">{client.phone}</Text>
                          {client.client_users && client.client_users.length > 0 && (
                            <Text additionalClass="text-xs text-blue-600">
                              {client.client_users.length} {client.client_users.length === 1 ? t('client:table.user') : t('client:table.users')}
                            </Text>
                          )}
                        </div>
                      </td>

                      {/* Cells */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Text additionalClass="text-sm font-medium text-gray-900">
                            {client._count?.cellAssignments || 0}
                          </Text>
                          <Text additionalClass="text-sm text-gray-500 ml-1">
                            {t('client:table.cells_assigned')}
                          </Text>
                        </div>
                      </td>


                      {/* Created */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Text additionalClass="text-sm text-gray-900">
                          {formatDate(client.created_at)}
                        </Text>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {client.active_state?.name || t('client:status.active')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Fixed at bottom */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
                <div className="flex items-center">
                  <Text additionalClass="text-sm text-gray-700">
                    {t('client:list.page')} {pagination.currentPage} {t('client:list.of')} {pagination.totalPages}
                  </Text>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="action"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    additionalClass="text-sm px-3 py-1"
                  >
                    {t('client:list.previous')}
                  </Button>
                  <Button
                    variant="action"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    additionalClass="text-sm px-3 py-1"
                  >
                    {t('client:list.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientList; 
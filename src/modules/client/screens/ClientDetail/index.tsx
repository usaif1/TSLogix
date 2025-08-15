import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Components
import { Button, Text, LoaderSync } from "@/components";
import { ClientService } from "@/modules/client/api/client.service";
import { ClientStore, Client } from "@/modules/client/store";
import { ClientPasswordChangeModal } from "@/modules/client/components";
import ClientEditModal from "./components/ClientEditModal";

const ClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['client', 'common']);

  // Store state
  const currentClient = ClientStore.use.currentClient();
  const isLoading = ClientStore.use.loaders()['clients/fetch-client'];

  // Local state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Load client data on mount
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      if (!clientId) return;
      await ClientService.fetchClientById(clientId);
    } catch (error) {
      console.error("Error fetching client:", error);
      toast.error("Failed to fetch client details");
      navigate("/maintenance/client");
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    if (clientId) {
      fetchClientData(); // Refresh client data
    }
    toast.success("Client updated successfully");
  };

  const getClientDisplayName = (client: Client): string => {
    if (client.client_type === "JURIDICO") {
      return client.company_name || "Unknown Company";
    } else {
      return `${client.first_names || ""} ${client.last_name || ""}`.trim() || "Unknown Individual";
    }
  };

  const getTranslatedClientType = (clientType: string): string => {
    if (!clientType) return '';
    return t(`client:types.${clientType.toLowerCase()}`, clientType);
  };


  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderSync loaderText={t('common:loading')} />
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Text additionalClass="text-gray-500 mb-2">{t('client:detail.client_not_found')}</Text>
          <Button onClick={() => navigate("/maintenance/client")}>
            {t('client:detail.back_to_list')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="action"
            onClick={() => navigate("/maintenance/client")}
          >
            ← {t('client:detail.back_to_list')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getClientDisplayName(currentClient)}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('client:detail.client_details')}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {/* Show password change button only for CLIENT role */}
          {localStorage.getItem("role") === "CLIENT" && (
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              {t('client:buttons.change_password')}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => setShowEditModal(true)}
          >
            {t('client:buttons.edit_client')}
          </Button>
        </div>
      </div>

      {/* Client Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('client:detail.basic_information')}
          </h2>
          <div className="space-y-3">
            {/* Client Code */}
            <div>
              <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.client_code')}</Text>
              <div className="mt-1">
                <span className="inline-flex px-3 py-1 text-sm font-mono font-medium bg-gray-100 text-gray-800 rounded-md">
                  {currentClient.client_code || 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.client_type')}</Text>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  currentClient.client_type === "JURIDICO" 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {getTranslatedClientType(currentClient.client_type)}
                </span>
              </div>
            </div>

            {currentClient.client_type === "JURIDICO" ? (
              <>
                <div>
                  <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.company_name')}</Text>
                  <Text additionalClass="mt-1">{currentClient.company_name}</Text>
                </div>
                <div>
                  <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.ruc')}</Text>
                  <Text additionalClass="mt-1">{currentClient.ruc}</Text>
                </div>
                <div>
                  <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.establishment_type')}</Text>
                  <Text additionalClass="mt-1">{currentClient.establishment_type}</Text>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.full_name')}</Text>
                  <Text additionalClass="mt-1">
                    {`${currentClient.first_names || ""} ${currentClient.last_name || ""} ${currentClient.mothers_last_name || ""}`.trim()}
                  </Text>
                </div>
                <div>
                  <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.individual_id')}</Text>
                  <Text additionalClass="mt-1">{currentClient.individual_id}</Text>
                </div>
                {currentClient.date_of_birth && (
                  <div>
                    <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.date_of_birth')}</Text>
                    <Text additionalClass="mt-1">{formatDate(currentClient.date_of_birth)}</Text>
                  </div>
                )}
              </>
            )}

            <div>
              <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.created_at')}</Text>
              <Text additionalClass="mt-1">{formatDate(currentClient.created_at)}</Text>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('client:detail.contact_information')}
          </h2>
          <div className="space-y-3">
            <div>
              <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.email')}</Text>
              <Text additionalClass="mt-1">{currentClient.email}</Text>
            </div>
            <div>
              <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.phone')}</Text>
              <Text additionalClass="mt-1">{currentClient.phone}</Text>
            </div>
            {currentClient.cell_phone && (
              <div>
                <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.cell_phone')}</Text>
                <Text additionalClass="mt-1">{currentClient.cell_phone}</Text>
              </div>
            )}
            <div>
              <Text additionalClass="text-sm font-medium text-gray-500">{t('client:fields.address')}</Text>
              <Text additionalClass="mt-1">{currentClient.address}</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Cell Assignments */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('client:detail.cell_assignments')} ({currentClient._count?.cellAssignments || 0})
        </h2>
        {currentClient.cellAssignments && currentClient.cellAssignments.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {currentClient.cellAssignments.map((assignment) => (
              <div key={assignment.assignment_id} className="border rounded-lg p-3">
                <div className="flex flex-col items-center text-center">
                  <Text weight="font-medium" additionalClass="text-sm mb-1">
                    {assignment.cell.row}.{String(assignment.cell.bay).padStart(2, '0')}.{String(assignment.cell.position).padStart(2, '0')}
                  </Text>
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full mb-1 ${
                    assignment.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {assignment.is_active ? t('client:status.active') : t('client:status.inactive')}
                  </span>
                  <Text additionalClass="text-xs text-gray-600 mb-1">
                    {assignment.warehouse.name}
                  </Text>
                  <Text additionalClass="text-xs text-gray-500">
                    {formatDate(assignment.assigned_at)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Text additionalClass="text-gray-500">{t('client:detail.no_cell_assignments')}</Text>
          </div>
        )}
      </div>


      {/* Edit Modal */}
      {showEditModal && (
        <ClientEditModal
          client={currentClient}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Password Change Modal */}
      <ClientPasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setShowPasswordModal(false);
          toast.success(t('client:messages.password_changed_successfully'));
        }}
      />
    </div>
  );
};

export default ClientDetail;
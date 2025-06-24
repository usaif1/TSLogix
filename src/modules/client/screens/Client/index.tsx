import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

// Components
import { Button } from "@/components";
import { ClientList } from "@/modules/client/components";

const Client: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['client', 'common']);

  const handleCreateClient = () => {
    navigate("/maintenance/client/new");
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('client:navigation.clients')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('client:screens.main_description')}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={handleCreateClient}
          >
            {t('client:buttons.new_client')}
          </Button>
        </div>
      </div>

      {/* Client List */}
      <ClientList />
    </div>
  );
};

export default Client; 
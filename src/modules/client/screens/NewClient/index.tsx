import React from "react";
import { useTranslation } from "react-i18next";

// Components
import { ClientForm } from "@/modules/client/components";

const NewClient: React.FC = () => {
  const { t } = useTranslation(['client', 'common']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('client:navigation.new_client')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('client:screens.new_client_description')}
          </p>
        </div>
      </div>

      {/* Client Form */}
      <ClientForm />
    </div>
  );
};

export default NewClient; 
// dependencies
import React from "react";
import { useTranslation } from "react-i18next";

// components
import Text from "../Text";

const WarehouseCoordinator: React.FC = () => {
  const { t } = useTranslation(['components', 'common']);
  
  return (
    <div className="py-1 pl-1">
      <Text size="xs" weight="font-bold">
        {t('warehouse_coordinator')} &nbsp; &nbsp;: <span>Saif Ullah</span>
      </Text>
    </div>
  );
};

export default WarehouseCoordinator;

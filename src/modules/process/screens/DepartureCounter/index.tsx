// dependencies
import React from "react";
import { useTranslation } from "react-i18next";

const DepartureCounter: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  
  return <div>{t('departure_counter')}</div>;
};

export default DepartureCounter;

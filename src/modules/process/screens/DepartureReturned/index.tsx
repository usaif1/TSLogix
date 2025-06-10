// dependencies
import React from "react";
import { useTranslation } from "react-i18next";

const DepartureReturned: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  
  return <div>{t('departure_returned')}</div>;
};

export default DepartureReturned;

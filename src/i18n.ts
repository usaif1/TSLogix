import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonEn from './locales/en/common.json';
import commonEs from './locales/es/common.json';
import homeEn from './locales/en/home.json';
import homeEs from './locales/es/home.json';
import warehouseEn from './locales/en/warehouse.json';
import warehouseEs from './locales/es/warehouse.json';
import inventoryEn from './locales/en/inventory.json';
import inventoryEs from './locales/es/inventory.json';
import processEn from './locales/en/process.json';
import processEs from './locales/es/process.json';
import maintenanceEn from './locales/en/maintenance.json';
import maintenanceEs from './locales/es/maintenance.json';
import componentsEn from './locales/en/components.json';
import componentsEs from './locales/es/components.json';
import clientEn from './locales/en/client.json';
import clientEs from './locales/es/client.json';
import eventLogsEn from './locales/en/eventLogs.json';
import eventLogsEs from './locales/es/eventLogs.json';
import reportsEn from './locales/en/reports.json';
import reportsEs from './locales/es/reports.json';

const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    warehouse: warehouseEn,
    inventory: inventoryEn,
    process: processEn,
    maintenance: maintenanceEn,
    components: componentsEn,
    client: clientEn,
    eventLogs: eventLogsEn,
    reports: reportsEn,
  },
  es: {
    common: commonEs,
    home: homeEs,
    warehouse: warehouseEs,
    inventory: inventoryEs,
    process: processEs,
    maintenance: maintenanceEs,
    components: componentsEs,
    client: clientEs,
    eventLogs: eventLogsEs,
    reports: reportsEs,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // ✅ Spanish as default
    fallbackLng: 'es', // ✅ Spanish as fallback
    debug: process.env.NODE_ENV === 'development',
    
    // Have a common namespace used around the app
    ns: ['common', 'home', 'warehouse', 'inventory', 'process', 'maintenance', 'components', 'client', 'eventLogs', 'reports'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    }
  });

export default i18n;
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations - adjust the imports if needed based on your bundler
import enCommon from './locales/en/common.json';
import enWarehouse from './locales/en/warehouse.json';
import enInventory from './locales/en/inventory.json';
import enProcess from './locales/en/process.json';
import esCommon from './locales/es/common.json';
import esWarehouse from './locales/es/warehouse.json';
import esInventory from './locales/es/inventory.json';
import esProcess from './locales/es/process.json';


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        warehouse: enWarehouse,
        inventory: enInventory,
        process: enProcess,
      },
      es: {
        common: esCommon,
        warehouse: esWarehouse,
        inventory: esInventory,
        process: esProcess,
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Have a common namespace used around the app
    ns: ['common', 'warehouse', 'inventory'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    }
  });

export default i18n;
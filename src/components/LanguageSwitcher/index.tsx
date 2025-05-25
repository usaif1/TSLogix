import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/Button';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Save preference to localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="flex space-x-2">
      <Button 
        variant={i18n.language === 'en' ? 'primary' : 'cancel'} 
        onClick={() => changeLanguage('en')}
        additionalClass="px-2 py-1 text-sm"
      >
        English
      </Button>
      <Button 
        variant={i18n.language === 'es' ? 'primary' : 'cancel'} 
        onClick={() => changeLanguage('es')}
        additionalClass="px-2 py-1 text-sm"
      >
        Español
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
import React from "react";
import { useTranslation } from "react-i18next";
import { DepartureFormData } from "@/modules/process/types";

interface Props {
  formData: DepartureFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
}

const AdditionalInformationSection: React.FC<Props> = ({
  formData,
  handleChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="dispatch_order_number">{t('process:dispatch_order_number')}</label>
        <input
          type="text"
          id="dispatch_order_number"
          name="dispatch_order_number"
          value={formData.dispatch_order_number}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          disabled={isSubmitting}
          placeholder={t('process:enter_dispatch_order_number')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="order_code">{t('process:order_code')}</label>
        <input
          type="text"
          id="order_code"
          name="order_code"
          value={formData.order_code}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          disabled={isSubmitting}
          placeholder={t('process:enter_order_code')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="presentation">{t('process:presentation')}</label>
        <input
          type="text"
          id="presentation"
          name="presentation"
          value={formData.presentation}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          disabled={isSubmitting}
          placeholder={t('process:enter_presentation')}
        />
      </div>
    </div>
  );
};

export default AdditionalInformationSection;
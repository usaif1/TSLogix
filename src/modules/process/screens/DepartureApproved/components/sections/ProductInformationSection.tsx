import React from "react";
import { useTranslation } from "react-i18next";
import { DepartureFormData } from "@/modules/process/types";

interface Props {
  formData: DepartureFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
}

const ProductInformationSection: React.FC<Props> = ({
  formData,
  handleChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="product_description">{t('process:product_description')}</label>
        <textarea
          id="product_description"
          name="product_description"
          value={formData.product_description}
          onChange={handleChange}
          className="border border-slate-400 rounded-md px-4 py-2 h-24 resize-none"
          required
          disabled={isSubmitting}
          placeholder={t('process:enter_product_description')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="palettes">{t('process:palettes')}</label>
        <input
          type="number"
          id="palettes"
          name="palettes"
          value={formData.palettes}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          min="0"
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="insured_value">{t('process:insured_value')}</label>
        <input
          type="number"
          step="0.01"
          id="insured_value"
          name="insured_value"
          value={formData.insured_value}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          min="0"
        />
      </div>
    </div>
  );
};

export default ProductInformationSection;
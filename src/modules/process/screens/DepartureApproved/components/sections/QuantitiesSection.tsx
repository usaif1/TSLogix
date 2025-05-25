import React from "react";
import { useTranslation } from "react-i18next";
import { DepartureFormData } from "@/modules/process/types";

interface Props {
  formData: DepartureFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
}

const QuantitiesSection: React.FC<Props> = ({
  formData,
  handleChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="total_qty">{t('process:total_qty')}</label>
        <input
          type="number"
          id="total_qty"
          name="total_qty"
          value={formData.total_qty}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          min="1"
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="total_weight">{t('process:total_weight')}</label>
        <input
          type="number"
          step="0.01"
          id="total_weight"
          name="total_weight"
          value={formData.total_weight}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          min="0.01"
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="total_volume">{t('process:total_volume')}</label>
        <input
          type="number"
          step="0.01"
          id="total_volume"
          name="total_volume"
          value={formData.total_volume}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          disabled={isSubmitting}
          min="0"
        />
      </div>
    </div>
  );
};

export default QuantitiesSection;
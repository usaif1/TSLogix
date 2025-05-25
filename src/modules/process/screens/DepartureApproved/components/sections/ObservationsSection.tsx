import React from "react";
import { useTranslation } from "react-i18next";
import { DepartureFormData } from "@/modules/process/types";

interface Props {
  formData: DepartureFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
}

const ObservationsSection: React.FC<Props> = ({
  formData,
  handleChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);

  return (
    <div className="w-full flex flex-col">
      <label htmlFor="observation">{t('process:observations')}</label>
      <textarea
        id="observation"
        name="observation"
        value={formData.observation}
        onChange={handleChange}
        className="border border-slate-400 rounded-md px-4 py-2 h-32 resize-none"
        disabled={isSubmitting}
        placeholder={t('process:enter_observations')}
      />
    </div>
  );
};

export default ObservationsSection;
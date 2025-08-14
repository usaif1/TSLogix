import React from "react";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import { DepartureFormData } from "@/modules/process/types";

interface Props {
  formData: DepartureFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDateChange: (date: Date | null, name: string) => void;
  isSubmitting: boolean;
}

const DispatchInformationSection: React.FC<Props> = ({
  formData,
  handleChange,
  handleDateChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="dispatch_date">{t('process:dispatch_date')}</label>
        <DatePicker
          className="w-full border border-slate-400 h-10 rounded-md pl-4"
          selected={formData.dispatch_date}
          onChange={(date) => handleDateChange(date, "dispatch_date")}
          disabled={isSubmitting}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="departure_transfer_note">{t('process:departure_transfer_note')}</label>
        <input
          type="text"
          id="departure_transfer_note"
          name="departure_transfer_note"
          value={formData.departure_transfer_note}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          disabled={isSubmitting}
          placeholder={t('process:enter_transfer_note')}
        />
      </div>

      <div className="w-full flex flex-col">
        {/* Empty div for spacing */}
      </div>
    </div>
  );
};

export default DispatchInformationSection;
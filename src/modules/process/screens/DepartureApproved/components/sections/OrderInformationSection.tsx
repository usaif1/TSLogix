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

const OrderInformationSection: React.FC<Props> = ({
  formData,
  handleChange,
  handleDateChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="departure_order_no">{t('process:departure_order_no')}</label>
        <input
          type="text"
          id="departure_order_no"
          name="departure_order_no"
          value={formData.departure_order_no}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          placeholder={t('process:enter_departure_order_no')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="departure_date">{t('process:departure_date')}</label>
        <DatePicker
          showTimeSelect
          dateFormat="Pp"
          className="w-full border border-slate-400 h-10 rounded-md pl-4"
          selected={formData.departure_date}
          onChange={(date) => handleDateChange(date, "departure_date")}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="arrival_point">{t('process:arrival_point')}</label>
        <input
          type="text"
          id="arrival_point"
          name="arrival_point"
          value={formData.arrival_point}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          placeholder={t('process:enter_arrival_point')}
        />
      </div>
    </div>
  );
};

export default OrderInformationSection;
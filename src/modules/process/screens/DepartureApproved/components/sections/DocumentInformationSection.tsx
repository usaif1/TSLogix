import React from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import { ProcessesStore } from "@/globalStore";
import { DepartureFormData } from "@/modules/process/types";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
  control: (style: CSSObjectWithLabel) => ({
    ...style,
    minHeight: "2.5rem",
  }),
};

interface Props {
  formData: DepartureFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSelectChange: (name: string, selectedOption: any) => void;
  handleDateChange: (date: Date | null, name: string) => void;
  isSubmitting: boolean;
}

const DocumentInformationSection: React.FC<Props> = ({
  formData,
  handleChange,
  handleSelectChange,
  handleDateChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);
  const { departureFormFields } = ProcessesStore();

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="document_type_id">{t('process:document_type')}</label>
        <Select
          options={departureFormFields.documentTypes}
          styles={reactSelectStyle}
          inputId="document_type_id"
          name="document_type_id"
          value={formData.document_type_id}
          onChange={(selected) =>
            handleSelectChange("document_type_id", selected)
          }
          isDisabled={isSubmitting}
          placeholder={t('process:select_document_type')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="document_number">{t('process:document_number')}</label>
        <input
          type="text"
          id="document_number"
          name="document_number"
          value={formData.document_number}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          placeholder={t('process:enter_document_number')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="document_date">{t('process:document_date')}</label>
        <DatePicker
          className="w-full border border-slate-400 h-10 rounded-md pl-4"
          selected={formData.document_date}
          onChange={(date) => handleDateChange(date, "document_date")}
          required
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default DocumentInformationSection;
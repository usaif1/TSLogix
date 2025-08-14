import React from "react";
import Select, { CSSObjectWithLabel } from "react-select";
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
  isSubmitting: boolean;
}

const PersonnelInformationSection: React.FC<Props> = ({
  formData,
  handleChange,
  handleSelectChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);
  const { departureFormFields } = ProcessesStore();

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="personnel_incharge_id">{t('process:personnel_in_charge')}</label>
        <Select
          options={departureFormFields.users}
          styles={reactSelectStyle}
          inputId="personnel_incharge_id"
          name="personnel_incharge_id"
          value={formData.personnel_incharge_id}
          onChange={(selected) =>
            handleSelectChange("personnel_incharge_id", selected)
          }
          required
          isDisabled={isSubmitting}
          placeholder={t('process:select_personnel')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="id_responsible">{t('process:id_responsible')}</label>
        <input
          type="text"
          id="id_responsible"
          name="id_responsible"
          value={formData.id_responsible}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          placeholder={t('process:enter_responsible_id')}
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="reponsible_for_collection">
          {t('process:collection_responsible')}
        </label>
        <input
          type="text"
          id="reponsible_for_collection"
          name="reponsible_for_collection"
          value={formData.reponsible_for_collection}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          required
          disabled={isSubmitting}
          placeholder={t('process:enter_collection_responsible')}
        />
      </div>
    </div>
  );
};

export default PersonnelInformationSection;
import React from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import { useTranslation } from "react-i18next";
import { ProcessesStore } from "@/globalStore";
import { DepartureFormData } from "@/modules/process/types";
import FileUpload from "@/components/FileUpload";

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
  handleSelectChange: (name: string, selectedOption: any) => void;
  isSubmitting: boolean;
  packagingListFile: File | null;
  setPackagingListFile: (file: File | null) => void;
}

const PackagingStatusSection: React.FC<Props> = ({
  formData,
  handleChange,
  handleSelectChange,
  isSubmitting,
  packagingListFile,
  setPackagingListFile
}) => {
  const { t } = useTranslation(['process']);
  const { departureFormFields } = ProcessesStore();

  const handleFileSelected = (file: File) => {
    setPackagingListFile(file);
  };

  return (
    <div className="w-full flex items-center gap-x-6">
      <div className="w-full flex flex-col">
        <label htmlFor="packaging_type">{t('process:packaging_type')}</label>
        <Select
          options={departureFormFields.packagingTypes}
          styles={reactSelectStyle}
          inputId="packaging_type"
          name="packaging_type"
          value={formData.packaging_type}
          onChange={(selected) =>
            handleSelectChange("packaging_type", selected)
          }
          isDisabled={isSubmitting}
          placeholder={t('process:select_packaging_type')}
        />
      </div>

      <div className="w-full flex flex-col">
        <FileUpload
          id="packaging_list"
          label={t('process:packaging_list')}
          onFileSelected={handleFileSelected}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
        />
      </div>

      <div className="w-full flex flex-col">
        <label htmlFor="labeled">{t('process:labeled')}</label>
        <input
          type="text"
          id="labeled"
          name="labeled"
          value={formData.labeled}
          onChange={handleChange}
          className="h-10 border border-slate-400 rounded-md px-4"
          disabled={isSubmitting}
          placeholder={t('process:enter_label')}
        />
      </div>
    </div>
  );
};

export default PackagingStatusSection;
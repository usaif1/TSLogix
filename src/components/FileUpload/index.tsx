import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components";

interface FileUploadProps {
  id: string;
  label: string;
  onFileSelected: (file: File) => void;
  accept?: string;
}

const FileUpload = ({
  id,
  label,
  onFileSelected,
  accept = ".pdf,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif",
}: FileUploadProps) => {
  const { t } = useTranslation(['common']);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <label htmlFor={id}>{label}</label>
      <div className="flex items-center gap-x-2">
        <input
          type="text"
          className="w-[60%] h-10 border border-slate-400 rounded-md px-4"
          readOnly
          value={fileName || t("common:no_file_selected")}
        />
        <input
          type="file"
          id={id}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          onClick={() => document.getElementById(id)?.click()}
        >
          {t("common:select_file")}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;

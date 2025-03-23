import { useState } from "react";
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
          value={fileName || "No file selected"}
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
          Select File
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;

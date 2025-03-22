import { useState } from "react";
import { Button } from "@/components";

interface FileUploadProps {
  label: string;
  onFileSelected: (file: File) => void;
  accept?: string;
}

const FileUpload = ({
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
      <label>{label}</label>
      <div className="flex items-center gap-x-2">
        <input
          type="text"
          className="w-[60%] h-10 border border-slate-400 rounded-md px-4"
          readOnly
          value={fileName || "No file selected"}
        />
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          Select File
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;

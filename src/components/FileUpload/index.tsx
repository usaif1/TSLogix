import { useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Button } from "@/components";

interface FileUploadProps {
  label: string;
  onUpload: (url: string) => void;
  accept?: string;
}

const FileUpload = ({
  label,
  onUpload,
  accept = "*",
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleUpload = async (file: File) => {
    debugger;
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("order")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from("order")
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
      setFileName(file.name);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
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
          onChange={(e) =>
            e.target.files?.[0] && handleUpload(e.target.files[0])
          }
          disabled={isUploading}
        />
        <Button
          type="button"
          onClick={() => document.getElementById("fileInput")?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Select File"}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
import { useMemo } from "react";

function isEmptyField(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (value instanceof Date) return isNaN(value.getTime());
  if (typeof value === "object") {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        if (isEmptyField(value[key])) return true;
      }
    }
    return false;
  }
  return false;
}

function useFormComplete(
  formData: Record<string, any>,
  excludedKeys: string[] = []
): boolean {
  return useMemo(() => {
    for (const key in formData) {
      if (excludedKeys.includes(key)) continue;
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        if (isEmptyField(formData[key])) {
          return false;
        }
      }
    }
    return true;
  }, [formData, excludedKeys]);
}

export default useFormComplete;

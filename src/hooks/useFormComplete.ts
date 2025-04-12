import { useMemo } from "react";

function isEmptyField(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (value instanceof Date) return isNaN(value.getTime());
  if (typeof value === "object" && "value" in value && "label" in value) {
    return !value.value;
  }
  if (typeof value === "object" && value !== null) {
    if (Object.keys(value).length === 0) return true;
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
    const emptyFields: string[] = [];
    for (const key in formData) {
      if (excludedKeys.includes(key)) continue;
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        if (isEmptyField(formData[key])) {
          emptyFields.push(key);
          return false;
        }
      }
    }
    if (emptyFields.length > 0) {
      console.log("Empty fields:", emptyFields);
    }
    return true;
  }, [formData, excludedKeys]);
}

export default useFormComplete;

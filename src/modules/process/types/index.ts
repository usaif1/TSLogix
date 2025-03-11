import { ReactSelectValue } from "@/types/FormTypes";

export type EntryFormData = {
  origin: ReactSelectValue;
  entry_order_no: string;
  document: ReactSelectValue;
  registration_date: Date;
  document_date: Date;
  admission_date_and_time: Date;
  personnel_in_charge: ReactSelectValue;
  document_status: ReactSelectValue;
  order_status: string;
  observation: string;
  total_volume: string;
  total_weight: string;
  cif_value: string;
  supplier: ReactSelectValue;
  product: string;
  protocol_analysis_certificate: File | null;
  manufacturing_date: Date;
  expiration_date: Date;
  lot_series: string;
  quantity_packaging: string;
  presentation: string;
  total_qty: string;
  technical_specification: File | null;
  temperature: string;
  humidity: string;
};
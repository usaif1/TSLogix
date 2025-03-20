import { ReactSelectValue } from "@/types/FormTypes";

export type EntryFormData = {
  origin: ReactSelectValue;
  palettes: string;
  product_description: string;
  insured_value: string;
  entry_date: Date;
  entry_transfer_note: string;
  entry_order_no: string;
  document_type_id: ReactSelectValue;
  registration_date: Date;
  document_date: Date;
  admission_date_time: Date;
  personnel_incharge_id: ReactSelectValue;
  document_status: ReactSelectValue;
  order_status: string;
  observation: string;
  total_volume: string;
  total_weight: string;
  cif_value: string;
  supplier: ReactSelectValue;
  product: string;
  certificate_protocol_analysis: File | string | null;
  mfd_date_time: Date;
  expiration_date: Date;
  lot_series: string;
  quantity_packaging: string;
  presentation: string;
  total_qty: string;
  technical_specification: File | string | null;
  temperature: string;
  humidity: string;
  type: string;
};

export type DepartureFormData = {
  customer: ReactSelectValue;
  departure_date: Date;
  departure_order_no: string;
  document_type_id: ReactSelectValue;
  document_number: string;
  document_date: Date;
  departure_status: ReactSelectValue;
  departure_transfer_note: string;
  personnel_incharge_id: ReactSelectValue;
  observation: string;
  total_volume: string;
  total_weight: string;
  arrival_point: string;
  packaging_type: ReactSelectValue;
  labeled: string;
  id_responsible: string;
  reponsible_for_collection: string;
  order_status: string;
  dispatch_order_number: string;
  palettes: string;
  order_code: string;
  product_description: string;
  insured_value: string;
  dispatch_date: Date;
  presentation: string;
}
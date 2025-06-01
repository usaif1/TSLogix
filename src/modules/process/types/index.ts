/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactSelectValue } from "@/types/FormTypes";

// Product data interface for multi-product entry orders
export interface ProductData {
  id: string;
  product_id: string;
  quantity_packaging: string;
  total_qty: string;
  total_weight: string;
  total_volume: string;
  palettes: string;
  presentation: string;
  product_description: string;
  insured_value: string;
  technical_specification: string;
  expiration_date: Date;
  mfd_date_time: Date;
  packaging_type: string;
  packaging_status: string;
  packaging_code: string;
}

// Updated EntryFormData for multi-product support
export interface EntryFormData {
  // Entry Order Level Data
  origin: ReactSelectValue;
  entry_order_no: string;
  document_type_id: ReactSelectValue;
  registration_date: Date;
  document_date: Date;
  admission_date_time: Date;
  entry_date: Date;
  entry_transfer_note: string;
  personnel_incharge_id: ReactSelectValue;
  document_status: ReactSelectValue;
  order_status: ReactSelectValue;
  observation: string;
  cif_value: string;
  supplier: ReactSelectValue;
  certificate_protocol_analysis: string;
  lot_series: string;
  type: string;
  
  // Products Array - Updated to use ProductData interface
  products: ProductData[];
}

// Legacy single-product fields (kept for backward compatibility if needed)
export interface LegacyEntryFormData {
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
  order_status: ReactSelectValue;
  observation: string;
  total_volume: string;
  total_weight: string;
  cif_value: string;
  supplier: ReactSelectValue;
  product: ReactSelectValue;
  certificate_protocol_analysis: File | string | null;
  mfd_date_time: Date;
  expiration_date: Date;
  lot_series: string;
  quantity_packaging: string;
  presentation: string;
  total_qty: string;
  technical_specification: File | string | null;
  max_temperature: string;
  min_temperature: string;
  humidity: string;
  type: string;
}

export interface Customer {
  customer_id: string;
  name: string;
}

// Departure form data interface
export interface DepartureFormData {
  customer: ReactSelectValue;
  warehouse: ReactSelectValue;
  product: ReactSelectValue;
  departure_date: Date;
  departure_order_no: string;
  document_type_id: ReactSelectValue;
  document_number: string;
  document_date: Date;
  departure_transfer_note: string;
  personnel_incharge_id: ReactSelectValue;
  observation: string;
  total_volume: string;
  total_weight: string;
  total_qty: string;
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
  packaging_list: string;
}

// Store interfaces for multi-product support
export interface Product {
  value: string;
  label: string;
  product_code: string;
  unit_weight: number;
  unit_volume: number;
  temperature_range: {
    range_id: string;
    range: string;
    min_celsius: number;
    max_celsius: number;
  } | null;
}

export interface TemperatureRange {
  value: string;
  label: string;
  min_celsius: number;
  max_celsius: number;
}

export interface PackagingOption {
  value: string;
  label: string;
}

export interface Warehouse {
  warehouse_id: string;
  name: string;
}

export interface DocumentType {
  document_type_id: string;
  name: string;
}

// Updated Entry Order interfaces for new flow
export interface EntryOrder {
  entry_order_id: string;
  entry_order_no: string;
  registration_date: Date;
  document_date: Date;
  entry_date_time: Date;
  order_status: "REVISION" | "PRESENTACION" | "FINALIZACION";
  review_status: "PENDING" | "APPROVED" | "REJECTED";
  review_comments?: string;
  reviewed_at?: Date;
  total_volume?: number;
  total_weight?: number;
  cif_value?: number;
  total_pallets?: number;
  observation?: string;
  uploaded_documents?: string;
  warehouse_id?: string;
  
  // Relations
  origin?: { origin_id: string; name: string; type: string };
  documentType?: { document_type_id: string; name: string; type: string };
  warehouse?: { warehouse_id: string; name: string; location: string };
  creator?: { id: string; first_name: string; last_name: string; email: string };
  reviewer?: { id: string; first_name: string; last_name: string };
  order?: {
    order_id: string;
    created_at: Date;
    status: string;
    priority: string;
    organisation: { name: string };
  };
  
  // Products with new schema
  products: EntryOrderProduct[];
  
  // Calculated totals
  creator_name?: string;
  reviewer_name?: string;
  organisation_name?: string;
  total_inventory_quantity?: number;
  total_package_quantity?: number;
  calculated_total_weight?: number;
  calculated_total_volume?: number;
  total_insured_value?: number;
  
  // Allocation status
  total_allocated_quantity?: number;
  total_allocated_weight?: number;
  allocation_percentage?: number;
  is_fully_allocated?: boolean;
  inventoryAllocations?: InventoryAllocation[];
}

export interface EntryOrderProduct {
  entry_order_product_id: string;
  serial_number: string;
  product_code: string;
  lot_series: string;
  manufacturing_date: Date;
  expiration_date: Date;
  inventory_quantity: number;
  package_quantity: number;
  quantity_pallets?: number;
  presentation: "CAJA" | "PALETA" | "SACO" | "UNIDAD" | "PAQUETE" | "TAMBOS" | "BULTO" | "OTRO";
  guide_number: string;
  weight_kg: number;
  volume_m3?: number;
  insured_value?: number;
  temperature_range: "RANGE_15_30" | "RANGE_15_25" | "RANGE_2_8" | "AMBIENTE";
  humidity?: string;
  health_registration?: string;
  
  // Product relation
  product: {
    product_id: string;
    product_code: string;
    name: string;
    manufacturer?: string;
    storage_conditions?: string;
    unit_weight?: number;
    unit_volume?: number;
    product_line?: { name: string };
    group?: { name: string };
    temperature_range?: {
      range: string;
      min_celsius: number;
      max_celsius: number;
    };
  };
  
  // Supplier relation
  supplier: {
    supplier_id: string;
    name: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    country?: { name: string };
  };
  
  // Inventory allocations for this product
  inventoryAllocations?: InventoryAllocation[];
  supplier_name?: string;
  supplier_country?: string;
}

export interface InventoryAllocation {
  allocation_id: string;
  inventory_quantity: number;
  package_quantity: number;
  quantity_pallets?: number;
  presentation: string;
  weight_kg: number;
  volume_m3?: number;
  product_status: string;
  status_code: string;
  guide_number: string;
  observations?: string;
  allocated_at: Date;
  status: string;
  
  // Cell assignment
  cell: {
    id: string;
    row: string;
    bay: number;
    position: number;
    status: string;
    capacity?: number;
    currentUsage?: number;
  };
};
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

// Entry Order interfaces
export interface EntryOrder {
  entry_order_id: string;
  entry_order_no: string;
  entry_date: Date;
  document_date: Date;
  admission_date_time: Date;
  document_status: string;
  lot_series: string;
  entry_transfer_note: string;
  status_id: string;
  entry_status?: { name: string };
  comments: string;
  type: string;
  audit_status: string;
  warehouse?: { name: string; warehouse_id: string };
  documentType?: { name: string };
  supplier?: { name: string };
  origin?: { name: string };
  order?: {
    created_at: Date;
    organisation: { name: string };
  };
  products: EntryOrderProduct[];
  total_quantity_packaging: number;
  total_weight: number;
  total_volume: number;
  total_palettes: number;
  total_insured_value: number;
  remaining_packaging_qty: number;
  remaining_weight: number;
  cellAssignments?: CellAssignment[];
}

export interface EntryOrderProduct {
  entry_order_product_id: string;
  product_id: string;
  quantity_packaging: number;
  total_qty: number;
  total_weight: number;
  total_volume: number;
  palettes: number;
  presentation: string;
  product_description: string;
  insured_value: number;
  technical_specification: string;
  expiration_date: Date;
  mfd_date_time: Date;
  packaging_type: string;
  packaging_status: string;
  packaging_code: string;
  remaining_packaging_qty: number;
  remaining_weight: number;
  audit_status: string;
  product: {
    product_id: string;
    product_code: string;
    name: string;
    temperature_range?: {
      range: string;
      min_celsius: number;
      max_celsius: number;
    };
  };
  audits?: ProductAudit[];
  cellAssignments?: ProductCellAssignment[];
}

// Audit interfaces
export interface ProductAudit {
  audit_id: string;
  audit_date: Date;
  audit_result: string;
  comments: string;
  discrepancy_notes: string;
  packaging_condition: string;
  auditor: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Cell assignment interfaces
export interface CellAssignment {
  assignment_id: string;
  entry_order_product_id: string;
  cellReference: string;
  packaging_quantity: number;
  weight: number;
  assigned_at: Date;
  cell_status: string;
  packaging_type: string;
  packaging_status: string;
  packaging_code: string;
}

export interface ProductCellAssignment {
  assignment_id: string;
  cellReference: string;
  cell_id: string;
  packaging_quantity: number;
  weight: number;
  volume: number;
  assigned_at: Date;
  assigned_by: string;
  assigned_by_name: string;
  cell_status: string;
  packaging_type: string;
  packaging_status: string;
  packaging_code: string;
}

// Inventory interfaces
export interface ProductWithInventory {
  product_id: number;
  product_name: string;
  available_packaging: number;
  available_weight: number;
  available_volume: number;
  location_count: number;
}

export interface AvailableCell {
  inventory_id: string;
  cell_id: string;
  cell_reference: string;
  product_name: string;
  available_packaging: number;
  available_weight: number;
  available_volume: number | null;
  expiration_date: string | null;
  entry_order_no: string;
  lot_series: string | null;
  admission_date: string;
}

export interface CellValidation {
  inventory_id: string;
  cell_id: string;
  cell_reference: string;
  entry_order_no: string;
  requested_qty: number;
  requested_weight: number;
  remaining_qty: number;
  remaining_weight: number;
  will_be_empty: boolean;
}

// Form submission interfaces
export interface EntryOrderSubmissionData {
  // Entry order level data
  order_type: string;
  document_status: string;
  origin_id: string;
  document_type_id: string;
  personnel_incharge_id: string;
  supplier_id: string;
  status_id: string;
  entry_order_no: string;
  registration_date: Date;
  document_date: Date;
  admission_date_time: Date;
  entry_date: Date;
  entry_transfer_note: string;
  observation: string;
  cif_value: string;
  certificate_protocol_analysis: string;
  lot_series: string;
  type: string;
  organisation_id: string;
  created_by: string;
  
  // Products array
  products: ProductSubmissionData[];
}

export interface ProductSubmissionData {
  product_id: string;
  quantity_packaging: number;
  total_qty: number;
  total_weight: number;
  total_volume: number;
  palettes: number;
  presentation: string;
  product_description: string;
  insured_value: number;
  technical_specification: string;
  expiration_date: Date;
  mfd_date_time: Date;
  packaging_type: string;
  packaging_status: string;
  packaging_code: string;
}

// Departure form fields interface
export interface DepartureFormFields {
  customers: ReactSelectValue[];
  documentTypes: ReactSelectValue[];
  users: ReactSelectValue[];
  packagingTypes: ReactSelectValue[];
  labels: ReactSelectValue[];
}
// Add these new interfaces to your existing types file

// Enhanced Product Audit interface with additional fields
export interface EnhancedProductAudit extends ProductAudit {
  updated_packaging_type: string;
  updated_packaging_status: string;
  updated_packaging_code: string;
  entryOrderProduct: {
    entry_order_product_id: string;
    quantity_packaging: number;
    total_weight: number;
    packaging_type: string;
    packaging_status: string;
    packaging_code: string;
    audit_status: string;
    product: {
      product_id: string;
      product_code: string;
      name: string;
    };
    entry_order: {
      entry_order_id: string;
      entry_order_no: string;
    };
  };
};

// Enhanced audit submission interface
export interface ProductAuditSubmission {
  entry_order_product_id: string;
  audit_result: AuditResult;
  comments?: string;
  discrepancy_notes?: string;
  packaging_condition?: string;
  packaging_type?: string;
  packaging_status?: string;
  product_comments?: string; // New: product-specific comments
}

// Bulk audit submission interface
export interface BulkAuditSubmission {
  audits: ProductAuditSubmission[];
  overall_audit_comments?: string;
  audited_by: string;
}

// Packaging code mapping types
export type PackagingType = 
  | "PALET" 
  | "BOX" 
  | "SACK" 
  | "UNIT" 
  | "PACK" 
  | "BARRELS" 
  | "BUNDLE" 
  | "OTHER";

export type PackagingStatus = 
  | "NORMAL" 
  | "PARTIALLY_DAMAGED" 
  | "DAMAGED";

export interface PackagingCodeMapping {
  [key: string]: {
    [status in PackagingStatus]: string;
  };
}

// Audit result types
export type AuditResult = "PENDING" | "PASSED" | "FAILED";

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface EntryOrderResponse {
  entryOrder: EntryOrder;
  products: EntryOrderProduct[];
}

// Form validation interfaces
export interface FormValidationError {
  field: string;
  message: string;
}

export interface SubmitStatus {
  success?: boolean;
  message?: string;
}

// Loader types
export type ProcessLoaderTypes =
  | "processes/fetch-entry-orders"
  | "processes/fetch-departure-orders"
  | "processes/fetch-entry-order"
  | "processes/load-products-inventory"
  | "processes/load-cells"
  | "processes/validate-cell"
  | "processes/submit-departure"
  | "processes/fetch-warehouses";

// Export packaging code constants
export const PACKAGING_CODES: PackagingCodeMapping = {
  PALET: { NORMAL: "30", PARTIALLY_DAMAGED: "40", DAMAGED: "50" },
  BOX: { NORMAL: "31", PARTIALLY_DAMAGED: "41", DAMAGED: "51" },
  SACK: { NORMAL: "32", PARTIALLY_DAMAGED: "42", DAMAGED: "52" },
  UNIT: { NORMAL: "33", PARTIALLY_DAMAGED: "43", DAMAGED: "53" },
  PACK: { NORMAL: "34", PARTIALLY_DAMAGED: "44", DAMAGED: "54" },
  BARRELS: { NORMAL: "35", PARTIALLY_DAMAGED: "45", DAMAGED: "55" },
  BUNDLE: { NORMAL: "36", PARTIALLY_DAMAGED: "46", DAMAGED: "56" },
  OTHER: { NORMAL: "37", PARTIALLY_DAMAGED: "47", DAMAGED: "57" },
};

// Utility function to get packaging code
export const getPackagingCode = (type: PackagingType, status: PackagingStatus): string => {
  return PACKAGING_CODES[type]?.[status] || "";
};
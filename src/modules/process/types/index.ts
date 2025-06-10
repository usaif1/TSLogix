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

// ✅ NEW: Entry Form Fields interface
export interface EntryFormFields {
  origins: any[];
  documentTypes: any[];
  users: any[];
  suppliers: any[];
  products: any[];
  warehouses: any[];
  temperatureRanges: any[];
  originTypes: { value: string; label: string }[];
  documentTypeOptions: { value: string; label: string }[];
  orderStatusOptions: { value: string; label: string }[];
  presentationOptions: { value: string; label: string }[];
  temperatureRangeOptions: { value: string; label: string }[];
}

// ✅ UPDATED: Entry Order Review interface with warehouse_id
export interface EntryOrderReview {
  review_status: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
  review_comments: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  warehouse_id?: string; // Add this property for warehouse assignment
}

// ✅ NEW: Submit Status interface
export interface SubmitStatus {
  success?: boolean;
  message?: string;
}

// ✅ UPDATED: Process Loader Types - Add missing loader types
export type ProcessLoaderTypes = 
  | "processes/fetch-entry-orders"
  | "processes/fetch-pending-orders"
  | "processes/fetch-approved-orders"
  | "processes/update-entry-order"
  | "processes/fetch-entry-order"
  | "processes/create-entry-order"
  | "processes/review-entry-order"
  | "processes/load-form-fields"
  | "processes/fetch-warehouses"
  | "processes/fetch-warehouse-cells"
  | "processes/allocate-inventory"
  | "processes/load-products-inventory"
  | "processes/load-cells"
  | "processes/validate-cell"
  | "processes/submit-departure"
  | "processes/fetch-departure-orders"
  | "processes/load-departure-form-fields"
  | "processes/get-departure-order-no"
  | "processes/create-departure-order"
  | "processes/fetch-entry-orders-for-departure"
  | "processes/fetch-products-by-entry-order"
  | "processes/fetch-cells-for-entry-product"
  | "processes/validate-departure-cell"
  | "processes/validate-multiple-departure-cells"
  | "processes/fetch-departure-inventory-summary"
  | "processes/create-departure-from-entry"
  | "processes/browse-products-inventory"
  | "processes/get-fifo-allocation"
  | "processes/create-fifo-departure"
  | "processes/validate-fifo-allocation"
  | "processes/get-product-inventory-summary";

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

// ✅ NEW: Departure Form Fields interface
export interface DepartureFormFields {
  customers: any[];
  documentTypes: any[];
  users: any[];
  packagingTypes: any[];
  labels: any[];
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

// ✅ NEW: Inventory Selection interface
export interface InventorySelection {
  inventory_id: string;
  entry_order_product_id?: string;
  cell_reference?: string;
  warehouse_name?: string;
  product_code?: string;
  product_name?: string;
  requested_qty: number;
  requested_weight: number;
  available_packaging?: number;
  available_weight?: number;
  packaging_type?: string;
  packaging_status?: string;
  packaging_code?: number;
  entry_order_no?: string;
  expiration_date?: string;
  selected_quantity?: number; // Legacy compatibility
  cell_id?: string; // Legacy compatibility
  observations?: string;
}

// ✅ NEW: Product with Inventory interface
export interface ProductWithInventory {
  entry_order_product_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  name?: string; // Alternative name field
  entry_order_no: string;
  supplier_name: string;
  total_packaging: number;
  total_weight: number;
  location_count: number;
  expiration_date?: string;
  inventory: any[];
}

// ✅ NEW: FIFO Product with Inventory interface (Enhanced for FIFO flow)
export interface FifoProductWithInventory {
  product_id: string;
  product_code: string;
  product_name: string;
  value: string;
  label: string;
  option: string;
  inventory_summary: {
    total_quantity: number;
    total_weight: number;
    locations_count: number;
    age_span_days: number;
    oldest_date: string;
    newest_date: string;
    suppliers_count: number;
  };
  manufacturer?: string;
  product_line?: string;
  group_name?: string;
  temperature_range?: string;
  storage_conditions?: string;
  unit_weight?: number;
  unit_volume?: number;
}

// ✅ NEW: FIFO Allocation Detail
export interface FifoAllocationDetail {
  inventory_id: string;
  allocated_quantity: number;
  allocated_weight: number;
  cell_code: string;
  cell_id: string;
  row: string;
  bay: number;
  position: number;
  manufacturing_date: string;
  expiration_date: string;
  supplier_name: string;
  lot_series: string;
  priority_level: number;
  priority_color: 'red' | 'yellow' | 'green';
  priority_icon: string;
  age_days: number;
  formatted_date: string;
  cell_display: string;
  allocation_summary: string;
  available_quantity: number;
  available_weight: number;
  packaging_type: string;
  package_quantity: number;
  guide_number?: string;
  observations?: string;
}

// ✅ NEW: FIFO Allocation Response
export interface FifoAllocation {
  product_id: string;
  product_code: string;
  product_name: string;
  requested_quantity: number;
  total_allocated: number;
  allocations: FifoAllocationDetail[];
  summary: {
    total_requested: number;
    total_allocated: number;
    remaining_needed: number;
    locations_used: number;
    oldest_age_days: number;
    newest_age_days: number;
  };
  fifo_compliance: {
    is_fully_allocated: boolean;
    oldest_first: boolean;
    quality_approved: boolean;
    warning_messages: string[];
  };
}

// ✅ NEW: FIFO Selection for Departure Order
export interface FifoSelection {
  product_id: string;
  product_code: string;
  product_name: string;
  requested_quantity: number;
  requested_weight: number;
  allocation_details: FifoAllocationDetail[];
  observations?: string;
  fifo_compliance_status: 'compliant' | 'partial' | 'non_compliant';
  total_allocated_quantity: number;
  total_allocated_weight: number;
  remaining_quantity: number;
  remaining_weight: number;
}

// ✅ NEW: Product Inventory Summary for FIFO Analysis
export interface ProductInventorySummary {
  product_id: string;
  product_code: string;
  product_name: string;
  total_quantity: number;
  total_weight: number;
  total_volume: number;
  locations_count: number;
  suppliers_count: number;
  oldest_date: string;
  newest_date: string;
  oldest_age_days: number;
  newest_age_days: number;
  age_span_days: number;
  age_analysis: {
    oldest_age_days: number;
    newest_age_days: number;
    age_span_days: number;
    aging_risk_level: 'low' | 'medium' | 'high';
  };
  locations_breakdown: Array<{
    cell_id: string;
    cell_code: string;
    row: string;
    bay: number;
    position: number;
    quantity: number;
    weight: number;
    volume: number;
    manufacturing_date: string;
    expiration_date: string;
    age_days: number;
    age_category: 'fresh' | 'caution' | 'urgent';
    supplier_name: string;
    lot_series: string;
    display_name: string;
  }>;
  quality_status: string;
  quarantine_status: string;
}

// ✅ NEW: Available Cell interface
export interface AvailableCell {
  id: string;
  row: string;
  bay: number;
  position: number;
  status: string;
  capacity?: number;
  currentUsage?: number;
}

// ✅ NEW: Cell Validation interface
export interface CellValidation {
  isValid: boolean;
  message: string;
  capacity?: number;
  currentUsage?: number;
  availableSpace?: number;
}

// ✅ UPDATED: Product Audit interface (keeping for compatibility but renaming)
export interface ProductAudit {
  entry_order_product_id: string;
  audit_result: "PENDING" | "PASSED" | "FAILED";
  packaging_type: string;
  packaging_status: string;
  comments: string;
  discrepancy_notes: string;
  product_comments: string;
}

// Updated Entry Order interfaces for new flow
export interface EntryOrder {
  entry_order_id: string;
  entry_order_no: string;
  registration_date: Date;
  document_date: Date;
  entry_date_time: Date;
  order_status: "REVISION" | "PRESENTACION" | "FINALIZACION";
  review_status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";
  review_comments?: string;
  reviewed_at?: Date;
  reviewed_by?: string;
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
}

// ✅ NEW: Audit Result type (keeping for compatibility)
export type AuditResult = "PENDING" | "PASSED" | "FAILED";

// ✅ NEW: Packaging Code utility function (keeping for compatibility)
export function getPackagingCode(packagingType: string): string {
  const codes: { [key: string]: string } = {
    "CAJA": "CJ",
    "PALETA": "PL",
    "SACO": "SC",
    "UNIDAD": "UN",
    "PAQUETE": "PQ",
    "TAMBOS": "TB",
    "BULTO": "BL",
    "OTRO": "OT",
  };
  return codes[packagingType] || "OT";
}
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
  | "processes/update-departure-order"
  | "processes/fetch-entry-orders-for-departure"
  | "processes/fetch-products-by-entry-order"
  | "processes/fetch-cells-for-entry-product"
  | "processes/validate-departure-cell"
  | "processes/validate-multiple-departure-cells"
  | "processes/fetch-departure-inventory-summary"
  | "processes/create-departure-from-entry"
  | "processes/browse-products-inventory"
  | "processes/browse-products"
  | "processes/get-fifo-allocation"
  | "processes/create-fifo-departure"
  | "processes/validate-fifo-allocation"
  | "processes/get-product-inventory-summary"
  | "processes/fetch-departure-audit-trail"
  | "processes/approve-departure-order"
  | "processes/reject-departure-order"
  | "processes/request-departure-revision"
  | "processes/dispatch-departure-order"
  | "processes/batch-dispatch-orders"
  | "processes/get-fifo-locations"
  | "processes/get-product-fifo-analysis"
  | "processes/get-expiry-dashboard"
  | "processes/fetch-orders-by-status"
  | "warehouse-dispatch/load-approved-orders"
  | "warehouse-dispatch/execute-dispatch";

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
  personnel: any[];
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

// ✅ NEW: Departure Order Workflow States
export type DepartureOrderStatus = "PENDING" | "APPROVED" | "REVISION" | "REJECTED" | "DISPATCHED" | "COMPLETED";

// ✅ NEW: User Roles for Permission Control
export type UserRole = "CLIENT" | "WAREHOUSE_INCHARGE" | "ADMIN";

// ✅ NEW: Expiry Urgency Classification
export type ExpiryUrgency = "EXPIRED" | "URGENT" | "WARNING" | "NORMAL";

// ✅ NEW: Quality Status for Inventory
export type InventoryQualityStatus = "APROBADO" | "RECHAZADO" | "EN_REVISION" | "CUARENTENA";

// ✅ NEW: Departure Order Review/Approval Interface
export interface DepartureOrderReview {
  review_status: "APPROVED" | "REJECTED" | "REVISION";
  review_comments: string;
  reviewed_by?: string;
  reviewed_at?: string;
  warehouse_assignment?: string;
  priority_level?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

// ✅ NEW: Expiry-Based FIFO Location
export interface ExpiryFifoLocation {
  inventory_id: string;
  cell_id: string;
  cell_code: string;
  cell_reference: string;
  row: string;
  bay: number;
  position: number;
  available_quantity: number;
  available_weight: number;
  packaging_type: string;
  lot_series: string;
  expiration_date: string;
  entry_date: string;
  manufacturing_date: string;
  supplier_name: string;
  entry_order_no: string;
  guide_number: string;
  quality_status: InventoryQualityStatus;
  
  // Expiry Analysis
  days_to_expiry: number;
  expiry_urgency: ExpiryUrgency;
  is_expired: boolean;
  fifo_rank: number; // 1 = highest priority (earliest expiry)
  
  // Display Properties
  urgency_color: 'red' | 'orange' | 'yellow' | 'green';
  urgency_icon: string;
  expiry_warning: string;
  recommended_priority: number;
}

// ✅ NEW: Enhanced FIFO Allocation with Expiry Focus
export interface ExpiryFifoAllocation {
  product_id: string;
  product_code: string;
  product_name: string;
  requested_quantity: number;
  requested_weight?: number;
  allocated_quantity?: number;
  allocated_weight?: number;
  total_allocated?: number;
  total_allocated_weight?: number;
  fully_allocated?: boolean;
  remaining_quantity?: number;
  remaining_weight?: number;
  
  // Support both API response structures
  // New API structure uses 'suggestions'
  suggestions?: Array<{
    inventory_id: string;
    allocation_id: string;
    entry_order_product_id: string;
    cell_id: string;
    cell_reference: string;
    warehouse_name: string;
    entry_order_no: string;
    entry_date_time: string;
    expiration_date: string;
    manufacturing_date: string;
    lot_series: string;
    product_code: string;
    product_name: string;
    requested_qty: number;
    requested_weight: number;
    available_qty: number;
    available_weight: number;
    fifo_rank: string;
    will_be_empty: boolean;
    days_to_expiry: number;
    urgency_level: string;
    is_near_expiry: boolean;
    is_expired: boolean;
    // Additional properties to match ExpiryFifoLocation
    expiry_urgency?: ExpiryUrgency;
    allocated_quantity?: number;
    allocated_weight?: number;
  }>;
  
  // Legacy API structure uses 'locations'
  locations?: ExpiryFifoLocation[];
  
  locations_used?: number;
  earliest_entry_date?: string;
  latest_entry_date?: string;
  earliest_expiry_date?: string;
  has_expired_items?: boolean;
  has_near_expiry_items?: boolean;
  urgent_dispatch_recommended?: boolean;
  expiry_priority?: string;
  
  // Expiry Analysis Summary (optional for backward compatibility)
  expiry_analysis?: {
    expired_items: number;
    urgent_items: number; // ≤7 days to expiry
    warning_items: number; // ≤30 days to expiry
    normal_items: number;
    earliest_expiry_date: string;
    latest_expiry_date: string;
    average_days_to_expiry: number;
    risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  
  // Allocation Summary (optional for backward compatibility)
  allocation_summary?: {
    total_requested: number;
    total_allocated: number;
    remaining_needed: number;
    locations_used: number;
    fully_allocated: boolean;
    partial_allocation_reason?: string;
  };
  
  // FIFO Compliance (optional for backward compatibility)
  fifo_compliance?: {
    is_fifo_compliant: boolean;
    expiry_first_sorting: boolean;
    quality_approved_only: boolean;
    warning_messages: string[];
    compliance_score: number; // 0-100
  };
}

// ✅ NEW: Comprehensive Departure Order Interface
export interface DepartureOrder {
  departure_order_id: string;
  departure_order_no: string;
  departure_order_code: string;
  status: DepartureOrderStatus;
  
  // Customer & Warehouse Information
  customer_id: string;
  warehouse_id: string;
  customer?: {
    customer_id: string;
    name: string;
    company_name?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  warehouse?: {
    warehouse_id: string;
    name: string;
    location: string;
    manager_name?: string;
  };
  
  // Document Information
  document_type_id: string;
  document_number: string;
  document_date: string;
  dispatch_document_number: string;
  uploaded_documents?: string[];
  
  // Dates & Times
  departure_date: string;
  departure_time?: string;
  dispatch_date_time?: string;
  entry_date_time: string;
  created_at: string;
  updated_at: string;
  
  // Personnel
  created_by: string;
  assigned_to?: string;
  dispatched_by?: string;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    role: UserRole;
  };
  dispatcher?: {
    id: string;
    first_name: string;
    last_name: string;
    role: UserRole;
  };
  
  // Products & Inventory
  products: DepartureOrderProduct[];
  
  // Totals & Quantities
  total_quantity: number;
  total_weight: number;
  total_volume?: number;
  total_pallets: number;
  total_insured_value?: number;
  
  // Logistics
  transport_type?: string;
  arrival_point?: string;
  carrier_name?: string;
  tracking_number?: string;
  
  // Additional Information
  observations?: string;
  special_instructions?: string;
  priority_level: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  
  // Workflow Information
  approval_history: DepartureApprovalStep[];
  current_step: string;
  next_possible_actions: string[];
  
  // Expiry Risk Assessment
  expiry_risk_summary: {
    has_expired_items: boolean;
    has_urgent_items: boolean;
    has_warning_items: boolean;
    overall_risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
    recommended_dispatch_date: string;
    risk_mitigation_notes?: string[];
  };
  
  // Organization
  organisation_id: string;
  organisation_name?: string;
}

// ✅ NEW: Departure Order Product with Expiry Information
export interface DepartureOrderProduct {
  departure_product_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  
  // Quantities
  requested_quantity: number;
  requested_weight: number;
  allocated_quantity?: number;
  allocated_weight?: number;
  packaging_quantity: number;
  pallet_quantity?: number;
  
  // Product Details
  lot_number: string;
  packaging_type: string;
  presentation: string;
  
  // Dates
  expiration_date: string;
  manufacturing_date: string;
  entry_date: string;
  
  // Entry Order Reference
  entry_order_no: string;
  entry_order_id?: string;
  guide_number: string;
  
  // Supplier Information
  supplier_name: string;
  supplier_id?: string;
  
  // Expiry Analysis for this Product
  expiry_info: {
    days_to_expiry: number;
    expiry_urgency: ExpiryUrgency;
    is_expired: boolean;
    urgency_color: 'red' | 'orange' | 'yellow' | 'green';
    urgency_message: string;
    recommended_dispatch_priority: number;
  };
  
  // Inventory Allocations (FIFO sorted)
  inventory_allocations: DepartureInventoryAllocation[];
  
  // Quality & Status
  quality_status: InventoryQualityStatus;
  product_status: string;
  
  // Additional Details
  temperature_range?: string;
  storage_conditions?: string;
  special_handling?: string;
  observations?: string;
}

// ✅ NEW: Departure Inventory Allocation
export interface DepartureInventoryAllocation {
  allocation_id: string;
  inventory_id: string;
  cell_id: string;
  cell_reference: string;
  allocated_quantity: number;
  allocated_weight: number;
  
  // Cell Information
  cell_details: {
    row: string;
    bay: number;
    position: number;
    cell_code: string;
    current_usage: number;
    capacity: number;
  };
  
  // Expiry Information
  expiration_date: string;
  days_to_expiry: number;
  expiry_urgency: ExpiryUrgency;
  fifo_priority: number;
  
  // Lot & Supplier Details
  lot_series: string;
  supplier_name: string;
  entry_order_no: string;
  guide_number: string;
  
  // Status & Quality
  allocation_status: "PENDING" | "CONFIRMED" | "DISPATCHED";
  quality_status: InventoryQualityStatus;
  
  // Timestamps
  allocated_at: string;
  confirmed_at?: string;
  dispatched_at?: string;
}

// ✅ NEW: Departure Approval Step
export interface DepartureApprovalStep {
  step_id: string;
  step_type: "CREATED" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED" | "DISPATCHED" | "COMPLETED";
  status: DepartureOrderStatus;
  
  // User Information
  performed_by: string;
  performer_name: string;
  performer_role: UserRole;
  
  // Step Details
  comments?: string;
  reason?: string;
  attachments?: string[];
  
  // Timestamps
  performed_at: string;
  
  // Additional Context
  system_notes?: string;
  ip_address?: string;
  user_agent?: string;
}

// ✅ NEW: Role-Based Permission Interface
export interface DeparturePermissions {
  can_create_order: boolean;
  can_edit_order: boolean;
  can_delete_order: boolean;
  can_submit_order: boolean;
  can_approve_order: boolean;
  can_reject_order: boolean;
  can_request_revision: boolean;
  can_dispatch_order: boolean;
  can_complete_order: boolean;
  can_view_all_orders: boolean;
  can_view_own_orders: boolean;
  can_assign_orders: boolean;
  can_override_fifo: boolean;
  can_access_admin_panel: boolean;
}

// ✅ NEW: Batch Dispatch Interface
export interface BatchDispatchRequest {
  departure_order_ids: string[];
  dispatch_date_time: string;
  dispatched_by: string;
  batch_notes?: string;
  transport_details?: {
    vehicle_info?: string;
    driver_name?: string;
    route_info?: string;
    estimated_arrival?: string;
  };
}

// ✅ NEW: Product FIFO Analysis
export interface ProductFifoAnalysis {
  product_id: string;
  product_code: string;
  product_name: string;
  
  // Overall Inventory Summary
  total_quantity: number;
  total_weight: number;
  total_locations: number;
  
  // Expiry Analysis
  expiry_breakdown: {
    expired: { count: number; quantity: number; percentage: number };
    urgent: { count: number; quantity: number; percentage: number };
    warning: { count: number; quantity: number; percentage: number };
    normal: { count: number; quantity: number; percentage: number };
  };
  
  // FIFO Locations (sorted by expiry date)
  fifo_locations: ExpiryFifoLocation[];
  
  // Risk Assessment
  risk_assessment: {
    overall_risk: 'HIGH' | 'MEDIUM' | 'LOW';
    immediate_action_required: boolean;
    recommended_dispatch_quantity: number;
    risk_mitigation_steps: string[];
  };
  
  // Recommendations
  dispatch_recommendations: {
    suggested_quantity: number;
    suggested_locations: string[];
    urgency_level: 'IMMEDIATE' | 'HIGH' | 'NORMAL';
    notes: string[];
  };
}
// Master Report TypeScript Interfaces

export interface MasterReportItem {
  // Customer & Product Information
  customer_code: string;
  customer_name: string;
  product_code: string;
  product_name: string;
  product_category: string;
  product_subcategory1: string;
  product_subcategory2: string;

  // Packaging Information
  packing_type: string;
  packing_condition: string;

  // Entry Order Information
  entry_order_number: string;
  entry_order_date: string;
  entry_order_guia: string;
  entry_order_transport_guia: string;
  entry_order_quantity: number;
  entry_order_unit_cost: string;
  entry_order_total_cost: string;
  entry_order_currency: string;
  entry_order_supplier_code: string;
  entry_order_supplier_name: string;
  entry_order_customer_code: string;
  entry_order_customer_name: string;

  // Dispatch Order Information
  dispatch_order_number: string;
  dispatch_order_date: string;
  dispatch_order_guia: string;
  dispatch_order_transport_guia: string;
  dispatch_order_quantity: number;
  dispatch_order_unit_cost: string;
  dispatch_order_total_cost: string;
  dispatch_order_currency: string;
  dispatch_order_customer_code: string;
  dispatch_order_customer_name: string;
  dispatch_order_customer_address: string;

  // TSL Personnel Information
  order_receiver_from_tsl: string;
  order_dispatcher_from_tsl: string;

  // Additional Information
  lot_number: string;
  expiry_date: string;
  warehouse_location: string;
  quality_status: string;
  remarks: string;
  observations: string;

  // Transaction metadata
  transaction_type: 'DISPATCHED' | 'IN_STOCK';
  entry_to_dispatch_days: number | null;
}

export interface MasterReportSummary {
  total_transactions: number;
  dispatched_transactions: number;
  in_stock_transactions: number;
  total_entry_quantity: number;
  total_dispatch_quantity: number;
  total_entry_value: string;
  total_dispatch_value: string;
  unique_products: number;
  unique_customers: number;
  unique_suppliers: number;
  average_days_to_dispatch: string;
}

export interface MasterReportFilters {
  date_from?: string;
  date_to?: string;
  date_filter_type?: 'entry' | 'dispatch' | 'both';
  customer_name?: string;
  customer_code?: string;
  product_name?: string;
  product_code?: string;
  supplier_name?: string;
  supplier_code?: string;
  include_unallocated?: boolean;
}

export interface MasterReportResponse {
  success: boolean;
  message: string;
  data: MasterReportItem[];
  summary: MasterReportSummary;
  filters_applied: MasterReportFilters;
  user_role: string;
  report_generated_at: string;
  processing_time_ms: number;
  total_records: number;
}

export interface MasterReportExportData {
  reportData: MasterReportItem[];
  summary: MasterReportSummary;
  filters: MasterReportFilters;
  metadata: {
    generatedAt: string;
    userRole: string;
    processingTime: number;
    totalRecords: number;
  };
}
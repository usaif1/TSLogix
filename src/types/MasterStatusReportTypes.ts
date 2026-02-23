// Master Status Report TypeScript Interfaces

export interface MasterStatusReportItem {
  date: string;
  customer_code: string;
  customer_name: string;
  position_pallet_number: string;
  position_type: string;
  product_code: string;
  product_name: string;
  warehouse_quantity: number;
  unit_quantity: number;
  remarks: string;
  observations: string;
}

export interface MasterStatusReportSummary {
  total_records: number;
  total_warehouse_quantity: number;
  total_unit_quantity: number;
  unique_customers: number;
  unique_products: number;
  position_type_breakdown: {
    normal: number;
    rejected: number;
    sample: number;
    returns: number;
    quarantine: number;
  };
}

export interface MasterStatusReportFilters {
  date_from?: string;
  date_to?: string;
  customer_name?: string;
  customer_code?: string;
  product_name?: string;
  product_code?: string;
  quality_status?: string;
  warehouse_id?: string;
}

export interface MasterStatusReportResponse {
  success: boolean;
  message: string;
  data: MasterStatusReportItem[];
  summary: MasterStatusReportSummary;
  filters_applied: Record<string, unknown>;
  user_role: string;
  is_client_filtered: boolean;
  report_generated_at: string;
  processing_time_ms: number;
}

export interface MasterStatusReportExportData {
  reportData: MasterStatusReportItem[];
  summary: MasterStatusReportSummary;
  filters: MasterStatusReportFilters;
  metadata: {
    generatedAt: string;
    userRole: string;
    processingTime: number;
    totalRecords: number;
  };
}

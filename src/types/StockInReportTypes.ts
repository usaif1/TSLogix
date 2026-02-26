// Stock In Report Types - Monthly summary of all entry orders

export interface StockInReportItem {
  period: string;
  entry_order_number: string;
  entry_order_date_time: string | null;
  position_assignment_date_time: string | null;
  customer_code: string;
  customer_name: string;
  guia_remision_number: string;
  guia_transporte_number: string;
  order_receiver: string;
  remarks: string;
  observations: string;
  order_status?: string;
  total_pallets?: number;
}

export interface StockInReportSummary {
  total_orders: number;
  orders_by_status: Record<string, number>;
  total_pallets: number;
  unique_customers: number;
}

export interface StockInReportFilters {
  date_from?: string | null;
  date_to?: string | null;
  customer_name?: string | null;
  customer_code?: string | null;
}

export interface StockInReportResponse {
  success: boolean;
  message: string;
  data: StockInReportItem[];
  summary: StockInReportSummary;
  filters_applied: StockInReportFilters;
  user_role: string;
  is_client_filtered: boolean;
  report_generated_at: string;
  processing_time_ms: number;
}

export interface StockInReportExportData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary: { label: string; value: string | number }[];
  metadata: {
    generatedAt: string;
    filters: StockInReportFilters;
    userRole: string;
  };
}

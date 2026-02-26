// Stock Out Report Types - Monthly summary of all dispatch orders

export interface StockOutReportItem {
  period: string;
  dispatch_order_number: string;
  dispatch_order_date_time: string | null;
  stock_out_date_time: string | null;
  customer_code: string;
  customer_name: string;
  guia_remision_number: string;
  guia_transporte_number: string;
  order_dispatcher: string;
  remarks: string;
  observations: string;
  order_status?: string;
  dispatch_status?: string;
  total_pallets?: number;
}

export interface StockOutReportSummary {
  total_orders: number;
  orders_by_status: Record<string, number>;
  total_pallets: number;
  unique_customers: number;
  dispatched_orders: number;
  pending_orders: number;
}

export interface StockOutReportFilters {
  date_from?: string | null;
  date_to?: string | null;
  customer_name?: string | null;
  customer_code?: string | null;
}

export interface StockOutReportResponse {
  success: boolean;
  message: string;
  data: StockOutReportItem[];
  summary: StockOutReportSummary;
  filters_applied: StockOutReportFilters;
  user_role: string;
  is_client_filtered: boolean;
  report_generated_at: string;
  processing_time_ms: number;
}

export interface StockOutReportExportData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary: { label: string; value: string | number }[];
  metadata: {
    generatedAt: string;
    filters: StockOutReportFilters;
    userRole: string;
  };
}

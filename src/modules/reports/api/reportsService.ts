// API base URL
import api from "@/utils/api/axios.config";

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  customer_name?: string;
  customer_code?: string;
  product_name?: string;
  product_code?: string;
  warehouse_id?: string;
  quality_status?: string;
}

export interface WarehouseReport {
  id: string;
  warehouse_name: string;
  total_products: number;
  total_quantity: number;
  total_weight: number;
  total_value: number;
  date_range: string;
}

export interface ProductCategoryReport {
  product_code: string;
  product_name: string;
  manufacturer: string;
  category: string;
  subcategory1?: string;
  subcategory2?: string;
  client_id: string;
  client_name: string;
  customer_name: string;
  customer_code: string;
  approved_products: Array<{
    lot_number: string;
    quantity_units: number;
    entry_date: string;
    expiration_date: string;
  }>;
  sample_products: Array<{
    lot_number: string;
    quantity_units: number;
    entry_date: string;
    expiration_date: string;
  }>;
  quarantine_products: Array<{
    lot_number: string;
    quantity_units: number;
    entry_date: string;
    expiration_date: string;
  }>;
  return_products: Array<{
    lot_number: string;
    quantity_units: number;
    entry_date: string;
    expiration_date: string;
  }>;
  rejected_products: Array<{
    lot_number: string;
    quantity_units: number;
    entry_date: string;
    expiration_date: string;
  }>;
}

export interface ProductWiseReport {
  type: 'STOCK_IN' | 'STOCK_OUT';
  product_code: string;
  product_name: string;
  manufacturer: string;
  category: string;
  client_id: string;
  client_name: string;
  customer_name: string;
  customer_code: string;
  entry_order_code?: string;
  entry_date?: string;
  departure_order_code?: string;
  departure_date?: string;
  lot_number?: string;
  quantity_units: number;
  package_quantity: number;
  warehouse_quantity: number;
  weight: string | number;
  volume?: string | number;
  financial_value?: string | number | null;
  expiration_date?: string;
  warehouse_name?: string;
}

export interface CardexMovement {
  type: 'STOCK_IN' | 'STOCK_OUT';
  date: string;
  reference: string;
  lot_number?: string;
  quantity: number;
  financial_value: number;
  client_name: string;
}

export interface CardexReport {
  product_code: string;
  product_name: string;
  manufacturer: string;
  category: string;
  subcategory1?: string;
  subcategory2?: string;
  client_id: string;
  client_name: string;
  opening_balance: {
    quantity: number;
    financial_value: number;
  };
  stock_in: {
    quantity: number;
    financial_value: number;
  };
  stock_out: {
    quantity: number;
    financial_value: number;
  };
  closing_balance: {
    quantity: number;
    financial_value: number;
  };
  movements: CardexMovement[];
}

// New interface for the actual API response
export interface WarehousePosition {
  allocation_id: string;
  inventory_id: string;
  cell_id: string;
  position: string;
  cell_role: string;
  cell_status: string;
  quantity_units: number;
  package_quantity: number;
  weight_kg: number;
  volume_m3: number | null;
  category: string;
  quality_status: string;
  inventory_status: string;
  lot_series: string;
  manufacturing_date: string;
  expiration_date: string;
  days_to_expiry: number;
  presentation: string;
  product_status: string;
  is_near_expiry: boolean;
  is_urgent: boolean;
  is_expired: boolean;
  entry_order_id: string;
  entry_order_no: string;
  entry_date: string;
  created_at: string;
  last_updated: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_location: string;
}

export interface WarehouseProduct {
  product_id: string;
  product_code: string;
  product_name: string;
  manufacturer: string;
  positions: WarehousePosition[];
  location_count: number;
  position_count: number;
  total_quantity: number;
  total_weight: number;
  total_volume: number;
}

export interface WarehouseClient {
  client_id: string;
  client_name: string;
  client_type: string;
  client_email: string;
  products: WarehouseProduct[];
  total_positions: number;
  total_quantity: number;
  total_weight: number;
  total_volume: number;
}

export interface WarehouseReportResponse {
  success: boolean;
  message: string;
  data: WarehouseClient[];
  summary: {
    total_clients: number;
    total_products: number;
    total_positions: number;
    total_quantity: number;
    total_weight: number;
    total_volume: number;
    total_warehouse_cells: number;
    total_vacant_cells: number;
    total_occupied_cells: number;
    client_breakdown: Array<{
      client_id: string;
      client_name: string;
      client_type: string;
      product_count: number;
      position_count: number;
      total_quantity: number;
      total_weight: number;
      total_volume: number;
    }>;
    product_distribution: Record<string, any>;
    warehouse_breakdown: Record<string, any>;
    quality_status_breakdown: Record<string, number>;
    category_breakdown: Record<string, number>;
    urgency_breakdown: {
      expired: number;
      urgent: number;
      near_expiry: number;
      normal: number;
    };
  };
  filters_applied: Record<string, string | number | boolean | null | undefined>;
  user_role: string;
  is_client_filtered: boolean;
  report_generated_at: string;
  processing_time_ms: number;
}

export interface ProductCategoryReportResponse {
  success: boolean;
  message: string;
  data: ProductCategoryReport[];
  summary: {
    total_products: number;
    total_approved: number;
    total_samples: number;
    total_quarantine: number;
    total_returns: number;
    total_rejected: number;
    categories_breakdown: Record<string, number>;
  };
  filters_applied: Record<string, string | number | boolean | null | undefined>;
  user_role: string;
  is_client_filtered: boolean;
  report_generated_at: string;
  processing_time_ms: number;
}

export interface ProductWiseReportResponse {
  success: boolean;
  message: string;
  data: ProductWiseReport[];
  summary: {
    total_records: number;
    stock_in_records: number;
    stock_out_records: number;
    total_stock_in_quantity: number;
    total_stock_out_quantity: number;
    total_stock_in_value: number;
    total_stock_out_value: number;
    products_breakdown: Record<string, { stock_in: number; stock_out: number }>;
  };
  filters_applied: Record<string, string | number | boolean | null | undefined>;
  user_role: string;
  is_client_filtered: boolean;
  report_generated_at: string;
  processing_time_ms: number;
}

class ReportsService {
  // Warehouse Report
  async getWarehouseReport(filters: ReportFilters = {}): Promise<WarehouseReportResponse> {
    try {
      const params = new URLSearchParams();
      
      // Only add date filters if they are provided
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      
      if (filters.product_code) {
        params.append('product_code', filters.product_code);
      }
      if (filters.product_name) {
        params.append('product_name', filters.product_name);
      }
      if (filters.customer_name) {
        params.append('customer_name', filters.customer_name);
      }
      if (filters.customer_code) {
        params.append('customer_code', filters.customer_code);
      }
      if (filters.warehouse_id) {
        params.append('warehouse_id', filters.warehouse_id);
      }
      if (filters.quality_status) {
        params.append('quality_status', filters.quality_status);
      }

      const response = await api.get(`/reports/warehouse?${params.toString()}`);
      
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error in getWarehouseReport:', error);
      throw error;
    }
  }

  // Product Category Report
  async getProductCategoryReport(filters: ReportFilters = {}): Promise<ProductCategoryReportResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      if (filters.customer_name) {
        params.append('customer_name', filters.customer_name);
      }
      if (filters.customer_code) {
        params.append('customer_code', filters.customer_code);
      }
      if (filters.product_name) {
        params.append('product_name', filters.product_name);
      }
      if (filters.product_code) {
        params.append('product_code', filters.product_code);
      }

      const response = await api.get(`/reports/product-category?${params.toString()}`);
      
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error in getProductCategoryReport:', error);
      throw error;
    }
  }

  // Product Wise Report
  async getProductWiseReport(filters: ReportFilters = {}): Promise<ProductWiseReportResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      if (filters.product_code) {
        params.append('product_code', filters.product_code);
      }
      if (filters.product_name) {
        params.append('product_name', filters.product_name);
      }
      if (filters.customer_name) {
        params.append('customer_name', filters.customer_name);
      }
      if (filters.customer_code) {
        params.append('customer_code', filters.customer_code);
      }

      const response = await api.get(`/reports/product-wise?${params.toString()}`);
      
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error in getProductWiseReport:', error);
      throw error;
    }
  }

  // Cardex Report
  async getCardexReport(filters: ReportFilters = {}): Promise<{ success: boolean; message: string; data: CardexReport[]; summary: any; filters_applied: any; user_role: string; is_client_filtered: boolean; report_generated_at: string; processing_time_ms: number; }> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      if (filters.product_code) {
        params.append('product_code', filters.product_code);
      }
      if (filters.product_name) {
        params.append('product_name', filters.product_name);
      }
      if (filters.customer_name) {
        params.append('customer_name', filters.customer_name);
      }
      if (filters.customer_code) {
        params.append('customer_code', filters.customer_code);
      }

      const response = await api.get(`/reports/cardex?${params.toString()}`);
      
      return response.data;
    } catch (error) {
      console.error('Error in getCardexReport:', error);
      throw error;
    }
  }

  // Export report to Excel/PDF
  async exportReport(reportType: string, filters: ReportFilters = {}, format: 'excel' | 'pdf' = 'excel') {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      if (filters.product_code) {
        params.append('product_code', filters.product_code);
      }
      if (filters.product_name) {
        params.append('product_name', filters.product_name);
      }
      if (filters.customer_name) {
        params.append('customer_name', filters.customer_name);
      }
      if (filters.customer_code) {
        params.append('customer_code', filters.customer_code);
      }

      const response = await api.get(`/reports/${reportType}/export?${params.toString()}`, {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportType}-report-${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error in exportReport:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService();
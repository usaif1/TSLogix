// API base URL
import api from "@/utils/api/axios.config";

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  product_code?: string;
  warehouse_id?: string;
  category_id?: string;
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
  id: string;
  category_name: string;
  product_count: number;
  total_quantity: number;
  total_weight: number;
  total_value: number;
}

export interface ProductWiseReport {
  id: string;
  product_code: string;
  product_name: string;
  category_name: string;
  total_quantity: number;
  total_weight: number;
  total_value: number;
  locations_count: number;
}

export interface CardexReport {
  id: string;
  product_code: string;
  product_name: string;
  date: string;
  transaction_type: 'IN' | 'OUT';
  quantity: number;
  weight: number;
  balance_quantity: number;
  balance_weight: number;
  reference: string;
}

// New interface for the actual API response
export interface WarehouseInventoryItem {
  allocation_id: string;
  inventory_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  manufacturer: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_location: string;
  warehouse_capacity: number;
  warehouse_max_occupancy: number;
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
  entry_order_id: string;
  entry_order_no: string;
  entry_date: string;
  lot_series: string;
  manufacturing_date: string;
  expiration_date: string;
  days_to_expiry: number;
  presentation: string;
  product_status: string;
  is_near_expiry: boolean;
  is_urgent: boolean;
  is_expired: boolean;
  created_at: string;
  last_updated: string;
}

export interface WarehouseReportResponse {
  success: boolean;
  message: string;
  data: WarehouseInventoryItem[];
  summary: {
    total_records: number;
    total_quantity: number;
    total_weight: number;
    total_volume: number;
    warehouses_involved: number;
    products_involved: number;
    category_breakdown: Record<string, number>;
    quality_status_breakdown: Record<string, number>;
    urgency_breakdown: {
      expired: number;
      urgent: number;
      near_expiry: number;
      normal: number;
    };
  };
  filters_applied: Record<string, any>;
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
      if (filters.warehouse_id) {
        params.append('warehouse_id', filters.warehouse_id);
      }
      if (filters.category_id) {
        params.append('category_id', filters.category_id);
      }

      const response = await api.get(`/warehouse/report?${params.toString()}`);
      
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      console.error('Error in getWarehouseReport:', error);
      throw error;
    }
  }

  // Product Category Report
  async getProductCategoryReport(filters: ReportFilters = {}): Promise<ProductCategoryReport[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }

      const response = await api.get(`/product-category/report?${params.toString()}`);
      
      const data = response.data.data || response.data;
      return data || [];
    } catch (error) {
      console.error('Error in getProductCategoryReport:', error);
      throw error;
    }
  }

  // Product Wise Report
  async getProductWiseReport(filters: ReportFilters = {}): Promise<ProductWiseReport[]> {
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
      if (filters.category_id) {
        params.append('category_id', filters.category_id);
      }

      const response = await api.get(`/product-wise/report?${params.toString()}`);
      
      const data = response.data.data || response.data;
      return data || [];
    } catch (error) {
      console.error('Error in getProductWiseReport:', error);
      throw error;
    }
  }

  // Cardex Report
  async getCardexReport(filters: ReportFilters = {}): Promise<CardexReport[]> {
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

      const response = await api.get(`/cardex/report?${params.toString()}`);
      
      const data = response.data.data || response.data;
      return data || [];
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

      const response = await api.get(`/${reportType}/export?${params.toString()}`);
      
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      console.error('Error in exportReport:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService(); 
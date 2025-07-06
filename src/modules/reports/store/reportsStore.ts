import { create } from 'zustand';
import { reportsService, ReportFilters, WarehouseReportResponse, ProductCategoryReportResponse, ProductWiseReportResponse } from '../api/reportsService';

interface ReportsState {
  // Loading states
  isLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Report data
  warehouseReports: WarehouseReportResponse | null;
  productCategoryReports: ProductCategoryReportResponse | null;
  productWiseReports: ProductWiseReportResponse | null;
  cardexReports: { success: boolean; message: string; data: any[]; summary: any; filters_applied: any; user_role: string; is_client_filtered: boolean; report_generated_at: string; processing_time_ms: number; } | null;
  
  // Filters
  filters: ReportFilters;
  
  // Selected report type
  selectedReportType: 'warehouse' | 'product-category' | 'product-wise' | 'cardex';
  
  // Actions
  setLoading: (key: string, loading: boolean) => void;
  setFilters: (filters: Partial<ReportFilters>) => void;
  setSelectedReportType: (type: 'warehouse' | 'product-category' | 'product-wise' | 'cardex') => void;
  
  // Fetch reports
  fetchWarehouseReports: (filters?: ReportFilters) => Promise<void>;
  fetchProductCategoryReports: (filters?: ReportFilters) => Promise<void>;
  fetchProductWiseReports: (filters?: ReportFilters) => Promise<void>;
  fetchCardexReports: (filters?: ReportFilters) => Promise<void>;
  
  // Export reports
  exportReport: (reportType: string, format: 'excel' | 'pdf') => Promise<boolean>;
  
  // Clear data
  clearReports: () => void;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  // Initial state
  isLoading: false,
  loadingStates: {},
  warehouseReports: null,
  productCategoryReports: null,
  productWiseReports: null,
  cardexReports: null,
  filters: {},
  selectedReportType: 'warehouse',

  // Actions
  setLoading: (key: string, loading: boolean) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: loading,
      },
      isLoading: Object.values({ ...state.loadingStates, [key]: loading }).some(Boolean),
    }));
  },

  setFilters: (filters: Partial<ReportFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setSelectedReportType: (type: 'warehouse' | 'product-category' | 'product-wise' | 'cardex') => {
    set({ selectedReportType: type });
  },

  // Fetch reports
  fetchWarehouseReports: async (filters?: ReportFilters) => {
    const { setLoading } = get();
    setLoading('warehouse-reports', true);
    
    try {
      const currentFilters = filters || get().filters;
      const reports = await reportsService.getWarehouseReport(currentFilters);
      set({ warehouseReports: reports });
    } catch (error) {
      console.error('Error fetching warehouse reports:', error);
      set({ warehouseReports: null });
    } finally {
      setLoading('warehouse-reports', false);
    }
  },

  fetchProductCategoryReports: async (filters?: ReportFilters) => {
    const { setLoading } = get();
    setLoading('product-category-reports', true);
    
    try {
      const currentFilters = filters || get().filters;
      const reports = await reportsService.getProductCategoryReport(currentFilters);
      set({ productCategoryReports: reports });
    } catch (error) {
      console.error('Error fetching product category reports:', error);
      set({ productCategoryReports: null });
    } finally {
      setLoading('product-category-reports', false);
    }
  },

  fetchProductWiseReports: async (filters?: ReportFilters) => {
    const { setLoading } = get();
    setLoading('product-wise-reports', true);
    
    try {
      const currentFilters = filters || get().filters;
      const reports = await reportsService.getProductWiseReport(currentFilters);
      set({ productWiseReports: reports });
    } catch (error) {
      console.error('Error fetching product wise reports:', error);
      set({ productWiseReports: null });
    } finally {
      setLoading('product-wise-reports', false);
    }
  },

  fetchCardexReports: async (filters?: ReportFilters) => {
    const { setLoading } = get();
    setLoading('cardex-reports', true);
    
    try {
      const currentFilters = filters || get().filters;
      const reports = await reportsService.getCardexReport(currentFilters);
      set({ cardexReports: reports });
    } catch (error) {
      console.error('Error fetching cardex reports:', error);
      set({ cardexReports: null });
    } finally {
      setLoading('cardex-reports', false);
    }
  },

  // Export reports
  exportReport: async (reportType: string, format: 'excel' | 'pdf') => {
    const { setLoading } = get();
    setLoading('export-report', true);
    
    try {
      const currentFilters = get().filters;
      const success = await reportsService.exportReport(reportType, currentFilters, format);
      if (success) {
        console.log(`${reportType} report exported successfully as ${format}`);
      }
      return success || true;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    } finally {
      setLoading('export-report', false);
    }
  },

  // Clear data
  clearReports: () => {
    set({
      warehouseReports: null,
      productCategoryReports: null,
      productWiseReports: null,
      cardexReports: null,
      filters: {},
    });
  },
})); 
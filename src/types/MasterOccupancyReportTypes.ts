// Master Occupancy Report TypeScript Interfaces

export interface MasterOccupancyReportItem {
  warehouse: string;
  warehouse_id: string;
  date: string;
  total_positions: number;
  total_normal_positions: number;
  total_samples_positions: number;
  total_rejected_positions: number;
  total_occupied_positions: number;
  occupied_normal_positions: number;
  occupied_samples_positions: number;
  occupied_rejected_positions: number;
  total_available_positions: number;
  available_normal_positions: number;
  available_samples_positions: number;
  available_rejected_positions: number;
  occupancy_rate: string;
  remarks: string;
  observations: string;
}

export interface MasterOccupancyReportSummary {
  total_warehouses: number;
  grand_total_positions: number;
  grand_total_normal: number;
  grand_total_samples: number;
  grand_total_rejected: number;
  grand_total_occupied: number;
  grand_occupied_normal: number;
  grand_occupied_samples: number;
  grand_occupied_rejected: number;
  grand_total_available: number;
  grand_available_normal: number;
  grand_available_samples: number;
  grand_available_rejected: number;
  overall_occupancy_rate: string;
}

export interface MasterOccupancyReportFilters {
  warehouse_id?: string;
}

export interface MasterOccupancyReportResponse {
  success: boolean;
  message: string;
  data: MasterOccupancyReportItem[];
  summary: MasterOccupancyReportSummary;
  filters_applied: Record<string, unknown>;
  user_role: string;
  report_generated_at: string;
  processing_time_ms: number;
}

export interface MasterOccupancyReportExportData {
  reportData: MasterOccupancyReportItem[];
  summary: MasterOccupancyReportSummary;
  filters: MasterOccupancyReportFilters;
  metadata: {
    generatedAt: string;
    userRole: string;
    processingTime: number;
    totalRecords: number;
  };
}

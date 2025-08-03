/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import useWarehouseCellStore from "@/modules/warehouse/store";

const cellBaseURL = "/warehouse/cells";
const warehouseBaseURL = "/warehouse/warehouses";

const {
  setCells,
  addCells,
  setWarehouses,
  startLoader,
  stopLoader,
} = useWarehouseCellStore.getState();

// Quality purpose types
export type CellQualityPurpose = 
  | "STANDARD" 
  | "REJECTED" 
  | "SAMPLES" 
  | "RETURNS" 
  | "DAMAGED" 
  | "EXPIRED";

export interface CellRoleChangeHistory {
  change_id: string;
  cell_id: string;
  old_role: CellQualityPurpose | null;
  new_role: CellQualityPurpose;
  changed_by: string;
  changed_at: string;
  reason?: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    role: { name: string };
  };
}

export interface CellsByRole {
  [key: string]: {
    role: CellQualityPurpose;
    cells: any[];
    count: number;
  };
}

export const WarehouseCellService = {
  /**
   * Fetch all warehouse metadata for dropdown
   */
  fetchWarehouses: async (): Promise<{ warehouse_id: string; name: string }[]> => {
    startLoader("warehouses/fetch-warehouses");
    try {
      const response = await api.get(warehouseBaseURL);
      
      console.log("Raw warehouse API response:", response.data);
      
      // Handle the nested response structure - warehouses are in response.data.data
      let warehouseList: { warehouse_id: string; name: string }[] = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        // API returns { success, message, count, data: [...] }
        warehouseList = response.data.data.map((warehouse: any) => ({
          warehouse_id: warehouse.warehouse_id,
          name: warehouse.name,
        }));
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback: direct array response
        warehouseList = response.data.map((warehouse: any) => ({
          warehouse_id: warehouse.warehouse_id,
          name: warehouse.name,
        }));
      }
      
      console.log("Processed warehouse list for dropdown:", warehouseList);
      
      setWarehouses(warehouseList);
      return warehouseList;
    } catch (err) {
      console.error("Fetch warehouses error:", err);
      throw err;
    } finally {
      stopLoader("warehouses/fetch-warehouses");
    }
  },

  /**
   * Fetch cells, optionally filtered by warehouse_id
   */
  fetchAllCells: async (
    warehouse_id?: string
  ): Promise<{ cells: any[] }> => {
    startLoader("cells/fetch-cells");
    try {
      const response = await api.get(cellBaseURL, { params: { warehouse_id } });
      
      console.log("Raw cells API response:", response.data);
      
      // Handle the new API response structure - cells are in response.data.data
      let cellsData: any[] = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        // New API structure: { success, message, data: [...] }
        cellsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.cells)) {
        // Fallback: old structure { cells: [...] }
        cellsData = response.data.cells;
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback: direct array response
        cellsData = response.data;
      }
      
      console.log("Processed cells data:", cellsData);
      
      const normalizedCells = cellsData.map(c => ({
        ...c,
        bay: Number(c.bay),
        position: Number(c.position),
        capacity: parseFloat(c.capacity),
        currentUsage: parseFloat(c.currentUsage),
      }));
      
      setCells(normalizedCells);
      return { cells: normalizedCells };
    } catch (err) {
      console.error("Fetch cells error:", err);
      throw err;
    } finally {
      stopLoader("cells/fetch-cells");
    }
  },

  /**
   * Allocate pallets into cells
   */
  allocatePallets: async (payload: {
    warehouse_id: string;
    row: string;
    palletCount: number;
    product_id: string;
    user_id?: string;
  }): Promise<{ slots: any[] }> => {
    startLoader("cells/allocate-pallets");
    try {
      const response = await api.post(`${cellBaseURL}/allocate`, payload);
      const slots = response.data.slots as any[];
      addCells(slots.map(c => ({
        ...c,
        bay: Number(c.bay),
        position: Number(c.position),
        capacity: parseFloat(c.capacity),
        currentUsage: parseFloat(c.currentUsage),
      })));
      return { slots };
    } catch (err) {
      console.error("Allocate pallets error:", err);
      throw err;
    } finally {
      stopLoader("cells/allocate-pallets");
    }
  },

  /**
   * Get available cell roles for dropdown (ADMIN only)
   */
  fetchCellRoles: async (): Promise<Array<{ value: string; label: string }>> => {
    startLoader("cells/fetch-roles");
    try {
      const response = await api.get("/warehouse/cell-roles");
      return response.data.data || response.data;
    } catch (err) {
      console.error("Fetch cell roles error:", err);
      throw err;
    } finally {
      stopLoader("cells/fetch-roles");
    }
  },

  /**
   * Change cell role (ADMIN only)
   */
  changeCellRole: async (cellId: string, newRole: string): Promise<any> => {
    startLoader("cells/change-role");
    try {
      const response = await api.put(`${cellBaseURL}/${cellId}/role`, {
        new_cell_role: newRole,
      });
      return response.data;
    } catch (err) {
      console.error("Change cell role error:", err);
      throw err;
    } finally {
      stopLoader("cells/change-role");
    }
  },

  /**
   * Get cell role change history
   */
  getCellHistory: async (cellId: string): Promise<CellRoleChangeHistory[]> => {
    startLoader("cells/fetch-history");
    try {
      const response = await api.get(`${cellBaseURL}/${cellId}/history`);
      return response.data.data || response.data;
    } catch (err) {
      console.error("Fetch cell history error:", err);
      throw err;
    } finally {
      stopLoader("cells/fetch-history");
    }
  },

  /**
   * Get cells grouped by quality role
   */
  getCellsByRole: async (warehouseId?: string): Promise<CellsByRole> => {
    startLoader("cells/fetch-by-role");
    try {
      const params = warehouseId ? { warehouse_id: warehouseId } : {};
      const response = await api.get(`${cellBaseURL}/by-role`, { params });
      
      console.log("Raw API response:", response.data);
      
      // Handle the actual API response structure
      const apiData = response.data.data || response.data;
      
      let transformedData: CellsByRole = {};
      
      if (warehouseId && apiData.cells_by_warehouse && apiData.cells_by_warehouse[warehouseId]) {
        // When filtering by warehouse, use warehouse-specific data
        const warehouseData = apiData.cells_by_warehouse[warehouseId];
        const cellsByRole = warehouseData.cells_by_role || {};
        
        // Transform to expected format
        Object.keys(cellsByRole).forEach(roleKey => {
          const cells = cellsByRole[roleKey] || [];
          transformedData[roleKey] = {
            role: roleKey as any,
            cells: cells,
            count: cells.length
          };
        });
      } else if (apiData.cells_by_role) {
        // When not filtering by warehouse, use global data
        const cellsByRole = apiData.cells_by_role;
        
        // Transform to expected format
        Object.keys(cellsByRole).forEach(roleKey => {
          const cells = cellsByRole[roleKey] || [];
          transformedData[roleKey] = {
            role: roleKey as any,
            cells: cells,
            count: cells.length
          };
        });
      }
      
      console.log("Transformed data:", transformedData);
      return transformedData;
    } catch (err) {
      console.error("Fetch cells by role error:", err);
      throw err;
    } finally {
      stopLoader("cells/fetch-by-role");
    }
  },

  /**
   * Get available quality purposes with Spanish labels
   */
  getQualityPurposes: (): Array<{ value: CellQualityPurpose; label: string; labelEs: string; description: string; descriptionEs: string }> => {
    return [
      { 
        value: "STANDARD", 
        label: "Standard", 
        labelEs: "Estándar",
        description: "Regular storage",
        descriptionEs: "Almacenamiento regular"
      },
      { 
        value: "REJECTED", 
        label: "Rejected", 
        labelEs: "Rechazados",
        description: "Rejected products",
        descriptionEs: "Productos rechazados"
      },
      { 
        value: "SAMPLES", 
        label: "Samples", 
        labelEs: "Contramuestras",
        description: "Product samples",
        descriptionEs: "Muestras de productos"
      },
      { 
        value: "RETURNS", 
        label: "Returns", 
        labelEs: "Devoluciones",
        description: "Product returns",
        descriptionEs: "Devoluciones de productos"
      },
      { 
        value: "DAMAGED", 
        label: "Damaged", 
        labelEs: "Dañados",
        description: "Damaged products",
        descriptionEs: "Productos dañados"
      },
      { 
        value: "EXPIRED", 
        label: "Expired", 
        labelEs: "Vencidos",
        description: "Expired products",
        descriptionEs: "Productos vencidos"
      },
    ];
  },
};
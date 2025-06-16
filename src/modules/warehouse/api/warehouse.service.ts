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
};
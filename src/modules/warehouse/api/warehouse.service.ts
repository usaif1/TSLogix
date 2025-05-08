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
      const list = response.data as { warehouse_id: string; name: string }[];
      setWarehouses(list);
      return list;
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
      const data = response.data as { cells: any[] };
      setCells(data.cells.map(c => ({
        ...c,
        bay: Number(c.bay),
        position: Number(c.position),
        capacity: parseFloat(c.capacity),
        currentUsage: parseFloat(c.currentUsage),
      })));
      return data;
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
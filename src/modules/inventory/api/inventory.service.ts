/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { useInventoryLogStore } from "@/modules/inventory/store";
import { Cell } from "../screens/AllocateOrder/components/CellGrid";

const baseURL = "/inventory-logs";
const warehouseURL = "/inventory-logs/warehouses";

const {
  setInventoryLogs,
  setCurrentInventoryLog,
  addInventoryLog,
  updateInventoryLog,
  deleteInventoryLog,
  setWarehouses,
  setCells,
  startLoader,
  stopLoader,
} = useInventoryLogStore.getState();

type Filters = Record<string, any>;

export const InventoryLogService = {
  fetchAllLogs: async (filters?: Filters) => {
    try {
      startLoader("inventoryLogs/fetch-logs");
      const response = await api.get(baseURL, { params: filters });
      const data = response.data.data || response.data;
      setInventoryLogs(data);
      return data;
    } catch (error) {
      console.error("Fetch inventory logs error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-logs");
    }
  },

  fetchLogById: async (id: string) => {
    try {
      startLoader("inventoryLogs/fetch-log");
      const response = await api.get(`${baseURL}/${id}`);
      const data = response.data.data || response.data;
      setCurrentInventoryLog(data);
      return data;
    } catch (error) {
      console.error("Fetch inventory log error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-log");
    }
  },

  createLog: async (formData: any) => {
    try {
      startLoader("inventoryLogs/create-log");
      const payload = {
        ...formData,
        user_id: localStorage.getItem("id"),
      };
      const response = await api.post(baseURL, payload);
      const data = response.data.data || response.data;
      addInventoryLog(data);
      return data;
    } catch (error) {
      console.error("Create inventory log error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/create-log");
    }
  },

  updateLog: async (id: string, formData: any) => {
    try {
      startLoader("inventoryLogs/update-log");
      const payload = {
        ...formData,
        updated_by: localStorage.getItem("id"),
      };
      const response = await api.put(`${baseURL}/${id}`, payload);
      const data = response.data.data || response.data;
      updateInventoryLog(id, data);
      return data;
    } catch (error) {
      console.error("Update inventory log error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/update-log");
    }
  },

  deleteLog: async (id: string) => {
    try {
      startLoader("inventoryLogs/delete-log");
      await api.delete(`${baseURL}/${id}`);
      deleteInventoryLog(id);
      return true;
    } catch (error) {
      console.error("Delete inventory log error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/delete-log");
    }
  },

  fetchWarehouses: async () => {
    try {
      startLoader("inventoryLogs/fetch-warehouses");
      const res = await api.get(warehouseURL);
      const data = res.data.data || res.data;
      setWarehouses(data);
      return data;
    } catch (error) {
      console.error("Fetch warehouses error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-warehouses");
    }
  },

  fetchCells: async (warehouseId: string) => {
    try {
      startLoader("inventoryLogs/fetch-cells");
      const res = await api.get(`${warehouseURL}/${warehouseId}/cells`, {
        params: { status: "AVAILABLE" },
      });
      const raw: any[] = res.data.data || res.data;

      // Map raw API data to Cell[]
      const cells: Cell[] = raw.map((c) => ({
        cell_id: c.id,
        warehouse_id: c.warehouse_id,
        row: c.row,
        bay: c.bay,
        position: c.position,
        capacity: Number(c.capacity),
        currentUsage: Number(c.currentUsage),
        status: c.status,
      }));

      setCells(cells);
      return cells;
    } catch (error) {
      console.error("Fetch cells error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-cells");
    }
  },

  /**
   * Assign a portion of an entry order to a specific warehouse cell
   */
  assignToCell: async (formData: {
    entry_order_id: string;
    cell_id: string;
    packaging_quantity: number;
    weight: number;
    volume?: number;
    warehouse_id: string;
  }) => {
    try {
      startLoader("inventoryLogs/assign-cell");

      const payload = {
        entry_order_id:     formData.entry_order_id,
        cell_id:            formData.cell_id,
        packaging_quantity: formData.packaging_quantity,
        weight:             formData.weight,
        volume:             formData.volume,
        warehouse_id:       formData.warehouse_id,
      };

      const res = await api.post(`${baseURL}/assign`, payload);
      const data = res.data.data || res.data;
      return data;
    } catch (error) {
      console.error("Assign to cell error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/assign-cell");
    }
  },
};

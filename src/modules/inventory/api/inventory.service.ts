/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { useInventoryLogStore, ProductReadyForAssignment, InventorySummary } from "@/modules/inventory/store";
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
  setProductsReadyForAssignment,
  setInventorySummary,
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

  // UPDATED: Fetch available cells for specific warehouse (new endpoint)
  fetchAvailableCells: async (warehouseId: string) => {
    try {
      startLoader("inventoryLogs/fetch-cells");
      const res = await api.get(`${warehouseURL}/${warehouseId}/available-cells`);
      const raw: any[] = res.data.data || res.data;

      // Map raw API data to Cell[]
      const cells: Cell[] = raw.map((c) => ({
        cell_id: c.cell_id,
        warehouse_id: warehouseId,
        row: c.cellReference.split('.')[0],
        bay: parseInt(c.cellReference.split('.')[1]),
        position: parseInt(c.cellReference.split('.')[2]),
        capacity: Number(c.capacity),
        currentUsage: 0, // Available cells have no current usage
        status: "AVAILABLE",
      }));

      setCells(cells);
      return cells;
    } catch (error) {
      console.error("Fetch available cells error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-cells");
    }
  },

  // LEGACY: Keep for backward compatibility with other parts of the app
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

  // UPDATED: Fetch products ready for assignment (no warehouse filter)
  fetchProductsReadyForAssignment: async () => {
    try {
      startLoader("inventoryLogs/fetch-products-ready");
      const response = await api.get(`${baseURL}/products/ready-for-assignment`);
      const data: ProductReadyForAssignment[] = response.data.data || response.data;
      setProductsReadyForAssignment(data);
      return data;
    } catch (error) {
      console.error("Fetch products ready for assignment error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-products-ready");
    }
  },

  // Assign specific product to cell
  assignProductToCell: async (formData: {
    entry_order_product_id: string;
    cell_id: string;
    packaging_quantity: number;
    weight: number;
    volume?: number;
    warehouse_id: string;
  }) => {
    try {
      startLoader("inventoryLogs/assign-product-to-cell");

      const payload = {
        entry_order_product_id: formData.entry_order_product_id,
        cell_id: formData.cell_id,
        packaging_quantity: formData.packaging_quantity,
        weight: formData.weight,
        volume: formData.volume,
        warehouse_id: formData.warehouse_id,
      };

      const res = await api.post(`${baseURL}/assign-product`, payload);
      const data = res.data.data || res.data;
      
      // Add log entry to the logs
      addInventoryLog({
        log_id: `temp_${Date.now()}`,
        movement_type: "ENTRY",
        quantity_change: formData.packaging_quantity,
        weight_change: formData.weight,
        product: data.product,
        timestamp: new Date().toISOString(),
        notes: `Assigned to cell ${data.cellReference}`,
      });

      return data;
    } catch (error) {
      console.error("Assign product to cell error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/assign-product-to-cell");
    }
  },

  // Fetch inventory summary
  fetchInventorySummary: async (filters?: { warehouse_id?: string; product_id?: string; status?: string }) => {
    try {
      startLoader("inventoryLogs/fetch-inventory-summary");
      const response = await api.get(`${baseURL}/summary`, { params: filters });
      const data: InventorySummary[] = response.data.data || response.data;
      setInventorySummary(data);
      return data;
    } catch (error) {
      console.error("Fetch inventory summary error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-inventory-summary");
    }
  },

  // Get logs by entry order product
  fetchLogsByEntryOrderProduct: async (entryOrderProductId: string) => {
    try {
      startLoader("inventoryLogs/fetch-logs");
      const response = await api.get(`${baseURL}/entry-order-product/${entryOrderProductId}`);
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      console.error("Fetch logs by entry order product error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-logs");
    }
  },

  // LEGACY: Keep for backward compatibility
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
        entry_order_id: formData.entry_order_id,
        cell_id: formData.cell_id,
        packaging_quantity: formData.packaging_quantity,
        weight: formData.weight,
        volume: formData.volume,
        warehouse_id: formData.warehouse_id,
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
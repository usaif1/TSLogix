/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { useInventoryLogStore } from "@/modules/inventory/store";

const baseURL = "/inventory-logs";
const {
  setInventoryLogs,
  setCurrentInventoryLog,
  addInventoryLog,
  updateInventoryLog,
  deleteInventoryLog,
  startLoader,
  stopLoader,
} = useInventoryLogStore.getState();

export const InventoryLogService = {
  fetchAllLogs: async (filters?: Record<string, any>) => {
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
      const payload = { ...formData, user_id: localStorage.getItem("id") };
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
      const payload = { ...formData, updated_by: localStorage.getItem("id") };
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
};
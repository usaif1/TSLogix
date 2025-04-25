// src/services/inventoryService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { InventoryStore } from "@/modules/inventory/store";

const { setInventories, setSelectedInventory, startLoader, stopLoader } =
  InventoryStore.getState();

const baseURL = "/inventory";

type LoaderKey =
  | "inventory/fetch-all"
  | "inventory/fetch-one"
  | "inventory/create"
  | "inventory/update"
  | "inventory/delete"
  | "inventory/audit";

export const InventoryService = {
  // Fetch all inventories (optional filter by product_id)
  fetchAllInventories: async (productId?: string) => {
    const loader = "inventory/fetch-all" as LoaderKey;
    try {
      startLoader(loader);
      let endpoint = baseURL;
      if (productId) {
        endpoint += `?product_id=${encodeURIComponent(productId)}`;
      }
      const resp = await api.get(endpoint);
      setInventories(resp.data.data);
    } catch (err) {
      console.error("Error fetching inventories", err);
      throw new Error("Failed to fetch inventories");
    } finally {
      stopLoader(loader);
    }
  },

  // Fetch single inventory by ID
  fetchInventoryById: async (id: string) => {
    const loader = "inventory/fetch-one" as LoaderKey;
    try {
      startLoader(loader);
      const resp = await api.get(`${baseURL}/${id}`);
      setSelectedInventory(resp.data.data);
      return resp.data.data;
    } catch (err) {
      console.error(`Error fetching inventory ${id}`, err);
      throw new Error("Failed to fetch inventory");
    } finally {
      stopLoader(loader);
    }
  },

  // Create new inventory
  createInventory: async (payload: any) => {
    const loader = "inventory/create" as LoaderKey;
    try {
      startLoader(loader);
      const resp = await api.post(baseURL, payload);
      return resp.data.data;
    } catch (err) {
      console.error("Error creating inventory", err);
      throw new Error("Failed to create inventory");
    } finally {
      stopLoader(loader);
    }
  },

  // Update inventory
  updateInventory: async (id: string, payload: any) => {
    const loader = "inventory/update" as LoaderKey;
    try {
      startLoader(loader);
      const resp = await api.put(`${baseURL}/${id}`, payload);
      return resp.data.data;
    } catch (err) {
      console.error(`Error updating inventory ${id}`, err);
      throw new Error("Failed to update inventory");
    } finally {
      stopLoader(loader);
    }
  },

  // Delete inventory
  deleteInventory: async (id: string) => {
    const loader = "inventory/delete" as LoaderKey;
    try {
      startLoader(loader);
      const resp = await api.delete(`${baseURL}/${id}`);
      return resp.data.data;
    } catch (err) {
      console.error(`Error deleting inventory ${id}`, err);
      throw new Error("Failed to delete inventory");
    } finally {
      stopLoader(loader);
    }
  },

  // Audit inventory
  auditInventory: async (
    id: string,
    auditPayload: {
      newStatus: string;
      reason?: string;
      quantityAdjustment?: number;
    }
  ) => {
    const loader = "inventory/audit" as LoaderKey;
    try {
      startLoader(loader);
      const resp = await api.post(`${baseURL}/${id}/audit`, auditPayload);
      return resp.data.data;
    } catch (err) {
      console.error(`Error auditing inventory ${id}`, err);
      throw new Error("Failed to audit inventory");
    } finally {
      stopLoader(loader);
    }
  },
};

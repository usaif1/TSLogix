/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import {
  useInventoryLogStore,
  InventorySummary,
  QualityControlStatus,
  QuarantineInventoryItem,
  SystemAuditLog,
} from "@/modules/inventory/store/index";
import { Cell } from "../screens/AllocateOrder/components/CellGrid";

// ✅ Fixed: Updated to match backend routes
const baseURL = "/inventory";
const warehouseURL = "/inventory/warehouses";

const {
  setInventoryLogs,
  setCurrentInventoryLog,
  addInventoryLog,
  setWarehouses,
  setCells,
  setInventorySummary,
  setQuarantineInventory,
  setAvailableInventoryForDeparture,
  setAuditTrail,
  startLoader,
  stopLoader,
} = useInventoryLogStore.getState();

type Filters = Record<string, any>;

export const InventoryLogService = {
  // ✅ NEW: Fetch approved entry orders ready for inventory assignment
  fetchApprovedEntryOrders: async () => {
    try {
      startLoader("inventoryLogs/fetch-logs");
      const response = await api.get(`${baseURL}/approved-entry-orders`);
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      console.error("Fetch approved entry orders error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-logs");
    }
  },

  // ✅ NEW: Fetch products for specific entry order
  fetchEntryOrderProducts: async (entryOrderId: string) => {
    try {
      startLoader("inventoryLogs/fetch-products-ready");
      const response = await api.get(
        `${baseURL}/entry-order/${entryOrderId}/products`
      );
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      console.error("Fetch entry order products error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-products-ready");
    }
  },

  // ✅ UPDATED: Fetch inventory logs (using summary for now)
  fetchAllLogs: async (filters?: Filters) => {
    try {
      startLoader("inventoryLogs/fetch-logs");
      const response = await api.get(`${baseURL}/summary`, { params: filters });
      const data = response.data.data || response.data;

      // ✅ Map inventory summary to logs format for display
      const logsData = data.map((item: any) => ({
        log_id: item.inventory_id,
        user: {
          first_name: "System",
          last_name: "User",
        },
        product: {
          product_id: item.product.product_id,
          product_code: item.product.product_code,
          name: item.product.name,
        },
        movement_type: "ENTRY",
        quantity_change: item.current_quantity,
        package_change: item.current_package_quantity,
        weight_change: item.current_weight,
        volume_change: item.current_volume,
        warehouseCell: {
          row: item.cell.row,
          bay: item.cell.bay,
          position: item.cell.position,
        },
        warehouse: item.warehouse,
        entry_order: item.allocation?.entry_order_no
          ? {
              entry_order_no: item.allocation.entry_order_no,
            }
          : null,
        product_status: item.product_status,
        status_code: item.status_code,
        quality_status: item.quality_status,
        timestamp: item.allocation?.allocated_at || new Date().toISOString(),
        notes: item.allocation?.observations || "Current inventory",
      }));

      setInventoryLogs(logsData);
      return logsData;
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
      const response = await api.get(`${baseURL}/summary?inventory_id=${id}`);
      const data = response.data.data || response.data;
      setCurrentInventoryLog(data[0] || null);
      return data[0] || null;
    } catch (error) {
      console.error("Fetch inventory log error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-log");
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

  // ✅ UPDATED: Fetch available cells for specific warehouse
  fetchAvailableCells: async (warehouseId: string) => {
    try {
      startLoader("inventoryLogs/fetch-cells");
      const res = await api.get(
        `${warehouseURL}/${warehouseId}/available-cells`
      );
      const raw: any[] = res.data.data || res.data;

      const cells: Cell[] = raw.map((c) => ({
        cell_id: c.id,
        warehouse_id: warehouseId,
        row: c.row,
        bay: c.bay,
        position: c.position,
        capacity: Number(c.capacity),
        currentUsage: Number(c.currentUsage || 0),
        current_packaging_qty: Number(c.current_packaging_qty || 0),
        current_weight: Number(c.current_weight || 0),
        status: c.status,
        cellKind: c.kind,
        cellRole: c.cell_role,
        cellReference: `${c.row}.${String(c.bay).padStart(2, "0")}.${String(
          c.position
        ).padStart(2, "0")}`,
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

  // ✅ FIXED: Use proper JSON payload structure like the entry order form
  assignProductToCell: async (formData: {
    entry_order_product_id: string;
    cell_id: string;
    inventory_quantity: number;
    package_quantity: number;
    quantity_pallets?: number;
    presentation: string;
    weight_kg: number;
    volume_m3?: number;
    guide_number?: string;
    product_status?: string;
    uploaded_documents?: File[] | null;
    observations?: string;
    warehouse_id: string;
  }) => {
    try {
      startLoader("inventoryLogs/assign-product-to-cell");

      // ✅ Get user ID from localStorage
      const userId = localStorage.getItem("id");
      if (!userId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      // ✅ Handle file uploads separately if present
      const uploadedDocumentsUrls: string[] = [];
      if (
        formData.uploaded_documents &&
        formData.uploaded_documents.length > 0
      ) {
        // TODO: Implement file upload to your storage service
        // For now, we'll handle it differently or skip files
        console.log(
          "Files detected but not implemented yet:",
          formData.uploaded_documents.length
        );
      }

      // ✅ Create proper JSON payload structure (like entry order form)
      const payload = {
        entry_order_product_id: formData.entry_order_product_id,
        cell_id: formData.cell_id,
        assigned_by: userId,
        warehouse_id: formData.warehouse_id,
        organisation_id: localStorage.getItem("organisation_id"),

        // Required fields
        inventory_quantity: formData.inventory_quantity,
        package_quantity: formData.package_quantity,
        presentation: formData.presentation,
        weight_kg: formData.weight_kg,
        product_status: formData.product_status || "30-PAL-NORMAL",

        // Optional fields - only include if they have meaningful values
        ...(formData.quantity_pallets &&
          formData.quantity_pallets > 0 && {
            quantity_pallets: formData.quantity_pallets,
          }),
        ...(formData.volume_m3 &&
          formData.volume_m3 > 0 && {
            volume_m3: formData.volume_m3,
          }),
        ...(formData.guide_number &&
          formData.guide_number.trim() && {
            guide_number: formData.guide_number.trim(),
          }),
        ...(formData.observations &&
          formData.observations.trim() && {
            observations: formData.observations.trim(),
          }),
        ...(uploadedDocumentsUrls.length > 0 && {
          uploaded_documents: uploadedDocumentsUrls,
        }),
      };

      console.log("=== SENDING JSON PAYLOAD (like entry order) ===");
      console.log("URL:", `${baseURL}/assign-product`);
      console.log("Method: POST");
      console.log("Content-Type: application/json");
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("=== END PAYLOAD ===");

      // ✅ Send as JSON (like entry order form)
      const response = await api.post(`${baseURL}/assign-product`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Assignment successful:", response.data);

      const data = response.data.data || response.data;

      // Add log entry to the logs
      addInventoryLog({
        log_id: `temp_${Date.now()}`,
        movement_type: "ENTRY",
        quantity_change: formData.inventory_quantity,
        package_change: formData.package_quantity,
        weight_change: formData.weight_kg,
        volume_change: formData.volume_m3,
        product: data.product || { name: "Unknown Product" },
        timestamp: new Date().toISOString(),
        notes: `Assigned to cell ${data.cellReference || "Unknown Cell"}`,
        quality_status: "CUARENTENA",
      });

      return data;
    } catch (error: any) {
      console.error("❌ Assignment failed:", error);

      // ✅ Enhanced error handling (same as entry order)
      let errorMessage = "Failed to assign product to cell. Please try again.";

      if (error.response) {
        console.error("Backend error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });

        if (error.response.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else {
            try {
              errorMessage = JSON.stringify(error.response.data);
            } catch {
              errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
            }
          }
        } else {
          errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    } finally {
      stopLoader("inventoryLogs/assign-product-to-cell");
    }
  },

  // ✅ UPDATED: Fetch inventory summary
  fetchInventorySummary: async (filters?: {
    warehouse_id?: string;
    product_id?: string;
    status?: string;
  }) => {
    try {
      startLoader("inventoryLogs/fetch-inventory-summary");
      const response = await api.get(`${baseURL}/summary`, { params: filters });
      const data: any[] = response.data.data || response.data;

      const mappedData: InventorySummary[] = data.map((item) => ({
        inventory_id: item.inventory_id,
        current_quantity: item.current_quantity,
        current_package_quantity: item.current_package_quantity,
        current_weight: item.current_weight,
        current_volume: item.current_volume,
        status: item.status,
        product_status: item.product_status,
        status_code: item.status_code,
        quality_status: item.quality_status,

        product: {
          product_id: item.product.product_id,
          product_code: item.product.product_code,
          name: item.product.name,
        },

        cell: {
          id: item.cell.id,
          row: item.cell.row,
          bay: item.cell.bay,
          position: item.cell.position,
          cellReference: `${item.cell.row}.${String(item.cell.bay).padStart(
            2,
            "0"
          )}.${String(item.cell.position).padStart(2, "0")}`,
        },

        warehouse: {
          warehouse_id: item.warehouse.warehouse_id,
          name: item.warehouse.name,
        },

        allocation: item.allocation
          ? {
              allocation_id: item.allocation.allocation_id,
              guide_number: item.allocation.guide_number,
              observations: item.allocation.observations,
              allocated_at: item.allocation.allocated_at,
              allocated_by: item.allocation.allocated_by,
              last_modified_by: item.allocation.last_modified_by,
              last_modified_at: item.allocation.last_modified_at,
              entry_order_no: item.allocation.entry_order?.entry_order_no,
            }
          : null,
      }));

      setInventorySummary(mappedData);
      return mappedData;
    } catch (error) {
      console.error("Fetch inventory summary error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-inventory-summary");
    }
  },

  // ✅ NEW: Get inventory by quality status (dynamic) with filters
  fetchInventoryByQualityStatus: async (qualityStatus: QualityControlStatus, filters?: {
    warehouse_id?: string;
  }) => {
    try {
      startLoader("inventoryLogs/fetch-quarantine-inventory");
      const params: any = { 
        quality_status: qualityStatus 
      };
      
      if (filters?.warehouse_id) {
        params.warehouse_id = filters.warehouse_id;
      }

      const response = await api.get(`${baseURL}/by-quality-status`, { params });
      const data: QuarantineInventoryItem[] = response.data.data || response.data;

      // Update store based on quality status
      if (qualityStatus === QualityControlStatus.CUARENTENA) {
        setQuarantineInventory(data);
      } else {
        // For other statuses, we could add different store setters if needed
        // For now, we'll use quarantine inventory store for all quality statuses
        setQuarantineInventory(data);
      }
      
      return data;
    } catch (error) {
      console.error("Fetch inventory by quality status error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-quarantine-inventory");
    }
  },

  // ✅ NEW: Transition inventory quality status
  transitionQualityStatus: async (transitionData: {
    allocation_id: string;
    to_status: QualityControlStatus;
    quantity_to_move: number;
    package_quantity_to_move: number;
    weight_to_move: number;
    volume_to_move: number;
    reason: string;
    notes?: string;
  }) => {
    try {
      startLoader("inventoryLogs/quality-transition");

      const userId = localStorage.getItem("id");
      if (!userId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const payload = {
        ...transitionData,
        performed_by: userId,
      };

      console.log("=== QUALITY TRANSITION ===");
      console.log("URL:", `${baseURL}/quality-transition`);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await api.post(`${baseURL}/quality-transition`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Quality transition successful:", response.data);

      const data = response.data.data || response.data;
      return data;
    } catch (error: any) {
      console.error("❌ Quality transition failed:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/quality-transition");
    }
  },

  // ✅ NEW: Get available inventory for departure (only approved items)
  fetchAvailableInventoryForDeparture: async (filters?: {
    warehouse_id?: string;
    product_id?: string;
  }) => {
    try {
      startLoader("inventoryLogs/fetch-available-for-departure");
      const response = await api.get(`${baseURL}/available-for-departure`, { params: filters });
      const data: InventorySummary[] = response.data.data || response.data;

      setAvailableInventoryForDeparture(data);
      return data;
    } catch (error) {
      console.error("Fetch available inventory for departure error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-available-for-departure");
    }
  },

  // ✅ NEW: Get audit trail for inventory operations
  fetchAuditTrail: async (filters?: {
    entity_id?: string;
    user_id?: string;
    action?: string;
    limit?: number;
  }) => {
    try {
      startLoader("inventoryLogs/fetch-audit-trail");
      const response = await api.get(`${baseURL}/audit-trail`, { params: filters });
      const data: SystemAuditLog[] = response.data.data || response.data;

      setAuditTrail(data);
      return data;
    } catch (error) {
      console.error("Fetch audit trail error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-audit-trail");
    }
  },

  // ✅ LEGACY: Keep for backward compatibility
  fetchCells: async (warehouseId: string) => {
    try {
      startLoader("inventoryLogs/fetch-cells");
      const res = await api.get(`${warehouseURL}/${warehouseId}/cells`);
      const raw: any[] = res.data.data || res.data;

      const cells: Cell[] = raw.map((c) => ({
        cell_id: c.id,
        warehouse_id: c.warehouse_id,
        row: c.row,
        bay: c.bay,
        position: c.position,
        capacity: Number(c.capacity),
        currentUsage: Number(c.currentUsage || 0),
        current_packaging_qty: Number(c.current_packaging_qty || 0),
        current_weight: Number(c.current_weight || 0),
        status: c.status,
        cellKind: c.kind,
        cellRole: c.cell_role,
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
};

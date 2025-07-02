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
  setInventorySummaryStats,
  setCurrentInventoryItems,
  setDispatchHistoryLogs,
  setCompletedDepartureOrders,
  setFiltersApplied,
  setLastGeneratedAt,
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

  // ✅ UPDATED: Fetch inventory logs with comprehensive data structure
  fetchAllLogs: async (filters?: Filters) => {
    try {
      startLoader("inventoryLogs/fetch-logs");
      const response = await api.get(`${baseURL}/summary`, { params: filters });
      const responseData = response.data.data || response.data;

      // ✅ Handle new API response structure
      const summaryStats = responseData.summary_stats || {};
      const currentInventory = responseData.current_inventory || [];
      const dispatchHistory = responseData.dispatch_history || [];
      const completedOrders = responseData.completed_departure_orders || [];

      // ✅ Extract movement logs from current inventory items
      const inventoryMovementLogs: any[] = [];
      
      currentInventory.forEach((item: any) => {
        if (item.movement_logs && Array.isArray(item.movement_logs)) {
          item.movement_logs.forEach((log: any) => {
            inventoryMovementLogs.push({
              log_id: log.log_id,
              inventory_id: item.inventory_id,
              user: log.user_id ? {
                first_name: log.user?.first_name || "User",
                last_name: log.user?.last_name || "",
              } : {
                first_name: "System",
                last_name: "",
              },
              product: {
                product_id: item.product.product_id,
                product_code: item.product.product_code,
                name: item.product.name,
                manufacturer: item.product.manufacturer,
              },
              movement_type: log.movement_type,
              quantity_change: log.quantity_change,
              package_change: log.package_change,
              weight_change: log.weight_change,
              volume_change: log.volume_change,
              warehouseCell: item.cell ? {
                row: item.cell.row,
                bay: item.cell.bay,
                position: item.cell.position,
              } : null,
              warehouse: item.warehouse,
              entry_order: log.entry_order,
              departure_order: log.departure_order,
              departure_order_id: log.departure_order_id,
              entry_order_id: log.entry_order_id,
              product_status: log.product_status,
              status_code: log.status_code,
              quality_status: item.allocation?.quality_status,
              timestamp: log.timestamp,
              notes: log.notes || item.allocation?.observations || null,
              cell_reference: item.cell_reference,
            });
          });
        }
      });

      // ✅ Add dispatch history as movement logs
      const dispatchMovementLogs: any[] = dispatchHistory.map((log: any) => ({
        log_id: log.log_id,
        inventory_id: null, // Dispatch logs might not have inventory_id
        user: {
          first_name: log.user?.first_name || log.dispatched_by_name?.split(' ')[0] || "User",
          last_name: log.user?.last_name || log.dispatched_by_name?.split(' ').slice(1).join(' ') || "",
        },
        product: log.product,
        movement_type: log.movement_type,
        quantity_change: log.quantity_change,
        package_change: log.package_change,
        weight_change: log.weight_change,
        volume_change: log.volume_change,
        warehouseCell: log.cell ? {
          row: log.cell.row,
          bay: log.cell.bay,
          position: log.cell.position,
        } : null,
        warehouse: log.warehouse,
        entry_order: null,
        departure_order: log.departure_order,
        departure_order_id: log.departure_order_id,
        entry_order_id: null,
        product_status: log.product_status,
        status_code: log.status_code,
        quality_status: null,
        timestamp: log.timestamp,
        notes: log.notes || null,
        cell_reference: log.cell_reference,
        // Additional dispatch-specific data
        dispatched_quantity: log.dispatched_quantity,
        dispatched_weight: log.dispatched_weight,
        dispatcher_name: log.dispatcher_name,
        customer_name: log.customer_name,
        client_name: log.client_name,
      }));

      // ✅ Combine all movement logs
      const allMovementLogs = [...inventoryMovementLogs, ...dispatchMovementLogs];

      // Sort by timestamp (newest first)
      allMovementLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setInventoryLogs(allMovementLogs);

      // ✅ Store additional data in state for enhanced UI
      setInventorySummaryStats(summaryStats);
      setCurrentInventoryItems(currentInventory);
      setDispatchHistoryLogs(dispatchHistory);
      setCompletedDepartureOrders(completedOrders);
      setFiltersApplied(responseData.filters_applied || {});
      setLastGeneratedAt(responseData.generated_at || new Date().toISOString());

      const enhancedData = {
        logs: allMovementLogs,
        summaryStats,
        currentInventory,
        dispatchHistory,
        completedOrders,
        filtersApplied: responseData.filters_applied || {},
        generatedAt: responseData.generated_at || new Date().toISOString(),
      };

      return enhancedData;
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

  // ✅ UPDATED: Fetch available cells for specific warehouse with optional entry_order_id
  fetchAvailableCells: async (warehouseId: string, entryOrderId?: string) => {
    try {
      startLoader("inventoryLogs/fetch-cells");
      
      // Build the URL with query parameters
      let url = `${warehouseURL}/${warehouseId}/available-cells`;
      const params = new URLSearchParams();
      
      if (entryOrderId) {
        params.append('entry_order_id', entryOrderId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await api.get(url);
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
        cellReference: `${c.row}.${String(c.bay).padStart(2, "0")}.${String(c.position).padStart(2, "0")}`,
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
          : undefined,
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

  // ✅ NEW: Get cells by quality status for proper role mapping
  fetchCellsByQualityStatus: async (qualityStatus: QualityControlStatus, warehouseId: string, entryOrderId?: string) => {
    try {
      startLoader("inventoryLogs/fetch-cells-by-quality-status");
      
      console.log("🔄 Fetching cells by quality status:", { qualityStatus, warehouseId, entryOrderId });
      
      // For APROBADO status, fetch general available cells instead of special purpose cells
      const apiEndpoint = qualityStatus === QualityControlStatus.APROBADO 
        ? `${warehouseURL}/${warehouseId}/available-cells`
        : `${baseURL}/cells-by-quality-status`;
      
      const apiParams = qualityStatus === QualityControlStatus.APROBADO
        ? { 
            // Always add entry_order_id parameter for warehouse staff filtering
            entry_order_id: entryOrderId || ''
          }
        : {
            quality_status: qualityStatus,
            warehouse_id: warehouseId
          };

      const response = await api.get(apiEndpoint, {
        params: apiParams
      });
      
      const responseData = response.data.data || response.data;
      
      // ✅ FIXED: Extract cells array from the response data structure
      // For APROBADO (general cells), the response is directly an array
      // For special purpose cells, the response has a cells property
      const cells = qualityStatus === QualityControlStatus.APROBADO 
        ? responseData 
        : (responseData.cells || responseData);
      
      // ✅ FIXED: Ensure we always return an array
      const rawCells = Array.isArray(cells) ? cells : [];
      
      // ✅ FIXED: Transform backend cell format to match CellGrid component expectations
      const transformedCells: Cell[] = rawCells.map((c: any) => ({
        cell_id: c.id,
        warehouse_id: c.warehouse?.warehouse_id || c.warehouse_id || warehouseId,
        row: c.row,
        bay: c.bay,
        position: c.position,
        cellReference: `${c.row}.${String(c.bay).padStart(2, "0")}.${String(c.position).padStart(2, "0")}`,
        capacity: Number(c.capacity || 0),
        currentUsage: Number(c.currentUsage || 0),
        status: c.status as "AVAILABLE" | "OCCUPIED" | "DAMAGED" | "EXPIRED",
        cell_role: c.cell_role,
        cellKind: c.kind,
      }));
      
      console.log("✅ Cells by quality status response:", {
        qualityStatus,
        warehouseId,
        responseStructure: responseData,
        rawCellsCount: rawCells.length,
        transformedCellsCount: transformedCells.length,
        firstFewRawCells: rawCells.slice(0, 3).map(c => ({
          id: c.id,
          row: c.row,
          bay: c.bay,
          position: c.position,
          cell_reference: c.cell_reference,
          cell_role: c.cell_role,
          status: c.status
        })),
        firstFewTransformedCells: transformedCells.slice(0, 3).map(c => ({
          cell_id: c.cell_id,
          row: c.row,
          bay: c.bay,
          position: c.position,
          cellReference: c.cellReference,
          cell_role: c.cell_role,
          status: c.status
        }))
      });
      
      return transformedCells;
    } catch (error) {
      console.error("❌ Fetch cells by quality status error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-cells-by-quality-status");
    }
  },

  // ✅ ENHANCED: Transition inventory quality status with cell role validation
  transitionQualityStatus: async (transitionData: {
    allocation_id: string;
    to_status: QualityControlStatus;
    quantity_to_move: number;
    package_quantity_to_move: number;
    weight_to_move: number;
    volume_to_move: number;
    reason: string;
    notes?: string;
    new_cell_id?: string; // Required for transitions to special purpose cells (V, T, R rows)
  }) => {
    try {
      startLoader("inventoryLogs/quality-transition");

      const userId = localStorage.getItem("id");
      if (!userId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      // ✅ Enhanced payload with cell transition support
      const payload = {
        ...transitionData,
        performed_by: userId,
      };

      console.log("=== ENHANCED QUALITY TRANSITION ===");
      console.log("URL:", `${baseURL}/quality-transition`);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("Quality Status Mapping:", {
        from: "Current cell",
        to: transitionData.to_status,
        requiresCellMove: ["DEVOLUCIONES", "CONTRAMUESTRAS", "RECHAZADOS"].includes(transitionData.to_status),
        newCellId: transitionData.new_cell_id
      });

      const response = await api.post(`${baseURL}/quality-transition`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Enhanced quality transition successful:", response.data);

      const data = response.data.data || response.data;
      return data;
    } catch (error: any) {
      console.error("❌ Enhanced quality transition failed:", error);
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

  // ✅ NEW: Simplified Allocation Flow - Step 1: Get allocation helper data
  fetchAllocationHelper: async (entryOrderId: string) => {
    try {
      startLoader("inventoryLogs/fetch-allocation-helper");
      
      console.log("🔄 Attempting to fetch allocation helper for entry order:", entryOrderId);
      
      // Try the new endpoint first
      try {
        const response = await api.get(`${baseURL}/entry-order/${entryOrderId}/allocation-helper`);
        const data = response.data.data || response.data;
        console.log("✅ Allocation helper data received:", data);
        return data;
      } catch (newEndpointError) {
        console.warn("⚠️ New allocation helper endpoint not available, using fallback...");
        
        // Fallback: Use existing endpoints to construct allocation helper data
        const [entryOrderResponse, warehousesResponse] = await Promise.all([
          api.get(`${baseURL}/approved-entry-orders`),
          api.get(`${warehouseURL}`)
        ]);
        
        const entryOrders = entryOrderResponse.data.data || entryOrderResponse.data;
        const selectedOrder = entryOrders.find((order: any) => order.entry_order_id === entryOrderId);
        
        if (!selectedOrder) {
          throw new Error("Entry order not found");
        }
        
        // Get products for this entry order
        const productsResponse = await api.get(`${baseURL}/entry-order/${entryOrderId}/products`);
        const products = productsResponse.data.products || productsResponse.data.data || productsResponse.data;
        
        const warehouses = warehousesResponse.data.data || warehousesResponse.data;
        
        // Get available cells for each warehouse
        const warehousesWithCells = await Promise.all(
          warehouses.map(async (warehouse: any) => {
            try {
              const cellsResponse = await api.get(`${warehouseURL}/${warehouse.warehouse_id}/cells`);
              const cells = cellsResponse.data.data || cellsResponse.data;
              
              const available_cells = cells
                .filter((cell: any) => cell.status === 'AVAILABLE')
                .map((cell: any) => ({
                  cell_id: cell.id,
                  cell_reference: `${cell.row}.${String(cell.bay).padStart(2, '0')}.${String(cell.position).padStart(2, '0')}`,
                  row: cell.row,
                  bay: cell.bay,
                  position: cell.position,
                  capacity: Number(cell.capacity),
                  available_capacity: Number(cell.capacity) - Number(cell.currentUsage || 0),
                  capacity_percentage: Number(cell.currentUsage || 0) / Number(cell.capacity) * 100,
                  status: cell.status
                }));
              
              return {
                warehouse_id: warehouse.warehouse_id,
                name: warehouse.name,
                available_cells
              };
            } catch (error) {
              console.warn(`Failed to fetch cells for warehouse ${warehouse.warehouse_id}:`, error);
              return {
                warehouse_id: warehouse.warehouse_id,
                name: warehouse.name,
                available_cells: []
              };
            }
          })
        );
        
        // Construct fallback allocation helper response
        const fallbackData = {
          can_proceed: true,
          entry_order: {
            entry_order_id: selectedOrder.entry_order_id,
            entry_order_no: selectedOrder.entry_order_no,
            organisation_name: selectedOrder.organisation_name,
            created_by: selectedOrder.created_by || "System",
            registration_date: selectedOrder.registration_date || new Date().toISOString()
          },
          products: products.map((product: any) => ({
            entry_order_product_id: product.entry_order_product_id,
            product: {
              product_id: product.product?.product_id || product.product_id,
              product_code: product.product?.product_code || product.product_code,
              name: product.product?.name || product.product_name
            },
            serial_number: product.serial_number || "",
            lot_series: product.lot_series || "",
            total_quantity: Number(product.inventory_quantity || 0),
            total_packages: Number(product.package_quantity || 0),
            total_weight: Number(product.weight_kg || 0),
            remaining_quantity: Number(product.remaining_quantity || product.inventory_quantity || 0),
            remaining_packages: Number(product.remaining_packaging_qty || product.package_quantity || 0),
            remaining_weight: Number(product.remaining_weight || product.weight_kg || 0),
            presentation: product.presentation || "PALETA",
            supplier_name: product.supplier?.name || product.supplier_name || "Unknown"
          })),
          warehouses: warehousesWithCells,
          allocation_constraints: {
            client_requirements: undefined,
            temperature_control: false,
            special_handling: undefined
          },
          validation_summary: {
            blocking_issues: [],
            warnings: [],
            recommendations: []
          }
        };
        
        console.log("✅ Fallback allocation helper data constructed:", fallbackData);
        return fallbackData;
      }
    } catch (error) {
      console.error("❌ Fetch allocation helper error:", error);
      throw error;
    } finally {
      stopLoader("inventoryLogs/fetch-allocation-helper");
    }
  },

  // ✅ NEW: Simplified Allocation Flow - Step 2: Bulk assign entry order
  bulkAssignEntryOrder: async (request: {
    entry_order_id: string;
    allocations: Array<{
      entry_order_product_id: string;
      cell_id: string;
      warehouse_id: string;
      inventory_quantity: number;
      package_quantity: number;
      weight_kg: number;
      volume_m3: number;
      presentation: string;
      product_status: string;
      status_code: number;
      guide_number?: string;
      observations?: string;
    }>;
    notes?: string;
    force_complete_allocation: boolean;
  }) => {
    try {
      startLoader("inventoryLogs/bulk-assign");

      // Get user ID from localStorage
      const userId = localStorage.getItem("id");
      if (!userId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      // Create payload with user information
      const payload = {
        ...request,
        assigned_by: userId,
        organisation_id: localStorage.getItem("organisation_id"),
      };

      console.log("=== BULK ALLOCATION REQUEST ===");
      console.log("URL:", `${baseURL}/bulk-assign-entry-order`);
      console.log("Method: POST");
      console.log("Content-Type: application/json");
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("=== END PAYLOAD ===");

      // Try the new bulk endpoint first
      try {
        const response = await api.post(`${baseURL}/bulk-assign-entry-order`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("✅ Bulk allocation successful:", response.data);
        const data = response.data.data || response.data;
        return data;
      } catch (bulkEndpointError) {
        console.warn("⚠️ Bulk allocation endpoint not available, using fallback individual assignments...");
        
        // Fallback: Use existing assignProductToCell for each allocation
        const results = [];
        let successCount = 0;
        let errorCount = 0;
        
        for (const allocation of request.allocations) {
          try {
            console.log(`🔄 Processing allocation ${successCount + 1}/${request.allocations.length}:`, allocation);
            
            const assignmentPayload = {
              entry_order_product_id: allocation.entry_order_product_id,
              cell_id: allocation.cell_id,
              inventory_quantity: allocation.inventory_quantity,
              package_quantity: allocation.package_quantity,
              quantity_pallets: 0, // Default value
              presentation: allocation.presentation,
              weight_kg: allocation.weight_kg,
              volume_m3: allocation.volume_m3,
              guide_number: allocation.guide_number,
              product_status: allocation.product_status,
              uploaded_documents: null, // No file upload in bulk
              observations: allocation.observations,
              warehouse_id: allocation.warehouse_id,
            };
            
            // Use the existing assignProductToCell method
            const result = await InventoryLogService.assignProductToCell(assignmentPayload);
            results.push(result);
            successCount++;
            
            console.log(`✅ Allocation ${successCount} successful:`, result);
            
          } catch (allocationError) {
            console.error(`❌ Allocation ${successCount + errorCount + 1} failed:`, allocationError);
            errorCount++;
            
            // If this is a critical error, we might want to stop
            if (errorCount > request.allocations.length / 2) {
              throw new Error(`Too many allocation failures (${errorCount}/${request.allocations.length}). Stopping bulk operation.`);
            }
          }
        }
        
        // Construct fallback response
        const fallbackResponse = {
          allocations_created: successCount,
          cells_occupied: successCount, // Assume 1 cell per allocation
          allocation_percentage: (successCount / request.allocations.length) * 100,
          is_fully_allocated: successCount === request.allocations.length,
          warehouses_used: [...new Set(request.allocations.map(a => a.warehouse_id))].length,
          message: `Successfully allocated ${successCount} out of ${request.allocations.length} items using fallback method.`,
          results: results
        };
        
        console.log("✅ Fallback bulk allocation completed:", fallbackResponse);
        
        if (errorCount > 0) {
          console.warn(`⚠️ ${errorCount} allocations failed during bulk operation`);
        }
        
        return fallbackResponse;
      }
    } catch (error: any) {
      console.error("❌ Bulk allocation failed:", error);

      // Enhanced error handling
      let errorMessage = "Failed to submit bulk allocation. Please try again.";

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
      stopLoader("inventoryLogs/bulk-assign");
    }
  },
};

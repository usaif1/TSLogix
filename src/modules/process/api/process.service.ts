import api from "@/lib/api";
import ProcessesStore from "@/modules/process/store";
import { EntryOrder, EntryFormFields, EntryOrderReview } from "../types";

const entryBaseURL = "/api/entry";
const departureBaseURL = "/api/departure";
const inventoryBaseURL = "/api/inventory";
const warehouseBaseURL = "/api/warehouses";

export const ProcessService = {
  // =====================================
  // ENTRY ORDER FORM FIELDS
  // =====================================

  /**
   * Fetch entry form fields for new flow
   */
  fetchEntryFormFields: async () => {
    const { startLoader, stopLoader, setEntryFormFields } = ProcessesStore.getState();
    startLoader("processes/load-form-fields");
    
    try {
      const response = await api.get(`${entryBaseURL}/entry-formfields`);
      const formFields: EntryFormFields = response.data;
      
      setEntryFormFields(formFields);
      console.log("Entry form fields loaded:", formFields);
      return formFields;
    } catch (error) {
      console.error("Failed to fetch entry form fields:", error);
      throw new Error("Failed to fetch form fields");
    } finally {
      stopLoader("processes/load-form-fields");
    }
  },

  /**
   * Get current entry order number
   */
  getCurrentEntryOrderNo: async () => {
    try {
      const response = await api.get(`${entryBaseURL}/current-order-number`);
      const { setCurrentEntryOrderNo } = ProcessesStore.getState();
      setCurrentEntryOrderNo(response.data.order_number);
      return response.data.order_number;
    } catch (error) {
      console.error("Failed to get current entry order number:", error);
      throw error;
    }
  },

  // =====================================
  // ENTRY ORDER CREATION (Customer)
  // =====================================

  /**
   * Create new entry order - Customer creates and sends for review
   */
  createNewEntryOrder: async (formData: any) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/create-entry-order");

    try {
      const payload = {
        ...formData,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
      };

      // Validate products array
      if (!payload.products || !Array.isArray(payload.products) || payload.products.length === 0) {
        throw new Error("At least one product is required");
      }

      // Validate each product has required fields for new schema
      for (const product of payload.products) {
        if (!product.product_id) throw new Error("Product selection is required for all products");
        if (!product.supplier_id) throw new Error("Supplier is required for all products");
        if (!product.inventory_quantity || product.inventory_quantity <= 0) {
          throw new Error("Inventory quantity must be greater than 0 for all products");
        }
        if (!product.package_quantity || product.package_quantity <= 0) {
          throw new Error("Package quantity must be greater than 0 for all products");
        }
        if (!product.weight_kg || product.weight_kg <= 0) {
          throw new Error("Weight must be greater than 0 for all products");
        }
        if (!product.serial_number) throw new Error("Serial number is required for all products");
        if (!product.lot_series) throw new Error("Lot series is required for all products");
        if (!product.guide_number) throw new Error("Guide number is required for all products");
      }

      console.log("Creating entry order with payload:", payload);
      
      const response = await api.post(`${entryBaseURL}/create-entry-order`, payload);
      
      setSubmitStatus({
        success: true,
        message: "Entry order created successfully and sent for admin review",
      });

      return response.data;
    } catch (error: any) {
      console.error("Failed to create entry order:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create entry order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/create-entry-order");
    }
  },

  // =====================================
  // ENTRY ORDER LISTING & DETAILS
  // =====================================

  /**
   * Fetch all entry orders with filtering
   */
  fetchEntryOrders: async (filters?: { 
    status?: string; 
    organisationId?: string; 
    orderNo?: string;
    reviewStatus?: string;
    warehouseId?: string;
  }) => {
    const { startLoader, stopLoader, setEntryOrders } = ProcessesStore.getState();
    startLoader("processes/fetch-entry-orders");

    try {
      const params = new URLSearchParams();
      if (filters?.organisationId) params.append("organisationId", filters.organisationId);
      if (filters?.orderNo) params.append("orderNo", filters.orderNo);
      if (filters?.reviewStatus) params.append("reviewStatus", filters.reviewStatus);
      if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId);

      const response = await api.get(`${entryBaseURL}/entry-orders?${params.toString()}`);
      const orders: EntryOrder[] = response.data.data;

      setEntryOrders(orders);
      return orders;
    } catch (error) {
      console.error("Failed to fetch entry orders:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-entry-orders");
    }
  },

  /**
   * Fetch single entry order by order number
   */
  fetchEntryOrderByNo: async (orderNo: string) => {
    const { startLoader, stopLoader, setCurrentEntryOrder } = ProcessesStore.getState();
    startLoader("processes/fetch-entry-order");

    try {
      const organisationId = localStorage.getItem("organisation_id");
      const endpoint = `${entryBaseURL}/entry-order/${encodeURIComponent(orderNo)}`;
      const params = organisationId ? `?organisationId=${organisationId}` : "";
      
      const response = await api.get(`${endpoint}${params}`);
      const order: EntryOrder = response.data.data;

      setCurrentEntryOrder(order);
      return order;
    } catch (error) {
      console.error("Failed to fetch entry order:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-entry-order");
    }
  },

  // =====================================
  // ADMIN REVIEW WORKFLOW
  // =====================================

  /**
   * Fetch pending entry orders for admin review
   */
  fetchPendingEntryOrders: async (searchNo?: string) => {
    const { startLoader, stopLoader, setPendingEntryOrders } = ProcessesStore.getState();
    startLoader("processes/fetch-pending-orders");

    try {
      const organisationId = localStorage.getItem("organisation_id");
      const params = new URLSearchParams();
      if (organisationId) params.append("organisationId", organisationId);
      if (searchNo) params.append("searchNo", searchNo);

      const response = await api.get(`${entryBaseURL}/entry-orders/status/PENDING?${params.toString()}`);
      const orders: EntryOrder[] = response.data.data;

      setPendingEntryOrders(orders);
      return orders;
    } catch (error) {
      console.error("Failed to fetch pending entry orders:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-pending-orders");
    }
  },

  /**
   * Review entry order (Admin function)
   * Admin can approve/reject and assign warehouse
   */
  reviewEntryOrder: async (orderNo: string, reviewData: EntryOrderReview) => {
    const { startLoader, stopLoader, setReviewStatus } = ProcessesStore.getState();
    startLoader("processes/review-entry-order");

    try {
      const payload = {
        ...reviewData,
        reviewed_by: localStorage.getItem("id"),
        reviewed_at: new Date().toISOString(),
      };

      // Validate required fields
      if (!payload.review_status) {
        throw new Error("Review status is required");
      }

      if (payload.review_status === "APPROVED" && !payload.warehouse_id) {
        throw new Error("Warehouse assignment is required for approval");
      }

      const response = await api.put(`${entryBaseURL}/entry-order/${orderNo}/review`, payload);
      
      setReviewStatus({
        success: true,
        message: `Entry order ${reviewData.review_status.toLowerCase()} successfully`,
      });

      // Refresh the pending orders list
      await ProcessService.fetchPendingEntryOrders();

      return response.data;
    } catch (error: any) {
      console.error("Failed to review entry order:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to review entry order";
      setReviewStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/review-entry-order");
    }
  },

  // =====================================
  // WAREHOUSE ALLOCATION WORKFLOW
  // =====================================

  /**
   * Fetch approved entry orders for warehouse allocation
   */
  fetchApprovedEntryOrders: async (searchNo?: string) => {
    const { startLoader, stopLoader, setApprovedEntryOrders } = ProcessesStore.getState();
    startLoader("processes/fetch-approved-orders");

    try {
      const organisationId = localStorage.getItem("organisation_id");
      const params = new URLSearchParams();
      if (organisationId) params.append("organisationId", organisationId);
      if (searchNo) params.append("searchNo", searchNo);

      const response = await api.get(`${entryBaseURL}/entry-orders/approved?${params.toString()}`);
      const orders: EntryOrder[] = response.data.data;

      setApprovedEntryOrders(orders);
      return orders;
    } catch (error) {
      console.error("Failed to fetch approved entry orders:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-approved-orders");
    }
  },

  /**
   * Allocate inventory to approved entry order
   */
  allocateInventoryToEntryOrder: async (orderNo: string, allocations: any[]) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/allocate-inventory");

    try {
      const payload = {
        allocations,
        allocated_by: localStorage.getItem("id"),
        allocated_at: new Date().toISOString(),
      };

      const response = await api.post(`${entryBaseURL}/entry-order/${orderNo}/allocate`, payload);

      // Refresh approved orders list
      await ProcessService.fetchApprovedEntryOrders();

      return response.data;
    } catch (error: any) {
      console.error("Failed to allocate inventory:", error);
      throw new Error(error.response?.data?.message || "Failed to allocate inventory");
    } finally {
      stopLoader("processes/allocate-inventory");
    }
  },

  // =====================================
  // WAREHOUSE MANAGEMENT
  // =====================================

  /**
   * Fetch warehouses
   */
  fetchWarehouses: async () => {
    const { startLoader, stopLoader, setWarehouses } = ProcessesStore.getState();
    startLoader("processes/fetch-warehouses");

    try {
      const response = await api.get(`${warehouseBaseURL}`);
      const warehouses = response.data.data || response.data;
      setWarehouses(warehouses);
      return warehouses;
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-warehouses");
    }
  },

  /**
   * Fetch warehouse cells for allocation
   */
  fetchWarehouseCells: async (warehouseId: string, filters?: { 
    available?: boolean; 
    temperatureRange?: string;
    minCapacity?: number;
  }) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-warehouse-cells");

    try {
      const params = new URLSearchParams();
      if (filters?.available) params.append("available", "true");
      if (filters?.temperatureRange) params.append("temperatureRange", filters.temperatureRange);
      if (filters?.minCapacity) params.append("minCapacity", filters.minCapacity.toString());

      const response = await api.get(`${warehouseBaseURL}/${warehouseId}/cells?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch warehouse cells:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-warehouse-cells");
    }
  },

  // =====================================
  // DEPARTURE ORDERS (Existing functionality)
  // =====================================

  /**
   * Load departure form fields
   */
  loadDepartureFormFields: async () => {
    const { startLoader, stopLoader, setDepartureFormFields } = ProcessesStore.getState();
    startLoader("processes/load-departure-form-fields");

    try {
      const response = await api.get(`${departureBaseURL}/departure-formfields`);
      const formFields = response.data;
      setDepartureFormFields(formFields);
      return formFields;
    } catch (error) {
      console.error("Failed to load departure form fields:", error);
      throw error;
    } finally {
      stopLoader("processes/load-departure-form-fields");
    }
  },

  /**
   * Fetch departure orders
   */
  fetchDepartureOrders: async (filters?: { organisationId?: string; orderNo?: string }) => {
    const { startLoader, stopLoader, setDepartureOrders } = ProcessesStore.getState();
    startLoader("processes/fetch-departure-orders");

    try {
      const params = new URLSearchParams();
      if (filters?.organisationId) params.append("organisationId", filters.organisationId);
      if (filters?.orderNo) params.append("orderNo", filters.orderNo);

      const response = await api.get(`${departureBaseURL}/departure-orders?${params.toString()}`);
      const orders = response.data.data;
      setDepartureOrders(orders);
      return orders;
    } catch (error) {
      console.error("Failed to fetch departure orders:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-departure-orders");
    }
  },

  /**
   * Create departure order with inventory selections
   */
  createDepartureOrderWithInventorySelections: async (formData: any) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/submit-departure");

    try {
      const payload = {
        ...formData,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
      };

      // Validate inventory selections
      if (!payload.inventory_selections || payload.inventory_selections.length === 0) {
        throw new Error("At least one inventory selection is required");
      }

      const response = await api.post(`${departureBaseURL}/create-departure-order`, payload);

      setSubmitStatus({
        success: true,
        message: "Departure order created successfully",
      });

      return response.data;
    } catch (error: any) {
      console.error("Failed to create departure order:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to create departure order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/submit-departure");
    }
  },

  // =====================================
  // INVENTORY MANAGEMENT
  // =====================================

  /**
   * Load products with inventory for departure orders
   */
  loadProductsWithInventory: async (warehouseId: string) => {
    const { startLoader, stopLoader, setProductsWithInventory } = ProcessesStore.getState();
    startLoader("processes/load-products-inventory");

    try {
      const response = await api.get(`${inventoryBaseURL}/products-with-inventory/${warehouseId}`);
      const products = response.data.data;
      setProductsWithInventory(products);
      return products;
    } catch (error) {
      console.error("Failed to load products with inventory:", error);
      throw error;
    } finally {
      stopLoader("processes/load-products-inventory");
    }
  },

  /**
   * Load available cells for entry product
   */
  loadAvailableCellsForEntryProduct: async (productId: string, warehouseId: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/load-cells");

    try {
      const response = await api.get(
        `${inventoryBaseURL}/available-cells/${productId}?warehouseId=${warehouseId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to load available cells:", error);
      throw error;
    } finally {
      stopLoader("processes/load-cells");
    }
  },

  /**
   * Validate cell selection for inventory allocation
   */
  validateCellSelection: async (cellId: string, productId: string, requestedQuantity: number) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/validate-cell");

    try {
      const response = await api.post(`${inventoryBaseURL}/validate-cell`, {
        cellId,
        productId,
        requestedQuantity,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to validate cell selection:", error);
      throw error;
    } finally {
      stopLoader("processes/validate-cell");
    }
  },

  // =====================================
  // UTILITY FUNCTIONS
  // =====================================

  /**
   * Clear review status
   */
  clearReviewStatus: () => {
    const { clearReviewStatus } = ProcessesStore.getState();
    clearReviewStatus();
  },

  /**
   * Clear inventory state
   */
  clearInventoryState: () => {
    const { clearInventoryState } = ProcessesStore.getState();
    clearInventoryState();
  },

  /**
   * Clear cell state
   */
  clearCellState: () => {
    const { clearCellState } = ProcessesStore.getState();
    clearCellState();
  },

  /**
   * Get order statistics for dashboard
   */
  getOrderStatistics: async () => {
    try {
      const organisationId = localStorage.getItem("organisation_id");
      const response = await api.get(`${entryBaseURL}/statistics?organisationId=${organisationId}`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch order statistics:", error);
      throw error;
    }
  },

  /**
   * Export entry orders to CSV/Excel
   */
  exportEntryOrders: async (filters?: any) => {
    try {
      const params = new URLSearchParams();
      if (filters?.organisationId) params.append("organisationId", filters.organisationId);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);
      if (filters?.reviewStatus) params.append("reviewStatus", filters.reviewStatus);

      const response = await api.get(`${entryBaseURL}/export?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `entry_orders_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Failed to export entry orders:", error);
      throw error;
    }
  },

  /**
   * Get entry order audit trail
   */
  getEntryOrderAuditTrail: async (orderNo: string) => {
    try {
      const response = await api.get(`${entryBaseURL}/entry-order/${orderNo}/audit-trail`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch audit trail:", error);
      throw error;
    }
  },
};

export default ProcessService;
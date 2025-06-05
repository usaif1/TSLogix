/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import ProcessesStore from "@/modules/process/store";
import { EntryOrder, EntryFormFields, EntryOrderReview, InventorySelection } from "../types";

const entryBaseURL = "/entry";
const departureBaseURL = "/departure";
const inventoryBaseURL = "/inventory";
const warehouseBaseURL = "/warehouses";

// Define interfaces for better type safety
interface ReviewPayload extends Omit<EntryOrderReview, 'reviewed_at'> {
  reviewed_by: string | undefined;
  reviewed_at: string;
}

interface AllocationData {
  entry_order_product_id: string;
  cell_id: string;
  allocated_quantity: number;
  observations?: string;
}

interface DepartureFormData {
  customer_id: string;
  warehouse_id: string;
  departure_date: string;
  document_type_id: string;
  document_number: string;
  inventory_selections: InventorySelection[];
  [key: string]: unknown;
}

interface WarehouseCellFilters {
  available?: boolean;
  temperatureRange?: string;
  minCapacity?: number;
}

interface ExportFilters {
  organisationId?: string;
  dateFrom?: string;
  dateTo?: string;
  reviewStatus?: string;
}

interface EntryOrderFormData {
  // Entry order level data
  entry_order_no: string;
  origin_id: string;
  document_type_id: string;
  registration_date: Date;
  document_date: Date;
  entry_date_time: Date;
  created_by: string | null;
  organisation_id: string | null;
  order_status: string;
  total_volume: number;
  total_weight: number;
  cif_value: number | null;
  total_pallets: number;
  observation: string;
  uploaded_documents: string | null;
  
  // Products array
  products: Array<{
    serial_number: string;
    supplier_id: string;
    product_code: string;
    product_id: string;
    lot_series: string;
    manufacturing_date: Date;
    expiration_date: Date;
    inventory_quantity: number;
    package_quantity: number;
    quantity_pallets: number | null;
    presentation: string;
    guide_number: string;
    weight_kg: number;
    volume_m3: number | null;
    insured_value: number | null;
    temperature_range: string;
    humidity: string;
    health_registration: string;
  }>;
}

export const ProcessService = {
  // =====================================
  // ENTRY ORDER FORM FIELDS
  // =====================================

  /**
   * Fetch entry form fields for new entry order creation
   * NOTE: Warehouses are NOT included here as they're not needed during entry order creation
   */
  fetchEntryFormFields: async () => {
    const { startLoader, stopLoader, setEntryFormFields } = ProcessesStore.getState();
    startLoader("processes/load-form-fields");
    
    try {
      const response = await api.get(`${entryBaseURL}/entry-formfields`);
      const formFields: EntryFormFields = response.data.data || response.data;
      
      // Transform data to consistent format for React Select
      const transformedFields = {
        ...formFields,
        origins: formFields.origins?.map(origin => ({
          value: origin.origin_id || origin.id,
          label: origin.name,
          option: origin.name
        })) || [],
        
        documentTypes: formFields.documentTypes?.map(doc => ({
          value: doc.document_type_id || doc.id,
          label: doc.name,
          option: doc.name
        })) || [],
        
        users: formFields.users?.map(user => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name}`,
          option: `${user.first_name} ${user.last_name}`
        })) || [],
        
        suppliers: formFields.suppliers?.map(supplier => ({
          value: supplier.supplier_id || supplier.id,
          label: supplier.name,
          option: supplier.name
        })) || [],
        
        products: formFields.products?.map(product => ({
          value: product.product_id || product.id,
          product_code: product.product_code,
          label: product.name,
          option: product.name
        })) || [],
        
        // Use the simpler temperature range options for UI
        temperatureRanges: formFields.temperatureRangeOptions?.map(temp => ({
          value: temp.value,
          label: temp.label,
          option: temp.label
        })) || [],
        
        orderStatusOptions: formFields.orderStatusOptions?.map(status => ({
          value: status.value,
          label: status.label,
          option: status.label
        })) || [],
        
        presentationOptions: formFields.presentationOptions?.map(pres => ({
          value: pres.value,
          label: pres.label,
          option: pres.label
        })) || []
      };
      
      setEntryFormFields(transformedFields);
      return transformedFields;
    } catch (error) {
      console.error("Failed to fetch entry form fields:", error);
      throw new Error("Failed to fetch form fields");
    } finally {
      stopLoader("processes/load-form-fields");
    }
  },

  /**
   * Get current entry order number for auto-generation
   */
  getCurrentEntryOrderNo: async () => {
    try {
      const organisationId = localStorage.getItem("organisation_id");
      const response = await api.get(`${entryBaseURL}/current-order-number?organisationId=${organisationId}`);
      const { setCurrentEntryOrderNo } = ProcessesStore.getState();
      const orderNumber = response.data?.currentOrderNo;
      setCurrentEntryOrderNo(orderNumber);
      return orderNumber;
    } catch (error) {
      console.error("Failed to get current entry order number:", error);
      throw error;
    }
  },

  // =====================================
  // ENTRY ORDER CREATION (Customer)
  // =====================================

  /**
   * Create new entry order - Customer creates and sends for admin review
   * NOTE: No warehouse assignment at this stage
   */
  createNewEntryOrder: async (formData: EntryOrderFormData) => {
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

      // Validate each product has required fields
      for (const [index, product] of payload.products.entries()) {
        const productNum = index + 1;
        
        if (!product.product_id) {
          throw new Error(`Product ${productNum}: Product selection is required`);
        }
        if (!product.supplier_id) {
          throw new Error(`Product ${productNum}: Supplier is required`);
        }
        if (!product.serial_number?.trim()) {
          throw new Error(`Product ${productNum}: Serial number is required`);
        }
        if (!product.lot_series?.trim()) {
          throw new Error(`Product ${productNum}: Lot series is required`);
        }
        if (!product.guide_number?.trim()) {
          throw new Error(`Product ${productNum}: Guide number is required`);
        }
        if (!product.inventory_quantity || product.inventory_quantity <= 0) {
          throw new Error(`Product ${productNum}: Inventory quantity must be greater than 0`);
        }
        if (!product.package_quantity || product.package_quantity <= 0) {
          throw new Error(`Product ${productNum}: Package quantity must be greater than 0`);
        }
        if (!product.weight_kg || product.weight_kg <= 0) {
          throw new Error(`Product ${productNum}: Weight must be greater than 0`);
        }
        if (!product.manufacturing_date) {
          throw new Error(`Product ${productNum}: Manufacturing date is required`);
        }
        if (!product.expiration_date) {
          throw new Error(`Product ${productNum}: Expiration date is required`);
        }
        
        // Validate dates
        if (new Date(product.manufacturing_date) >= new Date(product.expiration_date)) {
          throw new Error(`Product ${productNum}: Expiration date must be after manufacturing date`);
        }
      }

      const response = await api.post(`${entryBaseURL}/create-entry-order`, payload);
      
      setSubmitStatus({
        success: true,
        message: "Entry order created successfully and sent for admin review",
      });

      // Refresh entry orders list if needed
      try {
        await ProcessService.fetchEntryOrders({ 
          organisationId: localStorage.getItem("organisation_id") || undefined 
        });
      } catch (refreshError) {
        console.warn("Failed to refresh entry orders list:", refreshError);
      }

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

  updateEntryOrder: async (orderNo: string, formData: any) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/update-entry-order");
  
    try {
      const payload = {
        ...formData,
        organisation_id: localStorage.getItem("organisation_id"),
        updated_by: localStorage.getItem("id"),
      };
  
      // Validate products array
      if (!payload.products || !Array.isArray(payload.products) || payload.products.length === 0) {
        throw new Error("At least one product is required");
      }
  
      // Validate each product has required fields
      for (const [index, product] of payload.products.entries()) {
        const productNum = index + 1;
        
        if (!product.product_id) {
          throw new Error(`Product ${productNum}: Product selection is required`);
        }
        if (!product.supplier_id) {
          throw new Error(`Product ${productNum}: Supplier is required`);
        }
        if (!product.serial_number?.trim()) {
          throw new Error(`Product ${productNum}: Serial number is required`);
        }
        if (!product.lot_series?.trim()) {
          throw new Error(`Product ${productNum}: Lot series is required`);
        }
        if (!product.guide_number?.trim()) {
          throw new Error(`Product ${productNum}: Guide number is required`);
        }
        if (!product.inventory_quantity || product.inventory_quantity <= 0) {
          throw new Error(`Product ${productNum}: Inventory quantity must be greater than 0`);
        }
        if (!product.package_quantity || product.package_quantity <= 0) {
          throw new Error(`Product ${productNum}: Package quantity must be greater than 0`);
        }
        if (!product.weight_kg || product.weight_kg <= 0) {
          throw new Error(`Product ${productNum}: Weight must be greater than 0`);
        }
        if (!product.manufacturing_date) {
          throw new Error(`Product ${productNum}: Manufacturing date is required`);
        }
        if (!product.expiration_date) {
          throw new Error(`Product ${productNum}: Expiration date is required`);
        }
        
        // Validate dates
        if (new Date(product.manufacturing_date) >= new Date(product.expiration_date)) {
          throw new Error(`Product ${productNum}: Expiration date must be after manufacturing date`);
        }
      }
  
      const response = await api.put(`${entryBaseURL}/entry-order/${orderNo}/update`, payload);
      
      setSubmitStatus({
        success: true,
        message: "Entry order updated successfully and sent for review",
      });
  
      // Refresh entry orders list if needed
      try {
        await ProcessService.fetchEntryOrders({ 
          organisationId: localStorage.getItem("organisation_id") || undefined 
        });
      } catch (refreshError) {
        console.warn("Failed to refresh entry orders list:", refreshError);
      }
  
      return response.data;
    } catch (error: any) {
      console.error("Failed to update entry order:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to update entry order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/update-entry-order");
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
  }) => {
    const { startLoader, stopLoader, setEntryOrders } = ProcessesStore.getState();
    startLoader("processes/fetch-entry-orders");

    try {
      const params = new URLSearchParams();
      if (filters?.organisationId) params.append("organisationId", filters.organisationId);
      if (filters?.orderNo) params.append("orderNo", filters.orderNo);
      if (filters?.reviewStatus) params.append("reviewStatus", filters.reviewStatus);
      if (filters?.status) params.append("status", filters.status);

      const response = await api.get(`${entryBaseURL}/entry-orders?${params.toString()}`);
      const orders: EntryOrder[] = response.data.data || response.data;

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
      const order: EntryOrder = response.data.data || response.data;

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
      const orders: EntryOrder[] = response.data.data || response.data;

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
   * Admin can approve/reject but does NOT assign warehouse here
   */
  reviewEntryOrder: async (orderNo: string, reviewData: EntryOrderReview) => {
    const { startLoader, stopLoader, setReviewStatus } = ProcessesStore.getState();
    startLoader("processes/review-entry-order");

    try {
      const payload: ReviewPayload = {
        ...reviewData,
        reviewed_by: localStorage.getItem("id") ?? undefined,
        reviewed_at: new Date().toISOString(),
      };

      // Validate required fields
      if (!payload.review_status) {
        throw new Error("Review status is required");
      }

      if (!payload.review_comments?.trim()) {
        throw new Error("Review comments are required");
      }

      // NOTE: No warehouse assignment in review - this happens during cell allocation
      const response = await api.put(`${entryBaseURL}/entry-order/${orderNo}/review`, payload);
      
      setReviewStatus({
        success: true,
        message: `Entry order ${reviewData.review_status.toLowerCase()} successfully`,
      });

      // Refresh the pending orders list
      await ProcessService.fetchPendingEntryOrders();

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to review entry order:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to review entry order";
      
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
      const orders: EntryOrder[] = response.data.data || response.data;

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
   * Allocate inventory to approved entry order using specific cells
   * NOTE: Warehouse is determined by which cells are selected
   */
  allocateInventoryToEntryOrder: async (orderNo: string, allocations: AllocationData[]) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/allocate-inventory");

    try {
      // Validate allocations
      if (!allocations || allocations.length === 0) {
        throw new Error("At least one allocation is required");
      }

      for (const [index, allocation] of allocations.entries()) {
        if (!allocation.entry_order_product_id) {
          throw new Error(`Allocation ${index + 1}: Product is required`);
        }
        if (!allocation.cell_id) {
          throw new Error(`Allocation ${index + 1}: Cell selection is required`);
        }
        if (!allocation.allocated_quantity || allocation.allocated_quantity <= 0) {
          throw new Error(`Allocation ${index + 1}: Allocated quantity must be greater than 0`);
        }
      }

      const payload = {
        allocations,
        allocated_by: localStorage.getItem("id"),
        allocated_at: new Date().toISOString(),
      };

      const response = await api.post(`${entryBaseURL}/entry-order/${orderNo}/allocate`, payload);

      // Refresh approved orders list
      await ProcessService.fetchApprovedEntryOrders();

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to allocate inventory:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to allocate inventory";
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/allocate-inventory");
    }
  },

  // =====================================
  // WAREHOUSE MANAGEMENT (For Cell Allocation)
  // =====================================

  /**
   * Fetch warehouses - used only during cell allocation workflow
   */
  fetchWarehouses: async () => {
    const { startLoader, stopLoader, setWarehouses } = ProcessesStore.getState();
    startLoader("processes/fetch-warehouses");

    try {
      const response = await api.get(`${warehouseBaseURL}`);
      const warehouses = response.data.data || response.data;
      
      // Transform for consistent format
      const formattedWarehouses = warehouses.map((warehouse: any) => ({
        value: warehouse.warehouse_id || warehouse.id,
        label: `${warehouse.name} - ${warehouse.location}`,
        option: `${warehouse.name} - ${warehouse.location}`,
        ...warehouse
      }));
      
      setWarehouses(formattedWarehouses);
      return formattedWarehouses;
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
  fetchWarehouseCells: async (warehouseId: string, filters?: WarehouseCellFilters) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-warehouse-cells");

    try {
      const params = new URLSearchParams();
      if (filters?.available) params.append("available", "true");
      if (filters?.temperatureRange) params.append("temperatureRange", filters.temperatureRange);
      if (filters?.minCapacity) params.append("minCapacity", filters.minCapacity.toString());

      const response = await api.get(`${warehouseBaseURL}/${warehouseId}/cells?${params.toString()}`);
      const cells = response.data.data || response.data;
      
      // Transform for consistent format
      const formattedCells = cells.map((cell: any) => ({
        value: cell.cell_id || cell.id,
        label: `${cell.cell_code} - Available: ${cell.available_capacity}`,
        option: `${cell.cell_code} - Available: ${cell.available_capacity}`,
        ...cell
      }));
      
      return formattedCells;
    } catch (error) {
      console.error("Failed to fetch warehouse cells:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-warehouse-cells");
    }
  },

  /**
   * Load available cells for entry product during allocation
   */
  loadAvailableCellsForEntryProduct: async (productId: string, warehouseId: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/load-cells");

    try {
      const response = await api.get(
        `${inventoryBaseURL}/available-cells/${productId}?warehouseId=${warehouseId}`
      );
      const cells = response.data.data || response.data;
      
      return cells.map((cell: any) => ({
        value: cell.cell_id || cell.id,
        label: `${cell.cell_code} - Available: ${cell.available_capacity}`,
        option: `${cell.cell_code} - Available: ${cell.available_capacity}`,
        ...cell
      }));
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
      const orders = response.data.data || response.data;
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
  createDepartureOrderWithInventorySelections: async (formData: DepartureFormData) => {
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
    } catch (error: unknown) {
      console.error("Failed to create departure order:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to create departure order";
      
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
      const products = response.data.data || response.data;
      setProductsWithInventory(products);
      return products;
    } catch (error) {
      console.error("Failed to load products with inventory:", error);
      throw error;
    } finally {
      stopLoader("processes/load-products-inventory");
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
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to fetch order statistics:", error);
      throw error;
    }
  },

  /**
   * Export entry orders to CSV/Excel
   */
  exportEntryOrders: async (filters?: ExportFilters) => {
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
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to fetch audit trail:", error);
      throw error;
    }
  },
};

export default ProcessService;
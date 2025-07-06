/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import ProcessesStore from "@/modules/process/store";
import { EntryOrder, EntryFormFields, EntryOrderReview } from "../types";

const entryBaseURL = "/entry";
const departureBaseURL = "/departure";
// const inventoryBaseURL = "/inventory";
const warehouseBaseURL = "/warehouse";

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

// interface DepartureFormData {
//   customer_id: string;
//   warehouse_id: string;
//   departure_date: string;
//   document_type_id: string;
//   document_number: string;
//   inventory_selections: InventorySelection[];
//   [key: string]: unknown;
// }

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
        
        users: formFields.users?.map((user, index) => ({
          value: user.id || user.user_id || `user_${index}`,
          label: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${index + 1}`,
          option: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${index + 1}`
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
      const response = await api.get(`${warehouseBaseURL}/warehouses`);
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
        `${departureBaseURL}/cells-for-entry-product/${productId}?warehouseId=${warehouseId}`
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
      const response = await api.post(`${departureBaseURL}/validate-cell`, {
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
      const formFields = response.data.data || response.data;
      
      // Transform data to consistent format for React Select
      const transformedFields = {
        ...formFields,
        customers: formFields.customers?.map((customer: any) => ({
          value: customer.customer_id || customer.id,
          label: customer.name || customer.company_name,
          option: customer.name || customer.company_name
        })) || [],
        
        personnel: formFields.users?.map((user: any, index: number) => ({
          value: user.user_id || user.id || user.name || `user_${index}`,
          label: user.name,
          option: user.name
        })) || [],
        
        documentTypes: formFields.documentTypes?.map((doc: any) => ({
          value: doc.document_type_id || doc.id,
          label: doc.name,
          option: doc.name
        })) || [],
        
        users: formFields.users?.map((user: any) => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name}`,
          option: `${user.first_name} ${user.last_name}`
        })) || [],
        
        suppliers: formFields.suppliers?.map((supplier: any) => ({
          value: supplier.supplier_id || supplier.id,
          label: supplier.name,
          option: supplier.name
        })) || [],
        
        transportTypes: formFields.transportTypes?.map((transport: any) => ({
          value: transport.value || transport.id,
          label: transport.label || transport.name,
          option: transport.label || transport.name
        })) || [],
        
        destinations: formFields.destinations?.map((dest: any) => ({
          value: dest.destination_id || dest.id,
          label: dest.name,
          option: dest.name
        })) || []
      };
      
      setDepartureFormFields(transformedFields);
      return transformedFields;
    } catch (error) {
      console.error("Failed to load departure form fields:", error);
      throw error;
    } finally {
      stopLoader("processes/load-departure-form-fields");
    }
  },

  /**
   * Alias for loadDepartureFormFields to match expected naming
   */
  fetchDepartureFormFields: async () => {
    return ProcessService.loadDepartureFormFields();
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
   * Alias for fetchDepartureOrders with search support
   */
  fetchAllDepartureOrders: async (searchQuery?: string) => {
    const organisationId = localStorage.getItem("organisation_id");
    return ProcessService.fetchDepartureOrders({ 
      organisationId: organisationId || undefined, 
      orderNo: searchQuery 
    });
  },



  // =====================================
  // NEW: ENTRY ORDER-CENTRIC DEPARTURE WORKFLOW
  // =====================================

  /**
   * Step 1: Get entry orders that have approved inventory for departure
   */
  getEntryOrdersForDeparture: async (warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-entry-orders-for-departure");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouse_id", warehouseId);

      const response = await api.get(`${departureBaseURL}/entry-orders-for-departure?${params.toString()}`);
      const entryOrders = response.data.data || response.data;
      return entryOrders;
    } catch (error) {
      console.error("Failed to fetch entry orders for departure:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-entry-orders-for-departure");
    }
  },

  /**
   * Step 2: Get products from a specific entry order for departure
   */
  getProductsByEntryOrder: async (entryOrderId: string, warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-products-by-entry-order");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouse_id", warehouseId);

      const response = await api.get(`${departureBaseURL}/entry-order/${entryOrderId}/products?${params.toString()}`);
      const products = response.data.data || response.data;
      return products;
    } catch (error) {
      console.error("Failed to fetch products by entry order:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-products-by-entry-order");
    }
  },

  /**
   * Get available cells for a specific entry order product (for departure)
   */
  getCellsForEntryProduct: async (entryOrderProductId: string, warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-cells-for-entry-product");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/cells-for-entry-product/${entryOrderProductId}?${params.toString()}`);
      const cells = response.data.data || response.data;
      
      return cells.map((cell: any) => ({
        value: cell.cell_id || cell.id,
        label: `${cell.cell_code} - Row: ${cell.row}, Bay: ${cell.bay}, Pos: ${cell.position}`,
        option: `${cell.cell_code} - Available: ${cell.available_quantity || 0}`,
        ...cell
      }));
    } catch (error) {
      console.error("Failed to fetch cells for entry product:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-cells-for-entry-product");
    }
  },

  /**
   * Validate selected cell for departure
   */
  validateDepartureCell: async (inventoryId: string, requestedQty: number, requestedWeight: number) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/validate-departure-cell");

    try {
      const response = await api.post(`${departureBaseURL}/validate-cell`, {
        inventory_id: inventoryId,
        requested_qty: requestedQty,
        requested_weight: requestedWeight,
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to validate departure cell:", error);
      throw error;
    } finally {
      stopLoader("processes/validate-departure-cell");
    }
  },

  /**
   * Validate multiple cell selections for bulk departure
   */
  validateMultipleDepartureCells: async (inventorySelections: Array<{
    inventory_id: string;
    requested_qty: number;
    requested_weight: number;
  }>) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/validate-multiple-departure-cells");

    try {
      const response = await api.post(`${departureBaseURL}/validate-multiple-cells`, {
        inventory_selections,
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to validate multiple departure cells:", error);
      throw error;
    } finally {
      stopLoader("processes/validate-multiple-departure-cells");
    }
  },

  /**
   * Get departure inventory summary by warehouse
   */
  getDepartureInventorySummary: async (warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-departure-inventory-summary");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/inventory-summary?${params.toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to fetch departure inventory summary:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-departure-inventory-summary");
    }
  },

  /**
   * Step 4: Create departure order with entry order-centric data
   */
  createDepartureOrderFromEntryOrder: async (formData: {
    entry_order_id: string;
    departure_order_no?: string;
    customer_id: string;
    warehouse_id: string;
    departure_date: string;
    document_type_id: string;
    document_number: string;
    document_date: string;
    inventory_selections: Array<{
      inventory_id: string;
      requested_qty: number;
      requested_weight: number;
      observations?: string;
    }>;
    observations?: string;
    uploaded_documents?: File[];
  }) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/create-departure-from-entry");

    try {
      // If no departure order number provided, generate one
      if (!formData.departure_order_no) {
        formData.departure_order_no = await ProcessService.getCurrentDepartureOrderNo();
      }

      const payload = {
        ...formData,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
      };

      // Validate inventory selections
      if (!payload.inventory_selections || payload.inventory_selections.length === 0) {
        throw new Error("At least one inventory selection is required");
      }

      // Validate each inventory selection
      for (const [index, selection] of payload.inventory_selections.entries()) {
        if (!selection.inventory_id) {
          throw new Error(`Selection ${index + 1}: Inventory ID is required`);
        }
        if (!selection.requested_qty || selection.requested_qty <= 0) {
          throw new Error(`Selection ${index + 1}: Requested quantity must be greater than 0`);
        }
        if (!selection.requested_weight || selection.requested_weight <= 0) {
          throw new Error(`Selection ${index + 1}: Requested weight must be greater than 0`);
        }
      }

      const response = await api.post(`${departureBaseURL}/orders`, payload);

      setSubmitStatus({
        success: true,
        message: "Departure order created successfully",
      });

      // Refresh departure orders list
      try {
        await ProcessService.fetchDepartureOrders({ 
          organisationId: localStorage.getItem("organisation_id") || undefined 
        });
      } catch (refreshError) {
        console.warn("Failed to refresh departure orders list:", refreshError);
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to create departure order:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create departure order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/create-departure-from-entry");
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
      const response = await api.get(`${departureBaseURL}/products-with-inventory?warehouseId=${warehouseId}`);
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
  // NEW: FIFO DEPARTURE FLOW
  // =====================================

  /**
   * Browse products with inventory using new FIFO-aware endpoint
   * GET /departure/products-with-inventory
   */
  browseProductsWithInventory: async (warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/browse-products-inventory");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/products-with-inventory?${params.toString()}`);
      const products = response.data.data || response.data;
      
      // Transform products for better UI consumption
      const formattedProducts = products.map((product: any) => ({
        ...product,
        value: product.product_id,
        label: `${product.product_code} - ${product.product_name}`,
        option: product.product_name,
        inventory_summary: {
          total_quantity: product.total_quantity || 0,
          total_weight: product.total_weight || 0,
          locations_count: product.locations_count || 0,
          age_span_days: product.age_span_days || 0,
          oldest_date: product.oldest_date,
          newest_date: product.newest_date,
          suppliers_count: product.suppliers_count || 0,
        }
      }));
      
      return formattedProducts;
    } catch (error) {
      console.error("Failed to browse products with inventory:", error);
      throw error;
    } finally {
      stopLoader("processes/browse-products-inventory");
    }
  },

  /**
   * Get FIFO allocation for a specific product and requested quantity
   * GET /departure/products/{id}/fifo-allocation?requestedQuantity=100
   */
  getFifoAllocation: async (productId: string, requestedQuantity: number, warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/get-fifo-allocation");

    try {
      const params = new URLSearchParams();
      params.append("requestedQuantity", requestedQuantity.toString());
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/products/${productId}/fifo-allocation?${params.toString()}`);
      
      // Handle the wrapped response format: { success, message, data }
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to get FIFO allocation");
      }

      // Return the full response for frontend to handle
      return response.data;
    } catch (error) {
      console.error("Failed to get FIFO allocation:", error);
      throw error;
    } finally {
      stopLoader("processes/get-fifo-allocation");
    }
  },

  /**
   * Create departure order with FIFO selections
   * POST /departure/create-departure-order with FIFO selections
   */
  createFifoDepartureOrder: async (formData: {
    departure_order_no?: string;
    customer_id: string;
    warehouse_id: string;
    departure_date: string;
    document_type_id: string;
    document_number: string;
    document_date: string;
    fifo_selections: Array<{
      product_id: string;
      requested_quantity: number;
      requested_weight: number;
      allocation_details: Array<{
        inventory_id: string;
        allocated_quantity: number;
        allocated_weight: number;
        cell_code: string;
        manufacturing_date: string;
        expiration_date: string;
        supplier_name: string;
        lot_series: string;
        priority_level: number;
      }>;
      observations?: string;
    }>;
    arrival_point?: string;
    transport_type?: string;
    observations?: string;
    uploaded_documents?: File[];
  }) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/create-fifo-departure");

    try {
      // Generate departure order number if not provided
      if (!formData.departure_order_no) {
        formData.departure_order_no = await ProcessService.getCurrentDepartureOrderNo();
      }

      // Validate FIFO selections
      if (!formData.fifo_selections || formData.fifo_selections.length === 0) {
        throw new Error("At least one FIFO product selection is required");
      }

      // Validate each FIFO selection
      for (const [index, selection] of formData.fifo_selections.entries()) {
        const selectionNum = index + 1;
        
        if (!selection.product_id) {
          throw new Error(`Selection ${selectionNum}: Product ID is required`);
        }
        if (!selection.requested_quantity || selection.requested_quantity <= 0) {
          throw new Error(`Selection ${selectionNum}: Requested quantity must be greater than 0`);
        }
        if (!selection.requested_weight || selection.requested_weight <= 0) {
          throw new Error(`Selection ${selectionNum}: Requested weight must be greater than 0`);
        }
        if (!selection.allocation_details || selection.allocation_details.length === 0) {
          throw new Error(`Selection ${selectionNum}: At least one allocation detail is required`);
        }

        // Validate allocation details
        for (const [allocIndex, alloc] of selection.allocation_details.entries()) {
          const allocNum = allocIndex + 1;
          
          if (!alloc.inventory_id) {
            throw new Error(`Selection ${selectionNum}, Allocation ${allocNum}: Inventory ID is required`);
          }
          if (!alloc.allocated_quantity || alloc.allocated_quantity <= 0) {
            throw new Error(`Selection ${selectionNum}, Allocation ${allocNum}: Allocated quantity must be greater than 0`);
          }
          if (!alloc.allocated_weight || alloc.allocated_weight <= 0) {
            throw new Error(`Selection ${selectionNum}, Allocation ${allocNum}: Allocated weight must be greater than 0`);
          }
        }
      }

      // Transform FIFO selections to inventory_selections format for backend compatibility
      const inventorySelections = formData.fifo_selections.flatMap(selection => 
        selection.allocation_details.map(detail => ({
          inventory_id: detail.inventory_id,
          requested_qty: detail.allocated_quantity,
          requested_weight: detail.allocated_weight,
          observations: selection.observations || '',
        }))
      );

      const payload = {
        departure_order_no: formData.departure_order_no,
        customer_id: formData.customer_id,
        warehouse_id: formData.warehouse_id,
        departure_date: formData.departure_date,
        document_type_id: formData.document_type_id,
        document_number: formData.document_number,
        document_date: formData.document_date,
        inventory_selections: inventorySelections, // Use transformed data
        arrival_point: formData.arrival_point || '',
        transport_type: formData.transport_type || '',
        observations: formData.observations || '',
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
        is_fifo_compliant: true, // Mark as FIFO compliant
      };

      console.log("Payload being sent to backend:", payload);

      const response = await api.post(`${departureBaseURL}/create-departure-order`, payload);

      setSubmitStatus({
        success: true,
        message: "FIFO-compliant departure order created successfully!",
      });

      // Refresh departure orders list
      try {
        await ProcessService.fetchDepartureOrders({ 
          organisationId: localStorage.getItem("organisation_id") || undefined 
        });
      } catch (refreshError) {
        console.warn("Failed to refresh departure orders list:", refreshError);
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to create FIFO departure order:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create FIFO departure order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/create-fifo-departure");
    }
  },

  /**
   * Validate FIFO allocation before creating departure order
   */
  validateFifoAllocation: async (fifoSelections: Array<{
    product_id: string;
    requested_quantity: number;
    allocation_details: Array<{
      inventory_id: string;
      allocated_quantity: number;
    }>;
  }>) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/validate-fifo-allocation");

    try {
      const response = await api.post(`${departureBaseURL}/validate-fifo-allocation`, {
        fifo_selections: fifoSelections,
      });
      
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to validate FIFO allocation:", error);
      throw error;
    } finally {
      stopLoader("processes/validate-fifo-allocation");
    }
  },

  /**
   * Get product inventory summary for FIFO analysis
   */
  getProductInventorySummary: async (productId: string, warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/get-product-inventory-summary");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/products/${productId}/inventory-summary?${params.toString()}`);
      const summary = response.data.data || response.data;
      
      return {
        ...summary,
        age_analysis: {
          oldest_age_days: summary.oldest_age_days || 0,
          newest_age_days: summary.newest_age_days || 0,
          age_span_days: summary.age_span_days || 0,
          aging_risk_level: summary.oldest_age_days > 180 ? 'high' : summary.oldest_age_days > 90 ? 'medium' : 'low',
        },
        locations_breakdown: summary.locations?.map((loc: any) => ({
          ...loc,
          age_category: loc.age_days > 180 ? 'urgent' : loc.age_days > 90 ? 'caution' : 'fresh',
          display_name: `${loc.cell_code} (${loc.quantity} units, ${loc.age_days} days old)`,
        })) || [],
      };
    } catch (error) {
      console.error("Failed to get product inventory summary:", error);
      throw error;
    } finally {
      stopLoader("processes/get-product-inventory-summary");
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

  /**
   * Create departure order with inventory selections (Traditional departure workflow)
   */
  createDepartureOrderWithInventorySelections: async (formData: any) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/create-departure-order");

    try {
      // If no departure order number provided, generate one
      if (!formData.departure_order_no) {
        const orderNumber = await ProcessService.getCurrentDepartureOrderNo();
        formData.departure_order_no = orderNumber;
      }

      const payload = {
        ...formData,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
      };

      // Validate inventory selections
      if (!payload.inventory_selections || payload.inventory_selections.length === 0) {
        throw new Error("At least one inventory selection is required");
      }

      // Validate each inventory selection
      for (const [index, selection] of payload.inventory_selections.entries()) {
        if (!selection.inventory_id) {
          throw new Error(`Selection ${index + 1}: Inventory ID is required`);
        }
        if (!selection.requested_qty || selection.requested_qty <= 0) {
          throw new Error(`Selection ${index + 1}: Requested quantity must be greater than 0`);
        }
        if (!selection.requested_weight || selection.requested_weight <= 0) {
          throw new Error(`Selection ${index + 1}: Requested weight must be greater than 0`);
        }
      }

      const response = await api.post(`${departureBaseURL}/create-departure-order`, payload);

      setSubmitStatus({
        success: true,
        message: "Departure order created successfully",
      });

      // Refresh departure orders list
      try {
        await ProcessService.fetchDepartureOrders({ 
          organisationId: localStorage.getItem("organisation_id") || undefined 
        });
      } catch (refreshError) {
        console.warn("Failed to refresh departure orders list:", refreshError);
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to create departure order:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create departure order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/create-departure-order");
    }
  },

  // =====================================
  // NEW: COMPREHENSIVE DEPARTURE WORKFLOW
  // =====================================

  /**
   * Get user role-based permissions for departure operations
   */
  getDeparturePermissions: async (): Promise<import("../types").DeparturePermissions> => {
    try {
      const userRole = localStorage.getItem("role") as import("../types").UserRole;
      const response = await api.get(`${departureBaseURL}/permissions?role=${userRole}`);
      
      // Extract the permissions from the API response
      const apiData = response.data.data || response.data;
      const apiPermissions = apiData.permissions || apiData;
      
      // Transform API response to match DeparturePermissions interface
      const transformedPermissions: import("../types").DeparturePermissions = {
        can_create_order: apiPermissions.can_create || false,
        can_edit_order: apiPermissions.can_edit || false,
        can_delete_order: apiPermissions.can_delete || false,
        can_submit_order: apiPermissions.can_create || false, // Map to can_create
        can_approve_order: apiPermissions.can_approve || false,
        can_reject_order: apiPermissions.can_reject || false,
        can_request_revision: apiPermissions.can_request_revision || false,
        can_dispatch_order: apiPermissions.can_dispatch || false,
        can_complete_order: apiPermissions.can_dispatch || false, // Map to can_dispatch
        can_view_all_orders: apiPermissions.can_view_all || false,
        can_view_own_orders: apiPermissions.can_view_own || false,
        can_assign_orders: apiPermissions.can_assign || false,
        can_override_fifo: apiPermissions.can_override_fifo || false,
        can_access_admin_panel: apiPermissions.can_access_admin || false,
             };
       
       return transformedPermissions;
    } catch (error) {
      console.error("Failed to fetch departure permissions:", error);
      // Return default permissions based on role
      const userRole = localStorage.getItem("role") as import("../types").UserRole;
      return ProcessService.getDefaultPermissions(userRole);
    }
  },

  /**
   * Get default permissions based on user role (fallback)
   */
  getDefaultPermissions: (role: import("../types").UserRole): import("../types").DeparturePermissions => {
    const basePermissions = {
      can_create_order: false,
      can_edit_order: false,
      can_delete_order: false,
      can_submit_order: false,
      can_approve_order: false,
      can_reject_order: false,
      can_request_revision: false,
      can_dispatch_order: false,
      can_complete_order: false,
      can_view_all_orders: false,
      can_view_own_orders: false,
      can_assign_orders: false,
      can_override_fifo: false,
      can_access_admin_panel: false,
    };

    switch (role) {
      case "ADMIN":
        return { ...basePermissions, 
          can_create_order: true,
          can_edit_order: true,
          can_delete_order: true,
          can_submit_order: true,
          can_approve_order: true,
          can_reject_order: true,
          can_request_revision: true,
          can_dispatch_order: true,
          can_complete_order: true,
          can_view_all_orders: true,
          can_view_own_orders: true,
          can_assign_orders: true,
          can_override_fifo: true,
          can_access_admin_panel: true,
        };
      case "WAREHOUSE_INCHARGE":
        return { ...basePermissions,
          can_create_order: true,
          can_edit_order: true,
          can_submit_order: true,
          can_approve_order: true,
          can_reject_order: true,
          can_request_revision: true,
          can_dispatch_order: true,
          can_complete_order: true,
          can_view_all_orders: true,
          can_view_own_orders: true,
          can_assign_orders: true,
          can_override_fifo: false,
        };
      case "CLIENT":
        return { ...basePermissions,
          can_create_order: true,
          can_edit_order: true,
          can_submit_order: true,
          can_view_own_orders: true,
        };
      default:
        return basePermissions;
    }
  },

  /**
   * Get current departure order number from backend
   */
  getCurrentDepartureOrderNo: async (): Promise<string> => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/get-departure-order-no");

    try {
      const response = await api.get(`${departureBaseURL}/current-departure-order-no`);
      const orderNo = response.data.data?.departure_order_no || response.data.departure_order_no || response.data;
      return orderNo;
    } catch (error) {
      console.error("Failed to get current departure order number:", error);
      // Fallback to manual generation if API fails
      return `DEP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    } finally {
      stopLoader("processes/get-departure-order-no");
    }
  },

  /**
   * Create departure order with new comprehensive workflow
   */
  createComprehensiveDepartureOrder: async (formData: {
    departure_order_code: string;
    customer_id: string;
    warehouse_id: string;
    document_type_id: string;
    document_number: string;
    document_date: string;
    dispatch_document_number: string;
    departure_date: string;
    entry_date_time: string;
    products: Array<{
      product_id: string;
      product_code: string;
      product_name: string;
      requested_quantity: number;
      requested_weight: number;
      packaging_quantity: number;
      pallet_quantity?: number;
      lot_number: string;
      packaging_type: string;
      presentation: string;
      entry_order_no: string;
      guide_number: string;
      fifo_allocations?: import("../types").ExpiryFifoLocation[];
    }>;
    transport_type?: string;
    arrival_point?: string;
    observations?: string;
    special_instructions?: string;
    priority_level?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    uploaded_documents?: File[];
  }) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/create-departure-order");

    try {
      // Validate comprehensive mandatory fields
      if (!formData.departure_order_code?.trim()) {
        throw new Error("Departure order code is required");
      }
      if (!formData.dispatch_document_number?.trim()) {
        throw new Error("Dispatch document number is required");
      }
      if (!formData.products || formData.products.length === 0) {
        throw new Error("At least one product is required");
      }

      // Validate each product for mandatory fields
      for (const [index, product] of formData.products.entries()) {
        const productNum = index + 1;
        
        if (!product.product_code?.trim()) {
          throw new Error(`Product ${productNum}: Product code is required`);
        }
        if (!product.product_name?.trim()) {
          throw new Error(`Product ${productNum}: Product name is required`);
        }
        if (!product.lot_number?.trim()) {
          throw new Error(`Product ${productNum}: Lot number is required`);
        }
        if (!product.requested_quantity || product.requested_quantity <= 0) {
          throw new Error(`Product ${productNum}: Quantity inventory units must be greater than 0`);
        }
        if (!product.packaging_quantity || product.packaging_quantity <= 0) {
          throw new Error(`Product ${productNum}: Packaging quantity must be greater than 0`);
        }
        if (!product.packaging_type?.trim()) {
          throw new Error(`Product ${productNum}: Packaging type is required`);
        }
        if (!product.entry_order_no?.trim()) {
          throw new Error(`Product ${productNum}: Entry order number is required`);
        }
        if (!product.guide_number?.trim()) {
          throw new Error(`Product ${productNum}: Guide number is required`);
        }
      }

      const payload = {
        ...formData,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
        status: "PENDING",
        priority_level: formData.priority_level || "MEDIUM",
      };

      const response = await api.post(`${departureBaseURL}/comprehensive-orders`, payload);

      setSubmitStatus({
        success: true,
        message: "Departure order created successfully and submitted for approval",
      });

      // Refresh departure orders list
      try {
        await ProcessService.fetchComprehensiveDepartureOrders({ 
          organisationId: localStorage.getItem("organisation_id") || undefined 
        });
      } catch (refreshError) {
        console.warn("Failed to refresh departure orders list:", refreshError);
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to create comprehensive departure order:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create departure order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/create-departure-order");
    }
  },

  /**
   * Fetch comprehensive departure orders with workflow status
   */
  fetchComprehensiveDepartureOrders: async (filters?: { 
    status?: import("../types").DepartureOrderStatus;
    organisationId?: string; 
    orderNo?: string;
    priority?: string;
    warehouse_id?: string;
    customer_id?: string;
    created_by?: string;
  }) => {
    const { startLoader, stopLoader, setDepartureOrders } = ProcessesStore.getState();
    startLoader("processes/fetch-departure-orders");

    try {
      const params = new URLSearchParams();
      if (filters?.organisationId) params.append("organisationId", filters.organisationId);
      if (filters?.orderNo) params.append("orderNo", filters.orderNo);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.warehouse_id) params.append("warehouse_id", filters.warehouse_id);
      if (filters?.customer_id) params.append("customer_id", filters.customer_id);
      if (filters?.created_by) params.append("created_by", filters.created_by);

      const response = await api.get(`${departureBaseURL}/comprehensive-orders?${params.toString()}`);
      const orders: import("../types").DepartureOrder[] = response.data.data || response.data;

      setDepartureOrders(orders);
      return orders;
    } catch (error) {
      console.error("Failed to fetch comprehensive departure orders:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-departure-orders");
    }
  },

  /**
   * Fetch single comprehensive departure order by ID
   */
  fetchComprehensiveDepartureOrderById: async (orderId: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-departure-orders");

    try {
      const response = await api.get(`${departureBaseURL}/comprehensive-orders/${orderId}`);
      const order: import("../types").DepartureOrder = response.data.data || response.data;
      return order;
    } catch (error) {
      console.error("Failed to fetch comprehensive departure order:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-departure-orders");
    }
  },

  /**
   * Fetch single comprehensive departure order by order number (for audit screen)
   */
  fetchComprehensiveDepartureOrderByNo: async (orderNo: string) => {
    const { startLoader, stopLoader, setCurrentDepartureOrder } = ProcessesStore.getState();
    startLoader("processes/fetch-departure-orders");

    try {
      // First try to get orders by order number
      const response = await api.get(`${departureBaseURL}/comprehensive-orders?orderNo=${encodeURIComponent(orderNo)}`);
      const orders: import("../types").DepartureOrder[] = response.data.data || response.data;
      
      if (orders && orders.length > 0) {
        // Find the exact matching order by departure_order_no
        const exactMatch = orders.find(order => 
          order.departure_order_no === orderNo || 
          (order as any).departure_order_code === orderNo
        );
        
        if (exactMatch) {
          setCurrentDepartureOrder(exactMatch);
          return exactMatch;
        } else {
          // Fallback to first order if exact match not found
          const order = orders[0];
          setCurrentDepartureOrder(order);
          return order;
        }
      } else {
        throw new Error(`Departure order ${orderNo} not found`);
      }
    } catch (error) {
      console.error("Failed to fetch departure order by number:", error);
      setCurrentDepartureOrder(null);
      throw error;
    } finally {
      stopLoader("processes/fetch-departure-orders");
    }
  },

  /**
   * Approve departure order (WAREHOUSE_INCHARGE & ADMIN only)
   */
  approveDepartureOrder: async (orderId: string, approvalData: {
    comments?: string;
    priority_level?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    warehouse_assignment?: string;
    special_instructions?: string;
  }) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/approve-departure-order");

    try {
      const payload = {
        ...approvalData,
        reviewed_by: localStorage.getItem("id"),
        reviewed_at: new Date().toISOString(),
      };

      const response = await api.post(`${departureBaseURL}/departure-orders/${orderId}/approve`, payload);

      // Refresh orders list
      await ProcessService.fetchComprehensiveDepartureOrders({ 
        organisationId: localStorage.getItem("organisation_id") || undefined 
      });

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to approve departure order:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to approve departure order";
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/approve-departure-order");
    }
  },

  /**
   * Reject departure order (WAREHOUSE_INCHARGE & ADMIN only)
   */
  rejectDepartureOrder: async (orderId: string, rejectionData: {
    comments: string;
    reason: string;
  }) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/reject-departure-order");

    try {
      if (!rejectionData.comments?.trim()) {
        throw new Error("Rejection comments are required");
      }
      if (!rejectionData.reason?.trim()) {
        throw new Error("Rejection reason is required");
      }

      const payload = {
        ...rejectionData,
        reviewed_by: localStorage.getItem("id"),
        reviewed_at: new Date().toISOString(),
      };

      const response = await api.post(`${departureBaseURL}/departure-orders/${orderId}/reject`, payload);

      // Refresh orders list
      await ProcessService.fetchComprehensiveDepartureOrders({ 
        organisationId: localStorage.getItem("organisation_id") || undefined 
      });

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to reject departure order:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to reject departure order";
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/reject-departure-order");
    }
  },

  /**
   * Request revision for departure order (WAREHOUSE_INCHARGE & ADMIN only)
   */
  requestDepartureOrderRevision: async (orderId: string, revisionData: {
    comments: string;
    required_changes: string[];
    priority_level?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/request-departure-revision");

    try {
      if (!revisionData.comments?.trim()) {
        throw new Error("Revision comments are required");
      }
      if (!revisionData.required_changes || revisionData.required_changes.length === 0) {
        throw new Error("At least one required change must be specified");
      }

      const payload = {
        ...revisionData,
        reviewed_by: localStorage.getItem("id"),
        reviewed_at: new Date().toISOString(),
      };

      const response = await api.post(`${departureBaseURL}/departure-orders/${orderId}/request-revision`, payload);

      // Refresh orders list
      await ProcessService.fetchComprehensiveDepartureOrders({ 
        organisationId: localStorage.getItem("organisation_id") || undefined 
      });

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to request departure order revision:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to request departure order revision";
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/request-departure-revision");
    }
  },

  /**
   * Get departure order audit trail
   */
  getDepartureOrderAuditTrail: async (orderId: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-departure-audit-trail");

    try {
      const response = await api.get(`${departureBaseURL}/departure-orders/${orderId}/audit-trail`);
      const auditTrail: import("../types").DepartureApprovalStep[] = response.data.data || response.data || [];
      return auditTrail;
    } catch (error) {
      console.error("Failed to fetch departure order audit trail:", error);
      // Return empty array if audit trail endpoint is not available
      return [];
    } finally {
      stopLoader("processes/fetch-departure-audit-trail");
    }
  },

  /**
   * Dispatch single departure order (WAREHOUSE_INCHARGE & ADMIN only)
   */
  dispatchDepartureOrder: async (orderId: string, dispatchData: {
    dispatch_date_time?: string;
    transport_details?: {
      vehicle_info?: string;
      driver_name?: string;
      route_info?: string;
      estimated_arrival?: string;
    };
    final_inventory_allocations?: Array<{
      product_id: string;
      allocations: import("../types").DepartureInventoryAllocation[];
    }>;
    dispatch_notes?: string;
  }) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/dispatch-departure-order");

    try {
      // Set default dispatch date/time if not provided
      const dispatch_date_time = dispatchData.dispatch_date_time || new Date().toISOString();

      const payload = {
        dispatch_date_time,
        transport_details: dispatchData.transport_details,
        final_inventory_allocations: dispatchData.final_inventory_allocations || [],
        dispatch_notes: dispatchData.dispatch_notes,
        dispatched_by: localStorage.getItem("id"),
      };

      const response = await api.post(`${departureBaseURL}/departure-orders/${orderId}/auto-dispatch`, payload);

      // Refresh orders list
      await ProcessService.fetchComprehensiveDepartureOrders({ 
        organisationId: localStorage.getItem("organisation_id") || undefined 
      });

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to dispatch departure order:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to dispatch departure order";
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/dispatch-departure-order");
    }
  },

  /**
   * Simple dispatch for approved orders (removes from inventory automatically)
   */
  simpleDispatchDepartureOrder: async (orderId: string, dispatchNotes?: string) => {
    console.log('simpleDispatchDepartureOrder called with:', { orderId, dispatchNotes });
    const { startLoader, stopLoader, currentDepartureOrder } = ProcessesStore.getState();
    startLoader("processes/dispatch-departure-order");

    try {
      // Get the current departure order to extract inventory selections
      let order = currentDepartureOrder;
      if (!order || (order.departure_order_id !== orderId && order.departure_order_no !== orderId && order.departure_order_code !== orderId)) {
        // Fetch the order if not available in store
        order = await ProcessService.fetchComprehensiveDepartureOrderByNo(orderId);
      }

      if (!order || !order.products || order.products.length === 0) {
        throw new Error('No products found in departure order for dispatch');
      }

      // Check if order has been allocated to inventory
      const hasInventoryAllocations = order.products.some((product: any) => 
        product.inventory_allocations && product.inventory_allocations.length > 0
      );

      console.log('Order structure check:', {
        hasInventoryAllocations,
        productsCount: order.products.length,
        firstProduct: order.products[0],
        sampleProductKeys: order.products[0] ? Object.keys(order.products[0]) : []
      });

      if (!hasInventoryAllocations) {
        // Check if products have fifo_allocations or any other allocation data
        const hasFifoAllocations = order.products.some((product: any) => 
          product.fifo_allocations && product.fifo_allocations.length > 0
        );

        const hasProductInventoryData = order.products.some((product: any) => 
          product.departure_order_product_id || product.product_id
        );

        console.log('Alternative allocation check:', {
          hasFifoAllocations,
          hasProductInventoryData,
          orderData: order
        });

        if (!hasFifoAllocations && !hasProductInventoryData) {
          throw new Error('Departure order has not been allocated to specific inventory cells yet. Please allocate the order before dispatching.');
        }

        console.warn('No specific inventory allocations found, but proceeding with available product data');
      }

      // Create inventory selections from available data
      const inventory_selections: any[] = [];

      order.products.forEach((product: any) => {
        // Priority 1: Use inventory_allocations if available
        if (product.inventory_allocations && product.inventory_allocations.length > 0) {
          product.inventory_allocations.forEach((allocation: any) => {
            inventory_selections.push({
              inventory_id: allocation.inventory_id,
              product_id: product.product_id,
              requested_qty: allocation.allocated_quantity || parseInt(product.requested_quantity?.toString() || "0"),
              requested_weight: allocation.allocated_weight || parseFloat(product.requested_weight?.toString() || "0"),
              lot_number: allocation.lot_series || product.lot_series || product.lot_number,
              presentation: product.presentation || "CAJA",
              cell_id: allocation.cell_id,
              allocation_id: allocation.allocation_id,
            });
          });
        } 
        // Priority 2: Use fifo_allocations if available
        else if (product.fifo_allocations && product.fifo_allocations.length > 0) {
          product.fifo_allocations.forEach((allocation: any) => {
            inventory_selections.push({
              inventory_id: allocation.inventory_id,
              product_id: product.product_id,
              requested_qty: allocation.allocated_quantity || parseInt(product.requested_quantity?.toString() || "0"),
              requested_weight: allocation.allocated_weight || parseFloat(product.requested_weight?.toString() || "0"),
              lot_number: allocation.lot_series || product.lot_series || product.lot_number,
              presentation: product.presentation || "CAJA",
              cell_id: allocation.cell_id,
            });
          });
        }
        // Priority 3: Use product-level information (for orders without specific allocations)
        else {
          console.warn(`Product ${product.product_code || product.product_name} has no specific allocations, using product-level data for dispatch`);
          
          // For comprehensive orders without allocations, we need to send the product info
          // The backend should handle finding the appropriate inventory to remove
          inventory_selections.push({
            inventory_id: product.departure_order_product_id || `temp_${product.product_id}_${Date.now()}`,
            product_id: product.product_id,
            product_code: product.product_code,
            requested_qty: parseInt(product.requested_quantity?.toString() || "0"),
            requested_weight: parseFloat(product.requested_weight?.toString() || "0"),
            lot_number: product.lot_series || product.lot_number,
            presentation: product.presentation || "CAJA",
            // Include product details for backend to match against inventory
            departure_order_product_id: product.departure_order_product_id,
            use_auto_allocation: true, // Flag for backend to auto-allocate
          });
        }
      });

      if (inventory_selections.length === 0) {
        throw new Error('No valid inventory selections found for dispatch. The order may not be properly allocated.');
      }

      const payload = {
        dispatch_notes: dispatchNotes || "Order dispatched - inventory removed automatically",
        inventory_selections,
        dispatch_method: hasInventoryAllocations ? 'specific_allocations' : 'auto_allocate',
      };

      console.log('Dispatch API payload:', JSON.stringify(payload, null, 2));
      console.log('Dispatch API URL:', `${departureBaseURL}/departure-orders/${orderId}/auto-dispatch`);
      console.log('Inventory selections summary:', inventory_selections.map(sel => ({
        inventory_id: sel.inventory_id,
        product_id: sel.product_id,
        product_code: sel.product_code,
        requested_qty: sel.requested_qty,
        use_auto_allocation: sel.use_auto_allocation
      })));
      
      const response = await api.post(`${departureBaseURL}/departure-orders/${orderId}/auto-dispatch`, payload);

      // Refresh orders list
      await ProcessService.fetchComprehensiveDepartureOrders({ 
        organisationId: localStorage.getItem("organisation_id") || undefined 
      });

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to dispatch departure order:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to dispatch departure order";
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/dispatch-departure-order");
    }
  },

  /**
   * Batch dispatch multiple departure orders
   */
  batchDispatchDepartureOrders: async (batchData: import("../types").BatchDispatchRequest) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/batch-dispatch-orders");

    try {
      if (!batchData.departure_order_ids || batchData.departure_order_ids.length === 0) {
        throw new Error("At least one departure order must be selected for batch dispatch");
      }
      if (!batchData.dispatch_date_time) {
        throw new Error("Dispatch date and time is required");
      }

      const payload = {
        ...batchData,
        dispatched_by: localStorage.getItem("id"),
      };

      const response = await api.post(`${departureBaseURL}/batch-dispatch`, payload);

      // Refresh orders list
      await ProcessService.fetchComprehensiveDepartureOrders({ 
        organisationId: localStorage.getItem("organisation_id") || undefined 
      });

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to batch dispatch departure orders:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || "Failed to batch dispatch departure orders";
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/batch-dispatch-orders");
    }
  },

  // =====================================
  // NEW: EXPIRY-BASED FIFO SYSTEM
  // =====================================

  /**
   * Get expiry-based FIFO locations for a product
   */
  getExpiryFifoLocations: async (productId: string, warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/get-fifo-locations");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/products/${productId}/fifo-locations?${params.toString()}`);
      const locations: import("../types").ExpiryFifoLocation[] = response.data.data || response.data;
      
      return locations;
    } catch (error) {
      console.error("Failed to get expiry FIFO locations:", error);
      throw error;
    } finally {
      stopLoader("processes/get-fifo-locations");
    }
  },

  /**
   * Get expiry-based FIFO allocation for a product with requested quantity
   */
  getExpiryFifoAllocation: async (productId: string, requestedQuantity: number, warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/get-fifo-allocation");

    try {
      const params = new URLSearchParams();
      params.append("requestedQuantity", requestedQuantity.toString());
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/products/${productId}/fifo-allocation?${params.toString()}`);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to get expiry FIFO allocation");
      }

      const allocation: import("../types").ExpiryFifoAllocation = response.data.data;
      return allocation;
    } catch (error) {
      console.error("Failed to get expiry FIFO allocation:", error);
      throw error;
    } finally {
      stopLoader("processes/get-fifo-allocation");
    }
  },

  /**
   * Get comprehensive product FIFO analysis
   */
  getProductFifoAnalysis: async (productId: string, warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/get-product-fifo-analysis");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/products/${productId}/fifo-analysis?${params.toString()}`);
      const analysis: import("../types").ProductFifoAnalysis = response.data.data || response.data;
      
      return analysis;
    } catch (error) {
      console.error("Failed to get product FIFO analysis:", error);
      throw error;
    } finally {
      stopLoader("processes/get-product-fifo-analysis");
    }
  },

  /**
   * Get products with expiry urgency dashboard
   */
  getExpiryUrgencyDashboard: async (warehouseId?: string) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/get-expiry-dashboard");

    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append("warehouseId", warehouseId);

      const response = await api.get(`${departureBaseURL}/expiry-urgency-dashboard?${params.toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to get expiry urgency dashboard:", error);
      throw error;
    } finally {
      stopLoader("processes/get-expiry-dashboard");
    }
  },

  /**
   * Validate expiry-based FIFO allocation before creating departure order
   */
  validateExpiryFifoAllocation: async (allocations: Array<{
    product_id: string;
    requested_quantity: number;
    fifo_locations: import("../types").ExpiryFifoLocation[];
  }>) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/validate-fifo-allocation");

    try {
      const response = await api.post(`${departureBaseURL}/validate-expiry-fifo-allocation`, {
        allocations,
      });
      
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to validate expiry FIFO allocation:", error);
      throw error;
    } finally {
      stopLoader("processes/validate-fifo-allocation");
    }
  },

  // =====================================
  // NEW: AUDIT TRAIL & REPORTING
  // =====================================



  /**
   * Get departure orders by status for workflow management
   */
  getDepartureOrdersByStatus: async (status: import("../types").DepartureOrderStatus) => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/fetch-orders-by-status");

    try {
      const organisationId = localStorage.getItem("organisation_id");
      const params = new URLSearchParams();
      if (organisationId) params.append("organisationId", organisationId);

      const response = await api.get(`${departureBaseURL}/departure-orders/status/${status}?${params.toString()}`);
      const orders: import("../types").DepartureOrder[] = response.data.data || response.data;
      return orders;
    } catch (error) {
      console.error(`Failed to fetch departure orders with status ${status}:`, error);
      throw error;
    } finally {
      stopLoader("processes/fetch-orders-by-status");
    }
  },

  /**
   * Export departure orders with comprehensive data
   */
  exportComprehensiveDepartureOrders: async (filters?: {
    status?: import("../types").DepartureOrderStatus;
    dateFrom?: string;
    dateTo?: string;
    warehouseId?: string;
    customerId?: string;
    priority?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);
      if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId);
      if (filters?.customerId) params.append("customerId", filters.customerId);
      if (filters?.priority) params.append("priority", filters.priority);

      const response = await api.get(`${departureBaseURL}/export-comprehensive?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `departure_orders_comprehensive_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Failed to export comprehensive departure orders:", error);
      throw error;
    }
  },

  // =====================================
  // UTILITY FUNCTIONS FOR NEW WORKFLOW
  // =====================================

  /**
   * Get expiry urgency color and message
   */
  getExpiryUrgencyInfo: (daysToExpiry: number): {
    urgency: import("../types").ExpiryUrgency;
    color: 'red' | 'orange' | 'yellow' | 'green';
    icon: string;
    message: string;
  } => {
    if (daysToExpiry < 0) {
      return {
        urgency: "EXPIRED",
        color: 'red',
        icon: '❌',
        message: `Expired ${Math.abs(daysToExpiry)} days ago`
      };
    } else if (daysToExpiry <= 7) {
      return {
        urgency: "URGENT",
        color: 'red',
        icon: '⚠️',
        message: `Expires in ${daysToExpiry} days - URGENT`
      };
    } else if (daysToExpiry <= 30) {
      return {
        urgency: "WARNING",
        color: 'orange',
        icon: '⚡',
        message: `Expires in ${daysToExpiry} days - WARNING`
      };
    } else {
      return {
        urgency: "NORMAL",
        color: 'green',
        icon: '✅',
        message: `Expires in ${daysToExpiry} days`
      };
    }
  },

  /**
   * Check if user can perform action based on role and order status
   */
  canPerformAction: (action: string, orderStatus: import("../types").DepartureOrderStatus, userRole: import("../types").UserRole): boolean => {
    const permissions = ProcessService.getDefaultPermissions(userRole);
    
    switch (action) {
      case "approve":
        return permissions.can_approve_order && orderStatus === "PENDING";
      case "reject":
        return permissions.can_reject_order && orderStatus === "PENDING";
      case "request_revision":
        return permissions.can_request_revision && orderStatus === "PENDING";
      case "dispatch":
        return permissions.can_dispatch_order && orderStatus === "APPROVED";
      case "edit":
        return permissions.can_edit_order && (orderStatus === "PENDING" || orderStatus === "REVISION");
      case "delete":
        return permissions.can_delete_order && orderStatus === "PENDING";
      default:
        return false;
    }
  },

  /**
   * Create new entry order with document uploads - Customer creates and sends for admin review
   * Uses FormData for multipart upload
   */
  createNewEntryOrderWithDocuments: async (formData: FormData) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/create-entry-order");

    try {
      // Add required fields only if they're not already present
      if (!formData.has('organisation_id')) {
        formData.append('organisation_id', localStorage.getItem("organisation_id") || '');
      }
      if (!formData.has('created_by')) {
        formData.append('created_by', localStorage.getItem("id") || '');
      }

      const response = await api.post(`${entryBaseURL}/create-entry-order`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
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

  /**
   * Create comprehensive departure order with document uploads
   * Uses FormData for multipart upload
   */
  createComprehensiveDepartureOrderWithDocuments: async (formData: FormData) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/create-departure-order");

    try {
      // Add required fields only if they're not already present
      if (!formData.has('organisation_id')) {
        formData.append('organisation_id', localStorage.getItem("organisation_id") || '');
      }
      if (!formData.has('created_by')) {
        formData.append('created_by', localStorage.getItem("id") || '');
      }
      if (!formData.has('status')) {
        formData.append('status', 'PENDING');
      }

      const response = await api.post(`${departureBaseURL}/comprehensive-orders`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitStatus({
        success: true,
        message: "Departure order created successfully and submitted for approval",
      });

      // Refresh departure orders list
      try {
        await ProcessService.fetchComprehensiveDepartureOrders({ 
          organisationId: localStorage.getItem("organisation_id") || undefined 
        });
      } catch (refreshError) {
        console.warn("Failed to refresh departure orders list:", refreshError);
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to create comprehensive departure order:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to create departure order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/create-departure-order");
    }
  },

  /**
   * Update departure order (only for orders in REVISION status)
   * Uses FormData for multipart upload
   */
  updateDepartureOrder: async (departureOrderId: string, formData: FormData) => {
    const { startLoader, stopLoader, setSubmitStatus } = ProcessesStore.getState();
    startLoader("processes/update-departure-order");

    try {
      // Add the user ID for validation on backend
      if (!formData.has('updated_by')) {
        formData.append('updated_by', localStorage.getItem("id") || '');
      }

      const response = await api.put(`${departureBaseURL}/departure-orders/${departureOrderId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitStatus({
        success: true,
        message: "Departure order updated successfully and submitted for re-review",
      });

      // Refresh departure orders list
      try {
        await ProcessService.fetchComprehensiveDepartureOrders({ 
          organisationId: localStorage.getItem("organisation_id") || undefined 
        });
      } catch (refreshError) {
        console.warn("Failed to refresh departure orders list:", refreshError);
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to update departure order:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to update departure order";
      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      stopLoader("processes/update-departure-order");
    }
  },

  // ✅ NEW: Get approved departure orders ready for dispatch
  getApprovedDepartureOrders: async (filters?: { organisationId?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.organisationId) {
        params.append('organisation_id', filters.organisationId);
      }

      const response = await api.get(`${departureBaseURL}/approved-departure-orders?${params.toString()}`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching approved departure orders:", error);
      throw error;
    }
  },

  // ✅ NEW: Get products for a specific departure order
  getDepartureOrderProducts: async (orderId: string) => {
    try {
      const response = await api.get(`${departureBaseURL}/departure-orders/${orderId}/products`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching departure order products:", error);
      throw error;
    }
  },

  // ✅ NEW: Get recalculated FIFO for partial dispatch
  getRecalculatedFifo: async (orderId: string, productId: string) => {
    try {
      const response = await api.get(`${departureBaseURL}/departure-orders/${orderId}/products/${productId}/recalculated-fifo`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching recalculated FIFO:", error);
      throw error;
    }
  },

  // ✅ NEW: Execute dispatch with selected inventory
  dispatchApprovedOrder: async (dispatchData: any) => {
    try {
      const response = await api.post(`${departureBaseURL}/dispatch-approved-order`, dispatchData);
      return response.data;
    } catch (error) {
      console.error("Error executing dispatch:", error);
      throw error;
    }
  },

  // ✅ NEW: Get warehouse dispatch summary
  getWarehouseDispatchSummary: async (warehouseId?: string) => {
    try {
      const params = new URLSearchParams();
      if (warehouseId) {
        params.append('warehouse_id', warehouseId);
      }

      const response = await api.get(`${departureBaseURL}/warehouse-dispatch-summary?${params.toString()}`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching warehouse dispatch summary:", error);
      throw error;
    }
  },
};

export default ProcessService;
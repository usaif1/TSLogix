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

  /**
   * Get current departure order number
   */
  getCurrentDepartureOrderNo: async () => {
    const { startLoader, stopLoader } = ProcessesStore.getState();
    startLoader("processes/get-departure-order-no");

    try {
      const response = await api.get(`${departureBaseURL}/current-departure-order-no`);
      const orderNumber = response.data?.departure_order_no || response.data?.currentOrderNo;
      return orderNumber;
    } catch (error) {
      console.error("Failed to get current departure order number:", error);
      throw error;
    } finally {
      stopLoader("processes/get-departure-order-no");
    }
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
        inventory_selections: inventorySelections,
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
};

export default ProcessService;
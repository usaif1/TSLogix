/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { ProcessesStore } from "@/globalStore";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service"; // Add this import

const entryBaseURL = "/entry";
const departureBaseURL = "/departure";
const auditBaseURL = "/audit";

const { setEntryOrders, setDepartureOrders } = ProcessesStore.getState();

export const ProcessService = {
  /**
   * Fetch all entry orders, optionally filtered by order number
   */
  fetchAllEntryOrders: async (searchQuery = "") => {
    try {
      let endpoint = `${entryBaseURL}/entry-orders`;
      if (searchQuery) {
        endpoint += `?orderNo=${encodeURIComponent(searchQuery)}`;
      }
      const response = await api.get(endpoint);
      setEntryOrders(response.data.data);
    } catch (err) {
      console.error("fetch entry orders error", err);
      throw new Error("Failed to fetch entry orders");
    }
  },

  /**
   * Fetch dropdown fields for creating an entry order
   */
  fetchEntryOrderFormFields: async () => {
    try {
      const response = await api.get(`${entryBaseURL}/entry-formfields`);
      const {
        origins,
        users,
        suppliers,
        documentTypes,
        customers,
        products,
        orderStatus,
      } = response.data;

      const formattedOrigins = origins.map((origin: any) => ({
        value: origin.origin_id,
        label: origin.name,
      }));
      const formattedUsers = users.map((user: any) => ({
        value: user.user_id,
        label: [user.first_name, user.last_name].filter(Boolean).join(" "),
      }));
      const formattedSuppliers = suppliers.map((s: any) => ({
        value: s.supplier_id,
        label: s.name,
      }));
      const formattedDocumentTypes = documentTypes.map((dt: any) => ({
        value: dt.document_type_id,
        label: dt.name,
      }));
      const formattedCustomers = (customers || []).map((c: any) => ({
        value: c.customer_id,
        label: c.name,
      }));
      const formattedProducts = (products || []).map((p: any) => ({
        value: p.product_id,
        label: p.name,
      }));
      const formattedStatus = (orderStatus || []).map((s: any) => ({
        value: s.status_id,
        label: s.name,
      }));

      ProcessesStore.setState((prev) => ({
        ...prev,
        origins: formattedOrigins,
        users: formattedUsers,
        suppliers: formattedSuppliers,
        documentTypes: formattedDocumentTypes,
        customers: formattedCustomers,
        products: formattedProducts,
        entryOrderStatus: formattedStatus,
      }));
      console.log("Updated ProcessesStore state:", ProcessesStore.getState());
    } catch (err) {
      console.error("fetch entry form fields error", err);
      throw new Error("Failed to fetch entry form fields");
    }
  },

  /**
   * Create a new entry order
   */
  createNewEntryOrder: async (formData: any) => {
    const payload = {
      ...formData,
      organisation_id: localStorage.getItem("organisation_id"),
      order_type: "ENTRY",
      created_by: localStorage.getItem("id"),
    };
    return await api.post(`${entryBaseURL}/create-entry-order`, payload);
  },

  /**
   * Fetch the current entry order number
   */
  fetchCurrentOrderNumber: async () => {
    const { setCurrentEntryOrderNo } = ProcessesStore.getState();
    const response = await api.get(`${entryBaseURL}/current-order-number`);
    const orderNo = response.data.currentOrderNo;
    setCurrentEntryOrderNo(orderNo);
    return orderNo;
  },

  /**
   * Fetch all departure orders, optionally filtered by order number
   */
  fetchAllDepartureOrders: async (searchQuery = "") => {
    try {
      let endpoint = `${departureBaseURL}/departure-orders`;
      if (searchQuery)
        endpoint += `?orderNo=${encodeURIComponent(searchQuery)}`;
      const response = await api.get(endpoint);
      setDepartureOrders(response.data.data);
    } catch (err) {
      console.error("fetch departure orders error", err);
      throw new Error("Failed to fetch departure orders");
    }
  },

  /**
   * Fetch dropdown fields for departure order form
   */
  fetchDepartureFormFields: async () => {
    try {
      const response = await api.get(
        `${departureBaseURL}/departure-formfields`
      );
      const { customers, documentTypes, users, packagingTypes, labels } =
        response.data;

      const formattedCustomers = customers.map((c: any) => ({
        value: c.customer_id,
        label: c.name,
      }));
      const formattedDocumentTypes = documentTypes.map((dt: any) => ({
        value: dt.document_type_id,
        label: dt.name,
      }));
      const formattedUsers = users.map((u: any) => ({
        value: u.id,
        label: [u.first_name, u.middle_name, u.last_name]
          .filter(Boolean)
          .join(" "),
      }));
      const formattedPackaging = packagingTypes.map((p: any) => ({
        value: p.packaging_type_id,
        label: p.name,
      }));
      const formattedLabels = labels.map((l: any) => ({
        value: l.label_id,
        label: l.name,
      }));

      ProcessesStore.setState((prev) => ({
        ...prev,
        departureFormFields: {
          customers: formattedCustomers,
          documentTypes: formattedDocumentTypes,
          users: formattedUsers,
          packagingTypes: formattedPackaging,
          labels: formattedLabels,
        },
      }));
    } catch (error) {
      console.error("fetch departure form fields error", error);
      throw new Error("Failed to fetch departure form fields");
    }
  },

  /**
   * Create a new departure order
   */
  createNewDepartureOrder: async (formData: any) => {
    const payload = {
      ...formData,
      productId: formData.product.value,
      organisation_id: localStorage.getItem("organisation_id"),
      order_type: "DEPARTURE",
      created_by: localStorage.getItem("id"),
    };
    return await api.post(
      `${departureBaseURL}/create-departure-order`,
      payload
    );
  },

  /**
   * Fetch a single entry order by order number
   */
  fetchEntryOrderByNo: async (orderNo: string) => {
    const { startLoader, stopLoader, setCurrentEntryOrder } =
      ProcessesStore.getState();
    startLoader("processes/fetch-entry-order");
    try {
      const endpoint = `${entryBaseURL}/entry-order/${encodeURIComponent(
        orderNo
      )}`;
      const response = await api.get(endpoint);
      const entry = response.data.data;
      setCurrentEntryOrder(entry);
      return entry;
    } catch (err) {
      console.error("fetch entry order by no error", err);
      setCurrentEntryOrder(null);
      throw new Error("Failed to fetch entry order details");
    } finally {
      stopLoader("processes/fetch-entry-order");
    }
  },

  /**
   * Create an audit record for an entry order
   */
  createAudit: async (data: {
    entry_order_id: string | number;
    audit_result: string;
    comments?: string;
  }) => {
    try {
      const response = await api.post(`${auditBaseURL}`, data);
      await ProcessService.fetchEntryOrderAudits(
        data.entry_order_id.toString()
      );
      return response.data;
    } catch (err) {
      console.error("create audit error", err);
      throw new Error("Failed to create audit");
    }
  },

  /**
   * Fetch audits for a specific entry order
   */
  fetchEntryOrderAudits: async (entryOrderId: string) => {
    const { setCurrentEntryOrder } = ProcessesStore.getState();
    try {
      const response = await api.get(
        `${auditBaseURL}/entry-order/${encodeURIComponent(entryOrderId)}`
      );
      setCurrentEntryOrder(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error("fetch entry order audits error", err);
      throw new Error("Failed to fetch audits for entry order");
    }
  },

  /**
   * Fetch a single audit by its ID
   */
  fetchAuditById: async (auditId: string) => {
    try {
      const response = await api.get(
        `${auditBaseURL}/${encodeURIComponent(auditId)}`
      );
      return response.data.data;
    } catch (err) {
      console.error("fetch audit by id error", err);
      throw new Error("Failed to fetch audit details");
    }
  },

  /**
   * Fetch all audits, with optional filters
   */
  fetchAllAudits: async (
    filters: {
      result?: string;
      start_date?: string;
      end_date?: string;
      sort?: "asc" | "desc";
    } = {}
  ) => {
    try {
      const { setAllAudit } = ProcessesStore.getState();
      const response = await api.get(`${auditBaseURL}`, { params: filters });
      setAllAudit(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error("fetch all audits error", err);
      throw new Error("Failed to fetch all audits");
    }
  },

  /**
   * Fetch audit summary statistics
   */
  fetchAuditStatistics: async () => {
    try {
      const response = await api.get(`${auditBaseURL}/statistics/summary`);
      return response.data.data;
    } catch (err) {
      console.error("fetch audit statistics error", err);
      throw new Error("Failed to fetch audit statistics");
    }
  },

  fetchPassedEntryOrders: async (searchQuery = "") => {
    try {
      const params: Record<string, any> = { audit_status: "PASSED" };
      if (searchQuery) params.orderNo = searchQuery;

      const response = await api.get(`${entryBaseURL}/entry-orders/passed`, {
        params,
      });
      const data = response.data.data;
      setEntryOrders(data);
      return data;
    } catch (err) {
      console.error("fetch passed entry orders error", err);
      throw new Error("Failed to fetch passed entry orders");
    }
  },

  // Get products with available inventory - Updated
  async getProductsWithInventory(warehouseId?: string) {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : '';
    const response = await api.get(`${departureBaseURL}/products-with-inventory${params}`);
    return response.data;
  },

  // Get available cells for a specific product - NEW
  async getAvailableCellsForProduct(productId: string, warehouseId?: string) {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : '';
    const response = await api.get(`${departureBaseURL}/cells-for-product/${productId}${params}`);
    return response.data;
  },

  async validateSelectedCell(data: {
    inventory_id: string;
    requested_qty: number;
    requested_weight: number;
  }) {
    const response = await api.post(`${departureBaseURL}/validate-cell`, data);
    return response.data;
  },

  // Departure inventory management methods
  loadProductsWithInventory: async (warehouseId: string) => {
    const { startLoader, stopLoader, setProductsWithInventory, setInventoryError } = ProcessesStore.getState();
    
    startLoader("processes/load-products-inventory");
    try {
      const response = await ProcessService.getProductsWithInventory(warehouseId);
      setProductsWithInventory(response.data || []);
      return response.data;
    } catch (error) {
      console.error("Error loading products with inventory:", error);
      setInventoryError("Error loading products with inventory");
      throw error;
    } finally {
      stopLoader("processes/load-products-inventory");
    }
  },

  loadAvailableCells: async (productId: string, warehouseId?: string) => {
    const { startLoader, stopLoader, setAvailableCells, setInventoryError } = ProcessesStore.getState();
    
    startLoader("processes/load-cells");
    try {
      const response = await ProcessService.getAvailableCellsForProduct(productId, warehouseId);
      setAvailableCells(response.data || []);
      return response.data;
    } catch (error) {
      console.error("Error loading available cells:", error);
      setInventoryError("Error loading available cells");
      throw error;
    } finally {
      stopLoader("processes/load-cells");
    }
  },

  validateCellSelection: async (data: {
    inventory_id: string;
    requested_qty: number;
    requested_weight: number;
  }) => {
    const { 
      startLoader, 
      stopLoader, 
      setCellValidation, 
      setInventoryError 
    } = ProcessesStore.getState();

    startLoader("processes/validate-cell");
    setInventoryError("");

    try {
      const response = await ProcessService.validateSelectedCell(data);
      setCellValidation(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error validating cell:", error);
      setInventoryError(error.response?.data?.message || "Error validating cell selection");
      setCellValidation(null);
      throw error;
    } finally {
      stopLoader("processes/validate-cell");
    }
  },

  createDepartureOrderWithState: async (formData: any) => {
    const { 
      startLoader, 
      stopLoader, 
      setSubmitStatus,
      cellValidation 
    } = ProcessesStore.getState();

    if (!cellValidation) {
      setSubmitStatus({
        success: false,
        message: "Please select and validate a cell before submitting"
      });
      return;
    }

    startLoader("processes/submit-departure");
    setSubmitStatus({});

    try {
      const submissionData = {
        ...formData,
        inventory_id: cellValidation.inventory_id,
        requested_qty: cellValidation.requested_qty,
        requested_weight: cellValidation.requested_weight,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
        order_type: "DEPARTURE",
        palettes: formData.palettes ? formData.palettes.toString() : null,
        total_qty: parseInt(formData.total_qty || "0"),
        total_weight: parseFloat(formData.total_weight || "0"),
        total_volume: parseFloat(formData.total_volume || "0"),
        insured_value: formData.insured_value ? parseFloat(formData.insured_value) : null,
      };

      const result = await ProcessService.createNewDepartureOrder(submissionData);

      setSubmitStatus({
        success: true,
        message: "departure_order_created_successfully" // This will be handled by the component
      });

      return result;
    } catch (error: any) {
      console.error("Departure order creation failed:", error);
      setSubmitStatus({
        success: false,
        message: error.response?.data?.message || "failed_to_create_departure_order",
      });
      throw error;
    } finally {
      stopLoader("processes/submit-departure");
    }
  },

  // Fetch warehouses for departure form
  async fetchWarehouses() {
    const { startLoader, stopLoader, setWarehouses } = ProcessesStore.getState();
    
    startLoader("processes/fetch-warehouses");
    try {
      // Use the existing inventory service method
      const warehouses = await InventoryLogService.fetchWarehouses();
      setWarehouses(warehouses);
      return warehouses;
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      throw error;
    } finally {
      stopLoader("processes/fetch-warehouses");
    }
  },
};

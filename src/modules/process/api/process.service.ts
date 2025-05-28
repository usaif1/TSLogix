/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { ProcessesStore } from "@/globalStore";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";

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
   * Fetch dropdown fields for creating an entry order - Updated for new backend structure
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
        warehouses,
        temperatureRanges,
        packagingTypes,
        packagingStatuses,
      } = response.data;

      const formattedOrigins = origins.map((origin: any) => ({
        value: origin.origin_id,
        label: origin.name,
      }));

      const formattedUsers = users.map((user: any) => ({
        value: user.id,
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

      // Updated products formatting to include additional fields
      const formattedProducts = (products || []).map((p: any) => ({
        value: p.product_id,
        label: p.name,
        product_code: p.product_code,
        unit_weight: p.unit_weight,
        unit_volume: p.unit_volume,
        temperature_range: p.temperature_range
          ? {
              range_id: p.temperature_range.range_id || p.temperature_range.id,
              range: p.temperature_range.range,
              min_celsius: p.temperature_range.min_celsius,
              max_celsius: p.temperature_range.max_celsius,
            }
          : null,
      }));

      const formattedStatus = (orderStatus || []).map((s: any) => ({
        value: s.status_id,
        label: s.name,
      }));

      // Format warehouses
      const formattedWarehouses = (warehouses || []).map((w: any) => ({
        value: w.warehouse_id,
        label: w.name,
      }));

      // Format temperature ranges
      const formattedTemperatureRanges = (temperatureRanges || []).map(
        (tr: any) => ({
          value: tr.range_id || tr.id,
          label: tr.range,
          min_celsius: tr.min_celsius,
          max_celsius: tr.max_celsius,
        })
      );

      // Format packaging types and statuses
      const formattedPackagingTypes = (packagingTypes || []).map((pt: any) => ({
        value: pt.value,
        label: pt.label,
      }));

      const formattedPackagingStatuses = (packagingStatuses || []).map(
        (ps: any) => ({
          value: ps.value,
          label: ps.label,
        })
      );

      // Fix: Use the action methods instead of setState
      const state = ProcessesStore.getState();
      ProcessesStore.setState({
        ...state,
        origins: formattedOrigins,
        users: formattedUsers,
        suppliers: formattedSuppliers,
        documentTypes: formattedDocumentTypes,
        customers: formattedCustomers,
        products: formattedProducts,
        entryOrderStatus: formattedStatus,
        warehouses: formattedWarehouses,
        temperatureRanges: formattedTemperatureRanges,
        packagingTypes: formattedPackagingTypes,
        packagingStatuses: formattedPackagingStatuses,
      });

      console.log("Updated ProcessesStore state:", ProcessesStore.getState());
    } catch (err) {
      console.error("fetch entry form fields error", err);
      throw new Error("Failed to fetch entry form fields");
    }
  },

  /**
   * Create a new entry order with multiple products - Updated
   */
  createNewEntryOrder: async (formData: any) => {
    const payload = {
      ...formData,
      organisation_id: localStorage.getItem("organisation_id"),
      order_type: "ENTRY",
      created_by: localStorage.getItem("id"),
    };

    // Validate products array
    if (
      !payload.products ||
      !Array.isArray(payload.products) ||
      payload.products.length === 0
    ) {
      throw new Error("At least one product is required");
    }

    // Validate each product has required fields
    payload.products.forEach((product: any, index: number) => {
      if (
        !product.product_id ||
        !product.quantity_packaging ||
        !product.total_weight
      ) {
        throw new Error(
          `Product ${
            index + 1
          }: Missing required fields (product_id, quantity_packaging, total_weight)`
        );
      }
    });

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

      // Fix: Use action method instead of setState with prev parameter
      const { setDepartureFormFields } = ProcessesStore.getState();
      setDepartureFormFields({
        customers: formattedCustomers,
        documentTypes: formattedDocumentTypes,
        users: formattedUsers,
        packagingTypes: formattedPackaging,
        labels: formattedLabels,
      });
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
   * Fetch a single entry order by order number - Updated to handle multi-product structure
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

      // Transform the entry order to include calculated totals for UI display
      const transformedEntry = {
        ...entry,
        // These totals are now calculated from individual products
        total_products: entry.products?.length || 0,
        total_quantity_packaging: entry.total_quantity_packaging || 0,
        total_weight: entry.total_weight || 0,
        total_volume: entry.total_volume || 0,
        remaining_packaging_qty: entry.remaining_packaging_qty || 0,
        remaining_weight: entry.remaining_weight || 0,
      };

      setCurrentEntryOrder(transformedEntry);
      return transformedEntry;
    } catch (err) {
      console.error("fetch entry order by no error", err);
      setCurrentEntryOrder(null);
      throw new Error("Failed to fetch entry order details");
    } finally {
      stopLoader("processes/fetch-entry-order");
    }
  },

  /**
   * Create an audit record for an entry order product - Updated for product-specific audits
   */
  createAudit: async (data: {
    entry_order_id?: string | number;
    entry_order_product_id?: string | number;
    audit_result: string;
    comments?: string;
    discrepancy_notes?: string;
    packaging_condition?: string;
  }) => {
    try {
      const response = await api.post(`${auditBaseURL}`, data);

      // Refresh the entry order data after audit creation
      if (data.entry_order_id) {
        await ProcessService.fetchEntryOrderAudits(
          data.entry_order_id.toString()
        );
      }

      return response.data;
    } catch (err) {
      console.error("create audit error", err);
      throw new Error("Failed to create audit");
    }
  },

  /**
   * Create a new product-specific audit record with packaging updates
   */
  createAudit: async (data: {
    entry_order_product_id: string | number;
    audit_result: string;
    comments?: string;
    discrepancy_notes?: string;
    packaging_condition?: string;
    packaging_type?: string;
    packaging_status?: string;
    product_comments?: string;
    overall_audit_comments?: string;
    audited_by?: string;
  }) => {
    try {
      const payload = {
        ...data,
        audited_by: data.audited_by || localStorage.getItem("id"),
      };
      
      const response = await api.post(`${auditBaseURL}`, payload);
      return response.data;
    } catch (err) {
      console.error("create audit error", err);
      throw new Error("Failed to create audit");
    }
  },

  /**
   * Create multiple product audits at once (bulk audit)
   */
  createBulkAudit: async (data: {
    audits: Array<{
      entry_order_product_id: string | number;
      audit_result: string;
      comments?: string;
      discrepancy_notes?: string;
      packaging_condition?: string;
      packaging_type?: string;
      packaging_status?: string;
      product_comments?: string;
    }>;
    overall_audit_comments?: string;
  }) => {
    try {
      const payload = {
        auditsData: data.audits,
        auditorId: localStorage.getItem("id"),
        overall_audit_comments: data.overall_audit_comments,
      };
      
      const response = await api.post(`${auditBaseURL}/bulk`, payload);
      return response.data;
    } catch (err) {
      console.error("bulk audit error", err);
      throw new Error("Failed to create bulk audit");
    }
  },

  /**
   * Get products pending audit for a specific entry order
   */
  fetchPendingProductAudits: async (entryOrderId: string) => {
    try {
      const response = await api.get(`${auditBaseURL}/pending/${entryOrderId}`);
      return response.data;
    } catch (err) {
      console.error("fetch pending product audits error", err);
      throw new Error("Failed to fetch pending product audits");
    }
  },

  /**
   * Get entry orders with pending audits
   */
  fetchEntryOrdersWithPendingAudits: async () => {
    try {
      const response = await api.get(`${auditBaseURL}/pending-orders`);
      return response.data;
    } catch (err) {
      console.error("fetch entry orders with pending audits error", err);
      throw new Error("Failed to fetch entry orders with pending audits");
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

  /**
   * Fetch passed entry orders that have remaining inventory - Updated for multi-product
   */
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

  // Departure inventory management methods
  async getProductsWithInventory(warehouseId?: string) {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : "";
    const response = await api.get(
      `${departureBaseURL}/products-with-inventory${params}`
    );
    return response.data;
  },

  async getAvailableCellsForProduct(productId: string, warehouseId?: string) {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : "";
    const response = await api.get(
      `${departureBaseURL}/cells-for-product/${productId}${params}`
    );
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

  loadProductsWithInventory: async (warehouseId: string) => {
    const {
      startLoader,
      stopLoader,
      setProductsWithInventory,
      setInventoryError,
    } = ProcessesStore.getState();

    startLoader("processes/load-products-inventory");
    try {
      const response = await ProcessService.getProductsWithInventory(
        warehouseId
      );
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
    const { startLoader, stopLoader, setAvailableCells, setInventoryError } =
      ProcessesStore.getState();

    startLoader("processes/load-cells");
    try {
      const response = await ProcessService.getAvailableCellsForProduct(
        productId,
        warehouseId
      );
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
    const { startLoader, stopLoader, setCellValidation, setInventoryError } =
      ProcessesStore.getState();

    startLoader("processes/validate-cell");
    setInventoryError("");

    try {
      const response = await ProcessService.validateSelectedCell(data);
      setCellValidation(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error validating cell:", error);
      setInventoryError(
        error.response?.data?.message || "Error validating cell selection"
      );
      setCellValidation(null);
      throw error;
    } finally {
      stopLoader("processes/validate-cell");
    }
  },

  createDepartureOrderWithState: async (formData: any) => {
    const { startLoader, stopLoader, setSubmitStatus, cellValidation } =
      ProcessesStore.getState();

    if (!cellValidation) {
      setSubmitStatus({
        success: false,
        message: "Please select and validate a cell before submitting",
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
        insured_value: formData.insured_value
          ? parseFloat(formData.insured_value)
          : null,
      };

      const result = await ProcessService.createNewDepartureOrder(
        submissionData
      );

      setSubmitStatus({
        success: true,
        message: "departure_order_created_successfully",
      });

      return result;
    } catch (error: any) {
      console.error("Departure order creation failed:", error);
      setSubmitStatus({
        success: false,
        message:
          error.response?.data?.message || "failed_to_create_departure_order",
      });
      throw error;
    } finally {
      stopLoader("processes/submit-departure");
    }
  },

  async fetchWarehouses() {
    const { startLoader, stopLoader, setWarehouses } =
      ProcessesStore.getState();

    startLoader("processes/fetch-warehouses");
    try {
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

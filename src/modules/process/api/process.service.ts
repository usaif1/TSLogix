/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { ProcessesStore } from "@/globalStore";

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
};

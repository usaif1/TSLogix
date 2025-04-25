/* eslint-disable @typescript-eslint/no-explicit-any */
// api client
import api from "@/utils/api/axios.config";

// store
import { ProcessesStore } from "@/globalStore";

// Updated base URLs
const entryBaseURL = "/entry";
const departureBaseURL = "/departure";

const { setEntryOrders, setDepartureOrders } =
  ProcessesStore.getState();

export const ProcessService = {
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

  // fetch all dropdown fields for new entry order form
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
        value: user.id,
        label: [user.first_name, user.middle_name, user.last_name]
          .filter(Boolean)
          .join(" "),
      }));

      const formattedSuppliers = suppliers.map((supplier: any) => ({
        value: supplier.supplier_id,
        label: supplier.name,
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
    } catch (err) {
      console.error("fetch entry form fields error", err);
      throw new Error("Failed to fetch entry form fields");
    }
  },

  // create new entry order
  createNewEntryOrder: async (formData: any) => {
    const payload = {
      ...formData,
      organisation_id: localStorage.getItem("organisation_id"),
      order_type: "ENTRY",
      created_by: localStorage.getItem("id"),
    };
    const response = await api.post(
      `${entryBaseURL}/create-entry-order`,
      payload
    );
    return response;
  },

  // fetch last order number
  fetchCurrentOrderNumber: async () => {
    const response = await api.get(`${entryBaseURL}/current-order-number`);
    ProcessesStore.setState((prev) => ({
      ...prev,
      currentEntryOrderNo: response.data.currentOrderNo,
    }));
    return response.data.currentOrderNo;
  },

  // fetch all departure orders
  fetchAllDepartureOrders: async (searchQuery = "") => {
    try {
      let endpoint = `${departureBaseURL}/departure-orders`;
      if (searchQuery) {
        endpoint += `?orderNo=${encodeURIComponent(searchQuery)}`;
      }
      const response = await api.get(endpoint);
      setDepartureOrders(response.data.data);
    } catch (err) {
      console.error("fetch departure orders error", err);
      throw new Error("Failed to fetch departure orders");
    } 
  },

  // fetch dropdown fields for departure form
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

  // create new departure order
  createNewDepartureOrder: async (formData: any) => {
    const response = await api.post(
      `${departureBaseURL}/create-departure-order`,
      formData
    );
    return response;
  },
};

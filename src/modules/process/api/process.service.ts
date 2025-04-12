/* eslint-disable @typescript-eslint/no-explicit-any */
// api client
import api from "@/utils/api/axios.config";

// store
import { ProcessesStore } from "@/globalStore";

const baseURL = "/processes";

const setEntryOrders = ProcessesStore.getState().setEntryOrders;
const setDepartureOrders = ProcessesStore.getState().setDepartureOrders;
const startLoader = ProcessesStore.getState().startLoader;
const stopLoader = ProcessesStore.getState().stopLoader;

export const ProcessService = {
  // fetch all entry orders
  fetchAllEntryOrders: async (searchQuery = "") => {
    try {
      startLoader("processes/fetch-entry-orders");
      let endpoint = `${baseURL}/entry-orders`;
      if (searchQuery) {
        endpoint += `?orderNo=${encodeURIComponent(searchQuery)}`;
      }
      const response = await api.get(endpoint);
      setEntryOrders(response.data.data);
    } catch (err) {
      console.log("fetch entry orders error", err);
      throw new Error("Failed to fetch entry orders");
    } finally {
      stopLoader("processes/fetch-entry-orders");
    }
  },

  //   fetch all dropdown fields for new entry order form
  fetchEntryOrderFormFields: async () => {
    const response = await api.get(`${baseURL}/entry-formfields`);

    console.log(response.data);

    const {
      origins,
      users,
      suppliers,
      documentTypes,
      customers,
      products,
      orderStatus,
    } = response.data;

    // change to react-select compatible dropdown options -
    const formattedOrigins = origins.map((origin: any) => {
      return {
        value: origin.origin_id,
        label: origin.name,
      };
    });

    const formattedUsers = users.map((user: any) => {
      return {
        value: user.id,
        label: `${user.first_name || ""} ${user?.middle_name || ""} ${
          user?.last_name || ""
        }`,
      };
    });

    const formattedSuppliers = suppliers.map((supplier: any) => {
      return {
        value: supplier.supplier_id,
        label: supplier.name,
      };
    });

    const formattedDocumentTypes = documentTypes.map((documentType: any) => {
      return {
        value: documentType.document_type_id,
        label: documentType.name,
      };
    });

    const formattedCusomters = (customers || []).map((customers: any) => {
      return {
        value: customers.customer_id,
        label: customers.name,
      };
    });

    const formattedProducts = (products || []).map((product: any) => {
      return {
        value: product.product_id,
        label: product.name,
      };
    });

    const formattedStatus = (orderStatus || []).map((status: any) => ({
      value: status.status_id,
      label: status.name,
    }));

    // { value: "originOption1", label: "originOption1" },

    ProcessesStore.setState((prevState) => ({
      ...prevState,
      origins: formattedOrigins,
      users: formattedUsers,
      suppliers: formattedSuppliers,
      documentTypes: formattedDocumentTypes,
      customers: formattedCusomters,
      products: formattedProducts,
      entryOrderStatus: formattedStatus,
    }));
  },
  //   create new entry order
  createNewEntryOrder: async (formData: any) => {
    const response = await api.post(`${baseURL}/create-entry-order`, {
      ...formData,
      organisation_id: localStorage.getItem("organisation_id"),
      order_type: "ENTRY",
      created_by: localStorage.getItem("id"),
    });

    return response;
  },

  createNewDepartureOrder: async (formData: any) => {
    const response = await api.post(`${baseURL}/create-departure-order`, {
      ...formData,
    });

    return response;
  },

  // fetch last order number
  fetchCurrentOrderNumber: async () => {
    const response = await api.get(`${baseURL}/current-order-number`);
    ProcessesStore.setState((prevState) => ({
      ...prevState,
      currentEntryOrderNo: response.data,
    }));

    return response.data;
  },

  fetchAllDepartureOrders: async (searchQuery = "") => {
    try {
      startLoader("processes/fetch-departure-orders");
      let endpoint = `${baseURL}/departure-orders`;
      if (searchQuery) {
        endpoint += `?orderNo=${encodeURIComponent(searchQuery)}`;
      }
      const response = await api.get(endpoint);
      setDepartureOrders(response.data.data);
    } catch (err) {
      console.log("fetch departure orders error", err);
      throw new Error("Failed to fetch departure orders");
    } finally {
      stopLoader("processes/fetch-departure-orders");
    }
  },

  fetchDepartureFormFields: async () => {
    try {
      const response = await api.get(`${baseURL}/departure-formfields`);
      const { customers, documentTypes, users, packagingTypes, labels } =
        response.data.data;

      const formattedCustomers = customers.map((customer: any) => ({
        value: customer.customer_id,
        label: customer.name,
      }));

      const formattedDocumentTypes = documentTypes.map((documentType: any) => ({
        value: documentType.document_type_id,
        label: documentType.name,
      }));

      const formattedUsers = users.map((user: any) => ({
        value: user.id,
        label: `${user.first_name || ""} ${user.middle_name || ""} ${
          user.last_name || ""
        }`,
      }));

      const formattedPackagingTypes = packagingTypes.map(
        (packagingType: any) => ({
          value: packagingType.packaging_type_id,
          label: packagingType.name,
        })
      );

      const formattedLabels = labels.map((label: any) => ({
        value: label.label_id,
        label: label.name,
      }));

      // Update your global store with the formatted data.
      ProcessesStore.setState((prevState) => ({
        ...prevState,
        departureFormFields: {
          customers: formattedCustomers,
          documentTypes: formattedDocumentTypes,
          users: formattedUsers,
          packagingTypes: formattedPackagingTypes,
          labels: formattedLabels,
        },
      }));
    } catch (error) {
      console.error("Error fetching departure form fields", error);
      throw new Error("Failed to fetch departure form fields");
    }
  },
};

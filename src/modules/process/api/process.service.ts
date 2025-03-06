/* eslint-disable @typescript-eslint/no-explicit-any */
// api client
import api from "@/utils/api/axios.config";

// store
import { ProcessesStore } from "@/globalStore";

const baseURL = "/processes";

const setEntryOrders = ProcessesStore.getState().setEntryOrders;

export const ProcessService = {
  // fetch all entry orders
  fetchAllEntryOrders: async () => {
    const response = await api.get(`${baseURL}/entry-orders`);

    setEntryOrders(response.data.data);
  },

  //   fetch all dropdown fields for new entry order form
  fetchEntryOrderFormFields: async () => {
    const response = await api.get(`${baseURL}/entry-formfields`);

    console.log(response.data);

    const { origins, users, suppliers, documentTypes } = response.data;

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

    // { value: "originOption1", label: "originOption1" },

    ProcessesStore.setState((prevState) => ({
      ...prevState,
      origins: formattedOrigins,
      users: formattedUsers,
      suppliers: formattedSuppliers,
      documentTypes: formattedDocumentTypes,
    }));
  },
  //   create new entry order
  createNewEntryOrder: async (formData: any) => {
    const response = await api.post(`${baseURL}/create-entry-order`, {
      ...formData,
    });

    return response;
  },
};

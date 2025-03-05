// api client
import api from "@/utils/api/axios.config";

// store
import { ProcessesStore } from "@/globalStore";

const baseURL = "/processes";

const setEntryOrders = ProcessesStore.getState().setEntryOrders;

export const ProcessService = {
  fetchAllEntryOrders: async () => {
    const response = await api.get(`${baseURL}/entry-orders`);

    setEntryOrders(response.data.data);
  },
};

import api from "@/utils/api/axios.config";
import { ClientStore } from "@/modules/client/store";

const baseURL = "/clients";

const {
  setClients,
  setCurrentClient,
  addClient,
  setClientFormFields,
  setAvailableCells,
  startLoader,
  stopLoader,
} = ClientStore.getState();

export interface JuridicoClientPayload {
  client_type: "JURIDICO";
  company_name: string;
  company_type: string;
  establishment_type: string;
  ruc: string;
  email: string;
  address: string;
  phone: string;
  cell_phone: string;
  active_state_id: string;
  client_users?: Array<{
    name: string;
  }>;
}

export interface NaturalClientPayload {
  client_type: "NATURAL";
  first_names: string;
  last_name: string;
  mothers_last_name: string;
  individual_id: string;
  date_of_birth: string;
  email: string;
  address: string;
  phone: string;
  cell_phone: string;
  active_state_id: string;
  client_users?: Array<{
    name: string;
  }>;
}

export type ClientPayload = JuridicoClientPayload | NaturalClientPayload;

export interface JuridicoClientWithCellsPayload extends JuridicoClientPayload {
  cell_ids?: string[];
  warehouse_id?: string;
  assigned_by?: string;
  notes?: string;
}

export interface NaturalClientWithCellsPayload extends NaturalClientPayload {
  cell_ids?: string[];
  warehouse_id?: string;
  assigned_by?: string;
  notes?: string;
}

export type ClientWithCellsPayload = JuridicoClientWithCellsPayload | NaturalClientWithCellsPayload;

export interface ClientFormFields {
  client_types: Array<{ value: string; label: string }>;
  establishment_types: Array<{ value: string; label: string }>;
  company_types: Array<{ value: string; label: string }>;
  active_states: Array<{ value: string; label: string }>;
  required_fields: {
    juridico: string[];
    natural: string[];
  };
  field_descriptions: Record<string, string>;
}

export interface AvailableCell {
  id: string;
  row: string;
  bay: number;
  position: number;
  capacity: number;
  status: string;
  cell_role: string;
  warehouse: {
    warehouse_id: string;
    name: string;
    location: string;
  };
}

export interface ClientCellAssignment {
  client_id: string;
  cell_id?: string; // For single cell assignment
  cell_ids?: string[]; // For multiple cell assignment
  warehouse_id?: string;
  assigned_by: string;
  observations?: string;
  notes?: string;
  max_capacity?: number;
}

export const ClientService = {
  // Fetch all clients with filters
  fetchClients: async (filters?: {
    client_type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      startLoader("clients/fetch-clients");
      const response = await api.get(baseURL, { params: filters });
      const data = response.data.data || response.data;
      
      // Set clients data
      setClients(data.clients || data);
      
      // Set pagination data if available
      if (data.pagination) {
        const { setPagination } = ClientStore.getState();
        setPagination(data.pagination);
      }
      
      return data;
    } catch (error) {
      console.error("Fetch clients error:", error);
      throw error;
    } finally {
      stopLoader("clients/fetch-clients");
    }
  },

  // Fetch single client by ID
  fetchClientById: async (clientId: string) => {
    try {
      startLoader("clients/fetch-client");
      const response = await api.get(`${baseURL}/${clientId}`);
      const data = response.data.data || response.data;
      setCurrentClient(data);
      return data;
    } catch (error) {
      console.error("Fetch client error:", error);
      throw error;
    } finally {
      stopLoader("clients/fetch-client");
    }
  },

  // Create new client with optional cell assignment
  createClientWithCells: async (clientData: ClientWithCellsPayload) => {
    try {
      startLoader("clients/create-client");
      
      const userId = localStorage.getItem("id");
      if (!userId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const payload = {
        ...clientData,
        created_by: userId,
        organisation_id: localStorage.getItem("organisation_id"),
        assigned_by: userId, // Set assigned_by to current user
      };

      console.log("=== CREATING CLIENT WITH CELLS ===");
      console.log("URL:", baseURL);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await api.post(baseURL, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Client created with cells successfully:", response.data);

      const data = response.data.data || response.data;
      addClient(data);
      return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Client creation with cells failed:", error);

      let errorMessage = "Failed to create client. Please try again.";

      if (error.response) {
        console.error("Backend error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });

        if (error.response.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    } finally {
      stopLoader("clients/create-client");
    }
  },

  // Create new client (without cells)
  createClient: async (clientData: ClientPayload) => {
    try {
      startLoader("clients/create-client");
      
      const userId = localStorage.getItem("id");
      if (!userId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const payload = {
        ...clientData,
        created_by: userId,
        organisation_id: localStorage.getItem("organisation_id"),
      };

      console.log("=== CREATING CLIENT ===");
      console.log("URL:", baseURL);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await api.post(baseURL, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Client created successfully:", response.data);

      const data = response.data.data || response.data;
      addClient(data);
      return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Client creation failed:", error);

      let errorMessage = "Failed to create client. Please try again.";

      if (error.response) {
        console.error("Backend error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });

        if (error.response.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    } finally {
      stopLoader("clients/create-client");
    }
  },

  // Update existing client
  updateClient: async (clientId: string, clientData: Partial<ClientPayload>) => {
    try {
      startLoader("clients/update-client");
      
      const userId = localStorage.getItem("id");
      const payload = {
        ...clientData,
        updated_by: userId,
      };

      const response = await api.put(`${baseURL}/${clientId}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data.data || response.data;
      setCurrentClient(data);
      return data;
    } catch (error) {
      console.error("Update client error:", error);
      throw error;
    } finally {
      stopLoader("clients/update-client");
    }
  },

  // Delete client
  deleteClient: async (clientId: string) => {
    try {
      startLoader("clients/delete-client");
      const response = await api.delete(`${baseURL}/${clientId}`);
      return response.data;
    } catch (error) {
      console.error("Delete client error:", error);
      throw error;
    } finally {
      stopLoader("clients/delete-client");
    }
  },

  // Fetch form fields for client creation
  fetchClientFormFields: async () => {
    try {
      startLoader("clients/fetch-form-fields");
      const response = await api.get(`${baseURL}/form-fields`);
      const data: ClientFormFields = response.data.data || response.data;
      setClientFormFields(data);
      return data;
    } catch (error) {
      console.error("Fetch client form fields error:", error);
      throw error;
    } finally {
      stopLoader("clients/fetch-form-fields");
    }
  },

  // Fetch available cells for assignment
  fetchAvailableCells: async (warehouseId?: string) => {
    try {
      startLoader("clients/fetch-available-cells");
      const params = warehouseId ? { warehouse_id: warehouseId } : {};
      const response = await api.get(`${baseURL}/cells/available`, { params });
      const data = response.data.data || response.data;
      setAvailableCells(data.cells || []);
      return data;
    } catch (error) {
      console.error("Fetch available cells error:", error);
      throw error;
    } finally {
      stopLoader("clients/fetch-available-cells");
    }
  },

  // Assign cell to client
  assignCellToClient: async (assignmentData: ClientCellAssignment) => {
    try {
      startLoader("clients/assign-cell");
      
      const userId = localStorage.getItem("id");
      const payload = {
        ...assignmentData,
        assigned_by: userId,
      };

      const response = await api.post(`${baseURL}/assign-cells`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error("Assign cell to client error:", error);
      throw error;
    } finally {
      stopLoader("clients/assign-cell");
    }
  },

  // Remove cell assignment from client
  removeCellAssignment: async (clientId: string, cellId: string) => {
    try {
      startLoader("clients/remove-cell-assignment");
      const response = await api.delete(`${baseURL}/${clientId}/cells/${cellId}`);
      return response.data;
    } catch (error) {
      console.error("Remove cell assignment error:", error);
      throw error;
    } finally {
      stopLoader("clients/remove-cell-assignment");
    }
  },

  // Fetch warehouses for cell assignment
  fetchWarehouses: async () => {
    try {
      const response = await api.get("/warehouse/warehouses");
      const data = response.data.data || response.data;
      return data;
    } catch (error) {
      console.error("Fetch warehouses error:", error);
      throw error;
    }
  },
};
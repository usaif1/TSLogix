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
  active_states: Array<{ state_id: string; name: string }>;
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
  assignment_id?: string;
  client_id: string;
  cell_id?: string; // For single cell assignment
  cell_ids?: string[]; // For multiple cell assignment
  warehouse_id?: string;
  assigned_at?: string;
  assigned_by: string;
  is_active?: boolean;
  priority?: number;
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
        is_active: true, // Ensure new assignments are active by default
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

  // Deactivate cell assignment from client (set is_active to false)
  deactivateCellAssignment: async (clientId: string, cellId: string) => {
    try {
      startLoader("clients/remove-cell-assignment");
      
      const userId = localStorage.getItem("id");
      const currentDate = new Date().toISOString();
      const payload = {
        is_active: false,
        notes: `Deactivated by ${userId} on ${currentDate}`
      };
      
      const response = await api.put(`${baseURL}/${clientId}/cells/${cellId}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Deactivate cell assignment error:", error);
      throw error;
    } finally {
      stopLoader("clients/remove-cell-assignment");
    }
  },

  // Reactivate cell assignment (set is_active to true)
  reactivateCellAssignment: async (clientId: string, cellId: string) => {
    try {
      startLoader("clients/assign-cell");
      
      const userId = localStorage.getItem("id");
      const currentDate = new Date().toISOString();
      const payload = {
        is_active: true,
        notes: `Reactivated by ${userId} on ${currentDate}`
      };
      
      const response = await api.put(`${baseURL}/${clientId}/cells/${cellId}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Reactivate cell assignment error:", error);
      throw error;
    } finally {
      stopLoader("clients/assign-cell");
    }
  },

  // Alias for backward compatibility
  removeCellAssignment: async (clientId: string, cellId: string) => {
    return ClientService.deactivateCellAssignment(clientId, cellId);
  },

  // Update client with cell reassignment
  updateClientWithCellReassignment: async (clientId: string, updateData: Record<string, unknown>) => {
    try {
      startLoader("clients/update-client");
      
      const userId = localStorage.getItem("id");
      const payload = {
        ...updateData,
        updated_by: userId,
      };

      const response = await api.put(`${baseURL}/${clientId}/comprehensive-update`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data.data || response.data;
      setCurrentClient(data);
      return data;
    } catch (error) {
      console.error("Update client with cell reassignment error:", error);
      throw error;
    } finally {
      stopLoader("clients/update-client");
    }
  },

  // Fetch warehouses for cell assignment
  fetchWarehouses: async (): Promise<{ warehouse_id: string; name: string }[]> => {
    startLoader("clients/fetch-warehouses");
    try {
      const response = await api.get("/warehouse/warehouses");
      
      console.log("Raw warehouse API response:", response.data);
      
      // Handle the nested response structure - warehouses are in response.data.data
      let warehouseList: { warehouse_id: string; name: string }[] = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        // API returns { success, message, count, data: [...] }
        warehouseList = response.data.data.map((warehouse: { warehouse_id: string; name: string; [key: string]: unknown }) => ({
          warehouse_id: warehouse.warehouse_id,
          name: warehouse.name,
        }));
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback: direct array response
        warehouseList = response.data.map((warehouse: { warehouse_id: string; name: string; [key: string]: unknown }) => ({
          warehouse_id: warehouse.warehouse_id,
          name: warehouse.name,
        }));
      }
      
      console.log("Processed warehouse list for client module:", warehouseList);
      
      return warehouseList;
    } catch (err) {
      console.error("Fetch warehouses error:", err);
      throw err;
    } finally {
      stopLoader("clients/fetch-warehouses");
    }
  },

  // Fetch available cells with client assignments
  fetchAvailableCellsWithClientAssignments: async (clientId: string, warehouseId?: string) => {
    try {
      startLoader("clients/fetch-available-cells-with-assignments");
      const params: { client_id: string; warehouse_id?: string } = { client_id: clientId };
      if (warehouseId) {
        params.warehouse_id = warehouseId;
      }
      const response = await api.get(`${baseURL}/cells/available-with-assignments`, { params });
      const data = response.data.data || response.data;
      setAvailableCells(data.cells || []);
      return data;
    } catch (error) {
      console.error("Fetch available cells with assignments error:", error);
      throw error;
    } finally {
      stopLoader("clients/fetch-available-cells-with-assignments");
    }
  },
};
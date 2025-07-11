import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Select, { SingleValue } from "react-select";

// Components
import { Button, Text, TextInput, Divider } from "@/components";
import WarehouseCellSelector from "./WarehouseCellSelector";

// Services and Store
import { ClientService, ClientWithCellsPayload } from "@/modules/client/api/client.service";
import { ClientStore, Client } from "@/modules/client/store";

interface FormData {
  client_type: "JURIDICO" | "NATURAL" | "";
  
  // Juridico fields (formerly Commercial)
  company_name: string;
  company_type: string;
  establishment_type: string;
  ruc: string;
  
  // Natural fields (formerly Individual)
  first_names: string;
  last_name: string;
  mothers_last_name: string;
  individual_id: string;
  date_of_birth: string;
  
  // Common fields
  email: string;
  address: string;
  phone: string;
  cell_phone: string;
  active_state_id: string;
  
  // Client users array - new feature
  client_users: Array<{
    id: string; // temporary ID for form management
    name: string;
  }>;
}

interface Cell {
  id: string;
  row: string;
  bay: number;
  position: number;
  capacity: number;
  currentUsage: number;
  status: "AVAILABLE" | "OCCUPIED" | "DAMAGED" | "EXPIRED";
  cell_role: string;
  is_passage: boolean;
  warehouse: {
    warehouse_id: string;
    name: string;
    location: string;
  };
}

interface OptionType {
  value: string;
  label: string;
}

const ClientForm: React.FC = () => {
  const { t } = useTranslation(['client', 'common']);
  const navigate = useNavigate();
  
  // Store state
  const clientFormFields = ClientStore.use.clientFormFields();
  const isLoading = ClientStore.use.loaders()['clients/create-client'];
  const isLoadingFields = ClientStore.use.loaders()['clients/fetch-form-fields'];

  const [formData, setFormData] = useState<FormData>({
    client_type: "",
    // Commercial fields
    company_name: "",
    company_type: "",
    establishment_type: "",
    ruc: "",
    // Individual fields
    first_names: "",
    last_name: "",
    mothers_last_name: "",
    individual_id: "",
    date_of_birth: "",
    // Common fields
    email: "",
    address: "",
    phone: "",
    cell_phone: "",
    active_state_id: "",
    // Client users array - new feature
    client_users: [],
  });

  // Cell assignment state
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [cellAssignmentNotes, setCellAssignmentNotes] = useState("");

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load form fields on component mount
  useEffect(() => {
    const loadFormFields = async () => {
      try {
        await ClientService.fetchClientFormFields();
      } catch (error) {
        console.error("Error loading form fields:", error);
        toast.error("Failed to load form fields");
      }
    };

    loadFormFields();
  }, []);

  // Auto-select first active state when form fields load
  useEffect(() => {
    if (clientFormFields?.active_states && clientFormFields.active_states.length > 0 && !formData.active_state_id) {
      setFormData(prev => ({
        ...prev,
        active_state_id: clientFormFields.active_states[0].value
      }));
    }
  }, [clientFormFields, formData.active_state_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: keyof FormData, selectedOption: SingleValue<OptionType>) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption?.value || ""
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Reset type-specific fields when client type changes
    if (name === "client_type") {
      setFormData(prev => ({
        ...prev,
        // Reset commercial fields
        company_name: "",
        company_type: "",
        establishment_type: "",
        ruc: "",
        // Reset individual fields
        first_names: "",
        last_name: "",
        mothers_last_name: "",
        individual_id: "",
        date_of_birth: "",
      }));
      setValidationErrors({});
      // Reset cell assignment and client users when client type changes
      setSelectedCells([]);
      setSelectedWarehouseId(null);
      setCellAssignmentNotes("");
    }
  };

  const handleCellSelectionChange = (cells: Cell[]) => {
    setSelectedCells(cells);
  };

  const handleWarehouseChange = (warehouseId: string | null) => {
    setSelectedWarehouseId(warehouseId);
  };

  // Client users management functions
  const addClientUser = () => {
    const newUser = {
      id: `temp_${Date.now()}`, // temporary ID for form management
      name: "",
    };
    setFormData(prev => ({
      ...prev,
      client_users: [...prev.client_users, newUser]
    }));
  };

  const removeClientUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      client_users: prev.client_users.filter(user => user.id !== userId)
    }));
  };

  const updateClientUser = (userId: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      client_users: prev.client_users.map(user => 
        user.id === userId ? { ...user, name } : user
      )
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Common validations
    if (!formData.client_type) {
      errors.client_type = t('client:validation.client_type_required');
    }
    if (!formData.email) {
      errors.email = t('client:validation.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('client:validation.email_invalid');
    }
    if (!formData.address) {
      errors.address = t('client:validation.address_required');
    }
    if (!formData.phone) {
      errors.phone = t('client:validation.phone_required');
    }

    // Type-specific validations
    if (formData.client_type === "JURIDICO") {
      if (!formData.company_name) {
        errors.company_name = t('client:validation.company_name_required');
      }
      if (!formData.ruc) {
        errors.ruc = t('client:validation.ruc_required');
      } else if (!/^\d{11}$/.test(formData.ruc)) {
        errors.ruc = t('client:validation.ruc_invalid');
      }
      if (!formData.establishment_type) {
        errors.establishment_type = t('client:validation.establishment_type_required');
      }
      if (!formData.company_type) {
        errors.company_type = t('client:validation.company_type_required');
      }
    } else if (formData.client_type === "NATURAL") {
      if (!formData.first_names) {
        errors.first_names = t('client:validation.first_names_required');
      }
      if (!formData.last_name) {
        errors.last_name = t('client:validation.last_name_required');
      }
      if (!formData.individual_id) {
        errors.individual_id = t('client:validation.individual_id_required');
      } else if (!/^\d{8}$/.test(formData.individual_id)) {
        errors.individual_id = t('client:validation.individual_id_invalid');
      }
      if (!formData.date_of_birth) {
        errors.date_of_birth = t('client:validation.date_of_birth_required');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('client:validation.form_has_errors'));
      return;
    }

    try {
      let clientPayload: ClientWithCellsPayload;

      if (formData.client_type === "JURIDICO") {
        clientPayload = {
          client_type: "JURIDICO",
          company_name: formData.company_name,
          company_type: formData.company_type,
          establishment_type: formData.establishment_type,
          ruc: formData.ruc,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          cell_phone: formData.cell_phone,
          active_state_id: formData.active_state_id,
          client_users: formData.client_users.filter(user => user.name.trim()).map(user => ({
            name: user.name.trim()
          })),
        };
      } else {
        clientPayload = {
          client_type: "NATURAL",
          first_names: formData.first_names,
          last_name: formData.last_name,
          mothers_last_name: formData.mothers_last_name,
          individual_id: formData.individual_id,
          date_of_birth: formData.date_of_birth,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          cell_phone: formData.cell_phone,
          active_state_id: formData.active_state_id,
          client_users: formData.client_users.filter(user => user.name.trim()).map(user => ({
            name: user.name.trim()
          })),
        };
      }

      // Add cell assignment data if cells are selected
      if (selectedCells.length > 0 && selectedWarehouseId) {
        clientPayload.cell_ids = selectedCells.map(cell => cell.id);
        clientPayload.warehouse_id = selectedWarehouseId;
        clientPayload.notes = cellAssignmentNotes;
      }

      console.log("Creating client with payload:", JSON.stringify(clientPayload, null, 2));

      // Create client with or without cell assignment in a single API call
      const result: Client = await ClientService.createClientWithCells(clientPayload);
      
      // Show success message and redirect
      if (selectedCells.length > 0) {
        toast.success(`Client created and ${selectedCells.length} cell(s) assigned successfully`);
      } else {
        toast.success(t('client:messages.client_created_successfully'));
      }

      // Redirect to client list page
      navigate("/maintenance/client");
      
      // Reset form
      setFormData({
        client_type: "",
        company_name: "",
        company_type: "",
        establishment_type: "",
        ruc: "",
        first_names: "",
        last_name: "",
        mothers_last_name: "",
        individual_id: "",
        date_of_birth: "",
        email: "",
        address: "",
        phone: "",
        cell_phone: "",
        active_state_id: clientFormFields?.active_states?.[0]?.value || "",
        client_users: [],
      });
      setValidationErrors({});
      setSelectedCells([]);
      setSelectedWarehouseId(null);
      setCellAssignmentNotes("");

      console.log("Client created:", result);
      
    } catch (error: unknown) {
      console.error("Error creating client:", error);
      const errorMessage = error instanceof Error ? error.message : t('client:messages.client_creation_failed');
      toast.error(errorMessage);
    }
  };

  if (isLoadingFields) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <Text additionalClass="mt-4">{t('common:loading')}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client:fields.client_type')} *
                </label>
                <Select
                  value={clientFormFields?.client_types?.find(option => option.value === formData.client_type) || null}
                  onChange={(selectedOption) => handleSelectChange('client_type', selectedOption)}
                  options={clientFormFields?.client_types || []}
                  placeholder={t('client:placeholders.select_client_type')}
                  isClearable
                  className={validationErrors.client_type ? "border-red-500" : ""}
                />
                {validationErrors.client_type && (
                  <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.client_type}</Text>
                )}
              </div>
            </div>

            <Divider height="sm" />

            {/* Juridico Client Fields */}
            {formData.client_type === "JURIDICO" && (
              <>
                <div className="space-y-4">
                  <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
                    {t('client:sections.commercial_information')}
                  </Text>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.company_name')} *
                      </label>
                      <TextInput
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.company_name')}
                        className={validationErrors.company_name ? "border-red-500" : ""}
                      />
                      {validationErrors.company_name && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.company_name}</Text>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.ruc')} *
                      </label>
                      <TextInput
                        name="ruc"
                        value={formData.ruc}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.ruc')}
                        maxLength={11}
                        className={validationErrors.ruc ? "border-red-500" : ""}
                      />
                      {validationErrors.ruc && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.ruc}</Text>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.establishment_type')} *
                      </label>
                      <Select
                        value={clientFormFields?.establishment_types?.find(option => option.value === formData.establishment_type) || null}
                        onChange={(selectedOption) => handleSelectChange('establishment_type', selectedOption)}
                        options={clientFormFields?.establishment_types || []}
                        placeholder={t('client:placeholders.establishment_type')}
                        isClearable
                        className={validationErrors.establishment_type ? "border-red-500" : ""}
                      />
                      {validationErrors.establishment_type && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.establishment_type}</Text>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.company_type')} *
                      </label>
                      <Select
                        value={clientFormFields?.company_types?.find(option => option.value === formData.company_type) || null}
                        onChange={(selectedOption) => handleSelectChange('company_type', selectedOption)}
                        options={clientFormFields?.company_types || []}
                        placeholder={t('client:placeholders.company_type')}
                        isClearable
                        className={validationErrors.company_type ? "border-red-500" : ""}
                      />
                      {validationErrors.company_type && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.company_type}</Text>
                      )}
                    </div>
                  </div>
                </div>
                <Divider height="sm" />
              </>
            )}

            {/* Natural Client Fields */}
            {formData.client_type === "NATURAL" && (
              <>
                <div className="space-y-4">
                  <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
                    {t('client:sections.personal_information')}
                  </Text>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.first_names')} *
                      </label>
                      <TextInput
                        name="first_names"
                        value={formData.first_names}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.first_names')}
                        className={validationErrors.first_names ? "border-red-500" : ""}
                      />
                      {validationErrors.first_names && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.first_names}</Text>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.last_name')} *
                      </label>
                      <TextInput
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.last_name')}
                        className={validationErrors.last_name ? "border-red-500" : ""}
                      />
                      {validationErrors.last_name && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.last_name}</Text>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.mothers_last_name')}
                      </label>
                      <TextInput
                        name="mothers_last_name"
                        value={formData.mothers_last_name}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.mothers_last_name')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.individual_id')} *
                      </label>
                      <TextInput
                        name="individual_id"
                        value={formData.individual_id}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.individual_id')}
                        maxLength={8}
                        className={validationErrors.individual_id ? "border-red-500" : ""}
                      />
                      {validationErrors.individual_id && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.individual_id}</Text>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.date_of_birth')} *
                      </label>
                      <TextInput
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className={validationErrors.date_of_birth ? "border-red-500" : ""}
                      />
                      {validationErrors.date_of_birth && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.date_of_birth}</Text>
                      )}
                    </div>
                  </div>
                </div>
                <Divider height="sm" />
              </>
            )}

            {/* Common Contact Information */}
            {formData.client_type && (
              <>
                <div className="space-y-4">
                  <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
                    {t('client:sections.contact_information')}
                  </Text>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.email')} *
                      </label>
                      <TextInput
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.email')}
                        className={validationErrors.email ? "border-red-500" : ""}
                      />
                      {validationErrors.email && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.email}</Text>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.phone')} *
                      </label>
                      <TextInput
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.phone')}
                        className={validationErrors.phone ? "border-red-500" : ""}
                      />
                      {validationErrors.phone && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.phone}</Text>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.cell_phone')}
                      </label>
                      <TextInput
                        name="cell_phone"
                        value={formData.cell_phone}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.cell_phone')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.address')} *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder={t('client:placeholders.address')}
                        rows={3}
                        className={`w-full rounded-sm text-base py-1 px-1 focus-visible:outline-none bg-salwa-beige text-salwa-black ${
                          validationErrors.address ? "border-red-500" : ""
                        }`}
                      />
                      {validationErrors.address && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.address}</Text>
                      )}
                    </div>
                  </div>
                </div>

                <Divider height="sm" />

                {/* Client Users Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Text size="lg" weight="font-semibold" additionalClass="text-gray-800">
                      {t('client:sections.client_users')}
                    </Text>
                    <Button
                      type="button"
                      variant="action"
                      onClick={addClientUser}
                      additionalClass="text-sm px-3 py-1"
                    >
                      {t('client:buttons.add_user')}
                    </Button>
                  </div>

                  {formData.client_users.length > 0 && (
                    <div className="space-y-3">
                      {formData.client_users.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <TextInput
                              value={user.name}
                              onChange={(e) => updateClientUser(user.id, e.target.value)}
                              placeholder={t('client:placeholders.user_name')}
                              className="w-full"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="cancel"
                            onClick={() => removeClientUser(user.id)}
                            additionalClass="text-sm px-2 py-1"
                          >
                            {t('client:buttons.remove')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.client_users.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {t('client:messages.no_users_added')}
                    </div>
                  )}
                </div>

                <Divider height="sm" />

                {/* Warehouse Cell Selector */}
                <WarehouseCellSelector
                  selectedCells={selectedCells}
                  onCellSelectionChange={handleCellSelectionChange}
                  warehouseId={selectedWarehouseId}
                  onWarehouseChange={handleWarehouseChange}
                />

                {/* Cell Assignment Notes */}
                {selectedCells.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:cell_assignment.assignment_notes')}
                      </label>
                      <textarea
                        value={cellAssignmentNotes}
                        onChange={(e) => setCellAssignmentNotes(e.target.value)}
                        placeholder={t('client:cell_assignment.notes_placeholder')}
                        rows={3}
                        className="w-full rounded-sm text-base py-1 px-1 focus-visible:outline-none bg-salwa-beige text-salwa-black"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            {formData.client_type && (
              <div className="flex justify-end pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  additionalClass="min-w-32"
                >
                  {isLoading ? t('common:creating') : t('client:buttons.create_client')}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientForm; 
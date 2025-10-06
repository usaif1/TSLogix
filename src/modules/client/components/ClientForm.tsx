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
  client_code: string; // Auto-generated client code
  
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
    email?: string;
    password?: string;
    confirm_password?: string;
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
    client_code: "", // Auto-generated client code
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

  // Load form fields and client code on component mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Load form fields and client code in parallel
        const [, clientCodeResponse] = await Promise.all([
          ClientService.fetchClientFormFields(),
          ClientService.fetchNextClientCode()
        ]);
        
        // Set the auto-generated client code
        console.log("Client code response:", clientCodeResponse);
        const clientCode = clientCodeResponse.data?.next_client_code || clientCodeResponse.next_client_code || "";
        console.log("Extracted client code:", clientCode);
        
        setFormData(prev => ({
          ...prev,
          client_code: clientCode
        }));
      } catch (error) {
        console.error("Error loading form data:", error);
        toast.error("Failed to load form data");
      }
    };

    loadFormData();
  }, []);

  // Auto-select "Active" state when form fields load
  useEffect(() => {
    if (clientFormFields?.active_states && clientFormFields.active_states.length > 0 && !formData.active_state_id) {
      // Find "Active" state, fallback to first if not found
      const activeState = clientFormFields.active_states.find(state => state.name === "Active") || clientFormFields.active_states[0];
      setFormData(prev => ({
        ...prev,
        active_state_id: activeState.state_id
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
      email: "",
      password: "",
      confirm_password: "",
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

  const updateClientUser = (userId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      client_users: prev.client_users.map(user =>
        user.id === userId ? { ...user, [field]: value } : user
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

    // Validate client users
    formData.client_users.forEach((user, index) => {
      if (user.name.trim()) {
        // If username is provided, validate other fields
        if (user.password && user.confirm_password && user.password !== user.confirm_password) {
          errors[`client_user_${user.id}_password`] = `Usuario ${index + 1}: Las contraseñas no coinciden`;
        }
        if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          errors[`client_user_${user.id}_email`] = `Usuario ${index + 1}: Email inválido`;
        }
      }
    });

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
          client_code: formData.client_code,
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
            name: user.name.trim(),
            email: user.email || `${user.name.toLowerCase().replace(/\s+/g, '.')}@${formData.email.split('@')[1]}`,
            password: user.password || formData.ruc || 'TempPass123!' // Use RUC as default password for JURIDICO
          })),
        };
      } else {
        clientPayload = {
          client_type: "NATURAL",
          client_code: formData.client_code,
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
            name: user.name.trim(),
            email: user.email || `${user.name.toLowerCase().replace(/\s+/g, '.')}@${formData.email.split('@')[1]}`,
            password: user.password || formData.individual_id || 'TempPass123!' // Use individual_id as default password for NATURAL
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
        client_code: "", // Will be auto-loaded when needed
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
        active_state_id: clientFormFields?.active_states?.find(state => state.name === "Active")?.state_id || clientFormFields?.active_states?.[0]?.state_id || "",
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
            {/* Client Code and Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client:fields.client_code')}
                </label>
                <TextInput
                  name="client_code"
                  value={formData.client_code}
                  placeholder={t('client:placeholders.client_code')}
                  disabled
                  additionalClass="bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client:fields.active_state')} *
                      </label>
                      <Select
                        value={clientFormFields?.active_states?.find(state => state.state_id === formData.active_state_id) ? {
                          value: formData.active_state_id,
                          label: clientFormFields.active_states.find(state => state.state_id === formData.active_state_id)?.name || ''
                        } : null}
                        onChange={(selectedOption) => handleSelectChange('active_state_id', selectedOption)}
                        options={clientFormFields?.active_states?.map(state => ({
                          value: state.state_id,
                          label: state.name
                        })) || []}
                        placeholder={t('client:placeholders.select_active_state')}
                        className={validationErrors.active_state_id ? "border-red-500" : ""}
                      />
                      {validationErrors.active_state_id && (
                        <Text additionalClass="text-red-500 text-sm mt-1">{validationErrors.active_state_id}</Text>
                      )}
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
                    <div className="space-y-4">
                      {formData.client_users.map((user, index) => (
                        <div key={user.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <Text size="sm" weight="font-medium" additionalClass="text-gray-700">
                              {t('client:sections.user')} {index + 1}
                            </Text>
                            <Button
                              type="button"
                              variant="cancel"
                              onClick={() => removeClientUser(user.id)}
                              additionalClass="text-sm px-2 py-1"
                            >
                              {t('client:buttons.remove')}
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* User Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('client:labels.username')} *
                              </label>
                              <TextInput
                                value={user.name}
                                onChange={(e) => updateClientUser(user.id, 'name', e.target.value)}
                                placeholder={t('client:placeholders.username_example')}
                                className="w-full"
                              />
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('client:labels.email')}
                              </label>
                              <TextInput
                                value={user.email || ''}
                                onChange={(e) => updateClientUser(user.id, 'email', e.target.value)}
                                placeholder={t('client:placeholders.user_email')}
                                type="email"
                                className="w-full"
                              />
                              {validationErrors[`client_user_${user.id}_email`] && (
                                <p className="text-xs text-red-600 mt-1">
                                  {validationErrors[`client_user_${user.id}_email`]}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {t('client:hints.email_auto_generate')}
                              </p>
                            </div>

                            {/* Password */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('client:labels.password')}
                              </label>
                              <TextInput
                                value={user.password || ''}
                                onChange={(e) => updateClientUser(user.id, 'password', e.target.value)}
                                placeholder={t('client:placeholders.initial_password')}
                                type="password"
                                className="w-full"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {t('client:hints.password_default', {
                                  type: formData.client_type === 'JURIDICO' ? 'RUC' : t('client:terms.individual_id')
                                })}
                              </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('client:labels.confirm_password')}
                              </label>
                              <TextInput
                                value={user.confirm_password || ''}
                                onChange={(e) => updateClientUser(user.id, 'confirm_password', e.target.value)}
                                placeholder={t('client:placeholders.repeat_password')}
                                type="password"
                                className="w-full"
                              />
                              {validationErrors[`client_user_${user.id}_password`] && (
                                <p className="text-xs text-red-600 mt-1">
                                  {validationErrors[`client_user_${user.id}_password`]}
                                </p>
                              )}
                            </div>
                          </div>
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
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Select, { SingleValue } from "react-select";

// Components
import { Button, Text, TextInput, LoaderSync } from "@/components";

// Services and Store
import { ClientService } from "@/modules/client/api/client.service";
import { Client, ClientStore } from "@/modules/client/store";

interface ClientEditModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OptionType {
  value: string;
  label: string;
}

const ClientEditModal: React.FC<ClientEditModalProps> = ({
  client,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation(['client', 'common']);

  // Store state
  const clientFormFields = ClientStore.use.clientFormFields();
  const isUpdating = ClientStore.use.loaders()['clients/update-client'];
  const isLoadingFormFields = ClientStore.use.loaders()['clients/fetch-form-fields'];

  // Form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Cell assignment state
  const [selectedWarehouse, setSelectedWarehouse] = useState<OptionType | null>(null);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [cellAssignmentNotes, setCellAssignmentNotes] = useState("");
  const [reassignCells, setReassignCells] = useState(false);

  // Available warehouses (will be fetched)
  const [warehouses, setWarehouses] = useState<OptionType[]>([]);
  
  // Available cells state
  const [cellData, setCellData] = useState<any>(null);
  const isLoadingCells = ClientStore.use.loaders()['clients/fetch-available-cells-with-assignments'];

  // Initialize form data
  useEffect(() => {
    if (client) {
      if (client.client_type === "JURIDICO") {
        setFormData({
          client_type: "JURIDICO",
          company_name: client.company_name || "",
          company_type: client.company_type || "",
          establishment_type: client.establishment_type || "",
          ruc: client.ruc || "",
          email: client.email || "",
          address: client.address || "",
          phone: client.phone || "",
          cell_phone: client.cell_phone || "",
          active_state_id: client.active_state_id || "",
        });
      } else {
        setFormData({
          client_type: "NATURAL",
          first_names: client.first_names || "",
          last_name: client.last_name || "",
          mothers_last_name: client.mothers_last_name || "",
          individual_id: client.individual_id || "",
          date_of_birth: client.date_of_birth || "",
          email: client.email || "",
          address: client.address || "",
          phone: client.phone || "",
          cell_phone: client.cell_phone || "",
          active_state_id: client.active_state_id || "",
        });
      }
    }
  }, [client]);

  // Load form fields and warehouses on mount
  useEffect(() => {
    if (isOpen) {
      loadFormFields();
      loadWarehouses();
    }
  }, [isOpen]);

  // Load available cells when warehouse changes
  useEffect(() => {
    if (selectedWarehouse && reassignCells) {
      loadAvailableCells(selectedWarehouse.value);
    } else {
      setCellData(null);
      setSelectedCells([]);
    }
  }, [selectedWarehouse, reassignCells]);

  const loadFormFields = async () => {
    try {
      await ClientService.fetchClientFormFields();
    } catch (error) {
      console.error("Error loading form fields:", error);
      toast.error("Failed to load form fields");
    }
  };

  const loadWarehouses = async () => {
    try {
      const warehouseList = await ClientService.fetchWarehouses();
      const warehouseOptions = warehouseList.map(warehouse => ({
        value: warehouse.warehouse_id,
        label: warehouse.name
      }));
      setWarehouses(warehouseOptions);
    } catch (error) {
      console.error("Error loading warehouses:", error);
      toast.error("Failed to load warehouses");
    }
  };

  const loadAvailableCells = async (warehouseId: string) => {
    try {
      const response = await ClientService.fetchAvailableCellsWithClientAssignments(client.client_id, warehouseId);
      setCellData(response);
    } catch (error) {
      console.error("Error loading available cells:", error);
      toast.error("Failed to load available cells");
      setCellData(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, selectedOption: SingleValue<OptionType>) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: selectedOption?.value || "" 
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.email) {
      newErrors.email = t('client:validation.email_required');
    }
    if (!formData.phone) {
      newErrors.phone = t('client:validation.phone_required');
    }

    if (formData.client_type === "JURIDICO") {
      if (!formData.company_name) {
        newErrors.company_name = t('client:validation.company_name_required');
      }
      if (!formData.ruc) {
        newErrors.ruc = t('client:validation.ruc_required');
      }
    } else {
      if (!formData.first_names) {
        newErrors.first_names = t('client:validation.first_names_required');
      }
      if (!formData.last_name) {
        newErrors.last_name = t('client:validation.last_name_required');
      }
      if (!formData.individual_id) {
        newErrors.individual_id = t('client:validation.individual_id_required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare update payload
      const updatePayload: Record<string, unknown> = { ...formData };

      // Add cell reassignment data if needed
      if (reassignCells && selectedCells.length > 0 && selectedWarehouse) {
        updatePayload.reassign_cells = true;
        updatePayload.cell_ids = selectedCells;
        updatePayload.warehouse_id = selectedWarehouse.value;
        updatePayload.assignment_notes = cellAssignmentNotes || `Cell reassignment for ${client.client_id}`;
      }

      // Use the comprehensive update endpoint if we have cell reassignments
      if (reassignCells) {
        await ClientService.updateClientWithCellReassignment(client.client_id, updatePayload);
      } else {
        // Use regular update endpoint for client info only
        await ClientService.updateClient(client.client_id, formData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
    }
  };


  if (!isOpen) return null;

  const isJuridico = formData.client_type === "JURIDICO";

  // Create options from form fields
  const establishmentTypeOptions = clientFormFields?.establishment_types?.map(type => ({
    value: type.value,
    label: type.label
  })) || [];

  const companyTypeOptions = clientFormFields?.company_types?.map(type => ({
    value: type.value,
    label: type.label
  })) || [];

  const activeStateOptions = clientFormFields?.active_states?.map(state => ({
    value: state.state_id,
    label: state.name
  })) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('client:buttons.edit_client')}
            </h2>
            <Button
              variant="action"
              onClick={onClose}
              additionalClass="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>

          {isLoadingFormFields ? (
            <div className="flex justify-center py-8">
              <LoaderSync loaderText={t('common:loading')} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('client:sections.basic_information')}
                </h3>
                
                {/* Client Code - Read Only */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('client:fields.client_code')}
                  </label>
                  <TextInput
                    name="client_code"
                    value={client.client_code || 'N/A'}
                    disabled
                    additionalClass="bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isJuridico ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.company_name')} *
                        </label>
                        <TextInput
                          name="company_name"
                          value={formData.company_name || ""}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.company_name && (
                          <div className="text-red-500 text-sm mt-1">{errors.company_name}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.ruc')} *
                        </label>
                        <TextInput
                          name="ruc"
                          value={formData.ruc || ""}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.ruc && (
                          <div className="text-red-500 text-sm mt-1">{errors.ruc}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.establishment_type')}
                        </label>
                        <Select
                          value={establishmentTypeOptions.find(option => option.value === formData.establishment_type)}
                          onChange={(selectedOption) => handleSelectChange('establishment_type', selectedOption)}
                          options={establishmentTypeOptions}
                          placeholder={t('client:placeholders.select_establishment_type')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.company_type')}
                        </label>
                        <Select
                          value={companyTypeOptions.find(option => option.value === formData.company_type)}
                          onChange={(selectedOption) => handleSelectChange('company_type', selectedOption)}
                          options={companyTypeOptions}
                          placeholder={t('client:placeholders.select_company_type')}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.first_names')} *
                        </label>
                        <TextInput
                          name="first_names"
                          value={formData.first_names || ""}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.first_names && (
                          <div className="text-red-500 text-sm mt-1">{errors.first_names}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.last_name')} *
                        </label>
                        <TextInput
                          name="last_name"
                          value={formData.last_name || ""}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.last_name && (
                          <div className="text-red-500 text-sm mt-1">{errors.last_name}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.mothers_last_name')}
                        </label>
                        <TextInput
                          name="mothers_last_name"
                          value={formData.mothers_last_name || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.individual_id')} *
                        </label>
                        <TextInput
                          name="individual_id"
                          value={formData.individual_id || ""}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.individual_id && (
                          <div className="text-red-500 text-sm mt-1">{errors.individual_id}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.date_of_birth')}
                        </label>
                        <TextInput
                          name="date_of_birth"
                          type="date"
                          value={formData.date_of_birth || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('client:sections.contact_information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('client:fields.email')} *
                    </label>
                    <TextInput
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.email && (
                      <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('client:fields.phone')} *
                    </label>
                    <TextInput
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.phone && (
                      <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('client:fields.cell_phone')}
                    </label>
                    <TextInput
                      name="cell_phone"
                      value={formData.cell_phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('client:fields.active_state')}
                    </label>
                    <Select
                      value={activeStateOptions.find(option => option.value === formData.active_state_id)}
                      onChange={(selectedOption) => handleSelectChange('active_state_id', selectedOption)}
                      options={activeStateOptions}
                      placeholder={t('client:placeholders.select_active_state')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('client:fields.address')}
                    </label>
                    <TextInput
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Cell Assignment Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('client:sections.cell_assignments')}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="reassign_cells"
                      checked={reassignCells}
                      onChange={(e) => setReassignCells(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="reassign_cells" className="text-sm font-medium text-gray-700">
                      {t('client:fields.reassign_cells')}
                    </label>
                  </div>
                </div>

                {reassignCells && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('client:fields.select_warehouse')} *
                      </label>
                      <Select
                        value={selectedWarehouse}
                        onChange={setSelectedWarehouse}
                        options={warehouses}
                        placeholder={t('client:placeholders.select_warehouse')}
                        required={reassignCells}
                      />
                    </div>

                    {selectedWarehouse && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('client:fields.select_cells')} *
                        </label>
                        {isLoadingCells ? (
                          <div className="flex items-center justify-center h-32 border rounded-lg bg-gray-50">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                              <Text additionalClass="mt-2 text-sm">{t('common:loading')}</Text>
                            </div>
                          </div>
                        ) : !cellData ? (
                          <div className="p-4 border rounded-lg bg-gray-50 text-center">
                            <Text additionalClass="text-gray-500">No cells available in this warehouse</Text>
                          </div>
                        ) : (
                          <div className="border rounded-lg bg-gray-50">
                            <CellAssignmentDisplay 
                              cellData={cellData}
                              selectedCells={selectedCells}
                              onCellSelection={setSelectedCells}
                              t={t}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('client:fields.assignment_notes')}
                      </label>
                      <TextInput
                        name="assignment_notes"
                        value={cellAssignmentNotes}
                        onChange={(e) => setCellAssignmentNotes(e.target.value)}
                        placeholder={t('client:placeholders.assignment_notes')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="action"
                  onClick={onClose}
                  disabled={isUpdating}
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdating || (reassignCells && (!selectedWarehouse || selectedCells.length === 0))}
                >
                  {isUpdating ? t('client:buttons.updating') : t('client:buttons.update_client')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Cell Assignment Display Component
interface CellAssignmentDisplayProps {
  cellData: any;
  selectedCells: string[];
  onCellSelection: (cells: string[]) => void;
  t: any;
}

const CellAssignmentDisplay: React.FC<CellAssignmentDisplayProps> = ({
  cellData,
  selectedCells,
  onCellSelection,
  t
}) => {
  const formatCellReference = (cell: any): string => {
    return cell.cell_reference || `${cell.row}.${String(cell.bay).padStart(2, "0")}.${String(cell.position).padStart(2, "0")}`;
  };

  const handleCellToggle = (cellId: string) => {
    if (selectedCells.includes(cellId)) {
      onCellSelection(selectedCells.filter(id => id !== cellId));
    } else {
      onCellSelection([...selectedCells, cellId]);
    }
  };

  const getCellStatusColor = (cell: any, isSelected: boolean) => {
    if (isSelected) {
      return "bg-blue-500 text-white border-blue-600";
    }
    
    // Color based on availability status
    if (cell.availability_status === "assigned_to_client") {
      return "bg-green-400 border-green-500 text-green-900 hover:bg-green-500";
    }
    
    if (cell.availability_status === "assigned_to_others") {
      return "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed";
    }
    
    // Available unassigned cells - color by cell role
    if (cell.cell_role === "REJECTED") {
      return "bg-red-300 border-red-500 text-red-900 hover:bg-red-400";
    }
    if (cell.cell_role === "SAMPLES") {
      return "bg-purple-300 border-purple-500 text-purple-900 hover:bg-purple-400";
    }
    if (cell.cell_role === "RETURNS") {
      return "bg-blue-300 border-blue-500 text-blue-900 hover:bg-blue-400";
    }
    
    // Standard cells
    return "bg-emerald-400 border-emerald-500 text-emerald-900 hover:bg-emerald-500";
  };

  const renderCellSection = (title: string, cells: any[], sectionColor: string) => {
    if (!cells || cells.length === 0) return null;

    // Group cells by row for better display
    const cellsByRow = cells.reduce((acc, cell) => {
      if (!acc[cell.row]) {
        acc[cell.row] = [];
      }
      acc[cell.row].push(cell);
      return acc;
    }, {} as Record<string, any[]>);

    const sortedRows = Object.keys(cellsByRow).sort((a, b) => {
      const specialRows = ["Q", "R", "T", "V"];
      const aIsSpecial = specialRows.includes(a);
      const bIsSpecial = specialRows.includes(b);
      
      if (!aIsSpecial && !bIsSpecial) {
        return a.localeCompare(b);
      }
      if (!aIsSpecial && bIsSpecial) return -1;
      if (aIsSpecial && !bIsSpecial) return 1;
      
      const specialOrder = { "Q": 0, "R": 1, "T": 2, "V": 3 };
      return specialOrder[a as keyof typeof specialOrder] - specialOrder[b as keyof typeof specialOrder];
    });

    return (
      <div className="mb-4">
        <div className={`p-3 border-b ${sectionColor}`}>
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm">{title} ({cells.length})</h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  const selectableCells = cells.filter(cell => cell.availability_status !== "assigned_to_others");
                  const cellIds = selectableCells.map(cell => cell.id);
                  const newSelected = [...new Set([...selectedCells, ...cellIds])];
                  onCellSelection(newSelected);
                }}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('client:cell_sections.select_all')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const cellIds = cells.map(cell => cell.id);
                  const newSelected = selectedCells.filter(id => !cellIds.includes(id));
                  onCellSelection(newSelected);
                }}
                className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                {t('client:cell_sections.clear_section')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-3 max-h-64 overflow-y-auto">
          {sortedRows.map((row) => {
            const rowCells = cellsByRow[row];
            const isSpecialRow = ["R", "T", "V"].includes(row);
            
            return (
              <div key={row} className="mb-3">
                <div className={`px-2 py-1 mb-2 rounded text-sm font-medium ${isSpecialRow ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                  {t('client:cell_assignment.row')} {row} ({rowCells.length} {t('client:cell_assignment.cells')})
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1">
                  {rowCells
                    .sort((a: any, b: any) => a.bay - b.bay || a.position - b.position)
                    .map((cell:any) => {
                      const isSelected = selectedCells.includes(cell.id);
                      const isClickable = cell.availability_status !== "assigned_to_others";
                      
                      return (
                        <button
                          key={cell.id}
                          type="button"
                          onClick={() => isClickable ? handleCellToggle(cell.id) : null}
                          disabled={!isClickable}
                          className={`
                            relative w-12 h-10 text-[8px] font-medium border rounded transition-colors
                            ${getCellStatusColor(cell, isSelected)}
                            ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                          `}
                          title={`${formatCellReference(cell)} - ${cell.availability_status} - Role: ${cell.cell_role}`}
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <span className="font-mono text-[7px] leading-none">
                              {formatCellReference(cell)}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-[8px]">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const totalCells = (cellData.cells?.assigned_to_client?.length || 0) + 
                    (cellData.cells?.available_unassigned?.length || 0) + 
                    (cellData.cells?.assigned_to_others?.length || 0);

  return (
    <div>
      <div className="p-3 border-b bg-white">
        <div className="flex justify-between items-center">
          <Text additionalClass="text-sm font-medium text-gray-700">
            {t('client:cell_sections.total_cells')}: {totalCells} | {t('client:cell_sections.selected_count')}: {selectedCells.length}
          </Text>
          <button
            type="button"
            onClick={() => onCellSelection([])}
            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t('client:cell_sections.clear_all')}
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {renderCellSection(
          t('client:cell_sections.currently_assigned'),
          cellData.cells?.assigned_to_client || [],
          "bg-green-50"
        )}
        
        {renderCellSection(
          t('client:cell_sections.available_unassigned'),
          cellData.cells?.available_unassigned || [],
          "bg-gray-50"
        )}
        
        {renderCellSection(
          t('client:cell_sections.assigned_to_others'),
          cellData.cells?.assigned_to_others || [],
          "bg-orange-50"
        )}
      </div>

      {/* Legend */}
      <div className="p-3 bg-gray-50 border-t">
        <Text additionalClass="text-sm font-medium text-gray-700 mb-2">{t('client:cell_assignment.legend.title')}:</Text>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-green-400"></div>
            <span>{t('client:cell_assignment.legend.assigned_to_client')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-emerald-400"></div>
            <span>{t('client:cell_assignment.legend.available')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-red-300"></div>
            <span>{t('client:cell_assignment.rejected')} (R)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-purple-300"></div>
            <span>{t('client:cell_assignment.samples')} (T)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-blue-300"></div>
            <span>{t('client:cell_assignment.returns')} (V)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-gray-200"></div>
            <span>{t('client:cell_assignment.legend.assigned_to_others')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
            <span>{t('client:cell_assignment.legend.selected')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientEditModal;
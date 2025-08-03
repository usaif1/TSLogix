/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import Select, { CSSObjectWithLabel, SingleValue } from "react-select";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Services and Store
import { SupplierService } from "@/modules/maintenance/api/maintenance.service";
import { MaintenanceStore } from "@/globalStore";

// Styling for react-select
const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface CountryOption {
  value: string;
  label: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface FormData {
  // Company information
  company_name: string;
  category: string;
  document_type: "RUC" | "ID_FISCAL" | "";
  
  // Document fields
  supplier_code: string;
  ruc: string;
  tax_id: string;
  
  // Address information
  address: string;
  city: string;
  registered_address: string;
  country: CountryOption | null;
  
  // Contact information
  contact_person: string;
  contact_no: string;
  phone: string;
  email: string;
  
  // Additional information
  notes: string;
  
  // Legacy fields for backward compatibility
  name: string;
}

const EditSupplier: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();

  // Store state
  const countries = MaintenanceStore.use.countries();
  const supplierCategoryOptions = MaintenanceStore.use.supplierCategoryOptions();
  const loaders = MaintenanceStore.use.loaders();
  const currentSupplier = MaintenanceStore.use.currentSupplier();
  
  const isUpdating = loaders['suppliers/update-supplier'];
  const isLoadingFormFields = loaders['suppliers/fetch-form-fields'];
  const isLoadingSupplier = loaders['suppliers/fetch-supplier'];

  // Form state
  const [formData, setFormData] = useState<FormData>({
    // Company information
    company_name: "",
    category: "",
    document_type: "",
    
    // Document fields
    supplier_code: "",
    ruc: "",
    tax_id: "",
    
    // Address information
    address: "",
    city: "",
    registered_address: "",
    country: null,
    
    // Contact information
    contact_person: "",
    contact_no: "",
    phone: "",
    email: "",
    
    // Additional information
    notes: "",
    
    // Legacy fields
    name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  console.log("EditSupplier component rendered with supplierId:", supplierId);
  console.log("Current formData:", formData);

  // Load form fields and supplier data
  useEffect(() => {
    console.log("EditSupplier useEffect - supplierId:", supplierId);
    
    // Reset form and data loaded flag when supplier changes
    setIsDataLoaded(false);
    setFormData({
      // Company information
      company_name: "",
      category: "",
      document_type: "",
      
      // Document fields
      supplier_code: "",
      ruc: "",
      tax_id: "",
      
      // Address information
      address: "",
      city: "",
      registered_address: "",
      country: null,
      
      // Contact information
      contact_person: "",
      contact_no: "",
      phone: "",
      email: "",
      
      // Additional information
      notes: "",
      
      // Legacy fields
      name: "",
    });
    
    loadFormFields();
    if (supplierId) {
      loadSupplierData();
    } else {
      console.error("No supplierId found in URL params");
    }
  }, [supplierId]);

  // Update form when supplier data changes
  useEffect(() => {
    console.log("Form population useEffect triggered:");
    console.log("- currentSupplier:", currentSupplier);
    console.log("- countries.length:", countries.length);
    console.log("- isDataLoaded:", isDataLoaded);
    
    if (currentSupplier && !isDataLoaded) {
      console.log("Calling populateFormWithSupplierData...");
      populateFormWithSupplierData(currentSupplier);
      setIsDataLoaded(true);
    }
  }, [currentSupplier, isDataLoaded]);

  // Separate effect to update country when countries are loaded
  useEffect(() => {
    if (currentSupplier && countries.length > 0 && isDataLoaded) {
      console.log("Updating country field with loaded countries...");
      console.log("Current supplier country data:", currentSupplier.country);
      console.log("Available countries:", countries);
      
      // Try multiple ways to find the correct country
      let countryOption = null;
      
      // First try: match with country.country_id
      if (currentSupplier.country?.country_id) {
        countryOption = countries.find(country => 
          country.value === currentSupplier.country.country_id
        );
      }
      
      // Second try: match with direct country_id field
      if (!countryOption && currentSupplier.country_id) {
        countryOption = countries.find(country => 
          country.value === currentSupplier.country_id
        );
      }
      
      // Third try: match by country name
      if (!countryOption && currentSupplier.country?.name) {
        countryOption = countries.find(country => 
          country.label === currentSupplier.country.name
        );
      }
      
      console.log("Found country option:", countryOption);
      
      if (countryOption) {
        setFormData(prev => ({
          ...prev,
          country: countryOption
        }));
      }
    }
  }, [countries, currentSupplier, isDataLoaded]);

  const loadFormFields = async () => {
    try {
      if (countries.length === 0 || supplierCategoryOptions.length === 0) {
        await SupplierService.fetchSupplierFormFields();
      }
    } catch (error) {
      console.error("Error loading form fields:", error);
      toast.error(t('failed_to_load_form_fields'));
    }
  };

  const loadSupplierData = async () => {
    if (!supplierId) {
      console.error("No supplier ID provided");
      toast.error(t('supplier_not_found'));
      return;
    }

    try {
      console.log("Loading supplier data for ID:", supplierId);
      const supplierData = await SupplierService.fetchSupplierById(supplierId);
      console.log("Supplier data loaded successfully:", supplierData);
    } catch (error) {
      console.error("Error loading supplier:", error);
      toast.error(t('failed_to_load_supplier'));
      // Don't redirect automatically, let user decide
    }
  };

  const populateFormWithSupplierData = (supplier: any) => {
    console.log("Populating form with supplier data:", supplier);

    // Find country option with improved matching logic
    let countryOption = null;
    
    if (countries.length > 0) {
      // First try: match with country.country_id
      if (supplier.country?.country_id) {
        countryOption = countries.find(country => 
          country.value === supplier.country.country_id
        );
      }
      
      // Second try: match with direct country_id field
      if (!countryOption && supplier.country_id) {
        countryOption = countries.find(country => 
          country.value === supplier.country_id
        );
      }
      
      // Third try: match by country name
      if (!countryOption && supplier.country?.name) {
        countryOption = countries.find(country => 
          country.label === supplier.country.name
        );
      }
      
      console.log("Found country option during population:", countryOption);
    }

    // Determine document type based on RUC field
    let documentType = "";
    if (supplier.ruc || supplier.tax_id) {
      // You can add logic here to determine if it's RUC or ID_FISCAL
      // For now, default to RUC if there's a value
      documentType = "RUC";
    }

    const newFormData = {
      // Company information
      company_name: supplier.company_name || "",
      category: supplier.category || "",
      document_type: documentType,
      
      // Document fields
      supplier_code: supplier.supplier_code || "",
      ruc: supplier.ruc || supplier.tax_id || "",
      tax_id: supplier.tax_id || supplier.ruc || "",
      
      // Address information
      address: supplier.address || "",
      city: supplier.city || "",
      registered_address: supplier.registered_address || "",
      country: countryOption, // This will be updated later when countries load
      
      // Contact information
      contact_person: supplier.contact_person || "",
      contact_no: supplier.contact_no || supplier.phone || "",
      phone: supplier.phone || supplier.contact_no || "",
      email: supplier.email || "",
      
      // Additional information
      notes: supplier.notes || "",
      
      // Legacy fields
      name: supplier.name || supplier.company_name || "",
    };

    console.log("Setting form data:", newFormData);
    setFormData(newFormData);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = t('company_name_required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalid_email_format');
    }

    // Validate RUC if document type is RUC
    if (formData.document_type === "RUC" && !formData.ruc.trim()) {
      newErrors.ruc = t('ruc_required_for_peru');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!supplierId) {
      toast.error(t('supplier_not_found'));
      return;
    }

    try {
      const updateData = {
        // Company information
        company_name: formData.company_name,
        category: formData.category,
        
        // Document fields
        supplier_code: formData.supplier_code,
        tax_id: formData.ruc, // Use ruc as tax_id
        ruc: formData.ruc,
        
        // Address information
        address: formData.address,
        city: formData.city,
        registered_address: formData.registered_address,
        country_id: formData.country?.value || null,
        
        // Contact information
        name: formData.company_name, // Use company_name as name for API compatibility
        contact_person: formData.contact_person,
        contact_no: formData.contact_no,
        phone: formData.phone,
        email: formData.email,
        
        // Additional information
        notes: formData.notes,
      };

      console.log("Updating supplier with data:", updateData);
      await SupplierService.updateSupplier(supplierId, updateData);
      
      toast.success(t('supplier_updated_successfully'));
      navigate('/maintenance/supplier');
    } catch (error: any) {
      console.error("Error updating supplier:", error);
      toast.error(error.message || t('failed_to_update_supplier'));
    }
  };

  const handleCancel = () => {
    navigate('/maintenance/supplier');
  };

  // Loading state
  if (isLoadingSupplier || isLoadingFormFields) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <LoaderSync />
          <Text additionalClass="ml-3">{t('common:loading')}</Text>
        </div>
      </div>
    );
  }

  // Error state - supplier not found but not loading
  if (!isLoadingSupplier && !currentSupplier && supplierId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Text size="xl" weight="font-semibold" additionalClass="text-gray-900 mb-4">
              {t('supplier_not_found')}
            </Text>
            <Text additionalClass="text-gray-600 mb-6">
              {t('failed_to_load_supplier')}
            </Text>
            <div className="space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/maintenance/supplier')}
              >
                {t('common:back')}
              </Button>
              <Button
                variant="primary"
                onClick={() => loadSupplierData()}
              >
                {t('common:retry')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Text size="3xl" weight="font-bold" additionalClass="text-gray-900 mb-2">
                {t('edit_supplier')}
              </Text>
              <Text additionalClass="text-gray-600">
                {t('update_supplier_information')}
              </Text>
            </div>
            <Button
              variant="secondary"
              onClick={handleCancel}
            >
              {t('common:back')}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('company_name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className={`w-full h-11 border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.company_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('enter_company_name')}
                  />
                  {errors.company_name && (
                    <Text size="sm" additionalClass="text-red-500 mt-1">
                      {errors.company_name}
                    </Text>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('supplier_code')}
                  </label>
                  <input
                    type="text"
                    value={formData.supplier_code}
                    className="w-full h-11 border border-gray-300 rounded-md px-3 bg-gray-100 text-gray-600"
                    placeholder={t('supplier_code')}
                    readOnly
                  />
                </div>
              </div>

              {/* Section 2: Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('supplier_category')}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enter_supplier_category')}
                  />
                </div>
                <div></div>
              </div>

              {/* Section 3: Document Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('document_type')}
                  </label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => handleInputChange('document_type', e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('select_document_type')}</option>
                    <option value="RUC">{t('ruc')}</option>
                    <option value="ID_FISCAL">{t('id_fiscal')}</option>
                  </select>
                </div>
                <div></div>
              </div>

              {/* Document Number Input - Shows based on document type selection */}
              {formData.document_type && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.document_type === "RUC" ? t('ruc_number') : t('id_fiscal_number')}
                      {formData.document_type === "RUC" && " *"}
                    </label>
                    <input
                      type="text"
                      value={formData.ruc}
                      onChange={(e) => handleInputChange('ruc', e.target.value)}
                      className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        formData.document_type === "RUC" 
                          ? t('enter_ruc_number') 
                          : t('enter_id_fiscal_number')
                      }
                      required={formData.document_type === "RUC"}
                    />
                  </div>
                  <div></div>
                </div>
              )}

              {/* Section 4: Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enter_address')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('city')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enter_city')}
                  />
                </div>
              </div>

              {/* Section 5: Registered Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registered_address')}
                </label>
                <textarea
                  value={formData.registered_address}
                  onChange={(e) => handleInputChange('registered_address', e.target.value)}
                  className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enter_registered_address')}
                  rows={3}
                />
              </div>

              {/* Section 6: Country & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('country')}
                  </label>
                  <Select
                    value={formData.country}
                    onChange={(selectedOption: SingleValue<CountryOption>) => 
                      handleInputChange('country', selectedOption)
                    }
                    options={countries}
                    styles={reactSelectStyle}
                    placeholder={t('select_country')}
                    isClearable
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact_person')}
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enter_contact_person')}
                  />
                </div>
              </div>

              {/* Section 7: Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone')}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enter_phone')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact_number')}
                  </label>
                  <input
                    type="text"
                    value={formData.contact_no}
                    onChange={(e) => handleInputChange('contact_no', e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enter_contact_number')}
                  />
                </div>
              </div>

              {/* Section 8: Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full h-11 border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('enter_email')}
                  required
                />
                {errors.email && (
                  <Text size="sm" additionalClass="text-red-500 mt-1">
                    {errors.email}
                  </Text>
                )}
              </div>

              {/* Section 9: Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enter_notes')}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdating}
                  additionalClass="flex items-center"
                >
                  {isUpdating && <LoaderSync size="sm" additionalClass="mr-2" />}
                  {t('save_changes')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSupplier;
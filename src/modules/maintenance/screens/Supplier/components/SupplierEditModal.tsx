/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

interface SupplierEditModalProps {
  supplier: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CountryOption {
  value: string;
  label: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface FormData {
  company_name: string;
  supplier_code: string;
  category: string;
  tax_id: string;
  registered_address: string;
  city: string;
  contact_no: string;
  contact_person: string;
  notes: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  ruc: string;
  country: CountryOption | null;
}

const SupplierEditModal: React.FC<SupplierEditModalProps> = ({
  supplier,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation(['maintenance', 'common']);

  // Store state
  const countries = MaintenanceStore.use.countries();
  const supplierCategoryOptions = MaintenanceStore.use.supplierCategoryOptions();
  const loaders = MaintenanceStore.use.loaders();
  const isUpdating = loaders['suppliers/update-supplier'];
  const isLoadingFormFields = loaders['suppliers/fetch-form-fields'];

  // Form state
  const [formData, setFormData] = useState<FormData>({
    company_name: "",
    supplier_code: "",
    category: "",
    tax_id: "",
    registered_address: "",
    city: "",
    contact_no: "",
    contact_person: "",
    notes: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    ruc: "",
    country: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load form fields and supplier data
  useEffect(() => {
    if (isOpen) {
      loadFormFields();
      loadSupplierData();
    }
  }, [isOpen, supplier]);

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

  const loadSupplierData = () => {
    if (!supplier) return;

    // Find country option
    const countryOption = countries.find(country => 
      country.value === supplier.country?.country_id
    ) || null;

    setFormData({
      company_name: supplier.company_name || "",
      supplier_code: supplier.supplier_code || "",
      category: supplier.category || "",
      tax_id: supplier.tax_id || "",
      registered_address: supplier.registered_address || "",
      city: supplier.city || "",
      contact_no: supplier.contact_no || "",
      contact_person: supplier.contact_person || "",
      notes: supplier.notes || "",
      name: supplier.name || "",
      address: supplier.address || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      ruc: supplier.ruc || "",
      country: countryOption,
    });
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

    if (!formData.name.trim()) {
      newErrors.name = t('supplier_name_required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalid_email_format');
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
      const updateData = {
        company_name: formData.company_name,
        supplier_code: formData.supplier_code,
        category: formData.category,
        tax_id: formData.tax_id,
        registered_address: formData.registered_address,
        city: formData.city,
        contact_no: formData.contact_no,
        contact_person: formData.contact_person,
        notes: formData.notes,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        ruc: formData.ruc,
        country_id: formData.country?.value || null,
      };

      await SupplierService.updateSupplier(supplier.supplier_id, updateData);
      
      toast.success(t('supplier_updated_successfully'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating supplier:", error);
      toast.error(error.message || t('failed_to_update_supplier'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Text size="2xl" weight="font-bold">
              {t('edit_supplier')}
            </Text>
            <Button
              variant="secondary"
              onClick={onClose}
              additionalClass="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          {/* Loading state */}
          {isLoadingFormFields ? (
            <div className="flex items-center justify-center py-8">
              <LoaderSync />
              <Text additionalClass="ml-3">{t('common:loading')}</Text>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div>
                <Text size="lg" weight="font-semibold" additionalClass="mb-4">
                  {t('company_information')}
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('company_name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className={`w-full h-10 border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('supplier_code')}
                    </label>
                    <input
                      type="text"
                      value={formData.supplier_code}
                      onChange={(e) => handleInputChange('supplier_code', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enter_supplier_code')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('category')}
                    </label>
                    <Select
                      value={supplierCategoryOptions.find(option => option.value === formData.category) || null}
                      onChange={(selectedOption: SingleValue<CategoryOption>) => 
                        handleInputChange('category', selectedOption?.value || '')
                      }
                      options={supplierCategoryOptions}
                      styles={reactSelectStyle}
                      placeholder={t('select_category')}
                      isClearable
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('ruc')}
                    </label>
                    <input
                      type="text"
                      value={formData.ruc}
                      onChange={(e) => handleInputChange('ruc', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enter_ruc')}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <Text size="lg" weight="font-semibold" additionalClass="mb-4">
                  {t('contact_information')}
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('supplier_name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full h-10 border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('enter_supplier_name')}
                    />
                    {errors.name && (
                      <Text size="sm" additionalClass="text-red-500 mt-1">
                        {errors.name}
                      </Text>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact_person')}
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enter_contact_person')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full h-10 border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('enter_email')}
                    />
                    {errors.email && (
                      <Text size="sm" additionalClass="text-red-500 mt-1">
                        {errors.email}
                      </Text>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enter_phone')}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <Text size="lg" weight="font-semibold" additionalClass="mb-4">
                  {t('address_information')}
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('address')}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enter_address')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registered_address')}
                    </label>
                    <input
                      type="text"
                      value={formData.registered_address}
                      onChange={(e) => handleInputChange('registered_address', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enter_registered_address')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('city')}
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enter_city')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Text size="lg" weight="font-semibold" additionalClass="mb-4">
                  {t('additional_information')}
                </Text>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('notes')}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full h-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('enter_notes')}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
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
                  {t('common:save_changes')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierEditModal;
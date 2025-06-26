/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select, { CSSObjectWithLabel, SingleValue } from "react-select";
import { Button, Divider } from "@/components";
import { SupplierService } from "@/modules/maintenance/api/maintenance.service";
import { MaintenanceStore } from "@/globalStore";

// Styling for react-select
const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface FormData {
  // ✅ NEW: Enhanced company information
  company_name: string;
  category: string; // Changed from CountryOption to string for text field
  document_type: "RUC" | "ID_FISCAL" | ""; // New field for document type selection
  
  // Existing fields
  companyName: string; // Keep for backward compatibility
  ruc: string;
  address: string;
  city: string;
  country: CountryOption | null;
  phone: string;
  email: string;
  
  // ✅ NEW: Additional fields
  registered_address: string;
  contact_no: string;
  contact_person: string;
  notes: string;
}

interface CountryOption {
  label: string;
  value: string;
}

const SupplierRegistration: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  const navigate = useNavigate();
  const countries = MaintenanceStore.use.countries();
  const supplierCategoryOptions = MaintenanceStore.use.supplierCategoryOptions();
  const loaders = MaintenanceStore.use.loaders();
  const { startLoader, stopLoader } = MaintenanceStore.getState();

  const [formData, setFormData] = useState<FormData>({
    // ✅ NEW: Initialize new fields
    company_name: "",
    category: "",
    document_type: "",
    
    // Existing fields
    companyName: "",
    ruc: "",
    address: "",
    city: "",
    country: null,
    phone: "",
    email: "",
    
    // ✅ NEW: Additional fields
    registered_address: "",
    contact_no: "",
    contact_person: "",
    notes: "",
  });

  // Load form fields on component mount (only if not already loaded)
  useEffect(() => {
    const loadFormFields = async () => {
      try {
        // Only load if we don't have countries or categories yet
        if (countries.length === 0 || supplierCategoryOptions.length === 0) {
          await SupplierService.fetchSupplierFormFields();
        }
      } catch (error) {
        console.error("Error loading supplier form fields:", error);
      }
    };
    loadFormFields();
  }, []);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value,
      // ✅ NEW: Sync company_name with companyName for backward compatibility
      ...(name === 'company_name' && { companyName: value }),
      ...(name === 'companyName' && { company_name: value }),
    }));
  };

  const handleSelectChange = (
    name: keyof FormData,
    selectedOption: SingleValue<CountryOption>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.country) {
      alert(t('please_select_country'));
      return;
    }

    // Validate RUC only if document type is RUC
    if (formData.document_type === "RUC" && !formData.ruc.trim()) {
      alert(t('ruc_required_for_peru'));
      return;
    }

    startLoader("suppliers/create-supplier");

    try {
      await SupplierService.createSupplier({
        // ✅ NEW: Use enhanced company name field
        name: formData.company_name || formData.companyName,
        company_name: formData.company_name || formData.companyName,
        
        // ✅ NEW: Add category as string
        category: formData.category,
        
        // ✅ NEW: Add document type and tax_id
        document_type: formData.document_type,
        tax_id: formData.ruc,
        
        // Existing fields
        ruc: formData.ruc,
        address: formData.address,
        city: formData.city,
        country_id: formData.country.value,
        phone: formData.phone,
        email: formData.email,
        
        // ✅ NEW: Additional fields
        registered_address: formData.registered_address,
        contact_no: formData.contact_no,
        contact_person: formData.contact_person,
        notes: formData.notes,
      });

      // Reset form
      setFormData({
        company_name: "",
        category: "",
        document_type: "",
        companyName: "",
        ruc: "",
        address: "",
        city: "",
        country: null,
        phone: "",
        email: "",
        registered_address: "",
        contact_no: "",
        contact_person: "",
        notes: "",
      });

      // Navigate back after successful submission
      navigate(-1);
    } catch (error) {
      console.error("Error creating supplier:", error);
      alert(t('failed_create_supplier'));
    } finally {
      stopLoader("suppliers/create-supplier");
    }
  };

  return (
    <form className="order_entry_form" onSubmit={handleSubmit}>
      {/* Section 1: Company Information */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="company_name">{t('company_name')}</label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            placeholder={t('enter_company_name')}
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="category">{t('supplier_category')}</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            placeholder={t('enter_supplier_category')}
          />
        </div>
      </div>

      <Divider />

      {/* Section 2: Document Type Selection */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="document_type">{t('document_type')}</label>
          <select
            id="document_type"
            name="document_type"
            value={formData.document_type}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
          >
            <option value="">{t('select_document_type')}</option>
            <option value="RUC">{t('ruc')} (Peru)</option>
            <option value="ID_FISCAL">{t('id_fiscal')} (Other Countries)</option>
          </select>
        </div>
        <div className="w-full"></div> {/* Empty div to maintain layout */}
      </div>

      {/* Document Number Input - Shows based on document type selection */}
      {formData.document_type && (
        <>
          <Divider />
          <div className="w-full flex items-center gap-x-6">
            <div className="w-full flex flex-col">
              <label htmlFor="ruc">
                {formData.document_type === "RUC" ? t('ruc_number') : t('id_fiscal_number')}
                {formData.document_type === "RUC" && " *"}
              </label>
              <input
                type="text"
                id="ruc"
                name="ruc"
                value={formData.ruc}
                onChange={handleInputChange}
                className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
                placeholder={
                  formData.document_type === "RUC" 
                    ? t('enter_ruc_number') 
                    : t('enter_id_fiscal_number')
                }
                required={formData.document_type === "RUC"}
              />
            </div>
            <div className="w-full"></div> {/* Empty div to maintain layout */}
          </div>
        </>
      )}

      <Divider />

      {/* Section 3: Address Information */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="address">{t('address')}</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            placeholder={t('enter_address')}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="city">{t('city')}</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            placeholder={t('enter_city')}
          />
        </div>
      </div>

      <Divider />

      {/* Section 4: Registered Address */}
      <div className="w-full flex flex-col">
        <label htmlFor="registered_address">{t('registered_address')}</label>
        <textarea
          id="registered_address"
          name="registered_address"
          value={formData.registered_address}
          onChange={handleInputChange}
          className="min-h-20 border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-primary-500"
          placeholder={t('enter_registered_address')}
          rows={3}
        />
      </div>

      <Divider />

      {/* Section 5: Country & Contact */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="country">{t('country')}</label>
          <Select
            options={countries}
            styles={reactSelectStyle}
            inputId="country"
            name="country"
            onChange={(selected) => handleSelectChange("country", selected)}
            value={formData.country || null}
            placeholder={t('select_country')}
            isSearchable
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="contact_person">{t('contact_person')}</label>
          <input
            type="text"
            id="contact_person"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            placeholder={t('enter_contact_person')}
          />
        </div>
      </div>

      <Divider />

      {/* Section 6: Contact Information */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="phone">{t('phone')}</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            onInput={(e: any) => {
              const regex = /^[+]?[0-9]*$/;
              const inputValue = e.target.value;
              if (regex.test(inputValue)) {
                handleInputChange(e);
              } else {
                e.target.value = formData.phone;
              }
            }}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            placeholder={t('enter_phone')}
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="contact_no">{t('contact_number')}</label>
          <input
            type="text"
            id="contact_no"
            name="contact_no"
            value={formData.contact_no}
            onChange={handleInputChange}
            onInput={(e: any) => {
              const regex = /^[+]?[0-9]*$/;
              const inputValue = e.target.value;
              if (regex.test(inputValue)) {
                handleInputChange(e);
              } else {
                e.target.value = formData.contact_no;
              }
            }}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            placeholder={t('enter_contact_number')}
          />
        </div>
      </div>

      <Divider />

      {/* Section 7: Email */}
      <div className="w-full flex flex-col">
        <label htmlFor="email">{t('email')}</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
          placeholder={t('enter_email')}
          required
        />
      </div>

      <Divider />

      {/* Section 8: Notes */}
      <div className="w-full flex flex-col">
        <label htmlFor="notes">{t('notes')}</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="min-h-20 border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-primary-500"
          placeholder={t('enter_notes')}
          rows={3}
        />
      </div>

      <Divider />

      {/* Submit Button */}
      <div className="w-full flex justify-center gap-4">
        <Button
          type="submit"
          variant="primary"
          disabled={loaders["suppliers/create-supplier"]}
          additionalClass="px-8"
        >
          {loaders["suppliers/create-supplier"] ? t('common:creating') : t('common:submit')}
        </Button>
        
        <Button
          type="button"
          variant="cancel"
          onClick={() => navigate(-1)}
          additionalClass="px-8"
        >
          {t('common:cancel')}
        </Button>
      </div>
    </form>
  );
};

export default SupplierRegistration;

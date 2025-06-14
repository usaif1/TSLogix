/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
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
  companyName: string;
  ruc: string;
  address: string;
  city: string;
  country: CountryOption | null; // Now storing the entire option
  phone: string;
  email: string;
}

interface CountryOption {
  label: string;
  value: string; // assuming your country ID is a string
}

const SupplierRegistration: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  const navigate = useNavigate();
  const { countries, loaders, startLoader, stopLoader } = MaintenanceStore();

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    ruc: "",
    address: "",
    city: "",
    country: null,
    phone: "",
    email: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    startLoader("suppliers/create-supplier");

    try {
      await SupplierService.createSupplier({
        name: formData.companyName,
        ruc: formData.ruc,
        address: formData.address,
        city: formData.city,
        country_id: formData.country.value, // extract the value from the selected option
        phone: formData.phone,
        email: formData.email,
      });

      setFormData({
        companyName: "",
        ruc: "",
        address: "",
        city: "",
        country: null,
        phone: "",
        email: "",
      });

      // Navigate to /maintenance/supplier after successful submission
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
      <div className="w-full flex items-center gap-x-6">
        {/* Company Name */}
        <div className="w-full flex flex-col">
          <label htmlFor="companyName">{t('company_name')}</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            required
          />
        </div>

        {/* RUC */}
        <div className="w-full flex flex-col">
          <label htmlFor="ruc">{t('ruc')}</label>
          <input
            type="text"
            id="ruc"
            name="ruc"
            value={formData.ruc}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
            required
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Address */}
        <div className="w-full flex flex-col">
          <label htmlFor="address">{t('address')}</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
          />
        </div>

        {/* City */}
        <div className="w-full flex flex-col">
          <label htmlFor="city">{t('city')}</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Country */}
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
          />
        </div>

        {/* Phone */}
        <div className="w-full flex flex-col">
          <label htmlFor="phone">{t('phone')}</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            onInput={(e: any) => {
              const regex = /^[+]?[0-9]*$/; // Allow only numbers and one optional '+' at the start
              const inputValue = e.target.value;

              // If the value matches the regex, update the form data
              if (regex.test(inputValue)) {
                handleInputChange(e); // Call the handleInputChange if valid
              } else {
                e.target.value = formData.phone; // Revert to the previous value if invalid
              }
            }}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />

      <div className="w-full flex items-center gap-x-6">
        {/* Email */}
        <div className="w-full flex flex-col">
          <label htmlFor="email">{t('email')}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider height="lg" />

      <div className="flex gap-10">
        <Button
          variant="action"
          additionalClass="w-40"
          type="submit"
          disabled={loaders["suppliers/create-supplier"]}
        >
          {loaders["suppliers/create-supplier"] ? t('registering') : t('register')}
        </Button>

        <Button
          variant="cancel"
          additionalClass="w-40"
          type="button"
          onClick={() =>
            setFormData({
              companyName: "",
              ruc: "",
              address: "",
              city: "",
              country: null,
              phone: "",
              email: "",
            })
          }
        >
          {t('common:cancel')}
        </Button>
      </div>
    </form>
  );
};

export default SupplierRegistration;

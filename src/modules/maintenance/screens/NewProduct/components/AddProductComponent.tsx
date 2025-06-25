/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// components
import { Button, Divider, Fileupload } from "@/components";
import { ProductService } from "@/modules/maintenance/api/maintenance.service";
import { MaintenanceStore } from "@/globalStore";
import useFormComplete from "@/hooks/useFormComplete";

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface ProductFormData {
  name: string;
  product_code: string;
  manufacturer: string;
  humidity: string;
  temperature_range?: any;
  category?: any;
  subcategory1?: any;
  subcategory2?: any;
  observations: string;
  uploaded_documents: File | null;
}

const NewProductForm: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  const navigate = useNavigate();

  // Get options from the global maintenance store
  const {
    temperatureRangeOptions,
    categoryOptions,
    subcategory1Options,
    subcategory2Options,
    addProduct,
  } = MaintenanceStore();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    product_code: "",
    manufacturer: "",
    humidity: "",
    temperature_range: null,
    category: null,
    subcategory1: null,
    subcategory2: null,
    observations: "",
    uploaded_documents: null,
  });

  // Only require name and manufacturer as mandatory fields
  const isFormComplete = useFormComplete(formData, [
    'category', 
    'subcategory1', 
    'subcategory2', 
    'temperature_range', 
    'uploaded_documents',
    'humidity', // Make humidity optional too
    'observations' // Make observations optional
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Load form fields on component mount
  useEffect(() => {
    ProductService.fetchProductFormFields();
    ProductService.fetchProductCategories();
  }, []);

  // Fetch subcategory1 options when category changes
  useEffect(() => {
    if (formData.category) {
      // Fetch subcategories1 for the selected category
      ProductService.fetchSubcategories1(formData.category.value);
    } else {
      // Clear subcategory1 options when no category is selected
      const state = MaintenanceStore.getState();
      state.setSubcategory1Options([]);
      state.setSubcategory2Options([]);
    }
  }, [formData.category]);

  // Fetch subcategory2 options when subcategory1 changes
  useEffect(() => {
    if (formData.subcategory1) {
      // Fetch subcategories2 for the selected subcategory1
      ProductService.fetchSubcategories2(formData.subcategory1.value);
    } else {
      // Clear subcategory2 options when no subcategory1 is selected
      const state = MaintenanceStore.getState();
      state.setSubcategory2Options([]);
    }
  }, [formData.subcategory1]);

  // Clear form values when options are cleared
  useEffect(() => {
    // Clear subcategory1 if it's not in the current options
    if (formData.subcategory1 && subcategory1Options.length > 0) {
      const isValidOption = subcategory1Options.some(option => option.value === formData.subcategory1?.value);
      if (!isValidOption) {
        console.log("Clearing invalid subcategory1 selection");
        setFormData(prev => ({ ...prev, subcategory1: null, subcategory2: null }));
      }
    }
  }, [subcategory1Options, formData.subcategory1]);

  useEffect(() => {
    // Clear subcategory2 if it's not in the current options
    if (formData.subcategory2 && subcategory2Options.length > 0) {
      const isValidOption = subcategory2Options.some(option => option.value === formData.subcategory2?.value);
      if (!isValidOption) {
        console.log("Clearing invalid subcategory2 selection");
        setFormData(prev => ({ ...prev, subcategory2: null }));
      }
    }
  }, [subcategory2Options, formData.subcategory2]);

  // Update form fields on change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, selectedOption: any) => {
    console.log(`handleSelectChange called: ${name}`, selectedOption);
    
    // Ensure selectedOption is properly handled - convert undefined to null
    const normalizedOption = selectedOption === undefined ? null : selectedOption;
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: normalizedOption,
      };

      // Clear dependent fields when parent changes
      if (name === "category" && prev.category?.value !== normalizedOption?.value) {
        console.log("Clearing subcategories due to category change");
        newData.subcategory1 = null;
        newData.subcategory2 = null;
      } else if (name === "subcategory1" && prev.subcategory1?.value !== normalizedOption?.value) {
        console.log("Clearing subcategory2 due to subcategory1 change");
        newData.subcategory2 = null;
      }

      console.log("New form data after change:", newData);
      return newData;
    });
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      uploaded_documents: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      // Debug: Log the current form data
      console.log("Form data before submission:", formData);
      console.log("Category value:", formData.category);
      console.log("Subcategory1 value:", formData.subcategory1);
      console.log("Subcategory2 value:", formData.subcategory2);

      // Create JSON object like other parts of the application
      const productData = {
        name: formData.name,
        product_code: formData.product_code,
        manufacturer: formData.manufacturer,
        humidity: formData.humidity,
        observations: formData.observations,
        
        // Add select field IDs
        temperature_range_id: formData.temperature_range?.value || null,
        category_id: formData.category?.value || null,
        subcategory1_id: formData.subcategory1?.value || null,
        subcategory2_id: formData.subcategory2?.value || null,
        
        // Note: File upload will be handled separately if needed
        // For now, we'll skip the file upload functionality
        uploaded_documents: formData.uploaded_documents?.name || null,
      };

      // Debug: Log the product data being sent
      console.log("Product data being sent:", productData);

      const response = await ProductService.createProduct(productData);
      addProduct(response);
      setSubmitStatus({
        success: true,
        message: t('product_created_successfully'),
      });
      navigate("/maintenance/product");
    } catch (error) {
      console.error("Error creating product:", error);
      setSubmitStatus({
        success: false,
        message: t('failed_create_product_try_again'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug: Log available options
  console.log("Available options:", {
    categoryOptions: categoryOptions || [],
    subcategory1Options: subcategory1Options || [],
    subcategory2Options: subcategory2Options || []
  });

  // Debug: Log current form state
  console.log("Current form state:", formData);

  return (
    <form className="order_entry_form" onSubmit={handleSubmit}>
      {/* Section 1: Categories */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="category">{t('category')}</label>
          <Select
            inputId="category"
            name="category"
            options={categoryOptions || []}
            value={formData.category || null}
            onChange={(option) => handleSelectChange("category", option)}
            styles={reactSelectStyle}
            placeholder={t('select_category')}
            isClearable
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="subcategory1">{t('subcategory_1')}</label>
          <Select
            inputId="subcategory1"
            name="subcategory1"
            options={subcategory1Options || []}
            value={formData.subcategory1 || null}
            onChange={(option) => handleSelectChange("subcategory1", option)}
            styles={reactSelectStyle}
            placeholder={t('select_subcategory_1')}
            isDisabled={!formData.category}
            isClearable
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="subcategory2">{t('subcategory_2')}</label>
          <Select
            inputId="subcategory2"
            name="subcategory2"
            options={subcategory2Options || []}
            value={formData.subcategory2 || null}
            onChange={(option) => handleSelectChange("subcategory2", option)}
            styles={reactSelectStyle}
            placeholder={t('select_subcategory_2')}
            isDisabled={!formData.subcategory1}
            isClearable
          />
        </div>
      </div>

      <Divider />

      {/* Section 2: Product Details */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="name">{t('product_name')}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('enter_product_name')}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="product_code">{t('product_code')}</label>
          <input
            type="text"
            id="product_code"
            name="product_code"
            value={formData.product_code}
            onChange={handleChange}
            placeholder={t('enter_product_code')}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
            required
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="manufacturer">{t('manufacturer')}</label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            placeholder={t('enter_manufacturer')}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
            required
          />
        </div>
      </div>

      <Divider />

      {/* Section 3: Storage & Environmental Info */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="temperature_range">{t('temperature_range')}</label>
          <Select
            inputId="temperature_range"
            name="temperature_range"
            options={temperatureRangeOptions || []}
            value={formData.temperature_range || null}
            onChange={(option) =>
              handleSelectChange("temperature_range", option)
            }
            styles={reactSelectStyle}
            placeholder={t('select_temperature_range')}
            isClearable
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="humidity">{t('humidity')}</label>
          <input
            type="text"
            id="humidity"
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            placeholder={t('enter_humidity')}
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
          />
        </div>
      </div>

      <Divider />

      {/* Section 4: Observations */}
      <div className="w-full flex flex-col">
        <label htmlFor="observations">{t('observations')}</label>
        <textarea
          id="observations"
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          placeholder={t('enter_observations')}
          className="min-h-20 border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
          rows={3}
        />
      </div>

      <Divider />

      {/* Section 5: Document Upload */}
      <div className="w-full flex flex-col">
        <Fileupload
          id="uploaded_documents"
          label={t('upload_documents')}
          onFileSelected={handleFileUpload}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />
        {formData.uploaded_documents && (
          <p className="text-sm text-gray-600 mt-2">
            {t('selected_file')}: {formData.uploaded_documents.name}
          </p>
        )}
      </div>

      <Divider />

      {/* Submit Button */}
      <div className="w-full flex justify-center">
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormComplete || isSubmitting}
          additionalClass="px-8"
        >
          {isSubmitting ? t('common:creating') : t('common:submit')}
        </Button>
      </div>

      {/* Submit Status */}
      {submitStatus.message && (
        <div className={`text-center mt-4 ${
          submitStatus.success ? 'text-green-600' : 'text-red-600'
        }`}>
          {submitStatus.message}
        </div>
      )}
    </form>
  );
};

export default NewProductForm;

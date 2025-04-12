/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import { useNavigate } from "react-router-dom";

// components
import { Button, Divider } from "@/components";
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
  manufacturer: string;
  storage_conditions: string;
  humidity: string;
  product_line?: any;
  group?: any;
  temperature_range?: any;
}

const NewProductForm: React.FC = () => {
  const navigate = useNavigate();

  // Get options from the global maintenance store
  const {
    productLineOptions,
    groupOptions,
    temperatureRangeOptions,
    addProduct,
  } = MaintenanceStore();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    manufacturer: "",
    storage_conditions: "",
    humidity: "",
    product_line: null,
    group: null,
    temperature_range: null,
  });

  const isFormComplete = useFormComplete(formData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

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
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      const submissionData = {
        ...formData,
        product_line_id: formData.product_line?.value,
        group_id: formData.group?.value,
        temperature_range_id: formData.temperature_range?.value,
      };

      const response = await ProductService.createProduct(submissionData);
      addProduct(response);
      setSubmitStatus({
        success: true,
        message: "Product created successfully",
      });
      navigate("/maintenance/product");
    } catch (error) {
      console.error("Error creating product:", error);
      setSubmitStatus({
        success: false,
        message: "Failed to create product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="new-product-form" onSubmit={handleSubmit}>
      {/* Section 1: Product Options */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="product_line">Product Line</label>
          <Select
            inputId="product_line"
            name="product_line"
            options={productLineOptions}
            value={formData.product_line}
            onChange={(option) => handleSelectChange("product_line", option)}
            styles={reactSelectStyle}
            placeholder="Select product line"
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="group">Group</label>
          <Select
            inputId="group"
            name="group"
            options={groupOptions}
            value={formData.group}
            onChange={(option) => handleSelectChange("group", option)}
            styles={reactSelectStyle}
            placeholder="Select group"
          />
        </div>
      </div>

      <Divider />

      {/* Section 2: Product Details */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="manufacturer">Manufacturer</label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            placeholder="Enter manufacturer"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
          />
        </div>
      </div>

      <Divider />

      {/* Section 3: Additional Info */}
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="temperature_range">Temperature Range</label>
          <Select
            inputId="temperature_range"
            name="temperature_range"
            options={temperatureRangeOptions}
            value={formData.temperature_range}
            onChange={(option) =>
              handleSelectChange("temperature_range", option)
            }
            styles={reactSelectStyle}
            placeholder="Select temperature range"
          />
        </div>

        <div className="w-full flex flex-col">
          <label htmlFor="humidity">Humidity</label>
          <input
            type="text"
            id="humidity"
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            placeholder="Enter humidity"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
          />
        </div>
      </div>

      <Divider />

      {/* Section 4: Storage Conditions */}
      <div className="w-full flex flex-col">
        <label htmlFor="storage_conditions">Storage Conditions</label>
        <textarea
          id="storage_conditions"
          name="storage_conditions"
          value={formData.storage_conditions}
          onChange={handleChange}
          placeholder="Enter storage conditions"
          className="h-20 border border-slate-400 rounded-md px-4 py-2 focus-visible:outline-1 focus-visible:outline-primary-500 bg-white"
        />
      </div>

      <Divider height="lg" />

      {/* Submit Buttons */}
      <div className="flex gap-10">
        <Button
          disabled={!isFormComplete || isSubmitting}
          variant="action"
          type="submit"
          additionalClass="w-40"
        >
          {isSubmitting ? "Submitting..." : "Add Product"}
        </Button>
        <Button
          variant="cancel"
          type="button"
          additionalClass="w-40"
          onClick={() => navigate("/maintenance/product")}
        >
          Cancel
        </Button>
      </div>

      {/* Submission Status */}
      {submitStatus.message && (
        <div
          className={`mt-4 ${
            submitStatus.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {submitStatus.message}
        </div>
      )}
    </form>
  );
};

export default NewProductForm;

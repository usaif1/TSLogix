/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utils/api/axios.config";
import { MaintenanceStore } from "@/globalStore";

const supplierBaseURL = "/suppliers";
const productBaseURL = "/products";

const {
  setSuppliers,
  setProducts,
  setProductLineOptions,
  setGroupOptions,
  setTemperatureRangeOptions,
  startLoader,
  stopLoader,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  addProduct,
  updateProduct,
  deleteProduct,
  setCountries,
} = MaintenanceStore.getState();

export const SupplierService = {
  fetchAllSuppliers: async (search?: string) => {
    try {
      startLoader("suppliers/fetch-suppliers");
      const response = await api.get(supplierBaseURL, {
        params: { search },
      });
      setSuppliers(response.data.data);
      return response.data;
    } catch (err) {
      console.error("Fetch suppliers error:", err);
      throw err;
    } finally {
      stopLoader("suppliers/fetch-suppliers");
    }
  },

  createSupplier: async (formData: any) => {
    try {
      startLoader("suppliers/create-supplier");
      const response = await api.post(supplierBaseURL, {
        ...formData,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
      });
      addSupplier(response.data);
      return response.data;
    } catch (err) {
      console.error("Create supplier error:", err);
      throw err;
    } finally {
      stopLoader("suppliers/create-supplier");
    }
  },

  fetchSupplierById: async (id: string) => {
    try {
      startLoader("suppliers/fetch-supplier");
      const response = await api.get(`${supplierBaseURL}/${id}`);
      return response.data;
    } catch (err) {
      console.error("Fetch supplier error:", err);
      throw err;
    } finally {
      stopLoader("suppliers/fetch-supplier");
    }
  },

  updateSupplier: async (id: string, formData: any) => {
    try {
      startLoader("suppliers/update-supplier");
      const response = await api.put(`${supplierBaseURL}/${id}`, {
        ...formData,
        updated_by: localStorage.getItem("id"),
      });
      updateSupplier(id, response.data);
      return response.data;
    } catch (err) {
      console.error("Update supplier error:", err);
      throw err;
    } finally {
      stopLoader("suppliers/update-supplier");
    }
  },

  fetchSupplierFormFields: async () => {
    try {
      startLoader("suppliers/fetch-form-fields");
      const response = await api.get(`${supplierBaseURL}/form-fields`);
      
      // Handle countries - check both 'country' and 'countries' fields
      let countries: any[] = [];
      const countryData = response.data.country || response.data.countries;
      if (countryData && Array.isArray(countryData)) {
        countries = countryData.map((country: any) => ({
          value: country.country_id,
          label: country.name,
        }));
      }
      
      // Handle categories - check if it's an array of strings or objects
      let supplierCategories = [];
      if (response.data.categories) {
        if (Array.isArray(response.data.categories)) {
          // Check if first item is a string or object
          if (response.data.categories.length > 0 && typeof response.data.categories[0] === 'string') {
            // Array of strings
            supplierCategories = response.data.categories.map((cat: string) => ({
              value: cat.toLowerCase().replace(/\s+/g, '_'), // Create a value from the name
              label: cat,
            }));
          } else {
            // Array of objects with category_id and name
            supplierCategories = response.data.categories.map((cat: any) => ({
              value: cat.category_id,
              label: cat.name,
            }));
          }
        }
      }
      
      setCountries(countries);
      
      const state = MaintenanceStore.getState();
      state.setSupplierCategoryOptions(supplierCategories);
      
      return response.data;
    } catch (err) {
      console.error("Fetch supplier form fields error:", err);
      throw err;
    } finally {
      stopLoader("suppliers/fetch-form-fields");
    }
  },

  deleteSupplier: async (id: string) => {
    try {
      startLoader("suppliers/delete-supplier");
      await api.delete(`${supplierBaseURL}/${id}`);
      deleteSupplier(id);
      return true;
    } catch (err) {
      console.error("Delete supplier error:", err);
      throw err;
    } finally {
      stopLoader("suppliers/delete-supplier");
    }
  },
};

export const ProductService = {
  fetchAllProducts: async (
    filters: {
      product_line_id?: string;
      group_id?: string;
      name?: string;
    } = {}
  ) => {
    try {
      const response = await api.get(productBaseURL, {
        params: filters,
      });
      setProducts(response.data);
      return response.data;
    } catch (err) {
      console.error("Fetch products error:", err);
      throw err;
    }
  },

  fetchProductFormFields: async () => {
    try {
      startLoader("products/fetch-form-fields");
      const response = await api.get(`${productBaseURL}/form-fields`);

      const productLines = response.data.productLines.map((pl: any) => ({
        value: pl.product_line_id,
        label: pl.name,
      }));

      const groups = response.data.groups.map((g: any) => ({
        value: g.group_id,
        label: g.name,
      }));

      const temperatureRanges = response.data.temperatureRanges.map(
        (tr: any) => ({
          value: tr.temperature_range_id,
          label: `${tr.min_celsius}°C to ${tr.max_celsius}°C`, // Combine min/max
          // Optional: Keep original range name for reference
          meta: {
            rangeName: tr.range,
            min: tr.min_celsius,
            max: tr.max_celsius,
          },
        })
      );

      setProductLineOptions(productLines);
      setGroupOptions(groups);
      setTemperatureRangeOptions(temperatureRanges);

      return response.data;
    } catch (err) {
      console.error("Fetch product form fields error:", err);
      throw err;
    } finally {
      stopLoader("products/fetch-form-fields");
    }
  },

  // Fetch categories separately
  fetchProductCategories: async () => {
    try {
      startLoader("products/fetch-categories");
      const response = await api.get(`${productBaseURL}/categories`);
      
      const categories = response.data.map((cat: any) => ({
        value: cat.category_id,
        label: cat.name,
      }));
      
      const state = MaintenanceStore.getState();
      state.setCategoryOptions(categories);
      
      return categories;
    } catch (err) {
      console.error("Fetch product categories error:", err);
      throw err;
    } finally {
      stopLoader("products/fetch-categories");
    }
  },

  // Fetch subcategories1 for a specific category
  fetchSubcategories1: async (categoryId: string) => {
    try {
      startLoader("products/fetch-subcategories1");
      const response = await api.get(`${productBaseURL}/subcategories1`, {
        params: { categoryId }
      });
      
      console.log("Raw subcategories1 response:", response.data);
      
      // Map the actual API response structure (subcategory1_id and name) to expected format (value and label)
      const subcategories1 = response.data
        .filter((sub: any) => {
          // Check for the actual field names that the API returns
          const isValid = sub.subcategory1_id && sub.name;
          if (!isValid) {
            console.warn("Filtering out invalid subcategory1:", sub);
          }
          return isValid;
        })
        .map((sub: any) => ({
          value: sub.subcategory1_id, // Map subcategory1_id to value
          label: sub.name, // Map name to label
          subcategory1_id: sub.subcategory1_id,
          category_id: sub.category?.category_id || null,
        }));
      
      console.log("Processed subcategories1:", subcategories1);
      
      const state = MaintenanceStore.getState();
      state.setSubcategory1Options(subcategories1);
      
      return subcategories1;
    } catch (err) {
      console.error("Fetch subcategories1 error:", err);
      throw err;
    } finally {
      stopLoader("products/fetch-subcategories1");
    }
  },

  // Fetch subcategories2 for a specific subcategory1
  fetchSubcategories2: async (subcategory1Id: string) => {
    try {
      startLoader("products/fetch-subcategories2");
      const response = await api.get(`${productBaseURL}/subcategories2`, {
        params: { subcategory1Id }
      });
      
      console.log("Raw subcategories2 response:", response.data);
      
      // Map the actual API response structure (similar to subcategories1 response)
      const subcategories2 = response.data
        .filter((sub: any) => {
          // Check for the actual field names that the API returns (likely subcategory2_id and name)
          const isValid = (sub.subcategory2_id || sub.subcategory_id) && sub.name;
          if (!isValid) {
            console.warn("Filtering out invalid subcategory2:", sub);
          }
          return isValid;
        })
        .map((sub: any) => ({
          value: sub.subcategory2_id || sub.subcategory_id, // Use subcategory2_id or fallback to subcategory_id
          label: sub.name, // Map name to label
          subcategory2_id: sub.subcategory2_id || sub.subcategory_id,
          subcategory1_id: sub.subcategory1?.subcategory1_id || sub.subcategory1_id || null,
        }));
      
      console.log("Processed subcategories2:", subcategories2);
      
      const state = MaintenanceStore.getState();
      state.setSubcategory2Options(subcategories2);
      
      return subcategories2;
    } catch (err) {
      console.error("Fetch subcategories2 error:", err);
      throw err;
    } finally {
      stopLoader("products/fetch-subcategories2");
    }
  },

  createProduct: async (productData: any) => {
    try {
      startLoader("products/create-product");
      const response = await api.post(productBaseURL, {
        ...productData,
        organisation_id: localStorage.getItem("organisation_id"),
        created_by: localStorage.getItem("id"),
      });
      addProduct(response.data);
      return response.data;
    } catch (err) {
      console.error("Create product error:", err);
      throw err;
    } finally {
      stopLoader("products/create-product");
    }
  },

  fetchProductById: async (id: string) => {
    try {
      startLoader("products/fetch-product");
      const response = await api.get(`${productBaseURL}/${id}`);
      return response.data;
    } catch (err) {
      console.error("Fetch product error:", err);
      throw err;
    } finally {
      stopLoader("products/fetch-product");
    }
  },

  updateProduct: async (id: string, formData: any) => {
    try {
      startLoader("products/update-product");
      const response = await api.put(`${productBaseURL}/${id}`, {
        ...formData,
        updated_by: localStorage.getItem("id"),
      });
      updateProduct(id, response.data);
      return response.data;
    } catch (err) {
      console.error("Update product error:", err);
      throw err;
    } finally {
      stopLoader("products/update-product");
    }
  },

  deleteProduct: async (id: string) => {
    try {
      startLoader("products/delete-product");
      await api.delete(`${productBaseURL}/${id}`);
      deleteProduct(id);
      return true;
    } catch (err) {
      console.error("Delete product error:", err);
      throw err;
    } finally {
      stopLoader("products/delete-product");
    }
  },
};

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
      const countries = response.data.country.map((country: any) => ({
        value: country.country_id,
        label: country.name,
      }));
      setCountries(countries);
      return response.data;
    } catch (err) {
      console.error("Fetch product form fields error:", err);
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

  createProduct: async (formData: any) => {
    try {
      startLoader("products/create-product");
      const response = await api.post(productBaseURL, {
        ...formData,
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

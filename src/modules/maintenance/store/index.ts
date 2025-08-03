/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import createSelectors from "@/utils/selectors";

type LoaderTypes =
  | "suppliers/fetch-suppliers"
  | "suppliers/fetch-supplier"
  | "suppliers/create-supplier"
  | "suppliers/update-supplier"
  | "suppliers/delete-supplier"
  | "suppliers/fetch-form-fields"
  | "suppliers/fetch-next-code"
  | "products/fetch-products"
  | "products/fetch-product"
  | "products/create-product"
  | "products/update-product"
  | "products/delete-product"
  | "products/fetch-form-fields"
  | "products/fetch-categories"
  | "products/fetch-subcategories1"
  | "products/fetch-subcategories2";

type MaintenanceStore = {
  // Raw data
  suppliers: any[];
  products: any[];
  
  // Formatted options
  supplierOptions: any[];
  productOptions: any[];
  productLineOptions: any[];
  groupOptions: any[];
  temperatureRangeOptions: any[];
  countries: any[];
  
  // Category options for products
  categoryOptions: any[];
  subcategory1Options: any[];
  subcategory2Options: any[];
  
  // Category options for suppliers
  supplierCategoryOptions: any[];
  
  // Current selections
  currentSupplier: any | null;
  currentProduct: any | null;
  
  // Loading states
  loaders: Record<LoaderTypes, boolean>;
};

type MaintenanceStoreActions = {
  // Data setters
  setSuppliers: (data: any[]) => void;
  setProducts: (data: any[]) => void;
  
  // Form field setters
  setSupplierOptions: (data: any[]) => void;
  setProductOptions: (data: any[]) => void;
  setProductLineOptions: (data: any[]) => void;
  setGroupOptions: (data: any[]) => void;
  setTemperatureRangeOptions: (data: any[]) => void;
  setCountries: (data: any[]) => void;
  
  // Category setters
  setCategoryOptions: (data: any[]) => void;
  setSubcategory1Options: (data: any[]) => void;
  setSubcategory2Options: (data: any[]) => void;
  setSupplierCategoryOptions: (data: any[]) => void;
  
  // Current item handlers
  setCurrentSupplier: (supplier: any | null) => void;
  setCurrentProduct: (product: any | null) => void;
  
  // Loader controls
  startLoader: (loaderType: LoaderTypes) => void;
  stopLoader: (loaderType: LoaderTypes) => void;
  
  // CRUD operations
  addSupplier: (supplier: any) => void;
  updateSupplier: (id: string, data: any) => void;
  deleteSupplier: (id: string) => void;
  addProduct: (product: any) => void;
  updateProduct: (id: string, data: any) => void;
  deleteProduct: (id: string) => void;
  
  // Reset store
  resetMaintenanceStore: () => void;
};

const initialLoaders: Record<LoaderTypes, boolean> = {
  "suppliers/fetch-suppliers": false,
  "suppliers/fetch-supplier": false,
  "suppliers/create-supplier": false,
  "suppliers/update-supplier": false,
  "suppliers/delete-supplier": false,
  "suppliers/fetch-form-fields": false,
  "suppliers/fetch-next-code": false,
  "products/fetch-products": false,
  "products/fetch-product": false,
  "products/create-product": false,
  "products/update-product": false,
  "products/delete-product": false,
  "products/fetch-form-fields": false,
  "products/fetch-categories": false,
  "products/fetch-subcategories1": false,
  "products/fetch-subcategories2": false,
};

const initialState: MaintenanceStore = {
  suppliers: [],
  products: [],
  supplierOptions: [],
  productOptions: [],
  productLineOptions: [],
  groupOptions: [],
  temperatureRangeOptions: [],
  countries: [],
  categoryOptions: [],
  subcategory1Options: [],
  subcategory2Options: [],
  supplierCategoryOptions: [],
  currentSupplier: null,
  currentProduct: null,
  loaders: initialLoaders,
};

const MaintenanceStore = create<MaintenanceStore & MaintenanceStoreActions>((set) => ({
  ...initialState,

  // Data setters
  setSuppliers: (data) => set({ suppliers: data }),
  setProducts: (data) => set({ products: data }),

  // Form field setters
  setSupplierOptions: (data) => set({ supplierOptions: data }),
  setProductOptions: (data) => set({ productOptions: data }),
  setProductLineOptions: (data) => set({ productLineOptions: data }),
  setGroupOptions: (data) => set({ groupOptions: data }),
  setTemperatureRangeOptions: (data) => set({ temperatureRangeOptions: data }),
  setCountries: (data) => set({ countries: data }),

  // Category setters
  setCategoryOptions: (data) => set({ categoryOptions: data }),
  setSubcategory1Options: (data) => set({ subcategory1Options: data }),
  setSubcategory2Options: (data) => set({ subcategory2Options: data }),
  setSupplierCategoryOptions: (data) => set({ supplierCategoryOptions: data }),

  // Current item handlers
  setCurrentSupplier: (supplier) => set({ currentSupplier: supplier }),
  setCurrentProduct: (product) => set({ currentProduct: product }),

  // CRUD operations
  addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, supplier] })),
  updateSupplier: (id, data) => set((state) => ({
    suppliers: state.suppliers.map(s => s.supplier_id === id ? { ...s, ...data } : s)
  })),
  deleteSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.filter(s => s.supplier_id !== id)
  })),
  
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, data) => set((state) => ({
    products: state.products.map(p => p.product_id === id ? { ...p, ...data } : p)
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.product_id !== id)
  })),

  // Loader controls
  startLoader: (loaderType) => set((state) => ({
    loaders: { ...state.loaders, [loaderType]: true }
  })),
  stopLoader: (loaderType) => set((state) => ({
    loaders: { ...state.loaders, [loaderType]: false }
  })),

  // Reset store
  resetMaintenanceStore: () => set(initialState),
}));

export default createSelectors(MaintenanceStore);
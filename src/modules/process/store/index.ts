/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import createSelectors from "@/utils/selectors";
import {
  EntryOrder,
  EntryFormFields,
  InventorySelection,
  ProductWithInventory,
  Warehouse,
  DepartureFormFields,
  AvailableCell,
  CellValidation,
  ProcessLoaderTypes,
  SubmitStatus,
  FifoProductWithInventory,
  FifoAllocation,
  FifoSelection,
  ProductInventorySummary,
  DepartureOrder,
  UserRole,
  DeparturePermissions,
  ExpiryFifoLocation,
  ExpiryFifoAllocation,
  DepartureApprovalStep,
  ProductFifoAnalysis,
  ExpiryUrgency,

} from "@/modules/process/types";

// ✅ NEW: Product Row interface for departure form
interface ProductRow {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  lot_number: string;
  quantity: number | "";
  weight: number | "";
  packaging_qty: number | "";
  packaging_type: string;
  entry_order_no: string;
  guide_number: string;
  availability_info?: string;
  fifo_info?: string;
  fifo_allocations?: Array<{
    cell_reference: string;
    entry_order_no: string;
    allocated_quantity: number;
    lot_series: string;
    supplier_name: string;
    expiration_date: string;
  }>;
  isLoadingFifo?: boolean;
}

// ✅ NEW: Comprehensive Departure Form Data interface
interface ComprehensiveDepartureFormData {
  departure_order_code: string;
  personnel_in_charge_id: { option: string; value: string; label: string };
  document_type_id: { option: string; value: string; label: string };
  document_number: string;
  document_date: string;
  dispatch_document_number: string;
  departure_date: string;
  transport_type: string;
  arrival_point: string;
  observations: string;
}

interface ProcessesStore {
  // Entry Orders
  entryOrders: EntryOrder[];
  currentEntryOrder: EntryOrder | null;
  pendingEntryOrders: EntryOrder[]; // For admin review
  approvedEntryOrders: EntryOrder[]; // For warehouse allocation

  // Form Fields
  entryFormFields: EntryFormFields;

  // Entry Order Creation
  currentEntryOrderNo: string | null;

  // Review System
  reviewStatus: {
    success?: boolean;
    message?: string;
  };

  // ✅ NEW: Comprehensive Departure Form State
  comprehensiveDepartureFormData: ComprehensiveDepartureFormData;
  selectedWarehouse: any;
  departureFormProducts: ProductRow[];
  isSubmittingDepartureForm: boolean;
  departureFormError: string;

  // ✅ NEW: Comprehensive Departure Orders
  comprehensiveDepartureOrders: DepartureOrder[];
  currentDepartureOrder: DepartureOrder | null;
  
  // ✅ NEW: Departure Orders by Status for Workflow Management
  pendingDepartureOrders: DepartureOrder[];
  approvedDepartureOrders: DepartureOrder[];
  rejectedDepartureOrders: DepartureOrder[];
  dispatchedDepartureOrders: DepartureOrder[];
  completedDepartureOrders: DepartureOrder[];

  // ✅ NEW: Role-Based Permissions
  userRole: UserRole | null;
  departurePermissions: DeparturePermissions | null;

  // ✅ NEW: Audit Trail & Workflow
  departureAuditTrail: Record<string, DepartureApprovalStep[]>; // Keyed by departure_order_id
  workflowActions: Record<string, string[]>; // Available actions per order

  // ✅ NEW: Expiry-Based FIFO System
  expiryFifoLocations: Record<string, ExpiryFifoLocation[]>; // Keyed by product_id
  expiryFifoAllocations: Record<string, ExpiryFifoAllocation>; // Keyed by product_id
  productFifoAnalyses: Record<string, ProductFifoAnalysis>; // Keyed by product_id
  expiryUrgencyDashboard: {
    expired_products: number;
    urgent_products: number;
    warning_products: number;
    normal_products: number;
    total_products: number;
    risk_summary: {
      high_risk_count: number;
      medium_risk_count: number;
      low_risk_count: number;
    };
    products_by_urgency: Record<ExpiryUrgency, any[]>;
  } | null;

  // Legacy Departure Orders (keeping for compatibility)
  departureOrders: any[];
  departureFormFields: DepartureFormFields;

  // Inventory Management
  productsWithInventory: ProductWithInventory[];
  inventorySelections: InventorySelection[];
  inventoryError: string;
  submitStatus: SubmitStatus;

  // Cell Management
  availableCells: AvailableCell[];
  selectedCell: AvailableCell | null;
  cellValidation: CellValidation | null;

  // Warehouses
  warehouses: Warehouse[];

  // ✅ UPDATED: FIFO Departure Flow (Enhanced)
  fifoProductsWithInventory: FifoProductWithInventory[];
  fifoAllocations: Record<string, FifoAllocation>; // Keyed by product_id
  fifoSelections: FifoSelection[];
  productInventorySummaries: Record<string, ProductInventorySummary>; // Keyed by product_id
  fifoError: string;
  fifoValidation: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };

  // ✅ NEW: Workflow Status & Error Handling
  workflowStatus: {
    currentWorkflow: 'entry' | 'departure' | null;
    currentStep: string | null;
    availableActions: string[];
    isProcessing: boolean;
  };

  // ✅ NEW: Batch Operations
  selectedDepartureOrderIds: string[];
  batchOperationStatus: {
    isProcessing: boolean;
    operation: string | null;
    progress: number;
    results: any[];
  };

  // ✅ NEW: Warehouse Dispatch System
  selectedDepartureOrder: any | null;
  selectedDispatchProduct: any | null;
  availableLocationsForDispatch: any[];
  dispatchSelections: any[];
  dispatchError: string;

  // Loading states
  loaders: {
    [K in ProcessLoaderTypes]: boolean;
  };
}

interface ProcessesStoreActions {
  // Loader controls
  startLoader: (loaderType: ProcessLoaderTypes) => void;
  stopLoader: (loaderType: ProcessLoaderTypes) => void;

  // Entry Orders
  setEntryOrders: (orders: EntryOrder[]) => void;
  setCurrentEntryOrder: (order: EntryOrder | null) => void;
  setPendingEntryOrders: (orders: EntryOrder[]) => void;
  setApprovedEntryOrders: (orders: EntryOrder[]) => void;

  // Form Fields
  setEntryFormFields: (fields: EntryFormFields) => void;
  setCurrentEntryOrderNo: (orderNo: string | null) => void;

  // Review System
  setReviewStatus: (status: { success?: boolean; message?: string }) => void;
  clearReviewStatus: () => void;

  // Warehouses
  setWarehouses: (warehouses: Warehouse[]) => void;

  // ✅ NEW: Comprehensive Departure Form Actions
  setComprehensiveDepartureFormData: (data: Partial<ComprehensiveDepartureFormData>) => void;
  resetComprehensiveDepartureFormData: () => void;
  setSelectedWarehouse: (warehouse: any) => void;
  setDepartureFormProducts: (products: ProductRow[]) => void;
  addDepartureFormProduct: (product: ProductRow) => void;
  updateDepartureFormProduct: (id: string, updates: Partial<ProductRow>) => void;
  removeDepartureFormProduct: (id: string) => void;
  setIsSubmittingDepartureForm: (isSubmitting: boolean) => void;
  setDepartureFormError: (error: string) => void;
  clearDepartureFormError: () => void;

  // ✅ NEW: Comprehensive Departure Order Management
  setComprehensiveDepartureOrders: (orders: DepartureOrder[]) => void;
  setCurrentDepartureOrder: (order: DepartureOrder | null) => void;
  addComprehensiveDepartureOrder: (order: DepartureOrder) => void;
  updateComprehensiveDepartureOrder: (orderId: string, updates: Partial<DepartureOrder>) => void;
  removeComprehensiveDepartureOrder: (orderId: string) => void;
  
  // ✅ NEW: Departure Orders by Status
  setPendingDepartureOrders: (orders: DepartureOrder[]) => void;
  setApprovedDepartureOrders: (orders: DepartureOrder[]) => void;
  setRejectedDepartureOrders: (orders: DepartureOrder[]) => void;
  setDispatchedDepartureOrders: (orders: DepartureOrder[]) => void;
  setCompletedDepartureOrders: (orders: DepartureOrder[]) => void;

  // ✅ NEW: Role-Based Permissions
  setUserRole: (role: UserRole) => void;
  setDeparturePermissions: (permissions: DeparturePermissions) => void;

  // ✅ NEW: Audit Trail Management
  setDepartureAuditTrail: (orderId: string, auditTrail: DepartureApprovalStep[]) => void;
  addAuditTrailStep: (orderId: string, step: DepartureApprovalStep) => void;
  clearDepartureAuditTrail: (orderId: string) => void;

  // ✅ NEW: Workflow Management
  setWorkflowActions: (orderId: string, actions: string[]) => void;
  setWorkflowStatus: (status: {
    currentWorkflow?: 'entry' | 'departure' | null;
    currentStep?: string | null;
    availableActions?: string[];
    isProcessing?: boolean;
  }) => void;

  // ✅ NEW: Expiry-Based FIFO Management
  setExpiryFifoLocations: (productId: string, locations: ExpiryFifoLocation[]) => void;
  clearExpiryFifoLocations: (productId: string) => void;
  setExpiryFifoAllocation: (productId: string, allocation: ExpiryFifoAllocation) => void;
  clearExpiryFifoAllocation: (productId: string) => void;
  setProductFifoAnalysis: (productId: string, analysis: ProductFifoAnalysis) => void;
  clearProductFifoAnalysis: (productId: string) => void;
  setExpiryUrgencyDashboard: (dashboard: any) => void;
  clearExpiryUrgencyDashboard: () => void;

  // ✅ NEW: Batch Operations
  setSelectedDepartureOrderIds: (orderIds: string[]) => void;
  addSelectedDepartureOrderId: (orderId: string) => void;
  removeSelectedDepartureOrderId: (orderId: string) => void;
  clearSelectedDepartureOrderIds: () => void;
  setBatchOperationStatus: (status: {
    isProcessing?: boolean;
    operation?: string | null;
    progress?: number;
    results?: any[];
  }) => void;

  // ✅ NEW: Warehouse Dispatch Actions
  setSelectedDepartureOrder: (order: any | null) => void;
  setSelectedDispatchProduct: (product: any | null) => void;
  setAvailableLocationsForDispatch: (locations: any[]) => void;
  setDispatchSelections: (selections: any[]) => void;
  addDispatchSelection: (selection: any) => void;
  updateDispatchSelection: (inventoryId: string, updates: any) => void;
  removeDispatchSelection: (inventoryId: string) => void;
  clearDispatchSelections: () => void;
  setDispatchError: (error: string) => void;
  clearDispatchError: () => void;
  clearAllDispatchState: () => void;

  // Legacy Departure Orders (keeping for compatibility)
  setDepartureOrders: (orders: any[]) => void;
  setDepartureFormFields: (fields: DepartureFormFields) => void;

  // Inventory Management
  setProductsWithInventory: (products: ProductWithInventory[]) => void;
  setInventorySelections: (selections: InventorySelection[]) => void;
  addInventorySelection: (selection: InventorySelection) => void;
  removeInventorySelection: (inventoryId: string) => void;
  updateInventorySelection: (inventoryId: string, updates: Partial<InventorySelection>) => void;
  clearInventorySelections: () => void;
  setInventoryError: (error: string) => void;
  setSubmitStatus: (status: SubmitStatus) => void;
  clearInventoryState: () => void;

  // Cell Management
  setAvailableCells: (cells: AvailableCell[]) => void;
  setSelectedCell: (cell: AvailableCell | null) => void;
  setCellValidation: (validation: CellValidation | null) => void;
  clearCellState: () => void;

  // ✅ UPDATED: FIFO Departure Flow Actions (Enhanced)
  setFifoProductsWithInventory: (products: FifoProductWithInventory[]) => void;
  setFifoAllocation: (productId: string, allocation: FifoAllocation) => void;
  clearFifoAllocation: (productId: string) => void;
  clearAllFifoAllocations: () => void;
  addFifoSelection: (selection: FifoSelection) => void;
  updateFifoSelection: (productId: string, updates: Partial<FifoSelection>) => void;
  removeFifoSelection: (productId: string) => void;
  clearFifoSelections: () => void;
  setProductInventorySummary: (productId: string, summary: ProductInventorySummary) => void;
  clearProductInventorySummary: (productId: string) => void;
  setFifoError: (error: string) => void;
  clearFifoError: () => void;
  setFifoValidation: (validation: { isValid: boolean; warnings: string[]; errors: string[] }) => void;
  clearFifoValidation: () => void;
  clearFifoState: () => void;

  // ✅ NEW: Comprehensive State Management
  clearDepartureWorkflowState: () => void;
  clearAllExpiryFifoState: () => void;
  initializeWorkflowForUser: (role: UserRole) => void;

  // Reset
  resetProcessesStore: () => void;
}

const processesInitialState: ProcessesStore = {
  // Entry Orders
  entryOrders: [],
  currentEntryOrder: null,
  pendingEntryOrders: [],
  approvedEntryOrders: [],

  // Form Fields
  entryFormFields: {
    origins: [],
    documentTypes: [],
    users: [],
    suppliers: [],
    products: [],
    warehouses: [],
    temperatureRanges: [],
    originTypes: [],
    documentTypeOptions: [],
    orderStatusOptions: [],
    presentationOptions: [],
    temperatureRangeOptions: [],
  },

  // Entry Order Creation
  currentEntryOrderNo: null,

  // Review System
  reviewStatus: {},

  // ✅ NEW: Comprehensive Departure Form State
  comprehensiveDepartureFormData: {
    departure_order_code: "",
    personnel_in_charge_id: { option: "", value: "", label: "" },
    document_type_id: { option: "", value: "", label: "" },
    document_number: "",
    document_date: new Date().toISOString().split('T')[0],
    dispatch_document_number: "",
    departure_date: new Date().toISOString().split('T')[0],
    transport_type: "",
    arrival_point: "",
    observations: "",
  },
  selectedWarehouse: null,
  departureFormProducts: [],
  isSubmittingDepartureForm: false,
  departureFormError: "",

  // ✅ NEW: Comprehensive Departure Orders
  comprehensiveDepartureOrders: [],
  currentDepartureOrder: null,
  
  // ✅ NEW: Departure Orders by Status
  pendingDepartureOrders: [],
  approvedDepartureOrders: [],
  rejectedDepartureOrders: [],
  dispatchedDepartureOrders: [],
  completedDepartureOrders: [],

  // ✅ NEW: Role-Based Permissions
  userRole: null,
  departurePermissions: null,

  // ✅ NEW: Audit Trail & Workflow
  departureAuditTrail: {},
  workflowActions: {},

  // ✅ NEW: Expiry-Based FIFO System
  expiryFifoLocations: {},
  expiryFifoAllocations: {},
  productFifoAnalyses: {},
  expiryUrgencyDashboard: null,

  // Legacy Departure Orders
  departureOrders: [],
  departureFormFields: {
    customers: [],
    personnel: [],
    documentTypes: [],
    users: [],
    packagingTypes: [],
    labels: [],
  },

  // Inventory Management
  productsWithInventory: [],
  inventorySelections: [],
  inventoryError: "",
  submitStatus: {},

  // Cell Management
  availableCells: [],
  selectedCell: null,
  cellValidation: null,

  // Warehouses
  warehouses: [],

  // ✅ UPDATED: FIFO Departure Flow
  fifoProductsWithInventory: [],
  fifoAllocations: {},
  fifoSelections: [],
  productInventorySummaries: {},
  fifoError: "",
  fifoValidation: {
    isValid: true,
    warnings: [],
    errors: [],
  },

  // ✅ NEW: Workflow Status
  workflowStatus: {
    currentWorkflow: null,
    currentStep: null,
    availableActions: [],
    isProcessing: false,
  },

  // ✅ NEW: Batch Operations
  selectedDepartureOrderIds: [],
  batchOperationStatus: {
    isProcessing: false,
    operation: null,
    progress: 0,
    results: [],
  },

  // ✅ NEW: Warehouse Dispatch System
  selectedDepartureOrder: null,
  selectedDispatchProduct: null,
  availableLocationsForDispatch: [],
  dispatchSelections: [],
  dispatchError: "",

  // Loading states
  loaders: {
    "processes/fetch-entry-orders": false,
    "processes/fetch-pending-orders": false,
    "processes/fetch-approved-orders": false,
    "processes/fetch-entry-order": false,
    "processes/create-entry-order": false,
    "processes/update-entry-order": false, 
    "processes/review-entry-order": false,
    "processes/load-form-fields": false,
    "processes/fetch-warehouses": false,
    "processes/fetch-warehouse-cells": false,
    "processes/allocate-inventory": false,
    "processes/load-products-inventory": false,
    "processes/load-cells": false,
    "processes/validate-cell": false,
    "processes/submit-departure": false,
    "processes/fetch-departure-orders": false,
    "processes/load-departure-form-fields": false,
    "processes/get-departure-order-no": false,
    "processes/create-departure-order": false,
    "processes/update-departure-order": false,
    "processes/fetch-entry-orders-for-departure": false,
    "processes/fetch-products-by-entry-order": false,
    "processes/fetch-cells-for-entry-product": false,
    "processes/validate-departure-cell": false,
    "processes/validate-multiple-departure-cells": false,
    "processes/fetch-departure-inventory-summary": false,
    "processes/create-departure-from-entry": false,
    "processes/browse-products-inventory": false,
    "processes/browse-products": false,
    "processes/get-fifo-allocation": false,
    "processes/create-fifo-departure": false,
    "processes/validate-fifo-allocation": false,
    "processes/get-product-inventory-summary": false,
    "processes/fetch-departure-audit-trail": false,
    "processes/approve-departure-order": false,
    "processes/reject-departure-order": false,
    "processes/request-departure-revision": false,
    "processes/dispatch-departure-order": false,
    "processes/batch-dispatch-orders": false,
    "processes/get-fifo-locations": false,
    "processes/get-product-fifo-analysis": false,
    "processes/get-expiry-dashboard": false,
    "processes/fetch-orders-by-status": false,
    "warehouse-dispatch/load-approved-orders": false,
    "warehouse-dispatch/execute-dispatch": false,
  },
};

const processesStore = create<ProcessesStore & ProcessesStoreActions>((set, get) => ({
  ...processesInitialState,

  // Loader controls
  startLoader: (loaderType) =>
    set((state) => ({ loaders: { ...state.loaders, [loaderType]: true } })),
  stopLoader: (loaderType) =>
    set((state) => ({ loaders: { ...state.loaders, [loaderType]: false } })),

  // Entry Orders
  setEntryOrders: (orders) => set({ entryOrders: orders }),
  setCurrentEntryOrder: (order) => set({ currentEntryOrder: order }),
  setPendingEntryOrders: (orders) => set({ pendingEntryOrders: orders }),
  setApprovedEntryOrders: (orders) => set({ approvedEntryOrders: orders }),

  // Form Fields
  setEntryFormFields: (fields) => set({ entryFormFields: fields }),
  setCurrentEntryOrderNo: (orderNo) => set({ currentEntryOrderNo: orderNo }),

  // Review System
  setReviewStatus: (status) => set({ reviewStatus: status }),
  clearReviewStatus: () => set({ reviewStatus: {} }),

  // Warehouses
  setWarehouses: (warehouses) => set({ warehouses }),

  // ✅ NEW: Comprehensive Departure Form Actions
  setComprehensiveDepartureFormData: (data) => set({ 
    comprehensiveDepartureFormData: { ...get().comprehensiveDepartureFormData, ...data } 
  }),
  resetComprehensiveDepartureFormData: () => set({ 
    comprehensiveDepartureFormData: processesInitialState.comprehensiveDepartureFormData 
  }),
  setSelectedWarehouse: (warehouse) => set({ selectedWarehouse: warehouse }),
  setDepartureFormProducts: (products) => set({ departureFormProducts: products }),
  addDepartureFormProduct: (product) => set({ 
    departureFormProducts: [...get().departureFormProducts, product] 
  }),
  updateDepartureFormProduct: (id, updates) => set({ 
    departureFormProducts: get().departureFormProducts.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ) 
  }),
  removeDepartureFormProduct: (id) => set({ 
    departureFormProducts: get().departureFormProducts.filter(p => p.id !== id) 
  }),
  setIsSubmittingDepartureForm: (isSubmitting) => set({ isSubmittingDepartureForm: isSubmitting }),
  setDepartureFormError: (error) => set({ departureFormError: error }),
  clearDepartureFormError: () => set({ departureFormError: "" }),

  // ✅ NEW: Comprehensive Departure Order Management
  setComprehensiveDepartureOrders: (orders) => set({ comprehensiveDepartureOrders: orders }),
  setCurrentDepartureOrder: (order) => set({ currentDepartureOrder: order }),
  addComprehensiveDepartureOrder: (order) => set({ comprehensiveDepartureOrders: [...get().comprehensiveDepartureOrders, order] }),
  updateComprehensiveDepartureOrder: (orderId, updates) => set({ 
    comprehensiveDepartureOrders: get().comprehensiveDepartureOrders.map(order => 
      order.departure_order_id === orderId ? { ...order, ...updates } : order
    ),
    currentDepartureOrder: get().currentDepartureOrder?.departure_order_id === orderId 
      ? { ...get().currentDepartureOrder!, ...updates } 
      : get().currentDepartureOrder
  }),
  removeComprehensiveDepartureOrder: (orderId) => set({ 
    comprehensiveDepartureOrders: get().comprehensiveDepartureOrders.filter(order => order.departure_order_id !== orderId),
    currentDepartureOrder: get().currentDepartureOrder?.departure_order_id === orderId ? null : get().currentDepartureOrder
  }),

  // ✅ NEW: Departure Orders by Status
  setPendingDepartureOrders: (orders) => set({ pendingDepartureOrders: orders }),
  setApprovedDepartureOrders: (orders) => set({ approvedDepartureOrders: orders }),
  setRejectedDepartureOrders: (orders) => set({ rejectedDepartureOrders: orders }),
  setDispatchedDepartureOrders: (orders) => set({ dispatchedDepartureOrders: orders }),
  setCompletedDepartureOrders: (orders) => set({ completedDepartureOrders: orders }),

  // ✅ NEW: Role-Based Permissions
  setUserRole: (role) => set({ userRole: role }),
  setDeparturePermissions: (permissions) => set({ departurePermissions: permissions }),

  // ✅ NEW: Audit Trail Management
  setDepartureAuditTrail: (orderId, auditTrail) => set({ 
    departureAuditTrail: { ...get().departureAuditTrail, [orderId]: auditTrail } 
  }),
  addAuditTrailStep: (orderId, step) => set({ 
    departureAuditTrail: { 
      ...get().departureAuditTrail, 
      [orderId]: [...(get().departureAuditTrail[orderId] || []), step] 
    } 
  }),
  clearDepartureAuditTrail: (orderId) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [orderId]: _, ...rest } = get().departureAuditTrail;
    set({ departureAuditTrail: rest });
  },

  // ✅ NEW: Workflow Management
  setWorkflowActions: (orderId, actions) => set({ 
    workflowActions: { ...get().workflowActions, [orderId]: actions } 
  }),
  setWorkflowStatus: (status) => set({ 
    workflowStatus: { ...get().workflowStatus, ...status } 
  }),

  // ✅ NEW: Expiry-Based FIFO Management
  setExpiryFifoLocations: (productId, locations) => set({ 
    expiryFifoLocations: { ...get().expiryFifoLocations, [productId]: locations } 
  }),
  clearExpiryFifoLocations: (productId) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [productId]: _, ...rest } = get().expiryFifoLocations;
    set({ expiryFifoLocations: rest });
  },
  setExpiryFifoAllocation: (productId, allocation) => set({ 
    expiryFifoAllocations: { ...get().expiryFifoAllocations, [productId]: allocation } 
  }),
  clearExpiryFifoAllocation: (productId) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [productId]: _, ...rest } = get().expiryFifoAllocations;
    set({ expiryFifoAllocations: rest });
  },
  setProductFifoAnalysis: (productId, analysis) => set({ 
    productFifoAnalyses: { ...get().productFifoAnalyses, [productId]: analysis } 
  }),
  clearProductFifoAnalysis: (productId) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [productId]: _, ...rest } = get().productFifoAnalyses;
    set({ productFifoAnalyses: rest });
  },
  setExpiryUrgencyDashboard: (dashboard) => set({ expiryUrgencyDashboard: dashboard }),
  clearExpiryUrgencyDashboard: () => set({ expiryUrgencyDashboard: null }),

  // ✅ NEW: Batch Operations
  setSelectedDepartureOrderIds: (orderIds) => set({ selectedDepartureOrderIds: orderIds }),
  addSelectedDepartureOrderId: (orderId) => set({ 
    selectedDepartureOrderIds: [...get().selectedDepartureOrderIds, orderId] 
  }),
  removeSelectedDepartureOrderId: (orderId) => set({ 
    selectedDepartureOrderIds: get().selectedDepartureOrderIds.filter(id => id !== orderId) 
  }),
  clearSelectedDepartureOrderIds: () => set({ selectedDepartureOrderIds: [] }),
  setBatchOperationStatus: (status) => set({ 
    batchOperationStatus: { ...get().batchOperationStatus, ...status } 
  }),

  // ✅ NEW: Warehouse Dispatch Actions
  setSelectedDepartureOrder: (order) => set({ selectedDepartureOrder: order }),
  setSelectedDispatchProduct: (product) => set({ selectedDispatchProduct: product }),
  setAvailableLocationsForDispatch: (locations) => set({ availableLocationsForDispatch: locations }),
  setDispatchSelections: (selections) => set({ dispatchSelections: selections }),
  addDispatchSelection: (selection) => set((state) => ({
    dispatchSelections: [...state.dispatchSelections, selection]
  })),
  updateDispatchSelection: (inventoryId, updates) => set((state) => ({
    dispatchSelections: state.dispatchSelections.map(s => 
      s.inventory_id === inventoryId ? { ...s, ...updates } : s
    )
  })),
  removeDispatchSelection: (inventoryId) => set((state) => ({
    dispatchSelections: state.dispatchSelections.filter(s => s.inventory_id !== inventoryId)
  })),
  clearDispatchSelections: () => set({ dispatchSelections: [] }),
  setDispatchError: (error) => set({ dispatchError: error }),
  clearDispatchError: () => set({ dispatchError: "" }),
  
  // ✅ NEW: Clear all dispatch-related state
  clearAllDispatchState: () => set({
    selectedDepartureOrder: null,
    selectedDispatchProduct: null,
    availableLocationsForDispatch: [],
    dispatchSelections: [],
    dispatchError: "",
  }),

  // Legacy Departure Orders
  setDepartureOrders: (orders) => set({ departureOrders: orders }),
  setDepartureFormFields: (fields) => set({ departureFormFields: fields }),

  // Inventory Management
  setProductsWithInventory: (products) => set({ productsWithInventory: products }),
  setInventorySelections: (selections) => set({ inventorySelections: selections }),

  addInventorySelection: (selection) => {
    const { inventorySelections } = get();
    const exists = inventorySelections.find((s) => s.inventory_id === selection.inventory_id);
    if (!exists) {
      set({ inventorySelections: [...inventorySelections, selection] });
    }
  },

  removeInventorySelection: (inventoryId) => {
    const { inventorySelections } = get();
    set({ inventorySelections: inventorySelections.filter((s) => s.inventory_id !== inventoryId) });
  },

  updateInventorySelection: (inventoryId, updates) => {
    const { inventorySelections } = get();
    set({
      inventorySelections: inventorySelections.map((s) =>
        s.inventory_id === inventoryId ? { ...s, ...updates } : s
      ),
    });
  },

  clearInventorySelections: () => set({ inventorySelections: [] }),
  setInventoryError: (error) => set({ inventoryError: error }),
  setSubmitStatus: (status) => set({ submitStatus: status }),
  clearInventoryState: () =>
    set({
      productsWithInventory: [],
      inventorySelections: [],
      inventoryError: "",
      submitStatus: {},
    }),

  // Cell Management
  setAvailableCells: (cells) => set({ availableCells: cells }),
  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setCellValidation: (validation) => set({ cellValidation: validation }),
  clearCellState: () =>
    set({
      availableCells: [],
      selectedCell: null,
      cellValidation: null,
      inventoryError: "",
    }),

  // ✅ UPDATED: FIFO Departure Flow Actions (Enhanced)
  setFifoProductsWithInventory: (products) => set({ fifoProductsWithInventory: products }),
  setFifoAllocation: (productId, allocation) => set({ fifoAllocations: { ...get().fifoAllocations, [productId]: allocation } }),
  clearFifoAllocation: (productId) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [productId]: _, ...rest } = get().fifoAllocations;
    set({ fifoAllocations: rest });
  },
  clearAllFifoAllocations: () => set({ fifoAllocations: {} }),
  addFifoSelection: (selection) => set({ fifoSelections: [...get().fifoSelections, selection] }),
  updateFifoSelection: (productId, updates) => set({ fifoSelections: get().fifoSelections.map((s) => s.product_id === productId ? { ...s, ...updates } : s) }),
  removeFifoSelection: (productId) => set({ fifoSelections: get().fifoSelections.filter((s) => s.product_id !== productId) }),
  clearFifoSelections: () => set({ fifoSelections: [] }),
  setProductInventorySummary: (productId, summary) => set({ productInventorySummaries: { ...get().productInventorySummaries, [productId]: summary } }),
  clearProductInventorySummary: (productId) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [productId]: _, ...rest } = get().productInventorySummaries;
    set({ productInventorySummaries: rest });
  },
  setFifoError: (error) => set({ fifoError: error }),
  clearFifoError: () => set({ fifoError: "" }),
  setFifoValidation: (validation) => set({ fifoValidation: validation }),
  clearFifoValidation: () => set({ fifoValidation: { isValid: true, warnings: [], errors: [] } }),
  clearFifoState: () =>
    set({
      fifoProductsWithInventory: [],
      fifoAllocations: {},
      fifoSelections: [],
      productInventorySummaries: {},
      fifoError: "",
      fifoValidation: { isValid: true, warnings: [], errors: [] },
    }),

  // ✅ NEW: Comprehensive State Management
  clearDepartureWorkflowState: () => set({
    comprehensiveDepartureOrders: [],
    currentDepartureOrder: null,
    pendingDepartureOrders: [],
    approvedDepartureOrders: [],
    rejectedDepartureOrders: [],
    dispatchedDepartureOrders: [],
    completedDepartureOrders: [],
    departureAuditTrail: {},
    workflowActions: {},
    selectedDepartureOrderIds: [],
    batchOperationStatus: {
      isProcessing: false,
      operation: null,
      progress: 0,
      results: [],
    },
    // Also clear form state
    comprehensiveDepartureFormData: processesInitialState.comprehensiveDepartureFormData,
    selectedWarehouse: null,
    departureFormProducts: [],
    isSubmittingDepartureForm: false,
    departureFormError: "",
  }),

  clearAllExpiryFifoState: () => set({
    expiryFifoLocations: {},
    expiryFifoAllocations: {},
    productFifoAnalyses: {},
    expiryUrgencyDashboard: null,
  }),

  initializeWorkflowForUser: (role) => set({
    userRole: role,
    workflowStatus: {
      currentWorkflow: null,
      currentStep: null,
      availableActions: [],
      isProcessing: false,
    },
  }),

  // Reset
  resetProcessesStore: () => set(processesInitialState),
}));

export default createSelectors(processesStore);

// Re-export types that might be needed by components
export type { ProcessesStore, ProcessesStoreActions, ProductRow, ComprehensiveDepartureFormData };
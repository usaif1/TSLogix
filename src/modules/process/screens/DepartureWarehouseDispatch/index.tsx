import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Store and Services
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/modules/process/api/process.service";

// Types based on actual API response
interface ApprovedDepartureOrder {
  departure_order_id: string;
  departure_order_no: string;
  registration_date: string;
  document_date: string;
  departure_date_time: string;
  order_status: string;
  client: {
    client_id: string;
    company_name: string;
    first_names: string | null;
    last_name: string | null;
    client_type: string;
  };
  warehouse: {
    warehouse_id: string;
    name: string;
    location: string;
  };
  organisation: {
    name: string;
  };
  creator: {
    first_name: string;
    last_name: string;
  };
  destination_point: string;
  transport_type: string;
  carrier_name: string | null;
  dispatch_document_number: string;
  products_to_dispatch: ProductToDispatch[];
  total_products: number;
  total_requested_quantity: number;
  total_available_quantity: number;
  total_requested_weight: number;
  total_available_weight: number;
  warehouses_involved: string[];
  can_fully_fulfill: boolean;
  overall_fulfillment_percentage: number;
  has_urgent_items: boolean;
  has_high_priority_items: boolean;
  can_dispatch: boolean;
}

interface ProductToDispatch {
  departure_order_product_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  manufacturer: string;
  lot_series: string;
  requested_quantity: number;
  requested_packages: number;
  requested_weight: number;
  requested_volume: number | null;
  available_quantity: number;
  available_weight: number;
  available_locations: AvailableLocation[];
  total_stored_quantity: number;
  total_stored_weight: number;
  all_storage_locations: StorageLocation[];
  storage_location_count: number;
  all_warehouses: string[];
  storage_by_quality_status: Record<string, number>;
  storage_by_inventory_status: Record<string, number>;
  blocking_reasons: string[];
  location_count: number;
  warehouses: string[];
  can_fulfill: boolean;
  fulfillment_percentage: number;
  storage_fulfillment_percentage: number;
  earliest_expiry: string;
  has_near_expiry: boolean;
  has_expired: boolean;
  dispatch_priority: string;
}

interface AvailableLocation {
  allocation_id: string;
  inventory_id: string;
  cell_id: string;
  cell_reference: string;
  warehouse_name: string;
  warehouse_id: string;
  available_quantity: number;
  available_packages: number;
  available_weight: number;
  available_volume: number | null;
  presentation: string;
  product_status: string;
  status_code: number;
  quality_status: string;
  expiration_date: string;
  lot_series: string;
  manufacturing_date: string;
  entry_order_no: string;
  days_to_expiry: number;
  is_near_expiry: boolean;
  is_expired: boolean;
}

interface StorageLocation {
  allocation_id: string;
  inventory_id: string;
  cell_id: string;
  cell_reference: string;
  warehouse_name: string;
  warehouse_id: string;
  stored_quantity: number;
  stored_packages: number;
  stored_weight: number;
  stored_volume: number | null;
  inventory_status: string;
  quality_status: string;
  can_dispatch_from_here: boolean;
  blocking_reason?: string;
  presentation: string;
  product_status: string;
  status_code: number;
  expiration_date: string;
  lot_series: string;
  manufacturing_date: string;
  entry_order_no: string;
  days_to_expiry: number;
  is_near_expiry: boolean;
  is_expired: boolean;
}

interface DispatchSelection {
  inventory_id: string;
  cell_reference: string;
  selected_quantity: number;
  selected_weight: number;
  selected_packages: number;
  available_quantity: number;
  available_weight: number;
  available_packages: number;
  expiry_date: string;
  lot_series: string;
  entry_order_no: string;
  notes?: string;
}

const DepartureWarehouseDispatch: React.FC = () => {
  const { t } = useTranslation(['process']);
  const navigate = useNavigate();
  
  // Use global store instead of useState
  const {
    // Global state
    approvedDepartureOrders,
    selectedDepartureOrder,
    selectedDispatchProduct,
    availableLocationsForDispatch,
    dispatchSelections,
    
    // Loaders
    loaders,
    
    // Error state
    dispatchError,
    
    // Actions
    setApprovedDepartureOrders,
    setSelectedDepartureOrder,
    setSelectedDispatchProduct,
    setAvailableLocationsForDispatch,
    setDispatchSelections,
    addDispatchSelection,
    updateDispatchSelection,
    removeDispatchSelection,
    clearDispatchSelections,
    setDispatchError,
    clearDispatchError,
    startLoader,
    stopLoader,
  } = ProcessesStore();

  // Load approved departure orders on component mount
  useEffect(() => {
    loadApprovedOrders();
  }, []);

  const loadApprovedOrders = async () => {
    startLoader("warehouse-dispatch/load-approved-orders");
    clearDispatchError();
    try {
      const organisationId = localStorage.getItem("organisation_id");
      const response = await ProcessService.getApprovedDepartureOrders({ 
        organisationId: organisationId || undefined 
      });
      setApprovedDepartureOrders(response || []);
      console.log("✅ Loaded approved departure orders:", response);
    } catch (error: any) {
      console.error("❌ Error loading approved orders:", error);
      setDispatchError(t('process:failed_to_load_approved_orders'));
      setApprovedDepartureOrders([]);
    } finally {
      stopLoader("warehouse-dispatch/load-approved-orders");
    }
  };

  const handleOrderSelection = (order: ApprovedDepartureOrder | null) => {
    setSelectedDepartureOrder(order);
    setSelectedDispatchProduct(null);
    setAvailableLocationsForDispatch([]);
    clearDispatchSelections();
  };

  const handleProductSelection = (product: ProductToDispatch | null) => {
    setSelectedDispatchProduct(product);
    setAvailableLocationsForDispatch(product?.available_locations || []);
    clearDispatchSelections();
  };

  const handleLocationSelection = (location: AvailableLocation) => {
    const existingSelection = dispatchSelections.find(
      s => s.inventory_id === location.inventory_id
    );

    if (existingSelection) {
      removeDispatchSelection(location.inventory_id);
    } else {
      const newSelection: DispatchSelection = {
        inventory_id: location.inventory_id,
        cell_reference: location.cell_reference,
        selected_quantity: Math.min(
          location.available_quantity, 
          selectedDispatchProduct?.requested_quantity || 0
        ),
        selected_weight: Math.min(
          location.available_weight, 
          selectedDispatchProduct?.requested_weight || 0
        ),
        selected_packages: Math.min(
          location.available_packages, 
          selectedDispatchProduct?.requested_packages || 0
        ),
        available_quantity: location.available_quantity,
        available_weight: location.available_weight,
        available_packages: location.available_packages,
        expiry_date: location.expiration_date,
        lot_series: location.lot_series,
        entry_order_no: location.entry_order_no,
        notes: "",
      };
      addDispatchSelection(newSelection);
    }
  };

  const updateDispatchQuantity = (inventoryId: string, field: keyof DispatchSelection, value: number) => {
    const selection = dispatchSelections.find(s => s.inventory_id === inventoryId);
    if (selection) {
      const maxValue = field === 'selected_quantity' 
        ? selection.available_quantity 
        : field === 'selected_weight'
        ? selection.available_weight
        : selection.available_packages;
      
      const updatedSelection = {
        ...selection,
        [field]: Math.min(Math.max(0, value), maxValue)
      };
      updateDispatchSelection(inventoryId, updatedSelection);
    }
  };

  const getTotalSelected = () => {
    return dispatchSelections.reduce((totals, selection) => ({
      quantity: totals.quantity + selection.selected_quantity,
      weight: totals.weight + selection.selected_weight,
      packages: totals.packages + selection.selected_packages
    }), { quantity: 0, weight: 0, packages: 0 });
  };

  const getUrgencyIndicator = (location: AvailableLocation) => {
    if (location.is_expired) return { text: t('process:expired'), priority: 'high' };
    if (location.days_to_expiry <= 7) return { text: t('process:urgent'), priority: 'high' };
    if (location.days_to_expiry <= 30) return { text: t('process:warning'), priority: 'medium' };
    return { text: t('process:normal'), priority: 'low' };
  };

  const executeDispatch = async () => {
    if (!selectedDepartureOrder || !selectedDispatchProduct || dispatchSelections.length === 0) {
      toast.error(t('process:please_select_inventory_for_dispatch'));
      return;
    }

    const totals = getTotalSelected();
    if (totals.quantity <= 0) {
      toast.error(t('process:please_select_valid_quantities'));
      return;
    }

    startLoader("warehouse-dispatch/execute-dispatch");
    try {
      const userId = localStorage.getItem("user_id") || "unknown-user";
      
      const dispatchData = {
        departure_order_id: selectedDepartureOrder.departure_order_id,
        dispatched_by: userId,
        dispatch_notes: `FIFO dispatch from ${dispatchSelections.length} location(s)`,
        inventory_selections: dispatchSelections.map(s => ({
          inventory_id: s.inventory_id,
          departure_order_product_id: selectedDispatchProduct.departure_order_product_id,
          dispatch_quantity: s.selected_quantity,
          dispatch_weight: s.selected_weight,
          dispatch_notes: s.notes || "",
        })),
      };

      const result = await ProcessService.dispatchApprovedOrder(dispatchData);
      
      toast.success(t('process:dispatch_completed_successfully'));
      console.log("✅ Dispatch completed:", result);
      
      // Navigate back to departure page after successful dispatch
      navigate('/processes/departure');
      
    } catch (error: any) {
      console.error("❌ Error executing dispatch:", error);
      toast.error(error.message || t('process:dispatch_failed'));
    } finally {
      stopLoader("warehouse-dispatch/execute-dispatch");
    }
  };

  const isLoading = (key: string) => loaders[`warehouse-dispatch/${key}`] || false;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <Text size="2xl" weight="font-bold" additionalClass="text-gray-900">
              {t('process:warehouse_dispatch_center')}
            </Text>
            <Text size="sm" additionalClass="text-gray-600 mt-1">
              {t('process:dispatch_approved_orders_description')}
            </Text>
          </div>
          <Button
            onClick={() => navigate('/processes/departure')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
          >
            {t('process:back_to_departure')}
          </Button>
        </div>
      </div>

      {dispatchError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <Text weight="font-medium">{t('process:error')}</Text>
          <Text size="sm">{dispatchError}</Text>
        </div>
      )}

      {/* Step 1: Select Approved Order */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
        <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-900">
          {t('process:step_1_select_approved_order')}
        </Text>
        
        {isLoading("load-approved-orders") ? (
          <LoaderSync loaderText={t('process:loading_approved_orders')} />
        ) : (
          <div className="space-y-4">
            <Select
              value={selectedDepartureOrder ? {
                value: selectedDepartureOrder.departure_order_id,
                label: `${selectedDepartureOrder.departure_order_no} - ${selectedDepartureOrder.client.company_name} (${selectedDepartureOrder.total_products} ${t('process:products')})`
              } : null}
              onChange={(option) => {
                const order = approvedDepartureOrders.find(o => o.departure_order_id === option?.value) || null;
                handleOrderSelection(order);
              }}
              options={approvedDepartureOrders.map(order => ({
                value: order.departure_order_id,
                label: `${order.departure_order_no} - ${order.client.company_name} (${order.total_products} ${t('process:products')})`
              }))}
              placeholder={t('process:select_approved_order_for_dispatch')}
              noOptionsMessage={() => t('process:no_approved_orders_available')}
              isClearable
              className="mb-4"
            />
            
            {selectedDepartureOrder && (
              <div className="bg-gray-50 p-4 rounded border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:order_code')}</Text>
                    <Text additionalClass="text-gray-900">{selectedDepartureOrder.departure_order_no}</Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:customer')}</Text>
                    <Text additionalClass="text-gray-900">{selectedDepartureOrder.client.company_name}</Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:total_quantity')}</Text>
                    <Text additionalClass="text-gray-900">{selectedDepartureOrder.total_requested_quantity} {t('process:units')}</Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:warehouse')}</Text>
                    <Text additionalClass="text-gray-900">{selectedDepartureOrder.warehouse.name}</Text>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Select Product */}
      {selectedDepartureOrder && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-900">
            {t('process:step_2_select_product_to_dispatch')}
          </Text>
          
          <div className="space-y-4">
            <Select
              value={selectedDispatchProduct ? {
                value: selectedDispatchProduct.departure_order_product_id,
                label: `${selectedDispatchProduct.product_code} - ${selectedDispatchProduct.product_name} (${selectedDispatchProduct.requested_quantity} ${t('process:requested')})`
              } : null}
              onChange={(option) => {
                const product = selectedDepartureOrder.products_to_dispatch.find(p => p.departure_order_product_id === option?.value) || null;
                handleProductSelection(product);
              }}
              options={selectedDepartureOrder.products_to_dispatch.map(product => ({
                value: product.departure_order_product_id,
                label: `${product.product_code} - ${product.product_name} (${product.requested_quantity} ${t('process:requested')})`
              }))}
              placeholder={t('process:select_product_to_dispatch')}
              noOptionsMessage={() => t('process:no_products_in_order')}
              isClearable
            />
            
            {selectedDispatchProduct && (
              <div className="bg-gray-50 p-4 rounded border">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:requested')}</Text>
                    <Text additionalClass="text-gray-900">{selectedDispatchProduct.requested_quantity} {t('process:units')}</Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:available_for_dispatch')}</Text>
                    <Text additionalClass={selectedDispatchProduct.available_quantity > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {selectedDispatchProduct.available_quantity} {t('process:units')}
                    </Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:total_in_storage')}</Text>
                    <Text additionalClass="text-gray-900">{selectedDispatchProduct.total_stored_quantity} {t('process:units')}</Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:storage_locations')}</Text>
                    <Text additionalClass="text-gray-900">{selectedDispatchProduct.storage_location_count} {t('process:locations')}</Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700">{t('process:priority')}</Text>
                    <Text additionalClass="text-gray-900 font-medium">
                      {t(`process:${selectedDispatchProduct.dispatch_priority.toLowerCase()}`)}
                    </Text>
                  </div>
                </div>

                {/* Dispatch Status */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {selectedDispatchProduct.can_fulfill ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <Text size="sm" weight="font-medium" additionalClass="text-green-700">
                        {t('process:can_dispatch_full_quantity')}
                      </Text>
                    </div>
                  ) : selectedDispatchProduct.available_quantity > 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <Text size="sm" weight="font-medium" additionalClass="text-yellow-700">
                        {t('process:can_dispatch_partial_quantity')} ({selectedDispatchProduct.fulfillment_percentage}%)
                      </Text>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <Text size="sm" weight="font-medium" additionalClass="text-red-700">
                        {t('process:cannot_dispatch_no_available_inventory')}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Blocked Inventory Information */}
            {selectedDispatchProduct && selectedDispatchProduct.available_quantity === 0 && selectedDispatchProduct.all_storage_locations?.length > 0 && (
              <div className="mt-4 bg-yellow-50 p-4 rounded border border-yellow-200">
                <Text weight="font-semibold" additionalClass="text-yellow-800 mb-3">
                  {t('process:blocked_inventory_information')}
                </Text>
                <Text size="sm" additionalClass="text-yellow-700 mb-3">
                  {t('process:inventory_exists_but_blocked_reasons')}
                </Text>
                
                <div className="space-y-2">
                  {selectedDispatchProduct.blocking_reasons.map((reason, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                      <Text size="sm" additionalClass="text-yellow-800">{reason}</Text>
                    </div>
                  ))}
                </div>

                {/* Inventory Status Breakdown */}
                {selectedDispatchProduct.storage_by_inventory_status && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <Text size="sm" weight="font-medium" additionalClass="text-yellow-800 mb-2">
                      {t('process:inventory_status_breakdown')}:
                    </Text>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {Object.entries(selectedDispatchProduct.storage_by_inventory_status).map(([status, count]) => (
                        <div key={status} className="flex justify-between">
                          <span className="text-yellow-700">{status}:</span>
                          <span className="text-yellow-900 font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Storage Locations Table */}
                <div className="mt-4">
                  <Text size="sm" weight="font-medium" additionalClass="text-yellow-800 mb-2">
                    {t('process:storage_locations_detail')}:
                  </Text>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-yellow-300">
                      <thead className="bg-yellow-100">
                        <tr>
                          <th className="border border-yellow-300 p-2 text-left text-yellow-800">{t('process:cell')}</th>
                          <th className="border border-yellow-300 p-2 text-left text-yellow-800">{t('process:quantity')}</th>
                          <th className="border border-yellow-300 p-2 text-left text-yellow-800">{t('process:status')}</th>
                          <th className="border border-yellow-300 p-2 text-left text-yellow-800">{t('process:blocking_reason')}</th>
                          <th className="border border-yellow-300 p-2 text-left text-yellow-800">{t('process:expiry_date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDispatchProduct.all_storage_locations.map((location) => (
                          <tr key={location.inventory_id}>
                            <td className="border border-yellow-300 p-2 text-yellow-900">{location.cell_reference}</td>
                            <td className="border border-yellow-300 p-2 text-yellow-900">{location.stored_quantity}</td>
                            <td className="border border-yellow-300 p-2">
                              <span className={`px-1 py-0.5 text-xs rounded ${
                                location.inventory_status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                location.inventory_status === 'HOLD' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {location.inventory_status}
                              </span>
                            </td>
                            <td className="border border-yellow-300 p-2 text-yellow-900 text-xs">
                              {location.blocking_reason || '-'}
                            </td>
                            <td className="border border-yellow-300 p-2 text-yellow-900">
                              {new Date(location.expiration_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: FIFO Inventory Selection */}
      {selectedDispatchProduct && availableLocationsForDispatch.length > 0 && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-900">
            {t('process:step_3_fifo_inventory_selection')}
          </Text>
          
          <div className="space-y-4">
            <Text size="sm" additionalClass="text-gray-600">
              {t('process:fifo_inventory_sorted_by_expiry')}
            </Text>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">{t('process:select')}</th>
                    <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">{t('process:cell')}</th>
                    <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">{t('process:available_qty')}</th>
                    <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">{t('process:expiry_date')}</th>
                    <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">{t('process:lot_number')}</th>
                    <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">{t('process:entry_order_no')}</th>
                    <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">{t('process:priority')}</th>
                    <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">{t('process:status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {availableLocationsForDispatch
                    .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())
                    .map((location) => {
                      const isSelected = dispatchSelections.some(s => s.inventory_id === location.inventory_id);
                      const urgency = getUrgencyIndicator(location);
                      return (
                        <tr 
                          key={location.inventory_id} 
                          className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                        >
                          <td className="border border-gray-200 p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleLocationSelection(location)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                          </td>
                          <td className="border border-gray-200 p-3 font-medium text-gray-900">{location.cell_reference}</td>
                          <td className="border border-gray-200 p-3">
                            <div>
                              <Text additionalClass="text-gray-900">{location.available_quantity} {t('process:units')}</Text>
                              <Text size="xs" additionalClass="text-gray-500">{location.available_weight} kg</Text>
                            </div>
                          </td>
                          <td className="border border-gray-200 p-3">
                            <div>
                              <Text additionalClass="text-gray-900">{new Date(location.expiration_date).toLocaleDateString()}</Text>
                              <Text size="xs" additionalClass="text-gray-500">
                                {location.days_to_expiry} {t('process:days_to_expiry')}
                              </Text>
                            </div>
                          </td>
                          <td className="border border-gray-200 p-3 text-gray-900">{location.lot_series}</td>
                          <td className="border border-gray-200 p-3 text-gray-900">{location.entry_order_no}</td>
                          <td className="border border-gray-200 p-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              urgency.priority === 'high' ? 'bg-red-100 text-red-800' :
                              urgency.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {urgency.text}
                            </span>
                          </td>
                          <td className="border border-gray-200 p-3">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              {t('process:available')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Dispatch Quantities */}
      {dispatchSelections.length > 0 && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-900">
            {t('process:step_4_specify_dispatch_quantities')}
          </Text>
          
          <div className="space-y-4">
            {dispatchSelections.map((selection) => (
              <div key={selection.inventory_id} className="bg-gray-50 p-4 rounded border">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700 text-sm">{t('process:cell')}</Text>
                    <Text additionalClass="text-gray-900">{selection.cell_reference}</Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700 text-sm">{t('process:lot')}</Text>
                    <Text additionalClass="text-gray-900">{selection.lot_series}</Text>
                  </div>
                  <div>
                    <Text weight="font-medium" additionalClass="text-gray-700 text-sm">{t('process:available')}</Text>
                    <Text additionalClass="text-gray-900">{selection.available_quantity} {t('process:units')}</Text>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('process:dispatch_quantity')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selection.available_quantity}
                      value={selection.selected_quantity}
                      onChange={(e) => updateDispatchQuantity(
                        selection.inventory_id, 
                        'selected_quantity', 
                        parseInt(e.target.value) || 0
                      )}
                      className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('process:dispatch_weight')} (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selection.available_weight}
                      step="0.01"
                      value={selection.selected_weight}
                      onChange={(e) => updateDispatchQuantity(
                        selection.inventory_id, 
                        'selected_weight', 
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('process:packages')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selection.available_packages}
                      value={selection.selected_packages}
                      onChange={(e) => updateDispatchQuantity(
                        selection.inventory_id, 
                        'selected_packages', 
                        parseInt(e.target.value) || 0
                      )}
                      className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Button
                      onClick={() => removeDispatchSelection(selection.inventory_id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm w-full"
                    >
                      {t('process:remove')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Dispatch Summary */}
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <Text weight="font-medium" additionalClass="text-gray-900 mb-3">{t('process:dispatch_summary')}</Text>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Text weight="font-medium" additionalClass="text-gray-700">{t('process:total_selected_quantity')}</Text>
                  <Text additionalClass="text-gray-900 font-semibold">{getTotalSelected().quantity} {t('process:units')}</Text>
                </div>
                <div>
                  <Text weight="font-medium" additionalClass="text-gray-700">{t('process:total_selected_weight')}</Text>
                  <Text additionalClass="text-gray-900 font-semibold">{getTotalSelected().weight.toFixed(2)} kg</Text>
                </div>
                <div>
                  <Text weight="font-medium" additionalClass="text-gray-700">{t('process:packages')}</Text>
                  <Text additionalClass="text-gray-900 font-semibold">{getTotalSelected().packages}</Text>
                </div>
                <div>
                  <Text weight="font-medium" additionalClass="text-gray-700">{t('process:dispatch_type')}</Text>
                  <Text additionalClass="text-gray-900 font-semibold">
                    {selectedDispatchProduct && getTotalSelected().quantity >= selectedDispatchProduct.requested_quantity 
                      ? t('process:full_dispatch') 
                      : t('process:partial_dispatch')
                    }
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execute Dispatch Actions */}
      {dispatchSelections.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <Text size="lg" weight="font-semibold" additionalClass="text-gray-900">
                {t('process:ready_to_dispatch')}
              </Text>
              <Text size="sm" additionalClass="text-gray-600">
                {getTotalSelected().quantity} {t('process:units')} {t('process:from')} {dispatchSelections.length} {t('process:locations')}
              </Text>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  clearDispatchSelections();
                  setSelectedDispatchProduct(null);
                  setSelectedDepartureOrder(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
                disabled={isLoading("execute-dispatch")}
              >
                {t('process:clear_selections')}
              </Button>
              
              <Button
                onClick={executeDispatch}
                disabled={isLoading("execute-dispatch") || getTotalSelected().quantity <= 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 font-medium"
              >
                {isLoading("execute-dispatch") ? (
                  <div className="flex items-center space-x-2">
                    <LoaderSync loaderText="" />
                    <span>{t('process:dispatching')}</span>
                  </div>
                ) : (
                  `${t('process:execute_dispatch')} (${getTotalSelected().quantity} ${t('process:units')})`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartureWarehouseDispatch; 
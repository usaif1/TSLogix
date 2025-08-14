/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Store and Services
import ProcessesStore from "@/modules/process/store";
import { ProcessService } from "@/modules/process/api/process.service";


// Comprehensive dispatch row interface with all information
interface DispatchRow {
  id: string;
  departure_order_product_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  manufacturer: string;
  lot_series: string;
  requested_quantity: number;
  requested_packages: number;
  requested_weight: number;
  available_quantity: number;
  available_packages: number;
  available_weight: number;
  total_stored_quantity: number;
  total_stored_packages: number;
  total_stored_weight: number;
  storage_locations: number;
  dispatch_priority: string;
  can_fulfill: boolean;
  fulfillment_percentage: number;
  inventory_status: string;
  blocking_reasons: string[];
  earliest_expiry: string;
  has_near_expiry: boolean;
  has_expired: boolean;
  urgency_level: 'high' | 'medium' | 'low';
  // Dispatch controls
  selected_quantity: number;
  selected_packages: number;
  selected_weight: number;
  dispatch_notes: string;
  // FIFO dispatch information
  fifo_dispatch_plan: Array<{
    allocation_id: string;
    inventory_id: string;
    cell_reference: string;
    warehouse_name: string;
    quantity_to_dispatch: number;
    weight_to_dispatch: number;
    removal_priority: string;
    removal_reason: string;
    days_to_expiry: number;
    is_urgent: boolean;
    is_near_expiry: boolean;
    is_expired: boolean;
  }>;
  // UI state
  isSelected: boolean;
  isValid: boolean;
  errors: string[];
}

const DepartureWarehouseDispatch: React.FC = () => {
  const { t } = useTranslation(['process']);
  const navigate = useNavigate();
  
  // Use global store
  const {
    // Global state
    approvedDepartureOrders,
    selectedDepartureOrder,
    
    // Loaders
    loaders,
    
    // Error state
    dispatchError,
    
    // Actions
    setApprovedDepartureOrders,
    setSelectedDepartureOrder,
    clearDispatchSelections,
    setDispatchError,
    clearDispatchError,
    startLoader,
    stopLoader,
  } = ProcessesStore();

  // Local state for dispatch rows
  const [dispatchRows, setDispatchRows] = React.useState<DispatchRow[]>([]);

  // Load approved departure orders on component mount
  useEffect(() => {
    loadApprovedOrders();
  }, []);

  // Update dispatch rows when selected order changes
  useEffect(() => {
    if (selectedDepartureOrder?.products_to_dispatch) {
      const rows = createDispatchRows(selectedDepartureOrder.products_to_dispatch);
      setDispatchRows(rows);
    } else {
      setDispatchRows([]);
    }
  }, [selectedDepartureOrder]);

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
    } catch (error: unknown) {
      console.error("❌ Error loading approved orders:", error);
      setDispatchError(t('process:failed_to_load_approved_orders'));
      setApprovedDepartureOrders([]);
    } finally {
      stopLoader("warehouse-dispatch/load-approved-orders");
    }
  };

  const handleOrderSelection = (option: { value: string; label: string } | null) => {
    if (option) {
      const order = approvedDepartureOrders.find((o: any) => o.departure_order_id === option.value);
      setSelectedDepartureOrder(order || null);
    } else {
      setSelectedDepartureOrder(null);
    }
    clearDispatchSelections();
  };

  const createDispatchRows = (products: any[]): DispatchRow[] => {
    return products.map((product: any) => {
      // Calculate available packages and urgency
      const availablePackages = product.available_locations?.reduce((sum: number, loc: any) => sum + (loc.available_packages || 0), 0) || 0;
      const availableWeight = product.available_locations?.reduce((sum: number, loc: any) => sum + (loc.available_weight || 0), 0) || 0;
      
      // Calculate total stored packages
      const totalStoredPackages = product.all_storage_locations?.reduce((sum: number, loc: any) => sum + (loc.stored_packages || 0), 0) || 0;
      
      // Determine urgency level
      let urgencyLevel: 'high' | 'medium' | 'low' = 'low';
      if (product.has_expired) urgencyLevel = 'high';
      else if (product.has_near_expiry) urgencyLevel = 'medium';

      return {
        id: product.departure_order_product_id,
        departure_order_product_id: product.departure_order_product_id,
        product_id: product.product_id,
        product_code: product.product_code,
        product_name: product.product_name,
        manufacturer: product.manufacturer || 'N/A',
        lot_series: product.lot_series || 'N/A',
        requested_quantity: product.requested_quantity,
        requested_packages: product.requested_packages,
        requested_weight: product.requested_weight,
        available_quantity: product.available_quantity,
        available_packages: availablePackages,
        available_weight: availableWeight,
        total_stored_quantity: product.total_stored_quantity,
        total_stored_packages: totalStoredPackages,
        total_stored_weight: product.total_stored_weight,
        storage_locations: product.storage_location_count || 0,
        dispatch_priority: product.dispatch_priority || 'NORMAL',
        can_fulfill: product.can_fulfill,
        fulfillment_percentage: product.fulfillment_percentage || 0,
        inventory_status: product.available_quantity > 0 ? 'AVAILABLE' : 'BLOCKED',
        blocking_reasons: product.blocking_reasons || [],
        earliest_expiry: product.earliest_expiry || '',
        has_near_expiry: product.has_near_expiry || false,
        has_expired: product.has_expired || false,
        urgency_level: urgencyLevel,
        selected_quantity: 0,
        selected_packages: 0,
        selected_weight: 0,
        dispatch_notes: '',
        fifo_dispatch_plan: product.fifo_dispatch_plan || [],
        isSelected: false,
        isValid: product.can_fulfill,
        errors: product.available_quantity === 0 ? (product.blocking_reasons || []) : [],
      };
    });
  };

  const updateDispatchRow = (id: string, updates: Partial<DispatchRow>) => {
    setDispatchRows(prev => prev.map(row => 
      row.id === id ? { ...row, ...updates } : row
    ));
  };

  const executeDispatch = async () => {
    if (!selectedDepartureOrder) {
      toast.error(t('process:please_select_order_first'));
      return;
    }

    const selectedRows = dispatchRows.filter(row => row.isSelected && row.selected_quantity > 0);
    if (selectedRows.length === 0) {
      toast.error(t('process:please_select_products_for_dispatch'));
      return;
    }

    startLoader("warehouse-dispatch/execute-dispatch");
    try {
      const userId = localStorage.getItem("user_id") || "unknown-user";
      
      // For each selected product, we need to create dispatch selections
      const allDispatchData = [];
      
      for (const row of selectedRows) {
        const product = selectedDepartureOrder.products_to_dispatch?.find((p: any) => 
          p.departure_order_product_id === row.departure_order_product_id
        );
        
        if (product?.available_locations?.length > 0) {
          // Use FIFO logic - take from locations based on expiry date
          const sortedLocations = [...product.available_locations].sort((a, b) => 
            new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
          );
          
          let remainingToDispatch = row.selected_quantity;
          
          for (const location of sortedLocations) {
            if (remainingToDispatch <= 0) break;
            
            const quantityFromThisLocation = Math.min(remainingToDispatch, location.available_quantity);
            if (quantityFromThisLocation > 0) {
              allDispatchData.push({
                inventory_id: location.inventory_id,
                departure_order_product_id: row.departure_order_product_id,
                dispatch_quantity: quantityFromThisLocation,
                dispatch_weight: (quantityFromThisLocation / location.available_quantity) * location.available_weight,
                dispatch_notes: row.dispatch_notes || "",
              });
              remainingToDispatch -= quantityFromThisLocation;
            }
          }
        }
      }

      if (allDispatchData.length === 0) {
        toast.error(t('process:no_valid_inventory_selections'));
        return;
      }

      const dispatchData = {
        departure_order_id: selectedDepartureOrder.departure_order_id,
        dispatched_by: userId,
        dispatch_notes: `Batch dispatch of ${selectedRows.length} product(s)`,
        inventory_selections: allDispatchData,
      };

      const result = await ProcessService.dispatchApprovedOrder(dispatchData);
      
      toast.success(t('process:dispatch_completed_successfully'));
      console.log("✅ Dispatch completed:", result);
      
      // Navigate back to departure page after successful dispatch
      navigate('/processes/departure');
      
    } catch (error: unknown) {
      console.error("❌ Error executing dispatch:", error);
      const errorMessage = error instanceof Error ? error.message : 'Dispatch failed';
      toast.error(errorMessage || t('process:dispatch_failed'));
    } finally {
      stopLoader("warehouse-dispatch/execute-dispatch");
    }
  };

  const isLoading = (key: string) => {
    const loaderKey = `warehouse-dispatch/${key}` as keyof typeof loaders;
    return loaders[loaderKey] || false;
  };

  // Get order options for dropdown
  const getOrderOptions = () => {
    return approvedDepartureOrders.map((order: any) => ({
      value: order.departure_order_id,
      label: `${order.departure_order_no} - ${order.client?.company_name || 'Unknown Client'} (${order.total_products || 0} products)`
    }));
  };

  // Calculate totals for selected rows
  const getSelectedTotals = () => {
    const selectedRows = dispatchRows.filter(row => row.isSelected);
    return {
      totalProducts: selectedRows.length,
      totalQuantity: selectedRows.reduce((sum, row) => sum + row.selected_quantity, 0),
      totalWeight: selectedRows.reduce((sum, row) => sum + row.selected_weight, 0),
      totalPackages: selectedRows.reduce((sum, row) => sum + row.selected_packages, 0),
    };
  };

  const selectedTotals = getSelectedTotals();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <Text size="2xl" weight="font-bold" additionalClass="text-gray-900">
              {t('process:warehouse_dispatch_center')}
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
        <div className="mb-4 p-4 bg-red-50 border-red-200 text-red-700 rounded-lg">
          <Text weight="font-medium">{t('process:error')}</Text>
          <Text size="sm">{dispatchError}</Text>
        </div>
      )}

      {/* Step 1: Select Approved Order */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <Text size="lg" weight="font-semibold" additionalClass="mb-4 text-gray-900">
          {t('process:step_1_select_approved_order')}
        </Text>
        
        {isLoading("load-approved-orders") ? (
          <div className="flex justify-center py-8">
            <LoaderSync loaderText={t('process:loading_approved_orders')} />
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              options={getOrderOptions()}
              value={selectedDepartureOrder ? getOrderOptions().find(option => option.value === selectedDepartureOrder.departure_order_id) : null}
              onChange={handleOrderSelection}
              placeholder={t('process:select_approved_order_for_dispatch')}
              isClearable
              isSearchable
              className="text-sm"
              menuPortalTarget={document.body}
              styles={{
                control: (base) => ({ ...base, minHeight: '40px' }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
            
            {approvedDepartureOrders.length === 0 && (
              <Text size="sm" additionalClass="text-gray-500">
                {t('process:no_approved_orders_available')}
              </Text>
            )}
            
            {approvedDepartureOrders.length > 0 && (
              <Text size="sm" additionalClass="text-gray-600">
                {approvedDepartureOrders.length} {t('process:approved_orders_available')}
              </Text>
            )}
          </div>
        )}

        {selectedDepartureOrder && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <Text weight="font-medium" additionalClass="mb-2">
              {selectedDepartureOrder.departure_order_no} - {selectedDepartureOrder.client?.company_name}
            </Text>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <Text size="xs" additionalClass="text-gray-500">{t('process:total_products')}</Text>
                <Text weight="font-medium">{selectedDepartureOrder.total_products || selectedDepartureOrder.products_to_dispatch?.length || 0}</Text>
              </div>
              <div>
                <Text size="xs" additionalClass="text-gray-500">{t('process:total_requested')}</Text>
                <Text weight="font-medium">{selectedDepartureOrder.total_requested_quantity || 0} {t('process:units')}</Text>
              </div>
              <div>
                <Text size="xs" additionalClass="text-gray-500">{t('process:total_available')}</Text>
                <Text weight="font-medium">{selectedDepartureOrder.total_available_quantity || 0} {t('process:units')}</Text>
              </div>
              <div>
                <Text size="xs" additionalClass="text-gray-500">{t('process:can_dispatch')}</Text>
                <Text weight="font-medium" additionalClass={selectedDepartureOrder.can_dispatch ? "text-green-600" : "text-red-600"}>
                  {selectedDepartureOrder.can_dispatch ? t('process:yes') : t('process:no')}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Comprehensive Products Table */}
      {selectedDepartureOrder && dispatchRows.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Text size="lg" weight="font-semibold">
                  {t('process:step_2_dispatch_products')}
                </Text>
                <Text size="sm" additionalClass="text-gray-600">
                  {selectedTotals.totalProducts} {t('process:products_selected')} • {selectedTotals.totalQuantity} {t('process:units')} {t('process:selected')}
                </Text>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/processes/departure')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
                  disabled={isLoading("execute-dispatch")}
                >
                  {t('process:back_to_departure')}
                </Button>
                <Button
                  onClick={executeDispatch}
                  disabled={isLoading("execute-dispatch") || selectedTotals.totalQuantity <= 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium"
                >
                  {isLoading("execute-dispatch") ? (
                    <div className="flex items-center space-x-2">
                      <LoaderSync loaderText="" />
                      <span>{t('process:dispatching')}</span>
                    </div>
                  ) : (
                    `${t('process:execute_dispatch')} (${selectedTotals.totalQuantity} ${t('process:units')})`
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Comprehensive Excel-like Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse table-fixed" style={{ minWidth: '2400px' }}>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="w-10 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.number')}</th>
                  <th className="w-16 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.select')}</th>
                  <th className="w-52 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.product')}</th>
                  <th className="w-36 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.manufacturer')}</th>
                  <th className="w-28 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.lot_series')}</th>
                  <th className="w-32 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.requested')}</th>
                  <th className="w-32 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.available')}</th>
                  <th className="w-32 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.stored')}</th>
                  <th className="w-24 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.locations')}</th>
                  <th className="w-28 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.status')}</th>
                  <th className="w-28 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.fulfillment')}</th>
                  <th className="w-32 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.dispatch_qty')}</th>
                  <th className="w-32 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.dispatch_packages')}</th>
                  <th className="w-36 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.dispatch_weight')}</th>
                  <th className="w-40 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.blocking_reasons')}</th>
                  <th className="w-48 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.fifo_cell_references')}</th>
                  <th className="w-36 p-3 text-xs font-medium text-gray-600">{t('process:table_headers.notes')}</th>
                </tr>
              </thead>
              <tbody>
                {dispatchRows.map((row, index) => (
                  <tr key={row.id} className={`${!row.isValid ? 'bg-red-50' : row.isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    {/* Row Number */}
                    <td className="p-2 text-center text-xs text-gray-500">
                      {index + 1}
                    </td>

                    {/* Select Checkbox */}
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.isSelected}
                        onChange={(e) => updateDispatchRow(row.id, { isSelected: e.target.checked })}
                        disabled={!row.can_fulfill}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>

                    {/* Product Info */}
                    <td className="p-2">
                      <div className="text-xs">
                        <div className="font-medium truncate" title={row.product_name}>{row.product_name}</div>
                        <div className="text-gray-500">{row.product_code}</div>
                      </div>
                    </td>

                    {/* Manufacturer */}
                    <td className="p-2 text-xs truncate" title={row.manufacturer}>
                      {row.manufacturer}
                    </td>

                    {/* Lot Series */}
                    <td className="p-2 text-xs text-center">
                      {row.lot_series}
                    </td>

                    {/* Requested Quantities */}
                    <td className="p-2 text-xs text-center">
                      <div>{row.requested_quantity} units</div>
                      <div className="text-gray-500">{row.requested_packages} {t('process:paq')}</div>
                      <div className="text-gray-500">{row.requested_weight} kg</div>
                    </td>

                    {/* Available Quantities */}
                    <td className="p-2 text-xs text-center">
                      <div className={row.available_quantity > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {row.available_quantity} units
                      </div>
                      <div className="text-gray-500">{row.available_packages} {t('process:paq')}</div>
                      <div className="text-gray-500">{row.available_weight.toFixed(1)} kg</div>
                    </td>

                    {/* Total Stored */}
                    <td className="p-2 text-xs text-center">
                      <div>{row.total_stored_quantity} units</div>
                      <div className="text-gray-500">{row.total_stored_packages} {t('process:paq')}</div>
                      <div className="text-gray-500">{row.total_stored_weight} kg</div>
                    </td>

                    {/* Storage Locations */}
                    <td className="p-2 text-xs text-center">
                      {row.storage_locations}
                    </td>



                    {/* Status */}
                    <td className="p-2 text-xs text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        row.inventory_status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(`common:${row.inventory_status.toLowerCase()}`) || row.inventory_status}
                      </span>
                    </td>

                    {/* Fulfillment */}
                    <td className="p-2 text-xs text-center">
                      <div className={row.can_fulfill ? "text-green-600" : "text-red-600"}>
                        {row.fulfillment_percentage}%
                      </div>
                    </td>

                    {/* Dispatch Quantity */}
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        max={row.available_quantity}
                        value={row.selected_quantity || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateDispatchRow(row.id, { 
                            selected_quantity: value
                          });
                        }}
                        disabled={!row.can_fulfill || !row.isSelected}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-center"
                        placeholder="0"
                      />
                    </td>

                    {/* Dispatch Packages */}
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        max={row.available_packages}
                        value={row.selected_packages || ''}
                        onChange={(e) => updateDispatchRow(row.id, { selected_packages: parseInt(e.target.value) || 0 })}
                        disabled={!row.can_fulfill || !row.isSelected}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-center"
                        placeholder="0"
                      />
                    </td>

                    {/* Dispatch Weight */}
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max={row.available_weight}
                        value={row.selected_weight || ''}
                        onChange={(e) => updateDispatchRow(row.id, { selected_weight: parseFloat(e.target.value) || 0 })}
                        disabled={!row.can_fulfill || !row.isSelected}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-center"
                        placeholder="0"
                      />
                    </td>

                    {/* Blocking Reasons */}
                    <td className="p-2 text-xs">
                      {row.blocking_reasons.length > 0 ? (
                        <div className="space-y-1">
                          {row.blocking_reasons.slice(0, 2).map((reason, idx) => {
                            // Translate blocking reason texts (handle "Quality status: STATUS" format)
                            const getTranslatedReason = (reasonText: string) => {
                              // Handle "Quality status: CUARENTENA" format
                              if (reasonText.startsWith('Quality status:')) {
                                const status = reasonText.split(':')[1]?.trim();
                                return `${t('process:quality_status')}: ${status}`;
                              }
                              // Handle exact match
                              if (reasonText === 'Quality status') {
                                return t('process:quality_status');
                              }
                              // Return as-is for other reasons
                              return reasonText;
                            };
                            
                            return (
                              <div key={idx} className="text-red-600 truncate" title={reason}>
                                {getTranslatedReason(reason)}
                              </div>
                            );
                          })}
                          {row.blocking_reasons.length > 2 && (
                            <div className="text-gray-500">+{row.blocking_reasons.length - 2} more</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-green-600">{t('process:no_issues')}</div>
                      )}
                    </td>

                    {/* FIFO Cell References */}
                    <td className="p-2 text-xs">
                      {row.fifo_dispatch_plan.length > 0 ? (
                        <div className="space-y-1">
                          {row.fifo_dispatch_plan.map((item, planIndex) => (
                            <div key={planIndex} className="flex items-center space-x-2">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.cell_reference}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({item.quantity_to_dispatch} {t('process:units')})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">{t('process:no_fifo_plan_available')}</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.dispatch_notes}
                        onChange={(e) => updateDispatchRow(row.id, { dispatch_notes: e.target.value })}
                        disabled={!row.isSelected}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                        placeholder={t('process:optional_notes')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          {selectedTotals.totalProducts > 0 && (
            <div className="p-4 border-t border-gray-200 bg-blue-50">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <Text size="xs" additionalClass="text-gray-600">{t('process:selected_products')}</Text>
                  <Text weight="font-medium">{selectedTotals.totalProducts}</Text>
                </div>
                <div>
                  <Text size="xs" additionalClass="text-gray-600">{t('process:total_quantity')}</Text>
                  <Text weight="font-medium">{selectedTotals.totalQuantity} {t('process:units')}</Text>
                </div>
                <div>
                  <Text size="xs" additionalClass="text-gray-600">{t('process:total_packages')}</Text>
                  <Text weight="font-medium">{selectedTotals.totalPackages}</Text>
                </div>
                <div>
                  <Text size="xs" additionalClass="text-gray-600">{t('process:total_weight')}</Text>
                  <Text weight="font-medium">{selectedTotals.totalWeight.toFixed(1)} kg</Text>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data States */}
      {!isLoading("load-approved-orders") && approvedDepartureOrders.length === 0 && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <Text size="lg" weight="font-medium" additionalClass="text-gray-600 mb-2">
            {t('process:no_approved_orders_available')}
          </Text>
          <Text size="sm" additionalClass="text-gray-500">
            {t('process:no_orders_to_dispatch')}
          </Text>
        </div>
      )}
    </div>
  );
};

export default DepartureWarehouseDispatch; 
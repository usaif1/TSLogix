import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import inventoryLogStore, { QualityControlStatus } from '../store';
import { InventoryLogService } from '../api/inventory.service';

export const useQuarantineManagement = () => {
  // Store state
  const quarantineInventory = inventoryLogStore.use.quarantineInventory();
  const warehouses = inventoryLogStore.use.warehouses();
  const isLoading = inventoryLogStore.use.loaders()['inventoryLogs/fetch-quarantine-inventory'];
  const isTransitioning = inventoryLogStore.use.loaders()['inventoryLogs/quality-transition'];
  
  // Quarantine filters
  const { selectedWarehouse, searchTerm, selectedStatus } = inventoryLogStore.use.quarantineFilters();
  
  // Selection state
  const { selectedItems, isAllSelected } = inventoryLogStore.use.quarantineSelection();
  
  // Transition state
  const { 
    showModal, 
    transitionStatus, 
    reason, 
    notes,
    quantityToMove,
    packageQuantityToMove,
    weightToMove,
    volumeToMove,
    selectedItem
  } = inventoryLogStore.use.quarantineTransition();
  
  // Store actions
  const {
    setQuarantineFilters,
    setQuarantineTransition,
    resetQuarantineSelection,
    toggleQuarantineItemSelection,
    toggleAllQuarantineSelection,
    startLoader,
    stopLoader,
    setQuarantineInventory,
    setWarehouses,
  } = inventoryLogStore.getState();

  // Filtered inventory based on search term (warehouse filtering is done at API level)
  const filteredInventory = useMemo(() => {
    let filtered = [...quarantineInventory];

    // Filter by search term only (warehouse filtering is handled by API)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const productName = item.entry_order_product.product.name.toLowerCase();
        const productCode = item.entry_order_product.product.product_code.toLowerCase();
        const entryOrderNo = item.entry_order_product.entry_order.entry_order_no.toLowerCase();
        const cellReference = `${item.cell.row}${item.cell.bay}${item.cell.position}`.toLowerCase();
        
        return (
          productName.includes(search) ||
          productCode.includes(search) ||
          entryOrderNo.includes(search) ||
          cellReference.includes(search)
        );
      });
    }

    return filtered;
  }, [quarantineInventory, searchTerm]);

  // Create a flexible function to fetch any quality status
  const fetchInventoryByStatus = async (qualityStatus: QualityControlStatus) => {
    try {
      startLoader('inventoryLogs/fetch-quarantine-inventory');
      
      // Build filters object
      const filters: { warehouse_id?: string } = {};
      if (selectedWarehouse?.value) {
        filters.warehouse_id = selectedWarehouse.value;
      }

      const response = await InventoryLogService.fetchInventoryByQualityStatus(qualityStatus, filters);
      setQuarantineInventory(response);
      
      // Update the selected status in filters
      setQuarantineFilters({ selectedStatus: qualityStatus });
      
      return response;
    } catch (error) {
      console.error('Error fetching inventory by quality status:', error);
      toast.error(`Failed to fetch ${qualityStatus.toLowerCase()} inventory`);
      throw error;
    } finally {
      stopLoader('inventoryLogs/fetch-quarantine-inventory');
    }
  };

  // Fetch data
  const fetchQuarantineInventory = async (qualityStatus: QualityControlStatus = QualityControlStatus.CUARENTENA) => {
    try {
      startLoader('inventoryLogs/fetch-quarantine-inventory');
      
      // Build filters object
      const filters: { warehouse_id?: string } = {};
      if (selectedWarehouse?.value) {
        filters.warehouse_id = selectedWarehouse.value;
      }

      const response = await InventoryLogService.fetchInventoryByQualityStatus(qualityStatus, filters);
      setQuarantineInventory(response);
    } catch (error) {
      console.error('Error fetching inventory by quality status:', error);
      toast.error(`Failed to fetch ${qualityStatus.toLowerCase()} inventory`);
    } finally {
      stopLoader('inventoryLogs/fetch-quarantine-inventory');
    }
  };

  const fetchWarehouses = async () => {
    try {
      startLoader('inventoryLogs/fetch-warehouses');
      const response = await InventoryLogService.fetchWarehouses();
      setWarehouses(response);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    } finally {
      stopLoader('inventoryLogs/fetch-warehouses');
    }
  };

  // Filter handlers
  const handleWarehouseChange = (warehouse: { value: string; label: string } | null) => {
    setQuarantineFilters({ selectedWarehouse: warehouse });
    resetQuarantineSelection();
    // Refresh data with new warehouse filter
    fetchQuarantineInventory();
  };

  const handleSearchChange = (term: string) => {
    setQuarantineFilters({ searchTerm: term });
    resetQuarantineSelection();
  };

  // Selection handlers
  const handleToggleItemSelection = (itemId: string) => {
    toggleQuarantineItemSelection(itemId);
  };

  const handleToggleAllSelection = () => {
    toggleAllQuarantineSelection();
  };

  const handleClearSelection = () => {
    resetQuarantineSelection();
  };

  // Transition handlers
  const handleTransitionToStatus = (status: QualityControlStatus) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to transition');
      return;
    }

    // For single item selection, get the item details and set default quantities
    if (selectedItems.length === 1) {
      const item = quarantineInventory.find(inv => inv.allocation_id === selectedItems[0]);
      if (item) {
        setQuarantineTransition({
          showModal: true,
          transitionStatus: status,
          reason: '',
          notes: '',
          selectedItem: item,
          quantityToMove: item.inventory_quantity,
          packageQuantityToMove: item.package_quantity,
          weightToMove: item.weight_kg,
          volumeToMove: item.volume_m3 || 0,
        });
        return;
      }
    }

    // For bulk selection, no quantity fields
    setQuarantineTransition({
      showModal: true,
      transitionStatus: status,
      reason: '',
      notes: '',
      selectedItem: null,
      quantityToMove: 0,
      packageQuantityToMove: 0,
      weightToMove: 0,
      volumeToMove: 0,
    });
  };

  const handleCloseModal = () => {
    setQuarantineTransition({
      showModal: false,
      transitionStatus: null,
      reason: '',
      notes: '',
      selectedItem: null,
      quantityToMove: 0,
      packageQuantityToMove: 0,
      weightToMove: 0,
      volumeToMove: 0,
    });
  };

  const handleReasonChange = (newReason: string) => {
    setQuarantineTransition({ reason: newReason });
  };

  const handleNotesChange = (newNotes: string) => {
    setQuarantineTransition({ notes: newNotes });
  };

  const handleQuantityToMoveChange = (quantity: number) => {
    setQuarantineTransition({ quantityToMove: quantity });
  };

  const handlePackageQuantityToMoveChange = (packageQuantity: number) => {
    setQuarantineTransition({ packageQuantityToMove: packageQuantity });
  };

  const handleWeightToMoveChange = (weight: number) => {
    setQuarantineTransition({ weightToMove: weight });
  };

  const handleVolumeToMoveChange = (volume: number) => {
    setQuarantineTransition({ volumeToMove: volume });
  };

  const handleConfirmTransition = async () => {
    if (!transitionStatus || selectedItems.length === 0 || !reason.trim()) {
      return;
    }

    // For single item transition, validate quantities
    if (selectedItems.length === 1 && selectedItem) {
      if (quantityToMove <= 0 || quantityToMove > selectedItem.inventory_quantity) {
        toast.error('Invalid quantity to move');
        return;
      }
      if (packageQuantityToMove <= 0 || packageQuantityToMove > selectedItem.package_quantity) {
        toast.error('Invalid package quantity to move');
        return;
      }
      if (weightToMove <= 0 || weightToMove > selectedItem.weight_kg) {
        toast.error('Invalid weight to move');
        return;
      }
      if (volumeToMove < 0 || (selectedItem.volume_m3 && volumeToMove > selectedItem.volume_m3)) {
        toast.error('Invalid volume to move');
        return;
      }
    }

    try {
      startLoader('inventoryLogs/quality-transition');
      
      // Process each selected item
      for (const allocationId of selectedItems) {
        const item = quarantineInventory.find(inv => inv.allocation_id === allocationId);
        if (!item) {
          console.warn(`Item with allocation_id ${allocationId} not found`);
          continue;
        }

        // Use specific quantities for single item, full quantities for bulk
        const quantityForTransition = selectedItems.length === 1 && selectedItem 
          ? quantityToMove 
          : item.inventory_quantity;
        
        const packageQuantityForTransition = selectedItems.length === 1 && selectedItem
          ? packageQuantityToMove
          : item.package_quantity;
          
        const weightForTransition = selectedItems.length === 1 && selectedItem
          ? weightToMove
          : item.weight_kg;
          
        const volumeForTransition = selectedItems.length === 1 && selectedItem
          ? volumeToMove
          : (item.volume_m3 || 0);

        await InventoryLogService.transitionQualityStatus({
          allocation_id: allocationId,
          to_status: transitionStatus,
          quantity_to_move: quantityForTransition,
          package_quantity_to_move: packageQuantityForTransition,
          weight_to_move: weightForTransition,
          volume_to_move: volumeForTransition,
          reason: reason.trim(),
          notes: notes.trim() || undefined,
        });
      }

      toast.success(`Successfully transitioned ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} to ${transitionStatus}`);
      
      // Reset state and refresh data
      handleCloseModal();
      resetQuarantineSelection();
      await fetchQuarantineInventory();
      
    } catch (error) {
      console.error('Error transitioning quality status:', error);
      toast.error('Failed to transition quality status');
    } finally {
      stopLoader('inventoryLogs/quality-transition');
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchQuarantineInventory();
    fetchWarehouses();
  }, []);

  // Refresh data when warehouse filter changes
  useEffect(() => {
    if (warehouses.length > 0) { // Only fetch after warehouses are loaded
      fetchQuarantineInventory();
    }
  }, [selectedWarehouse]);

  return {
    // Data
    inventory: quarantineInventory,
    filteredInventory,
    warehouses,
    
    // Loading states
    isLoading,
    isTransitioning,
    
    // Filter state
    filters: {
      selectedWarehouse,
      searchTerm,
      selectedStatus,
    },
    
    // Selection state
    selection: {
      selectedItems,
      isAllSelected,
      hasSelection: selectedItems.length > 0,
      hasItems: filteredInventory.length > 0,
    },
    
    // Transition state
    transition: {
      showModal,
      transitionStatus,
      reason,
      notes,
      quantityToMove,
      packageQuantityToMove,
      weightToMove,
      volumeToMove,
      selectedItem,
    },
    
    // Handlers
    handlers: {
      // Filters
      onWarehouseChange: handleWarehouseChange,
      onSearchChange: handleSearchChange,
      
      // Selection
      onToggleItemSelection: handleToggleItemSelection,
      onToggleAllSelection: handleToggleAllSelection,
      onClearSelection: handleClearSelection,
      
      // Transitions
      onTransitionToStatus: handleTransitionToStatus,
      onCloseModal: handleCloseModal,
      onReasonChange: handleReasonChange,
      onNotesChange: handleNotesChange,
      onQuantityToMoveChange: handleQuantityToMoveChange,
      onPackageQuantityToMoveChange: handlePackageQuantityToMoveChange,
      onWeightToMoveChange: handleWeightToMoveChange,
      onVolumeToMoveChange: handleVolumeToMoveChange,
      onConfirmTransition: handleConfirmTransition,
      
      // Data refresh
      onRefresh: fetchQuarantineInventory,
      onRefreshByStatus: fetchInventoryByStatus, // New flexible refresh function
    },
  };
}; 
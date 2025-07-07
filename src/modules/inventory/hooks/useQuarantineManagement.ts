import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import inventoryLogStore, { QualityControlStatus } from '../store';
import { InventoryLogService } from '../api/inventory.service';
import { Cell } from '../screens/AllocateOrder/components/CellGrid';

export const useQuarantineManagement = () => {
  // ✅ NEW: Track last fetch to prevent unnecessary calls
  const lastFetchRef = useRef<{ warehouseId: string | null; status: QualityControlStatus | null }>({ 
    warehouseId: null, 
    status: null 
  });

  // Store state
  const quarantineInventory = inventoryLogStore.use.quarantineInventory();
  const warehouses = inventoryLogStore.use.warehouses();
  const isLoading = inventoryLogStore.use.loaders()['inventoryLogs/fetch-quarantine-inventory'];
  const isTransitioning = inventoryLogStore.use.loaders()['inventoryLogs/quality-transition'];
  const isFetchingCells = inventoryLogStore.use.loaders()['inventoryLogs/fetch-cells-by-quality-status'];
  
  // ✅ NEW: Quality control cells
  const qualityControlCells = inventoryLogStore.use.qualityControlCells();
  
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

  // ✅ NEW: Cell selection state (local state for modal)
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  
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
    setQualityControlCells,
  } = inventoryLogStore.getState();

  // ✅ FIXED: Stable fetch functions using useCallback
  const fetchInventoryByStatus = useCallback(async (qualityStatus: QualityControlStatus) => {
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
  }, [selectedWarehouse?.value]); // ✅ Only depend on the value, not the whole object

  const fetchQuarantineInventory = useCallback(async (qualityStatus: QualityControlStatus = QualityControlStatus.CUARENTENA) => {
    try {
      startLoader('inventoryLogs/fetch-quarantine-inventory');
      
      // Get current warehouse value at call time to avoid stale closures
      const currentWarehouse = inventoryLogStore.getState().quarantineFilters.selectedWarehouse;
      
      // Build filters object
      const filters: { warehouse_id?: string } = {};
      if (currentWarehouse?.value) {
        filters.warehouse_id = currentWarehouse.value;
      }

      const response = await InventoryLogService.fetchInventoryByQualityStatus(qualityStatus, filters);
      setQuarantineInventory(response);
    } catch (error) {
      console.error('Error fetching inventory by quality status:', error);
      toast.error(`Failed to fetch ${qualityStatus.toLowerCase()} inventory`);
    } finally {
      stopLoader('inventoryLogs/fetch-quarantine-inventory');
    }
  }, []); // ✅ No dependencies - get current state at call time

  const fetchWarehouses = useCallback(async () => {
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
  }, []); // ✅ No dependencies needed

  const fetchQualityControlCells = useCallback(async (qualityStatus: QualityControlStatus, warehouseId: string, entryOrderId?: string) => {
    try {
      startLoader('inventoryLogs/fetch-cells-by-quality-status');
      const response = await InventoryLogService.fetchCellsByQualityStatus(qualityStatus, warehouseId, entryOrderId);
      setQualityControlCells(qualityStatus, response);
      return response;
    } catch (error) {
      console.error('Error fetching quality control cells:', error);
      toast.error(`Failed to fetch cells for ${qualityStatus.toLowerCase()}`);
      return [];
    } finally {
      stopLoader('inventoryLogs/fetch-cells-by-quality-status');
    }
  }, []); // ✅ No dependencies needed

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

  // ✅ FIXED: Stable handler functions using useCallback
  const handleWarehouseChange = useCallback((warehouse: { value: string; label: string } | null) => {
    setQuarantineFilters({ selectedWarehouse: warehouse });
    resetQuarantineSelection();
    // ✅ FIXED: Don't call fetchQuarantineInventory here - let the useEffect handle it
    // This prevents duplicate API calls when warehouse changes
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setQuarantineFilters({ searchTerm: term });
    resetQuarantineSelection();
  }, []);

  const handleToggleItemSelection = useCallback((itemId: string) => {
    toggleQuarantineItemSelection(itemId);
  }, []);

  const handleToggleAllSelection = useCallback(() => {
    toggleAllQuarantineSelection();
  }, []);

  const handleClearSelection = useCallback(() => {
    resetQuarantineSelection();
  }, []);

  const handleTransitionToStatus = useCallback(async (status: QualityControlStatus) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to transition');
      return;
    }

    // Check if this is quarantine to approved flow (special case - keeps same cell)
    const isQuarantineToApproved = selectedItems.length === 1 && 
      quarantineInventory.find(inv => inv.allocation_id === selectedItems[0])?.quality_status === QualityControlStatus.CUARENTENA &&
      status === QualityControlStatus.APROBADO;
    
    // Check if transition requires cell selection
    const requiresCellSelection = [
      QualityControlStatus.DEVOLUCIONES,    // V row - Returns
      QualityControlStatus.CONTRAMUESTRAS,  // T row - Samples  
      QualityControlStatus.RECHAZADOS       // R row - Rejected
    ].includes(status) && !isQuarantineToApproved;

    // Check if transition requires special purpose cells (V, T, R rows)
    const requiresSpecialCells = [
      QualityControlStatus.DEVOLUCIONES,    // V row - Returns
      QualityControlStatus.CONTRAMUESTRAS,  // T row - Samples  
      QualityControlStatus.RECHAZADOS       // R row - Rejected
    ].includes(status);

    // ✅ Clear previous cell selection when opening modal
    setSelectedCellId(null);

    // If special cells are required, we'll fetch them when the modal opens
    // This is now handled in the modal's useEffect

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
        
        // Show info about cell requirements
        if (isQuarantineToApproved) {
          toast.success(`Item will be approved in its current location. No cell change required.`);
        } else if (requiresCellSelection) {
          if (requiresSpecialCells) {
            toast.info(`This transition requires moving to ${status.toLowerCase()} area. Cells will be loaded automatically.`);
          } else {
            toast.info(`Please select a destination cell for this transition. Cells will be loaded automatically.`);
          }
        }
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

    if (requiresCellSelection) {
      if (requiresSpecialCells) {
        toast.info(`Bulk transition to ${status.toLowerCase()} will require cell reassignment. Cells will be loaded automatically.`);
      } else {
        toast.info(`Please select destination cells for this transition. Cells will be loaded automatically.`);
      }
    }
  }, [selectedItems, quarantineInventory]);

  const handleCloseModal = useCallback(() => {
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
    // ✅ Clear cell selection when closing modal
    setSelectedCellId(null);
  }, []);

  const handleReasonChange = useCallback((newReason: string) => {
    setQuarantineTransition({ reason: newReason });
  }, []);

  const handleNotesChange = useCallback((newNotes: string) => {
    setQuarantineTransition({ notes: newNotes });
  }, []);

  const handleQuantityToMoveChange = useCallback((quantity: number) => {
    setQuarantineTransition({ quantityToMove: quantity });
  }, []);

  const handlePackageQuantityToMoveChange = useCallback((packageQuantity: number) => {
    setQuarantineTransition({ packageQuantityToMove: packageQuantity });
  }, []);

  const handleWeightToMoveChange = useCallback((weight: number) => {
    setQuarantineTransition({ weightToMove: weight });
  }, []);

  const handleVolumeToMoveChange = useCallback((volume: number) => {
    setQuarantineTransition({ volumeToMove: volume });
  }, []);

  // ✅ NEW: Cell selection handlers
  const handleCellSelect = useCallback((cell: Cell | null) => {
    setSelectedCellId(cell ? cell.cell_id : null);
  }, []);

  const handleFetchCellsForStatus = useCallback(async (status: QualityControlStatus) => {
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse first');
      return;
    }

    try {
      // Get entry_order_id from the selected item or any available quarantine item
      // Note: entry_order_id might not be in the interface, so we need to check for it carefully
      let entryOrderId = (selectedItem?.entry_order_product?.entry_order as any)?.entry_order_id || 
                        (selectedItems.length > 0 ? 
                          (quarantineInventory.find(item => item.allocation_id === selectedItems[0])?.entry_order_product?.entry_order as any)?.entry_order_id 
                          : undefined);
      
      // If still no entry_order_id, try alternative approaches
      if (!entryOrderId && quarantineInventory.length > 0) {
        const firstItem = quarantineInventory[0];
        
        // Try to find entry_order_id in the nested structure
        entryOrderId = (firstItem.entry_order_product?.entry_order as any)?.entry_order_id || 
                      (firstItem as any)?.entry_order_product?.entry_order_id ||
                      (firstItem as any)?.entry_order_id;
                      
        // If still no entry_order_id, try using entry_order_no as fallback
        if (!entryOrderId) {
          const entryOrderNo = firstItem.entry_order_product?.entry_order?.entry_order_no;
          if (entryOrderNo) {
            console.warn('🔄 No entry_order_id found, using entry_order_no as fallback:', entryOrderNo);
            entryOrderId = entryOrderNo; // Use entry_order_no as fallback
          }
        }
      }
      
      // If still no entry_order_id, pass empty string to satisfy API requirement
      if (!entryOrderId) {
        console.warn('⚠️ No entry_order_id or entry_order_no found, using empty string');
        entryOrderId = '';
      }
      
      console.log('🔄 Fetching cells for status with entry_order_id:', { 
        status, 
        warehouseId: selectedWarehouse.value, 
        entryOrderId,
        selectedItem: selectedItem?.allocation_id,
        selectedItems,
        quarantineInventoryCount: quarantineInventory.length,
        firstItemData: quarantineInventory.length > 0 ? {
          allocation_id: quarantineInventory[0].allocation_id,
          entry_order_no: quarantineInventory[0].entry_order_product?.entry_order?.entry_order_no,
          full_entry_order: quarantineInventory[0].entry_order_product?.entry_order
        } : null
      });
      
      const cells = await fetchQualityControlCells(status, selectedWarehouse.value, entryOrderId);
      console.log(`Fetched ${cells.length} cells for ${status}:`, cells);
    } catch (error) {
      console.error('Error fetching cells for status:', error);
      toast.error(`Failed to load cells for ${status.toLowerCase()}`);
    }
  }, [selectedWarehouse, selectedItem, selectedItems, quarantineInventory, fetchQualityControlCells]);

  const handleConfirmTransition = useCallback(async () => {
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

    // Check if this is quarantine to approved flow (special case - keeps same cell)
    const isQuarantineToApproved = selectedItems.length === 1 && selectedItem &&
      selectedItem.quality_status === QualityControlStatus.CUARENTENA &&
      transitionStatus === QualityControlStatus.APROBADO;
    
    // ✅ Enhanced: Check for cell selection requirement
    const requiresCellSelection = [
      QualityControlStatus.DEVOLUCIONES,
      QualityControlStatus.CONTRAMUESTRAS,
      QualityControlStatus.RECHAZADOS
    ].includes(transitionStatus) && !isQuarantineToApproved;

    if (requiresCellSelection && !selectedCellId) {
      toast.error('Please select a destination cell');
      return;
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

        // ✅ ENHANCED: Use selected cell for special transitions
        const newCellId = requiresCellSelection ? selectedCellId || undefined : undefined;

        await InventoryLogService.transitionQualityStatus({
          allocation_id: allocationId,
          to_status: transitionStatus,
          quantity_to_move: quantityForTransition,
          package_quantity_to_move: packageQuantityForTransition,
          weight_to_move: weightForTransition,
          volume_to_move: volumeForTransition,
          reason: reason.trim(),
          notes: notes.trim() || undefined,
          new_cell_id: newCellId, // ✅ Include selected cell for special transitions
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
  }, [
    transitionStatus, selectedItems, reason, notes, selectedItem,
    quantityToMove, packageQuantityToMove, weightToMove, volumeToMove,
    quarantineInventory, selectedCellId, handleCloseModal, fetchQuarantineInventory
  ]);

  // ✅ FIXED: Initialize data only once on mount
  useEffect(() => {
    console.log('🔄 QuarantineManagement: Initializing data...');
    const initializeData = async () => {
      // Pre-select CUARENTENA status
      setQuarantineFilters({ selectedStatus: QualityControlStatus.CUARENTENA });
      
      // Fetch warehouses first
      await fetchWarehouses();
      
      // Fetch initial inventory with CUARENTENA status
      await fetchQuarantineInventory(QualityControlStatus.CUARENTENA);
    };
    
    initializeData();
  }, []); // ✅ Empty dependency array - runs only once

  // ✅ FIXED: Auto-select first warehouse with stable reference check
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      console.log('🏪 QuarantineManagement: Auto-selecting first warehouse...');
      // Use the first warehouse and create stable reference
      const firstWarehouse = warehouses[0];
      const warehouseOption = {
        value: firstWarehouse.warehouse_id,
        label: firstWarehouse.name
      };
      setQuarantineFilters({ selectedWarehouse: warehouseOption });
    }
  }, [warehouses.length, selectedWarehouse]); // ✅ Only depend on length and selectedWarehouse

  // ✅ FIXED: Refresh data when warehouse/status changes with deduplication
  useEffect(() => {
    const warehouseId = selectedWarehouse?.value || null;
    const status = selectedStatus || null;
    
    // Only fetch if we have all required data and it's different from last fetch
    if (
      warehouses.length > 0 && 
      warehouseId && 
      status &&
      (lastFetchRef.current.warehouseId !== warehouseId || lastFetchRef.current.status !== status)
    ) {
      console.log('🔄 QuarantineManagement: Refreshing data for warehouse/status change...', {
        warehouseId,
        status,
        previous: lastFetchRef.current
      });
      
      // Update the ref BEFORE making the call to prevent race conditions
      lastFetchRef.current = { warehouseId, status };
      
      // Use the stable fetch function without dependencies
      fetchQuarantineInventory(status);
    }
  }, [selectedWarehouse?.value, selectedStatus, warehouses.length]); // ✅ Removed fetchQuarantineInventory dependency

  return {
    // Data
    inventory: quarantineInventory,
    filteredInventory,
    warehouses,
    
    // Loading states
    isLoading,
    isTransitioning,
    isFetchingCells,
    
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
      // ✅ NEW: Cell selection for modal
      availableCells: (() => {
        const cells = transitionStatus ? qualityControlCells[transitionStatus] || [] : [];
        
        // ✅ FIXED: Ensure cells is always an array
        const safeCells = Array.isArray(cells) ? cells : [];
        
        console.log("🎯 Hook: Available cells for transition:", {
          transitionStatus,
          cellsCount: safeCells.length,
          cellsRaw: cells,
          cellsType: typeof cells,
          isArray: Array.isArray(cells),
          cells: safeCells.length > 0 ? safeCells.slice(0, 3) : [],
          allQualityControlCells: Object.keys(qualityControlCells).reduce((acc, key) => {
            const keyCells = qualityControlCells[key as QualityControlStatus];
            acc[key] = Array.isArray(keyCells) ? keyCells.length : 0;
            return acc;
          }, {} as Record<string, number>)
        });
        return safeCells;
      })(),
      selectedCellId,
    },
    
    // ✅ FIXED: Memoize handlers to prevent infinite re-renders
    handlers: useMemo(() => ({
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
      
      // ✅ NEW: Quality control cell management
      onFetchQualityControlCells: fetchQualityControlCells,
      
      // ✅ NEW: Cell selection for modal
      onCellSelect: handleCellSelect,
      onFetchCellsForStatus: handleFetchCellsForStatus,
    }), [
      handleWarehouseChange,
      handleSearchChange,
      handleToggleItemSelection,
      handleToggleAllSelection,
      handleClearSelection,
      handleTransitionToStatus,
      handleCloseModal,
      handleReasonChange,
      handleNotesChange,
      handleQuantityToMoveChange,
      handlePackageQuantityToMoveChange,
      handleWeightToMoveChange,
      handleVolumeToMoveChange,
      handleConfirmTransition,
      fetchQuarantineInventory,
      fetchInventoryByStatus,
      fetchQualityControlCells,
      handleCellSelect,
      handleFetchCellsForStatus,
    ]), // ✅ All handler functions are already memoized with useCallback
  };
}; 
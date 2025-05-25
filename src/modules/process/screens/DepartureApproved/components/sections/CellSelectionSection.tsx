import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components";
import Spinner from "@/components/Spinner";
import { ProcessesStore } from "@/globalStore";
import { ProcessService } from "@/modules/process/api/process.service";
import { DepartureFormData } from "@/modules/process/types";

interface Props {
  formData: DepartureFormData;
}

const CellSelectionSection: React.FC<Props> = ({ formData }) => {
  const { t } = useTranslation(['process']);
  const { 
    productsWithInventory,
    availableCells,
    selectedCell,
    cellValidation,
    inventoryError,
    loaders,
    clearCellState
  } = ProcessesStore();

  const isLoadingCells = loaders["processes/load-cells"];
  const isValidatingCell = loaders["processes/validate-cell"];

  // Load products with inventory when warehouse is selected
  useEffect(() => {
    if (formData.warehouse?.value) {
      ProcessService.loadProductsWithInventory(formData.warehouse.value);
    } else {
      clearCellState();
    }
  }, [formData.warehouse?.value, clearCellState]);

  // Load available cells when product is selected
  useEffect(() => {
    if (formData.product?.value && formData.warehouse?.value) {
      ProcessService.loadAvailableCells(formData.product.value, formData.warehouse.value);
    } else {
      ProcessesStore.setState({
        availableCells: [],
        selectedCell: null,
        cellValidation: null,
      });
    }
  }, [formData.product?.value, formData.warehouse?.value]);

  // Validate cell when quantities change or cell is selected
  useEffect(() => {
    if (selectedCell && formData.total_qty && formData.total_weight) {
      ProcessService.validateCellSelection({
        inventory_id: selectedCell.inventory_id,
        requested_qty: parseInt(formData.total_qty),
        requested_weight: parseFloat(formData.total_weight),
      });
    } else {
      ProcessesStore.setState({ cellValidation: null });
    }
  }, [selectedCell, formData.total_qty, formData.total_weight]);

  // Reset product selection if not available in selected warehouse
  useEffect(() => {
    if (formData.product?.value && productsWithInventory.length > 0) {
      const isProductAvailable = productsWithInventory.some(
        (p) => p.product_id.toString() === formData.product.value
      );
      if (!isProductAvailable) {
        console.log("Product not available in selected warehouse");
      }
    }
  }, [productsWithInventory, formData.product?.value]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCellSelect = (cell: any) => {
    ProcessesStore.setState({ selectedCell: cell });
  };

  return (
    <div className="space-y-4">
      {/* Inventory Error */}
      {inventoryError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <Text additionalClass="text-red-800 text-sm">{inventoryError}</Text>
          </div>
        </div>
      )}

      {/* Cell Selection */}
      {formData.product?.value && availableCells.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Text weight="font-semibold" additionalClass="text-gray-800">
              {t('process:select_cell')} ({availableCells.length} {t('process:available_cells')})
            </Text>
          </div>
          
          {/* Loading */}
          {isLoadingCells && (
            <div className="flex items-center justify-center py-4 bg-gray-50 rounded">
              <Spinner />
              <Text additionalClass="ml-2 text-sm text-gray-600">{t('process:loading_cells')}</Text>
            </div>
          )}

          {/* Compact Cell Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {availableCells.map((cell) => (
              <div
                key={cell.inventory_id}
                className={`
                  relative border rounded-lg p-2 cursor-pointer transition-all hover:shadow-sm
                  ${selectedCell?.inventory_id === cell.inventory_id
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
                onClick={() => handleCellSelect(cell)}
              >
                {/* Selection Indicator */}
                {selectedCell?.inventory_id === cell.inventory_id && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}

                {/* Cell Content */}
                <div className="text-xs space-y-1">
                  <Text weight="font-bold" additionalClass="text-gray-800 text-sm">
                    {cell.cell_reference}
                  </Text>
                  
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('process:packages_short')}:</span>
                      <span className="font-medium">{cell.available_packaging}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('process:weight_short')}:</span>
                      <span className="font-medium">{cell.available_weight}kg</span>
                    </div>
                    {cell.available_volume && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('process:volume_short')}:</span>
                        <span className="font-medium">{cell.available_volume}m³</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-1 border-t border-gray-100 space-y-0.5">
                    <div className="text-blue-600 font-medium truncate" title={cell.entry_order_no}>
                      #{cell.entry_order_no?.slice(-6)}
                    </div>
                    {cell.expiration_date && (
                      <div className="text-orange-600 text-xs">
                        {t('process:exp_short')}: {new Date(cell.expiration_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Validation Display */}
      {cellValidation && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <Text weight="font-semibold" additionalClass="text-gray-800">
                {t('process:cell_selected', { cell: cellValidation.cell_reference })}
              </Text>
            </div>
            {cellValidation.will_be_empty && (
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                {t('process:will_empty')}
              </span>
            )}
          </div>
          
          {/* Single Row Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center p-2 bg-white rounded border">
              <Text additionalClass="text-gray-500 text-xs">{t('process:order')}</Text>
              <Text weight="font-medium" additionalClass="text-gray-800 truncate" title={cellValidation.entry_order_no}>
                #{cellValidation.entry_order_no?.slice(-8)}
              </Text>
            </div>
            
            <div className="text-center p-2 bg-white rounded border">
              <Text additionalClass="text-gray-500 text-xs">{t('process:departing')}</Text>
              <Text weight="font-bold" additionalClass="text-red-600">
                {cellValidation.requested_qty}{t('process:pkg_unit')}
              </Text>
              <Text additionalClass="text-red-500 text-xs">
                {cellValidation.requested_weight}kg
              </Text>
            </div>
            
            <div className="text-center p-2 bg-white rounded border">
              <Text additionalClass="text-gray-500 text-xs">{t('process:remaining')}</Text>
              <Text weight="font-bold" additionalClass="text-green-600">
                {cellValidation.remaining_qty}{t('process:pkg_unit')}
              </Text>
              <Text additionalClass="text-green-500 text-xs">
                {cellValidation.remaining_weight}kg
              </Text>
            </div>

            <div className="text-center p-2 bg-white rounded border">
              <Text additionalClass="text-gray-500 text-xs">{t('process:status')}</Text>
              <div className="flex items-center justify-center">
                <span className="text-green-600 font-medium text-sm">{t('process:ready')}</span>
                {cellValidation.will_be_empty && (
                  <span className="ml-1 text-amber-600">⚠️</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Loading */}
      {isValidatingCell && (
        <div className="flex items-center justify-center py-3 bg-blue-50 rounded border border-blue-200">
          <Spinner />
          <Text additionalClass="ml-2 text-sm text-blue-700">{t('process:validating_cell')}</Text>
        </div>
      )}
    </div>
  );
};

export default CellSelectionSection;
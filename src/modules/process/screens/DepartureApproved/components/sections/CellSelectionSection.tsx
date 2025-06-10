import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components";
import Spinner from "@/components/Spinner";
import { ProcessesStore } from "@/globalStore";
import { DepartureFormData } from "@/modules/process/types";

interface Props {
  formData: DepartureFormData;
}

const CellSelectionSection: React.FC<Props> = ({ formData }) => {
  const { t } = useTranslation(['process']);
  const { 
    availableCells,
    selectedCell,
    cellValidation,
    inventoryError,
    loaders,
    clearCellState
  } = ProcessesStore();

  const isLoadingCells = loaders["processes/load-cells"];
  const isValidatingCell = loaders["processes/validate-cell"];

  // Clear cell state when warehouse changes
  useEffect(() => {
    if (!formData.warehouse?.value) {
      clearCellState();
    }
  }, [formData.warehouse?.value, clearCellState]);

  // Clear cell selection when product changes
  useEffect(() => {
    if (!formData.product?.value) {
      ProcessesStore.setState({
        availableCells: [],
        selectedCell: null,
        cellValidation: null,
      });
    }
  }, [formData.product?.value]);

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
            <span className="text-red-600 mr-2">!</span>
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

          {/* Simplified Cell Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {availableCells.map((cell) => (
              <div
                key={cell.id}
                className={`
                  relative border rounded-lg p-2 cursor-pointer transition-all hover:shadow-sm
                  ${selectedCell?.id === cell.id
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
                onClick={() => handleCellSelect(cell)}
              >
                {/* Selection Indicator */}
                {selectedCell?.id === cell.id && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}

                {/* Cell Content */}
                <div className="text-xs space-y-1">
                  <Text weight="font-bold" additionalClass="text-gray-800 text-sm">
                    {cell.row}.{String(cell.bay).padStart(2, '0')}.{String(cell.position).padStart(2, '0')}
                  </Text>
                  
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium text-xs">{cell.status}</span>
                    </div>
                    {cell.capacity && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="font-medium text-xs">{cell.capacity}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simplified Validation Display */}
      {cellValidation && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <Text weight="font-semibold" additionalClass="text-gray-800">
                {t('process:cell_selected', { cell: selectedCell?.row + '.' + selectedCell?.bay + '.' + selectedCell?.position })}
              </Text>
            </div>
          </div>
          
          <div className="text-sm">
            <Text additionalClass="text-gray-600">{cellValidation.message}</Text>
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

      {/* No cells available message */}
      {formData.product?.value && !isLoadingCells && availableCells.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Text additionalClass="text-gray-500">{t('process:no_approved_inventory')}</Text>
        </div>
      )}
    </div>
  );
};

export default CellSelectionSection;
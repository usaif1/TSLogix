import React from 'react';
import { Button } from '@/components';
import { QualityControlStatus } from '../../../store';

interface QualityControlBulkActionsProps {
  selectedItems: string[];
  isAllSelected: boolean;
  hasItems: boolean;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onTransitionToStatus: (status: QualityControlStatus) => void;
}

const QualityControlBulkActions: React.FC<QualityControlBulkActionsProps> = ({
  selectedItems,
  isAllSelected,
  hasItems,
  onToggleAll,
  onClearSelection,
  onTransitionToStatus,
}) => {
  const hasSelection = selectedItems.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Select All/None Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={isAllSelected ? "action" : "cancel"}
              onClick={onToggleAll}
              disabled={!hasItems}
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </Button>
            
            {hasSelection && (
              <Button
                variant="cancel"
                onClick={onClearSelection}
                additionalClass="text-gray-500 hover:text-gray-700"
              >
                Clear Selection
              </Button>
            )}
          </div>

          {/* Selection Counter */}
          {hasSelection && (
            <div className="text-sm text-gray-600">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {hasSelection && (
          <div className="flex items-center gap-2">
            {/* Quick Actions for Common Transitions */}
            <Button
              variant="action"
              onClick={() => onTransitionToStatus(QualityControlStatus.APROBADO)}
              additionalClass="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>

            <Button
              variant="cancel"
              onClick={() => onTransitionToStatus(QualityControlStatus.RECHAZADOS)}
              additionalClass="border-red-600 text-red-600 hover:bg-red-50"
            >
              Reject
            </Button>

            {/* Additional Actions */}
            <Button
              variant="cancel"
              onClick={() => onTransitionToStatus(QualityControlStatus.DEVOLUCIONES)}
              additionalClass="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Returns
            </Button>

            <Button
              variant="cancel"
              onClick={() => onTransitionToStatus(QualityControlStatus.CONTRAMUESTRAS)}
              additionalClass="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Samples
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityControlBulkActions; 
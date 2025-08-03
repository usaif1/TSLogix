/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Services and Store
import { WarehouseCellService, CellRoleChangeHistory } from "@/modules/warehouse/api/warehouse.service";
import useWarehouseCellStore from "@/modules/warehouse/store";

interface CellHistoryModalProps {
  cell: any;
  isOpen: boolean;
  onClose: () => void;
}

const CellHistoryModal: React.FC<CellHistoryModalProps> = ({
  cell,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation(['warehouse', 'common']);

  // Store state
  const loaders = useWarehouseCellStore.use.loaders();
  const isLoadingHistory = loaders['cells/fetch-history'];

  // Local state
  const [history, setHistory] = useState<CellRoleChangeHistory[]>([]);

  // Load history when modal opens
  useEffect(() => {
    if (isOpen && cell) {
      loadCellHistory();
    }
  }, [isOpen, cell]);

  const loadCellHistory = async () => {
    try {
      const historyData = await WarehouseCellService.getCellHistory(cell.id);
      setHistory(historyData);
    } catch (error: any) {
      console.error("Error loading cell history:", error);
      toast.error(error.message || t('failed_to_load_cell_history'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return t('none');
    
    const purposes = WarehouseCellService.getQualityPurposes();
    const purpose = purposes.find(p => p.value === role);
    return purpose ? purpose.labelEs : role;
  };

  const getRoleBadgeColor = (role: string | null) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    
    const colorMap: Record<string, string> = {
      'STANDARD': 'bg-blue-100 text-blue-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'SAMPLES': 'bg-yellow-100 text-yellow-800',
      'RETURNS': 'bg-orange-100 text-orange-800',
      'DAMAGED': 'bg-purple-100 text-purple-800',
      'EXPIRED': 'bg-gray-100 text-gray-800',
    };
    
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen || !cell) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Text size="2xl" weight="font-bold">
              {t('cell_role_change_history')}
            </Text>
            <Button
              variant="secondary"
              onClick={onClose}
              additionalClass="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          {/* Cell Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text size="lg" weight="font-semibold" additionalClass="mb-2">
              {t('cell_information')}
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Text weight="font-medium">{t('cell_code')}:</Text>
                <Text>{cell.cell_code || `${cell.row}-${cell.bay}-${cell.position}`}</Text>
              </div>
              <div>
                <Text weight="font-medium">{t('current_role')}:</Text>
                <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(cell.cell_role)}`}>
                  {getRoleLabel(cell.cell_role)}
                </span>
              </div>
              <div>
                <Text weight="font-medium">{t('warehouse')}:</Text>
                <Text>{cell.warehouse?.name || 'N/A'}</Text>
              </div>
              <div>
                <Text weight="font-medium">{t('status')}:</Text>
                <Text>{cell.status}</Text>
              </div>
            </div>
          </div>

          {/* History Content */}
          <div>
            <Text size="lg" weight="font-semibold" additionalClass="mb-4">
              {t('change_history')}
            </Text>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <LoaderSync />
                <Text additionalClass="ml-3">{t('common:loading')}</Text>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <Text additionalClass="text-gray-500">
                  {t('no_role_changes_found')}
                </Text>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((change, index) => (
                  <div
                    key={change.change_id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(change.old_role)}`}>
                            {getRoleLabel(change.old_role)}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(change.new_role)}`}>
                            {getRoleLabel(change.new_role)}
                          </span>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <Text size="sm" additionalClass="text-gray-500">
                        {formatDate(change.changed_at)}
                      </Text>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Text weight="font-medium" additionalClass="text-gray-700">
                          {t('changed_by')}:
                        </Text>
                        <Text>
                          {change.user.first_name} {change.user.last_name}
                          <span className="text-gray-500 ml-2">
                            ({change.user.role.name})
                          </span>
                        </Text>
                      </div>
                      <div>
                        <Text weight="font-medium" additionalClass="text-gray-700">
                          {t('user_id')}:
                        </Text>
                        <Text additionalClass="font-mono text-xs">
                          {change.user.id}
                        </Text>
                      </div>
                    </div>

                    {change.reason && (
                      <div className="mt-3">
                        <Text weight="font-medium" additionalClass="text-gray-700 mb-1">
                          {t('reason')}:
                        </Text>
                        <div className="bg-gray-50 rounded p-3">
                          <Text size="sm" additionalClass="text-gray-800">
                            {change.reason}
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-6 border-t mt-6">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              {t('common:close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellHistoryModal;
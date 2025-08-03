/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Select, { CSSObjectWithLabel, SingleValue } from "react-select";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Services and Store
import { WarehouseCellService, CellQualityPurpose } from "@/modules/warehouse/api/warehouse.service";
import useWarehouseCellStore from "@/modules/warehouse/store";

// Styling for react-select
const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

interface CellRoleChangeModalProps {
  cell: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface QualityPurposeOption {
  value: CellQualityPurpose;
  label: string;
  description: string;
}

const CellRoleChangeModal: React.FC<CellRoleChangeModalProps> = ({
  cell,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation(['warehouse', 'common']);

  // Store state
  const loaders = useWarehouseCellStore.use.loaders();
  const isChangingRole = loaders['cells/change-role'];

  // Form state
  const [selectedRole, setSelectedRole] = useState<QualityPurposeOption | null>(null);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get quality purposes options
  const qualityPurposes = WarehouseCellService.getQualityPurposes();

  const handleRoleChange = (selectedOption: SingleValue<QualityPurposeOption>) => {
    setSelectedRole(selectedOption);
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: "" }));
    }
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedRole) {
      newErrors.role = t('role_required');
    }

    if (!reason.trim()) {
      newErrors.reason = t('reason_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedRole) {
      return;
    }

    try {
      await WarehouseCellService.changeCellRole(cell.id, selectedRole.value, reason);
      
      toast.success(t('cell_role_changed_successfully'));
      onSuccess();
      onClose();
      
      // Reset form
      setSelectedRole(null);
      setReason("");
      setErrors({});
    } catch (error: any) {
      console.error("Error changing cell role:", error);
      toast.error(error.message || t('failed_to_change_cell_role'));
    }
  };

  const handleClose = () => {
    setSelectedRole(null);
    setReason("");
    setErrors({});
    onClose();
  };

  if (!isOpen || !cell) return null;

  // Check if user can change roles (this would typically come from auth context)
  const userRole = localStorage.getItem("role");
  const canChangeRole = userRole === "ADMIN";

  if (!canChangeRole) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <Text size="lg" weight="font-semibold" additionalClass="mb-4">
              {t('access_denied')}
            </Text>
            <Text additionalClass="mb-6 text-gray-600">
              {t('only_admin_can_change_cell_roles')}
            </Text>
            <Button
              variant="secondary"
              onClick={handleClose}
            >
              {t('common:close')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Text size="2xl" weight="font-bold">
              {t('change_cell_quality_purpose')}
            </Text>
            <Button
              variant="secondary"
              onClick={handleClose}
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
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Text weight="font-medium">{t('cell_code')}:</Text>
                <Text>{cell.cell_code || `${cell.row}-${cell.bay}-${cell.position}`}</Text>
              </div>
              <div>
                <Text weight="font-medium">{t('current_role')}:</Text>
                <Text>{cell.cell_role || 'STANDARD'}</Text>
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

            {/* Warning for cells with inventory */}
            {cell.currentUsage > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                <Text size="sm" additionalClass="text-yellow-800">
                  ⚠️ {t('warning_cell_has_inventory', { usage: cell.currentUsage, capacity: cell.capacity })}
                </Text>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Quality Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('new_quality_purpose')} *
              </label>
              <Select
                value={selectedRole}
                onChange={handleRoleChange}
                options={qualityPurposes}
                styles={reactSelectStyle}
                placeholder={t('select_quality_purpose')}
                formatOptionLabel={(option) => (
                  <div>
                    <div className="font-medium">{option.labelEs}</div>
                    <div className="text-sm text-gray-500">{option.descriptionEs}</div>
                  </div>
                )}
                className={errors.role ? 'border-red-500' : ''}
              />
              {errors.role && (
                <Text size="sm" additionalClass="text-red-500 mt-1">
                  {errors.role}
                </Text>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reason_for_change')} *
              </label>
              <textarea
                value={reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                className={`w-full h-24 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('enter_reason_for_change')}
                rows={3}
              />
              {errors.reason && (
                <Text size="sm" additionalClass="text-red-500 mt-1">
                  {errors.reason}
                </Text>
              )}
            </div>

            {/* Quality Purpose Descriptions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <Text size="sm" weight="font-semibold" additionalClass="mb-3">
                {t('quality_purpose_descriptions')}:
              </Text>
              <div className="space-y-2 text-sm">
                {qualityPurposes.map((purpose) => (
                  <div key={purpose.value} className="flex">
                    <span className="font-medium text-blue-800 w-32">{purpose.labelEs}:</span>
                    <span className="text-gray-700">{purpose.descriptionEs}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isChangingRole}
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isChangingRole}
                additionalClass="flex items-center"
              >
                {isChangingRole && <LoaderSync size="sm" additionalClass="mr-2" />}
                {t('change_role')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CellRoleChangeModal;
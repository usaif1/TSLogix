/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Services and Store
import { ClientService } from "@/modules/client/api/client.service";
import { ClientStore } from "@/modules/client/store";

interface ClientPasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ClientPasswordChangeModal: React.FC<ClientPasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation(['client', 'common']);

  // Store state
  const loaders = ClientStore.use.loaders();
  const isChangingPassword = loaders['clients/change-password'];

  // Form state
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = t('current_password_required');
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = t('new_password_required');
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('password_min_length');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('confirm_password_required');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_do_not_match');
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = t('new_password_must_be_different');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await ClientService.changePassword(formData.currentPassword, formData.newPassword);
      
      toast.success(t('password_changed_successfully'));
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || t('failed_to_change_password'));
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  // Check if user can change password (CLIENT role only)
  const userRole = localStorage.getItem("role");
  const canChangePassword = userRole === "CLIENT";

  if (!canChangePassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <Text size="lg" weight="font-semibold" additionalClass="mb-4">
              {t('access_denied')}
            </Text>
            <Text additionalClass="mb-6 text-gray-600">
              {t('only_clients_can_change_password')}
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
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Text size="2xl" weight="font-bold">
              {t('change_password')}
            </Text>
            <Button
              variant="secondary"
              onClick={handleClose}
              additionalClass="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('current_password')} *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`w-full h-10 border rounded-md px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('enter_current_password')}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPasswords.current ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.currentPassword && (
                <Text size="sm" additionalClass="text-red-500 mt-1">
                  {errors.currentPassword}
                </Text>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('new_password')} *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full h-10 border rounded-md px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('enter_new_password')}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPasswords.new ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.newPassword && (
                <Text size="sm" additionalClass="text-red-500 mt-1">
                  {errors.newPassword}
                </Text>
              )}
              <Text size="sm" additionalClass="text-gray-500 mt-1">
                {t('password_requirements')}
              </Text>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('confirm_new_password')} *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full h-10 border rounded-md px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('confirm_new_password')}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPasswords.confirm ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.confirmPassword && (
                <Text size="sm" additionalClass="text-red-500 mt-1">
                  {errors.confirmPassword}
                </Text>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-lg p-4">
              <Text size="sm" additionalClass="text-blue-800">
                <strong>{t('security_notice')}:</strong> {t('password_change_notice')}
              </Text>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isChangingPassword}
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isChangingPassword}
                additionalClass="flex items-center"
              >
                {isChangingPassword && <LoaderSync size="sm" additionalClass="mr-2" />}
                {t('change_password')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientPasswordChangeModal;
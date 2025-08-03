import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Components
import { Button, Text, LoaderSync } from "@/components";

// Services and Store
import { ProfileService } from "@/modules/profile/api/profile.service";
import { ProfileStore } from "@/modules/profile/store";
import { AuthStore } from "@/globalStore";

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation(['common', 'client']);
  const { authUser } = AuthStore();

  // Profile store state
  const {
    showPasswordModal,
    isChangingPassword,
    passwordForm,
    passwordErrors,
    passwordVisibility,
    setShowPasswordModal,
    updatePasswordForm,
    setPasswordErrors,
    togglePasswordVisibility,
    // resetPasswordForm, // Currently unused
  } = ProfileStore();

  // Get user data with fallbacks
  const getUserInfo = () => {
    if (authUser) {
      return {
        name: authUser.first_name && authUser.last_name 
          ? `${authUser.first_name} ${authUser.last_name}`
          : authUser.name || authUser.username || authUser.userId || authUser.user_id || t('user'),
        role: authUser.role?.name || authUser.role || t('user'),
        email: authUser.email || 'N/A',
        phone: authUser.phone || 'N/A',
        initials: getInitials(authUser.first_name, authUser.last_name, authUser.name, authUser.username, authUser.userId)
      };
    }

    // Fallback to localStorage
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    const name = localStorage.getItem("name");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const phone = localStorage.getItem("phone");
    const role = localStorage.getItem("role");

    return {
      name: firstName && lastName 
        ? `${firstName} ${lastName}`
        : name || username || t('user'),
      role: role || t('user'),
      email: email || 'N/A',
      phone: phone || 'N/A',
      initials: getInitials(firstName || undefined, lastName || undefined, name || undefined, username || undefined)
    };
  };

  const getInitials = (firstName?: string, lastName?: string, name?: string, username?: string, userId?: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    if (name) {
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      if (words.length === 1 && words[0].length >= 2) {
        return words[0].substring(0, 2).toUpperCase();
      }
      return words[0].charAt(0).toUpperCase();
    }
    
    if (username) {
      if (username.includes('_')) {
        const parts = username.split('_');
        if (parts.length >= 2) {
          return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }
      }
      if (username.length >= 2) {
        return username.substring(0, 2).toUpperCase();
      }
      return username.charAt(0).toUpperCase();
    }
    
    if (userId) {
      if (userId.length >= 2) {
        return userId.substring(0, 2).toUpperCase();
      }
      return userId.charAt(0).toUpperCase();
    }
    
    return "U";
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return t('administrator');
      case "CLIENT":
      case "USER":
        return t('client');
      case "WAREHOUSE_INCHARGE":
        return t('warehouse_manager');
      case "WAREHOUSE_ASSISTANT":
        return t('warehouse_assistant');
      case "PHARMACIST":
        return t('pharmacist');
      default:
        return role || t('user');
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "bg-red-500 text-white";
      case "CLIENT":
      case "USER":
        return "bg-blue-500 text-white";
      case "WAREHOUSE_INCHARGE":
        return "bg-green-500 text-white";
      case "WAREHOUSE_ASSISTANT":
        return "bg-yellow-500 text-white";
      case "PHARMACIST":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = t('client:password.current_password_required');
    }

    if (!passwordForm.newPassword.trim()) {
      newErrors.newPassword = t('client:password.new_password_required');
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = t('client:password.password_min_length');
    }

    if (!passwordForm.confirmPassword.trim()) {
      newErrors.confirmPassword = t('client:password.confirm_password_required');
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = t('client:password.passwords_do_not_match');
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = t('client:password.new_password_must_be_different');
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      await ProfileService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      toast.success(t('client:password.password_changed_successfully'));
      setShowPasswordModal(false);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || t('client:password.failed_to_change_password'));
    }
  };

  const userInfo = getUserInfo();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Text size="3xl" weight="font-bold" additionalClass="text-gray-900 mb-2">
            {t('user_profile')}
          </Text>
          <Text additionalClass="text-gray-600">
            {t('manage_your_account_settings_and_preferences')}
          </Text>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center space-x-6 mb-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-white">
                  {userInfo.initials}
                </span>
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <Text size="2xl" weight="font-semibold" additionalClass="text-gray-900 mb-1">
                  {userInfo.name}
                </Text>
                <div className="mb-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(userInfo.role)}`}>
                    {getRoleDisplayName(userInfo.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                  {t('email')}
                </Text>
                <Text additionalClass="text-gray-900">
                  {userInfo.email}
                </Text>
              </div>
              <div>
                <Text size="sm" weight="font-medium" additionalClass="text-gray-700 mb-1">
                  {t('phone')}
                </Text>
                <Text additionalClass="text-gray-900">
                  {userInfo.phone}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <Text size="xl" weight="font-semibold" additionalClass="text-gray-900 mb-4">
              {t('security_settings')}
            </Text>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Text weight="font-medium" additionalClass="text-gray-900 mb-1">
                  {t('password')}
                </Text>
                <Text size="sm" additionalClass="text-gray-600">
                  {t('change_your_account_password')}
                </Text>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowPasswordModal(true)}
              >
                {t('client:buttons.change_password')}
              </Button>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <Text size="2xl" weight="font-bold">
                    {t('client:password.change_password')}
                  </Text>
                  <Button
                    variant="secondary"
                    onClick={() => setShowPasswordModal(false)}
                    additionalClass="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('client:password.current_password')} *
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisibility.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => updatePasswordForm('currentPassword', e.target.value)}
                        className={`w-full h-10 border rounded-md px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('client:password.enter_current_password')}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        {passwordVisibility.current ? '👁️' : '🙈'}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <Text size="sm" additionalClass="text-red-500 mt-1">
                        {passwordErrors.currentPassword}
                      </Text>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('client:password.new_password')} *
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisibility.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => updatePasswordForm('newPassword', e.target.value)}
                        className={`w-full h-10 border rounded-md px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('client:password.enter_new_password')}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        {passwordVisibility.new ? '👁️' : '🙈'}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <Text size="sm" additionalClass="text-red-500 mt-1">
                        {passwordErrors.newPassword}
                      </Text>
                    )}
                    <Text size="sm" additionalClass="text-gray-500 mt-1">
                      {t('client:password.password_requirements')}
                    </Text>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('client:password.confirm_new_password')} *
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisibility.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => updatePasswordForm('confirmPassword', e.target.value)}
                        className={`w-full h-10 border rounded-md px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('client:password.confirm_new_password')}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        {passwordVisibility.confirm ? '👁️' : '🙈'}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <Text size="sm" additionalClass="text-red-500 mt-1">
                        {passwordErrors.confirmPassword}
                      </Text>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <Text size="sm" additionalClass="text-blue-800">
                      <strong>{t('client:password.security_notice')}:</strong> {t('client:password.password_change_notice')}
                    </Text>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowPasswordModal(false)}
                      disabled={isChangingPassword}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isChangingPassword}
                      additionalClass="flex items-center"
                    >
                      {isChangingPassword && <LoaderSync size="sm" additionalClass="mr-2" />}
                      {t('client:password.change_password')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
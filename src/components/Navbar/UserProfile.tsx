import React from "react";
import { UserCircle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components";
import { AuthStore } from "@/globalStore";

const UserProfile: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { authUser } = AuthStore();
  
  // Get user data with fallbacks
  const getUserInfo = () => {
    // Try to get from auth store first
    if (authUser) {
      return {
        name: authUser.first_name && authUser.last_name 
          ? `${authUser.first_name} ${authUser.last_name}`
          : authUser.name || authUser.userId || authUser.user_id || t('common:user'),
        role: authUser.role?.name || authUser.role || t('common:user'),
        initials: getInitials(authUser.first_name, authUser.last_name, authUser.name, authUser.userId)
      };
    }

    // Fallback to localStorage - try stored user object first
    try {
      const storedUser = localStorage.getItem("liu");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return {
          name: userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}`
            : userData.name || userData.userId || userData.user_id || t('common:user'),
          role: userData.role?.name || userData.role || localStorage.getItem("role") || t('common:user'),
          initials: getInitials(userData.first_name, userData.last_name, userData.name, userData.userId)
        };
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    // Fallback to individual localStorage items
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    const name = localStorage.getItem("name");
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    if (firstName || lastName || name || userId) {
      return {
        name: firstName && lastName 
          ? `${firstName} ${lastName}`
          : name || userId || t('common:user'),
        role: role || t('common:user'),
        initials: getInitials(firstName, lastName, name, userId)
      };
    }

    // Final fallback
    return {
      name: t('common:user'),
      role: role || t('common:user'),
      initials: "U"
    };
  };

  const getInitials = (firstName?: string, lastName?: string, name?: string, userId?: string): string => {
    // Try first name + last name
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    // Try to get first 2 words from name
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
    
    // Try userId
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
        return t('common:administrator');
      case "CLIENT":
      case "USER":
        return t('common:client');
      case "WAREHOUSE_INCHARGE":
        return t('common:warehouse_manager');
      case "WAREHOUSE_ASSISTANT":
        return t('common:warehouse_assistant');
      default:
        return role || t('common:user');
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
      default:
        return "bg-gray-500 text-white";
    }
  };

  const userInfo = getUserInfo();

  return (
    <div className="px-4 py-2">
      <div className="flex items-center space-x-2">
        {/* Avatar with Initials - smaller */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center border border-white border-opacity-30">
            <span className="text-xs font-semibold text-white">
              {userInfo.initials}
            </span>
          </div>
        </div>

        {/* User Info - more compact */}
        <div className="flex-1 min-w-0">
          {/* Username - smaller font */}
          <div className="text-xs font-medium text-white truncate" title={userInfo.name}>
            {userInfo.name}
          </div>
          
          {/* Role Badge - smaller and inline */}
          <div className="mt-0.5">
            <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${getRoleColor(userInfo.role)}`}>
              {getRoleDisplayName(userInfo.role)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 
import React from "react";
import { useTranslation } from "react-i18next";
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
          : authUser.name || authUser.username || authUser.userId || authUser.user_id || t('common:user'),
        role: authUser.role?.name || authUser.role || t('common:user'),
        initials: getInitials(authUser.first_name, authUser.last_name, authUser.name, authUser.username, authUser.userId)
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
            : userData.name || userData.username || userData.userId || userData.user_id || t('common:user'),
          role: userData.role?.name || userData.role || localStorage.getItem("role") || t('common:user'),
          initials: getInitials(userData.first_name, userData.last_name, userData.name, userData.username, userData.userId)
        };
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    // Fallback to individual localStorage items
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    const name = localStorage.getItem("name");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    if (firstName || lastName || name || username || userId) {
      return {
        name: firstName && lastName 
          ? `${firstName} ${lastName}`
          : name || username || userId || t('common:user'),
        role: role || t('common:user'),
        initials: getInitials(firstName || undefined, lastName || undefined, name || undefined, username || undefined, userId || undefined)
      };
    }

    // Final fallback
    return {
      name: t('common:user'),
      role: role || t('common:user'),
      initials: "U"
    };
  };

  const getInitials = (firstName?: string, lastName?: string, name?: string, username?: string, userId?: string): string => {
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
    
    // Try username
    if (username) {
      // Handle username patterns like "wh_incharge1" -> "WI"
      if (username.includes('_')) {
        const parts = username.split('_');
        if (parts.length >= 2) {
          return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }
      }
      // For regular usernames, take first 2 characters
      if (username.length >= 2) {
        return username.substring(0, 2).toUpperCase();
      }
      return username.charAt(0).toUpperCase();
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
    <div className="px-4 py-3 min-h-[4rem]">
      <div className="flex items-center space-x-3">
        {/* Avatar with Initials - consistent size */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
            <span className="text-sm font-semibold text-white">
              {userInfo.initials}
            </span>
          </div>
        </div>

        {/* User Info - constrained width */}
        <div className="flex-1 min-w-0">
          {/* Username - with truncation */}
          <div className="text-sm font-medium text-white truncate" title={userInfo.name}>
            {userInfo.name}
          </div>
          
          {/* Role Badge - consistent size */}
          <div className="mt-1">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded truncate max-w-full ${getRoleColor(userInfo.role)}`} title={getRoleDisplayName(userInfo.role)}>
              {getRoleDisplayName(userInfo.role)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 
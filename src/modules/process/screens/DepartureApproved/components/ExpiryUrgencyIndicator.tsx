import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components";
import { ExpiryUrgency } from "@/modules/process/types";

interface ExpiryUrgencyIndicatorProps {
  urgency: ExpiryUrgency;
  daysToExpiry: number;
  expirationDate: string;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

const ExpiryUrgencyIndicator: React.FC<ExpiryUrgencyIndicatorProps> = ({
  urgency,
  daysToExpiry,
  expirationDate,
  size = "md",
  showDetails = true,
}) => {
  const { t } = useTranslation(['process']);

  const getUrgencyConfig = () => {
    switch (urgency) {
      case "EXPIRED":
        return {
          color: "red",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-500",
          icon: "❌",
          label: t('process:expired'),
          message: `${t('process:expired')} ${Math.abs(daysToExpiry)} ${t('process:days_ago')}`,
          pulseClass: "animate-pulse",
        };
      case "URGENT":
        return {
          color: "red",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-400",
          icon: "⚠️",
          label: t('process:urgent'),
          message: `${t('process:expires_in')} ${daysToExpiry} ${t('process:days')} - ${t('process:urgent').toUpperCase()}`,
          pulseClass: "animate-pulse",
        };
      case "WARNING":
        return {
          color: "orange",
          bgColor: "bg-orange-100",
          textColor: "text-orange-800",
          borderColor: "border-orange-400",
          icon: "⚡",
          label: t('process:warning'),
          message: `${t('process:expires_in')} ${daysToExpiry} ${t('process:days')} - ${t('process:warning').toUpperCase()}`,
          pulseClass: "",
        };
      case "NORMAL":
        return {
          color: "green",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-400",
          icon: "✅",
          label: t('process:normal'),
          message: `${t('process:expires_in')} ${daysToExpiry} ${t('process:days')}`,
          pulseClass: "",
        };
      default:
        return {
          color: "gray",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-400",
          icon: "❓",
          label: t('process:unknown'),
          message: t('process:unknown_expiry_status'),
          pulseClass: "",
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "px-2 py-1",
          text: "text-xs",
          icon: "text-sm",
        };
      case "lg":
        return {
          container: "px-4 py-3",
          text: "text-base",
          icon: "text-xl",
        };
      default: // md
        return {
          container: "px-3 py-2",
          text: "text-sm",
          icon: "text-base",
        };
    }
  };

  const config = getUrgencyConfig();
  const sizeClasses = getSizeClasses();

  const formatExpirationDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <div className={`
      inline-flex items-center space-x-2 rounded-lg border-2 
      ${config.bgColor} ${config.textColor} ${config.borderColor} 
      ${sizeClasses.container} ${config.pulseClass}
    `}>
      {/* Urgency Icon */}
      <span className={`${sizeClasses.icon}`}>
        {config.icon}
      </span>

      {/* Urgency Information */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <Text 
            size={size === "sm" ? "xs" : size === "lg" ? "base" : "sm"} 
            weight="font-bold" 
            additionalClass={config.textColor}
          >
            {config.label}
          </Text>
          
          {size !== "sm" && (
            <Text 
              size="xs" 
              additionalClass={`${config.textColor} opacity-75`}
            >
              ({daysToExpiry >= 0 ? `${daysToExpiry}d` : `${Math.abs(daysToExpiry)}d ${t('process:days_ago')}`})
            </Text>
          )}
        </div>
        
        {showDetails && size !== "sm" && (
          <div className="mt-1">
            <Text 
              size="xs" 
              additionalClass={`${config.textColor} opacity-90`}
            >
              {config.message}
            </Text>
            <Text 
              size="xs" 
              additionalClass={`${config.textColor} opacity-75`}
            >
              {t('process:expires')}: {formatExpirationDate(expirationDate)}
            </Text>
          </div>
        )}
      </div>

      {/* Additional Visual Indicator for Critical Cases */}
      {(urgency === "EXPIRED" || urgency === "URGENT") && (
        <div className={`
          w-2 h-2 rounded-full 
          ${urgency === "EXPIRED" ? "bg-red-600" : "bg-red-500"}
          ${config.pulseClass}
        `} />
      )}
    </div>
  );
};

export default ExpiryUrgencyIndicator; 
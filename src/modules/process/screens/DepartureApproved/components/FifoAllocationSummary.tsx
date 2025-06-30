import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components";
import { ExpiryFifoAllocation } from "@/modules/process/types";
import ExpiryUrgencyIndicator from "./ExpiryUrgencyIndicator";

interface FifoAllocationSummaryProps {
  allocation: ExpiryFifoAllocation;
  showLocationDetails?: boolean;
  maxLocationsToShow?: number;
}

const FifoAllocationSummary: React.FC<FifoAllocationSummaryProps> = ({
  allocation,
  showLocationDetails = true,
  maxLocationsToShow = 5,
}) => {
  const { t } = useTranslation(['process']);



  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Handle both API response structures: 'suggestions' (new) and 'locations' (old)
  const getLocationsData = () => {
    if (allocation.suggestions) {
      return allocation.suggestions;
    }
    if (allocation.locations) {
      return allocation.locations;
    }
    return [];
  };

  const locationsData = getLocationsData();
  const locationsToShow = locationsData.slice(0, maxLocationsToShow);
  const remainingLocations = locationsData.length - maxLocationsToShow;

  return (
    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <Text size="sm" weight="font-bold" additionalClass="text-gray-800">
          {t('process:allocation_summary')}
        </Text>
        {allocation.expiry_priority && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${allocation.expiry_priority === 'HIGH' ? 'text-red-600 bg-red-50' : allocation.expiry_priority === 'MEDIUM' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
            {t('process:priority')}: {allocation.expiry_priority}
          </span>
        )}
      </div>

      {/* Allocation Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <Text size="xs" additionalClass="text-gray-600">{t('process:requested')}:</Text>
          <Text size="sm" weight="font-medium">
            {allocation.allocation_summary?.total_requested || allocation.requested_quantity || 0} {t('process:units')}
          </Text>
        </div>
        <div className="text-center">
          <Text size="xs" additionalClass="text-gray-600">{t('process:allocated')}:</Text>
          <Text 
            size="sm" 
            weight="font-medium" 
            additionalClass={
              (allocation.allocation_summary?.fully_allocated ?? allocation.fully_allocated) ? "text-green-600" : "text-orange-600"
            }
          >
            {allocation.allocation_summary?.total_allocated || allocation.allocated_quantity || allocation.total_allocated || 0} {t('process:units')}
          </Text>
        </div>
        <div className="text-center">
          <Text size="xs" additionalClass="text-gray-600">{t('process:locations')}:</Text>
          <Text size="sm" weight="font-medium">
            {allocation.allocation_summary?.locations_used || allocation.locations_used || locationsData.length}
          </Text>
        </div>
        <div className="text-center">
          <Text size="xs" additionalClass="text-gray-600">{t('process:weight')}:</Text>
          <Text size="sm" weight="font-medium">
            {allocation.allocated_weight || allocation.requested_weight || 0} kg
          </Text>
        </div>
      </div>



      {/* Allocation Status */}
      {!(allocation.allocation_summary?.fully_allocated ?? allocation.fully_allocated) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <Text size="xs" weight="font-medium" additionalClass="text-yellow-800 mb-1">
            {t('process:partial_allocation_warning')}:
          </Text>
          <Text size="xs" additionalClass="text-yellow-700">
            {allocation.allocation_summary?.partial_allocation_reason || 
             `${t('process:only')} ${allocation.allocation_summary?.total_allocated || allocation.allocated_quantity || 0} ${t('process:units_allocated_of')} ${allocation.allocation_summary?.total_requested || allocation.requested_quantity || 0} ${t('process:requested')}`}
          </Text>
        </div>
      )}



      {/* Location Details */}
      {showLocationDetails && locationsData.length > 0 && (
        <div>
          <Text size="xs" weight="font-medium" additionalClass="text-gray-700 mb-3">
            {t('process:allocation_details')}:
          </Text>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {locationsToShow.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  {/* FIFO Priority Indicator */}
                  <div className="flex items-center space-x-2">
                    <span className={`
                      inline-block w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white
                      ${location.fifo_rank <= 3 ? 'bg-red-500' : location.fifo_rank <= 7 ? 'bg-orange-500' : 'bg-green-500'}
                    `}>
                      {location.fifo_rank}
                    </span>
                    <ExpiryUrgencyIndicator
                      urgency={location.expiry_urgency || location.urgency_level}
                      daysToExpiry={location.days_to_expiry}
                      expirationDate={location.expiration_date}
                      size="sm"
                      showDetails={false}
                    />
                  </div>

                  {/* Location Information */}
                  <div>
                    <Text size="xs" weight="font-medium">{location.cell_reference}</Text>
                    <Text size="xs" additionalClass="text-gray-500">
                      {location.allocated_quantity || location.requested_qty || location.available_qty} {t('process:units')} • {location.supplier_name} • {t('process:lot')}: {location.lot_series}
                    </Text>
                  </div>
                </div>

                {/* Expiry Information */}
                <div className="text-right">
                  <Text size="xs" weight="font-medium" additionalClass={
                    (location.expiry_urgency === "EXPIRED" || location.urgency_level === "EXPIRED" || location.is_expired) ? "text-red-600" :
                    (location.expiry_urgency === "URGENT" || location.urgency_level === "URGENT") ? "text-orange-600" :
                    (location.expiry_urgency === "WARNING" || location.urgency_level === "WARNING") ? "text-yellow-600" : "text-green-600"
                  }>
                    {location.days_to_expiry >= 0 ? 
                      `${location.days_to_expiry}d` : 
                      `${Math.abs(location.days_to_expiry)}d ago`
                    }
                  </Text>
                  <Text size="xs" additionalClass="text-gray-500">
                    {formatDate(location.expiration_date)}
                  </Text>
                  <Text size="xs" additionalClass="text-gray-400">
                    {location.entry_order_no}
                  </Text>
                </div>
              </div>
            ))}

            {/* Show remaining locations indicator */}
            {remainingLocations > 0 && (
              <div className="text-center p-2 bg-gray-100 rounded border border-dashed">
                <Text size="xs" additionalClass="text-gray-600">
                  + {remainingLocations} {t('process:more_locations')}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}




    </div>
  );
};

export default FifoAllocationSummary; 
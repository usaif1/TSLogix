// dependencies
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

// components
import { Button, Divider, Text } from "@/components";

// store
import { GlobalStore } from "@/globalStore";

const DepartureOptions: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  const navigation = useNavigate();
  const closeModal = GlobalStore.use.closeModal();

  const departureRadioOptions = [
    {
      label: t('from_approved_products'),
      route: "/processes/departure/approved",
      htmlFor: "approved_products",
    },
    {
      label: t('about_returned_products'),
      route: "/processes/departure/returned",
      htmlFor: "returned_products",
    },
    {
      label: t('from_products_counter_sample'),
      route: "/processes/departure/counter",
      htmlFor: "counter_sample",
    },
    {
      label: "Bulk Upload Departure Orders",
      route: "/processes/departure/bulk-upload",
      htmlFor: "bulk_upload",
    },
  ];

  return (
    <div>
      <Text size="2xl" weight="font-bold">
        {t('select_exit_option')}
      </Text>
      <Divider height="sm" />
      <div className="flex items-center gap-x-4">
        {departureRadioOptions.map((option) => {
          return (
            <div
              key={option.route}
              className="flex items-center gap-x-1 cursor-pointer"
            >
              <input
                type="radio"
                checked={selectedRoute === option.route}
                onChange={() => {
                  setSelectedRoute(option.route);
                }}
              />
              <label htmlFor={option.htmlFor} className="text-xs">
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      <Divider height="lg" />
      <div className="flex justify-center">
        <Button
          additionalClass="!w-32"
          disabled={!selectedRoute}
          onClick={() => {
            navigation(selectedRoute);
            closeModal();
          }}
        >
          {t('common:proceed')}
        </Button>
      </div>
    </div>
  );
};

export default DepartureOptions;

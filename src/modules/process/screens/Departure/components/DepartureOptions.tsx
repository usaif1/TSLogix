// dependencies
import React, { useState } from "react";
import { useNavigate } from "react-router";

// components
import { Button, Divider, Text } from "@/components";

// store
import { GlobalStore } from "@/globalStore";

const departureRadioOptions = [
  {
    label: "From Approved Products",
    route: "/processes/departure/approved",
    htmlFor: "approved_products",
  },
  {
    label: "About Returned Products",
    route: "/processes/departure/returned",
    htmlFor: "returned_products",
  },
  {
    label: "From Products in Counter Sample",
    route: "/processes/departure/counter",
    htmlFor: "counter_sample",
  },
];

const DepartureOptions: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  const navigation = useNavigate();
  const closeModal = GlobalStore.use.closeModal();

  return (
    <div>
      <Text size="2xl" weight="font-bold">
        Select Exit Option
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
          Proceed
        </Button>
      </div>
    </div>
  );
};

export default DepartureOptions;

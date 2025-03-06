// dependencies
import React, { useState } from "react";
import { useNavigate } from "react-router";

// components
import { Button, Divider, Text } from "@/components";

// store
import { GlobalStore, ProcessesStore } from "@/globalStore";

const DepartureOptions: React.FC = () => {
  const { departureExitOptions } = ProcessesStore();

  const [selectedExitOption, setSelectedExitOption] = useState<string>("");

  const navigation = useNavigate();
  const closeModal = GlobalStore.use.closeModal();

  return (
    <div>
      <Text size="2xl" weight="font-bold">
        Select Exit Option
      </Text>
      <Divider height="sm" />
      <div className="flex items-center gap-x-4">
        {departureExitOptions.map((option) => {
          return (
            <div
              key={option.exit_option_id}
              className="flex items-center gap-x-1 cursor-pointer"
            >
              <input
                type="radio"
                checked={selectedExitOption === option.exit_option_id}
                onChange={() => {
                  setSelectedExitOption(option.exit_option_id);
                }}
              />
              <label htmlFor={option.htmlFor} className="text-xs">
                {option.name}
              </label>
            </div>
          );
        })}
      </div>
      <Divider height="lg" />
      <div className="flex justify-center">
        <Button
          additionalClass="!w-32"
          disabled={!selectedExitOption}
          onClick={() => {
            navigation("/processes/departure/new");
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

// dependencies
import React, { useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";

// components
import { Button, Divider, Text } from "@/components";

const originOptions = [
  { value: "originOption1", label: "originOption1" },
  { value: "originOption2", label: "originOption2" },
  { value: "originOption3", label: "originOption3" },
];

const NewMassEntryOrderForm: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <form className="order_entry_form">
      <Text size="xl" weight="font-medium">
        Bulk Entry Order Registration
      </Text>
      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* origin */}
        <div className="w-full flex flex-col">
          <label>Origin</label>
          <Select
            options={originOptions}
            styles={{
              container: () => ({
                height: "2.5rem",
              }),
            }}
          />
        </div>

        {/* entry order no */}
        <div className="w-full flex flex-col">
          <label>Entry Order No</label>
          <input
            type="text"
            disabled
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* document */}
        <div className="w-full flex flex-col">
          <label>Document</label>
          <Select
            options={originOptions}
            styles={{
              container: () => ({
                height: "2.5rem",
              }),
            }}
          />
        </div>

        {/* registration date */}
        <div className="w-full flex flex-col">
          <label>Registration Date</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* document */}
        <div className="w-full flex flex-col">
          <label>Document Date</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>

        {/* ~ date & time of admission */}
        <div className="w-full flex flex-col">
          <label>Admission Date and Time</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* personnel in charge */}
        <div className="w-full flex flex-col">
          <label>Personnel In Charge</label>
          <Select
            options={originOptions}
            styles={{
              container: () => ({
                height: "2.5rem",
              }),
            }}
          />
        </div>

        {/* ~ document status */}
        <div className="w-full flex flex-col">
          <label>Document Status</label>
          <Select
            options={originOptions}
            isDisabled
            styles={{
              container: () => ({
                height: "2.5rem",
              }),
            }}
          />
        </div>
      </div>
      <Divider />
      <div>
        <Button variant="action" additionalClass="w-40">
          Register
        </Button>
      </div>
    </form>
  );
};

export default NewMassEntryOrderForm;

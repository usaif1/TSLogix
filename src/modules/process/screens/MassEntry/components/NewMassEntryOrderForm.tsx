// dependencies
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Select, { CSSObjectWithLabel } from "react-select";
import DatePicker from "react-datepicker";

// components
import { Button, Divider, Text } from "@/components";

const originOptions = [
  { value: "originOption1", label: "originOption1" },
  { value: "originOption2", label: "originOption2" },
  { value: "originOption3", label: "originOption3" },
];

const reactSelectStyle = {
  container: (style: CSSObjectWithLabel) => ({
    ...style,
    height: "2.5rem",
  }),
};

const NewMassEntryOrderForm: React.FC = () => {
  const { t } = useTranslation(['process', 'common']);
  const [startDate, setStartDate] = useState(new Date());

  return (
    <form className="order_entry_form">
      <div className="w-full flex items-center gap-x-6">
        {/* origin */}
        <div className="w-full flex flex-col">
          <label htmlFor="origin">{t('origin')}</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="origin"
            name="origin"
          />
        </div>

        {/* entry order no */}
        <div className="w-full flex flex-col">
          <label htmlFor="entry_order_no">{t('entry_order_no')}</label>
          <input
            type="text"
            disabled
            id="entry_order_no"
            name="entry_order_no"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>

        {/* document */}
        <div className="w-full flex flex-col">
          <label htmlFor="document">{t('document')}</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="document"
            name="document"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* registration date */}
        <div className="w-full flex flex-col">
          <label htmlFor="registration_date">{t('registration_date')}</label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="registration_date"
            name="registration_date"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>

        {/* document date */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_date">{t('document_date')}</label>
          <DatePicker
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="document_date"
            name="document_date"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>

        {/* admission date and time */}
        <div className="w-full flex flex-col">
          <label htmlFor="admission_date_and_time">
            {t('admission_date_and_time')}
          </label>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            className="w-full border border-slate-400 h-10 rounded-md pl-4"
            id="admission_date_and_time"
            name="admission_date_and_time"
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* personnel in charge */}
        <div className="w-full flex flex-col">
          <label htmlFor="personnel_in_charge">{t('personnel_in_charge')}</label>
          <Select
            options={originOptions}
            styles={reactSelectStyle}
            inputId="personnel_in_charge"
            name="personnel_in_charge"
          />
        </div>

        {/* document status */}
        <div className="w-full flex flex-col">
          <label htmlFor="document_status">{t('document_status')}</label>
          <Select
            options={originOptions}
            isDisabled
            styles={reactSelectStyle}
            inputId="document_status"
            name="document_status"
          />
        </div>
      </div>

      <Divider />
      <div>
        <div className="w-full flex items-center gap-x-6">
          <div>
            <input
              type="radio"
              id="order_in_process"
              name="order_status"
              value="order_in_process"
            />
            <label htmlFor="order_in_process"> {t('order_in_process')}</label>
          </div>
          <div>
            <input
              type="radio"
              id="send_order"
              name="order_status"
              value="send_order"
            />
            <label htmlFor="send_order"> {t('send_order')}</label>
          </div>
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        <div className="w-full flex flex-col">
          <label htmlFor="observation">{t('observation')}</label>
          <textarea
            id="observation"
            name="observation"
            className="border border-slate-400 rounded-md px-4 pt-2 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* total volume */}
        <div className="w-full flex flex-col">
          <label htmlFor="total_volume">{t('total_volume')}</label>
          <div className="w-full flex items-end gap-x-2">
            <input
              type="text"
              disabled
              id="total_volume"
              name="total_volume"
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
            <Text>{t('m3')}</Text>
          </div>
        </div>

        {/* total weight */}
        <div className="w-full flex flex-col">
          <label htmlFor="total_weight">{t('total_weight')}</label>
          <div className="w-full flex items-end gap-x-2">
            <input
              type="text"
              disabled
              id="total_weight"
              name="total_weight"
              className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
            <Text>{t('kg')}</Text>
          </div>
        </div>

        {/* CIF value/ Purchase Value */}
        <div className="w-full flex flex-col">
          <label htmlFor="cif_value_purchase_value">
            {t('cif_value_purchase_value')}
          </label>
          <input
            type="text"
            disabled
            id="cif_value_purchase_value"
            name="cif_value_purchase_value"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div className="w-full flex items-center gap-x-6">
        {/* supplier */}
        <div className="w-full flex flex-col">
          <label htmlFor="supplier">{t('archive')}</label>
          <input
            type="text"
            disabled
            id="supplier"
            name="supplier"
            className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <Divider />
      <div>
        <Button variant="action" additionalClass="w-40">
          {t('common:register')}
        </Button>
      </div>
    </form>
  );
};

export default NewMassEntryOrderForm;

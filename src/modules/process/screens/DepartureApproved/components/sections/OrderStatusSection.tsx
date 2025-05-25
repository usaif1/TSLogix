import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components";
import { DepartureFormData } from "@/modules/process/types";

interface Props {
  formData: DepartureFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
}

const OrderStatusSection: React.FC<Props> = ({
  formData,
  handleChange,
  isSubmitting
}) => {
  const { t } = useTranslation(['process']);

  return (
    <div className="w-full">
      <Text weight="font-bold" additionalClass="mb-3">{t('process:order_status')}</Text>
      <div className="flex items-center gap-x-6">
        <div className="flex items-center gap-x-2">
          <input
            type="radio"
            id="order_in_process"
            name="order_status"
            value="order_in_process"
            checked={formData.order_status === "order_in_process"}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <label htmlFor="order_in_process" className="text-sm cursor-pointer">
            {t('process:order_in_process')}
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <input
            type="radio"
            id="send_order"
            name="order_status"
            value="send_order"
            checked={formData.order_status === "send_order"}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <label htmlFor="send_order" className="text-sm cursor-pointer">
            {t('process:send_order')}
          </label>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusSection;
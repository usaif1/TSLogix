/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";

import { Button, Divider, Text } from "@/components";
import Spinner from "@/components/Spinner";

import { ProcessService } from "@/globalService";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { useInventoryLogStore } from "@/modules/inventory/store";
import CellGrid, { Cell } from "./components/CellGrid";

interface EntryOrder {
  entry_order_id: string;
  entry_order_no: string;
  product: { name: string; product_id: string };
  remaining_packaging_qty: number;
  remaining_weight: string;
  remaining_volume?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const AllocateOrder: React.FC = () => {
  const { t } = useTranslation(["inventory", "common"]);
  const navigate = useNavigate();

  const { warehouses, cells, startLoader, stopLoader } = useInventoryLogStore();

  // separate loading flags
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isFetchingEntry, setIsFetchingEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [entryOrders, setEntryOrders] = useState<EntryOrder[]>([]);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  const [formData, setFormData] = useState({
    entry_order_id: "",
    entry_order_no: { value: "", label: "" },
    product_name: "",
    warehouse_id: { value: "", label: "" },
    packaging_quantity: "0",
    weight: "0",
    volume: "0",
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // React Select styling (consistent with your codebase)
  const reactSelectStyle = {
    container: (provided: any) => ({
      ...provided,
      height: "2.5rem",
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "2.5rem",
      borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#94a3b8",
      },
    }),
  };

  // Convert arrays to react-select options
  const entryOrderOptions: SelectOption[] = entryOrders.map((order) => ({
    value: order.entry_order_no,
    label: order.entry_order_no,
  }));

  const warehouseOptions: SelectOption[] = warehouses.map((warehouse) => ({
    value: warehouse.warehouse_id,
    label: warehouse.name,
  }));

  // 1️⃣ Load entry orders & warehouses
  useEffect(() => {
    (async () => {
      setIsInitialLoading(true);
      try {
        const orders = await ProcessService.fetchPassedEntryOrders();
        setEntryOrders(orders);
        await InventoryLogService.fetchWarehouses();
      } catch (err) {
        console.error(err);
        setError(t("inventory:error_fetching_data"));
      } finally {
        setIsInitialLoading(false);
      }
    })();
  }, [t]);

  // 2️⃣ Fetch cells when warehouse changes
  useEffect(() => {
    if (!formData.warehouse_id.value) return;
    startLoader("inventoryLogs/fetch-cells");
    InventoryLogService.fetchCells(formData.warehouse_id.value)
      .catch((err) => {
        console.error(err);
        setError(t("inventory:error_fetching_cells"));
      })
      .finally(() => {
        stopLoader("inventoryLogs/fetch-cells");
      });
  }, [formData.warehouse_id.value, startLoader, stopLoader, t]);

  const handleEntrySelect = async (selectedOption: SelectOption | null) => {
    if (!selectedOption) {
      setFormData({
        ...formData,
        entry_order_id: "",
        entry_order_no: { value: "", label: "" },
        product_name: "",
        warehouse_id: { value: "", label: "" },
        packaging_quantity: "0",
        weight: "0",
        volume: "0",
      });
      setSelectedCell(null);
      return;
    }

    setIsFetchingEntry(true);
    try {
      const det = await ProcessService.fetchEntryOrderByNo(selectedOption.value);
      setFormData({
        ...formData,
        entry_order_id: det.entry_order_id,
        entry_order_no: selectedOption,
        product_name: det.product.name,
        warehouse_id: { value: "", label: "" }, // Reset warehouse selection
        packaging_quantity: det.remaining_packaging_qty.toString(),
        weight: det.remaining_weight,
        volume: det.remaining_volume || "0",
      });
      setSelectedCell(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t("inventory:error_fetching_order_details"));
    } finally {
      setIsFetchingEntry(false);
    }
  };

  const handleWarehouseSelect = (selectedOption: SelectOption | null) => {
    setFormData((prev) => ({
      ...prev,
      warehouse_id: selectedOption || { value: "", label: "" },
    }));
    setSelectedCell(null); // Reset cell selection when warehouse changes
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !formData.entry_order_id ||
      !formData.warehouse_id.value ||
      !selectedCell
    ) {
      setError(t("inventory:required_fields_missing"));
      return;
    }

    setIsSubmitting(true);
    try {
      await InventoryLogService.assignToCell({
        entry_order_id: formData.entry_order_id,
        warehouse_id: formData.warehouse_id.value,
        cell_id: selectedCell.cell_id,
        packaging_quantity: Number(formData.packaging_quantity),
        weight: Number(formData.weight),
        volume: Number(formData.volume),
      });
      setSuccess(t("inventory:allocation_success"));
      setTimeout(() => navigate("/inventory"), 1500);
    } catch (err) {
      console.error(err);
      setError(t("inventory:allocation_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only full-page loader for initial fetch
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
        <Text additionalClass="ml-2">{t("common:loading")}</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t("inventory:allocate_order")}
      </Text>
      <Divider height="lg" />

      {/* Status Messages */}
      {(error || success) && (
        <div
          className={`mb-4 p-3 rounded-md ${
            error
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          <Text>{error || success}</Text>
        </div>
      )}

      <form className="order_entry_form" onSubmit={handleSubmit}>
        {/* Entry Order Selection */}
        <div className="w-full flex items-center gap-x-6">
          <div className="w-full flex flex-col">
            <label htmlFor="entry_order_no">
              {t("inventory:entry_order")} *
            </label>
            <div className="relative">
              <Select
                options={entryOrderOptions}
                styles={reactSelectStyle}
                inputId="entry_order_no"
                name="entry_order_no"
                value={formData.entry_order_no.value ? formData.entry_order_no : null}
                onChange={handleEntrySelect}
                placeholder={t("inventory:select_entry_order")}
                isDisabled={isSubmitting}
                isClearable
              />
              {isFetchingEntry && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Spinner />
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col">
            <label htmlFor="warehouse">
              {t("inventory:warehouse")} *
            </label>
            <Select
              options={warehouseOptions}
              styles={reactSelectStyle}
              inputId="warehouse"
              name="warehouse"
              value={formData.warehouse_id.value ? formData.warehouse_id : null}
              onChange={handleWarehouseSelect}
              placeholder={t("inventory:select_warehouse")}
              isDisabled={isSubmitting || !formData.entry_order_id}
              isClearable
            />
          </div>
        </div>

        <Divider />

        {/* Product Information (Read-only) */}
        <div className="w-full flex items-center gap-x-6">
          <div className="w-full flex flex-col">
            <label htmlFor="product_name">{t("inventory:product")}</label>
            <input
              type="text"
              id="product_name"
              name="product_name"
              value={formData.product_name}
              readOnly
              className="h-10 border border-slate-400 rounded-md px-4 bg-gray-50 cursor-not-allowed focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>
          <div className="w-full" /> {/* Spacer for consistent layout */}
        </div>

        <Divider />

        {/* Cell Selection Grid */}
        {formData.warehouse_id.value && (
          <>
            <div className="w-full">
              <Text weight="font-semibold" additionalClass="text-gray-800 mb-3">
                {t("inventory:select_cell")} *
              </Text>

              {selectedCell && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <Text additionalClass="text-blue-800 text-sm">
                    {t("inventory:selected_cell")}: <strong>{selectedCell.cellReference}</strong>
                  </Text>
                </div>
              )}

              <CellGrid
                cells={cells}
                selectedId={selectedCell?.cell_id}
                onSelect={(c) => c.status === "AVAILABLE" && setSelectedCell(c)}
              />
            </div>
            <Divider />
          </>
        )}

        {/* Quantity Information */}
        <div className="w-full flex items-center gap-x-6">
          <div className="w-full flex flex-col">
            <label htmlFor="packaging_quantity">
              {t("inventory:packaging_quantity")} *
            </label>
            <input
              type="number"
              id="packaging_quantity"
              name="packaging_quantity"
              value={formData.packaging_quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
              disabled={isSubmitting}
              className="h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
            />
          </div>

          <div className="w-full flex flex-col">
            <label htmlFor="weight">
              {t("inventory:weight")} *
            </label>
            <div className="w-full flex items-end gap-x-2">
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                disabled={isSubmitting}
                className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
              />
              <Text>Kg</Text>
            </div>
          </div>

          <div className="w-full flex flex-col">
            <label htmlFor="volume">
              {t("inventory:volume")} *
            </label>
            <div className="w-full flex items-end gap-x-2">
              <input
                type="number"
                id="volume"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                disabled={isSubmitting}
                className="w-full h-10 border border-slate-400 rounded-md px-4 focus-visible:outline-1 focus-visible:outline-primary-500"
              />
              <Text>
                M<sup>3</sup>
              </Text>
            </div>
          </div>
        </div>

        <Divider />

        {/* Notes Section */}
        <div className="w-full flex items-center gap-x-6">
          <div className="w-full flex flex-col">
            <label htmlFor="notes">
              {t("inventory:notes")} ({t("common:optional")})
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              disabled={isSubmitting}
              className="border border-slate-400 rounded-md px-4 pt-2 focus-visible:outline-1 focus-visible:outline-primary-500"
              placeholder={t("inventory:notes_placeholder")}
            />
          </div>
        </div>

        <Divider height="2xl" />

        {/* Action Buttons */}
        <div className="flex justify-end gap-x-4">
          <Button
            variant="cancel"
            additionalClass="w-32"
            type="button"
            onClick={() => navigate("/inventory")}
            disabled={isSubmitting}
          >
            {t("common:cancel")}
          </Button>

          <Button
            disabled={
              !formData.entry_order_id ||
              !formData.warehouse_id.value ||
              !selectedCell ||
              isSubmitting
            }
            variant="action"
            additionalClass="w-40"
            type="submit"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Spinner />
                <span className="ml-2">{t("common:processing")}</span>
              </div>
            ) : (
              t("inventory:allocate")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AllocateOrder;
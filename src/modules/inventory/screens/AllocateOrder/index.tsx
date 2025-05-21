import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  // include packaging, weight, volume
  const [formData, setFormData] = useState({
    entry_order_id: "",
    entry_order_no: "",
    product_name: "",
    warehouse_id: "",
    packaging_quantity: "0",
    weight: "0",
    volume: "0",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    if (!formData.warehouse_id) return;
    startLoader("inventoryLogs/fetch-cells");
    InventoryLogService.fetchCells(formData.warehouse_id)
      .catch((err) => {
        console.error(err);
        setError(t("inventory:error_fetching_cells"));
      })
      .finally(() => {
        stopLoader("inventoryLogs/fetch-cells");
      });
  }, [formData.warehouse_id, startLoader, stopLoader, t]);

  const handleEntrySelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const entryNo = e.target.value;
    if (!entryNo) {
      setFormData({
        ...formData,
        entry_order_id: "",
        entry_order_no: "",
        product_name: "",
        warehouse_id: "",
        packaging_quantity: "0",
        weight: "0",
        volume: "0",
      });
      return;
    }

    setIsFetchingEntry(true);
    try {
      const det = await ProcessService.fetchEntryOrderByNo(entryNo);
      setFormData({
        ...formData,
        entry_order_id: det.entry_order_id,
        entry_order_no: det.entry_order_no,
        product_name: det.product.name,
        warehouse_id: det.warehouse_id || "",
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
      !formData.warehouse_id ||
      !selectedCell
    ) {
      setError(t("inventory:required_fields_missing"));
      return;
    }

    setIsSubmitting(true);
    try {
      await InventoryLogService.assignToCell({
        entry_order_id: formData.entry_order_id,
        warehouse_id: formData.warehouse_id,  // This was previously misspelled as "warehous_id"
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
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Text size="3xl" weight="font-bold">
        {t("inventory:allocate_order")}
      </Text>
      <Divider />

      {(error || success) && (
        <div
          className={`px-4 py-3 rounded ${
            error
              ? "bg-red-50 border-red-200 text-red-700 border"
              : "bg-green-50 border-green-200 text-green-700 border"
          }`}
        >
          {error || success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entry Order */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            {t("inventory:entry_order")} *
          </label>
          <div className="relative">
            <select
              name="entry_order_no"
              value={formData.entry_order_no}
              onChange={handleEntrySelect}
              disabled={isSubmitting}
              className="input"
              required
            >
              <option value="">{t("inventory:select_entry_order")}</option>
              {entryOrders.map((o) => (
                <option key={o.entry_order_id} value={o.entry_order_no}>
                  {o.entry_order_no}
                </option>
              ))}
            </select>
            {isFetchingEntry && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        {/* Warehouse */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            {t("inventory:warehouse")} *
          </label>
          <select
            name="warehouse_id"
            value={formData.warehouse_id}
            onChange={handleChange}
            disabled={isSubmitting || !formData.entry_order_id}
            className="input"
            required
          >
            <option value="">{t("inventory:select_warehouse")}</option>
            {warehouses.map((w) => (
              <option key={w.warehouse_id} value={w.warehouse_id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product (read-only spans both columns) */}
        <div className="md:col-span-2 flex flex-col">
          <label className="mb-1 font-medium text-gray-700">{t("inventory:product")}</label>
          <input
            readOnly
            value={formData.product_name}
            className="input bg-gray-50 cursor-not-allowed"
          />
        </div>

        {/* CellGrid (spans both) */}
        {formData.warehouse_id && (
          <div className="md:col-span-2">
            <label className="mb-1 font-medium text-gray-700 block">
              {t("inventory:select_cell")} *
            </label>
            <CellGrid
              cells={cells}
              selectedId={selectedCell?.cell_id}
              onSelect={(c) => c.status === "AVAILABLE" && setSelectedCell(c)}
            />
          </div>
        )}

        {/* Packaging, Weight, Volume */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">{t("inventory:packaging_quantity")} *</label>
          <input
            type="number"
            name="packaging_quantity"
            value={formData.packaging_quantity}
            onChange={handleChange}
            className="input"
            min={0}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">{t("inventory:weight")} *</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="input"
            min={0}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">{t("inventory:volume")} *</label>
          <input
            type="number"
            name="volume"
            value={formData.volume}
            onChange={handleChange}
            className="input"
            min={0}
            required
          />
        </div>

        {/* Notes (optional spans both) */}
        <div className="md:col-span-2 flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            {t("inventory:notes")} ({t("common:optional")})
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            disabled={isSubmitting}
            className="textarea"
          />
        </div>

        {/* Buttons (spans both) */}
        <div className="md:col-span-2 flex justify-end gap-4">
          <Button
            variant="cancel"
            onClick={() => navigate("/inventory/logs")}
            disabled={isSubmitting}
          >
            {t("common:cancel")}
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.entry_order_id ||
              !formData.warehouse_id ||
              !selectedCell
            }
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner /> {t("common:processing")}  
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
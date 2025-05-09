/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { ProcessService } from "@/globalService";
import { useInventoryLogStore } from "@/modules/inventory/store/index";
import Button from "@/components/Button";
import { BasicModalComponent } from "@/components/ModalComponents/index";
import Spinner from "@/components/Spinner/index";
import { InventoryTable } from "./components/index";
import { CellContext, ColumnDef } from "@tanstack/react-table";

interface EntryOrder {
  entry_order_id: string;
  entry_order_no: string;
  palettes: string;
  product: { name: string; product_id: string };
  warehouse_id?: string;
}

interface AddInventoryForm {
  entry_order_id?: string;
  entry_order_no?: string;
  product_name?: string;
  warehouse_id?: string;
  notes?: string;
}

const InventoryLog: React.FC = () => {
  const { inventoryLogs, loaders } = useInventoryLogStore();
  const [showAdd, setShowAdd] = useState(false);
  const [entryOrders, setEntryOrders] = useState<EntryOrder[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [formData, setFormData] = useState<AddInventoryForm>({});

  const loadLogs = useCallback(() => {
    InventoryLogService.fetchAllLogs().catch(console.error);
  }, []);

  useEffect(() => {
    ProcessService.fetchPassedEntryOrders()
      .then((orders: EntryOrder[]) => setEntryOrders(orders))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (showAdd) {
      InventoryLogService.fetchWarehouses()
        .then((data) => setWarehouses(data))
        .catch(console.error);
    }
  }, [showAdd]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const isAdding = loaders["inventoryLogs/add-inventory"];

  const handleEntrySelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const entryOrderNo = e.target.value;
    if (!entryOrderNo) {
      setFormData({});
      return;
    }
    try {
      const details = await ProcessService.fetchEntryOrderByNo(entryOrderNo);
      setFormData({
        entry_order_no: details.entry_order_no,
        entry_order_id: details.entry_order_id,
        product_name: details.product.name,
        warehouse_id: details.warehouse_id || "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleWarehouseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const warehouseId = e.target.value;
    setFormData((prev) => ({ ...prev, warehouse_id: warehouseId }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      entry_order_id: formData.entry_order_id,
      warehouse_id: formData.warehouse_id,
      notes: formData.notes,
    };
    try {
      await InventoryLogService.addInventory(payload);
      setShowAdd(false);
      setFormData({});
      loadLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setShowAdd(false);
    setFormData({});
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: "User",
        accessorFn: (row: any) =>
          `${row.user.first_name} ${row.user.last_name}`,
        id: "userName",
      },
      {
        header: "Entry Order",
        accessorFn: (row: any) => row.entry_order?.entry_order_no || "-",
        id: "entryOrderNo",
      },
      {
        header: "Product",
        accessorFn: (row: any) => row.product.name,
        id: "productName",
      },
      {
        header: "Change",
        accessorKey: "quantity_change",
        cell: (info: CellContext<any, any>) => {
          const change = info.getValue<number>();
          const type = info.row.original.movement_type;
          const color =
            type === "ENTRY"
              ? "text-green-600 font-bold"
              : type === "DEPARTURE"
              ? "text-red-600 font-bold"
              : "text-gray-800";
          return <span className={color}>{change}</span>;
        },
      },
      { header: "Type", accessorKey: "movement_type" },
      {
        header: "Date",
        accessorKey: "timestamp",
        cell: (info) => new Date(info.getValue<string>()).toLocaleString(),
      },
    ],
    []
  );

  const renderActions = () => (
    <div className="space-y-2">
      <Button variant="action" additionalClass="w-20">
        Edit
      </Button>
      <Button variant="cancel" additionalClass="w-20">
        Delete
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Logs</h1>
        <Button onClick={() => setShowAdd(true)}>+ Allocate Pallets</Button>
      </div>
      {isAdding ? (
        <Spinner />
      ) : (
        <InventoryTable
          columns={columns}
          data={inventoryLogs}
          renderActions={renderActions}
        />
      )}
      {showAdd && (
        <BasicModalComponent title="Allocate Pallets" onClose={handleClose}>
          <div className="space-y-4">
            <div>
              <label>Entry Order</label>
              <select
                name="entry_order_no"
                value={formData.entry_order_no || ""}
                onChange={handleEntrySelect}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="">-- Select --</option>
                {entryOrders.map((order) => (
                  <option
                    key={order.entry_order_id}
                    value={order.entry_order_no}
                  >
                    {order.entry_order_no}
                  </option>
                ))}
              </select>
              <input
                type="hidden"
                name="entry_order_id"
                value={formData.entry_order_id || ""}
              />
            </div>
            <div>
              <label>Product</label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name || ""}
                readOnly
                className="mt-1 block w-full border rounded p-2 bg-gray-100"
              />
            </div>
            <div>
              <label>Warehouse</label>
              <select
                name="warehouse_id"
                value={formData.warehouse_id || ""}
                onChange={handleWarehouseSelect}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="">-- Select --</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Notes (optional)</label>
              <input
                type="text"
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="cancel" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Allocate</Button>
            </div>
          </div>
        </BasicModalComponent>
      )}
    </div>
  );
};

export default InventoryLog;

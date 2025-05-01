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
  total_qty: string;
  palettes: string;
  total_weight: string;
  presentation: string;
  comments: string;
  type: string | null;
  insured_value: string;
  entry_date: string;
  document_date: string;
  registration_date: string;
  document_status: string;
  order_progress: string | null;
  warehouse_id?: string;
  cell_id?: string;
  product: {
    name: string;
    product_id: string;
  };
  documentType: { name: string };
  supplier: { name: string };
  origin: { name: string };
  entry_status: { name: string };
  order: { organisation: { name: string } };
  audit_status: { name: string };
  status: string;
}

interface AddInventoryForm {
  entry_order_no?: string;
  entry_order_id?: string;
  product_id?: string;
  product_name?: string;
  total_qty?: number;
  warehouse_id?: string;
  cell_id?: string;
  notes?: string;
}

const InventoryLog: React.FC = () => {
  const { inventoryLogs, loaders } = useInventoryLogStore();
  const [showAdd, setShowAdd] = useState(false);
  const [entryOrders, setEntryOrders] = useState<EntryOrder[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [cells, setCells] = useState<any[]>([]);
  const [formData, setFormData] = useState<AddInventoryForm>({});

  const loadLogs = useCallback(() => {
    InventoryLogService.fetchAllLogs().catch(console.error);
  }, []);

  useEffect(() => {
    ProcessService.fetchPassedEntryOrders()
      .then((orders: EntryOrder[]) => setEntryOrders(orders))
      .catch(console.error);
  }, []);

  // When opening the Add modal, fetch available warehouses
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
    const orderNo = e.target.value;
    if (!orderNo) {
      
      setFormData({});
      return;
    }

    try {
      const details = await ProcessService.fetchEntryOrderByNo(orderNo);
      const qtyNumber =
        parseInt((details.total_qty || "").replace(/\D/g, ""), 10) || 0;

      setFormData({
        entry_order_no: details.entry_order_no,
        product_id: details.product.product_id,
        product_name: details.product.name,
        total_qty: qtyNumber,
        warehouse_id: details.warehouse_id,
        cell_id: details.cell_id,
        notes: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleWarehouseSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const warehouseId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      warehouse_id: warehouseId,
      cell_id: "",
    }));
    if (warehouseId) {
      try {
        const availableCells = await InventoryLogService.fetchCells(
          warehouseId
        );
        setCells(availableCells);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCells([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_qty" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      product_id: formData.product_id,
      quantity: formData.total_qty,   
      entry_order_id: formData.entry_order_id,
      warehouse_id: formData.warehouse_id,
      cell_id: formData.cell_id,
      notes: formData.notes,
    };
  
    try {
      await InventoryLogService.addInventory(payload);
      setShowAdd(false);
      loadLogs();
    } catch (err) {
      console.error(err);
    }
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
        cell: (info: CellContext<any, any>) =>
          new Date(info.getValue<string>()).toLocaleString(),
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
        <Button onClick={() => setShowAdd(true)}>+ Add Inventory</Button>
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
        <BasicModalComponent
          title="Add Inventory"
          onClose={() => setShowAdd(false)}
        >
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
                    key={order.entry_order_no}
                    value={order.entry_order_no}
                  >
                    {order.entry_order_no}
                  </option>
                ))}
              </select>
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
              <input
                type="hidden"
                name="product_id"
                value={formData.product_id || ""}
              />
            </div>

            <div>
              <label>Quantity</label>
              <input
                type="number"
                name="total_qty"
                value={formData.total_qty ?? ""}
                onChange={handleChange}
                className="mt-1 block w-full border rounded p-2"
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
              <label>Cell</label>
              <select
                name="cell_id"
                value={formData.cell_id || ""}
                onChange={handleChange}
                className="mt-1 block w-full border rounded p-2"
              >
                <option value="">-- Select --</option>
                {cells.map((c) => (
                  <option key={c.cell_id} value={c.cell_id}>
                    {c.cell_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="cancel" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add</Button>
            </div>
          </div>
        </BasicModalComponent>
      )}
    </div>
  );
};

export default InventoryLog;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { InventoryLogService } from "@/modules/inventory/api/inventory.service";
import { useInventoryLogStore } from "@/modules/inventory/store/index";
import Button from "@/components/Button";
import { BasicModalComponent } from "@/components/ModalComponents/index";
import Spinner from "@/components/Spinner/index";
import { InventoryTable } from "./components/index";
import { CellContext } from "@tanstack/react-table";

interface InventoryLogFormData {
  product_id: string;
  quantity_change: number;
  movement_type: string;
  notes?: string;
}

const getMovementTypeColor = (type: string): string => {
  switch (type) {
    case "ENTRY":
      return "text-green-600 font-bold";
    case "DEPARTURE":
      return "text-red-600 font-bold";
    default:
      return "text-gray-800";
  }
};

const InventoryLog: React.FC = () => {
  const {
    inventoryLogs,
    currentInventoryLog,
    loaders,
    setCurrentInventoryLog,
  } = useInventoryLogStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryLogFormData>>({});

  const loadLogs = useCallback(() => {
    InventoryLogService.fetchAllLogs().catch(console.error);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const isLoading = loaders["inventoryLogs/fetch-logs"];

  const openForm = useCallback(
    (log?: any) => {
      if (log) {
        setFormData({
          product_id: log.product_id,
          quantity_change: log.quantity_change,
          movement_type: log.movement_type,
          notes: log.notes,
        });
        setCurrentInventoryLog(log);
      } else {
        setFormData({});
        setCurrentInventoryLog(null);
      }
      setShowForm(true);
    },
    [setCurrentInventoryLog]
  );

  const closeForm = () => {
    setShowForm(false);
    setFormData({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.product_id || !formData.movement_type) {
      alert("Product ID and Movement Type are required.");
      return;
    }

    try {
      if (currentInventoryLog) {
        await InventoryLogService.updateLog(
          (currentInventoryLog as any).log_id,
          formData
        );
      } else {
        await InventoryLogService.createLog(formData as any);
      }
      closeForm();
      loadLogs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this log?")) {
      await InventoryLogService.deleteLog(id);
      loadLogs();
    }
  };

  const columns = React.useMemo(
    () => [
      {
        header: "User",
        accessorFn: (row: any) =>
          `${row.user.first_name} ${row.user.last_name}`,
        id: "userName",
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
          const type = info.row.original.movement_type as string;
          const colorClass = getMovementTypeColor(type);

          return <span className={colorClass}>{change}</span>;
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Logs</h1>
        <Button onClick={() => openForm()}>+ New Log</Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <InventoryTable
          columns={columns}
          data={inventoryLogs}
          renderActions={(log) => (
            <div className="space-y-2">
              <Button
                variant="action"
                additionalClass="w-20"
                onClick={() => openForm(log)}
              >
                Edit
              </Button>
              <Button
                variant="cancel"
                additionalClass="w-20"
                onClick={() => handleDelete(log.log_id)}
              >
                Delete
              </Button>
            </div>
          )}
        />
      )}

      {showForm && (
        <BasicModalComponent
          title={
            currentInventoryLog ? "Edit Inventory Log" : "New Inventory Log"
          }
          onClose={closeForm}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Product ID</label>
              <input
                name="product_id"
                value={formData.product_id || ""}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Quantity Change
              </label>
              <input
                type="number"
                name="quantity_change"
                value={formData.quantity_change ?? ""}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Movement Type</label>
              <select
                name="movement_type"
                value={formData.movement_type || ""}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-2 py-1"
              >
                <option value="">-- Select Type --</option>
                <option value="ENTRY">Entry</option>
                <option value="DEPARTURE">Departure</option>
                <option value="TRANSFER">Transfer</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Notes</label>
              <input
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-2 py-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="cancel" onClick={closeForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {currentInventoryLog ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </BasicModalComponent>
      )}
    </div>
  );
};

export default InventoryLog;

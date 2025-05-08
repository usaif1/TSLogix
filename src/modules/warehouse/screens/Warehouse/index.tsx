import React, { useEffect, useState } from "react";
import { WarehouseGrid } from "@/modules/warehouse/screens/Warehouse/components/index";
import { WarehouseCellService } from "@/modules/warehouse/api/warehouse.service";
import useWarehouseCellStore from "@/modules/warehouse/store";

export default function WarehouseView() {
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);
  const {
    warehouses,
    setWarehouses,
    setCells,
    loaders,
    startLoader,
    stopLoader,
  } = useWarehouseCellStore();

  const loadingWarehouses = loaders["warehouses/fetch-warehouses"];

  // fetch all warehouses for selector
  useEffect(() => {
    (async () => {
      startLoader("warehouses/fetch-warehouses");
      try {
        const list = await WarehouseCellService.fetchWarehouses();
        setWarehouses(list);
      } catch (err) {
        console.error(err);
      } finally {
        stopLoader("warehouses/fetch-warehouses");
      }
    })();
  }, [startLoader, stopLoader, setWarehouses]);

  useEffect(() => {
    (async () => {
      startLoader("cells/fetch-cells");
      try {
        const response = await WarehouseCellService.fetchAllCells(warehouseId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized = response.cells.map((c: any) => ({
          ...c,
          bay: Number(c.bay),
          position: Number(c.position),
          capacity: parseFloat(c.capacity),
          currentUsage: parseFloat(c.currentUsage),
        }));
        setCells(normalized);
      } catch (err) {
        console.error(err);
        setCells([]);
      } finally {
        stopLoader("cells/fetch-cells");
      }
    })();
  }, [warehouseId, startLoader, stopLoader, setCells]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Warehouse Layout</h1>

      <div className="mb-4">
        <label className="mr-2">Select Warehouse:</label>
        {loadingWarehouses ? (
          "Loading..."
        ) : (
          <select
            onChange={(e) => setWarehouseId(e.target.value || undefined)}
            className="border p-1"
            value={warehouseId || ""}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.warehouse_id} value={wh.warehouse_id}>
                {wh.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="border max-h-[70vh] overflow-auto">
        + <WarehouseGrid warehouse_id={warehouseId} />+{" "}
      </div>
    </div>
  );
}

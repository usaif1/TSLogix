import { useEffect, useState } from "react";
import { WarehouseGrid } from "@/modules/warehouse/screens/Warehouse/components/index";
import { WarehouseCellService } from "@/modules/warehouse/api/warehouse.service";
import useWarehouseCellStore from "@/modules/warehouse/store";
import Button from "@/components/Button";
// Import the utility function
import { exportWarehouseGridToExcel } from "@/modules/warehouse/utils/excelExport";

export default function WarehouseView() {
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);
  const {
    warehouses,
    cells,
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

  const downloadExcel = () => {
    // Filter cells based on selected warehouse
    const filtered = warehouseId
      ? cells.filter((c) => c.warehouse_id === warehouseId)
      : cells;

    // Get the current warehouse name for the filename
    const warehouseName = warehouseId
      ? warehouses.find((w) => w.warehouse_id === warehouseId)?.name || "Warehouse"
      : "All-Warehouses";

    exportWarehouseGridToExcel(filtered, warehouseName);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Warehouse Report</h1>
        <Button 
          variant="primary" 
          onClick={downloadExcel}
          additionalClass="px-4"
          disabled={cells.length === 0}
        >
          Download Excel
        </Button>
      </div>

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

      <div className="border max-h-[70vh] max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] overflow-y-auto overflow-x-auto">
        <WarehouseGrid warehouse_id={warehouseId} />
      </div>
    </div>
  );
}

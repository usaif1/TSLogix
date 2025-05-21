/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import { WarehouseCell } from "@/modules/warehouse/store";
import i18next from "i18next";

/**
 * Generates and downloads an Excel file with warehouse cell data
 */
export const exportWarehouseToExcel = (
  cells: WarehouseCell[],
  warehouseName: string
) => {
  if (cells.length === 0) {
    alert("No data to export");
    return;
  }

  // Format cells for Excel - flatten the data
  const excelData = cells.map((cell) => ({
    Location: `${cell.row}${String(cell.bay).padStart(2, "0")}.${String(
      cell.position
    ).padStart(2, "0")}`,
    Row: cell.row,
    Bay: cell.bay,
    Position: cell.position,
    Status: cell.status,
    Role: cell.cell_role || "STANDARD",
    Capacity: cell.capacity,
    CurrentUsage: cell.currentUsage,
    WarehouseID: cell.warehouse_id,
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouse Data");

  // Generate Excel file
  XLSX.writeFile(
    workbook,
    `${warehouseName}-Grid-${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

/**
 * Generates and downloads an Excel file with warehouse grid layout including color coding
 */
export const exportWarehouseGridToExcel = (
  cells: WarehouseCell[],
  warehouseName: string
) => {
  if (cells.length === 0) {
    alert(i18next.t("common:no_data_to_export"));
    return;
  }

  // Extract rows, bays, and positions just like in the grid component
  const rows = Array.from(new Set(cells.map((c) => c.row))).sort((a, b) => {
    if (a === "Q") return 1;
    if (b === "Q") return -1;
    return a.localeCompare(b);
  });

  const bays = Array.from(new Set(cells.map((c) => c.bay))).sort(
    (a, b) => a - b
  );
  const positions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Create a lookup structure for cells
  const lookup: Record<
    string,
    Record<number, Record<number, WarehouseCell>>
  > = {};
  cells.forEach((c) => {
    lookup[c.row] ||= {};
    lookup[c.row][c.bay] ||= {};
    lookup[c.row][c.bay][c.position] = c;
  });

  // Format ID helper function
  const formatId = (r: string, b: number, p: number) =>
    `${r}${String(b).padStart(2, "0")}.${String(p).padStart(2, "0")}`;

  // Create the grid as a 2D array for Excel
  const gridData = [];
  // Track which cells need which background colors
  const cellStyles: { [key: string]: any } = {};

  // Add header row with bay numbers
  const headerRow = [""];
  bays.forEach((bay) => {
    headerRow.push(String(bay).padStart(2, "0"));
  });
  gridData.push(headerRow);

  let rowIndex = 1; // Start at row 1 (after headers)

  // Add data rows
  rows.forEach((row) => {
    // Add a row label for each row (showing only for position 5)
    positions.forEach((pos) => {
      const dataRow = [];

      // Add row label only for position 5
      if (pos === 5) {
        dataRow.push(row);
      } else {
        dataRow.push("");
      }

      // Add cell data for each bay
      bays.forEach((bay, colIndex) => {
        const cell = lookup[row]?.[bay]?.[pos];
        if (cell) {
          dataRow.push(formatId(row, bay, pos));

          // Track cell style based on status and role
          const cellRef = XLSX.utils.encode_cell({
            r: rowIndex,
            c: colIndex + 1,
          });

          // Set background color based on cell status and role
          if (cell.status === "OCCUPIED") {
            cellStyles[cellRef] = { fill: { fgColor: { rgb: "0000FF" } } }; // Blue for occupied
          } else if (cell.status === "AVAILABLE") {
            switch (cell.cell_role) {
              case "DAMAGED":
                cellStyles[cellRef] = { fill: { fgColor: { rgb: "FFC0CB" } } }; // Light red (rose) for damaged
                break;
              case "EXPIRED":
                cellStyles[cellRef] = { fill: { fgColor: { rgb: "FFE4B5" } } }; // Light amber for expired
                break;
              default:
                cellStyles[cellRef] = { fill: { fgColor: { rgb: "FFFFFF" } } }; // White for available
            }
          } else {
            cellStyles[cellRef] = { fill: { fgColor: { rgb: "D3D3D3" } } }; // Light gray for other
          }
        } else {
          dataRow.push("");
          // Gray background for empty cells
          const cellRef = XLSX.utils.encode_cell({
            r: rowIndex,
            c: colIndex + 1,
          });
          cellStyles[cellRef] = { fill: { fgColor: { rgb: "F0F0F0" } } }; // Light gray for empty
        }
      });

      gridData.push(dataRow);
      rowIndex++;
    });

    // Add a spacer row between main rows
    if (row !== rows[rows.length - 1]) {
      const spacerRow = Array(bays.length + 1).fill("");
      gridData.push(spacerRow);
      rowIndex++;
    }
  });

  // Create worksheet from the grid data
  const worksheet = XLSX.utils.aoa_to_sheet(gridData);

  // Apply cell styles
  worksheet["!cols"] = Array(bays.length + 1).fill({ wch: 10 });

  // Apply the tracked cell styles to the worksheet
  for (const cellRef in cellStyles) {
    if (!worksheet[cellRef]) worksheet[cellRef] = { v: "" };
    worksheet[cellRef].s = cellStyles[cellRef];
  }

  // Create workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouse Grid");

  // Add a legend sheet
  const legendData = [
    [i18next.t("warehouse:legend")],
    [i18next.t("warehouse:color"), i18next.t("warehouse:meaning")],
    [i18next.t("warehouse:blue"), i18next.t("warehouse:occupied")],
    [i18next.t("warehouse:white"), i18next.t("warehouse:available")],
    [i18next.t("warehouse:light_red"), i18next.t("warehouse:damaged_section")],
    [
      i18next.t("warehouse:light_amber"),
      i18next.t("warehouse:expired_section"),
    ],
    [
      i18next.t("warehouse:light_gray"),
      i18next.t("warehouse:empty_unavailable"),
    ],
  ];

  const legendSheet = XLSX.utils.aoa_to_sheet(legendData);
  XLSX.utils.book_append_sheet(workbook, legendSheet, "Legend");

  // Add a detailed data sheet
  const detailedData = cells.map((cell) => ({
    Location: `${cell.row}${String(cell.bay).padStart(2, "0")}.${String(
      cell.position
    ).padStart(2, "0")}`,
    Row: cell.row,
    Bay: cell.bay,
    Position: cell.position,
    Status: cell.status,
    Role: cell.cell_role || "STANDARD",
    Capacity: cell.capacity,
    CurrentUsage: cell.currentUsage,
  }));
  const detailSheet = XLSX.utils.json_to_sheet(detailedData);
  XLSX.utils.book_append_sheet(workbook, detailSheet, "Detailed Data");

  // Generate Excel file
  XLSX.writeFile(
    workbook,
    `${warehouseName}-Grid-${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

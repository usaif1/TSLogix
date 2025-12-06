import api from "./axios.config";
import type { MasterReportFilters, MasterReportResponse } from "@/types";

/**
 * Master Report API Service
 * Handles all master report related API calls
 */
class MasterReportService {
  /**
   * Get Master Report data
   */
  async getMasterReport(
    filters: MasterReportFilters
  ): Promise<MasterReportResponse> {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.date_from) params.append("date_from", filters.date_from);
      if (filters.date_to) params.append("date_to", filters.date_to);
      if (filters.date_filter_type)
        params.append("date_filter_type", filters.date_filter_type);
      if (filters.customer_name)
        params.append("customer_name", filters.customer_name);
      if (filters.customer_code)
        params.append("customer_code", filters.customer_code);
      if (filters.product_name)
        params.append("product_name", filters.product_name);
      if (filters.product_code)
        params.append("product_code", filters.product_code);
      if (filters.supplier_name)
        params.append("supplier_name", filters.supplier_name);
      if (filters.supplier_code)
        params.append("supplier_code", filters.supplier_code);
      if (filters.include_unallocated !== undefined) {
        params.append(
          "include_unallocated",
          filters.include_unallocated.toString()
        );
      }

      console.log("🔄 Fetching master report with filters:", filters);

      const response = await api.get(`/reports/master?${params.toString()}`);

      console.log("✅ Master report data received:", {
        totalRecords: response.data.total_records,
        processingTime: response.data.processing_time_ms,
        userRole: response.data.user_role,
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching master report:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch master report"
      );
    }
  }

  /**
   * Export Master Report to Excel
   */
  async exportMasterReportToExcel(filters: MasterReportFilters): Promise<Blob> {
    try {
      console.log("📊 Exporting master report to Excel with filters:", filters);

      // Get the report data first
      const reportData = await this.getMasterReport(filters);

      if (!reportData.success) {
        throw new Error(
          reportData.message || "Failed to get report data for export"
        );
      }

      // Use dynamic import for XLSX to avoid bundle bloat
      const XLSX = await import("xlsx");

      // Prepare data for Excel export
      const exportData = this.prepareDataForExcel(reportData);

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();

      // Main data sheet
      const mainSheet = XLSX.utils.json_to_sheet(exportData.mainData);
      XLSX.utils.book_append_sheet(workbook, mainSheet, "Master Report");

      // Summary sheet
      const summarySheet = XLSX.utils.json_to_sheet([exportData.summary]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      // Metadata sheet
      const metadataSheet = XLSX.utils.json_to_sheet([exportData.metadata]);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, "Report Info");

      // Auto-size columns for better readability
      this.autoSizeColumns(mainSheet, XLSX);
      this.autoSizeColumns(summarySheet, XLSX);
      this.autoSizeColumns(metadataSheet, XLSX);

      // Generate file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      console.log("✅ Excel export completed");
      return blob;
    } catch (error: any) {
      console.error("❌ Error exporting master report to Excel:", error);
      throw new Error(
        error.message || "Failed to export master report to Excel"
      );
    }
  }

  /**
   * Export Master Report to PDF
   */
  async exportMasterReportToPDF(filters: MasterReportFilters): Promise<Blob> {
    try {
      console.log("📄 Exporting master report to PDF with filters:", filters);

      // Get the report data first
      const reportData = await this.getMasterReport(filters);

      if (!reportData.success) {
        throw new Error(
          reportData.message || "Failed to get report data for export"
        );
      }

      // Use dynamic imports for PDF libraries
<<<<<<< HEAD
      const [jsPDF] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
=======
      const { default: jsPDF } = await import("jspdf");
      // Import autoTable to extend jsPDF prototype
      await import("jspdf-autotable");
>>>>>>> origin/dev

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      }) as any;

      // Add title
      doc.setFontSize(16);
      doc.text("TSLogix Master Report", 20, 20);

      // Add generation info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
      doc.text(`Total Records: ${reportData.total_records}`, 20, 35);
      doc.text(`Processing Time: ${reportData.processing_time_ms}ms`, 120, 35);

      // Prepare table data
      const tableData = this.prepareDataForPDF(reportData);

      // Add main table
      doc.autoTable({
        head: [tableData.headers],
        body: tableData.rows,
        startY: 45,
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 15 }, // Customer Code
          1: { cellWidth: 25 }, // Customer Name
          2: { cellWidth: 15 }, // Product Code
          3: { cellWidth: 25 }, // Product Name
          // Add more column widths as needed
        },
        margin: { left: 10, right: 10 },
      });

      // Add summary on new page
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Summary Statistics", 20, 20);

      const summaryY = 30;
      doc.setFontSize(10);
      doc.text(
        `Total Transactions: ${reportData.summary.total_transactions}`,
        20,
        summaryY
      );
      doc.text(
        `Dispatched: ${reportData.summary.dispatched_transactions}`,
        20,
        summaryY + 7
      );
      doc.text(
        `In Stock: ${reportData.summary.in_stock_transactions}`,
        20,
        summaryY + 14
      );
      doc.text(
        `Total Entry Quantity: ${reportData.summary.total_entry_quantity}`,
        20,
        summaryY + 21
      );
      doc.text(
        `Total Dispatch Quantity: ${reportData.summary.total_dispatch_quantity}`,
        20,
        summaryY + 28
      );
      doc.text(
        `Total Entry Value: ${reportData.summary.total_entry_value}`,
        20,
        summaryY + 35
      );
      doc.text(
        `Total Dispatch Value: ${reportData.summary.total_dispatch_value}`,
        20,
        summaryY + 42
      );
      doc.text(
        `Unique Products: ${reportData.summary.unique_products}`,
        120,
        summaryY
      );
      doc.text(
        `Unique Customers: ${reportData.summary.unique_customers}`,
        120,
        summaryY + 7
      );
      doc.text(
        `Unique Suppliers: ${reportData.summary.unique_suppliers}`,
        120,
        summaryY + 14
      );
      doc.text(
        `Avg Days to Dispatch: ${reportData.summary.average_days_to_dispatch}`,
        120,
        summaryY + 21
      );

      const pdfBlob = doc.output("blob");
      console.log("✅ PDF export completed");
      return pdfBlob;
    } catch (error: any) {
      console.error("❌ Error exporting master report to PDF:", error);
      throw new Error(error.message || "Failed to export master report to PDF");
    }
  }

  /**
   * Prepare data for Excel export
   */
  private prepareDataForExcel(reportData: MasterReportResponse) {
    const mainData = reportData.data.map((item) => ({
      "Customer Code": item.customer_code,
      "Customer Name": item.customer_name,
      "Product Code": item.product_code,
      "Product Name": item.product_name,
      "Product Category": item.product_category,
      "Packing Type": item.packing_type,
      "Packing Condition": item.packing_condition,
      "Entry Order Number": item.entry_order_number,
      "Entry Order Date": item.entry_order_date,
      "Entry Order Guia": item.entry_order_guia,
      "Entry Transport Guia": item.entry_order_transport_guia,
      "Entry Quantity": item.entry_order_quantity,
      "Entry Unit Cost": item.entry_order_unit_cost,
      "Entry Total Cost": item.entry_order_total_cost,
      "Entry Currency": item.entry_order_currency,
      "Entry Supplier Code": item.entry_order_supplier_code,
      "Entry Supplier Name": item.entry_order_supplier_name,
      "Dispatch Order Number": item.dispatch_order_number,
      "Dispatch Order Date": item.dispatch_order_date,
      "Dispatch Order Guia": item.dispatch_order_guia,
      "Dispatch Transport Guia": item.dispatch_order_transport_guia,
      "Dispatch Quantity": item.dispatch_order_quantity,
      "Dispatch Unit Cost": item.dispatch_order_unit_cost,
      "Dispatch Total Cost": item.dispatch_order_total_cost,
      "Dispatch Currency": item.dispatch_order_currency,
      "Dispatch Customer Address": item.dispatch_order_customer_address,
      "Order Receiver (TSL)": item.order_receiver_from_tsl,
      "Order Dispatcher (TSL)": item.order_dispatcher_from_tsl,
      "Lot Number": item.lot_number,
      "Expiry Date": item.expiry_date,
      "Warehouse Location": item.warehouse_location,
      "Quality Status": item.quality_status,
      "Transaction Type": item.transaction_type,
      "Entry to Dispatch Days": item.entry_to_dispatch_days,
      Remarks: item.remarks,
      Observations: item.observations,
    }));

    const summary = {
      "Total Transactions": reportData.summary.total_transactions,
      "Dispatched Transactions": reportData.summary.dispatched_transactions,
      "In Stock Transactions": reportData.summary.in_stock_transactions,
      "Total Entry Quantity": reportData.summary.total_entry_quantity,
      "Total Dispatch Quantity": reportData.summary.total_dispatch_quantity,
      "Total Entry Value": reportData.summary.total_entry_value,
      "Total Dispatch Value": reportData.summary.total_dispatch_value,
      "Unique Products": reportData.summary.unique_products,
      "Unique Customers": reportData.summary.unique_customers,
      "Unique Suppliers": reportData.summary.unique_suppliers,
      "Average Days to Dispatch": reportData.summary.average_days_to_dispatch,
    };

    const metadata = {
      "Report Type": "Master Report",
      "Generated At": reportData.report_generated_at,
      "User Role": reportData.user_role,
      "Processing Time (ms)": reportData.processing_time_ms,
      "Total Records": reportData.total_records,
      "Filters Applied": JSON.stringify(reportData.filters_applied),
    };

    return { mainData, summary, metadata };
  }

  /**
   * Prepare data for PDF export
   */
  private prepareDataForPDF(reportData: MasterReportResponse) {
    const headers = [
      "Customer Code",
      "Customer Name",
      "Product Code",
      "Product Name",
      "Entry Order",
      "Entry Date",
      "Entry Qty",
      "Dispatch Order",
      "Dispatch Date",
      "Dispatch Qty",
      "Transaction Type",
    ];

    const rows = reportData.data.map((item) => [
      item.customer_code,
      item.customer_name,
      item.product_code,
      item.product_name,
      item.entry_order_number,
      item.entry_order_date,
      item.entry_order_quantity.toString(),
      item.dispatch_order_number,
      item.dispatch_order_date,
      item.dispatch_order_quantity.toString(),
      item.transaction_type,
    ]);

    return { headers, rows };
  }

  /**
   * Auto-size columns for Excel sheets
   */
  private async autoSizeColumns(sheet: any, XLSX: any) {
    const range = sheet["!ref"];
    if (!range) return;

    const cols: any[] = [];
    const range_obj = XLSX.utils.decode_range(range);

    for (let col = range_obj.s.c; col <= range_obj.e.c; col++) {
      let max_width = 10;
      for (let row = range_obj.s.r; row <= range_obj.e.r; row++) {
        const cell_address = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[cell_address];
        if (cell && cell.v) {
          const cell_width = cell.v.toString().length;
          max_width = Math.max(max_width, cell_width);
        }
      }
      cols[col] = { width: Math.min(max_width + 2, 50) };
    }

    sheet["!cols"] = cols;
  }
}

export default new MasterReportService();

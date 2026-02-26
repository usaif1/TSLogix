import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReportsStore } from "../../store/reportsStore";
import { ReportFilters } from "../../api/reportsService";
import { AuthStore } from "@/globalStore";
import Button from "@/components/Button";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import LoaderSync from "@/components/Loaders/LoaderSync";
import WarehouseReport from "./WarehouseReport";
import ProductCategoryReport from "./ProductCategoryReport";
import ProductWiseReport from "./ProductWiseReport";
import CardexReport from "./CardexReport";
import MasterReport from "../../components/MasterReport";
import MasterStatusReport from "./MasterStatusReport";
import MasterOccupancyReport from "./MasterOccupancyReport";
import StockInReport from "./StockInReport";
import StockOutReport from "./StockOutReport";

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { authUser } = AuthStore();
  const {
    selectedReportType,
    setSelectedReportType,
    filters,
    setFilters,
    clearFilters: clearStoreFilters,
    isLoading,
    loadingStates,
    fetchWarehouseReports,
    fetchProductCategoryReports,
    fetchProductWiseReports,
    fetchCardexReports,
    fetchMasterReports,
    fetchMasterStatusReports,
    fetchMasterOccupancyReports,
    fetchStockInReports,
    fetchStockOutReports,
    masterReports,
  } = useReportsStore();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [dateFilterType, setDateFilterType] = useState<
    "entry" | "dispatch" | "both"
  >("dispatch");
  const [includeUnallocated, setIncludeUnallocated] = useState(false);
  const [qualityStatus, setQualityStatus] = useState("");

  // Get user role from authUser or localStorage as fallback
  const userRole = authUser?.role || localStorage.getItem("role") || "";

  // Helper function to check if user is a client
  const isClient = () => {
    return userRole === "CLIENT" || userRole === "client";
  };

  // Report type options based on user role
  const allReportTypes = [
    {
      key: "warehouse",
      label:
        t("reports:warehouse_report_title") ||
        t("reports:warehouse_report") ||
        "Reporte de Almacén",
    },
    {
      key: "product-category",
      label:
        t("reports:product_category_report_title") ||
        t("reports:product_category_report") ||
        "Reporte de Categoría de Productos",
    },
    {
      key: "product-wise",
      label:
        t("reports:product_wise_report_title") ||
        t("reports:product_wise_report") ||
        "Reporte de Productos por Movimiento",
    },
    {
      key: "cardex",
      label:
        t("reports:cardex_report_title") ||
        t("reports:cardex_report") ||
        "Reporte Cardex",
    },
    {
      key: "master",
      label:
        t("reports:master_report_title") ||
        t("reports:master_report") ||
        "Reporte de Movimientos",
    },
    {
      key: "master-status",
      label: t("reports:master_status_report_title") || "Reporte de Estatus",
    },
    {
      key: "master-occupancy",
      label: t("reports:master_occupancy_report_title") || "Reporte de Posiciones",
    },
    {
      key: "stock-in",
      label: t("reports:stock_in_report_title") || "Reporte de Ingresos",
    },
    {
      key: "stock-out",
      label: t("reports:stock_out_report_title") || "Reporte de Salidas",
    },
  ];

  // Filter reports based on user role
  const reportTypes = isClient()
    ? allReportTypes.filter(
        (report) => report.key === "cardex" || report.key === "product-wise",
      )
    : allReportTypes;

  // Apply filters and fetch data
  const applyFilters = () => {
    const newFilters: ReportFilters = {};

    if (dateFrom) newFilters.date_from = dateFrom;
    if (dateTo) newFilters.date_to = dateTo;
    if (customerName) newFilters.customer_name = customerName;
    if (customerCode) newFilters.customer_code = customerCode;
    if (productName) newFilters.product_name = productName;
    if (productCode) newFilters.product_code = productCode;

    setFilters(newFilters);

    // Fetch data based on selected report type
    switch (selectedReportType) {
      case "warehouse":
        fetchWarehouseReports(newFilters);
        break;
      case "product-category":
        fetchProductCategoryReports(newFilters);
        break;
      case "product-wise":
        fetchProductWiseReports(newFilters);
        break;
      case "cardex":
        fetchCardexReports(newFilters);
        break;
      case "master":
        const masterFilters = {
          ...newFilters,
          supplier_name: supplierName,
          supplier_code: supplierCode,
          date_filter_type: dateFilterType,
          include_unallocated: includeUnallocated,
        };
        fetchMasterReports(masterFilters);
        break;
      case "master-status":
        const masterStatusFilters = {
          ...newFilters,
          quality_status: qualityStatus || undefined,
        };
        fetchMasterStatusReports(masterStatusFilters);
        break;
      case "master-occupancy":
        fetchMasterOccupancyReports({});
        break;
      case "stock-in":
        fetchStockInReports(newFilters);
        break;
      case "stock-out":
        fetchStockOutReports(newFilters);
        break;
    }
  };

  // Clear filters
  const clearFilters = () => {
    // Clear local state
    setDateFrom("");
    setDateTo("");
    setCustomerName("");
    setCustomerCode("");
    setProductName("");
    setProductCode("");
    setSupplierName("");
    setSupplierCode("");
    setDateFilterType("dispatch");
    setIncludeUnallocated(false);
    setQualityStatus("");

    // Clear store filters
    clearStoreFilters();

    // Fetch data with empty filters
    const emptyFilters = {};
    switch (selectedReportType) {
      case "warehouse":
        fetchWarehouseReports(emptyFilters);
        break;
      case "product-category":
        fetchProductCategoryReports(emptyFilters);
        break;
      case "product-wise":
        fetchProductWiseReports(emptyFilters);
        break;
      case "cardex":
        fetchCardexReports(emptyFilters);
        break;
      case "master":
        fetchMasterReports(emptyFilters);
        break;
      case "master-status":
        fetchMasterStatusReports(emptyFilters);
        break;
      case "master-occupancy":
        fetchMasterOccupancyReports({});
        break;
      case "stock-in":
        fetchStockInReports(emptyFilters);
        break;
      case "stock-out":
        fetchStockOutReports(emptyFilters);
        break;
    }
  };

  // Handle report type change
  const handleReportTypeChange = (
    type:
      | "warehouse"
      | "product-category"
      | "product-wise"
      | "cardex"
      | "master"
      | "master-status"
      | "master-occupancy"
      | "stock-in"
      | "stock-out",
  ) => {
    setSelectedReportType(type);
    // Clear previous data when switching report types
    switch (type) {
      case "product-category":
        fetchProductCategoryReports(filters);
        break;
      case "product-wise":
        fetchProductWiseReports(filters);
        break;
      case "warehouse":
        fetchWarehouseReports(filters);
        break;
      case "cardex":
        fetchCardexReports(filters);
        break;
      case "master":
        const masterFilters = {
          ...filters,
          supplier_name: supplierName,
          supplier_code: supplierCode,
          date_filter_type: dateFilterType,
          include_unallocated: includeUnallocated,
        };
        fetchMasterReports(masterFilters);
        break;
      case "master-status":
        const masterStatusFilters = {
          ...filters,
          quality_status: qualityStatus || undefined,
        };
        fetchMasterStatusReports(masterStatusFilters);
        break;
      case "master-occupancy":
        fetchMasterOccupancyReports({});
        break;
      case "stock-in":
        fetchStockInReports(filters);
        break;
      case "stock-out":
        fetchStockOutReports(filters);
        break;
    }
  };

  // Initialize with current month dates
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const defaultDateFrom = firstDay.toISOString().split("T")[0];
    const defaultDateTo = lastDay.toISOString().split("T")[0];

    setDateFrom(defaultDateFrom);
    setDateTo(defaultDateTo);

    // Apply initial filters with default dates
    const initialFilters: ReportFilters = {
      date_from: defaultDateFrom,
      date_to: defaultDateTo,
    };
    setFilters(initialFilters);

    // Load initial data based on selected report type
    setTimeout(() => {
      switch (selectedReportType) {
        case "warehouse":
          fetchWarehouseReports(initialFilters);
          break;
        case "product-category":
          fetchProductCategoryReports(initialFilters);
          break;
        case "product-wise":
          fetchProductWiseReports(initialFilters);
          break;
        case "cardex":
          fetchCardexReports(initialFilters);
          break;
        case "master":
          fetchMasterReports(initialFilters);
          break;
        case "master-status":
          fetchMasterStatusReports(initialFilters);
          break;
        case "master-occupancy":
          fetchMasterOccupancyReports({});
          break;
        case "stock-in":
          fetchStockInReports(initialFilters);
          break;
        case "stock-out":
          fetchStockOutReports(initialFilters);
          break;
      }
    }, 100); // Small delay to ensure state is updated
  }, []);

  // Handle role-based default report selection
  useEffect(() => {
    if (
      isClient() &&
      (selectedReportType === "warehouse" ||
        selectedReportType === "product-category")
    ) {
      // If client tries to access restricted reports, redirect to cardex
      setSelectedReportType("cardex");
    }
  }, [userRole, selectedReportType]);

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <Text
                size="lg"
                weight="font-bold"
                additionalClass="text-gray-900"
              >
                {t("reports:reports") || "Reportes"}
              </Text>
              <Text size="xs" additionalClass="text-gray-600 mt-1">
                {t("reports:reports_description") ||
                  "Gestión y generación de reportes del sistema"}
              </Text>
            </div>

            {/* Report Type Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t("reports:select_report") || "Seleccionar Reporte"}:
              </label>
              <select
                value={selectedReportType}
                onChange={(e) =>
                  handleReportTypeChange(
                    e.target.value as
                      | "warehouse"
                      | "product-category"
                      | "product-wise"
                      | "cardex"
                      | "master"
                      | "master-status"
                      | "master-occupancy"
                      | "stock-in"
                      | "stock-out",
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white min-w-[250px]"
              >
                {reportTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <Text size="sm" weight="font-semibold" additionalClass="mb-2">
            {t("reports:filters") || "Filtros"}
          </Text>

          {/* First Row - Date and Basic Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2">
            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("reports:from_date") || "Fecha Desde"}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("reports:to_date") || "Fecha Hasta"}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Second Row - Customer and Product Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("reports:customer_name") || "Nombre del Cliente"}
              </label>
              <TextInput
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={
                  t("reports:enter_customer_name") ||
                  "Ingrese nombre del cliente"
                }
                className="w-full text-sm"
              />
            </div>

            {/* Customer Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("reports:customer_code") || "Código del Cliente"}
              </label>
              <TextInput
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                placeholder={
                  t("reports:enter_customer_code") ||
                  "Ingrese código del cliente"
                }
                className="w-full text-sm"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("reports:product_name") || "Nombre del Producto"}
              </label>
              <TextInput
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={
                  t("reports:enter_product_name") ||
                  "Ingrese nombre del producto"
                }
                className="w-full text-sm"
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("reports:product_code") || "Código del Producto"}
              </label>
              <TextInput
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder={
                  t("reports:enter_product_code") ||
                  "Ingrese código del producto"
                }
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Third Row - Master Status Report Specific Filters */}
          {selectedReportType === "master-status" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              {/* Quality Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("reports:position_type") || "Tipo de Posición"}
                </label>
                <select
                  value={qualityStatus}
                  onChange={(e) => setQualityStatus(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="">{t("reports:all") || "Todos"}</option>
                  <option value="APROBADO">
                    {t("reports:approved") || "Aprobado"}
                  </option>
                  <option value="CUARENTENA">
                    {t("reports:quarantine") || "Cuarentena"}
                  </option>
                  <option value="RECHAZADOS">
                    {t("reports:rejected") || "Rechazados"}
                  </option>
                  <option value="CONTRAMUESTRAS">
                    {t("reports:sample") || "Contramuestras"}
                  </option>
                  <option value="DEVOLUCIONES">
                    {t("reports:returns") || "Devoluciones"}
                  </option>
                </select>
              </div>
            </div>
          )}

          {/* Fourth Row - Master Report Specific Filters */}
          {selectedReportType === "master" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                {/* Supplier Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("reports:supplier_name") || "Nombre del Proveedor"}
                  </label>
                  <TextInput
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder={
                      t("reports:enter_supplier_name") ||
                      "Ingrese nombre del proveedor"
                    }
                    className="w-full text-sm"
                  />
                </div>

                {/* Supplier Code */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("reports:supplier_code") || "Código del Proveedor"}
                  </label>
                  <TextInput
                    value={supplierCode}
                    onChange={(e) => setSupplierCode(e.target.value)}
                    placeholder={
                      t("reports:enter_supplier_code") ||
                      "Ingrese código del proveedor"
                    }
                    className="w-full text-sm"
                  />
                </div>

                {/* Date Filter Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("reports:date_filter") || "Filtro de Fecha"}
                  </label>
                  <select
                    value={dateFilterType}
                    onChange={(e) =>
                      setDateFilterType(
                        e.target.value as "entry" | "dispatch" | "both",
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="dispatch">
                      {t("reports:dispatch_date") || "Fecha de Despacho"}
                    </option>
                    <option value="entry">
                      {t("reports:entry_date") || "Fecha de Entrada"}
                    </option>
                    <option value="both">
                      {t("reports:both_dates") || "Ambas Fechas"}
                    </option>
                  </select>
                </div>

                {/* Include Unallocated */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("reports:filter_options") || "Opciones"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeUnallocated"
                      checked={includeUnallocated}
                      onChange={(e) => setIncludeUnallocated(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="includeUnallocated"
                      className="text-xs text-gray-700"
                    >
                      {t("reports:include_unallocated") ||
                        "Incluir No Asignados"}
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              onClick={clearFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-xs"
            >
              {t("reports:clear_filters") || "Limpiar Filtros"}
            </Button>
            <Button
              onClick={applyFilters}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
            >
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <LoaderSync loaderText="" />
                  <span>{t("reports:loading") || "Cargando..."}</span>
                </div>
              ) : (
                t("reports:apply_filters") || "Aplicar Filtros"
              )}
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div
          className="bg-white rounded-lg shadow-sm"
          style={{ minHeight: "75vh" }}
        >
          {loadingStates[`${selectedReportType}-reports`] ? (
            <div className="p-4 text-center">
              <LoaderSync
                loaderText={
                  t("reports:loading_report") || "Cargando reporte..."
                }
              />
            </div>
          ) : (
            <>
              {selectedReportType === "warehouse" && <WarehouseReport />}
              {selectedReportType === "product-category" && (
                <ProductCategoryReport />
              )}
              {selectedReportType === "product-wise" && <ProductWiseReport />}
              {selectedReportType === "cardex" && <CardexReport />}
              {selectedReportType === "master" && masterReports && (
                <MasterReport
                  data={masterReports.data || []}
                  summary={masterReports.summary}
                  filters={{
                    date_from: dateFrom,
                    date_to: dateTo,
                    customer_name: customerName,
                    customer_code: customerCode,
                    product_name: productName,
                    product_code: productCode,
                    supplier_name: supplierName,
                    supplier_code: supplierCode,
                    date_filter_type: dateFilterType,
                    include_unallocated: includeUnallocated,
                  }}
                  isLoading={loadingStates["master-reports"] || false}
                />
              )}
              {selectedReportType === "master-status" && <MasterStatusReport />}
              {selectedReportType === "master-occupancy" && (
                <MasterOccupancyReport />
              )}
              {selectedReportType === "stock-in" && <StockInReport />}
              {selectedReportType === "stock-out" && <StockOutReport />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

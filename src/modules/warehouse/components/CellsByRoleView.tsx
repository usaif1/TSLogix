/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Components
import { Button, Text, LoaderSync } from "@/components";
import CellRoleChangeModal from "./CellRoleChangeModal";
import CellHistoryModal from "./CellHistoryModal";

// Services and Store
import { WarehouseCellService, CellsByRole } from "@/modules/warehouse/api/warehouse.service";
import useWarehouseCellStore from "@/modules/warehouse/store";

interface CellsByRoleViewProps {
  warehouseId?: string;
}

const CellsByRoleView: React.FC<CellsByRoleViewProps> = ({ warehouseId }) => {
  const { t } = useTranslation(['warehouse', 'common']);

  // Store state
  const loaders = useWarehouseCellStore.use.loaders();
  const isLoading = loaders['cells/fetch-by-role'];

  // Local state
  const [cellsByRole, setCellsByRole] = useState<CellsByRole>({});
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(['STANDARD']));

  // Load cells by role when component mounts or warehouse changes
  useEffect(() => {
    loadCellsByRole();
  }, [warehouseId]);

  const loadCellsByRole = async () => {
    try {
      console.log("Loading cells by role for warehouse:", warehouseId);
      const data = await WarehouseCellService.getCellsByRole(warehouseId);
      console.log("Received cellsByRole data:", data);
      setCellsByRole(data);
    } catch (error: any) {
      console.error("Error loading cells by role:", error);
      toast.error(error.message || t('failed_to_load_cells_by_role'));
    }
  };

  const handleRoleChangeSuccess = () => {
    loadCellsByRole(); // Refresh the data
  };

  const handleChangeRole = (cell: any) => {
    setSelectedCell(cell);
    setShowRoleChangeModal(true);
  };

  const handleViewHistory = (cell: any) => {
    setSelectedCell(cell);
    setShowHistoryModal(true);
  };

  const toggleRoleExpansion = (role: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  const getRoleLabel = (role: string) => {
    const purposes = WarehouseCellService.getQualityPurposes();
    const purpose = purposes.find(p => p.value === role);
    // Use Spanish label for better localization
    return purpose ? purpose.labelEs : role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'STANDARD': 'blue',
      'REJECTED': 'red',
      'SAMPLES': 'yellow',
      'RETURNS': 'orange',
      'DAMAGED': 'purple',
      'EXPIRED': 'gray',
    };
    return colorMap[role] || 'gray';
  };

  const getRoleIcon = (role: string) => {
    const iconMap: Record<string, string> = {
      'STANDARD': '📦',
      'REJECTED': '❌',
      'SAMPLES': '🧪',
      'RETURNS': '↩️',
      'DAMAGED': '💥',
      'EXPIRED': '⏰',
    };
    return iconMap[role] || '📋';
  };

  // Check if user can change roles
  const userRole = localStorage.getItem("role");
  const canChangeRole = userRole === "ADMIN";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderSync />
        <Text additionalClass="ml-3">{t('common:loading')}</Text>
      </div>
    );
  }

  const roleEntries = Object.entries(cellsByRole);

  if (roleEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <Text additionalClass="text-gray-500">
          {t('no_cells_found')}
        </Text>
        <div className="mt-4 text-xs text-gray-400">
          <pre>Debug - cellsByRole: {JSON.stringify(cellsByRole, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Text size="2xl" weight="font-bold">
            {t('cells_by_quality_purpose')}
          </Text>
          <div className="text-xs text-gray-400">
            Debug - Roles found: {roleEntries.map(([key, data]) => `${key}(${data.count})`).join(', ')}
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={loadCellsByRole}
          disabled={isLoading}
          additionalClass="flex items-center"
        >
          {isLoading && <LoaderSync size="sm" additionalClass="mr-2" />}
          {t('refresh')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {roleEntries.map(([roleKey, roleData]) => {
          const color = getRoleColor(roleData.role);
          
          // Use explicit color classes instead of dynamic ones
          let cardClasses = "rounded-lg p-4";
          let titleClasses = "";
          let countClasses = "";
          let subtitleClasses = "";
          
          switch (color) {
            case 'blue':
              cardClasses += " bg-blue-50 border border-blue-200";
              titleClasses = "text-blue-800";
              countClasses = "text-blue-900";
              subtitleClasses = "text-blue-600";
              break;
            case 'red':
              cardClasses += " bg-red-50 border border-red-200";
              titleClasses = "text-red-800";
              countClasses = "text-red-900";
              subtitleClasses = "text-red-600";
              break;
            case 'yellow':
              cardClasses += " bg-yellow-50 border border-yellow-200";
              titleClasses = "text-yellow-800";
              countClasses = "text-yellow-900";
              subtitleClasses = "text-yellow-600";
              break;
            case 'orange':
              cardClasses += " bg-orange-50 border border-orange-200";
              titleClasses = "text-orange-800";
              countClasses = "text-orange-900";
              subtitleClasses = "text-orange-600";
              break;
            case 'purple':
              cardClasses += " bg-purple-50 border border-purple-200";
              titleClasses = "text-purple-800";
              countClasses = "text-purple-900";
              subtitleClasses = "text-purple-600";
              break;
            default:
              cardClasses += " bg-gray-50 border border-gray-200";
              titleClasses = "text-gray-800";
              countClasses = "text-gray-900";
              subtitleClasses = "text-gray-600";
              break;
          }
          
          return (
            <div key={roleKey} className={cardClasses}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getRoleIcon(roleData.role)}</span>
                    <Text size="sm" weight="font-medium" additionalClass={titleClasses}>
                      {getRoleLabel(roleData.role)}
                    </Text>
                  </div>
                  <Text size="2xl" weight="font-bold" additionalClass={countClasses}>
                    {roleData.count}
                  </Text>
                  <Text size="xs" additionalClass={subtitleClasses}>
                    celdas
                  </Text>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View by Role */}
      <div className="space-y-4">
        {roleEntries.map(([roleKey, roleData]) => {
          const isExpanded = expandedRoles.has(roleKey);
          const color = getRoleColor(roleData.role);
          
          // Use explicit color classes instead of dynamic ones
          let headerClasses = "p-4 cursor-pointer transition-colors";
          let headerHoverClasses = "";
          let titleClasses = "";
          let subtitleClasses = "";
          let buttonClasses = "";
          
          switch (color) {
            case 'blue':
              headerClasses += " bg-blue-50";
              headerHoverClasses = " hover:bg-blue-100";
              titleClasses = "text-blue-900";
              subtitleClasses = "text-blue-700";
              buttonClasses = "text-blue-600 hover:text-blue-800";
              break;
            case 'red':
              headerClasses += " bg-red-50";
              headerHoverClasses = " hover:bg-red-100";
              titleClasses = "text-red-900";
              subtitleClasses = "text-red-700";
              buttonClasses = "text-red-600 hover:text-red-800";
              break;
            case 'yellow':
              headerClasses += " bg-yellow-50";
              headerHoverClasses = " hover:bg-yellow-100";
              titleClasses = "text-yellow-900";
              subtitleClasses = "text-yellow-700";
              buttonClasses = "text-yellow-600 hover:text-yellow-800";
              break;
            case 'orange':
              headerClasses += " bg-orange-50";
              headerHoverClasses = " hover:bg-orange-100";
              titleClasses = "text-orange-900";
              subtitleClasses = "text-orange-700";
              buttonClasses = "text-orange-600 hover:text-orange-800";
              break;
            case 'purple':
              headerClasses += " bg-purple-50";
              headerHoverClasses = " hover:bg-purple-100";
              titleClasses = "text-purple-900";
              subtitleClasses = "text-purple-700";
              buttonClasses = "text-purple-600 hover:text-purple-800";
              break;
            default:
              headerClasses += " bg-gray-50";
              headerHoverClasses = " hover:bg-gray-100";
              titleClasses = "text-gray-900";
              subtitleClasses = "text-gray-700";
              buttonClasses = "text-gray-600 hover:text-gray-800";
              break;
          }
          
          return (
            <div key={roleKey} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Role Header */}
              <div 
                className={headerClasses + headerHoverClasses}
                onClick={() => toggleRoleExpansion(roleKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getRoleIcon(roleData.role)}</span>
                    <div>
                      <Text size="lg" weight="font-semibold" additionalClass={titleClasses}>
                        {getRoleLabel(roleData.role)}
                      </Text>
                      <Text size="sm" additionalClass={subtitleClasses}>
                        {t('cells_count', { count: roleData.count })}
                      </Text>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    additionalClass={buttonClasses}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </Button>
                </div>
              </div>

              {/* Cells List */}
              {isExpanded && (
                <div className="p-4">
                  {roleData.cells.length === 0 ? (
                    <Text additionalClass="text-gray-500 text-center py-4">
                      {t('no_cells_in_this_category')}
                    </Text>
                  ) : (
                    <div>
                      {/* Bulk Actions */}
                      {canChangeRole && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Text size="sm" weight="font-medium">
                              Cambio masivo de rol:
                            </Text>
                            <select
                              onChange={(e) => {
                                if (e.target.value && window.confirm(t('confirm_bulk_change_role'))) {
                                  // Handle bulk role change for all cells in this category
                                  console.log(`Bulk change all ${roleData.role} cells to:`, e.target.value);
                                  // TODO: Implement bulk change
                                }
                                e.target.value = ''; // Reset selection
                              }}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                              defaultValue=""
                            >
                              <option value="" disabled>Seleccionar nuevo rol</option>
                              {WarehouseCellService.getQualityPurposes()
                                .filter(purpose => purpose.value !== roleData.role)
                                .map(purpose => (
                                  <option key={purpose.value} value={purpose.value}>
                                    {purpose.labelEs}
                                  </option>
                                ))
                              }
                            </select>
                            <Text size="xs" additionalClass="text-gray-500">
                              ({roleData.cells.length} celdas)
                            </Text>
                          </div>
                        </div>
                      )}

                      {/* Compact Cell Grid - Very small cells in a dense grid */}
                      <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24 gap-1">
                        {roleData.cells.map((cell: any) => (
                          <div 
                            key={cell.id} 
                            className="group relative bg-white border border-gray-200 rounded-sm p-0.5 hover:shadow-md transition-all cursor-pointer w-full aspect-square min-h-[24px]"
                            title={`${cell.cell_code || `${cell.row}-${cell.bay}-${cell.position}`}\nEstado: ${cell.status}\nCapacidad: ${cell.capacity}\nUso: ${cell.currentUsage || 0}`}
                          >
                            {/* Cell Code - Very compact */}
                            <div className="text-[6px] font-mono font-bold text-center leading-none truncate">
                              {cell.cell_code ? cell.cell_code.replace(/[^0-9]/g, '').slice(-3) : `${cell.row}${cell.bay}${cell.position}`.slice(-3)}
                            </div>
                            
                            {/* Status Indicator */}
                            <div className={`w-full h-0.5 rounded-sm mt-0.5 ${
                              cell.status === 'OCCUPIED' ? 'bg-red-500' :
                              cell.status === 'AVAILABLE' ? 'bg-green-500' :
                              'bg-gray-400'
                            }`}></div>

                            {/* Hover Actions */}
                            <div className="absolute top-0 left-0 right-0 bg-white border border-gray-300 rounded shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none group-hover:pointer-events-auto">
                              <div className="text-xs space-y-1">
                                <div className="font-semibold">
                                  {cell.cell_code || `${cell.row}-${cell.bay}-${cell.position}`}
                                </div>
                                <div className="text-gray-600">
                                  Estado: {cell.status === 'OCCUPIED' ? 'Ocupado' : cell.status === 'AVAILABLE' ? 'Disponible' : cell.status}
                                </div>
                                <div className="text-gray-600">
                                  Capacidad: {cell.capacity}
                                </div>
                                <div className="text-gray-600">
                                  Uso: {cell.currentUsage || 0}
                                </div>
                                <div className="flex gap-1 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewHistory(cell);
                                    }}
                                    className="text-[10px] px-1 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
                                  >
                                    Historial
                                  </button>
                                  {canChangeRole && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleChangeRole(cell);
                                      }}
                                      className="text-[10px] px-1 py-0.5 bg-blue-100 hover:bg-blue-200 rounded"
                                    >
                                      Cambiar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedCell && (
        <>
          <CellRoleChangeModal
            cell={selectedCell}
            isOpen={showRoleChangeModal}
            onClose={() => {
              setShowRoleChangeModal(false);
              setSelectedCell(null);
            }}
            onSuccess={handleRoleChangeSuccess}
          />
          
          <CellHistoryModal
            cell={selectedCell}
            isOpen={showHistoryModal}
            onClose={() => {
              setShowHistoryModal(false);
              setSelectedCell(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default CellsByRoleView;
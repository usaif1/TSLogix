/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useTranslation } from "react-i18next";
// Using emoji icons instead of lucide-react

interface DashboardStats {
  totalEntries: number;
  totalDepartures: number;
  totalTransfers: number;
  totalAdjustments: number;
  totalQuantity: number;
  totalPackages: number;
  totalWeight: number;
  totalVolume: number;
  recentActivity: number;
}

interface InventoryLogDashboardProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const InventoryLogDashboard: React.FC<InventoryLogDashboardProps> = ({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation(['inventory', 'common']);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo';
    subtitle?: string;
  }> = ({ title, value, icon, trend, trendValue, color, subtitle }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
      green: 'from-green-500 to-green-600 bg-green-50 text-green-600 border-green-200',
      red: 'from-red-500 to-red-600 bg-red-50 text-red-600 border-red-200',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200',
      orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-600 border-orange-200',
      indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600 border-indigo-200',
    };

    const iconBgClass = colorClasses[color].split(' ')[2] + ' ' + colorClasses[color].split(' ')[3];
    const gradientClass = 'bg-gradient-to-r ' + colorClasses[color].split(' ')[0] + ' ' + colorClasses[color].split(' ')[1];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`p-2 rounded-lg ${iconBgClass}`}>
                <span className="text-lg">{icon}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse bg-gray-200 rounded h-6 w-16 inline-block"></span>
                ) : (
                  typeof value === 'number' ? value.toLocaleString() : value
                )}
              </p>
              
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
              
              {trend && trendValue && (
                <div className="flex items-center space-x-1">
                  <span className={`text-xs ${
                    trend === 'up' ? 'text-green-500' : 
                    trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '📊'}
                  </span>
                  <span className={`text-xs font-medium ${
                    trend === 'up' ? 'text-green-600' : 
                    trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trendValue}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Decorative gradient bar */}
          <div className={`w-1 h-16 rounded-full ${gradientClass} ml-4`}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <span className="text-white text-xl">📊</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Inventory Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Real-time inventory overview
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>

      {/* Movement Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Movement Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Entries"
            value={stats.totalEntries}
            icon="📈"
            color="green"
            trend="up"
            trendValue="+12%"
            subtitle="Goods received"
          />
          
          <StatCard
            title="Total Departures"
            value={stats.totalDepartures}
            icon="📉"
            color="red"
            trend="down"
            trendValue="-8%"
            subtitle="Goods shipped"
          />
          
          <StatCard
            title="Transfers"
            value={stats.totalTransfers}
            icon="🔄"
            color="blue"
            trend="neutral"
            trendValue="stable"
            subtitle="Internal movements"
          />
          
          <StatCard
            title="Adjustments"
            value={stats.totalAdjustments}
            icon="⚖️"
            color="purple"
            trend="up"
            trendValue="+3%"
            subtitle="Inventory corrections"
          />
        </div>
      </div>

      {/* Inventory Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Inventory Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Quantity"
            value={stats.totalQuantity}
            icon="📦"
            color="indigo"
            subtitle="Total items"
          />
          
          <StatCard
            title="Total Packages"
            value={stats.totalPackages}
            icon="📚"
            color="orange"
            subtitle="Packages count"
          />
          
          <StatCard
            title="Total Weight"
            value={`${stats.totalWeight.toLocaleString()} kg`}
            icon="⚖️"
            color="green"
            subtitle="Total weight (kg)"
          />
          
          <StatCard
            title="Total Volume"
            value={`${stats.totalVolume.toLocaleString()} m³`}
            icon="📏"
            color="blue"
            subtitle="Total volume (m³)"
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryLogDashboard; 
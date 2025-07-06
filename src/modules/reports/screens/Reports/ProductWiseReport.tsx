import React from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsStore } from '../../store/reportsStore';
import Text from '@/components/Text';
import Button from '@/components/Button';

const ProductWiseReport: React.FC = () => {
  const { t } = useTranslation();
  const { productWiseReports, exportReport, loadingStates } = useReportsStore();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      await exportReport('product-wise', format);
    } catch (error) {
      console.error('Error exporting product wise report:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text size="xl" weight="font-bold" additionalClass="text-gray-900">
            {t('reports:product_wise_report')}
          </Text>
          <Text size="sm" additionalClass="text-gray-600 mt-1">
            {t('reports:product_wise_report_description')}
          </Text>
        </div>
        
        {/* Export Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => handleExport('excel')}
            disabled={loadingStates['export-report']}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
          >
            {t('reports:export_excel')}
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            disabled={loadingStates['export-report']}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
          >
            {t('reports:export_pdf')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-blue-600 mb-1">
            {t('reports:total_products')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-blue-900">
            {productWiseReports.length}
          </Text>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-green-600 mb-1">
            {t('reports:total_quantity')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-green-900">
            {productWiseReports.reduce((sum, report) => sum + report.total_quantity, 0).toLocaleString()}
          </Text>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-yellow-600 mb-1">
            {t('reports:total_weight')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-yellow-900">
            {productWiseReports.reduce((sum, report) => sum + report.total_weight, 0).toFixed(2)} kg
          </Text>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <Text size="sm" additionalClass="text-purple-600 mb-1">
            {t('reports:total_value')}
          </Text>
          <Text size="2xl" weight="font-bold" additionalClass="text-purple-900">
            ${productWiseReports.reduce((sum, report) => sum + report.total_value, 0).toLocaleString()}
          </Text>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:product_code')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:product_name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:category_name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:total_quantity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:total_weight')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:total_value')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports:locations_count')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productWiseReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {t('reports:no_data_available')}
                  </td>
                </tr>
              ) : (
                productWiseReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Text weight="font-medium" additionalClass="text-gray-900">
                        {report.product_code}
                      </Text>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Text additionalClass="text-gray-900">
                        {report.product_name}
                      </Text>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.total_quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.total_weight.toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${report.total_value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.locations_count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductWiseReport; 
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  title: string;
  headers: string[];
  data: any[][];
  summary?: {
    label: string;
    value: string | number;
  }[];
  metadata?: {
    generatedAt: string;
    filters: Record<string, any>;
    userRole?: string;
  };
}

export const exportToExcel = (exportData: ExportData, filename?: string) => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create main data worksheet
    const wsData = [];
    
    // Add title
    wsData.push([exportData.title]);
    wsData.push([]); // Empty row
    
    // Add summary if provided
    if (exportData.summary && exportData.summary.length > 0) {
      wsData.push(['RESUMEN / SUMMARY']);
      exportData.summary.forEach(item => {
        wsData.push([item.label, item.value]);
      });
      wsData.push([]); // Empty row
    }
    
    // Add headers
    wsData.push(exportData.headers);
    
    // Add data
    exportData.data.forEach(row => {
      wsData.push(row);
    });
    
    // Add metadata if provided
    if (exportData.metadata) {
      wsData.push([]);
      wsData.push(['METADATA']);
      wsData.push(['Generado el / Generated at', exportData.metadata.generatedAt]);
      if (exportData.metadata.userRole) {
        wsData.push(['Rol de usuario / User role', exportData.metadata.userRole]);
      }
      
      // Add filters
      if (exportData.metadata.filters && Object.keys(exportData.metadata.filters).length > 0) {
        wsData.push(['FILTROS APLICADOS / APPLIED FILTERS']);
        Object.entries(exportData.metadata.filters).forEach(([key, value]) => {
          if (value) {
            wsData.push([key, value]);
          }
        });
      }
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Auto-fit columns
    const colWidths = exportData.headers.map((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...exportData.data.map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    
    // Generate filename
    const defaultFilename = `${exportData.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename || defaultFilename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Error al exportar a Excel');
  }
};

export const exportToPDF = (exportData: ExportData, filename?: string) => {
  try {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(exportData.title, 14, yPosition);
    yPosition += 20;
    
    // Add summary if provided
    if (exportData.summary && exportData.summary.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN / SUMMARY', 14, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      exportData.summary.forEach(item => {
        doc.text(`${item.label}: ${item.value}`, 14, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }
    
    // Add table
    autoTable(doc, {
      head: [exportData.headers],
      body: exportData.data,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 10, right: 14, bottom: 10, left: 14 },
      tableWidth: 'auto',
      columnStyles: {},
    });
    
    // Add metadata if provided
    if (exportData.metadata) {
      const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
      let metadataY = finalY + 20;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('METADATA', 14, metadataY);
      metadataY += 8;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el / Generated at: ${exportData.metadata.generatedAt}`, 14, metadataY);
      metadataY += 6;
      
      if (exportData.metadata.userRole) {
        doc.text(`Rol de usuario / User role: ${exportData.metadata.userRole}`, 14, metadataY);
        metadataY += 6;
      }
      
      // Add filters
      if (exportData.metadata.filters && Object.keys(exportData.metadata.filters).length > 0) {
        metadataY += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('FILTROS APLICADOS / APPLIED FILTERS', 14, metadataY);
        metadataY += 6;
        
        doc.setFont('helvetica', 'normal');
        Object.entries(exportData.metadata.filters).forEach(([key, value]) => {
          if (value) {
            doc.text(`${key}: ${value}`, 14, metadataY);
            metadataY += 5;
          }
        });
      }
    }
    
    // Generate filename
    const defaultFilename = `${exportData.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save file
    doc.save(filename || defaultFilename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Error al exportar a PDF');
  }
};

// Helper function to format data for export
export const formatDataForExport = (data: any[], headers: string[], formatters?: Record<string, (value: any) => string>) => {
  return data.map(item => {
    return headers.map((_, index) => {
      const key = Object.keys(item)[index];
      const value = item[key];
      
      if (formatters && formatters[key]) {
        return formatters[key](value);
      }
      
      // Default formatting
      if (value === null || value === undefined) return '';
      if (typeof value === 'number') return value.toLocaleString();
      if (typeof value === 'boolean') return value ? 'Sí' : 'No';
      if (value instanceof Date) return value.toLocaleDateString();
      
      return String(value);
    });
  });
};

// Helper to convert array data to export format
export const convertArrayToExportData = (
  title: string,
  headers: string[],
  rows: any[][],
  summary?: { label: string; value: string | number }[],
  metadata?: { generatedAt: string; filters: Record<string, any>; userRole?: string }
): ExportData => {
  return {
    title,
    headers,
    data: rows,
    summary,
    metadata
  };
};
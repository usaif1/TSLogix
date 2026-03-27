import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderHeaderInfo {
  title: string;
  orderNo: string;
  headerColor: [number, number, number]; // RGB color for header
}

interface OrderInfoBox {
  label: string;
  value: string;
  valueColor?: [number, number, number]; // Optional color for value
}

interface TableColumn {
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  fontStyle?: 'normal' | 'bold';
}

interface OrderPDFExportOptions {
  headerInfo: OrderHeaderInfo;
  infoBoxes: OrderInfoBox[][]; // Array of rows, each row contains boxes
  tableColumns: TableColumn[];
  tableData: any[][];
  tableTitle: string;
  filename: string;
  themeColor?: [number, number, number]; // RGB color for table header
}

/**
 * Generates a professional PDF for warehouse orders (Entry/Departure)
 * Reusable component with modular design
 */
export const generateOrderPDF = (options: OrderPDFExportOptions): void => {
  const {
    headerInfo,
    infoBoxes,
    tableColumns,
    tableData,
    tableTitle,
    filename,
    themeColor = [52, 73, 94] // Default dark blue-gray
  } = options;

  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // ========== HEADER SECTION ==========
  doc.setFillColor(headerInfo.headerColor[0], headerInfo.headerColor[1], headerInfo.headerColor[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(headerInfo.title, pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order No: ${headerInfo.orderNo}`, pageWidth / 2, 25, { align: 'center' });

  yPosition = 45;

  // ========== ORDER INFORMATION SECTION ==========
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Information', 14, yPosition);

  yPosition += 8;

  // Calculate box dimensions
  const boxesPerRow = infoBoxes[0]?.length || 3;
  const boxWidth = (pageWidth - 28) / boxesPerRow - 4;
  const boxHeight = 22;

  // Draw information boxes
  infoBoxes.forEach((row) => {
    row.forEach((box, colIndex) => {
      const xPos = 14 + colIndex * (pageWidth - 28) / boxesPerRow;

      // Draw box background
      doc.setFillColor(236, 240, 241);
      doc.roundedRect(xPos, yPosition - 5, boxWidth, boxHeight, 2, 2, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 73, 94);
      doc.text(box.label, xPos + 4, yPosition);

      doc.setFont('helvetica', 'normal');
      if (box.valueColor) {
        doc.setTextColor(box.valueColor[0], box.valueColor[1], box.valueColor[2]);
      }
      doc.text(box.value, xPos + 4, yPosition + 6, { maxWidth: boxWidth - 8 });
      doc.setTextColor(52, 73, 94);
    });

    yPosition += boxHeight + 3;
  });

  yPosition += 7;

  // ========== TABLE SECTION ==========
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(tableTitle, 14, yPosition);

  yPosition += 5;

  // Prepare column styles
  const columnStyles: any = {};
  tableColumns.forEach((col, index) => {
    columnStyles[index] = {
      cellWidth: col.width,
      halign: col.align || 'left',
      fontStyle: col.fontStyle || 'normal'
    };
  });

  // Generate table
  autoTable(doc, {
    startY: yPosition,
    head: [tableColumns.map(col => col.header)],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: themeColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [44, 62, 80]
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles,
    margin: { left: 14, right: 14 },
    didDrawPage: (_data: any) => {
      // Footer on each page
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated: ${new Date().toLocaleString()} | Page ${_data.pageNumber}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
    }
  });

  // Save the PDF
  doc.save(filename);
};

/**
 * Helper function to get status color
 */
export const getStatusColor = (status: string): [number, number, number] => {
  const statusColors: Record<string, [number, number, number]> = {
    'TERMINADO': [39, 174, 96],      // Green
    'COMPLETED': [39, 174, 96],      // Green
    'APROBADO': [52, 152, 219],      // Blue
    'APPROVED': [52, 152, 219],      // Blue
    'DISPATCHED': [142, 68, 173],    // Purple
    'RECIBIDO': [155, 89, 182],      // Purple
    'PENDIENTE': [241, 196, 15],     // Yellow
    'PENDING': [241, 196, 15],       // Yellow
    'REJECTED': [231, 76, 60],       // Red
    'REVISION': [230, 126, 34],      // Orange
  };

  return statusColors[status] || [127, 140, 141]; // Default gray
};

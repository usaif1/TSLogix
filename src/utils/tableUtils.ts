import { createColumnHelper, ColumnDef } from '@tanstack/react-table';

/**
 * Helper function to easily create TanStack table columns
 * @param columnDefinitions Array of column definitions
 * @returns Array of ColumnDef objects ready to use with DataTable
 */
export function createTableColumns<T extends object>(
  columnDefinitions: {
    accessor: keyof T | string;
    header: string;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    cell?: (info: any) => React.ReactNode;
  }[]
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
): ColumnDef<T, any>[] {
  const columnHelper = createColumnHelper<T>();
  
  return columnDefinitions.map((definition) => {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return columnHelper.accessor(definition.accessor as any, {
      header: definition.header,
      cell: definition.cell || (info => info.getValue()),
    });
  });
}

/**
 * Creates a custom formatter for cell display
 * @param formatter Function to format the value
 * @returns Formatted cell content
 */
export function createCellFormatter<T>(formatter: (value: T) => React.ReactNode) {
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return (info: any) => formatter(info.getValue());
}
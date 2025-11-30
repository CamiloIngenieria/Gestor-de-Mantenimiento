import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  actions?: ReactNode;
}

export const DataTable = ({
  columns,
  data,
  emptyMessage = "No hay registros para visualizar",
  actions,
}: DataTableProps) => {
  return (
    <div className="rounded-lg border border-border bg-card">
      {actions && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {actions}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/50",
                    index === data.length - 1 && "border-b-0"
                  )}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-foreground">
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

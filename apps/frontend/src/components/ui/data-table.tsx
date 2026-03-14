'use client';

type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
};

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = 'Nenhum registro encontrado.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-left font-medium text-slate-600 ${column.className ?? ''}`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={String(row.id ?? index)} className="border-t border-slate-100">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-4 py-3 text-slate-700 ${column.className ?? ''}`}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as any)[column.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

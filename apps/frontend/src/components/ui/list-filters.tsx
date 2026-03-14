'use client';

type ListFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { label: string; value: string }[];
};

export function ListFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions = [],
}: ListFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar..."
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
        />

        {onStatusChange ? (
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          >
            <option value="">Todos os status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
